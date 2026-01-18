import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CategoryDto } from './dto/category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  async getAll() {
    return this.prisma.category.findMany({
      orderBy: { title: 'asc' }
    });
  }

  async getById(id: number) {
    return this.prisma.category.findUnique({ where: { id } });
  }

  async create(dto: CategoryDto) {
    const category = {
      title: dto.title,
      isActive: dto.isActive ?? true // значение по умолчанию
    };

    return this.prisma.category.create({ data: category });
  }

  async update(id: number, dto: UpdateCategoryDto) {
    return this.prisma.category.update({ where: { id }, data: dto });
  }

  async delete(id: number) {
    try {
      return await this.prisma.category.delete({
        where: { id }
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Категория с ID ${id} не найдена`);
      }
      throw error;
    }
  }

  async count(): Promise<number> {
    return this.prisma.category.count();
  }
}
