import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { ServiceDto } from './dto/service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServiceService {
  constructor(private readonly prisma: PrismaService) {}

  async getById(id: number) {
    const service = await this.prisma.service.findUnique({
      where: { id },
      include: { category: true }, 
    });

    if (!service) {
      throw new NotFoundException(`Услуга с ID ${id} не найдена`);
    }

    return service;
  }

  async create(dto: ServiceDto) {
    return this.prisma.service.create({
      data: {
        title: dto.title,
        description: dto.description,
        duration: dto.duration,
        isActive: dto.isActive ?? true,
        category: { connect: { id: dto.categoryId } },
      },
      include: { category: true },
    });
  }

  async update(id: number, dto: UpdateServiceDto) {
    await this.getById(id); 
    return this.prisma.service.update({
      where: { id },
      data: dto,
    });
  }

  async getAll() {
    return this.prisma.service.findMany({
      include: { category: true },
      orderBy: { id: 'asc' },
    });
  }

  async delete(id: number) {
    await this.getById(id);
    return this.prisma.service.delete({ where: { id } });
  }
}
