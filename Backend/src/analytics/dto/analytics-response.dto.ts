import { ApiProperty } from '@nestjs/swagger';
import { TimePeriod } from './analytics-request.dto';

export class FinancialMetricsDto {
  @ApiProperty()
  totalRevenue: number;

  @ApiProperty()
  monthlyIncome: number;

  @ApiProperty({ type: () => [RevenueByMonthDto] })
  revenueByMonth: RevenueByMonthDto[];

  @ApiProperty({ type: () => [RevenueByMasterDto] })
  revenueByMaster: RevenueByMasterDto[];

  @ApiProperty()
  averageCheck: number;

  @ApiProperty()
  revenueGrowth: number;
}

export class RevenueByMonthDto {
  @ApiProperty()
  month: string;

  @ApiProperty()
  revenue: number;
}

export class RevenueByMasterDto {
  @ApiProperty()
  masterId: number;

  @ApiProperty()
  masterName: string;

  @ApiProperty()
  revenue: number;
}

export class ClientMetricsDto {
  @ApiProperty()
  totalClients: number;

  @ApiProperty()
  newClients: number;

  @ApiProperty()
  returningClients: number;

  @ApiProperty()
  repeatClients: number;

  @ApiProperty()
  retentionRate: number;

  @ApiProperty()
  repeatRate: number;

  @ApiProperty()
  conversionToRegularRate: number;  // ← ДОБАВИТЬ

  @ApiProperty({ type: () => [ClientGrowthDto] })
  clientsByMonth: ClientGrowthDto[];
}

export class ClientGrowthDto {
  @ApiProperty()
  month: string;

  @ApiProperty()
  clients: number;
}

export class AppointmentMetricsDto {
  @ApiProperty()
  totalAppointments: number;

  @ApiProperty()
  newAppointments: number;

  @ApiProperty()
  confirmedAppointments: number;

  @ApiProperty()
  cancelledAppointments: number;

  @ApiProperty()
  completedAppointments: number;

  @ApiProperty()
  conversionRate: number;
}

export class MasterMetricsDto {
  @ApiProperty()
  mastersCount: number;

  @ApiProperty()
  averageLoad: number;

  @ApiProperty({ type: () => [MasterPerformanceDto] })
  topMasters: MasterPerformanceDto[];
}

export class MasterPerformanceDto {
  @ApiProperty()
  masterId: number;

  @ApiProperty()
  masterName: string;

  @ApiProperty()
  appointmentsCount: number;

  @ApiProperty()
  totalRevenue: number;

  @ApiProperty()
  averageRating?: number;
}

export class ServiceMetricsDto {
  @ApiProperty()
  servicesCount: number;

  @ApiProperty({ type: () => [PopularServiceDto] })
  popularServices: PopularServiceDto[];
}

export class PopularServiceDto {
  @ApiProperty()
  serviceId: number;

  @ApiProperty()
  serviceName: string;

  @ApiProperty()
  appointmentsCount: number;

  @ApiProperty()
  totalRevenue: number;

  @ApiProperty()
  averagePrice: number;
}

export class KeyMetricsResponseDto {
  @ApiProperty()
  period: TimePeriod;

  @ApiProperty({ type: () => FinancialMetricsDto })
  financial: FinancialMetricsDto;

  @ApiProperty({ type: () => ClientMetricsDto })
  clients: ClientMetricsDto;

  @ApiProperty({ type: () => AppointmentMetricsDto })
  appointments: AppointmentMetricsDto;

  @ApiProperty({ type: () => MasterMetricsDto })
  masters: MasterMetricsDto;

  @ApiProperty({ type: () => ServiceMetricsDto })
  services: ServiceMetricsDto;

  @ApiProperty()
  lastUpdated: Date;
}

export class AnalyticsSummaryResponseDto {
  @ApiProperty()
  totalRevenue: number;

  @ApiProperty()
  totalClients: number;

  @ApiProperty()
  totalAppointments: number;

  @ApiProperty()
  mastersCount: number;

  @ApiProperty()
  servicesCount: number;

  @ApiProperty()
  revenueGrowth: number;

  @ApiProperty()
  clientGrowth: number;

  @ApiProperty()
  appointmentGrowth: number;
}