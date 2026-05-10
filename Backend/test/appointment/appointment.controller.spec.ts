/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentController } from 'src/appointment/appointment.controller';
import { AppointmentService } from 'src/appointment/appointment.service';
import { AppointmentDto } from 'src/appointment/dto/appointment.dto';
import { UpdateAppointmentDto } from 'src/appointment/dto/update-appointment.dto';
import { AppointmentStatus } from 'generated/prisma/enums';

describe('AppointmentController', () => {
  let controller: AppointmentController;
  let appointmentService: AppointmentService;

  const mockAppointmentService = {
    createPublic: jest.fn(),
    createAdmin: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByDate: jest.fn(),
    findByStatus: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    complete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppointmentController],
      providers: [
        {
          provide: AppointmentService,
          useValue: mockAppointmentService,
        },
      ],
    }).compile();

    controller = module.get<AppointmentController>(AppointmentController);
    appointmentService = module.get<AppointmentService>(AppointmentService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createPublic', () => {
    it('should create public appointment', async () => {
      const dto: AppointmentDto = {
        clientSurname: 'Ivanov',
        clientName: 'Ivan',
        clientPhone: '+79001234567',
        masterId: 1,
        serviceId: 1,
        appointmentTime: '2024-01-15T10:00:00Z',
        price: 1000,
      };
      const result = { id: 1, ...dto };

      mockAppointmentService.createPublic.mockResolvedValue(result);

      expect(
        await controller.createPublic(
          dto,
          {
            headers: {},
            ip: '127.0.0.1',
          } as any,
          'device-1'
        )
      ).toBe(result);
      expect(mockAppointmentService.createPublic).toHaveBeenCalledWith(dto, {
        clientIp: '127.0.0.1',
        clientFingerprint: 'device-1'
      });
    });

    it('should create admin appointment for admin user', async () => {
      const dto: AppointmentDto = {
        clientSurname: 'Ivanov',
        clientName: 'Ivan',
        clientPhone: '+79001234567',
        masterId: 1,
        serviceId: 1,
        appointmentTime: '2024-01-15T10:00:00Z',
        price: 1000,
      };
      const result = { id: 1, ...dto };

      mockAppointmentService.createAdmin.mockResolvedValue(result);

      expect(
        await controller.createAdmin(dto, {
          id: 1,
          name: 'Admin',
          role: 'admin' as any,
          isActive: true,
        })
      ).toBe(result);
      expect(mockAppointmentService.createAdmin).toHaveBeenCalledWith(dto);
    });
  });

  describe('find', () => {
    it('should return all appointments when no filters', async () => {
      const appointments = [{ id: 1, clientName: 'Ivan' }];
      mockAppointmentService.findAll.mockResolvedValue(appointments);

      const result = await controller.find();

      expect(result).toBe(appointments);
      expect(mockAppointmentService.findAll).toHaveBeenCalled();
    });

    it('should return appointments by date', async () => {
      const appointments = [{ id: 1, appointmentTime: new Date() }];
      mockAppointmentService.findByDate.mockResolvedValue(appointments);

      const result = await controller.find('2024-01-15');

      expect(result).toBe(appointments);
      expect(mockAppointmentService.findByDate).toHaveBeenCalledWith('2024-01-15', undefined);
    });

    it('should return appointments by date and masterId', async () => {
      const appointments = [{ id: 1, appointmentTime: new Date() }];
      mockAppointmentService.findByDate.mockResolvedValue(appointments);

      const result = await controller.find('2024-01-15', '1');

      expect(result).toBe(appointments);
      expect(mockAppointmentService.findByDate).toHaveBeenCalledWith('2024-01-15', 1);
    });

    it('should return appointments by status', async () => {
      const appointments = [{ id: 1, status: AppointmentStatus.Новый }];
      mockAppointmentService.findByStatus.mockResolvedValue(appointments);

      const result = await controller.find(undefined, undefined, AppointmentStatus.Новый);

      expect(result).toBe(appointments);
      expect(mockAppointmentService.findByStatus).toHaveBeenCalledWith(AppointmentStatus.Новый);
    });
  });

  describe('findOne', () => {
    it('should return appointment by id', async () => {
      const appointment = { id: 1, clientName: 'Ivan' };
      mockAppointmentService.findOne.mockResolvedValue(appointment);

      const result = await controller.findOne(1);

      expect(result).toBe(appointment);
      expect(mockAppointmentService.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should update appointment', async () => {
      const dto: UpdateAppointmentDto = { clientName: 'Updated' };
      const result = { id: 1, ...dto };

      mockAppointmentService.update.mockResolvedValue(result);

      expect(await controller.update(1, dto)).toBe(result);
      expect(mockAppointmentService.update).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('remove', () => {
    it('should delete appointment', async () => {
      const result = { id: 1 };
      mockAppointmentService.remove.mockResolvedValue(result);

      expect(await controller.remove(1)).toBe(result);
      expect(mockAppointmentService.remove).toHaveBeenCalledWith(1);
    });
  });
});
