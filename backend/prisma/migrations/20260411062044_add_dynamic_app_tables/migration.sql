-- CreateEnum
CREATE TYPE "AppStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "AppTableStatus" AS ENUM ('ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "AppColumnType" AS ENUM ('TEXT', 'NUMBER', 'BOOLEAN', 'DATE_TIME', 'JSON');

-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "AppStatus" NOT NULL DEFAULT 'ACTIVE',
    "developerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplicationApiKey" (
    "id" TEXT NOT NULL,
    "keyHash" TEXT NOT NULL,
    "keyPrefix" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastUsedAt" TIMESTAMP(3),
    "applicationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApplicationApiKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppTable" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "status" "AppTableStatus" NOT NULL DEFAULT 'ACTIVE',
    "applicationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppTable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppTableColumn" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "type" "AppColumnType" NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "isUnique" BOOLEAN NOT NULL DEFAULT false,
    "defaultValue" JSONB,
    "position" INTEGER NOT NULL DEFAULT 0,
    "tableId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppTableColumn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppTableRow" (
    "id" TEXT NOT NULL,
    "tableId" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppTableRow_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Application_developerId_idx" ON "Application"("developerId");

-- CreateIndex
CREATE UNIQUE INDEX "Application_developerId_name_key" ON "Application"("developerId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "ApplicationApiKey_keyHash_key" ON "ApplicationApiKey"("keyHash");

-- CreateIndex
CREATE INDEX "ApplicationApiKey_applicationId_idx" ON "ApplicationApiKey"("applicationId");

-- CreateIndex
CREATE INDEX "AppTable_applicationId_idx" ON "AppTable"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "AppTable_applicationId_slug_key" ON "AppTable"("applicationId", "slug");

-- CreateIndex
CREATE INDEX "AppTableColumn_tableId_idx" ON "AppTableColumn"("tableId");

-- CreateIndex
CREATE UNIQUE INDEX "AppTableColumn_tableId_key_key" ON "AppTableColumn"("tableId", "key");

-- CreateIndex
CREATE INDEX "AppTableRow_tableId_idx" ON "AppTableRow"("tableId");

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_developerId_fkey" FOREIGN KEY ("developerId") REFERENCES "Developer"("accountId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationApiKey" ADD CONSTRAINT "ApplicationApiKey_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppTable" ADD CONSTRAINT "AppTable_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppTableColumn" ADD CONSTRAINT "AppTableColumn_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "AppTable"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppTableRow" ADD CONSTRAINT "AppTableRow_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "AppTable"("id") ON DELETE CASCADE ON UPDATE CASCADE;
