import type { Request, Response } from "express";
import { Prisma, prisma } from "../config/db";
import type { JwtPayload } from "../middlewares/requireAuth";

const getAuth = (res: Response) => res.locals.auth as JwtPayload;

const getUserAccountId = async (res: Response) => {
  const decoded = getAuth(res);
  const account = await prisma.account.findUnique({
    where: { id: decoded.userId },
    include: { user: true },
  });

  if (!account || account.role !== "USER" || !account.user) {
    return null;
  }

  return account.id;
};

const getDeveloperAccountId = async (res: Response) => {
  const decoded = getAuth(res);
  const account = await prisma.account.findUnique({
    where: { id: decoded.userId },
    include: { developer: true },
  });

  if (!account || account.role !== "DEVELOPER" || !account.developer) {
    return null;
  }

  return account.id;
};

const makeHash = (requestId: string, status: string) => {
  const token = `${requestId}:${status}:${Date.now()}`;
  return `0x${Buffer.from(token).toString("hex").slice(0, 64)}`;
};

const normalizeRequestedFields = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter((item) => item.length > 0);
};

const getParamValue = (value: string | string[] | undefined) => {
  if (typeof value === "string") return value.trim();
  if (Array.isArray(value)) return (value[0] || "").trim();
  return "";
};

const getQueryValue = (value: string | string[] | undefined) => {
  if (typeof value === "string") return value.trim();
  if (Array.isArray(value)) return (value[0] || "").trim();
  return "";
};

const formatConsentStatus = (
  status: "PENDING" | "APPROVED" | "REJECTED" | "REVOKED",
) => {
  if (status === "PENDING") return "Pending";
  if (status === "APPROVED") return "Approved";
  if (status === "REJECTED") return "Rejected";
  return "Revoked";
};

export const getUserOverview = async (_req: Request, res: Response) => {
  try {
    const userAccountId = await getUserAccountId(res);
    if (!userAccountId) {
      return res.status(403).json({ error: "User access required" });
    }

    const [recordCount, consentCounts, recentLogs] = await Promise.all([
      prisma.vaultRecord.count({ where: { userAccountId } }),
      prisma.consentRequest.groupBy({
        by: ["status"],
        where: { userAccountId },
        _count: { _all: true },
      }),
      prisma.consentAuditLog.findMany({
        where: { consentRequest: { userAccountId } },
        include: {
          consentRequest: {
            include: {
              developer: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

    const statusCount = consentCounts.reduce(
      (acc, item) => {
        acc[item.status] = item._count._all;
        return acc;
      },
      {
        PENDING: 0,
        APPROVED: 0,
        REJECTED: 0,
        REVOKED: 0,
      } as Record<string, number>,
    );

    return res.status(200).json({
      stats: {
        vaultRecords: recordCount,
        activeConsents: statusCount.APPROVED,
        approvedToday: statusCount.APPROVED,
        revokedToday: statusCount.REVOKED,
      },
      recentActions: recentLogs.map((log) => ({
        id: log.id,
        action: `${formatConsentStatus(log.statusSnapshot)} by ${log.consentRequest.developer.accountId.slice(0, 8)}`,
        createdAt: log.createdAt,
      })),
    });
  } catch (error) {
    console.error("getUserOverview error:", error);
    return res.status(500).json({ error: "Failed to load user overview" });
  }
};

export const listVaultRecords = async (_req: Request, res: Response) => {
  try {
    const userAccountId = await getUserAccountId(res);
    if (!userAccountId) {
      return res.status(403).json({ error: "User access required" });
    }

    const records = await prisma.vaultRecord.findMany({
      where: { userAccountId },
      orderBy: { updatedAt: "desc" },
    });

    return res.status(200).json({ records });
  } catch (error) {
    console.error("listVaultRecords error:", error);
    return res.status(500).json({ error: "Failed to list vault records" });
  }
};

export const createVaultRecord = async (req: Request, res: Response) => {
  const { label, data } = req.body as {
    label?: string;
    data?: Prisma.InputJsonValue;
  };

  const normalizedLabel = (label || "").trim();
  if (!normalizedLabel || data === undefined) {
    return res.status(400).json({ error: "label and data are required" });
  }

  try {
    const userAccountId = await getUserAccountId(res);
    if (!userAccountId) {
      return res.status(403).json({ error: "User access required" });
    }

    const record = await prisma.vaultRecord.create({
      data: {
        userAccountId,
        label: normalizedLabel,
        data,
      },
    });

    return res.status(201).json({ record });
  } catch (error) {
    console.error("createVaultRecord error:", error);
    return res.status(500).json({ error: "Failed to create vault record" });
  }
};

export const deleteVaultRecord = async (req: Request, res: Response) => {
  const recordId = getParamValue(req.params.recordId);
  if (!recordId) {
    return res.status(400).json({ error: "recordId is required" });
  }

  try {
    const userAccountId = await getUserAccountId(res);
    if (!userAccountId) {
      return res.status(403).json({ error: "User access required" });
    }

    const record = await prisma.vaultRecord.findFirst({
      where: { id: recordId, userAccountId },
      select: { id: true },
    });

    if (!record) {
      return res.status(404).json({ error: "Record not found" });
    }

    await prisma.vaultRecord.delete({ where: { id: recordId } });
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("deleteVaultRecord error:", error);
    return res.status(500).json({ error: "Failed to delete vault record" });
  }
};

export const listUserConsentRequests = async (_req: Request, res: Response) => {
  try {
    const userAccountId = await getUserAccountId(res);
    if (!userAccountId) {
      return res.status(403).json({ error: "User access required" });
    }

    const requests = await prisma.consentRequest.findMany({
      where: { userAccountId },
      include: {
        developer: {
          include: { account: true },
        },
        application: true,
        table: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({
      requests: requests.map((item) => ({
        id: item.id,
        companyName:
          item.developer.companyName ||
          item.developer.account.username ||
          item.developer.account.walletAddress,
        status: item.status,
        requestedFields: item.requestedFields,
        purpose: item.purpose,
        requestedAt: item.createdAt,
        applicationName: item.application?.name || null,
        tableName: item.table?.name || null,
      })),
    });
  } catch (error) {
    console.error("listUserConsentRequests error:", error);
    return res.status(500).json({ error: "Failed to list consent requests" });
  }
};

export const decideConsentRequest = async (req: Request, res: Response) => {
  const requestId = getParamValue(req.params.requestId);
  const { decision, onChainHash } = req.body as {
    decision?: "APPROVED" | "REJECTED";
    onChainHash?: string;
  };

  if (!requestId || (decision !== "APPROVED" && decision !== "REJECTED")) {
    return res
      .status(400)
      .json({ error: "requestId and valid decision are required" });
  }

  try {
    const userAccountId = await getUserAccountId(res);
    if (!userAccountId) {
      return res.status(403).json({ error: "User access required" });
    }

    const existing = await prisma.consentRequest.findFirst({
      where: { id: requestId, userAccountId },
      select: { id: true, status: true },
    });

    if (!existing) {
      return res.status(404).json({ error: "Consent request not found" });
    }

    if (existing.status !== "PENDING") {
      return res
        .status(409)
        .json({ error: "Only pending requests can be decided" });
    }
    const hashValue =
      (onChainHash || "").trim() || makeHash(requestId, decision);

    const updated = await prisma.$transaction(async (tx) => {
      const consent = await tx.consentRequest.update({
        where: { id: requestId },
        data: {
          status: decision,
          onChainHash: hashValue,
          respondedAt: new Date(),
        },
      });

      await tx.consentAuditLog.create({
        data: {
          consentRequestId: requestId,
          actorAccountId: userAccountId,
          action: decision === "APPROVED" ? "APPROVED" : "REJECTED",
          statusSnapshot: decision,
          onChainHash: hashValue,
        },
      });

      return consent;
    });

    return res.status(200).json({ request: updated });
  } catch (error) {
    console.error("decideConsentRequest error:", error);
    return res.status(500).json({ error: "Failed to decide consent request" });
  }
};

export const revokeConsentRequest = async (req: Request, res: Response) => {
  const requestId = getParamValue(req.params.requestId);
  const { onChainHash } = req.body as { onChainHash?: string };

  if (!requestId) {
    return res.status(400).json({ error: "requestId is required" });
  }

  try {
    const userAccountId = await getUserAccountId(res);
    if (!userAccountId) {
      return res.status(403).json({ error: "User access required" });
    }

    const existing = await prisma.consentRequest.findFirst({
      where: { id: requestId, userAccountId },
      select: { id: true, status: true },
    });

    if (!existing) {
      return res.status(404).json({ error: "Consent request not found" });
    }

    if (existing.status !== "APPROVED") {
      return res
        .status(409)
        .json({ error: "Only approved requests can be revoked" });
    }

    const hashValue =
      (onChainHash || "").trim() || makeHash(requestId, "REVOKED");

    const updated = await prisma.$transaction(async (tx) => {
      const consent = await tx.consentRequest.update({
        where: { id: requestId },
        data: {
          status: "REVOKED",
          onChainHash: hashValue,
          respondedAt: new Date(),
        },
      });

      await tx.consentAuditLog.create({
        data: {
          consentRequestId: requestId,
          actorAccountId: userAccountId,
          action: "REVOKED",
          statusSnapshot: "REVOKED",
          onChainHash: hashValue,
        },
      });

      return consent;
    });

    return res.status(200).json({ request: updated });
  } catch (error) {
    console.error("revokeConsentRequest error:", error);
    return res.status(500).json({ error: "Failed to revoke consent request" });
  }
};

export const listUserAccessLogs = async (_req: Request, res: Response) => {
  try {
    const userAccountId = await getUserAccountId(res);
    if (!userAccountId) {
      return res.status(403).json({ error: "User access required" });
    }

    const logs = await prisma.consentAuditLog.findMany({
      where: {
        consentRequest: { userAccountId },
      },
      include: {
        consentRequest: {
          include: {
            developer: {
              include: { account: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return res.status(200).json({
      logs: logs.map((log) => ({
        id: log.id,
        action: log.action,
        status: log.statusSnapshot,
        onChainHash: log.onChainHash,
        createdAt: log.createdAt,
        companyName:
          log.consentRequest.developer.companyName ||
          log.consentRequest.developer.account.username ||
          log.consentRequest.developer.account.walletAddress,
      })),
    });
  } catch (error) {
    console.error("listUserAccessLogs error:", error);
    return res.status(500).json({ error: "Failed to list access logs" });
  }
};

export const getDeveloperConsentOverview = async (
  _req: Request,
  res: Response,
) => {
  try {
    const developerAccountId = await getDeveloperAccountId(res);
    if (!developerAccountId) {
      return res.status(403).json({ error: "Developer access required" });
    }

    const [statusCounts, recentRequests] = await Promise.all([
      prisma.consentRequest.groupBy({
        by: ["status"],
        where: { developerAccountId },
        _count: { _all: true },
      }),
      prisma.consentRequest.findMany({
        where: { developerAccountId },
        include: {
          user: {
            include: { account: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
    ]);

    const statusCount = statusCounts.reduce(
      (acc, item) => {
        acc[item.status] = item._count._all;
        return acc;
      },
      {
        PENDING: 0,
        APPROVED: 0,
        REJECTED: 0,
        REVOKED: 0,
      } as Record<string, number>,
    );

    const total =
      statusCount.PENDING +
      statusCount.APPROVED +
      statusCount.REJECTED +
      statusCount.REVOKED;

    return res.status(200).json({
      metrics: {
        requestsSent: total,
        approved: statusCount.APPROVED,
        pending: statusCount.PENDING,
        rejected: statusCount.REJECTED,
      },
      recentRequests: recentRequests.map((item) => ({
        id: item.id,
        userLabel:
          item.user.account.username ||
          item.user.account.walletAddress.slice(0, 10),
        status: item.status,
        createdAt: item.createdAt,
      })),
    });
  } catch (error) {
    console.error("getDeveloperConsentOverview error:", error);
    return res.status(500).json({ error: "Failed to load developer overview" });
  }
};

export const listDeveloperConsentRequests = async (
  req: Request,
  res: Response,
) => {
  try {
    const developerAccountId = await getDeveloperAccountId(res);
    if (!developerAccountId) {
      return res.status(403).json({ error: "Developer access required" });
    }

    const appId = getQueryValue(
      req.query.appId as string | string[] | undefined,
    );

    const requests = await prisma.consentRequest.findMany({
      where: {
        developerAccountId,
        ...(appId ? { applicationId: appId } : {}),
      },
      include: {
        user: {
          include: { account: true },
        },
        application: true,
        table: true,
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    return res.status(200).json({
      requests: requests.map((item) => ({
        id: item.id,
        status: item.status,
        requestedFields: item.requestedFields,
        purpose: item.purpose,
        onChainHash: item.onChainHash,
        createdAt: item.createdAt,
        applicationId: item.applicationId,
        user: {
          id: item.user.accountId,
          username: item.user.account.username,
          walletAddress: item.user.account.walletAddress,
        },
        applicationName: item.application?.name || null,
        tableName: item.table?.name || null,
      })),
    });
  } catch (error) {
    console.error("listDeveloperConsentRequests error:", error);
    return res
      .status(500)
      .json({ error: "Failed to list developer consent requests" });
  }
};

export const createConsentRequest = async (req: Request, res: Response) => {
  const { userWalletAddress, appId, tableId, requestedFields, purpose } =
    req.body as {
      userWalletAddress?: string;
      appId?: string;
      tableId?: string;
      requestedFields?: unknown;
      purpose?: string;
    };

  const normalizedWalletAddress = (userWalletAddress || "")
    .trim()
    .toLowerCase();
  const normalizedFields = normalizeRequestedFields(requestedFields);

  if (!normalizedWalletAddress || normalizedFields.length === 0) {
    return res.status(400).json({
      error: "userWalletAddress and at least one requested field are required",
    });
  }

  try {
    const developerAccountId = await getDeveloperAccountId(res);
    if (!developerAccountId) {
      return res.status(403).json({ error: "Developer access required" });
    }

    const targetAccount = await prisma.account.findUnique({
      where: { walletAddress: normalizedWalletAddress },
      include: { user: true },
    });

    if (!targetAccount || !targetAccount.user) {
      return res.status(404).json({ error: "Target user was not found" });
    }

    if (appId) {
      const ownsApp = await prisma.application.findFirst({
        where: { id: appId, developerId: developerAccountId },
        select: { id: true },
      });
      if (!ownsApp) {
        return res.status(404).json({ error: "Application not found" });
      }
    }

    if (tableId) {
      const ownsTable = await prisma.appTable.findFirst({
        where: {
          id: tableId,
          application: { developerId: developerAccountId },
        },
        select: { id: true },
      });
      if (!ownsTable) {
        return res.status(404).json({ error: "Table not found" });
      }
    }

    const consent = await prisma.$transaction(async (tx) => {
      const created = await tx.consentRequest.create({
        data: {
          userAccountId: targetAccount.id,
          developerAccountId,
          applicationId: appId || null,
          tableId: tableId || null,
          requestedFields: normalizedFields,
          purpose: (purpose || "").trim() || null,
          status: "PENDING",
        },
      });

      await tx.consentAuditLog.create({
        data: {
          consentRequestId: created.id,
          actorAccountId: developerAccountId,
          action: "REQUESTED",
          statusSnapshot: "PENDING",
          metadata: {
            requestedFields: normalizedFields,
            purpose: (purpose || "").trim() || null,
          },
        },
      });

      return created;
    });

    return res.status(201).json({ request: consent });
  } catch (error) {
    console.error("createConsentRequest error:", error);
    return res.status(500).json({ error: "Failed to create consent request" });
  }
};
