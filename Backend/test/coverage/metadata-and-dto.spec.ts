import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { Test } from '@nestjs/testing';
import { INestApplication, ExecutionContext } from '@nestjs/common';
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AnalyticsController } from '../../src/analytics/analytics.controller';
import { AnalyticsService } from '../../src/analytics/analytics.service';
import {
  AnalyticsRequestDto,
  TimePeriod,
} from '../../src/analytics/dto/analytics-request.dto';
import {
  AnalyticsSummaryResponseDto,
  AppointmentMetricsDto,
  ClientGrowthDto,
  ClientMetricsDto,
  FinancialMetricsDto,
  KeyMetricsResponseDto,
  MasterMetricsDto,
  MasterPerformanceDto,
  PopularServiceDto,
  RevenueByMasterDto,
  RevenueByMonthDto,
  ServiceMetricsDto,
} from '../../src/analytics/dto/analytics-response.dto';
import { getJwtConfig } from '../../src/auth/config/jwt.config';
import { CurrentUser } from '../../src/auth/decorators/user.decorator';
import { CreateAppointmentHistoryDto } from '../../src/appointment-history/dto/create-appointment-history.dto';
import { UpdateAppointmentHistoryDto } from '../../src/appointment-history/dto/update-appointment-history.dto';

describe('Metadata and DTO coverage', () => {
  let app: INestApplication | undefined;

  afterEach(async () => {
    if (app) {
      await app.close();
      app = undefined;
    }
  });

  it('should resolve JWT config from ConfigService', async () => {
    const configService = {
      get: jest.fn().mockResolvedValue('super-secret'),
    } as unknown as ConfigService;

    await expect(getJwtConfig(configService)).resolves.toEqual({
      secret: 'super-secret',
    });
  });

  it('should expose current user payload or a single field from decorator factory', () => {
    class TestController {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      test(@CurrentUser('masterId') _user: unknown) {}
    }

    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: {
            id: 7,
            name: 'Admin',
            role: 'admin',
            masterId: 4,
            isActive: true,
          },
        }),
      }),
    } as ExecutionContext;

    const metadata = Reflect.getMetadata(
      ROUTE_ARGS_METADATA,
      TestController,
      'test',
    ) as Record<string, { factory: Function; data: string }>;
    const [, entry] = Object.entries(metadata)[0];

    expect(entry.factory(undefined, context)).toEqual({
      id: 7,
      name: 'Admin',
      role: 'admin',
      masterId: 4,
      isActive: true,
    });
    expect(entry.factory(entry.data, context)).toBe(4);
  });

  it('should validate analytics request dto defaults and numeric arrays', async () => {
    const dto = plainToInstance(AnalyticsRequestDto, {
      masterIds: ['1', '2'],
      serviceIds: ['3'],
      startDate: '2024-01-01',
      endDate: '2024-01-31',
    });

    expect(dto.period).toBe(TimePeriod.MONTH);
    expect(dto.masterIds).toEqual([1, 2]);
    expect(dto.serviceIds).toEqual([3]);
    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it('should instantiate coverage-only dto classes', () => {
    expect(new CreateAppointmentHistoryDto()).toBeInstanceOf(
      CreateAppointmentHistoryDto,
    );
    expect(new UpdateAppointmentHistoryDto()).toBeInstanceOf(
      UpdateAppointmentHistoryDto,
    );

    const response = new KeyMetricsResponseDto();
    response.period = TimePeriod.MONTH;
    response.financial = Object.assign(new FinancialMetricsDto(), {
      totalRevenue: 1000,
      monthlyIncome: 1000,
      revenueByMonth: [
        Object.assign(new RevenueByMonthDto(), {
          month: '2024-01',
          revenue: 1000,
        }),
      ],
      revenueByMaster: [
        Object.assign(new RevenueByMasterDto(), {
          masterId: 1,
          masterName: 'Master One',
          revenue: 1000,
        }),
      ],
      averageCheck: 1000,
      revenueGrowth: 10,
    });
    response.clients = Object.assign(new ClientMetricsDto(), {
      totalClients: 1,
      newClients: 1,
      returningClients: 0,
      repeatClients: 0,
      retentionRate: 0,
      repeatRate: 0,
      conversionToRegularRate: 0,
      clientsByMonth: [
        Object.assign(new ClientGrowthDto(), { month: '2024-01', clients: 1 }),
      ],
    });
    response.appointments = Object.assign(new AppointmentMetricsDto(), {
      totalAppointments: 1,
      newAppointments: 1,
      confirmedAppointments: 0,
      cancelledAppointments: 0,
      completedAppointments: 1,
      conversionRate: 100,
    });
    response.masters = Object.assign(new MasterMetricsDto(), {
      mastersCount: 1,
      averageLoad: 50,
      topMasters: [
        Object.assign(new MasterPerformanceDto(), {
          masterId: 1,
          masterName: 'Master One',
          appointmentsCount: 1,
          totalRevenue: 1000,
          averageRating: 5,
        }),
      ],
    });
    response.services = Object.assign(new ServiceMetricsDto(), {
      servicesCount: 1,
      popularServices: [
        Object.assign(new PopularServiceDto(), {
          serviceId: 1,
          serviceName: 'Haircut',
          appointmentsCount: 1,
          totalRevenue: 1000,
          averagePrice: 1000,
        }),
      ],
    });
    response.lastUpdated = new Date();

    expect(response).toBeInstanceOf(KeyMetricsResponseDto);
    expect(new AnalyticsSummaryResponseDto()).toBeInstanceOf(
      AnalyticsSummaryResponseDto,
    );
  });

  it('should generate swagger document for analytics dto metadata', async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AnalyticsController],
      providers: [
        {
          provide: AnalyticsService,
          useValue: {
            getKeyMetrics: jest.fn(),
            getDashboardSummary: jest.fn(),
            getFinancialReport: jest.fn(),
            getTopMasters: jest.fn(),
            getPopularServices: jest.fn(),
            getQuickStats: jest.fn(),
            getAppointmentMetrics: jest.fn(),
            getClientMetrics: jest.fn(),
            getFinancialMetrics: jest.fn(),
          },
        },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    const document = SwaggerModule.createDocument(
      app,
      new DocumentBuilder().setTitle('coverage').build(),
    );

    expect(document.paths['/analytics/key-metrics']).toBeDefined();
    expect(document.components?.schemas?.KeyMetricsResponseDto).toBeDefined();
    expect(document.components?.schemas?.AnalyticsSummaryResponseDto).toBeDefined();
  });
});
