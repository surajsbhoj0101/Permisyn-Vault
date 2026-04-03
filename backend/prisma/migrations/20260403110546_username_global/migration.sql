/*
  Warnings:

  - You are about to drop the column `username` on the `Developer` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[username]` on the table `Account` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Developer_username_key";

-- DropIndex
DROP INDEX "User_username_key";

-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "username" TEXT;

-- AlterTable
ALTER TABLE "Developer" DROP COLUMN "username";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "username";

-- CreateIndex
CREATE UNIQUE INDEX "Account_username_key" ON "Account"("username");
