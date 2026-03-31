/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `Account` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "email" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Account_email_key" ON "Account"("email");
