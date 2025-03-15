import expressAsyncHandler from 'express-async-handler';
import { IRequest } from '../types';
import { Response } from 'express';
import { createDriverSchema, editDriverSchema } from '../utils/validations';
import prisma from '../lib/prisma';
import bcrypt from 'bcrypt';

// @POST - private - /api/drivers
export const createDriver = expressAsyncHandler(async (req: IRequest, res: Response) => {
  const { email, password, ...rest } = createDriverSchema.parse(req.body);

  const driverWithSameEmail = await prisma.driver.findFirst({ where: { email, isArchived: false } });

  if (driverWithSameEmail) {
    res.status(403);
    throw new Error('Email already in use');
  }

  const newDriver = await prisma.driver.create({
    data: {
      email,
      password: await bcrypt.hash(password, 10),
      ...rest,
    },
    select: {
      id: true,
      email: true,
      name: true,
      number: true,
      car: true,
    },
  });

  res.status(201).json({
    success: true,
    data: { ...newDriver, car: null },
    message: 'Driver successfully created',
    statusCode: 201,
  });
});

// @GET - private - /api/drivers
export const getDrivers = expressAsyncHandler(async (req: IRequest, res: Response) => {
  const drivers = await prisma.driver.findMany({
    where: { isArchived: false },
    select: {
      id: true,
      email: true,
      name: true,
      number: true,
      car: {
        select: {
          id: true,
          model: true,
          plateNumber: true,
          codingDay: true,
          colorTag: {
            select: {
              label: true,
            },
          },
        },
      },
    },
  });

  res.status(200).json({
    success: true,
    data: {
      drivers,
      count: drivers.length,
    },
    message: 'Ok',
    statusCode: 200,
  });
});

// @PATCH - private - /api/drivers/:driverId
export const editDriver = expressAsyncHandler(async (req: IRequest, res: Response) => {
  const { email, ...rest } = editDriverSchema.parse(req.body);
  const driverId = req.params.driverId;

  const driverToUpdate = await prisma.driver.findFirst({ where: { id: driverId, isArchived: false } });

  if (!driverToUpdate) {
    res.status(403);
    throw new Error('The driver you are trying to update does not exist');
  }

  const driverWithSameEmail = await prisma.driver.findFirst({ where: { id: { not: driverId }, email } });

  if (driverWithSameEmail) {
    res.status(403);
    throw new Error('Email address already in use');
  }

  const updatedDriver = await prisma.driver.update({
    where: { id: driverId },
    data: { email, ...rest },
    select: {
      id: true,
      email: true,
      name: true,
      number: true,
      car: {
        select: {
          id: true,
          model: true,
          plateNumber: true,
          codingDay: true,
          colorTag: {
            select: {
              label: true,
            },
          },
        },
      },
    },
  });

  res.status(200).json({
    success: true,
    data: updatedDriver,
    message: 'Driver successfully updated',
    statusCode: 200,
  });
});

// @DELETE - private - /api/drivers/:driverId
export const deleteDriver = expressAsyncHandler(async (req: IRequest, res: Response) => {
  const driverId = req.params.driverId;

  const driverToDelete = await prisma.driver.findFirst({ where: { id: driverId, isArchived: false } });

  if (!driverToDelete) {
    res.status(403);
    throw new Error('The driver you are trying to delete does not exist');
  }

  await prisma.driver.update({ where: { id: driverId, isArchived: false }, data: { isArchived: true } });

  res.status(200).json({ success: true, data: { id: driverId }, message: 'Driver successfully deleted', statusCode: 200 });
});
