-- DropForeignKey
ALTER TABLE "UserExamQuestion" DROP CONSTRAINT "UserExamQuestion_chosenOptionId_fkey";

-- AddForeignKey
ALTER TABLE "UserExamQuestion" ADD CONSTRAINT "UserExamQuestion_chosenOptionId_fkey" FOREIGN KEY ("chosenOptionId") REFERENCES "Options"("id") ON DELETE SET NULL ON UPDATE CASCADE;
