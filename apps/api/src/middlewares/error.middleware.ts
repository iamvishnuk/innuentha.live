import type { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";
import { AppError } from "../utils/error";

export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = "statusCode" in err ? (err.statusCode as number) : 500;
  const message = err.message || "Internal Server Error";

  logger.error(`API Error: [${statusCode}] ${message}`, err);

  res.status(statusCode).json({
    status: "error",
    statusCode,
    message,
    ...(process.env.NODE_ENV === "development" ? { stack: err.stack } : {}),
  });
};
