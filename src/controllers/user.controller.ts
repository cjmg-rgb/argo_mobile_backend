import expressAsyncHandler from 'express-async-handler';
import { IRequest } from '../types';
import { Response } from 'express';
import { changePasswordSchema, createUserSchema, editUserSchema } from '../utils/validations';
import bcrypt from 'bcrypt';
import prisma from '../lib/prisma';
import { getPaginationDataAndParse } from '../utils/helpers';
import { Prisma } from '@prisma/client';

// @POST - private - /api/users
export const createUser = expressAsyncHandler(async (req: IRequest, res: Response) => {
  const { email, password, departmentId, ...rest } = createUserSchema.parse(req.body);

  const userWithSameEmail = await prisma.user.findFirst({ where: { email, isArchived: false } });

  if (userWithSameEmail) {
    res.status(403);
    throw new Error('Email already in use');
  }

  const department = await prisma.department.findFirst({ where: { id: departmentId, isArchived: false } });

  if (!department) {
    res.status(403);
    throw new Error('The selected department does not exist');
  }

  const newUser = await prisma.user.create({
    data: {
      email,
      password: await bcrypt.hash(password, 10),
      departmentId,
      ...rest,
    },
    select: {
      id: true,
      email: true,
      name: true,
      credits: true,
      department: {
        select: {
          id: true,
          name: true,
        },
      },
      role: true,
    },
  });

  res.status(201).json({
    success: true,
    data: newUser,
    message: 'User successfully created',
    statusCode: 201,
  });
});

// @GET - private - /api/users?keyword=?&department=?&page=?&limit=?
export const getUsers = expressAsyncHandler(async (req: IRequest, res: Response) => {
  const { page, limit } = getPaginationDataAndParse(req);
  const { keyword, department } = req.query as { keyword: string; department: string };

  let usersQueryFilter: Prisma.userFindManyArgs = {};

  const isDepartmentExist = await prisma.department.findFirst({ where: { id: department, isArchived: false } });

  if (isDepartmentExist && department) {
    usersQueryFilter = { where: { departmentId: department } };
  }

  if (keyword) {
    usersQueryFilter = { where: { ...usersQueryFilter.where, OR: [{ name: { contains: keyword } }, { email: { contains: keyword } }] } };
  }

  const users = await prisma.user.findMany({
    where: { ...usersQueryFilter.where, isArchived: false },
    take: limit,
    skip: (page - 1) * limit,
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      id: true,
      email: true,
      name: true,
      credits: true,
      department: {
        select: {
          id: true,
          name: true,
        },
      },
      role: true,
    },
  });

  const usersCount = await prisma.user.count({ where: { ...usersQueryFilter.where, isArchived: false } });
  const totalPages = Math.ceil(usersCount / limit);
  const hasNextPage = page < totalPages;
  const nextPage = hasNextPage ? page + 1 : null;

  res.status(200).json({
    success: true,
    data: {
      users,
      count: usersCount,
      totalPages,
      nextPage,
    },
    message: 'Ok',
    statusCode: 200,
  });
});

// @GET - private - /api/users/me
export const getCurrentUser = expressAsyncHandler(async (req: IRequest, res: Response) => {
  const currentUser = await prisma.user.findFirst({
    where: { id: req.user?.id, isArchived: false },
    select: {
      id: true,
      email: true,
      name: true,
      credits: true,
      department: {
        select: {
          id: true,
          name: true,
        },
      },
      role: true,
    },
  });

  res.status(200).json({
    success: true,
    data: currentUser,
    message: 'Ok',
    statusCode: 200,
  });
});

// @PATCH - private - /api/users/change-password
export const changePassword = expressAsyncHandler(async (req: IRequest, res: Response) => {
  const { password } = changePasswordSchema.parse(req.body);
  const userToUpdateId = req.user!.id;

  const hashedPassword = await bcrypt.hash(password, 10);
  await prisma.user.update({ where: { id: userToUpdateId }, data: { password: hashedPassword } });

  res.status(200).json({
    success: true,
    data: {
      success: true,
    },
    message: 'Password successfully changed',
    statusCode: 200,
  });
});

// @PATCH - private - /api/users/:userId
export const editUser = expressAsyncHandler(async (req: IRequest, res: Response) => {
  const { departmentId, ...rest } = editUserSchema.parse(req.body);
  const userId = req.params.userId;

  const department = await prisma.department.findFirst({ where: { id: departmentId, isArchived: false } });

  if (!department) {
    res.status(403);
    throw new Error('The selected department does not exist');
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId, isArchived: false },
    data: {
      departmentId,
      ...rest,
    },
    select: {
      id: true,
      email: true,
      name: true,
      credits: true,
      department: {
        select: {
          id: true,
          name: true,
        },
      },
      role: true,
    },
  });

  res.status(200).json({
    success: true,
    data: updatedUser,
    message: 'User successfully updated',
    statusCode: 200,
  });
});

// export const changePassword = ()
