/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CategoryController } from 'src/category/category.controller';
import { CategoryService } from 'src/category/category.service';
import { CategoryDto } from 'src/category/dto/category.dto';
import { UpdateCategoryDto } from 'src/category/dto/update-category.dto';

describe('CategoryController', () => {
  let controller: CategoryController;
  let categoryService: CategoryService;

  const mockCategoryService = {
    getAll: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryController],
      providers: [
        {
          provide: CategoryService,
          useValue: mockCategoryService,
        },
      ],
    }).compile();

    controller = module.get<CategoryController>(CategoryController);
    categoryService = module.get<CategoryService>(CategoryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAll', () => {
    it('should return all categories', async () => {
      const categories = [{ id: 1, title: 'Hair Services' }];
      mockCategoryService.getAll.mockResolvedValue(categories);

      const result = await controller.getAll();

      expect(result).toBe(categories);
      expect(mockCategoryService.getAll).toHaveBeenCalled();
    });
  });

  describe('getById', () => {
    it('should return category by id', async () => {
      const category = { id: 1, title: 'Hair Services' };
      mockCategoryService.getById.mockResolvedValue(category);

      const result = await controller.getById(1);

      expect(result).toBe(category);
      expect(mockCategoryService.getById).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if category not found', async () => {
      mockCategoryService.getById.mockResolvedValue(null);

      await expect(controller.getById(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create category', async () => {
      const dto: CategoryDto = {
        title: 'Hair Services',
        description: 'All hair services',
      };
      const result = { id: 1, ...dto };

      mockCategoryService.create.mockResolvedValue(result);

      expect(await controller.create(dto)).toBe(result);
      expect(mockCategoryService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('update', () => {
    it('should update category', async () => {
      const dto: UpdateCategoryDto = { title: 'Updated Title' };
      const result = { id: 1, ...dto };

      mockCategoryService.update.mockResolvedValue(result);

      expect(await controller.update(1, dto)).toBe(result);
      expect(mockCategoryService.update).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('delete', () => {
    it('should delete category', async () => {
      mockCategoryService.delete.mockResolvedValue({ id: 1 });

      const response = await controller.delete(1);

      expect(response).toEqual({ message: 'Категория с ID 1 успешно удалена' });
      expect(mockCategoryService.delete).toHaveBeenCalledWith(1);
    });
  });
});
