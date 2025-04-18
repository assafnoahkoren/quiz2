import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto } from './auth.controller';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  createJwtToken(user: User) {
    return this.jwtService.sign({ 
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
	    govExamId: user.govExamId
    }, {
      expiresIn: '90d',
    });
  }

  async register(registerDto: RegisterDto) {
    // Check if user exists
    const userExists = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (userExists) {
      throw new ConflictException('Email already registered');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Create the user
    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        name: registerDto.name,
        password: hashedPassword,
      },
    });

    // Generate JWT token
    const token = this.createJwtToken(user);

    // Return user (without password) and token
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
    };
  }

  async login(loginDto: LoginDto) {
    // Find the user with case-insensitive email search
    const user = await this.prisma.user.findFirst({
      where: { 
        email: { 
          equals: loginDto.email,
          mode: 'insensitive'
        } 
      },
    });

    // If user doesn't exist or password doesn't match
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatches = await bcrypt.compare(loginDto.password, user.password);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const token = this.createJwtToken(user);

    // Return user (without password) and token
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
    };
  }

  async refresh(user: { sub: string; email: string }) {
    // Get the user from the database
    const dbUser = await this.prisma.user.findUnique({
      where: { id: user.sub },
    });

    if (!dbUser) {
      throw new UnauthorizedException('User not found');
    }

    // Generate a new JWT token
    const token = this.createJwtToken(dbUser);

    // Return user (without password) and new token
    return {
      user: {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        role: dbUser.role,
      },
      token,
    };
  }
} 