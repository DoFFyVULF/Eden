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
  Put
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserDto, ChangePasswordDto } from './dto/user.dto';
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
    return await this.userService.createByAdmin({
      ...dto,
      role: Role.master,
    });
  }

  @Roles(Role.admin)
  @Get()
  async getAll() {
    return this.userService.getAllMasters();
  }

  @Roles(Role.admin)
  @Delete(':id')
  @HttpCode(204)
  async delete(@Param('id') id: string) {
    return this.userService.delete(Number(id));
  }

  /**
   * 🔐 Изменение пароля мастера
   * PUT /user/master/:id/password
   */
  @Roles(Role.admin)
  @Put(':id/password')
  @HttpCode(200)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async changeMasterPassword(
    @Param('id') id: string,
    @Body() dto: ChangePasswordDto
  ) {
    return this.userService.changePassword(Number(id), dto);
  }
}