import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import redis from "../config/redis";
import { prisma } from "../config/db";
import { generateNonce, SiweMessage } from "siwe";
import { Prisma, Role } from "@prisma/client";
import { sendMail } from "../services/sendMail";
import { requestOtpRateLimit } from "../middlewares/otpRequest.middleware";
import {
  getJwtSecret,
  readAuthToken,
  type JwtPayload,
} from "../middlewares/requireAuth";

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

const clearAuthCookie = (res: Response) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
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

export const logout = (_req: Request, res: Response) => {
  clearAuthCookie(res);
  return res.status(200).json({ success: true });
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

    const account = await prisma.account.upsert({
      where: { walletAddress },
      update: {},
      create: {
        walletAddress,
        role: Role.USER,
      },
    });

    console.log(
      "User authenticated with wallet:",
      walletAddress,
      "Account ID:",
      account.id,
    );

    const token = signToken({
      userId: account.id,
      role: account.role,
      walletAddress: account.walletAddress,
    });

    setAuthCookie(res, token);

    return res.status(200).json({
      success: true,
      isAuthorized: true,
      userId: account.id,
      role: account.role,
    });
  } catch (error) {
    console.error("verifySiwe error:", error);
    return res.status(500).json({ error: "Failed to verify SIWE message" });
  }
};

export const checkUsernameTaken = async (req: Request, res: Response) => {
  const username = req.params.username as string | undefined;
  const normalizedUsername = (username || "").trim();

  if (!normalizedUsername) {
    return res.status(400).json({ error: "Username is required" });
  }
  let existingUser: string | null;
  try {
    existingUser = await redis.get(`username:${normalizedUsername}`);
  } catch (error) {
    console.error("Redis error in checkUsernameTaken:", error);
    return res
      .status(500)
      .json({ error: "Failed to check username availability" });
  }

  if (existingUser) {
    return res.status(200).json({ isTaken: true });
  } else {
    return res.status(200).json({ isTaken: false });
  }
};

export const checkEmailTaken = async (req: Request, res: Response) => {
  const email = req.params.email as string | undefined;
  const normalizedEmail = (email || "").trim().toLowerCase();

  if (!normalizedEmail) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    const existingAccount = await prisma.account.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingAccount) {
      return res.status(200).json({ isTaken: true });
    } else {
      return res.status(200).json({ isTaken: false });
    }
  } catch (error) {
    console.error("checkEmailTaken error:", error);
    return res
      .status(500)
      .json({ error: "Failed to check email availability" });
  }
};

export const requestOtp = async (req: Request, res: Response) => {
  const decoded = res.locals.auth as JwtPayload;

  const { email } = req.body as { email?: string };
  const normalizedEmail = (email || "").trim().toLowerCase();

  if (!normalizedEmail) {
    return res.status(400).json({ error: "email is required" });
  }

  const isAllowed = await requestOtpRateLimit(normalizedEmail);
  if (!isAllowed) {
    return res
      .status(429)
      .json({ error: "Too many OTP requests. Please try again later." });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpKey = `otp:${decoded.userId}:${normalizedEmail}`;

  try {
    await redis.set(otpKey, otp, "EX", 300);
    await sendMail({
      to: normalizedEmail,
      subject: "Your OTP for Permisyn Vault",
      text: `Your OTP is: ${otp}`,
    });

    return res.status(200).json({ success: true, message: "OTP sent" });
  } catch (error) {
    console.error("requestOtp error:", error);
    return res.status(500).json({ error: "Failed to request OTP" });
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  const decoded = res.locals.auth as JwtPayload;

  const { email, otp } = req.body as { email?: string; otp?: string };
  const normalizedEmail = (email || "").trim().toLowerCase();
  const normalizedOtp = (otp || "").trim();

  if (!normalizedEmail || !normalizedOtp) {
    return res.status(400).json({ error: "email and otp are required" });
  }

  const otpKey = `otp:${decoded.userId}:${normalizedEmail}`;

  try {
    const storedOtp = await redis.get(otpKey);
    if (!storedOtp || storedOtp !== normalizedOtp) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    await redis.del(otpKey);
    await redis.set(
      `otp-verified:${decoded.userId}`,
      normalizedEmail,
      "EX",
      900,
    );

    return res.status(200).json({ success: true, message: "OTP verified" });
  } catch (error) {
    console.error("verifyOtp error:", error);
    return res.status(500).json({ error: "Failed to verify OTP" });
  }
};

export const setRoleSelection = async (req: Request, res: Response) => {
  const decoded = res.locals.auth as JwtPayload;

  const { username, companyName, role, email } = req.body as {
    username?: string;
    companyName?: string;
    role?: string;
    email?: string;
  };

  const normalizedUsername = (username || "").trim();
  const normalizedEmail = (email || "").trim().toLowerCase();

  if (!normalizedUsername || !role || !normalizedEmail) {
    return res
      .status(400)
      .json({ error: "username, role and email are required" });
  }

  if (!Object.values(Role).includes(role as Role)) {
    return res.status(400).json({ error: "Invalid role" });
  }

  try {
    const verifiedEmail = await redis.get(`otp-verified:${decoded.userId}`);
    if (!verifiedEmail || verifiedEmail !== normalizedEmail) {
      return res.status(400).json({ error: "OTP verification required" });
    }

    const account = await prisma.account.findUnique({
      where: { id: decoded.userId },
      include: {
        user: true,
        developer: true,
      },
    });

    if (!account) {
      return res.status(404).json({ error: "Account not found" });
    }

    if (role === Role.USER) {
      if (account.developer) {
        await prisma.developer.delete({
          where: { accountId: account.id },
        });
      }

      await prisma.user.upsert({
        where: { accountId: account.id },
        update: { username: normalizedUsername },
        create: {
          accountId: account.id,
          username: normalizedUsername,
        },
      });
    }

    if (role === Role.DEVELOPER) {
      if (account.user) {
        await prisma.user.delete({
          where: { accountId: account.id },
        });
      }

      await prisma.developer.upsert({
        where: { accountId: account.id },
        update: {
          username: normalizedUsername,
          companyName: companyName?.trim() || null,
        },
        create: {
          accountId: account.id,
          username: normalizedUsername,
          companyName: companyName?.trim() || null,
        },
      });
    }

    const updatedAccount = await prisma.account.update({
      where: { id: account.id },
      data: {
        role: role as Role,
        email: normalizedEmail,
      },
    });

    const token = signToken({
      userId: updatedAccount.id,
      role: updatedAccount.role,
      walletAddress: updatedAccount.walletAddress,
    });
    setAuthCookie(res, token);
    await redis.set(`username:${normalizedUsername}`, "1");
    await redis.del(`otp-verified:${decoded.userId}`);

    return res.status(200).json({
      isAuthorized: true,
      role: updatedAccount.role,
      userId: updatedAccount.id,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return res.status(409).json({ error: "Username already exists" });
    }

    console.error("setRoleSelection error:", error);
    return res.status(500).json({ error: "Failed to set account role" });
  }
};
