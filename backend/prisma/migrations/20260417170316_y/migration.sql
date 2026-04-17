-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AppColumnType" ADD VALUE 'BIGINT';
ALTER TYPE "AppColumnType" ADD VALUE 'FLOAT';
ALTER TYPE "AppColumnType" ADD VALUE 'DOUBLE';
ALTER TYPE "AppColumnType" ADD VALUE 'DECIMAL';
ALTER TYPE "AppColumnType" ADD VALUE 'TIMESTAMP';
ALTER TYPE "AppColumnType" ADD VALUE 'BINARY';
ALTER TYPE "AppColumnType" ADD VALUE 'UUID';

-- AlterTable
ALTER TABLE "AppTableColumn" ADD COLUMN     "autoIncrementStart" INTEGER,
ADD COLUMN     "autoIncrementStep" INTEGER,
ADD COLUMN     "collation" TEXT,
ADD COLUMN     "isAutoIncrement" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isUnsigned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "length" INTEGER,
ADD COLUMN     "numericPrecision" INTEGER,
ADD COLUMN     "numericScale" INTEGER;
