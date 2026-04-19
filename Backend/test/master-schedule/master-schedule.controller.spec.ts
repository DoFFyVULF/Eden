/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { MasterScheduleController } from 'src/master-schedule/master-schedule.controller';
import { MasterScheduleService } from 'src/master-schedule/master-schedule.service';
import { MasterScheduleDto } from 'src/master-schedule/dto/master-schedule.dto';
import { UpdateMasterScheduleDto } from 'src/master-schedule/dto/update-master-schedule.dto';
import { MasterTimeOffDto } from 'src/master-schedule/dto/master-time-off.dto';

describe('MasterScheduleController', () => {
  let controller: MasterScheduleController;
  let masterScheduleService: MasterScheduleService;

  const mockMasterScheduleService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    count: jest.fn(),
    createTimeOff: jest.fn(),
    updateTimeOff: jest.fn(),
    getTimeOffForMaster: jest.fn(),
    getMasterCurrentStatus: jest.fn(),
    deleteTimeOff: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MasterScheduleController],
      providers: [
        {
          provide: MasterScheduleService,
          useValue: mockMasterScheduleService,
        },
      ],
    }).compile();

    controller = module.get<MasterScheduleController>(MasterScheduleController);
    masterScheduleService = module.get<MasterScheduleService>(MasterScheduleService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create schedule', async () => {
      const dto: MasterScheduleDto = {
        masterId: 1,
        startTime: '2024-01-15T09:00:00Z',
        endTime: '2024-01-15T18:00:00Z',
      };
      const result = { id: 1, ...dto };

      mockMasterScheduleService.create.mockResolvedValue(result);

      expect(await controller.create(dto)).toBe(result);
      expect(mockMasterScheduleService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should return all schedules', async () => {
      const schedules = [{ id: 1, masterId: 1 }];
      mockMasterScheduleService.findAll.mockResolvedValue(schedules);

      const result = await controller.findAll();

      expect(result).toBe(schedules);
      expect(mockMasterScheduleService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return schedule by id', async () => {
      const schedule = { id: 1, masterId: 1 };
      mockMasterScheduleService.findOne.mockResolvedValue(schedule);

      const result = await controller.findOne(1);

      expect(result).toBe(schedule);
      expect(mockMasterScheduleService.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should update schedule', async () => {
      const dto: UpdateMasterScheduleDto = { dayOfWeek: 2 };
      const result = { id: 1, ...dto };

      mockMasterScheduleService.update.mockResolvedValue(result);

      expect(await controller.update(1, dto)).toBe(result);
      expect(mockMasterScheduleService.update).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('remove', () => {
    it('should delete schedule', async () => {
      const result = { id: 1 };
      mockMasterScheduleService.remove.mockResolvedValue(result);

      expect(await controller.remove(1)).toBe(result);
      expect(mockMasterScheduleService.remove).toHaveBeenCalledWith(1);
    });
  });

  describe('createTimeOff', () => {
    it('should create time off period', async () => {
      const dto: MasterTimeOffDto = {
        startDate: '2024-02-01T00:00:00Z',
        endDate: '2024-02-14T00:00:00Z',
      };
      const result = { id: 1, ...dto };

      mockMasterScheduleService.createTimeOff.mockResolvedValue(result);

      expect(await controller.createTimeOff(1, dto)).toBe(result);
      expect(mockMasterScheduleService.createTimeOff).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('updateTimeOff', () => {
    it('should update time off period', async () => {
      const dto: MasterTimeOffDto = {
        comment: 'Updated',
        startDate: '',
        endDate: ''
      };
      const result = { id: 1, ...dto };

      mockMasterScheduleService.updateTimeOff.mockResolvedValue(result);

      expect(await controller.updateTimeOff(1, dto)).toBe(result);
      expect(mockMasterScheduleService.updateTimeOff).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('getTimeOff', () => {
    it('should return time off for master', async () => {
      const timeOffs = [{ id: 1, masterId: 1 }];
      mockMasterScheduleService.getTimeOffForMaster.mockResolvedValue(timeOffs);

      const result = await controller.getTimeOff(1);

      expect(result).toBe(timeOffs);
      expect(mockMasterScheduleService.getTimeOffForMaster).toHaveBeenCalledWith(1);
    });
  });

  describe('getMasterStatus', () => {
    it('should return master current status', async () => {
      const status = { isOnTimeOff: false, currentPeriod: null };
      mockMasterScheduleService.getMasterCurrentStatus.mockResolvedValue(status);

      const result = await controller.getMasterStatus(1);

      expect(result).toBe(status);
      expect(mockMasterScheduleService.getMasterCurrentStatus).toHaveBeenCalledWith(1);
    });
  });

  describe('deleteTimeOff', () => {
    it('should delete time off period', async () => {
      const result = { id: 1 };
      mockMasterScheduleService.deleteTimeOff.mockResolvedValue(result);

      expect(await controller.deleteTimeOff(1)).toBe(result);
      expect(mockMasterScheduleService.deleteTimeOff).toHaveBeenCalledWith(1);
    });
  });
});
