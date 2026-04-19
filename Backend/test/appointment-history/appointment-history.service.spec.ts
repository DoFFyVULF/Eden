/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentHistoryService } from 'src/appointment-history/appointment-history.service';
import { PrismaService } from 'src/prisma.service';

describe('AppointmentHistoryService', () => {
  let service: AppointmentHistoryService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentHistoryService,
        {
          provide: PrismaService,
          useValue: {
            appointmentHistory: {
              count: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<AppointmentHistoryService>(AppointmentHistoryService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('count', () => {
    it('should return total count of appointment history', async () => {
      (prisma.appointmentHistory.count as jest.Mock).mockResolvedValue(25);

      const result = await service.count();

      expect(result).toBe(25);
      expect(prisma.appointmentHistory.count).toHaveBeenCalled();
    });

    it('should return 0 if no history records', async () => {
      (prisma.appointmentHistory.count as jest.Mock).mockResolvedValue(0);

      const result = await service.count();

      expect(result).toBe(0);
    });
  });
});
