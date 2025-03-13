import prisma from "../lib/prisma";
import dotenv from "dotenv";
import { Response } from "express";
import jwt from "jsonwebtoken";
import { Request } from "express";
import moment from "moment";
import bcrypt from "bcrypt";

dotenv.config();

const APP_ENV = process.env.APP_ENV;

export const createDepartments = async () => {
  try {
    const departments = [
      { name: "LR ( Landlord Representation Team)" },
      { name: "CRD (Commercial Retail/Industrial Department)" },
      { name: "VisMin Department" },
      { name: "CPI (Commercial Property Investment)" },
      { name: "Marketing Department" },
      { name: "Information Technology Department" },
      { name: "Research and Advisory Department" },
      { name: "Finance and Admin Department" },
      { name: "HR Department" },
      { name: "COD (Corporate Office Department)" },
      { name: "GW (GreatWork)" },
      { name: "OPS (Operations Department)" },
    ];
    const createdDepartments = await prisma.department.createMany({
      data: departments,
    });
    console.log(createdDepartments);
  } catch (error) {
    console.log(error);
  }
};

export const createUser = async () => {
  try {
    const newUser = await prisma.user.create({
      data: {
        email: "it.primecorp@gmail.com",
        name: "IT PRIME CORP",
        role: "admin",
        password: bcrypt.hashSync("it.prime2025***", 10),
        departmentId: "4d6fd3a1-a623-4f5d-9963-f57f667896c6",
      },
    });
    console.log(newUser);
  } catch (error) {
    console.error(error);
  }
};

export const createTagColors = async () => {
  try {
    const hexColors = [
      { label: "#87A2FF" },
      { label: "#A5B68D" },
      { label: "#987D9A" },
      { label: "#B3A398" },
      { label: "#FF6969" },
      { label: "#DFA67B" },
      { label: "#A7727D" },
      { label: "#E3C770" },
    ];
    const colors = await prisma.colorTag.createMany({ data: hexColors });
    console.log(colors);
  } catch (error) {
    console.error(error);
  }
};

export const generateAccessTokenAndSetCookie = (
  userId: string,
  res: Response
) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET as string, {
    expiresIn: "60d",
  });

  res.cookie("argo-access-token", token, {
    path: "/",
    httpOnly: true,
    maxAge: 60_000 * 60 * 24 * 60,
    secure: APP_ENV === "PROD",
    sameSite: APP_ENV === "PROD" ? "none" : "lax",
  });
};

export const getPaginationDataAndParse = (req: Request) => {
  const { page, limit } = req.query as { page: string; limit: string };
  const parsedPage =
    !page || isNaN(parseInt(page)) || parseInt(page) <= 0 ? 1 : parseInt(page);
  const parsedLimit =
    !limit ||
    isNaN(parseInt(limit)) ||
    parseInt(limit) <= 0 ||
    parseInt(limit) > 30
      ? 10
      : parseInt(limit);

  return { page: parsedPage, limit: parsedLimit };
};

export const getFirstAndLastDateOfMonth = (month: number, year: number) => {
  const firstDate = moment({ year, month: month - 1, day: 1 }).startOf("day");
  const lastDate = moment({ year, month: month - 1, day: 1 }).endOf("month");

  return {
    firstDate: new Date(firstDate.format("YYYY-MM-DD")),
    lastDate: new Date(lastDate.format("YYYY-MM-DD")),
  };
};
