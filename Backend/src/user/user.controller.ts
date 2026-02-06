import {
  Body,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Post,
  Put,
  Param,
  UsePipes,
  ValidationPipe
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserDto, ChangePasswordDto } from './dto/user.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CurrentUser } from 'src/auth/decorators/user.decorator';
import { Role } from 'generated/prisma/enums';
import { User } from 'generated/prisma/client';

@Auth()
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Создание администратора
  @Roles(Role.admin)
  @Post()
  @HttpCode(201)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async create(@Body() dto: UserDto): Promise<User> {
    return await this.userService.createByAdmin(dto);
  }

  // ПОЛУЧЕНИЕ ВСЕХ АДМИНОВ
  @Roles(Role.admin)
  @Get('admin')
  async getAllAdmins() {
    return this.userService.getAllAdmins();
  }

  @Roles(Role.admin, Role.master)
  @Get('me')
  async me(@CurrentUser('id') id: number) {
    const user = await this.userService.getById(id);
    if (!user) throw new NotFoundException('Пользователь не найден');

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    return result;
  }

  /**
   * 🔐 Изменение пароля текущего пользователя
   * PUT /user/me/password
   */
  @Roles(Role.admin, Role.master)
  @Put('me/password')
  @HttpCode(200)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async changeMyPassword(
    @CurrentUser('id') userId: number,
    @Body() dto: ChangePasswordDto
  ) {
    return this.userService.changePassword(userId, dto);
  }

  /**
   * 🔐 Сброс пароля другого пользователя (только админ)
   * PUT /user/:id/password
   */
  @Roles(Role.admin)
  @Put(':id/password')
  @HttpCode(200)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async resetPassword(
    @Param('id') id: string,
    @Body() dto: ChangePasswordDto
  ) {
    return this.userService.changePassword(Number(id), dto);
  }
}