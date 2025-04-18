import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../app.module';
import { UserService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '../auth/auth.guard';
import { AdminGuard } from '../auth/role.guard';
import { PrismaService } from '../prisma/prisma.service';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let userService: UserService;
  let prisma: PrismaService;
  let createdUserId: string;

  const mockAuthGuard = { canActivate: jest.fn(() => true) };
  const mockAdminGuard = { canActivate: jest.fn(() => true) };

  const createUserDto: CreateUserDto = {
    email: 'test.user@example.com',
    password: 'password123',
    name: 'Test User',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
    .overrideGuard(AuthGuard)
    .useValue(mockAuthGuard)
    .overrideGuard(AdminGuard)
    .useValue(mockAdminGuard)
    .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe()); // Important for DTO validation
    await app.init();

    userService = moduleFixture.get<UserService>(UserService);
    prisma = moduleFixture.get<PrismaService>(PrismaService);

    // Clean up database before tests
    await prisma.user.deleteMany({}); 
  });

  afterAll(async () => {
    // Clean up database after tests
    await prisma.user.deleteMany({});
    await app.close();
  });

  it('/users (POST) - should create a user', async () => {
    const response = await request(app.getHttpServer())
      .post('/users')
      .send(createUserDto)
      .expect(201);

    expect(response.body).toBeDefined();
    expect(response.body.email).toEqual(createUserDto.email);
    expect(response.body.name).toEqual(createUserDto.name);
    expect(response.body.password).toBeUndefined(); // Password should not be returned
    createdUserId = response.body.id; // Save for later tests
    expect(createdUserId).toBeDefined();
  });

  it('/users (GET) - should get all users', async () => {
    const response = await request(app.getHttpServer())
      .get('/users')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0].id).toEqual(createdUserId);
    expect(response.body[0].password).toBeUndefined(); 
  });

  it('/users/:id (GET) - should get a single user by id with subscriptions', async () => {
    const response = await request(app.getHttpServer())
      .get(`/users/${createdUserId}`)
      .expect(200);

    expect(response.body).toBeDefined();
    expect(response.body.id).toEqual(createdUserId);
    expect(response.body.email).toEqual(createUserDto.email);
    expect(response.body.password).toBeUndefined();
    // Add expectation for Subscriptions
    expect(response.body.Subscriptions).toBeDefined();
    expect(Array.isArray(response.body.Subscriptions)).toBe(true);
    expect(response.body.Subscriptions.length).toBe(0); // Expecting empty array for test user
  });

  it('/users/:id (PATCH) - should update a user', async () => {
    const updateUserDto: UpdateUserDto = { name: 'Updated Test User' };
    const response = await request(app.getHttpServer())
      .patch(`/users/${createdUserId}`)
      .send(updateUserDto)
      .expect(200);

    expect(response.body).toBeDefined();
    expect(response.body.id).toEqual(createdUserId);
    expect(response.body.name).toEqual(updateUserDto.name);
    expect(response.body.email).toEqual(createUserDto.email); // Email shouldn't change
    expect(response.body.password).toBeUndefined(); 
  });

  it('/users/:id (DELETE) - should delete a user', async () => {
    await request(app.getHttpServer())
      .delete(`/users/${createdUserId}`)
      .expect(200);

    // Verify the user is deleted
    await request(app.getHttpServer())
        .get(`/users/${createdUserId}`)
        .expect(404); // Assuming findOne throws NotFoundException or similar
  });
}); 