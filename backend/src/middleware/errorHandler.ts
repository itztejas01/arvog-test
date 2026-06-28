import { Prisma } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { productPriceErrorMessage } from "../lib/productPrice";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  console.error(err);

  if (err.message.includes("Only")) {
    return res.status(400).json({ error: err.message });
  }

  if (err.name === "MulterError") {
    return res.status(400).json({ error: err.message });
  }

  if (
    err instanceof Prisma.PrismaClientKnownRequestError ||
    err instanceof Prisma.PrismaClientUnknownRequestError
  ) {
    if (err.message.includes("numeric field overflow")) {
      return res.status(400).json({ error: productPriceErrorMessage() });
    }
  }

  res.status(500).json({ error: "Internal server error" });
}
