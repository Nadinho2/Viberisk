import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";

export const validate =
  (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params
    });

    if (!result.success) {
      res.status(400).json({
        message: "Validation failed",
        errors: result.error.flatten()
      });
      return;
    }

    // replace with parsed data for downstream handlers
    req.body = result.data.body;
    req.query = result.data.query;
    req.params = result.data.params;
    next();
  };

