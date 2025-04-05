/*
  Warnings:

  - You are about to drop the column `examId` on the `Subject` table. All the data in the column will be lost.
  - Added the required column `govExamId` to the `Subject` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Subject" DROP COLUMN "examId",
ADD COLUMN     "govExamId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Subject" ADD CONSTRAINT "Subject_govExamId_fkey" FOREIGN KEY ("govExamId") REFERENCES "GovExam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
