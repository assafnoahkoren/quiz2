-- DropForeignKey
ALTER TABLE "UserExamQuestion" DROP CONSTRAINT "UserExamQuestion_userExamId_fkey";

-- AlterTable
ALTER TABLE "UserExamQuestion" ALTER COLUMN "userExamId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "UserExamQuestion" ADD CONSTRAINT "UserExamQuestion_userExamId_fkey" FOREIGN KEY ("userExamId") REFERENCES "UserExam"("id") ON DELETE SET NULL ON UPDATE CASCADE;
