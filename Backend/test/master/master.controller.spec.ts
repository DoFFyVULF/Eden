/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { MasterController } from 'src/master/master.controller';
import { MasterService } from 'src/master/master.service';
import { MasterDto } from 'src/master/dto/master.dto';
import { UpdateMasterDto } from 'src/master/dto/update-master.dto';

describe('MasterController', () => {
  let controller: MasterController;
  let masterService: MasterService;

  const mockMasterService = {
    getAll: jest.fn(),
    getById: jest.fn(),
    getActiveMastersCount: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MasterController],
      providers: [
        {
          provide: MasterService,
          useValue: mockMasterService,
        },
      ],
    }).compile();

    controller = module.get<MasterController>(MasterController);
    masterService = module.get<MasterService>(MasterService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAll', () => {
    it('should return all masters', async () => {
      const masters = [{ id: 1, name: 'Master One' }];
      mockMasterService.getAll.mockResolvedValue(masters);

      const result = await controller.getAll();

      expect(result).toBe(masters);
      expect(mockMasterService.getAll).toHaveBeenCalled();
    });
  });

  describe('getById', () => {
    it('should return master by id', async () => {
      const master = { id: 1, name: 'Master One' };
      mockMasterService.getById.mockResolvedValue(master);

      const result = await controller.getById(1);

      expect(result).toEqual({ data: master });
      expect(mockMasterService.getById).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if master not found', async () => {
      mockMasterService.getById.mockResolvedValue(null);

      await expect(controller.getById(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create master', async () => {
      const dto: MasterDto = {
        surname: 'Ivanov',
        name: 'Ivan',
        specialization: 'Hairdresser',
        phone: '+79001234567',
        middlename: ''
      };
      const result = { id: 1, ...dto };

      mockMasterService.create.mockResolvedValue(result);

      expect(await controller.create(dto)).toBe(result);
      expect(mockMasterService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('update', () => {
    it('should update master', async () => {
      const dto: UpdateMasterDto = { name: 'Updated Name' };
      const result = { id: 1, ...dto };

      mockMasterService.update.mockResolvedValue(result);

      expect(await controller.update(1, dto)).toBe(result);
      expect(mockMasterService.update).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('delete', () => {
    it('should delete master successfully', async () => {
      const result = { id: 1 };
      mockMasterService.delete.mockResolvedValue(result);

      const response = await controller.delete(1);

      expect(response).toEqual({ message: 'Мастер с ID 1 успешно удалён' });
      expect(mockMasterService.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if master not found', async () => {
      mockMasterService.delete.mockResolvedValue(null);

      await expect(controller.delete(1)).rejects.toThrow(NotFoundException);
    });
  });
});
