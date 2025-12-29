import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

export const requestLoggerMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  req.log = logger.child({
    requestId: req.requestId,
    method: req.method,
    path: req.originalUrl,
  });

  next();
};
