/*
  Warnings:

  - You are about to drop the column `collation` on the `AppTableColumn` table. All the data in the column will be lost.
  - You are about to drop the column `isUnsigned` on the `AppTableColumn` table. All the data in the column will be lost.
  - You are about to drop the column `length` on the `AppTableColumn` table. All the data in the column will be lost.
  - You are about to drop the column `numericPrecision` on the `AppTableColumn` table. All the data in the column will be lost.
  - You are about to drop the column `numericScale` on the `AppTableColumn` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AppTableColumn" DROP COLUMN "collation",
DROP COLUMN "isUnsigned",
DROP COLUMN "length",
DROP COLUMN "numericPrecision",
DROP COLUMN "numericScale";
