//automatic try-catch  wrapper:

import { Request, Response, NextFunction } from "express";

type AsyncFn = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<any>;

// If the async controller throws OR rejects, `.catch(next)` forwards
// the error to Express's error-handling middleware automatically.
export const catchAsync =
  //AysncFn:Maine strict typing rakhi taaki controller function ka shape compile-time pe hi check ho jaye
  (fn: AsyncFn) => (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);