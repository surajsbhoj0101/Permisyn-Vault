import type { Request, Response } from "express";
import { prisma } from "../config/db";
import type { JwtPayload } from "../middlewares/requireAuth";
import type { VerifiedApplicationAuth } from "../middlewares/verification/verify.middleware";

const getAuth = (res: Response) => res.locals.auth as JwtPayload;
const getVerifiedApp = (res: Response) =>
  res.locals.verifiedApp as VerifiedApplicationAuth | undefined;

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
  const verifiedApp = getVerifiedApp(res);
  if (verifiedApp?.developerAccountId) {
    return verifiedApp.developerAccountId;
  }

  const decoded = getAuth(res);
  if (!decoded?.userId) {
    return null;
  }

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

// const getQueryValues = (value: string | string[] | undefined) => {
//   if (typeof value === "string") {
//     const normalized = value.trim();
//     return normalized ? [normalized] : [];
//   }

//   if (Array.isArray(value)) {
//     return value
//       .map((item) => item.trim())
//       .filter((item) => item.length > 0);
//   }

//   return [];
// };

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
  interface Field {
    key: string;
    value: string | { encryptedData: string; iv: string };
    encrypted: boolean;
  }

  console.log("createVaultRecord called with body:", req.body);
  const { fields } = req.body as { fields: Field[] };

  if (!Array.isArray(fields) || fields.length === 0) {
    return res.status(400).json({ error: "Fields array is required" });
  }

  const userAccountId = await getUserAccountId(res);
  if (!userAccountId) {
    return res.status(403).json({ error: "User access required" });
  }

  // ensure the request doesn't contain duplicate keys (normalized)
  const seen = new Set<string>();
  for (const f of fields) {
    const k = (f.key || "").trim().toLowerCase();
    if (!k) {
      return res
        .status(400)
        .json({ error: "Each field must include a non-empty key" });
    }
    if (seen.has(k)) {
      return res.status(400).json({ error: `Duplicate key in request: ${k}` });
    }
    seen.add(k);
  }

  const createdRecords = [];
  for (let i = 0; i < fields.length; i++) {
    const field = fields[i];
    if (
      !field.key ||
      typeof field.key !== "string" ||
      !field.value ||
      (typeof field.value !== "string" &&
        (typeof field.value !== "object" ||
          !("encryptedData" in field.value) ||
          !("iv" in field.value))) ||
      typeof field.encrypted !== "boolean"
    ) {
      return res.status(400).json({
        error: `Invalid field format at index ${i}`,
        details:
          "Each field must have a string 'key', a 'value' (string or encrypted object), and boolean 'encrypted'.",
      });
    }

    const normalizedKey = field.key.trim().toLowerCase();

    // enforce unique key per user
    const existing = await prisma.vaultRecord.findFirst({
      where: { userAccountId, key: normalizedKey },
      select: { id: true },
    });

    if (existing) {
      return res
        .status(409)
        .json({ error: `Record with key '${normalizedKey}' already exists` });
    }

    const value =
      typeof field.value === "string"
        ? field.value
        : JSON.stringify(field.value);

    const record = await prisma.vaultRecord.create({
      data: {
        userAccountId,
        key: normalizedKey,
        value,
        isEncrypted: field.encrypted,
      },
    });
    createdRecords.push(record);
  }

  return res.status(201).json({ records: createdRecords });
};

export const updateVaultRecord = async (req: Request, res: Response) => {
  const recordId = getParamValue(req.params.recordId);
  if (!recordId) return res.status(400).json({ error: "recordId is required" });

  interface Field {
    key: string;
    value: string | { encryptedData: string; iv: string };
    encrypted: boolean;
  }

  const { fields } = req.body as { fields?: Field[] };
  if (!Array.isArray(fields) || fields.length === 0) {
    return res
      .status(400)
      .json({ error: "Fields array with one item is required" });
  }

  const field = fields[0];

  if (
    !field.key ||
    typeof field.key !== "string" ||
    !field.value ||
    (typeof field.value !== "string" &&
      (typeof field.value !== "object" ||
        !("encryptedData" in field.value) ||
        !("iv" in field.value))) ||
    typeof field.encrypted !== "boolean"
  ) {
    return res.status(400).json({ error: "Invalid field format" });
  }

  try {
    const userAccountId = await getUserAccountId(res);
    if (!userAccountId)
      return res.status(403).json({ error: "User access required" });

    const existingRecord = await prisma.vaultRecord.findFirst({
      where: { id: recordId, userAccountId },
      select: { id: true, key: true, value: true, isEncrypted: true },
    });
    if (!existingRecord)
      return res.status(404).json({ error: "Record not found" });

    const normalizedKey = field.key.trim().toLowerCase();

    // ensure uniqueness of key for this user (exclude current record)
    const conflict = await prisma.vaultRecord.findFirst({
      where: { userAccountId, key: normalizedKey, NOT: { id: recordId } },
      select: { id: true },
    });
    if (conflict)
      return res
        .status(409)
        .json({ error: `Another record with key '${normalizedKey}' exists` });

    // If the incoming value is empty, keep existing value & isEncrypted flag (allow editing key only)
    let newValue: string;
    let newIsEncrypted: boolean;

    if (typeof field.value === "string" && field.value.trim() === "") {
      newValue = existingRecord.value;
      newIsEncrypted = existingRecord.isEncrypted;
    } else {
      newValue =
        typeof field.value === "string"
          ? field.value
          : JSON.stringify(field.value);
      newIsEncrypted = field.encrypted;
    }

    const updated = await prisma.vaultRecord.update({
      where: { id: recordId },
      data: {
        key: normalizedKey,
        value: newValue,
        isEncrypted: newIsEncrypted,
      },
    });

    return res.status(200).json({ record: updated });
  } catch (error) {
    console.error("updateVaultRecord error:", error);
    return res.status(500).json({ error: "Failed to update vault record" });
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

    const verifiedApp = getVerifiedApp(res);

    const targetAccount = await prisma.account.findUnique({
      where: { walletAddress: normalizedWalletAddress },
      include: { user: true },
    });

    if (!targetAccount || !targetAccount.user) {
      return res.status(404).json({ error: "Target user was not found" });
    }

    const normalizedAppId =
      (appId || "").trim() || verifiedApp?.applicationId || "";
    const normalizedTableId = (tableId || "").trim();

    if (verifiedApp && normalizedAppId !== verifiedApp.applicationId) {
      return res.status(403).json({
        error: "appId does not match the verified application",
      });
    }

    if (!normalizedAppId) {
      return res.status(400).json({ error: "appId is required" });
    }

    if (normalizedAppId) {
      const ownsApp = await prisma.application.findFirst({
        where: { id: normalizedAppId, developerId: developerAccountId },
        select: {
          id: true,
          tables: {
            select: {
              id: true,
              columns: {
                select: { key: true },
              },
            },
          },
        },
      });
      if (!ownsApp) {
        return res.status(404).json({ error: "Application not found" });
      }

      const availableTables = normalizedTableId
        ? ownsApp.tables.filter((table) => table.id === normalizedTableId)
        : ownsApp.tables;

      if (normalizedTableId && availableTables.length === 0) {
        return res.status(404).json({ error: "Table not found" });
      }

      const validFieldKeys = new Set(
        availableTables.flatMap((table) =>
          table.columns.map((column) => column.key),
        ),
      );
      const invalidFields = normalizedFields.filter(
        (field) => !validFieldKeys.has(field),
      );

      if (invalidFields.length > 0) {
        return res.status(400).json({
          error:
            "requestedFields contain columns that do not belong to this application",
          invalidFields,
        });
      }
    }

    const consent = await prisma.$transaction(async (tx) => {
      const created = await tx.consentRequest.create({
        data: {
          userAccountId: targetAccount.id,
          developerAccountId,
          applicationId: normalizedAppId,
          tableId: normalizedTableId || null,
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

export const getRequiredScopesForConsentRequest = async (
  req: Request,
  res: Response,
) => {
  try {
    const verifiedApp = getVerifiedApp(res);
    const normalizedAppId =
      getQueryValue(req.query.appId as string | string[] | undefined) ||
      verifiedApp?.applicationId ||
      "";

    if (!normalizedAppId) {
      return res.status(400).json({
        error: "appId query parameter is required",
      });
    }

    const developerAccountId = await getDeveloperAccountId(res);
    if (!developerAccountId) {
      return res.status(403).json({ error: "Developer access required" });
    }

    if (verifiedApp && verifiedApp.applicationId !== normalizedAppId) {
      return res.status(403).json({
        error: "appId does not match the verified application",
      });
    }

    const ownsApp = await prisma.application.findFirst({
      where: { id: normalizedAppId, developerId: developerAccountId },
      select: { id: true },
    });
    if (!ownsApp) {
      return res.status(404).json({ error: "Application not found" });
    }

    const tables = await prisma.appTable.findMany({
      where: {
        applicationId: normalizedAppId,
        application: { developerId: developerAccountId },
      },
      select: {
        id: true,
        slug: true,
        columns: {
          select: { key: true },
          orderBy: { position: "asc" },
        },
      },
    });

    if (tables.length === 0) {
      return res.status(404).json({
        error: "No tables found for this developer application",
      });
    }

    const scopes = tables.flatMap((table) => {
      const fieldScopes = table.columns.map(
        (column) => `${table.slug}:${column.key}:read`,
      );

      return [`${table.slug}:read`, ...fieldScopes];
    });

    return res.status(200).json({
      scopes: [...new Set(scopes)],
      tables: tables.map((table) => ({
        id: table.id,
        slug: table.slug,
        fields: table.columns.map((column) => column.key),
      })),
    });
  } catch (error) {
    console.error("getRequiredScopesForConsentRequest error:", error);
    return res
      .status(500)
      .json({ error: "Failed to get required scopes for consent request" });
  }
};
