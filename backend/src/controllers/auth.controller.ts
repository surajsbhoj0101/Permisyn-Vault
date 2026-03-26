import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import redis from "../config/redis";
import { prisma } from "../config/db";
import { generateNonce, SiweMessage } from "siwe";

type JwtPayload = {
  userId: string;
  role: string | null;
  walletAddress: string;
};

const DEV_JWT_SECRET = "godxzorin";

const getJwtSecret = () => process.env.JWT_SECRET || DEV_JWT_SECRET;

const signToken = (payload: JwtPayload) => {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: "7d" });
};

const setAuthCookie = (res: Response, token: string) => {
  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

const readAuthToken = (req: Request) => {
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

export const checkAuth = (req: Request, res: Response) => {
  const decoded = readAuthToken(req);

  if (!decoded) {
    return res.status(200).json({
      isAuthorized: false,
      role: null,
      userId: null,
    });
  }

  return res.status(200).json({
    isAuthorized: true,
    role: decoded.role,
    userId: decoded.userId,
  });
};

export const getNonce = async (_req: Request, res: Response) => {
  try {
    const nonce = generateNonce();
    await redis.set(`siwe-nonce:${nonce}`, "valid", "EX", 300);
    return res.status(200).json({ nonce });
  } catch (error) {
    console.error("getNonce error:", error);
    return res.status(500).json({ error: "Failed to generate nonce" });
  }
};

export const verifySiwe = async (req: Request, res: Response) => {
  const { message, signature } = req.body as {
    message?: string | Record<string, unknown>;
    signature?: string;
  };

  if (!message || !signature) {
    return res
      .status(400)
      .json({ error: "Message and signature are required" });
  }

  try {
    const siweMessage = new SiweMessage(message);
    const nonceKey = `siwe-nonce:${siweMessage.nonce}`;
    const storedNonce = await redis.get(nonceKey);

    if (!storedNonce) {
      return res.status(400).json({ error: "Invalid or expired nonce" });
    }

    const verifyResult = await siweMessage.verify({
      signature,
      nonce: siweMessage.nonce,
    });
    if (!verifyResult.success) {
      return res.status(401).json({ error: "Invalid signature" });
    }

    await redis.del(nonceKey);

    const walletAddress = siweMessage.address.toLowerCase();

    const user = await prisma.user.upsert({
      where: { walletAddress },
      update: {},
      create: {
        walletAddress,
      },
    });

    const token = signToken({
      userId: user.id,
      role: user.role,
      walletAddress: user.walletAddress,
    });

    setAuthCookie(res, token);

    return res.status(200).json({
      success: true,
      isAuthorized: true,
      userId: user.id,
      role: user.role,
    });
  } catch (error) {
    console.error("verifySiwe error:", error);
    return res.status(500).json({ error: "Failed to verify SIWE message" });
  }
};

export const setRoleSelection = async (req: Request, res: Response) => {
  const decoded = readAuthToken(req);
  if (!decoded) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { fullName, companyName, role } = req.body as {
    fullName?: string;
    companyName?: string;
    role?: string;
  };

  if (!fullName || !role) {
    return res.status(400).json({ error: "fullName and role are required" });
  }

  if (!["admin", "manager", "viewer"].includes(role)) {
    return res.status(400).json({ error: "Invalid role" });
  }

  const user = await prisma.user.update({
    where: { id: decoded.userId },
    data: {
      fullName,
      companyName: companyName || null,
      role,
    },
  });

  const token = signToken({
    userId: user.id,
    role: user.role,
    walletAddress: user.walletAddress,
  });
  setAuthCookie(res, token);

  return res.status(200).json({
    isAuthorized: true,
    role: user.role,
    userId: user.id,
  });
};
