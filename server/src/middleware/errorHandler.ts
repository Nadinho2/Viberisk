import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";

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
  const status =
    typeof err === "object" && err && "status" in err
      ? // @ts-expect-error status coming from http-errors
        (err.status as number)
      : 500;

  const message =
    typeof err === "object" && err && "message" in err
      ? // @ts-expect-error message from Error
        (err.message as string)
      : "Internal Server Error";

  res.status(status).json({
    message,
    status
  });
};

