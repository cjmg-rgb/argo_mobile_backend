import { NextFunction, Response } from 'express';
import { IRequest } from '../types';
import expressAsyncHandler from 'express-async-handler';
import { IAccessTokenPayload } from '../types';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';

type Roles = 'admin' | 'user';

export const protectRoute = (roles: Roles[]) => {
  return expressAsyncHandler(async (req: IRequest, res: Response, next: NextFunction) => {
    if (req.cookies['argo-access-token']) {
      const accessToken = req.cookies['argo-access-token'];
      const { userId } = jwt.verify(accessToken, process.env.JWT_SECRET as string) as IAccessTokenPayload;

      const user = await prisma.user.findUnique({
        where: { id: userId, isArchived: false },
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
      });

      if (!user) {
        res.clearCookie('argo-access-token').status(401);
        throw new Error('Unauthorized user');
      }

      if (!roles.includes(user.role)) {
        res.clearCookie('argo-access-token').status(401);
        throw new Error('Unauthorized role');
      }

      req.user = user;
      next();
    } else {
      res.status(401);
      throw new Error('Access token is missing');
    }
  });
};

// export const protectAdmin = expressAsyncHandler(async (req: IRequest, res: Response, next: NextFunction) => {
//   if (req.cookies['argo-access-token']) {
//     const accessToken = req.cookies['argo-access-token'];
//     const { userId } = jwt.verify(accessToken, process.env.JWT_SECRET as string) as IAccessTokenPayload;

//     const user = await prisma.user.findUnique({
//       where: { id: userId, accessType: 'admin', isArchived: false },
//       select: {
//         id: true,
//         email: true,
//         password: true,
//         name: true,
//         credit: true,
//         department: {
//           select: {
//             id: true,
//             name: true,
//           },
//         },
//         accessType: true,
//       },
//     });

//     if (!user) {
//       res.clearCookie('argo-access-token').status(401);
//       throw new Error('Unauthorized user');
//     }

//     req.user = user;
//     next();
//   } else {
//     res.status(401);
//     throw new Error('Access token is missing');
//   }
// });

// export const protect = expressAsyncHandler(async (req: IRequest, res: Response, next: NextFunction) => {
//   if (req.cookies['argo-access-token']) {
//     const accessToken = req.cookies['argo-access-token'];
//     const { userId } = jwt.verify(accessToken, process.env.JWT_SECRET as string) as IAccessTokenPayload;

//     const user = await prisma.user.findUnique({
//       where: { id: userId, isArchived: false },
//       select: {
//         id: true,
//         email: true,
//         password: true,
//         name: true,
//         credit: true,
//         department: {
//           select: {
//             id: true,
//             name: true,
//           },
//         },
//         accessType: true,
//       },
//     });

//     if (!user) {
//       res.clearCookie('argo-access-token').status(401);
//       throw new Error('Unauthorized user');
//     }

//     req.user = user;
//     next();
//   } else {
//     res.status(401);
//     throw new Error('Access token is missing');
//   }
// });
