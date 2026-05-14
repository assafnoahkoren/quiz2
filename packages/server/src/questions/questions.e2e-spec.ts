import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, ExecutionContext } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../app.module';
import { AuthGuard } from '../auth/auth.guard';
import { AdminGuard } from '../auth/role.guard';
import { SubscriptionGuard } from '../subscriptions/guards/subscription.guard';
import { PrismaService } from '../prisma/prisma.service';

describe('QuestionsController - per-user correctness threshold (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let testUser: any;
  let testGovExam: any;
  let testSubject: any;
  let testQuestion: any;

  const mockAuthGuard = {
    canActivate: jest.fn((context: ExecutionContext) => {
      const req = context.switchToHttp().getRequest();
      req.user = { id: testUser?.id };
      return true;
    }),
  };
  const mockAdminGuard = { canActivate: jest.fn(() => true) };
  const mockSubscriptionGuard = { canActivate: jest.fn(() => true) };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(AuthGuard).useValue(mockAuthGuard)
      .overrideGuard(AdminGuard).useValue(mockAdminGuard)
      .overrideGuard(SubscriptionGuard).useValue(mockSubscriptionGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      whitelist: true,
    }));
    await app.init();
    prisma = moduleFixture.get<PrismaService>(PrismaService);

    // Create test user
    testUser = await prisma.user.create({
      data: {
        email: `threshold-test-${Date.now()}@example.com`,
        password: 'password123',
        name: 'Threshold Test User',
      },
    });

    // Create a dedicated GovExam, Subject, and Question for this test
    // so results are deterministic (exactly one published question in this subject)
    testGovExam = await prisma.govExam.create({
      data: { name: `threshold-test-exam-${Date.now()}` },
    });

    testSubject = await prisma.subject.create({
      data: {
        name: `threshold-test-subject-${Date.now()}`,
        govExamId: testGovExam.id,
      },
    });

    testQuestion = await prisma.question.create({
      data: {
        subjectId: testSubject.id,
        question: 'Threshold test question?',
        type: 'MCQ',
        status: 'PUBLISHED',
      },
    });
  });

  afterAll(async () => {
    if (testUser) {
      await prisma.userExamQuestion.deleteMany({ where: { userId: testUser.id } });
      await prisma.user.delete({ where: { id: testUser.id } });
    }
    if (testQuestion) {
      await prisma.question.delete({ where: { id: testQuestion.id } });
    }
    if (testSubject) {
      await prisma.subject.delete({ where: { id: testSubject.id } });
    }
    if (testGovExam) {
      await prisma.govExam.delete({ where: { id: testGovExam.id } });
    }
    await app.close();
  });

  it('respects per-user threshold: question still shown when user threshold exceeds correct-answer count', async () => {
    // Set the user's personal threshold to 3 (higher than the global threshold of 1)
    // This means the user wants to see a question until they've answered it correctly 3 times.
    await request(app.getHttpServer())
      .patch(`/api/users/${testUser.id}`)
      .send({ correctnessThreshold: 3 })
      .expect(200);

    // Record one correct answer — below the user's threshold of 3 (but meets global threshold of 1)
    await prisma.userExamQuestion.create({
      data: {
        userId: testUser.id,
        questionId: testQuestion.id,
        isCorrect: true,
      },
    });

    // With per-user threshold=3 and only 1 correct answer, the question should NOT be filtered
    // (1 correct < user threshold 3), so the endpoint must return the question.
    // Before the fix: correctnessThreshold is stripped from the PATCH DTO, so the global threshold
    // of 1 applies — 1 correct >= global threshold 1 → question IS filtered → endpoint returns null
    // → this assertion fails (body has no id).
    const response = await request(app.getHttpServer())
      .post('/api/questions/random')
      .send({ subjectIds: [testSubject.id], skipAnswered: true })
      .expect(201);

    // The question should be returned because 1 correct answer < user threshold of 3
    expect(response.body?.id).toBeDefined();
  });
});
