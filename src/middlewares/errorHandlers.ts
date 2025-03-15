import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { fromZodError } from 'zod-validation-error';
import dotenv from 'dotenv';

dotenv.config();

const APP_ENV = process.env.APP_ENV;

export const notFound = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Resource not found',
    statusCode: 404,
  });
};

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  let statusCode = res.statusCode === 200 ? 500 : req instanceof ZodError ? 400 : res.statusCode;

  let errorMessage = APP_ENV === 'PROD' ? (err as Error).message : (err as Error).stack;

  if (err instanceof ZodError) {
    statusCode = 400;
    errorMessage = fromZodError(err).toString();
  }

  if (err instanceof JsonWebTokenError) {
    res.clearCookie('gaps-access-token');
    statusCode = 401;
    errorMessage = `Jwt Token Error: ${APP_ENV === 'PROD' ? err.message : err.stack}`;
  }

  if (err instanceof TokenExpiredError) {
    res.clearCookie('gaps-access-token');
    statusCode = 401;
    errorMessage = `Jwt Token Expired Error: ${APP_ENV === 'PROD' ? err.message : err.stack}`;
  }

  console.error(errorMessage);

  res.status(statusCode).json({
    success: false,
    message: errorMessage,
    statusCode,
  });
};
