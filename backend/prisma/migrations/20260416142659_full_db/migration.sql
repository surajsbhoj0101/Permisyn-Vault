-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'DEVELOPER', 'GUEST');

-- CreateEnum
CREATE TYPE "AppStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "AppTableStatus" AS ENUM ('ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "AppColumnType" AS ENUM ('TEXT', 'NUMBER', 'BOOLEAN', 'DATE_TIME', 'JSON');

-- CreateEnum
CREATE TYPE "ConsentStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'REVOKED');

-- CreateEnum
CREATE TYPE "ConsentAction" AS ENUM ('REQUESTED', 'APPROVED', 'REJECTED', 'REVOKED');

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "role" "Role",
    "username" TEXT,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "accountId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("accountId")
);

-- CreateTable
CREATE TABLE "Developer" (
    "accountId" TEXT NOT NULL,
    "companyName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Developer_pkey" PRIMARY KEY ("accountId")
);

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
    "isPrimaryKey" BOOLEAN NOT NULL DEFAULT false,
    "isForeignKey" BOOLEAN NOT NULL DEFAULT false,
    "referencesTableId" TEXT,
    "referencesColumnId" TEXT,
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

-- CreateTable
CREATE TABLE "VaultRecord" (
    "id" TEXT NOT NULL,
    "userAccountId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VaultRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsentRequest" (
    "id" TEXT NOT NULL,
    "userAccountId" TEXT NOT NULL,
    "developerAccountId" TEXT NOT NULL,
    "applicationId" TEXT,
    "tableId" TEXT,
    "requestedFields" JSONB NOT NULL,
    "purpose" TEXT,
    "status" "ConsentStatus" NOT NULL DEFAULT 'PENDING',
    "onChainHash" TEXT,
    "respondedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConsentRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsentAuditLog" (
    "id" TEXT NOT NULL,
    "consentRequestId" TEXT NOT NULL,
    "actorAccountId" TEXT NOT NULL,
    "action" "ConsentAction" NOT NULL,
    "statusSnapshot" "ConsentStatus" NOT NULL,
    "onChainHash" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConsentAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_walletAddress_key" ON "Account"("walletAddress");

-- CreateIndex
CREATE UNIQUE INDEX "Account_username_key" ON "Account"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Account_email_key" ON "Account"("email");

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
CREATE INDEX "AppTableColumn_referencesTableId_idx" ON "AppTableColumn"("referencesTableId");

-- CreateIndex
CREATE INDEX "AppTableColumn_referencesColumnId_idx" ON "AppTableColumn"("referencesColumnId");

-- CreateIndex
CREATE UNIQUE INDEX "AppTableColumn_tableId_key_key" ON "AppTableColumn"("tableId", "key");

-- CreateIndex
CREATE INDEX "AppTableRow_tableId_idx" ON "AppTableRow"("tableId");

-- CreateIndex
CREATE INDEX "VaultRecord_userAccountId_idx" ON "VaultRecord"("userAccountId");

-- CreateIndex
CREATE INDEX "ConsentRequest_userAccountId_idx" ON "ConsentRequest"("userAccountId");

-- CreateIndex
CREATE INDEX "ConsentRequest_developerAccountId_idx" ON "ConsentRequest"("developerAccountId");

-- CreateIndex
CREATE INDEX "ConsentRequest_status_idx" ON "ConsentRequest"("status");

-- CreateIndex
CREATE INDEX "ConsentAuditLog_consentRequestId_idx" ON "ConsentAuditLog"("consentRequestId");

-- CreateIndex
CREATE INDEX "ConsentAuditLog_actorAccountId_idx" ON "ConsentAuditLog"("actorAccountId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Developer" ADD CONSTRAINT "Developer_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

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

-- AddForeignKey
ALTER TABLE "VaultRecord" ADD CONSTRAINT "VaultRecord_userAccountId_fkey" FOREIGN KEY ("userAccountId") REFERENCES "User"("accountId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsentRequest" ADD CONSTRAINT "ConsentRequest_userAccountId_fkey" FOREIGN KEY ("userAccountId") REFERENCES "User"("accountId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsentRequest" ADD CONSTRAINT "ConsentRequest_developerAccountId_fkey" FOREIGN KEY ("developerAccountId") REFERENCES "Developer"("accountId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsentRequest" ADD CONSTRAINT "ConsentRequest_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsentRequest" ADD CONSTRAINT "ConsentRequest_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "AppTable"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsentAuditLog" ADD CONSTRAINT "ConsentAuditLog_consentRequestId_fkey" FOREIGN KEY ("consentRequestId") REFERENCES "ConsentRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsentAuditLog" ADD CONSTRAINT "ConsentAuditLog_actorAccountId_fkey" FOREIGN KEY ("actorAccountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
