import { Request, Response, NextFunction } from "express";

export const loggerMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const start = Date.now();

  res.on("finish", () => {

    console.log(`
==============================
Time: ${new Date().toISOString()}
Method: ${req.method}
URL: ${req.originalUrl}
Status: ${res.statusCode}
==============================
    `);
  });

  next();
};
