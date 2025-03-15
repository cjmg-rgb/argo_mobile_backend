import { IRequest } from '../types';
import { Response } from 'express';
import expressAsyncHandler from 'express-async-handler';
import { createBookingSchema, editBookingSchema } from '../utils/validations';
import prisma from '../lib/prisma';
import { Prisma, car as M_Car, department as M_Department } from '@prisma/client';
import moment from 'moment';
import { getFirstAndLastDateOfMonth } from '../utils/helpers';

// @POST - private - /api/bookings
export const createBooking = expressAsyncHandler(async (req: IRequest, res: Response) => {
  const { carId, date, dropOffTimeHour, pickUpTimeHour, ...rest } = createBookingSchema.parse(req.body);

  const pickUpTimeHourObj = new Date(date);
  const dropOffTimeHourObj = new Date(date);

  pickUpTimeHourObj.setHours(pickUpTimeHour);
  dropOffTimeHourObj.setHours(dropOffTimeHour);

  if (pickUpTimeHourObj.getTime() < Date.now()) {
    res.status(403);
    throw new Error('Unable to book for a past date and time');
  }

  const bookedBy = req.user;

  const creditDeduction = dropOffTimeHourObj.getHours() - pickUpTimeHourObj.getHours();

  if (bookedBy!.credits - creditDeduction < 0) {
    res.status(403);
    throw new Error('Insufficient credit');
  }

  const carTooBook = await prisma.car.findFirst({ where: { id: carId, isArchived: false }, include: { driver: true } });

  if (!carTooBook) {
    res.status(403);
    throw new Error('The car you are trying to book does not exist');
  }

  if (!carTooBook.driver) {
    res.status(403);
    throw new Error('The car you are trying to book does not have a driver');
  }

  const collidedBookings = await prisma.booking.findMany({
    where: {
      carId,
      date: new Date(date),
      AND: [{ pickUpTime: { lt: dropOffTimeHourObj } }, { dropOffTime: { gt: pickUpTimeHourObj } }],
      isArchived: false,
    },
  });

  if (collidedBookings.length) {
    res.status(403);
    throw new Error('Car is already occupied by another booking on your selected time or date');
  }

  const [_, newBooking] = await prisma.$transaction([
    prisma.user.update({ where: { id: bookedBy!.id }, data: { credits: { decrement: creditDeduction } } }),
    prisma.booking.create({
      data: {
        ...rest,
        date: new Date(date),
        carId,
        pickUpTime: pickUpTimeHourObj,
        dropOffTime: dropOffTimeHourObj,
        creditDeduction,
        bookedById: bookedBy!.id,
      },
      select: {
        id: true,
        title: true,
        location: true,
        date: true,
        pickUpTime: true,
        dropOffTime: true,
        instruction: true,
        creditDeduction: true,
        car: {
          select: {
            id: true,
            model: true,
            plateNumber: true,
            driver: {
              select: {
                id: true,
                email: true,
                name: true,
                number: true,
              },
            },
            codingDay: true,
            colorTag: {
              select: {
                label: true,
              },
            },
          },
        },
        bookedBy: {
          select: {
            id: true,
            email: true,
            password: true,
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
        },
      },
    }),
  ]);

  res.status(201).json({
    success: true,
    data: newBooking,
    message: 'Booking successfully added',
    statusCode: 201,
  });
});

// @GET - private - /api/bookings
export const getAllBookings = expressAsyncHandler(async (req: IRequest, res: Response) => {
  const bookings = await prisma.booking.findMany({
    where: { isArchived: false },
    orderBy: {
      pickUpTime: 'asc',
    },
    select: {
      id: true,
      title: true,
      location: true,
      date: true,
      pickUpTime: true,
      dropOffTime: true,
      instruction: true,
      creditDeduction: true,
      editAttempts: true,
      car: {
        select: {
          id: true,
          model: true,
          plateNumber: true,
          driver: {
            select: {
              id: true,
              email: true,
              name: true,
              number: true,
            },
          },
          codingDay: true,
          colorTag: {
            select: {
              label: true,
            },
          },
        },
      },
      bookedBy: {
        select: {
          id: true,
          email: true,
          password: true,
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
      },
    },
  });

  res.status(200).json({
    success: true,
    data: {
      bookings,
      count: bookings.length,
    },
    message: 'Ok',
    statusCode: 200,
  });
});

// GET - private - /api/bookings/my-bookings
export const getCurrentUserBookings = expressAsyncHandler(async (req: IRequest, res: Response) => {
  const currentUserId = req.user!.id;

  const bookings = await prisma.booking.findMany({
    where: { bookedById: currentUserId, dropOffTime: { gt: new Date() }, isArchived: false },
    orderBy: {
      date: 'desc',
    },
    select: {
      id: true,
      title: true,
      location: true,
      date: true,
      pickUpTime: true,
      dropOffTime: true,
      instruction: true,
      creditDeduction: true,
      editAttempts: true,
      car: {
        select: {
          id: true,
          model: true,
          plateNumber: true,
          codingDay: true,
          driver: {
            select: {
              id: true,
              email: true,
              name: true,
              number: true,
            },
          },
          colorTag: {
            select: {
              label: true,
            },
          },
        },
      },
      bookedBy: {
        select: {
          id: true,
          email: true,
          password: true,
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
      },
    },
  });

  res.status(200).json({
    success: true,
    data: {
      bookings,
      count: bookings.length,
    },
    message: 'Ok',
    statusCode: 200,
  });
});

// @GET - private - /api/bookings/reports?month=?&year=?
export const getBookingReports = expressAsyncHandler(async (req: IRequest, res: Response) => {
  let { month, year } = req.query;

  const parsedMonth = parseInt(month as string);
  const parsedYear = parseInt(year as string);

  const { firstDate, lastDate } = getFirstAndLastDateOfMonth(parsedMonth, parsedYear);

  const [bookingsWithinTheMonth, departments, cars] = await prisma.$transaction([
    prisma.booking.findMany({
      where: { isArchived: false, AND: [{ date: { gte: firstDate } }, { date: { lte: lastDate } }] },
      orderBy: { date: 'asc' },
      select: {
        id: true,
        title: true,
        location: true,
        date: true,
        pickUpTime: true,
        dropOffTime: true,
        instruction: true,
        creditDeduction: true,
        editAttempts: true,
        car: {
          select: {
            id: true,
            model: true,
            plateNumber: true,
            codingDay: true,
            driver: {
              select: {
                id: true,
                email: true,
                name: true,
                number: true,
              },
            },
            colorTag: {
              select: {
                label: true,
              },
            },
          },
        },
        bookedBy: {
          select: {
            id: true,
            email: true,
            password: true,
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
        },
      },
    }),
    prisma.department.findMany({ where: { isArchived: false } }),
    prisma.car.findMany({
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
          },
        },
      },
    }),
  ]);

  type DepartmentWithRenderedHrs = M_Department & {
    hoursRendered: number;
  };

  type CarReport = M_Car & {
    hoursRenderedPerDept: DepartmentWithRenderedHrs[];
    totalRenderedHours: number;
  };

  type DepartmentWithReport = M_Department & {
    totalRenderedHours: number;
  };

  const carReports: CarReport[] = [];
  const departmentReports: DepartmentWithReport[] = [];

  cars.forEach((car) => {
    const hoursRenderedPerDept: DepartmentWithRenderedHrs[] = [];

    departments.forEach((department) => {
      const bookingsInDept = bookingsWithinTheMonth.filter((booking) => booking.bookedBy.department.id === department.id && booking.car.id === car.id);
      const totalRenderedHours = bookingsInDept.reduce((hours, { creditDeduction }) => hours + creditDeduction, 0);
      hoursRenderedPerDept.push({ ...department, hoursRendered: totalRenderedHours });
    });

    carReports.push({ ...car, hoursRenderedPerDept } as any);
  });

  departments.forEach((department) => {
    const bookingsInDepartment = bookingsWithinTheMonth.filter((booking) => booking.bookedBy.department.id === department.id);

    const totalRenderedHours = bookingsInDepartment.reduce((hours, booking) => booking.creditDeduction + hours, 0);
    departmentReports.push({ ...department, totalRenderedHours });
  });

  res.status(200).json({
    success: true,
    data: {
      carReports,
      departmentReports,
    },
    message: 'Ok',
    statusCode: 200,
  });
});

// @PATCH - private - /api/bookings/:bookingId
export const editBooking = expressAsyncHandler(async (req: IRequest, res: Response) => {
  const { carId, date, pickUpTimeHour, dropOffTimeHour, ...rest } = editBookingSchema.parse(req.body);
  const bookingToUpdateId = req.params.bookingId;

  const bookingToUpdate = await prisma.booking.findFirst({ where: { id: bookingToUpdateId, isArchived: false } });

  if (!bookingToUpdate) {
    res.status(403);
    throw new Error('The booking you are trying to update does not exist');
  }

  if (bookingToUpdate.bookedById !== req.user?.id) {
    res.status(403);
    throw new Error('Booking does not match to current user ID');
  }

  if (bookingToUpdate.editAttempts) {
    res.status(403);
    throw new Error('You have reached the maximum booking edits');
  }

  let queryFilter: Prisma.bookingFindManyArgs;

  const newBookingDate = new Date(date);
  const pickUpTimeObject = new Date(date);
  const dropOffTimeObject = new Date(date);

  pickUpTimeObject.setHours(pickUpTimeHour);
  dropOffTimeObject.setHours(dropOffTimeHour);

  if (carId !== bookingToUpdate.carId || newBookingDate.getTime() !== bookingToUpdate.date.getTime()) {
    queryFilter = {
      where: {
        carId,
        date: newBookingDate,
        AND: [{ pickUpTime: { lt: dropOffTimeObject } }, { dropOffTime: { gt: pickUpTimeObject } }],
        isArchived: false,
      },
    };
  } else {
    queryFilter = {
      where: {
        id: { not: bookingToUpdate.id },
        carId,
        date: newBookingDate,
        AND: [{ pickUpTime: { lt: dropOffTimeObject } }, { dropOffTime: { gt: pickUpTimeObject } }],
        isArchived: false,
      },
    };
  }
  const collidedBookings = await prisma.booking.findMany(queryFilter);

  if (collidedBookings.length) {
    res.status(403);
    throw new Error('Forbidden: The car is already occupied by another booking for your selected time or date');
  }

  const newCreditDeduction = dropOffTimeObject.getHours() - pickUpTimeObject.getHours();
  const currentUser = req.user as NonNullable<IRequest['user']>;
  currentUser.credits = currentUser.credits + bookingToUpdate.creditDeduction;

  if (currentUser.credits - newCreditDeduction < 0) {
    res.status(403);
    throw new Error('Forbidden: Insufficient credits');
  }

  currentUser.credits = currentUser.credits - newCreditDeduction;

  const [updatedBooking] = await prisma.$transaction([
    prisma.booking.update({
      where: { id: bookingToUpdate.id },
      data: {
        ...rest,
        carId,
        date: newBookingDate,
        pickUpTime: pickUpTimeObject,
        dropOffTime: dropOffTimeObject,
        creditDeduction: newCreditDeduction,
        editAttempts: { increment: 1 },
      },
      select: {
        id: true,
        title: true,
        location: true,
        date: true,
        pickUpTime: true,
        dropOffTime: true,
        instruction: true,
        creditDeduction: true,
        editAttempts: true,
        car: {
          select: {
            id: true,
            model: true,
            plateNumber: true,
            codingDay: true,
            driver: {
              select: {
                id: true,
                email: true,
                name: true,
                number: true,
              },
            },
            colorTag: {
              select: {
                label: true,
              },
            },
          },
        },
        bookedBy: {
          select: {
            id: true,
            email: true,
            password: true,
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
        },
      },
    }),
    prisma.user.update({ where: { id: currentUser.id }, data: { credits: currentUser.credits } }),
  ]);

  res.status(200).json({ success: true, data: updatedBooking, message: 'Booking successfully updated', statusCode: 200 });
});

// @DELETE - private - /api/bookings/:bookingId
export const deleteBooking = expressAsyncHandler(async (req: IRequest, res: Response) => {
  const bookingId = req.params.bookingId;
  const bookingToDelete = await prisma.booking.findFirst({ where: { id: bookingId, isArchived: false } });
  const currentUserId = req.user?.id;

  if (!bookingToDelete) {
    res.status(403);
    throw new Error('Forbidden: The booking you are trying to delete does not exist');
  }

  if (bookingToDelete.bookedById !== currentUserId) {
    res.status(403);
    throw new Error('Forbidden: You do not have permission to access this booking as you are not the author');
  }

  if (moment().isSameOrAfter(bookingToDelete.date)) {
    res.status(403);
    throw new Error('Forbidden: Unable to delete booking because the booking date is ongoing');
  }

  await prisma.$transaction([
    prisma.booking.update({ where: { id: bookingId, isArchived: false }, data: { isArchived: true } }),
    prisma.user.update({ where: { id: bookingToDelete.bookedById }, data: { credits: { increment: bookingToDelete.creditDeduction } } }),
  ]);

  res.status(200).json({
    success: true,
    data: { id: bookingId },
    message: 'Booking successfully deleted',
    statusCode: 200,
  });
});
