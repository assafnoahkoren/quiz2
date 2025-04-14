import { Pool } from 'pg';
import { PrismaClient, QuestionType, QuestionStatus } from '@prisma/client';

// Types for old database tables
interface OldSubject {
  id: string;
  name: string;
  description: string | null;
  parentId: string | null;
  createdAt: Date;
}

interface OldQuestion {
  id: string;
  subjectId: string;
  text: string;
  correctAnswer: string;
  answers: string[] | null;
  verified: boolean;
  explanation: string | null;
}

// Configuration for the old database
const oldDbConfig = {
  host: process.env.OLD_DB_HOST,
  port: parseInt(process.env.OLD_DB_PORT || '5432'),
  database: process.env.OLD_DB_NAME,
  user: process.env.OLD_DB_USER,
  password: process.env.OLD_DB_PASSWORD,
  ssl: {
    rejectUnauthorized: false
  }
};

// Initialize Prisma client for the new database
const prisma = new PrismaClient();

async function importSubjects(oldDb: Pool) {
  console.log('Importing subjects...');
  const subjects = await oldDb.query<OldSubject>('SELECT * FROM "Subject"');
  
  // First, create a default GovExam for the imported subjects
  const defaultGovExam = await prisma.govExam.create({
    data: {
      name: 'Imported Subjects',
    }
  });

  for (const subject of subjects.rows) {
    await prisma.subject.create({
      data: {
        id: subject.id,
        name: subject.name,
        govExamId: defaultGovExam.id,
        parentSubjectId: subject.parentId || null,
        createdAt: subject.createdAt,
        updatedAt: subject.createdAt
      }
    });
  }
  console.log(`Imported ${subjects.rows.length} subjects`);
}

async function importQuestions(oldDb: Pool) {
  console.log('Importing questions...');
  const questions = await oldDb.query<OldQuestion>('SELECT * FROM "Question"');
  
  for (const question of questions.rows) {
    // Create the question
    const newQuestion = await prisma.question.create({
      data: {
        id: question.id,
        subjectId: question.subjectId,
        question: question.text,
        explanation: question.explanation || null,
        status: QuestionStatus.PUBLISHED,
        type: QuestionType.MCQ,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    // Create options for the question
    if (question.answers && question.answers.length > 0) {
      await prisma.options.createMany({
        data: question.answers.map(answer => ({
          questionId: newQuestion.id,
          answer: answer,
          isCorrect: answer === question.correctAnswer,
          createdAt: new Date(),
          updatedAt: new Date()
        }))
      });
    }
  }
  console.log(`Imported ${questions.rows.length} questions`);
}

async function importData() {
  // Validate required environment variables
  const requiredEnvVars = ['OLD_DB_HOST', 'OLD_DB_NAME', 'OLD_DB_USER', 'OLD_DB_PASSWORD'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }

  const oldDb = new Pool(oldDbConfig);

  try {
    // Import subjects first since questions depend on them
    await importSubjects(oldDb);
    
    // Then import questions
    await importQuestions(oldDb);

    console.log('Data import completed successfully');
  } catch (error) {
    console.error('Error during data import:', error);
    throw error;
  } finally {
    // Close connections
    await oldDb.end();
    await prisma.$disconnect();
  }
}

// Run the import function
importData()
  .then(() => {
    console.log('Import process finished');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Import process failed:', error);
    process.exit(1);
  }); 