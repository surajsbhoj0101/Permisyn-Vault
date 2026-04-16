-- CreateEnum
CREATE TYPE "ConsentStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'REVOKED');

-- CreateEnum
CREATE TYPE "ConsentAction" AS ENUM ('REQUESTED', 'APPROVED', 'REJECTED', 'REVOKED');

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
