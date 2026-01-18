// src/user/user.controller.ts
import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserDto } from './dto/user.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CurrentUser } from 'src/auth/decorators/user.decorator';
import { Role } from 'generated/prisma/enums';
import { User } from 'generated/prisma/client';

@Auth()
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Roles(Role.admin)
  @Post()
  @HttpCode(201)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async create(@Body() dto: UserDto): Promise<User> {
   
    return await this.userService.createByAdmin(dto);
  }

  @Roles(Role.admin, Role.master)
  @Get('me')
  me(@CurrentUser() user: User) {
    // явно указываем тип user
    return user;
  }
}
