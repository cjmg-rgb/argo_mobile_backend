import expressAsyncHandler from 'express-async-handler';
import { Response, Request } from 'express';
import prisma from '../lib/prisma';

// @GET - private - /api/colors
export const getColors = expressAsyncHandler(async (req: Request, res: Response) => {
  const colors = await prisma.colorTag.findMany({
    where: { isUsed: false, isArchived: false },
    select: {
      id: true,
      label: true,
    },
  });

  res.status(200).json({
    success: true,
    data: {
      colors,
      count: colors.length,
    },
    statusCode: 200,
    message: 'Ok',
  });
});
