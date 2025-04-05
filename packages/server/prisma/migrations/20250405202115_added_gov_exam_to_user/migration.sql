/*
  Warnings:

  - Added the required column `govExamId` to the `Subscription` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "govExamId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "govExamId" TEXT;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_govExamId_fkey" FOREIGN KEY ("govExamId") REFERENCES "GovExam"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_govExamId_fkey" FOREIGN KEY ("govExamId") REFERENCES "GovExam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
