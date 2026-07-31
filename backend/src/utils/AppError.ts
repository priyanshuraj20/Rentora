//handles Operatinal errors
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean; // true = expected error (bad input, not found, etc.)

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    // Keeps the stack trace clean — points to where AppError was thrown,
    // not to this constructor line.
    Error.captureStackTrace(this, this.constructor);
  }
}
