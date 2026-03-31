import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export type JwtPayload = {
  userId: string;
  role: string | null;
  walletAddress: string;
};

const DEV_JWT_SECRET = "godxzorin";

export const getJwtSecret = () => process.env.JWT_SECRET || DEV_JWT_SECRET;

export const readAuthToken = (req: Request): JwtPayload | null => {
  const token = req.cookies?.token as string | undefined;
  if (!token) {
    return null;
  }

  try {
    return jwt.verify(token, getJwtSecret()) as JwtPayload;
  } catch {
    return null;
  }
};

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const decoded = readAuthToken(req);

  if (!decoded) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  res.locals.auth = decoded;
  return next();
};
