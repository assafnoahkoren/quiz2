import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UserService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
// Assuming AuthGuard and AdminGuard are available for import
// Make sure to provide the correct path if they are not in the root
import { AuthGuard } from '../auth/auth.guard'; // Example path, adjust if needed
import { AdminGuard } from '../auth/role.guard'; // Example path, adjust if needed
import { AuthedRequest } from '../auth/types/authed-request.interface'; // Import AuthedRequest

@Controller('api/users')
@UseGuards(AuthGuard, AdminGuard) // Apply guards to all routes in this controller
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(
    @Body() createUserDto: CreateUserDto,
    @Req() request: AuthedRequest
  ) {
    // We might want to remove password details from the response here too
    return this.userService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch(':id') 
  update(
    @Param('id') id: string, 
    @Body() updateUserDto: UpdateUserDto,
    @Req() request: AuthedRequest
  ) {
    // We might want to remove password details from the response here too
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Req() request: AuthedRequest
  ) {
    return this.userService.remove(id);
  }
} 