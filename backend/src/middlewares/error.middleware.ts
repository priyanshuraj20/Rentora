import { Request, Response, NextFunction } from "express";
import { AppError } from "@utils/AppError";
import { env } from "@config/env";

//  Known error transformers
// Mongoose/JWT throw generic errors; we convert them into clean AppErrors.

const handleDuplicateKeyError = (err: any) => {
  const field = Object.keys(err.keyValue)[0];
  return new AppError(`${field} already exists`, 400);
};

const handleValidationError = (err: any) => {
  const messages = Object.values(err.errors).map((el: any) => el.message);
  return new AppError(messages.join(". "), 400);
};

const handleCastError = (err: any) =>
  new AppError(`Invalid ${err.path}: ${err.value}`, 400);

const handleJWTError = () =>
  new AppError("Invalid token. Please login again", 401);

const handleJWTExpiredError = () =>
  new AppError("Token expired. Please login again", 401);

export const globalErrorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

  //  DEVELOPMENT: full details, easier debugging 
  if (env.NODE_ENV === "development") {
    console.error("💥 ERROR:", err);
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      stack: err.stack,
    });
  }

  //  PRODUCTION: never leak internals
  let error = err;

  if (err.code === 11000) error = handleDuplicateKeyError(err);
  if (err.name === "ValidationError") error = handleValidationError(err);
  if (err.name === "CastError") error = handleCastError(err);
  if (err.name === "JsonWebTokenError") error = handleJWTError();
  if (err.name === "TokenExpiredError") error = handleJWTExpiredError();

  // Operational errors (things we threw on purpose) → safe to show message
  // Unknown/programming errors → generic message only
  const statusCode = error.isOperational ? error.statusCode : 500;
  const message = error.isOperational ? error.message : "Something went wrong";

  return res.status(statusCode).json({ success: false, message });
};
