import { Request, Response, NextFunction } from "express";

export const validateDTO =
  (requiredFields: string[] = []) =>
  (req: Request, res: Response, next: NextFunction) => {
    const body = req.body;

    const errors: string[] = [];

    // 1. check required fields only
    for (const field of requiredFields) {
      if (
        body[field] === undefined ||
        body[field] === null ||
        body[field] === ""
      ) {
        errors.push(`${field} is required`);
      }
    }

    // 2. optional: check if body is object
    if (typeof body !== "object") {
      return res.status(400).json({
        message: "Invalid body",
      });
    }

    if (errors.length > 0) {
      return res.status(400).json({
        message: "Validation error",
        errors,
      });
    }

    next();
  };