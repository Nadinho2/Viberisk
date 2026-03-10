import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";

type HttpErrorLike = {
  status?: number;
  message?: string;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const notFound = (req: Request, res: Response, next: NextFunction) => {
  next(createHttpError(404, `Not Found - ${req.originalUrl}`));
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  const httpErr = err as HttpErrorLike;

  const status =
    typeof err === "object" && err && "status" in err
      ? (httpErr.status ?? 500)
      : 500;

  const message =
    typeof err === "object" && err && "message" in err
      ? httpErr.message ?? "Internal Server Error"
      : "Internal Server Error";

  res.status(status).json({
    message,
    status
  });
};

