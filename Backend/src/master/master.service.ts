import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { MasterDto } from './dto/master.dto';
import { UpdateMasterDto } from './dto/update-master.dto';

@Injectable()
export class MasterService {
  constructor(private prisma: PrismaService) {}

  async getAll() {
    return this.prisma.master.findMany({
      orderBy: { id: 'asc' }
    });
  }

  async getById(id: number) {
    return this.prisma.master.findUnique({ where: { id } });
  }

  async getActiveMastersCount(): Promise<number> {
    return this.prisma.master.count({ where: { isActive: true } });
  }

  async create(dto: MasterDto) {
    const master = {
      surname: dto.surname,
      name: dto.name,
      middlename: dto.middlename,
      specialization: dto.specialization,
      photo: dto.photo || null,
      phone: dto.phone,
      isActive: dto.isActive ?? true
    };

    return this.prisma.master.create({ data: master });
  }

  async update(id: number, dto: UpdateMasterDto) {
    const existingMaster = await this.prisma.master.findUnique({
      where: { id }
    });

    if (!existingMaster) {
      throw new NotFoundException(`Мастер с ID ${id} не найден`);
    }

    return this.prisma.master.update({
      where: { id },
      data: dto
    });
  }

  async delete(id: number) {
    try {
      return await this.prisma.master.delete({
        where: { id }
      });
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (error.code === 'P2025') {
        throw new NotFoundException(`Мастер с ID ${id} не найден`);
      }
      throw error;
    }
  }

  async count(): Promise<number> {
    return this.prisma.master.count();
  }
}
