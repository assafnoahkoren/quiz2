/*
  Warnings:

  - You are about to drop the column `examId` on the `GovExamInstance` table. All the data in the column will be lost.
  - Added the required column `govExamId` to the `GovExamInstance` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "GovExamInstance" DROP CONSTRAINT "GovExamInstance_examId_fkey";

-- AlterTable
ALTER TABLE "GovExamInstance" DROP COLUMN "examId",
ADD COLUMN     "govExamId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "GovExamInstance" ADD CONSTRAINT "GovExamInstance_govExamId_fkey" FOREIGN KEY ("govExamId") REFERENCES "GovExam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
