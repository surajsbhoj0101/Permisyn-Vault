import { createHash } from "crypto";
import type { NextFunction, Request, Response } from "express";
import { prisma } from "../../config/db";

export type VerifiedApplicationAuth = {
  apiKeyId: string;
  applicationId: string;
  developerAccountId: string;
};

const readApiKey = (req: Request) => {
  const authorization = req.headers.authorization;
  if (
    typeof authorization === "string" &&
    authorization.startsWith("Bearer ")
  ) {
    return authorization.slice(7).trim();
  }

  const apiKeyHeader = req.headers["x-api-key"];
  if (typeof apiKeyHeader === "string") {
    return apiKeyHeader.trim();
  }

  if (Array.isArray(apiKeyHeader)) {
    return (apiKeyHeader[0] || "").trim();
  }

  return "";
};

export const verify = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const rawApiKey = readApiKey(req);
  if (!rawApiKey) {
    return res.status(401).json({ error: "API key is required" });
  }

  try {
    const keyHash = createHash("sha256").update(rawApiKey).digest("hex");

    const apiKey = await prisma.applicationApiKey.findFirst({
      where: {
        keyHash,
        isActive: true,
      },
      include: {
        application: {
          include: {
            developer: true,
          },
        },
      },
    });

    if (!apiKey) {
      return res.status(403).json({ error: "Invalid API key" });
    }

    if (apiKey.application.status !== "ACTIVE") {
      return res.status(403).json({ error: "Application is not active" });
    }

    if (!apiKey.application.developer) {
      return res.status(403).json({ error: "Developer account not found" });
    }

    await prisma.applicationApiKey.update({
      where: { id: apiKey.id },
      data: { lastUsedAt: new Date() },
    });

    res.locals.verifiedApp = {
      apiKeyId: apiKey.id,
      applicationId: apiKey.applicationId,
      developerAccountId: apiKey.application.developer.accountId,
    } satisfies VerifiedApplicationAuth;

    return next();
  } catch (error) {
    console.error("verify middleware error:", error);
    return res.status(500).json({ error: "Failed to verify API key" });
  }
};
