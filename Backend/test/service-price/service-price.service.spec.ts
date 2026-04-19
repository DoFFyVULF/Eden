/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ServicePriceService } from 'src/service-price/service-price.service';
import { PrismaService } from 'src/prisma.service';
import { ServicePriceDto } from 'src/service-price/dto/service-price.dto';
import { UpdateServicePriceDto } from 'src/service-price/dto/update-service-price.dto';

describe('ServicePriceService', () => {
  let service: ServicePriceService;
  let prisma: PrismaService;

  const mockServicePrice = {
    id: 1,
    serviceId: 1,
    masterID: 1,
    price: 1000,
    isActive: true,
    durationOverride: 60,
    service: { id: 1, title: 'Haircut' },
    master: { id: 1, name: 'Master One' },
  };

  const mockServicePriceDto: ServicePriceDto = {
    serviceId: 1,
    masterId: 1,
    price: 1000,
    isActive: true,
    durationOverride: 60,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServicePriceService,
        {
          provide: PrismaService,
          useValue: {
            servicePrice: {
              findUnique: jest.fn(),
              findMany: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              count: jest.fn(),
            },
            service: {
              findUnique: jest.fn(),
            },
            master: {
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<ServicePriceService>(ServicePriceService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getById', () => {
    it('should return service price by id', async () => {
      (prisma.servicePrice.findUnique as jest.Mock).mockResolvedValue(mockServicePrice);

      const result = await service.getById(1);

      expect(result).toEqual({
        ...mockServicePrice,
        price: 1000,
        durationOverride: 60,
      });
      expect(prisma.servicePrice.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { service: true, master: true },
      });
    });

    it('should throw NotFoundException if service price not found', async () => {
      (prisma.servicePrice.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.getById(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getByMaster', () => {
    it('should return all service prices for master', async () => {
      const prices = [mockServicePrice];
      (prisma.servicePrice.findMany as jest.Mock).mockResolvedValue(prices);

      const result = await service.getByMaster(1);

      expect(result).toEqual([{
        ...mockServicePrice,
        price: 1000,
        durationOverride: 60,
      }]);
      expect(prisma.servicePrice.findMany).toHaveBeenCalledWith({
        where: { masterID: 1 },
        include: { service: true, master: true },
        orderBy: { id: 'asc' },
      });
    });
  });

  describe('create', () => {
    it('should create service price successfully', async () => {
      (prisma.service.findUnique as jest.Mock).mockResolvedValue({ id: 1 });
      (prisma.master.findUnique as jest.Mock).mockResolvedValue({ id: 1 });
      (prisma.servicePrice.create as jest.Mock).mockResolvedValue(mockServicePrice);

      const result = await service.create(mockServicePriceDto);

      expect(result).toEqual({
        ...mockServicePrice,
        price: 1000,
        durationOverride: 60,
      });
      expect(prisma.servicePrice.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException if service not found', async () => {
      (prisma.service.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.create(mockServicePriceDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if master not found', async () => {
      (prisma.service.findUnique as jest.Mock).mockResolvedValue({ id: 1 });
      (prisma.master.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.create(mockServicePriceDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateDto: UpdateServicePriceDto = {
      price: 1500,
    };

    it('should update service price successfully', async () => {
      (prisma.servicePrice.findUnique as jest.Mock).mockResolvedValue(mockServicePrice);
      (prisma.servicePrice.update as jest.Mock).mockResolvedValue({
        ...mockServicePrice,
        price: 1500,
      });

      const result = await service.update(1, updateDto);

      expect(result.price).toBe(1500);
      expect(prisma.servicePrice.update).toHaveBeenCalled();
    });

    it('should throw NotFoundException if service price not found', async () => {
      (prisma.servicePrice.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.update(1, updateDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getAll', () => {
    it('should return all service prices', async () => {
      const prices = [mockServicePrice];
      (prisma.servicePrice.findMany as jest.Mock).mockResolvedValue(prices);

      const result = await service.getAll();

      expect(result).toEqual([{
        ...mockServicePrice,
        price: 1000,
        durationOverride: 60,
      }]);
      expect(prisma.servicePrice.findMany).toHaveBeenCalledWith({
        include: { master: true, service: true },
        orderBy: { id: 'asc' },
      });
    });
  });

  describe('delete', () => {
    it('should delete service price', async () => {
      (prisma.servicePrice.findUnique as jest.Mock).mockResolvedValue(mockServicePrice);
      (prisma.servicePrice.delete as jest.Mock).mockResolvedValue(mockServicePrice);

      const result = await service.delete(1);

      expect(result).toEqual(mockServicePrice);
      expect(prisma.servicePrice.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw NotFoundException if service price not found', async () => {
      (prisma.servicePrice.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.delete(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('count', () => {
    it('should return total count', async () => {
      (prisma.servicePrice.count as jest.Mock).mockResolvedValue(20);

      const result = await service.count();

      expect(result).toBe(20);
    });
  });

  describe('getAveragePrice', () => {
    it('should return average price', async () => {
      const prices = [
        { price: 1000 },
        { price: 1500 },
        { price: 2000 },
      ];
      (prisma.servicePrice.findMany as jest.Mock).mockResolvedValue(prices);

      const result = await service.getAveragePrice();

      expect(result).toBe(1500);
    });

    it('should return 0 if no prices', async () => {
      (prisma.servicePrice.findMany as jest.Mock).mockResolvedValue([]);

      const result = await service.getAveragePrice();

      expect(result).toBe(0);
    });
  });
});
