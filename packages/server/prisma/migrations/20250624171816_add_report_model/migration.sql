-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('TECHNICAL_ISSUE', 'CONTENT_ERROR', 'OTHER');

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "type" "ReportType" NOT NULL,
    "reporterId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "questionId" TEXT,
    "govExamId" TEXT NOT NULL,
    "questionData" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_govExamId_fkey" FOREIGN KEY ("govExamId") REFERENCES "GovExam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
