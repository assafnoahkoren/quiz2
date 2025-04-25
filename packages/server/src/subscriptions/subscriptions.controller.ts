import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query, UseGuards, Req } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto/update-subscription.dto';
import { AuthGuard } from '../auth/auth.guard';
import { AdminGuard } from '../auth/role.guard';
import { AuthedRequest } from '../auth/types/authed-request.interface';

@Controller('api/subscriptions')
@UseGuards(AuthGuard, AdminGuard)
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post()
  create(
    @Body() createSubscriptionDto: CreateSubscriptionDto,
    @Req() request: AuthedRequest
  ) {
    return this.subscriptionsService.create(createSubscriptionDto);
  }

  @Get()
  findByUser(@Query('userId') userId: string) {
    return this.subscriptionsService.findByUser(userId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.subscriptionsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSubscriptionDto: UpdateSubscriptionDto,
    @Req() request: AuthedRequest
  ) {
    return this.subscriptionsService.update(id, updateSubscriptionDto);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: AuthedRequest
  ) {
    return this.subscriptionsService.remove(id);
  }
}
