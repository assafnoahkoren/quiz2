import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { UserService } from './users.service';
import { AuthGuard } from '../auth/auth.guard';
import { Request } from 'express';

@Controller('api/me')
@UseGuards(AuthGuard) // Only need AuthGuard, no AdminGuard as this is for the current user
export class MeController {
  constructor(private readonly userService: UserService) {}

  @Get()
  findCurrentUser(@Req() request: Request) {
    const userId = request['user'].sub; // Extract user ID from JWT payload
    return this.userService.findOne(userId);
  }
} 