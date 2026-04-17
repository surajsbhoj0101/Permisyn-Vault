/*
  Warnings:

  - You are about to drop the column `data` on the `VaultRecord` table. All the data in the column will be lost.
  - You are about to drop the column `label` on the `VaultRecord` table. All the data in the column will be lost.
  - Added the required column `key` to the `VaultRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `value` to the `VaultRecord` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "VaultRecord" DROP COLUMN "data",
DROP COLUMN "label",
ADD COLUMN     "isEncrypted" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "key" TEXT NOT NULL,
ADD COLUMN     "value" TEXT NOT NULL;
