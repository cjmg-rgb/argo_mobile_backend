import expressAsyncHandler from "express-async-handler";
import { Request, Response } from "express";
import { loginSchema } from "../utils/validations";
import prisma from "../lib/prisma";
import bcrypt from "bcrypt";
import { generateAccessTokenAndSetCookie } from "../utils/helpers";
import { IRequest } from "../types";

// @POST - public - /api/auth/login
export const login = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findFirst({
      where: { email, isArchived: false },
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
      res.status(401);
      throw new Error("Invalid email address or password");
    }

    const { password: userSavedPassword, ...rest } = user;

    const isPasswordCorrect = await bcrypt.compare(password, userSavedPassword);

    if (!isPasswordCorrect) {
      res.status(401);
      throw new Error("Invalid email address or password");
    }

    generateAccessTokenAndSetCookie(user.id, res);

    res.status(200).json({
      success: true,
      data: rest,
      message: "Login success",
      statusCode: 200,
    });
  }
);

// @POST - public - /api/auth/logout
export const logout = (req: IRequest, res: Response) => {
  res
    .clearCookie("argo-access-token")
    .status(200)
    .json({
      success: true,
      data: {
        success: true,
      },
      message: "Logged out successfully",
      statusCode: 200,
    });
};
