/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { ServiceController } from 'src/service/service.controller';
import { ServiceService } from 'src/service/service.service';
import { ServiceDto } from 'src/service/dto/service.dto';
import { UpdateServiceDto } from 'src/service/dto/update-service.dto';

describe('ServiceController', () => {
  let controller: ServiceController;
  let serviceService: ServiceService;

  const mockServiceService = {
    getById: jest.fn(),
    create: jest.fn(),
    getAll: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServiceController],
      providers: [
        {
          provide: ServiceService,
          useValue: mockServiceService,
        },
      ],
    }).compile();

    controller = module.get<ServiceController>(ServiceController);
    serviceService = module.get<ServiceService>(ServiceService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create service', async () => {
      const dto: ServiceDto = {
        title: 'Haircut',
        description: 'Professional haircut',
        duration: 60,
        categoryId: 1,
      };
      const result = { id: 1, ...dto };

      mockServiceService.create.mockResolvedValue(result);

      expect(await controller.create(dto)).toBe(result);
      expect(mockServiceService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('getAll', () => {
    it('should return all services', async () => {
      const services = [{ id: 1, title: 'Haircut' }];
      mockServiceService.getAll.mockResolvedValue(services);

      const result = await controller.getAll();

      expect(result).toBe(services);
      expect(mockServiceService.getAll).toHaveBeenCalled();
    });
  });

  describe('getById', () => {
    it('should return service by id', async () => {
      const service = { id: 1, title: 'Haircut' };
      mockServiceService.getById.mockResolvedValue(service);

      const result = await controller.getById(1);

      expect(result).toBe(service);
      expect(mockServiceService.getById).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should update service', async () => {
      const dto: UpdateServiceDto = { title: 'Updated Haircut' };
      const result = { id: 1, ...dto };

      mockServiceService.update.mockResolvedValue(result);

      expect(await controller.update(1, dto)).toBe(result);
      expect(mockServiceService.update).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('delete', () => {
    it('should delete service', async () => {
      const result = { id: 1 };
      mockServiceService.delete.mockResolvedValue(result);

      expect(await controller.delete(1)).toBe(result);
      expect(mockServiceService.delete).toHaveBeenCalledWith(1);
    });
  });
});
