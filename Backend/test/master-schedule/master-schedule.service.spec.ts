/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { MasterScheduleService } from 'src/master-schedule/master-schedule.service';
import { PrismaService } from 'src/prisma.service';
import { MasterScheduleDto } from 'src/master-schedule/dto/master-schedule.dto';
import { UpdateMasterScheduleDto } from 'src/master-schedule/dto/update-master-schedule.dto';
import { MasterTimeOffDto, TimeOffType } from 'src/master-schedule/dto/master-time-off.dto';

describe('MasterScheduleService', () => {
  let service: MasterScheduleService;
  let prisma: PrismaService;

  const mockSchedule = {
    id: 1,
    masterId: 1,
    dayOfWeek: 1,
    startTime: new Date('2024-01-15T09:00:00Z'),
    endTime: new Date('2024-01-15T18:00:00Z'),
    master: { id: 1, name: 'Master One' },
  };

  const mockTimeOff = {
    id: 1,
    masterId: 1,
    startDate: new Date('2024-02-01T00:00:00Z'),
    endDate: new Date('2024-02-14T00:00:00Z'),
    type: TimeOffType.VACATION,
    comment: 'Vacation',
    master: { id: 1, name: 'Master One' },
  };

  const mockMaster = {
    id: 1,
    name: 'Master One',
  };

  const mockScheduleDto: MasterScheduleDto = {
    masterId: 1,
    dayOfWeek: 1,
    startTime: '2024-01-15T09:00:00Z',
    endTime: '2024-01-15T18:00:00Z',
  };

  const mockTimeOffDto: MasterTimeOffDto = {
    startDate: '2024-02-01T00:00:00Z',
    endDate: '2024-02-14T00:00:00Z',
    type: TimeOffType.VACATION,
    comment: 'Vacation',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MasterScheduleService,
        {
          provide: PrismaService,
          useValue: {
            masterSchedule: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              count: jest.fn(),
            },
            masterTimeOff: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              findFirst: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            master: {
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<MasterScheduleService>(MasterScheduleService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create schedule successfully', async () => {
      (prisma.master.findUnique as jest.Mock).mockResolvedValue(mockMaster);
      (prisma.masterSchedule.create as jest.Mock).mockResolvedValue(mockSchedule);

      const result = await service.create(mockScheduleDto);

      expect(result).toEqual(mockSchedule);
      expect(prisma.master.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(prisma.masterSchedule.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException if master not found', async () => {
      (prisma.master.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.create(mockScheduleDto)).rejects.toThrow(NotFoundException);
    });

      it('should throw BadRequestException if end time is before start time', async () => {
      // 1. Добавляем мок, что мастер существует
      (prisma.master.findUnique as jest.Mock).mockResolvedValue(mockMaster);

      const invalidDto: MasterScheduleDto = {
        masterId: 1,
        startTime: '2024-01-15T18:00:00Z',
        endTime: '2024-01-15T09:00:00Z',
      };

      await expect(service.create(invalidDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return all schedules', async () => {
      const schedules = [mockSchedule];
      (prisma.masterSchedule.findMany as jest.Mock).mockResolvedValue(schedules);

      const result = await service.findAll();

      expect(result).toEqual(schedules);
      expect(prisma.masterSchedule.findMany).toHaveBeenCalledWith({
        include: { master: true },
        orderBy: { id: 'asc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return schedule by id', async () => {
      (prisma.masterSchedule.findUnique as jest.Mock).mockResolvedValue(mockSchedule);

      const result = await service.findOne(1);

      expect(result).toEqual(mockSchedule);
      expect(prisma.masterSchedule.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { master: true },
      });
    });

    it('should throw NotFoundException if schedule not found', async () => {
      (prisma.masterSchedule.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateDto: UpdateMasterScheduleDto = {
      dayOfWeek: 2,
    };

    it('should update schedule successfully', async () => {
      (prisma.masterSchedule.findUnique as jest.Mock).mockResolvedValue(mockSchedule);
      (prisma.masterSchedule.update as jest.Mock).mockResolvedValue({
        ...mockSchedule,
        ...updateDto,
      });

      const result = await service.update(1, updateDto);

      expect(result.dayOfWeek).toBe(2);
      expect(prisma.masterSchedule.update).toHaveBeenCalled();
    });

    it('should throw NotFoundException if schedule not found', async () => {
      (prisma.masterSchedule.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.update(1, updateDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete schedule', async () => {
      (prisma.masterSchedule.findUnique as jest.Mock).mockResolvedValue(mockSchedule);
      (prisma.masterSchedule.delete as jest.Mock).mockResolvedValue(mockSchedule);

      const result = await service.remove(1);

      expect(result).toEqual(mockSchedule);
      expect(prisma.masterSchedule.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });

  describe('count', () => {
    it('should return total count', async () => {
      (prisma.masterSchedule.count as jest.Mock).mockResolvedValue(10);

      const result = await service.count();

      expect(result).toBe(10);
    });
  });

  describe('createTimeOff', () => {
    it('should create time off successfully', async () => {
      (prisma.master.findUnique as jest.Mock).mockResolvedValue(mockMaster);
      (prisma.masterTimeOff.create as jest.Mock).mockResolvedValue(mockTimeOff);

      const result = await service.createTimeOff(1, mockTimeOffDto);

      expect(result).toEqual(mockTimeOff);
      expect(prisma.masterTimeOff.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException if master not found', async () => {
      (prisma.master.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.createTimeOff(1, mockTimeOffDto)).rejects.toThrow(NotFoundException);
    });

      it('should throw BadRequestException if end date is before start date', async () => {
      // 1. Добавляем мок, что мастер существует
      (prisma.master.findUnique as jest.Mock).mockResolvedValue(mockMaster);

      const invalidDto: MasterTimeOffDto = {
        startDate: '2024-02-14T00:00:00Z',
        endDate: '2024-02-01T00:00:00Z',
      };

      await expect(service.createTimeOff(1, invalidDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if overlapping period exists', async () => {
      (prisma.master.findUnique as jest.Mock).mockResolvedValue(mockMaster);
      (prisma.masterTimeOff.findFirst as jest.Mock).mockResolvedValue(mockTimeOff);

      await expect(service.createTimeOff(1, mockTimeOffDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('getTimeOffForMaster', () => {
    it('should return time off periods for master', async () => {
      const timeOffs = [mockTimeOff];
      (prisma.masterTimeOff.findMany as jest.Mock).mockResolvedValue(timeOffs);

      const result = await service.getTimeOffForMaster(1);

      expect(result).toEqual(timeOffs);
      expect(prisma.masterTimeOff.findMany).toHaveBeenCalledWith({
        where: { masterId: 1 },
        orderBy: { startDate: 'desc' },
      });
    });
  });

  describe('deleteTimeOff', () => {
    it('should delete time off period', async () => {
      (prisma.masterTimeOff.findUnique as jest.Mock).mockResolvedValue(mockTimeOff);
      (prisma.masterTimeOff.delete as jest.Mock).mockResolvedValue(mockTimeOff);

      const result = await service.deleteTimeOff(1);

      expect(result).toEqual(mockTimeOff);
      expect(prisma.masterTimeOff.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw NotFoundException if time off not found', async () => {
      (prisma.masterTimeOff.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.deleteTimeOff(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getMasterCurrentStatus', () => {
    it('should return status when master is on time off', async () => {
      (prisma.masterTimeOff.findFirst as jest.Mock).mockResolvedValue(mockTimeOff);

      const result = await service.getMasterCurrentStatus(1);

      expect(result.isOnTimeOff).toBe(true);
      expect(result.currentPeriod).toBeTruthy();
    });

    it('should return status when master is available', async () => {
      (prisma.masterTimeOff.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await service.getMasterCurrentStatus(1);

      expect(result.isOnTimeOff).toBe(false);
      expect(result.currentPeriod).toBeNull();
    });
  });

  describe('updateTimeOff', () => {
    const updateDto: MasterTimeOffDto = {
      comment: 'Updated comment',
      startDate: '',
      endDate: ''
    };

    it('should update time off successfully', async () => {
      (prisma.masterTimeOff.findUnique as jest.Mock).mockResolvedValue(mockTimeOff);
      (prisma.masterTimeOff.update as jest.Mock).mockResolvedValue({
        ...mockTimeOff,
        ...updateDto,
      });

      const result = await service.updateTimeOff(1, updateDto);

      expect(result.comment).toBe('Updated comment');
    });

    it('should throw NotFoundException if time off not found', async () => {
      (prisma.masterTimeOff.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.updateTimeOff(1, updateDto)).rejects.toThrow(NotFoundException);
    });
  });
});
