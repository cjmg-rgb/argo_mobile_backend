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
        email: "hr.primecorp@gmail.com",
        name: "HR PRIME CORP",
        role: "admin",
        password: bcrypt.hashSync("hr.prime2025***", 10),
        departmentId: "6c6c0f99-f5ff-4d8b-8418-eaba8b495ae1",
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

export const generateAccessToken = (
  userId: string
) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET as string, {
    expiresIn: "60d",
  });

  return token;
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
