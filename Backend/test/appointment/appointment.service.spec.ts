/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  BadRequestException,
  HttpException
} from '@nestjs/common';
import { AppointmentService } from 'src/appointment/appointment.service';
import { PrismaService } from 'src/prisma.service';
import { AppointmentDto } from 'src/appointment/dto/appointment.dto';
import { UpdateAppointmentDto } from 'src/appointment/dto/update-appointment.dto';
import { AppointmentStatus } from 'generated/prisma/enums';
import { AppointmentStreamService } from 'src/appointment/appointment-stream.service';
import { PublicAppointmentMetadata } from 'src/appointment/appointment.service';

describe('AppointmentService', () => {
  let service: AppointmentService;
  let prisma: PrismaService;

  const mockAppointment = {
    id: 1,
    clientSurname: 'Ivanov',
    clientName: 'Ivan',
    clientPhone: '+79001234567',
    masterID: 1,
    serviceId: 1,
    appointmentTime: new Date('2024-01-15T10:00:00Z'),
    price: 1000,
    status: AppointmentStatus.Новый,
    master: { id: 1, name: 'Master One' },
    service: { id: 1, title: 'Haircut' },
  };

  const mockMaster = {
    id: 1,
    name: 'Master One',
  };

  const mockService = {
    id: 1,
    title: 'Haircut',
  };

  const mockAppointmentDto: AppointmentDto = {
    clientSurname: 'Ivanov',
    clientName: 'Ivan',
    clientPhone: '+79001234567',
    masterId: 1,
    serviceId: 1,
    appointmentTime: '2024-01-15T10:00:00Z',
    price: 1000,
    status: AppointmentStatus.Новый,
  };

  const publicMetadata: PublicAppointmentMetadata = {
    clientIp: '127.0.0.1',
    clientFingerprint: 'device-1'
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentService,
        {
          provide: PrismaService,
          useValue: {
            appointment: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              findFirst: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              count: jest.fn(),
            },
            master: {
              findUnique: jest.fn(),
            },
            service: {
              findUnique: jest.fn(),
            },
          },
        },
        {
          provide: AppointmentStreamService,
          useValue: {
            emitNewAppointment: jest.fn()
          }
        }
      ],
    }).compile();

    service = module.get<AppointmentService>(AppointmentService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createPublic', () => {
    it('should create public appointment successfully', async () => {
      (prisma.master.findUnique as jest.Mock).mockResolvedValue(mockMaster);
      (prisma.service.findUnique as jest.Mock).mockResolvedValue(mockService);
      (prisma.appointment.count as jest.Mock).mockResolvedValue(0);
      (prisma.appointment.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.appointment.create as jest.Mock).mockResolvedValue(mockAppointment);

      const result = await service.createPublic(
        mockAppointmentDto,
        publicMetadata
      );

      expect(result).toEqual(mockAppointment);
      expect(prisma.master.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(prisma.service.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(prisma.appointment.count).toHaveBeenCalled();
      expect(prisma.appointment.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException if master not found', async () => {
      (prisma.master.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        service.createPublic(mockAppointmentDto, publicMetadata)
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if service not found', async () => {
      (prisma.master.findUnique as jest.Mock).mockResolvedValue(mockMaster);
      (prisma.service.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        service.createPublic(mockAppointmentDto, publicMetadata)
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw HttpException with 429 if phone limit exceeded', async () => {
      (prisma.master.findUnique as jest.Mock).mockResolvedValue(mockMaster);
      (prisma.service.findUnique as jest.Mock).mockResolvedValue(mockService);
      (prisma.appointment.count as jest.Mock)
        .mockResolvedValueOnce(2)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0);

      await expect(
        service.createPublic(mockAppointmentDto, publicMetadata)
      ).rejects.toMatchObject({
        status: 429
      });
    });

    it('should throw HttpException with 429 if device limit exceeded even with new phone', async () => {
      (prisma.master.findUnique as jest.Mock).mockResolvedValue(mockMaster);
      (prisma.service.findUnique as jest.Mock).mockResolvedValue(mockService);
      (prisma.appointment.count as jest.Mock)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(2)
        .mockResolvedValueOnce(0);

      await expect(
        service.createPublic(
          {
            ...mockAppointmentDto,
            clientPhone: '+79009999999'
          },
          publicMetadata
        )
      ).rejects.toMatchObject({
        status: 429
      });
    });

    it('should throw BadRequestException if time is taken', async () => {
      (prisma.master.findUnique as jest.Mock).mockResolvedValue(mockMaster);
      (prisma.service.findUnique as jest.Mock).mockResolvedValue(mockService);
      (prisma.appointment.count as jest.Mock)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0);
      (prisma.appointment.findFirst as jest.Mock).mockResolvedValue(mockAppointment);

      await expect(
        service.createPublic(mockAppointmentDto, publicMetadata)
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('createAdmin', () => {
    it('should create admin appointment without rate limit check', async () => {
      (prisma.master.findUnique as jest.Mock).mockResolvedValue(mockMaster);
      (prisma.service.findUnique as jest.Mock).mockResolvedValue(mockService);
      (prisma.appointment.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.appointment.create as jest.Mock).mockResolvedValue(mockAppointment);

      const result = await service.createAdmin(mockAppointmentDto);

      expect(result).toEqual(mockAppointment);
      expect(prisma.appointment.count).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all appointments', async () => {
      const appointments = [mockAppointment];
      (prisma.appointment.findMany as jest.Mock).mockResolvedValue(appointments);

      const result = await service.findAll();

      expect(result).toEqual(appointments);
      expect(prisma.appointment.findMany).toHaveBeenCalledWith({
        include: { master: true, service: true },
        orderBy: { appointmentTime: 'desc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return appointment by id', async () => {
      (prisma.appointment.findUnique as jest.Mock).mockResolvedValue(mockAppointment);

      const result = await service.findOne(1);

      expect(result).toEqual(mockAppointment);
      expect(prisma.appointment.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { master: true, service: true },
      });
    });

    it('should throw NotFoundException if appointment not found', async () => {
      (prisma.appointment.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByDate', () => {
    it('should return appointments for date', async () => {
      const appointments = [mockAppointment];
      (prisma.appointment.findMany as jest.Mock).mockResolvedValue(appointments);

      const result = await service.findByDate('2024-01-15');

      expect(result).toEqual(appointments);
      expect(prisma.appointment.findMany).toHaveBeenCalled();
    });

    it('should filter by masterId if provided', async () => {
      const appointments = [mockAppointment];
      (prisma.appointment.findMany as jest.Mock).mockResolvedValue(appointments);

      const result = await service.findByDate('2024-01-15', 1);

      expect(result).toEqual(appointments);
    });
  });

  describe('findByStatus', () => {
    it('should return appointments by status', async () => {
      const appointments = [mockAppointment];
      (prisma.appointment.findMany as jest.Mock).mockResolvedValue(appointments);

      const result = await service.findByStatus(AppointmentStatus.Новый);

      expect(result).toEqual(appointments);
      expect(prisma.appointment.findMany).toHaveBeenCalledWith({
        where: { status: AppointmentStatus.Новый },
        include: { master: true, service: true },
        orderBy: { appointmentTime: 'desc' },
      });
    });
  });

  describe('update', () => {
    const updateDto: UpdateAppointmentDto = {
      clientName: 'Updated Name',
    };

    it('should update appointment successfully', async () => {
      (prisma.appointment.findUnique as jest.Mock).mockResolvedValue(mockAppointment);
      (prisma.appointment.update as jest.Mock).mockResolvedValue({
        ...mockAppointment,
        ...updateDto,
      });

      const result = await service.update(1, updateDto);

      expect(result.clientName).toBe('Updated Name');
      expect(prisma.appointment.update).toHaveBeenCalled();
    });

    it('should throw NotFoundException if appointment not found', async () => {
      (prisma.appointment.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.update(1, updateDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('complete', () => {
    it('should complete appointment successfully', async () => {
      (prisma.appointment.findUnique as jest.Mock).mockResolvedValue(mockAppointment);
      (prisma.appointment.update as jest.Mock).mockResolvedValue({
        ...mockAppointment,
        status: AppointmentStatus.Завершен,
      });

      const result = await service.complete(1);

      expect(result.status).toBe(AppointmentStatus.Завершен);
    });
  });

  describe('remove', () => {
    it('should delete appointment', async () => {
      (prisma.appointment.findUnique as jest.Mock).mockResolvedValue(mockAppointment);
      (prisma.appointment.delete as jest.Mock).mockResolvedValue(mockAppointment);

      const result = await service.remove(1);

      expect(result).toEqual(mockAppointment);
      expect(prisma.appointment.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });

  describe('count', () => {
    it('should return total count', async () => {
      (prisma.appointment.count as jest.Mock).mockResolvedValue(10);

      const result = await service.count();

      expect(result).toBe(10);
    });
  });

  describe('countActive', () => {
    it('should return active appointments count', async () => {
      (prisma.appointment.count as jest.Mock).mockResolvedValue(5);

      const result = await service.countActive();

      expect(result).toBe(5);
    });
  });
});
