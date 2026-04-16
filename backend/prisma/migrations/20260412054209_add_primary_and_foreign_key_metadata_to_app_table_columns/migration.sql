-- AlterTable
ALTER TABLE "AppTableColumn" ADD COLUMN     "isForeignKey" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isPrimaryKey" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "referencesColumnId" TEXT,
ADD COLUMN     "referencesTableId" TEXT;

-- CreateIndex
CREATE INDEX "AppTableColumn_referencesTableId_idx" ON "AppTableColumn"("referencesTableId");

-- CreateIndex
CREATE INDEX "AppTableColumn_referencesColumnId_idx" ON "AppTableColumn"("referencesColumnId");
