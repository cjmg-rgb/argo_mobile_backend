import expressAsyncHandler from 'express-async-handler';
import prisma from '../lib/prisma';
import { IRequest } from '../types';
import { Response } from 'express';

// @GET - private - /api/departments
export const getDepartments = expressAsyncHandler(async (req: IRequest, res: Response) => {
  const departments = await prisma.department.findMany({
    where: {
      isArchived: false,
    },
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      id: true,
      name: true,
    },
  });

  res.status(200).json({
    success: true,
    data: {
      departments,
      count: departments.length,
    },
    message: 'Ok',
    statusCode: 200,
  });
});
