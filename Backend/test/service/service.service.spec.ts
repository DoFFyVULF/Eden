/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ServiceService } from 'src/service/service.service';
import { PrismaService } from 'src/prisma.service';
import { ServiceDto } from 'src/service/dto/service.dto';
import { UpdateServiceDto } from 'src/service/dto/update-service.dto';

describe('ServiceService', () => {
  let service: ServiceService;
  let prisma: PrismaService;

  const mockService = {
    id: 1,
    title: 'Haircut',
    description: 'Professional haircut',
    duration: 60,
    isActive: true,
    img: 'haircut.jpg',
    categoryId: 1,
    category: { id: 1, title: 'Hair Services' },
  };

  const mockServiceDto: ServiceDto = {
    title: 'Haircut',
    description: 'Professional haircut',
    duration: 60,
    isActive: true,
    img: 'haircut.jpg',
    categoryId: 1,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServiceService,
        {
          provide: PrismaService,
          useValue: {
            service: {
              findUnique: jest.fn(),
              findMany: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              count: jest.fn(),
            },
            category: {
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<ServiceService>(ServiceService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getById', () => {
    it('should return service by id', async () => {
      (prisma.service.findUnique as jest.Mock).mockResolvedValue(mockService);

      const result = await service.getById(1);

      expect(result).toEqual(mockService);
      expect(prisma.service.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { category: true },
      });
    });

    it('should throw NotFoundException if service not found', async () => {
      (prisma.service.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.getById(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create service successfully', async () => {
      (prisma.service.create as jest.Mock).mockResolvedValue(mockService);

      const result = await service.create(mockServiceDto);

      expect(result).toEqual(mockService);
      expect(prisma.service.create).toHaveBeenCalledWith({
        data: {
          title: 'Haircut',
          description: 'Professional haircut',
          duration: 60,
          isActive: true,
          img: 'haircut.jpg',
          category: { connect: { id: 1 } },
        },
        include: { category: true },
      });
    });

    it('should create service with default isActive', async () => {
      const dtoWithoutActive: ServiceDto = {
        title: 'Beard Trim',
        description: 'Professional beard trim',
        duration: 30,
        img: 'beard.jpg',
        categoryId: 1,
      };

      (prisma.service.create as jest.Mock).mockResolvedValue({
        ...mockService,
        ...dtoWithoutActive,
      });

      await service.create(dtoWithoutActive);

      expect(prisma.service.create).toHaveBeenCalledWith({
        data: {
          title: 'Beard Trim',
          description: 'Professional beard trim',
          duration: 30,
          isActive: true,
          img: 'beard.jpg',
          category: { connect: { id: 1 } },
        },
        include: { category: true },
      });
    });
  });

  describe('update', () => {
    const updateDto: UpdateServiceDto = {
      title: 'Updated Haircut',
    };

    it('should update service successfully', async () => {
      (prisma.service.findUnique as jest.Mock).mockResolvedValue(mockService);
      (prisma.service.update as jest.Mock).mockResolvedValue({
        ...mockService,
        ...updateDto,
      });

      const result = await service.update(1, updateDto);

      expect(result.title).toBe('Updated Haircut');
      expect(prisma.service.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateDto,
      });
    });

    it('should throw NotFoundException if service not found', async () => {
      (prisma.service.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.update(1, updateDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getAll', () => {
    it('should return all services', async () => {
      const services = [mockService];
      (prisma.service.findMany as jest.Mock).mockResolvedValue(services);

      const result = await service.getAll();

      expect(result).toEqual(services);
      expect(prisma.service.findMany).toHaveBeenCalledWith({
        include: { category: true },
        orderBy: { id: 'asc' },
      });
    });
  });

  describe('delete', () => {
    it('should delete service successfully', async () => {
      (prisma.service.findUnique as jest.Mock).mockResolvedValue(mockService);
      (prisma.service.delete as jest.Mock).mockResolvedValue(mockService);

      const result = await service.delete(1);

      expect(result).toEqual(mockService);
      expect(prisma.service.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw NotFoundException if service not found', async () => {
      (prisma.service.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.delete(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('count', () => {
    it('should return total count', async () => {
      (prisma.service.count as jest.Mock).mockResolvedValue(15);

      const result = await service.count();

      expect(result).toBe(15);
    });
  });
});
