/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { MasterService } from 'src/master/master.service';
import { PrismaService } from 'src/prisma.service';
import { MasterDto } from 'src/master/dto/master.dto';
import { UpdateMasterDto } from 'src/master/dto/update-master.dto';

describe('MasterService', () => {
  let service: MasterService;
  let prisma: PrismaService;

  const mockMaster = {
    id: 1,
    surname: 'Ivanov',
    name: 'Ivan',
    middlename: 'Ivanovich',
    specialization: 'Hairdresser',
    photo: 'photo.jpg',
    phone: '+79001234567',
    isActive: true,
  };

  const mockMasterDto: MasterDto = {
    surname: 'Ivanov',
    name: 'Ivan',
    middlename: 'Ivanovich',
    specialization: 'Hairdresser',
    photo: 'photo.jpg',
    phone: '+79001234567',
    isActive: true,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MasterService,
        {
          provide: PrismaService,
          useValue: {
            master: {
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

    service = module.get<MasterService>(MasterService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAll', () => {
    it('should return all masters', async () => {
      const masters = [mockMaster];
      (prisma.master.findMany as jest.Mock).mockResolvedValue(masters);

      const result = await service.getAll();

      expect(result).toEqual(masters);
      expect(prisma.master.findMany).toHaveBeenCalledWith({
        orderBy: { id: 'asc' },
      });
    });
  });

  describe('getById', () => {
    it('should return master by id', async () => {
      (prisma.master.findUnique as jest.Mock).mockResolvedValue(mockMaster);

      const result = await service.getById(1);

      expect(result).toEqual(mockMaster);
      expect(prisma.master.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });

  describe('getActiveMastersCount', () => {
    it('should return count of active masters', async () => {
      (prisma.master.count as jest.Mock).mockResolvedValue(5);

      const result = await service.getActiveMastersCount();

      expect(result).toBe(5);
      expect(prisma.master.count).toHaveBeenCalledWith({ where: { isActive: true } });
    });
  });

  describe('create', () => {
    it('should create master successfully', async () => {
      (prisma.master.create as jest.Mock).mockResolvedValue(mockMaster);

      const result = await service.create(mockMasterDto);

      expect(result).toEqual(mockMaster);
      expect(prisma.master.create).toHaveBeenCalledWith({
        data: {
          surname: 'Ivanov',
          name: 'Ivan',
          middlename: 'Ivanovich',
          specialization: 'Hairdresser',
          photo: 'photo.jpg',
          phone: '+79001234567',
          isActive: true,
        },
      });
    });

    it('should create master with default isActive', async () => {
      const dtoWithoutActive: MasterDto = {
        surname: 'Petrov',
        name: 'Petr',
        middlename: 'Petrovich',
        specialization: 'Barber',
        phone: '+79007654321',
      };

      (prisma.master.create as jest.Mock).mockResolvedValue({
        ...mockMaster,
        ...dtoWithoutActive,
      });

      await service.create(dtoWithoutActive);

      expect(prisma.master.create).toHaveBeenCalledWith({
        data: {
          surname: 'Petrov',
          name: 'Petr',
          middlename: 'Petrovich',
          specialization: 'Barber',
          photo: null,
          phone: '+79007654321',
          isActive: true,
        },
      });
    });
  });

  describe('update', () => {
    const updateDto: UpdateMasterDto = {
      name: 'Updated Name',
    };

    it('should update master successfully', async () => {
      (prisma.master.findUnique as jest.Mock).mockResolvedValue(mockMaster);
      (prisma.master.update as jest.Mock).mockResolvedValue({
        ...mockMaster,
        ...updateDto,
      });

      const result = await service.update(1, updateDto);

      expect(result.name).toBe('Updated Name');
      expect(prisma.master.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateDto,
      });
    });

    it('should throw NotFoundException if master not found', async () => {
      (prisma.master.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.update(1, updateDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete master successfully', async () => {
      (prisma.master.delete as jest.Mock).mockResolvedValue(mockMaster);

      const result = await service.delete(1);

      expect(result).toEqual(mockMaster);
      expect(prisma.master.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw NotFoundException if master not found', async () => {
      const prismaError = new Error('Record not found');
      (prismaError as any).code = 'P2025';
      (prisma.master.delete as jest.Mock).mockRejectedValue(prismaError);

      await expect(service.delete(1)).rejects.toThrow(NotFoundException);
    });

    it('should rethrow other errors', async () => {
      const prismaError = new Error('Database error');
      (prismaError as any).code = 'OTHER';
      (prisma.master.delete as jest.Mock).mockRejectedValue(prismaError);

      await expect(service.delete(1)).rejects.toThrow('Database error');
    });
  });

  describe('count', () => {
    it('should return total count', async () => {
      (prisma.master.count as jest.Mock).mockResolvedValue(10);

      const result = await service.count();

      expect(result).toBe(10);
    });
  });
});
