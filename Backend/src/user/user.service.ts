import { Injectable } from '@nestjs/common';
import { hash } from 'argon2';
import { AuthDto } from 'src/auth/dto/auth.dto';
import { PrismaService } from 'src/prisma.service';
import { UserDto } from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getById(id: number) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  getByLogin(login: string) {
    return this.prisma.user.findUnique({ where: { login } });
  }

  async create(dto: AuthDto) {
    const user = {
      login: dto.login,
      password: await hash(dto.password),
      isActive: true
    };

    return this.prisma.user.create({ data: user });
  }

  async update(id: number, dto: UserDto) {
    let data = dto;

    if (dto.password) {
      data = { ...dto, password: await hash(dto.password) };

      return this.prisma.user.update({ where: { id }, data });
    }
  }
}
