/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { ServicePriceController } from 'src/service-price/service-price.controller';
import { ServicePriceService } from 'src/service-price/service-price.service';
import { ServicePriceDto } from 'src/service-price/dto/service-price.dto';
import { UpdateServicePriceDto } from 'src/service-price/dto/update-service-price.dto';

describe('ServicePriceController', () => {
  let controller: ServicePriceController;
  let servicePriceService: ServicePriceService;

  const mockServicePriceService = {
    getById: jest.fn(),
    getByMaster: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    getAll: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    getAveragePrice: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServicePriceController],
      providers: [
        {
          provide: ServicePriceService,
          useValue: mockServicePriceService,
        },
      ],
    }).compile();

    controller = module.get<ServicePriceController>(ServicePriceController);
    servicePriceService = module.get<ServicePriceService>(ServicePriceService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create service price', async () => {
      const dto: ServicePriceDto = {
        serviceId: 1,
        masterId: 1,
        price: 1000,
      };
      const result = { id: 1, ...dto };

      mockServicePriceService.create.mockResolvedValue(result);

      expect(await controller.create(dto)).toBe(result);
      expect(mockServicePriceService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('getAll', () => {
    it('should return all service prices', async () => {
      const prices = [{ id: 1, price: 1000 }];
      mockServicePriceService.getAll.mockResolvedValue(prices);

      const result = await controller.getAll();

      expect(result).toBe(prices);
      expect(mockServicePriceService.getAll).toHaveBeenCalled();
    });
  });

  describe('getByMaster', () => {
    it('should return service prices by master', async () => {
      const prices = [{ id: 1, price: 1000 }];
      mockServicePriceService.getByMaster.mockResolvedValue(prices);

      const result = await controller.getByMaster(1);

      expect(result).toBe(prices);
      expect(mockServicePriceService.getByMaster).toHaveBeenCalledWith(1);
    });
  });

  describe('getById', () => {
    it('should return service price by id', async () => {
      const price = { id: 1, price: 1000 };
      mockServicePriceService.getById.mockResolvedValue(price);

      const result = await controller.getById(1);

      expect(result).toBe(price);
      expect(mockServicePriceService.getById).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should update service price', async () => {
      const dto: UpdateServicePriceDto = { price: 1500 };
      const result = { id: 1, ...dto };

      mockServicePriceService.update.mockResolvedValue(result);

      expect(await controller.update(1, dto)).toBe(result);
      expect(mockServicePriceService.update).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('delete', () => {
    it('should delete service price', async () => {
      const result = { id: 1 };
      mockServicePriceService.delete.mockResolvedValue(result);

      expect(await controller.delete(1)).toBe(result);
      expect(mockServicePriceService.delete).toHaveBeenCalledWith(1);
    });
  });

  describe('getAveragePrice', () => {
    it('should return average price', async () => {
      mockServicePriceService.getAveragePrice.mockResolvedValue(1500);

      const result = await controller.getAveragePrice();

      expect(result).toBe(1500);
      expect(mockServicePriceService.getAveragePrice).toHaveBeenCalled();
    });
  });
});
