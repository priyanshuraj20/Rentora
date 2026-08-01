import { Request, Response, NextFunction } from "express";
import { AppError } from "@utils/AppError";

/**
 * Reusable route-level authorization middleware to restrict access by user role.
 */
export const restrictTo = (...allowedRoles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.userRole || !allowedRoles.includes(req.userRole)) {
      return next(
        new AppError(
          "Forbidden: You do not have permission to perform this action",
          403,
        ),
      );
    }
    next();
  };
};
