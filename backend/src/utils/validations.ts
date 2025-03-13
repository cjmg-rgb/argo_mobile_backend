import { z } from 'zod';

// auth
export const loginSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(1, { message: 'Field "password" is required.' }),
  })
  .strict();

// cars
export const createCarSchema = z
  .object({
    model: z.string().min(1, { message: 'Field "model" is required.' }),
    plateNumber: z.string().min(1, { message: 'Field "plateNumber" is required.' }),
    driverId: z.string().uuid({ message: 'Invalid ID' }).optional(),
    colorTagId: z.string().min(1, { message: 'Field "colorTagId" is required.' }).uuid({ message: 'Invalid ID' }),
    codingDay: z.number().min(0).max(6),
  })
  .strict();

export const editCarSchema = createCarSchema.omit({ colorTagId: true });

// users
export const createUserSchema = z
  .object({
    email: z.string().email({ message: 'Invalid email address' }),
    name: z.string().min(1, { message: 'Field "name" is required' }),
    password: z.string().min(8, { message: 'Password must be atleast 8 characters' }),
    departmentId: z.string().min(1, { message: 'Field "department is required"' }).uuid({ message: 'Invalid ID' }),
    role: z.enum(['admin', 'user']),
  })
  .strict();

export const editUserSchema = createUserSchema
  .omit({ email: true, password: true })
  .extend({
    credits: z.number().min(0),
  })
  .strict();

export const changePasswordSchema = z.object({ password: z.string().min(8, { message: 'Password must be atleast 8 characters' }) });

// bookings
export const createBookingSchema = z
  .object({
    title: z.string().min(1, { message: 'Field "title" is required' }),
    location: z.string().min(1, { message: 'Field "location" is required' }),
    date: z
      .string()
      .min(1, { message: 'Field "date" is required' })
      .refine(
        (data) => {
          const bookingDate = new Date(data);
          return !isNaN(bookingDate.getTime());
        },
        {
          message: 'Invalid date',
        }
      ),
    pickUpTimeHour: z.number().min(0),
    dropOffTimeHour: z.number().min(0).max(23),
    instruction: z.string().min(1, { message: 'Field "instruction" is required' }),
    carId: z.string().min(1, { message: 'Field "carId" is required' }),
  })
  .strict()
  .refine((data) => data.pickUpTimeHour < data.dropOffTimeHour, {
    message: 'Field "dropOffTimeHour" must be greater than "pickUpTimeHour"',
    path: ['dropOffTime'],
  });

export const editBookingSchema = z
  .object({
    title: z.string().min(1, { message: 'Field "title" is required' }),
    location: z.string().min(1, { message: 'Field "location" is required' }),
    date: z
      .string()
      .min(1, { message: 'Field "date" is required' })
      .refine(
        (data) => {
          const bookingDate = new Date(data);
          return !isNaN(bookingDate.getTime());
        },
        {
          message: 'Invalid date',
        }
      ),
    pickUpTimeHour: z.number().min(0),
    dropOffTimeHour: z.number().min(0),
    instruction: z.string().min(1, { message: 'Field "instruction" is required' }),
    carId: z.string().min(1, { message: 'Field "carId" is required' }),
  })
  .strict()
  .refine((data) => data.pickUpTimeHour < data.dropOffTimeHour, {
    message: 'Field "dropOffTime" must be greater than "pickUpTime."',
    path: ['dropOffTime'],
  });

// driver
export const createDriverSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  name: z.string().min(1, { message: 'Field "name" is required' }),
  number: z.string().min(1, { message: 'Field "number" is required' }),
  password: z.string().min(8, { message: 'Password must be atleast 8 characters' }),
});

export const editDriverSchema = createDriverSchema.omit({ password: true });
