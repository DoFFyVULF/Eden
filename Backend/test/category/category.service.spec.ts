/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CategoryService } from 'src/category/category.service';
import { PrismaService } from 'src/prisma.service';
import { CategoryDto } from 'src/category/dto/category.dto';
import { UpdateCategoryDto } from 'src/category/dto/update-category.dto';

describe('CategoryService', () => {
  let service: CategoryService;
  let prisma: PrismaService;

  const mockCategory = {
    id: 1,
    title: 'Hair Services',
    description: 'All hair related services',
    isActive: true,
  };

  const mockCategoryDto: CategoryDto = {
    title: 'Hair Services',
    description: 'All hair related services',
    isActive: true,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        {
          provide: PrismaService,
          useValue: {
            category: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              count: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAll', () => {
    it('should return all categories with services count', async () => {
      const categories = [mockCategory];
      (prisma.category.findMany as jest.Mock).mockResolvedValue(categories);

      const result = await service.getAll();

      expect(result).toEqual(categories);
      expect(prisma.category.findMany).toHaveBeenCalledWith({
        orderBy: { title: 'asc' },
        include: {
          _count: {
            select: { services: true },
          },
        },
      });
    });
  });

  describe('getById', () => {
    it('should return category by id', async () => {
      (prisma.category.findUnique as jest.Mock).mockResolvedValue(mockCategory);

      const result = await service.getById(1);

      expect(result).toEqual(mockCategory);
      expect(prisma.category.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });

  describe('create', () => {
    it('should create category successfully', async () => {
      (prisma.category.create as jest.Mock).mockResolvedValue(mockCategory);

      const result = await service.create(mockCategoryDto);

      expect(result).toEqual(mockCategory);
      expect(prisma.category.create).toHaveBeenCalledWith({
        data: {
          title: 'Hair Services',
          description: 'All hair related services',
          isActive: true,
        },
      });
    });

    it('should create category with default isActive', async () => {
      const dtoWithoutActive: CategoryDto = {
        title: 'Nail Services',
        description: 'Nail care services',
      };

      (prisma.category.create as jest.Mock).mockResolvedValue({
        ...mockCategory,
        title: 'Nail Services',
        description: 'Nail care services',
      });

      await service.create(dtoWithoutActive);

      expect(prisma.category.create).toHaveBeenCalledWith({
        data: {
          title: 'Nail Services',
          description: 'Nail care services',
          isActive: true,
        },
      });
    });
  });

  describe('update', () => {
    const updateDto: UpdateCategoryDto = {
      title: 'Updated Title',
    };

    it('should update category successfully', async () => {
      (prisma.category.update as jest.Mock).mockResolvedValue({
        ...mockCategory,
        ...updateDto,
      });

      const result = await service.update(1, updateDto);

      expect(result.title).toBe('Updated Title');
      expect(prisma.category.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateDto,
      });
    });
  });

  describe('delete', () => {
    it('should delete category successfully', async () => {
      (prisma.category.delete as jest.Mock).mockResolvedValue(mockCategory);

      const result = await service.delete(1);

      expect(result).toEqual(mockCategory);
      expect(prisma.category.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw NotFoundException if category not found', async () => {
      const prismaError = new Error('Record not found');
      (prismaError as any).code = 'P2025';
      (prisma.category.delete as jest.Mock).mockRejectedValue(prismaError);

      await expect(service.delete(1)).rejects.toThrow(NotFoundException);
    });

    it('should rethrow other errors', async () => {
      const prismaError = new Error('Database error');
      (prismaError as any).code = 'OTHER';
      (prisma.category.delete as jest.Mock).mockRejectedValue(prismaError);

      await expect(service.delete(1)).rejects.toThrow('Database error');
    });
  });

  describe('count', () => {
    it('should return total count', async () => {
      (prisma.category.count as jest.Mock).mockResolvedValue(5);

      const result = await service.count();

      expect(result).toBe(5);
    });
  });
});
