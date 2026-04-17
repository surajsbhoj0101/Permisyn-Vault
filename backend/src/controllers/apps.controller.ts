import type { Request, Response } from "express";
import { createHash, randomBytes } from "crypto";
import { Prisma, prisma } from "../config/db";
import type { JwtPayload } from "../middlewares/requireAuth";

const APP_COLUMN_TYPES = [
  "TEXT",
  "NUMBER",
  "BOOLEAN",
  "DATE_TIME",
  "JSON",
  "BIGINT",
  "FLOAT",
  "DOUBLE",
  "DECIMAL",
  "TIMESTAMP",
  "BINARY",
  "UUID",
] as const;

type AppColumnType = (typeof APP_COLUMN_TYPES)[number];

const isAppColumnType = (value: unknown): value is AppColumnType => {
  return (
    typeof value === "string" &&
    APP_COLUMN_TYPES.includes(value as AppColumnType)
  );
};

const getDeveloperAccountId = async (res: Response) => {
  const decoded = res.locals.auth as JwtPayload;
  const account = await prisma.account.findUnique({
    where: { id: decoded.userId },
    include: { developer: true },
  });

  if (!account || account.role !== "DEVELOPER" || !account.developer) {
    return null;
  }

  return account.id;
};

const generateApiKey = () => {
  const rawKey = `pv_live_${randomBytes(24).toString("hex")}`;
  const keyHash = createHash("sha256").update(rawKey).digest("hex");
  const keyPrefix = rawKey.slice(0, 14);

  return { rawKey, keyHash, keyPrefix };
};

const getParamValue = (value: string | string[] | undefined) => {
  if (typeof value === "string") return value.trim();
  if (Array.isArray(value)) return (value[0] || "").trim();
  return "";
};

export const listApplications = async (_req: Request, res: Response) => {
  try {
    const developerId = await getDeveloperAccountId(res);
    if (!developerId) {
      return res.status(403).json({ error: "Developer access required" });
    }

    const apps = await prisma.application.findMany({
      where: { developerId },
      include: {
        apiKeys: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            keyPrefix: true,
            lastUsedAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({
      apps: apps.map((app) => ({
        id: app.id,
        name: app.name,
        description: app.description,
        status: app.status,
        createdAt: app.createdAt,
        keyPrefix: app.apiKeys[0]?.keyPrefix ?? null,
        lastUsedAt: app.apiKeys[0]?.lastUsedAt ?? null,
      })),
    });
  } catch (error) {
    console.error("listApplications error:", error);
    return res.status(500).json({ error: "Failed to list applications" });
  }
};

export const createApplication = async (req: Request, res: Response) => {
  const { name, description } = req.body as {
    name?: string;
    description?: string;
  };

  const normalizedName = (name || "").trim();
  if (!normalizedName) {
    return res.status(400).json({ error: "name is required" });
  }

  try {
    const developerId = await getDeveloperAccountId(res);
    if (!developerId) {
      return res.status(403).json({ error: "Developer access required" });
    }

    const generatedKey = generateApiKey();
    const app = await prisma.application.create({
      data: {
        name: normalizedName,
        description: (description || "").trim() || null,
        developerId,
        apiKeys: {
          create: {
            keyHash: generatedKey.keyHash,
            keyPrefix: generatedKey.keyPrefix,
          },
        },
      },
    });

    return res.status(201).json({
      app: {
        id: app.id,
        name: app.name,
        description: app.description,
        status: app.status,
        createdAt: app.createdAt,
        keyPrefix: generatedKey.keyPrefix,
        lastUsedAt: null,
      },
      apiKey: generatedKey.rawKey,
      message: "Save this key now. It cannot be shown again.",
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return res.status(409).json({ error: "Application name already exists" });
    }

    console.error("createApplication error:", error);
    return res.status(500).json({ error: "Failed to create application" });
  }
};

export const deleteApplication = async (req: Request, res: Response) => {
  const appId = getParamValue(req.params.appId);
  if (!appId) {
    return res.status(400).json({ error: "appId is required" });
  }

  try {
    const developerId = await getDeveloperAccountId(res);
    if (!developerId) {
      return res.status(403).json({ error: "Developer access required" });
    }

    const existing = await prisma.application.findFirst({
      where: { id: appId, developerId },
      select: { id: true },
    });

    if (!existing) {
      return res.status(404).json({ error: "Application not found" });
    }

    await prisma.application.delete({ where: { id: appId } });
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("deleteApplication error:", error);
    return res.status(500).json({ error: "Failed to delete application" });
  }
};

export const rotateApiKey = async (req: Request, res: Response) => {
  const appId = getParamValue(req.params.appId);
  if (!appId) {
    return res.status(400).json({ error: "appId is required" });
  }

  try {
    const developerId = await getDeveloperAccountId(res);
    if (!developerId) {
      return res.status(403).json({ error: "Developer access required" });
    }

    const app = await prisma.application.findFirst({
      where: { id: appId, developerId },
      select: { id: true },
    });

    if (!app) {
      return res.status(404).json({ error: "Application not found" });
    }

    const generatedKey = generateApiKey();

    await prisma.$transaction([
      prisma.applicationApiKey.updateMany({
        where: { applicationId: appId, isActive: true },
        data: { isActive: false },
      }),
      prisma.applicationApiKey.create({
        data: {
          applicationId: appId,
          keyHash: generatedKey.keyHash,
          keyPrefix: generatedKey.keyPrefix,
          isActive: true,
        },
      }),
    ]);

    return res.status(201).json({
      apiKey: generatedKey.rawKey,
      keyPrefix: generatedKey.keyPrefix,
      message: "Save this key now. It cannot be shown again.",
    });
  } catch (error) {
    console.error("rotateApiKey error:", error);
    return res.status(500).json({ error: "Failed to rotate API key" });
  }
};

export const listTables = async (req: Request, res: Response) => {
  const appId = getParamValue(req.params.appId);
  if (!appId) {
    return res.status(400).json({ error: "appId is required" });
  }

  try {
    const developerId = await getDeveloperAccountId(res);
    if (!developerId) {
      return res.status(403).json({ error: "Developer access required" });
    }

    const app = await prisma.application.findFirst({
      where: { id: appId, developerId },
      select: { id: true },
    });

    if (!app) {
      return res.status(404).json({ error: "Application not found" });
    }

    const tables = await prisma.appTable.findMany({
      where: { applicationId: appId },
      include: {
        columns: {
          orderBy: { position: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({ tables });
  } catch (error) {
    console.error("listTables error:", error);
    return res.status(500).json({ error: "Failed to list app tables" });
  }
};

export const createTable = async (req: Request, res: Response) => {
  const appId = getParamValue(req.params.appId);
  const { name, slug, description } = req.body as {
    name?: string;
    slug?: string;
    description?: string;
  };

  const normalizedName = (name || "").trim();
  const normalizedSlug = (slug || normalizedName)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "");

  if (!appId || !normalizedName || !normalizedSlug) {
    return res
      .status(400)
      .json({ error: "appId, name and a valid slug are required" });
  }

  try {
    const developerId = await getDeveloperAccountId(res);
    if (!developerId) {
      return res.status(403).json({ error: "Developer access required" });
    }

    const app = await prisma.application.findFirst({
      where: { id: appId, developerId },
      select: { id: true },
    });

    if (!app) {
      return res.status(404).json({ error: "Application not found" });
    }

    const table = await prisma.appTable.create({
      data: {
        applicationId: appId,
        name: normalizedName,
        slug: normalizedSlug,
        description: (description || "").trim() || null,
      },
    });

    return res.status(201).json({ table });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return res
        .status(409)
        .json({ error: "Table slug already exists for this app" });
    }

    console.error("createTable error:", error);
    return res.status(500).json({ error: "Failed to create table" });
  }
};

export const deleteTable = async (req: Request, res: Response) => {
  const appId = getParamValue(req.params.appId);
  const tableId = getParamValue(req.params.tableId);

  if (!appId || !tableId) {
    return res.status(400).json({ error: "appId and tableId are required" });
  }

  try {
    const developerId = await getDeveloperAccountId(res);
    if (!developerId) {
      return res.status(403).json({ error: "Developer access required" });
    }

    const table = await prisma.appTable.findFirst({
      where: {
        id: tableId,
        applicationId: appId,
        application: { developerId },
      },
      select: { id: true },
    });

    if (!table) {
      return res.status(404).json({ error: "Table not found" });
    }

    await prisma.appTable.delete({ where: { id: tableId } });
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("deleteTable error:", error);
    return res.status(500).json({ error: "Failed to delete table" });
  }
};

export const listColumns = async (req: Request, res: Response) => {
  const appId = getParamValue(req.params.appId);
  const tableId = getParamValue(req.params.tableId);

  if (!appId || !tableId) {
    return res.status(400).json({ error: "appId and tableId are required" });
  }

  try {
    const developerId = await getDeveloperAccountId(res);
    if (!developerId) {
      return res.status(403).json({ error: "Developer access required" });
    }

    const table = await prisma.appTable.findFirst({
      where: {
        id: tableId,
        applicationId: appId,
        application: { developerId },
      },
      include: {
        columns: {
          orderBy: { position: "asc" },
        },
      },
    });

    if (!table) {
      return res.status(404).json({ error: "Table not found" });
    }

    return res.status(200).json({ columns: table.columns });
  } catch (error) {
    console.error("listColumns error:", error);
    return res.status(500).json({ error: "Failed to list columns" });
  }
};

export const createColumn = async (req: Request, res: Response) => {
  const appId = getParamValue(req.params.appId);
  const tableId = getParamValue(req.params.tableId);
  const {
    name,
    key,
    type,
    isRequired,
    isUnique,
    isPrimaryKey,
    isForeignKey,
    referencesTableId,
    referencesColumnId,
    defaultValue,
    position,
    // autoincrement options
    isAutoIncrement,
    autoIncrementStart,
    autoIncrementStep,
    isEncrypted,
  } = req.body as {
    name?: string;
    key?: string;
    type?: string;
    isRequired?: boolean;
    isUnique?: boolean;
    isPrimaryKey?: boolean;
    isForeignKey?: boolean;
    referencesTableId?: string;
    referencesColumnId?: string;
    defaultValue?: Prisma.InputJsonValue;
    position?: number;
    isAutoIncrement?: boolean;
    autoIncrementStart?: number;
    autoIncrementStep?: number;
    isEncrypted?: boolean;
  };

  const normalizedName = (name || "").trim();
  const normalizedKey = (key || normalizedName)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "");
  const wantsPrimaryKey = Boolean(isPrimaryKey);
  const wantsForeignKey = Boolean(isForeignKey);
  const normalizedReferencesTableId = (referencesTableId || "").trim();
  const normalizedReferencesColumnId = (referencesColumnId || "").trim();

  if (
    !appId ||
    !tableId ||
    !normalizedName ||
    !normalizedKey ||
    !isAppColumnType(type)
  ) {
    return res.status(400).json({
      error: "appId, tableId, name, key and valid type are required",
    });
  }

  // basic validation for new fields
  const wantsAutoIncrement = Boolean(isAutoIncrement);
  if (wantsAutoIncrement) {
    // only allow autoincrement on integer-like types
    if (!(type === "NUMBER" || type === "BIGINT")) {
      return res.status(400).json({
        error: "autoincrement is only supported for NUMBER or BIGINT column types",
      });
    }
    if (wantsForeignKey) {
      return res.status(400).json({
        error: "autoincrement columns cannot be foreign keys",
      });
    }
  }

  

  if (
    wantsForeignKey &&
    (!normalizedReferencesTableId || !normalizedReferencesColumnId)
  ) {
    return res.status(400).json({
      error:
        "referencesTableId and referencesColumnId are required for foreign keys",
    });
  }

  if (
    !wantsForeignKey &&
    (normalizedReferencesTableId || normalizedReferencesColumnId)
  ) {
    return res.status(400).json({
      error:
        "referencesTableId and referencesColumnId can only be set for foreign keys",
    });
  }

  try {
    const developerId = await getDeveloperAccountId(res);
    if (!developerId) {
      return res.status(403).json({ error: "Developer access required" });
    }

    const table = await prisma.appTable.findFirst({
      where: {
        id: tableId,
        applicationId: appId,
        application: { developerId },
      },
      select: { id: true },
    });

    if (!table) {
      return res.status(404).json({ error: "Table not found" });
    }

    if (wantsPrimaryKey) {
      const existingPrimaryKey = await prisma.appTableColumn.findFirst({
        where: {
          tableId,
          isPrimaryKey: true,
        },
        select: { id: true },
      });

      if (existingPrimaryKey) {
        return res.status(409).json({
          error: "A primary key column already exists for this table",
        });
      }
    }

    if (wantsForeignKey) {
      const referencedTable = await prisma.appTable.findFirst({
        where: {
          id: normalizedReferencesTableId,
          applicationId: appId,
        },
        select: { id: true },
      });

      if (!referencedTable) {
        return res.status(404).json({
          error: "Referenced table was not found in this application",
        });
      }

      const referencedColumn = await prisma.appTableColumn.findFirst({
        where: {
          id: normalizedReferencesColumnId,
          tableId: normalizedReferencesTableId,
        },
        select: { id: true },
      });

      if (!referencedColumn) {
        return res.status(404).json({
          error: "Referenced column was not found in the referenced table",
        });
      }
    }

    const column = await prisma.appTableColumn.create({
      data: {
        tableId,
        name: normalizedName,
        key: normalizedKey,
        type,
        isRequired: wantsPrimaryKey ? true : Boolean(isRequired),
        isUnique: wantsPrimaryKey ? true : Boolean(isUnique),
        isPrimaryKey: wantsPrimaryKey,
        isForeignKey: wantsForeignKey,
        referencesTableId: wantsForeignKey ? normalizedReferencesTableId : null,
        referencesColumnId: wantsForeignKey ? normalizedReferencesColumnId : null,
        defaultValue,
        // new fields persisted
        isAutoIncrement: wantsAutoIncrement,
        autoIncrementStart: typeof autoIncrementStart === "number" ? autoIncrementStart : null,
        autoIncrementStep: typeof autoIncrementStep === "number" ? autoIncrementStep : null,
        isEncrypted: Boolean(isEncrypted),
        position: typeof position === "number" ? position : 0,
      },
    });

    return res.status(201).json({ column });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return res.status(409).json({ error: "Column key already exists" });
    }

    console.error("createColumn error:", error);
    return res.status(500).json({ error: "Failed to create column" });
  }
};

export const deleteColumn = async (req: Request, res: Response) => {
  const appId = getParamValue(req.params.appId);
  const tableId = getParamValue(req.params.tableId);
  const columnId = getParamValue(req.params.columnId);

  if (!appId || !tableId || !columnId) {
    return res
      .status(400)
      .json({ error: "appId, tableId and columnId are required" });
  }

  try {
    const developerId = await getDeveloperAccountId(res);
    if (!developerId) {
      return res.status(403).json({ error: "Developer access required" });
    }

    const column = await prisma.appTableColumn.findFirst({
      where: {
        id: columnId,
        tableId,
        table: {
          applicationId: appId,
          application: { developerId },
        },
      },
      select: { id: true },
    });

    if (!column) {
      return res.status(404).json({ error: "Column not found" });
    }

    await prisma.appTableColumn.delete({ where: { id: columnId } });
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("deleteColumn error:", error);
    return res.status(500).json({ error: "Failed to delete column" });
  }
};
