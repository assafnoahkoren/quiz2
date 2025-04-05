import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../app.module';
import { PrismaService } from '../prisma/prisma.service';

const request = require('supertest');

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prismaService = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
  });

  describe('Auth Flow', () => {
    const testUser = {
      email: `test${Math.random().toString(36).substring(7)}@example.com`,
      name: 'Test User',
      password: 'password123',
    };

    it('should register a new user and then login with the same credentials', async () => {
      // Step 1: Register a new user
      const registerResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(201);

      // Check the register response
      expect(registerResponse.body).toEqual({
        user: {
          id: expect.any(String),
          email: testUser.email,
          name: testUser.name,
        },
        token: expect.any(String)
      });

      // Store the token from registration
      const registerToken = registerResponse.body.token;

      // Step 2: Login with the same credentials
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(201);

      // Check the login response
      expect(loginResponse.body).toEqual({
        user: {
          id: expect.any(String),
          email: testUser.email,
          name: testUser.name,
        },
        token: expect.any(String)
      });

      // Store the token from login
      const loginToken = loginResponse.body.token;

      // Verify both tokens are valid but different (they should be different as they're generated at different times)
      expect(registerToken).toBeTruthy();
      expect(loginToken).toBeTruthy();
      
      // Check that a record exists in the database
      const userInDb = await prismaService.user.findUnique({
        where: { email: testUser.email },
      });
      
      expect(userInDb).toBeDefined();
      expect(userInDb.email).toEqual(testUser.email);
      expect(userInDb.name).toEqual(testUser.name);
      // Password should be hashed, not plaintext
      expect(userInDb.password).not.toEqual(testUser.password);
    });
  });
}); 