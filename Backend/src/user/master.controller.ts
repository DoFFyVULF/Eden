/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/require-await */
import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  Body,
  HttpCode,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserDto } from './dto/user.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'generated/prisma/enums';

@Auth()
@Controller('user/master')
export class MasterUserController {
  constructor(private readonly userService: UserService) {}

  @Roles(Role.admin)
  @Post()
  @HttpCode(201)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async create(@Body() dto: UserDto) {
    // dto должен содержать login, password и masterId
    return await this.userService.createByAdmin({
      ...dto,
      role: Role.master, // принудительно мастер
    });
  }

  @Roles(Role.admin)
  @Get()
  async getAll() {
    // Получаем всех пользователей с ролью MASTER
    return this.userService.getAllMasters();
  }

  @Roles(Role.admin)
  @Delete(':id')
  @HttpCode(204)
  async delete(@Param('id') id: string) {
    return this.userService.delete(Number(id));
  }
}