import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentCronService } from '../../src/appointment/appointment-cron.service';
import { PrismaService } from '../../src/prisma.service';
import { AppointmentStatus } from '../../generated/prisma/enums';

describe('AppointmentCronService', () => {
  let service: AppointmentCronService;
  const prisma = {
    appointment: {
      findMany: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentCronService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<AppointmentCronService>(AppointmentCronService);
    jest.clearAllMocks();
  });

  it('should complete only overdue appointments', async () => {
    prisma.appointment.findMany.mockResolvedValue([
      {
        id: 1,
        appointmentTime: new Date(Date.now() - 3 * 60 * 60 * 1000),
        service: { duration: 60 },
      },
      {
        id: 2,
        appointmentTime: new Date(Date.now() + 60 * 60 * 1000),
        service: { duration: 60 },
      },
    ]);

    await service.completeAppointments();

    expect(prisma.appointment.findMany).toHaveBeenCalledWith({
      where: {
        status: {
          in: [AppointmentStatus.Новый, AppointmentStatus.Подтвержден],
        },
      },
      include: {
        service: true,
      },
    });
    expect(prisma.appointment.update).toHaveBeenCalledTimes(1);
    expect(prisma.appointment.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { status: AppointmentStatus.Завершен },
    });
  });
});
