import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { createErrorResponse } from "../helpers/createErrorResponse";
import { AuthUser } from "../types/jwt.types";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): Response | void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res
        .status(401)
        .json(createErrorResponse("No token provided", "NO_TOKEN"));
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json(createErrorResponse("Invalid token format", "INVALID_TOKEN"));
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as AuthUser;

    req.user = decoded;

    next();
  } catch {
    return res
      .status(401)
      .json(createErrorResponse("Unauthorized", "UNAUTHORIZED"));
  }
};