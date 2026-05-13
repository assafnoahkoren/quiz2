import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';
import { GetUsersQueryDto, UserSortBy } from './dto/get-users-query.dto';

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
      select: { id: true, email: true, name: true, role: true, createdAt: true, updatedAt: true }, // Include role in response
    });
  }

  async findAll(query: GetUsersQueryDto) {
    const { page, pageSize, search, role, subscriptionStatus, sortBy, sortOrder } = query;
    const skip = (page - 1) * pageSize;

    const now = new Date();

    const where: Parameters<typeof this.prisma.user.findMany>[0]['where'] = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(role && { role }),
      ...(subscriptionStatus === 'active' && {
        Subscriptions: { some: { expiresAt: { gt: now } } },
      }),
      ...(subscriptionStatus === 'inactive' && {
        Subscriptions: { none: { expiresAt: { gt: now } } },
      }),
    };

    const SORT_MAP: Record<UserSortBy, Prisma.UserOrderByWithRelationInput> = {
      [UserSortBy.name]: { name: sortOrder },
      [UserSortBy.email]: { email: sortOrder },
      [UserSortBy.createdAt]: { createdAt: sortOrder },
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          Subscriptions: true,
        },
        orderBy: SORT_MAP[sortBy],
        skip,
        take: pageSize,
      }),
      this.prisma.user.count({ where }),
    ]);

    return { data, total, page, pageSize };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { 
        Subscriptions: true
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
        select: { id: true, email: true, name: true, role: true, createdAt: true, updatedAt: true }, // Include role in response
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