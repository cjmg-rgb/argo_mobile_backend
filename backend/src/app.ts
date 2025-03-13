import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import cors from "cors";
import authRouter from "./routers/auth.router";
import colorRouter from "./routers/color.router";
import userRouter from "./routers/user.router";
import departmentRouter from "./routers/department.router";
import bookingRouter from "./routers/booking.router";
import carRouter from "./routers/car.router";
import driverRouter from "./routers/driver.router";
import { errorHandler, notFound } from "./middlewares/errorHandlers";

import { createServer } from "node:http";
import { Server } from "socket.io";

dotenv.config();

const APP_ENV = process.env.APP_ENV;
const port = process.env.PORT || 5001;
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_DEV_URL,
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE"],
  },
});

const clientUrl =
  APP_ENV === "PROD" ? process.env.CLIENT_URL : process.env.CLIENT_DEV_URL;

app.use(morgan(APP_ENV === "PROD" ? "tiny" : "dev"));
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: [clientUrl as string],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE"],
  })
);

app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/cars", carRouter);
app.use("/api/colors", colorRouter);
app.use("/api/departments", departmentRouter);
app.use("/api/drivers", driverRouter);

app.use(notFound);
app.use(errorHandler);

io.on("connection", (socket) => {
  socket.on("new-booking", (newBooking) => {
    socket.broadcast.emit("new-booking", newBooking);
  });

  socket.on("update-booking", (updatedBooking) => {
    socket.broadcast.emit("update-booking", updatedBooking);
  });

  socket.on("delete-booking", (deletedBooking) => {
    socket.broadcast.emit("delete-booking", deletedBooking);
  });
});

server.listen(port, () => {
  console.log(`server is listening on port ${port}`);
});
