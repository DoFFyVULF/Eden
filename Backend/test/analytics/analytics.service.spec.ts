/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsService } from 'src/analytics/analytics.service';
import { PrismaService } from 'src/prisma.service';
import { TimePeriod } from 'src/analytics/dto/analytics-request.dto';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let prisma: PrismaService;

  const mockAppointment = {
    id: 1,
    price: 1000,
    appointmentTime: new Date('2024-01-15T10:00:00Z'),
    status: 'Завершен',
    masterID: 1,
    serviceId: 1,
    clientPhone: '+79001234567',
    clientName: 'Ivan',
    clientSurname: 'Ivanov',
    master: { surname: 'Master', name: 'One' },
    service: { title: 'Haircut' },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        {
          provide: PrismaService,
          useValue: {
            appointment: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              groupBy: jest.fn(),
              count: jest.fn(),
            },
            master: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              count: jest.fn(),
            },
            service: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              count: jest.fn(),
            },
            $queryRaw: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

   describe('getKeyMetrics', () => {
    it('should return key metrics for period', async () => {
      const mockDateRange = {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-31'),
      };

      // Мокаем все возможные вызовы Prisma, которые могут произойти внутри getKeyMetrics
      (prisma.appointment.findMany as jest.Mock).mockResolvedValue([mockAppointment]);
      (prisma.appointment.count as jest.Mock).mockResolvedValue(1);
      (prisma.appointment.groupBy as jest.Mock).mockResolvedValue([]); // Важно для топов и т.д.
      
      (prisma.master.count as jest.Mock).mockResolvedValue(1);
      (prisma.master.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.master.findUnique as jest.Mock).mockResolvedValue(null);
      
      (prisma.service.count as jest.Mock).mockResolvedValue(1);
      (prisma.service.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.service.findUnique as jest.Mock).mockResolvedValue(null);
      
      (prisma.$queryRaw as jest.Mock).mockResolvedValue([]);

      const result = await service.getKeyMetrics({ period: TimePeriod.MONTH });

      expect(result).toBeDefined();
      expect(result.period).toBe(TimePeriod.MONTH);
      expect(result.financial).toBeDefined();
      expect(result.clients).toBeDefined();
      expect(result.appointments).toBeDefined();
      expect(result.masters).toBeDefined();
      expect(result.services).toBeDefined();
    });
  });

  describe('getDashboardSummary', () => {
    it('should return dashboard summary', async () => {
      (prisma.appointment.findMany as jest.Mock).mockResolvedValue([mockAppointment]);
      (prisma.appointment.count as jest.Mock).mockResolvedValue(1);
      (prisma.master.count as jest.Mock).mockResolvedValue(5);
      (prisma.service.count as jest.Mock).mockResolvedValue(10);
      (prisma.$queryRaw as jest.Mock).mockResolvedValue([]);

      const result = await service.getDashboardSummary();

      expect(result).toBeDefined();
      expect(result.totalRevenue).toBeDefined();
      expect(result.totalClients).toBeDefined();
      expect(result.totalAppointments).toBeDefined();
      expect(result.mastersCount).toBe(5);
      expect(result.servicesCount).toBe(10);
    });
  });

  describe('getFinancialReport', () => {
    it('should return financial report', async () => {
      (prisma.appointment.findMany as jest.Mock).mockResolvedValue([mockAppointment]);

      const result = await service.getFinancialReport({ period: TimePeriod.MONTH });

      expect(result).toBeDefined();
      expect(result.appointments).toBeDefined();
      expect(result.summary).toBeDefined();
      expect(result.breakdown).toBeDefined();
    });
  });

  describe('getTopMasters', () => {
    it('should return top masters by revenue', async () => {
      (prisma.appointment.groupBy as jest.Mock).mockResolvedValue([
        {
          masterID: 1,
          _sum: { price: 5000 },
          _count: { id: 5 },
        },
      ]);
      (prisma.master.findMany as jest.Mock).mockResolvedValue([
        { id: 1, surname: 'Master', name: 'One' },
      ]);

      const result = await service.getTopMasters(5);

      expect(result).toHaveLength(1);
      expect(result[0].masterId).toBe(1);
      expect(result[0].totalRevenue).toBe(5000);
    });
  });

  describe('getPopularServices', () => {
    it('should return popular services', async () => {
      (prisma.appointment.groupBy as jest.Mock).mockResolvedValue([
        {
          serviceId: 1,
          _sum: { price: 5000 },
          _count: { id: 5 },
        },
      ]);
      (prisma.service.findMany as jest.Mock).mockResolvedValue([
        { id: 1, title: 'Haircut' },
      ]);

      const result = await service.getPopularServices(5);

      expect(result).toHaveLength(1);
      expect(result[0].serviceId).toBe(1);
      expect(result[0].serviceName).toBe('Haircut');
    });
  });

  describe('getFinancialMetrics', () => {
    it('should return financial metrics', async () => {
      const dateRange = {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-31'),
      };

      (prisma.appointment.findMany as jest.Mock).mockResolvedValue([mockAppointment]);
      (prisma.$queryRaw as jest.Mock).mockResolvedValue([]);

      const result = await service.getFinancialMetrics(dateRange);

      expect(result).toBeDefined();
      expect(result.totalRevenue).toBeDefined();
      expect(result.monthlyIncome).toBeDefined();
      expect(result.revenueByMonth).toBeDefined();
      expect(result.revenueByMaster).toBeDefined();
      expect(result.averageCheck).toBeDefined();
    });
  });

  describe('getClientMetrics', () => {
    it('should return client metrics', async () => {
      const dateRange = {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-31'),
      };

      (prisma.appointment.findMany as jest.Mock).mockResolvedValue([mockAppointment]);
      (prisma.$queryRaw as jest.Mock).mockResolvedValue([]);

      const result = await service.getClientMetrics(dateRange);

      expect(result).toBeDefined();
      expect(result.totalClients).toBeDefined();
      expect(result.newClients).toBeDefined();
      expect(result.returningClients).toBeDefined();
      expect(result.retentionRate).toBeDefined();
      expect(result.clientsByMonth).toBeDefined();
    });
  });

  describe('getAppointmentMetrics', () => {
    it('should return appointment metrics', async () => {
      const dateRange = {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-31'),
      };

      (prisma.appointment.findMany as jest.Mock).mockResolvedValue([mockAppointment]);

      const result = await service.getAppointmentMetrics(dateRange);

      expect(result).toBeDefined();
      expect(result.totalAppointments).toBe(1);
      expect(result.completedAppointments).toBeDefined();
      expect(result.conversionRate).toBeDefined();
    });
  });

  describe('getMasterMetrics', () => {
    it('should return master metrics', async () => {
      const dateRange = {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-31'),
      };

      (prisma.master.count as jest.Mock).mockResolvedValue(5);
      (prisma.appointment.groupBy as jest.Mock).mockResolvedValue([]);
      (prisma.master.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        surname: 'Master',
        name: 'One',
      });

      const result = await service.getMasterMetrics(dateRange);

      expect(result).toBeDefined();
      expect(result.mastersCount).toBe(5);
      expect(result.topMasters).toBeDefined();
    });
  });

  describe('getServiceMetrics', () => {
    it('should return service metrics', async () => {
      const dateRange = {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-31'),
      };

      (prisma.service.count as jest.Mock).mockResolvedValue(10);
      (prisma.appointment.groupBy as jest.Mock).mockResolvedValue([]);
      (prisma.service.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        title: 'Haircut',
      });

      const result = await service.getServiceMetrics(dateRange);

      expect(result).toBeDefined();
      expect(result.servicesCount).toBe(10);
      expect(result.popularServices).toBeDefined();
    });
  });

  describe('getQuickStats', () => {
    it('should return quick stats', async () => {
      (prisma.appointment.findMany as jest.Mock).mockResolvedValue([mockAppointment]);
      (prisma.$queryRaw as jest.Mock).mockResolvedValue([]);

      const result = await service.getQuickStats();

      expect(result).toBeDefined();
      expect(result.revenue).toBeDefined();
      expect(result.clients).toBeDefined();
      expect(result.appointments).toBeDefined();
    });
  });
});
