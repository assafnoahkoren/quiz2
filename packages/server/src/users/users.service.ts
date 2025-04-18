import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    return this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
      },
      select: { id: true, email: true, name: true, createdAt: true, updatedAt: true }, // Exclude password from response
    });
  }

  findAll() {
    return this.prisma.user.findMany({
      select: { id: true, email: true, name: true, createdAt: true, updatedAt: true }, // Exclude password from response
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { 
        Subscriptions: true // Corrected relation name to plural
      }
    });
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    const { password, ...result } = user;
    return result;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const data = { ...updateUserDto };
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    try {
      return await this.prisma.user.update({
        where: { id },
        data,
        select: { id: true, email: true, name: true, createdAt: true, updatedAt: true }, // Exclude password from response
      });
    } catch (error) {
      // Handle potential Prisma errors, e.g., record not found
      if (error.code === 'P2025') {
        throw new NotFoundException(`User with ID "${id}" not found`);
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.user.delete({
        where: { id },
        select: { id: true }, // Only select id for confirmation
      });
      return { message: `User with ID "${id}" deleted successfully` };
    } catch (error) {
      // Handle potential Prisma errors, e.g., record not found
      if (error.code === 'P2025') {
        throw new NotFoundException(`User with ID "${id}" not found`);
      }
      throw error;
    }
  }
} 