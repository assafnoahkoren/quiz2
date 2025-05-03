-- AlterTable
ALTER TABLE "UserExamQuestion" ADD COLUMN     "chosenOptionId" TEXT;

-- AddForeignKey
ALTER TABLE "UserExamQuestion" ADD CONSTRAINT "UserExamQuestion_chosenOptionId_fkey" FOREIGN KEY ("chosenOptionId") REFERENCES "Options"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
