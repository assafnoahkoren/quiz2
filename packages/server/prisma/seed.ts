import { PrismaClient, QuestionStatus, QuestionType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Instead of deleting, check if records exist first
  const existingExams = await prisma.govExam.count();

  // Only seed if no exams exist
  if (existingExams === 0) {
    // Create GovExam entries in Hebrew
    const speechTherapyExam = await prisma.govExam.create({
      data: {
        name: 'קלינאות תקשורת',
      },
    });

    const taxConsultantExam = await prisma.govExam.create({
      data: {
        name: 'יועץ מס',
      },
    });

    const realEstateAppraiserExam = await prisma.govExam.create({
      data: {
        name: 'שמאי מקרקעין',
      },
    });

    // Create subjects for Speech Therapy Exam (קלינאות תקשורת)
    const anatomy = await prisma.subject.create({
      data: {
        name: 'אנטומיה ופיזיולוגיה',
        govExamId: speechTherapyExam.id,
      },
    });

    const speechDisorders = await prisma.subject.create({
      data: {
        name: 'הפרעות דיבור',
        govExamId: speechTherapyExam.id,
      },
    });

    const languageCommunication = await prisma.subject.create({
      data: {
        name: 'שפה ותקשורת',
        govExamId: speechTherapyExam.id,
      },
    });

    // Create child subjects for Anatomy (אנטומיה ופיזיולוגיה)
    const speechSystem = await prisma.subject.create({
      data: {
        name: 'מערכת הדיבור',
        govExamId: speechTherapyExam.id,
        parentSubjectId: anatomy.id,
      },
    });

    const hearingSystem = await prisma.subject.create({
      data: {
        name: 'מערכת השמיעה',
        govExamId: speechTherapyExam.id,
        parentSubjectId: anatomy.id,
      },
    });

    // Create child subjects for Speech Disorders (הפרעות דיבור)
    const stuttering = await prisma.subject.create({
      data: {
        name: 'גמגום',
        govExamId: speechTherapyExam.id,
        parentSubjectId: speechDisorders.id,
      },
    });

    const articulationDisorders = await prisma.subject.create({
      data: {
        name: 'הפרעות היגוי',
        govExamId: speechTherapyExam.id,
        parentSubjectId: speechDisorders.id,
      },
    });

    // Create child subjects for Language and Communication (שפה ותקשורת)
    const languageDevelopment = await prisma.subject.create({
      data: {
        name: 'התפתחות שפה',
        govExamId: speechTherapyExam.id,
        parentSubjectId: languageCommunication.id,
      },
    });

    const diagnosis = await prisma.subject.create({
      data: {
        name: 'אבחון',
        govExamId: speechTherapyExam.id,
        parentSubjectId: languageCommunication.id,
      },
    });

    // Create subjects for Tax Consultant Exam (יועץ מס)
    const taxLaws = await prisma.subject.create({
      data: {
        name: 'חוקי מס',
        govExamId: taxConsultantExam.id,
      },
    });

    const accounting = await prisma.subject.create({
      data: {
        name: 'חשבונאות',
        govExamId: taxConsultantExam.id,
      },
    });

    const taxPlanning = await prisma.subject.create({
      data: {
        name: 'תכנון מס',
        govExamId: taxConsultantExam.id,
      },
    });

    // Create child subjects for Tax Laws (חוקי מס)
    const incomeTax = await prisma.subject.create({
      data: {
        name: 'מס הכנסה',
        govExamId: taxConsultantExam.id,
        parentSubjectId: taxLaws.id,
      },
    });

    const vat = await prisma.subject.create({
      data: {
        name: 'מע"מ',
        govExamId: taxConsultantExam.id,
        parentSubjectId: taxLaws.id,
      },
    });

    // Create child subjects for Accounting (חשבונאות)
    const bookkeeping = await prisma.subject.create({
      data: {
        name: 'הנהלת חשבונות',
        govExamId: taxConsultantExam.id,
        parentSubjectId: accounting.id,
      },
    });

    const financialStatements = await prisma.subject.create({
      data: {
        name: 'דוחות כספיים',
        govExamId: taxConsultantExam.id,
        parentSubjectId: accounting.id,
      },
    });

    // Create child subjects for Tax Planning (תכנון מס)
    const taxExemptions = await prisma.subject.create({
      data: {
        name: 'פטורים ממס',
        govExamId: taxConsultantExam.id,
        parentSubjectId: taxPlanning.id,
      },
    });

    const taxBenefits = await prisma.subject.create({
      data: {
        name: 'הטבות מס',
        govExamId: taxConsultantExam.id,
        parentSubjectId: taxPlanning.id,
      },
    });

    // Create subjects for Real Estate Appraiser Exam (שמאי מקרקעין)
    const realEstateLaws = await prisma.subject.create({
      data: {
        name: 'חוקי מקרקעין',
        govExamId: realEstateAppraiserExam.id,
      },
    });

    const valuationMethods = await prisma.subject.create({
      data: {
        name: 'שיטות הערכה',
        govExamId: realEstateAppraiserExam.id,
      },
    });

    const economicAnalysis = await prisma.subject.create({
      data: {
        name: 'ניתוח כלכלי',
        govExamId: realEstateAppraiserExam.id,
      },
    });

    // Create child subjects for Real Estate Laws (חוקי מקרקעין)
    const realEstateLaw = await prisma.subject.create({
      data: {
        name: 'חוק המקרקעין',
        govExamId: realEstateAppraiserExam.id,
        parentSubjectId: realEstateLaws.id,
      },
    });

    const planningAndBuilding = await prisma.subject.create({
      data: {
        name: 'תכנון ובנייה',
        govExamId: realEstateAppraiserExam.id,
        parentSubjectId: realEstateLaws.id,
      },
    });

    // Create child subjects for Valuation Methods (שיטות הערכה)
    const comparisonApproach = await prisma.subject.create({
      data: {
        name: 'גישת ההשוואה',
        govExamId: realEstateAppraiserExam.id,
        parentSubjectId: valuationMethods.id,
      },
    });

    const costApproach = await prisma.subject.create({
      data: {
        name: 'גישת העלות',
        govExamId: realEstateAppraiserExam.id,
        parentSubjectId: valuationMethods.id,
      },
    });

    // Create child subjects for Economic Analysis (ניתוח כלכלי)
    const cashFlowDiscounting = await prisma.subject.create({
      data: {
        name: 'היוון תזרים מזומנים',
        govExamId: realEstateAppraiserExam.id,
        parentSubjectId: economicAnalysis.id,
      },
    });

    const investmentFeasibility = await prisma.subject.create({
      data: {
        name: 'כדאיות השקעה',
        govExamId: realEstateAppraiserExam.id,
        parentSubjectId: economicAnalysis.id,
      },
    });

    console.log('Base seed data created successfully!');
  } else {
    console.log('Exams already exist, skipping exam and subject creation.');
  }

  // Get all subjects for the speech therapy exam to add questions
  const existingQuestions = await prisma.question.count();

  if (existingQuestions === 0) {
    // Get the speechTherapyExam
    const speechTherapyExam = await prisma.govExam.findFirst({
      where: { name: 'קלינאות תקשורת' },
    });

    if (!speechTherapyExam) {
      console.log('Speech Therapy Exam not found, skipping question creation.');
      return;
    }

    // Get all subjects for the speech therapy exam
    const subjects = await prisma.subject.findMany({
      where: { govExamId: speechTherapyExam.id },
    });

    // Create 3 questions for each subject
    for (const subject of subjects) {
      for (let i = 1; i <= 3; i++) {
        const question = await prisma.question.create({
          data: {
            subjectId: subject.id,
            question: `שאלה ${i} על ${subject.name}`,
            type: QuestionType.MCQ,
            status: QuestionStatus.PUBLISHED,
            explanation: `הסבר לשאלה ${i} על ${subject.name}`,
          },
        });

        // Create 4 options for each question (1 correct, 3 incorrect)
        await prisma.options.createMany({
          data: [
            {
              questionId: question.id,
              answer: `תשובה נכונה לשאלה ${i} על ${subject.name}`,
              isCorrect: true,
            },
            {
              questionId: question.id,
              answer: `תשובה שגויה 1 לשאלה ${i} על ${subject.name}`,
              isCorrect: false,
            },
            {
              questionId: question.id,
              answer: `תשובה שגויה 2 לשאלה ${i} על ${subject.name}`,
              isCorrect: false,
            },
            {
              questionId: question.id,
              answer: `תשובה שגויה 3 לשאלה ${i} על ${subject.name}`,
              isCorrect: false,
            },
          ],
        });
      }
    }

    console.log('Questions and options created successfully!');
  } else {
    console.log('Questions already exist, skipping question creation.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 