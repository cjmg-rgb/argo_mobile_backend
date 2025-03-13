import expressAsyncHandler from 'express-async-handler';
import { createCarSchema, editCarSchema } from '../utils/validations';
import { IRequest } from '../types';
import { Response } from 'express';
import prisma from '../lib/prisma';

// @POST - private - /api/cars
export const createCar = expressAsyncHandler(async (req: IRequest, res: Response) => {
  const { colorTagId, driverId, ...rest } = createCarSchema.parse(req.body);

  if (driverId) {
    const driver = await prisma.driver.findFirst({ where: { id: driverId, isArchived: false }, include: { car: true } });

    if (!driver) {
      res.status(403);
      throw new Error('The selected driver does not exist');
    }

    if (driver.car) {
      res.status(403);
      throw new Error('The selected driver already assigned to another car');
    }
  }

  const colorTag = await prisma.colorTag.findFirst({ where: { id: colorTagId, isArchived: false } });

  if (!colorTag) {
    res.status(403);
    throw new Error('The selected colorTag does not exist');
  }

  if (colorTag.isUsed) {
    res.status(403);
    throw new Error('The selected color is already used');
  }

  const [newCar] = await prisma.$transaction([
    prisma.car.create({
      data: {
        colorTagId,
        driverId,
        ...rest,
      },
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
        driver: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    }),
    prisma.colorTag.update({ where: { id: colorTagId }, data: { isUsed: true } }),
  ]);

  res.status(201).json({
    success: true,
    data: newCar,
    message: 'Car successfully',
    statusCode: 201,
  });
});

// @GET - private - /api/cars
export const getCars = expressAsyncHandler(async (req: IRequest, res: Response) => {
  const cars = await prisma.car.findMany({
    where: { isArchived: false },
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
      driver: {
        select: {
          id: true,
          email: true,
          name: true,
          number: true,
        },
      },
    },
  });

  res.status(200).json({
    success: true,
    data: {
      cars: cars,
      count: cars.length,
    },
    message: 'Ok',
    statusCode: 200,
  });
});

// @PATCH - private - /api/cars/:carId
export const editCar = expressAsyncHandler(async (req: IRequest, res: Response) => {
  const carDetails = editCarSchema.parse(req.body);
  const carId = req.params.carId;

  const carToUpdate = await prisma.car.findFirst({ where: { id: carId, isArchived: false } });

  if (!carToUpdate) {
    res.status(200);
    throw new Error('The car you are trying to update does not exist');
  }

  const updatedCar = await prisma.car.update({
    where: { id: carId },
    data: carDetails,
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
      driver: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
  });

  res.status(200).json({
    success: true,
    data: updatedCar,
    message: 'Car successfully updated',
    statusCode: 200,
  });
});
