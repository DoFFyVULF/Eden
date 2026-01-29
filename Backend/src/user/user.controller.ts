/* eslint-disable @typescript-eslint/no-unused-vars */
// src/user/user.controller.ts
import {
  Body,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Post,
  UsePipes,
  ValidationPipe
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

  // Создание администратора (если нужно через API)
  @Roles(Role.admin)
  @Post()
  @HttpCode(201)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async create(@Body() dto: UserDto): Promise<User> {
    return await this.userService.createByAdmin(dto);
  }

  // ПОЛУЧЕНИЕ ВСЕХ АДМИНОВ (То, что вы вызываете с фронтенда)
  @Roles(Role.admin)
  @Get('admin') // Путь будет: GET /user/admin
  async getAllAdmins() {
    return this.userService.getAllAdmins();
  }

  @Roles(Role.admin, Role.master)
  @Get('me')
  async me(@CurrentUser('id') id: number) {
    const user = await this.userService.getById(id);
    if (!user) throw new NotFoundException('Пользователь не найден');

    const { password, ...result } = user;
    return result;
  }
}
