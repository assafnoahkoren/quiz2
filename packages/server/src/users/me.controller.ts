import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { UserService } from './users.service';
import { AuthGuard } from '../auth/auth.guard';
import { AuthedRequest } from '../auth/types/authed-request.interface';

@Controller('api/me')
@UseGuards(AuthGuard) // Only need AuthGuard, no AdminGuard as this is for the current user
export class MeController {
  constructor(private readonly userService: UserService) {}

  @Get()
  findCurrentUser(@Req() request: AuthedRequest) {
    const userId = request.user.id;
    return this.userService.findOne(userId);
  }
} 