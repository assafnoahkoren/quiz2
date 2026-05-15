import { Controller, Get, Patch, Body, UseGuards, Req } from '@nestjs/common';
import { UserService } from './users.service';
import { AuthGuard } from '../auth/auth.guard';
import { AuthedRequest } from '../auth/types/authed-request.interface';
import { UpdateMeDto } from './dto/update-me.dto';

@Controller('api/me')
@UseGuards(AuthGuard)
export class MeController {
  constructor(private readonly userService: UserService) {}

  @Get()
  findCurrentUser(@Req() request: AuthedRequest) {
    const userId = request.user.id;
    return this.userService.findOne(userId);
  }

  @Patch()
  updateCurrentUser(@Req() request: AuthedRequest, @Body() updateMeDto: UpdateMeDto) {
    const userId = request.user.id;
    return this.userService.update(userId, updateMeDto);
  }
} 