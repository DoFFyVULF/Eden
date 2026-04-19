/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsController } from 'src/analytics/analytics.controller';
import { AnalyticsService } from 'src/analytics/analytics.service';
import { TimePeriod } from 'src/analytics/dto/analytics-request.dto';

describe('AnalyticsController', () => {
  let controller: AnalyticsController;
  let analyticsService: AnalyticsService;

  const mockAnalyticsService = {
    getKeyMetrics: jest.fn(),
    getDashboardSummary: jest.fn(),
    getFinancialReport: jest.fn(),
    getTopMasters: jest.fn(),
    getPopularServices: jest.fn(),
    getQuickStats: jest.fn(),
    getAppointmentMetrics: jest.fn(),
    getClientMetrics: jest.fn(),
    getFinancialMetrics: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnalyticsController],
      providers: [
        {
          provide: AnalyticsService,
          useValue: mockAnalyticsService,
        },
      ],
    }).compile();

    controller = module.get<AnalyticsController>(AnalyticsController);
    analyticsService = module.get<AnalyticsService>(AnalyticsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getKeyMetrics', () => {
    it('should return key metrics', async () => {
      const metrics = {
        period: TimePeriod.MONTH,
        financial: { totalRevenue: 10000 },
        clients: { totalClients: 50 },
        appointments: { totalAppointments: 100 },
        masters: { mastersCount: 5 },
        services: { servicesCount: 10 },
      };

      mockAnalyticsService.getKeyMetrics.mockResolvedValue(metrics);

      const result = await controller.getKeyMetrics({ period: TimePeriod.MONTH });

      expect(result).toBe(metrics);
      expect(mockAnalyticsService.getKeyMetrics).toHaveBeenCalled();
    });
  });

  describe('getDashboardSummary', () => {
    it('should return dashboard summary', async () => {
      const summary = {
        totalRevenue: 10000,
        totalClients: 50,
        totalAppointments: 100,
        mastersCount: 5,
        servicesCount: 10,
      };

      mockAnalyticsService.getDashboardSummary.mockResolvedValue(summary);

      const result = await controller.getDashboardSummary();

      expect(result).toBe(summary);
      expect(mockAnalyticsService.getDashboardSummary).toHaveBeenCalled();
    });
  });

  describe('getFinancialReport', () => {
    it('should return financial report', async () => {
      const report = {
        appointments: [],
        summary: { totalRevenue: 10000 },
        breakdown: { byDay: [], byMaster: [] },
      };

      mockAnalyticsService.getFinancialReport.mockResolvedValue(report);

      const result = await controller.getFinancialReport({ period: TimePeriod.MONTH });

      expect(result).toBe(report);
      expect(mockAnalyticsService.getFinancialReport).toHaveBeenCalled();
    });
  });

  describe('getTopMasters', () => {
    it('should return top masters', async () => {
      const masters = [
        { masterId: 1, masterName: 'Master One', totalRevenue: 5000 },
      ];

      mockAnalyticsService.getTopMasters.mockResolvedValue(masters);

      const result = await controller.getTopMasters(5);

      expect(result).toBe(masters);
      expect(mockAnalyticsService.getTopMasters).toHaveBeenCalledWith(5);
    });
  });

  describe('getPopularServices', () => {
    it('should return popular services', async () => {
      const services = [
        { serviceId: 1, serviceName: 'Haircut', appointmentsCount: 20 },
      ];

      mockAnalyticsService.getPopularServices.mockResolvedValue(services);

      const result = await controller.getPopularServices(5);

      expect(result).toBe(services);
      expect(mockAnalyticsService.getPopularServices).toHaveBeenCalledWith(5);
    });
  });

  describe('getQuickStats', () => {
    it('should return quick stats', async () => {
      const stats = {
        revenue: 10000,
        clients: 50,
        appointments: 100,
      };

      mockAnalyticsService.getQuickStats.mockResolvedValue(stats);

      const result = await controller.getQuickStats();

      expect(result).toBe(stats);
      expect(mockAnalyticsService.getQuickStats).toHaveBeenCalled();
    });
  });

  describe('getAppointmentsStatus', () => {
    it('should return appointments status', async () => {
      const status = {
        new: 10,
        confirmed: 20,
        completed: 50,
        cancelled: 5,
        total: 85,
        conversionRate: 58.82,
      };

      mockAnalyticsService.getAppointmentMetrics.mockResolvedValue({
        newAppointments: 10,
        confirmedAppointments: 20,
        completedAppointments: 50,
        cancelledAppointments: 5,
        totalAppointments: 85,
        conversionRate: 58.82,
      });

      const result = await controller.getAppointmentsStatus();

      expect(result).toEqual(status);
      expect(mockAnalyticsService.getAppointmentMetrics).toHaveBeenCalled();
    });
  });

  describe('getClientStatistics', () => {
    it('should return client statistics', async () => {
      const stats = {
        totalClients: 50,
        newClients: 10,
        returningClients: 40,
        retentionRate: 80,
      };

      mockAnalyticsService.getClientMetrics.mockResolvedValue(stats);

      const result = await controller.getClientStatistics();

      expect(result).toBe(stats);
      expect(mockAnalyticsService.getClientMetrics).toHaveBeenCalled();
    });
  });

  describe('getRevenueTrend', () => {
    it('should return revenue trend', async () => {
      const trend = {
        months: [{ month: '2024-01', revenue: 10000 }],
        totalRevenue: 10000,
        averageMonthlyRevenue: 10000,
      };

      mockAnalyticsService.getFinancialMetrics.mockResolvedValue({
        revenueByMonth: [{ month: '2024-01', revenue: 10000 }],
        totalRevenue: 10000,
      });

      const result = await controller.getRevenueTrend();

      expect(result).toEqual(trend);
      expect(mockAnalyticsService.getFinancialMetrics).toHaveBeenCalled();
    });
  });
});
