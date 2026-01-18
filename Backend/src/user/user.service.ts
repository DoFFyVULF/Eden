// src/user/user.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { hash } from 'argon2';
import { UserDto } from './dto/user.dto';
import { Role } from 'generated/prisma/enums';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getById(id: number) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async getByLogin(login: string) {
    return this.prisma.user.findUnique({ where: { login } });
  }

  /**
   * 🔐 Создание пользователя администратором
   */
  async createByAdmin(dto: UserDto) {
    const exists = await this.getByLogin(dto.login);
    if (exists) {
      throw new BadRequestException('Пользователь уже существует');
    }

    // 🧠 Бизнес-валидация ролей
    if (dto.role === Role.master && !dto.masterId) {
      throw new BadRequestException(
        'Для роли MASTER необходимо указать masterId'
      );
    }

    if (dto.role === Role.admin && dto.masterId) {
      throw new BadRequestException(
        'Администратор не может быть привязан к мастеру'
      );
    }

    // Проверяем мастера
    if (dto.masterId) {
      const master = await this.prisma.master.findUnique({
        where: { id: dto.masterId }
      });

      if (!master) {
        throw new NotFoundException('Мастер не найден');
      }
    }

    return this.prisma.user.create({
      data: {
        login: dto.login,
        password: await hash(dto.password),
        role: dto.role,
        name: dto.name,
        masterId: dto.masterId ?? null,
        isActive: true
      }
    });
  }

  async getAllMasters() {
    return this.prisma.user.findMany({ where: { role: Role.master } });
  }

  async delete(id: number) {
    return this.prisma.user.delete({ where: { id } });
  }

  async count(): Promise<number> {
    return this.prisma.user.count();
  }
}
