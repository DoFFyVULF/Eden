/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { TimePeriod, AnalyticsRequestDto } from './dto/analytics-request.dto';
import {
  KeyMetricsResponseDto,
  AnalyticsSummaryResponseDto,
  RevenueByMonthDto,
  RevenueByMasterDto,
  ClientGrowthDto,
  MasterPerformanceDto,
  PopularServiceDto
} from './dto/analytics-response.dto';
import {
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  subMonths,
  format
} from 'date-fns';
import { AppointmentStatus } from 'generated/prisma/enums';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  private readonly COMPLETED_STATUS = [AppointmentStatus.Завершен];

  async getKeyMetrics(
    dto: AnalyticsRequestDto
  ): Promise<KeyMetricsResponseDto> {
    const period = dto.period || TimePeriod.MONTH;
    const dateRange = this.getDateRange(period, dto.startDate, dto.endDate);

    const [
      financial,
      clients,
      appointments,
      masters,
      services,
      previousPeriodData
    ] = await Promise.all([
      this.getFinancialMetrics(dateRange, dto.masterIds, dto.serviceIds),
      this.getClientMetrics(dateRange),
      this.getAppointmentMetrics(dateRange, dto.masterIds, dto.serviceIds),
      this.getMasterMetrics(dateRange),
      this.getServiceMetrics(dateRange),
      this.getPreviousPeriodData(dateRange)
    ]);

    const revenueGrowth =
      previousPeriodData.totalRevenue > 0
        ? ((financial.totalRevenue - previousPeriodData.totalRevenue) /
            previousPeriodData.totalRevenue) *
          100
        : 0;

    const response: KeyMetricsResponseDto = {
      period,
      financial: {
        totalRevenue: financial.totalRevenue,
        monthlyIncome: financial.monthlyIncome,
        revenueByMonth: financial.revenueByMonth,
        revenueByMaster: financial.revenueByMaster,
        averageCheck: financial.averageCheck,
        revenueGrowth
      },
      clients: {
        totalClients: clients.totalClients,
        newClients: clients.newClients,
        returningClients: clients.returningClients,
        repeatClients: clients.repeatClients,
        retentionRate: clients.retentionRate,
        repeatRate: clients.repeatRate,
        conversionToRegularRate: clients.conversionToRegularRate, // ← ДОБАВИТЬ
        clientsByMonth: clients.clientsByMonth
      },
      appointments: {
        totalAppointments: appointments.totalAppointments,
        newAppointments: appointments.newAppointments,
        confirmedAppointments: appointments.confirmedAppointments,
        cancelledAppointments: appointments.cancelledAppointments,
        completedAppointments: appointments.completedAppointments,
        conversionRate: appointments.conversionRate
      },
      masters: {
        mastersCount: masters.mastersCount,
        averageLoad: masters.averageLoad,
        topMasters: masters.topMasters
      },
      services: {
        servicesCount: services.servicesCount,
        popularServices: services.popularServices
      },
      lastUpdated: new Date()
    };

    return response;
  }

  async getDashboardSummary(): Promise<AnalyticsSummaryResponseDto> {
    const now = new Date();
    const currentMonth = { start: startOfMonth(now), end: now };
    const previousMonth = {
      start: subMonths(startOfMonth(now), 1),
      end: subMonths(endOfMonth(now), 1)
    };

    const [
      currentMetrics,
      previousMetrics,
      mastersCount,
      servicesCount,
      clientMetrics,
      appointmentMetrics
    ] = await Promise.all([
      this.getFinancialMetrics(currentMonth),
      this.getFinancialMetrics(previousMonth),
      this.prisma.master.count({ where: { isActive: true } }),
      this.prisma.service.count({ where: { isActive: true } }),
      this.getClientMetrics(currentMonth),
      this.getAppointmentMetrics(currentMonth)
    ]);

    return {
      totalRevenue: currentMetrics.totalRevenue,
      totalClients: clientMetrics.totalClients,
      totalAppointments: appointmentMetrics.totalAppointments,
      mastersCount,
      servicesCount,
      revenueGrowth:
        previousMetrics.totalRevenue > 0
          ? ((currentMetrics.totalRevenue - previousMetrics.totalRevenue) /
              previousMetrics.totalRevenue) *
            100
          : 0,
      clientGrowth: 15,
      appointmentGrowth: 12
    };
  }

  async getFinancialReport(dto: AnalyticsRequestDto) {
    const period = dto.period || TimePeriod.MONTH;
    const dateRange = this.getDateRange(period, dto.startDate, dto.endDate);

    const appointments = await this.prisma.appointment.findMany({
      where: {
        appointmentTime: {
          gte: dateRange.start,
          lte: dateRange.end
        },
        ...(dto.masterIds &&
          dto.masterIds.length > 0 && { masterID: { in: dto.masterIds } }),
        ...(dto.serviceIds &&
          dto.serviceIds.length > 0 && { serviceId: { in: dto.serviceIds } }),
        status: { in: this.COMPLETED_STATUS }
      },
      include: {
        master: true,
        service: true
      },
      orderBy: { appointmentTime: 'desc' }
    });

    const revenueByDay = appointments.reduce(
      (acc: Record<string, number>, appointment) => {
        const day = format(appointment.appointmentTime, 'yyyy-MM-dd');
        if (!acc[day]) acc[day] = 0;
        acc[day] += Number(appointment.price);
        return acc;
      },
      {}
    );

    const revenueByMaster = appointments.reduce(
      (
        acc: Record<
          number,
          {
            masterName: string;
            revenue: number;
            appointments: number;
          }
        >,
        appointment
      ) => {
        const masterId = appointment.masterID;
        if (!acc[masterId]) {
          acc[masterId] = {
            masterName: `${appointment.master.surname} ${appointment.master.name}`,
            revenue: 0,
            appointments: 0
          };
        }
        acc[masterId].revenue += Number(appointment.price);
        acc[masterId].appointments += 1;
        return acc;
      },
      {}
    );

    return {
      appointments,
      summary: {
        totalRevenue: appointments.reduce((sum, a) => sum + Number(a.price), 0),
        totalAppointments: appointments.length,
        averageCheck:
          appointments.length > 0
            ? appointments.reduce((sum, a) => sum + Number(a.price), 0) /
              appointments.length
            : 0
      },
      breakdown: {
        byDay: Object.entries(revenueByDay).map(([date, revenue]) => ({
          date,
          revenue
        })),
        byMaster: Object.values(revenueByMaster)
      }
    };
  }

  async getTopMasters(limit: number = 5) {
    const lastMonth = {
      start: subMonths(startOfMonth(new Date()), 1),
      end: subMonths(endOfMonth(new Date()), 1)
    };

    const appointments = await this.prisma.appointment.groupBy({
      by: ['masterID'],
      where: {
        appointmentTime: { gte: lastMonth.start, lte: lastMonth.end },
        status: { in: this.COMPLETED_STATUS }
      },
      _sum: { price: true },
      _count: { id: true }
    });

    const masters = await this.prisma.master.findMany({
      where: {
        id: { in: appointments.map(a => a.masterID) }
      }
    });

    const result = appointments.map(app => {
      const master = masters.find(m => m.id === app.masterID);
      return {
        masterId: app.masterID,
        masterName: master ? `${master.surname} ${master.name}` : 'Unknown',
        totalRevenue: Number(app._sum.price || 0),
        appointmentsCount: app._count.id,
        averageRevenuePerAppointment:
          app._count.id > 0 ? Number(app._sum.price || 0) / app._count.id : 0
      };
    });

    return result
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, limit);
  }

  async getPopularServices(limit: number = 5) {
    const lastMonth = {
      start: subMonths(startOfMonth(new Date()), 1),
      end: subMonths(endOfMonth(new Date()), 1)
    };

    const appointments = await this.prisma.appointment.groupBy({
      by: ['serviceId'],
      where: {
        appointmentTime: { gte: lastMonth.start, lte: lastMonth.end },
        status: { in: this.COMPLETED_STATUS }
      },
      _sum: { price: true },
      _count: { id: true }
    });

    const services = await this.prisma.service.findMany({
      where: {
        id: { in: appointments.map(a => a.serviceId) }
      }
    });

    const result = appointments.map(app => {
      const service = services.find(s => s.id === app.serviceId);
      return {
        serviceId: app.serviceId,
        serviceName: service ? service.title : 'Unknown',
        appointmentsCount: app._count.id,
        totalRevenue: Number(app._sum.price || 0),
        averagePrice:
          app._count.id > 0 ? Number(app._sum.price || 0) / app._count.id : 0
      };
    });

    return result
      .sort((a, b) => b.appointmentsCount - a.appointmentsCount)
      .slice(0, limit);
  }

  async getFinancialMetrics(
    dateRange: { start: Date; end: Date },
    masterIds?: number[],
    serviceIds?: number[]
  ): Promise<{
    totalRevenue: number;
    monthlyIncome: number;
    revenueByMonth: RevenueByMonthDto[];
    revenueByMaster: RevenueByMasterDto[];
    averageCheck: number;
  }> {
    const whereClause = {
      appointmentTime: { gte: dateRange.start, lte: dateRange.end },
      status: { in: this.COMPLETED_STATUS },
      ...(masterIds && masterIds.length > 0 && { masterID: { in: masterIds } }),
      ...(serviceIds &&
        serviceIds.length > 0 && { serviceId: { in: serviceIds } })
    };

    const [appointments, byMonthRaw] = await Promise.all([
      this.prisma.appointment.findMany({
        where: whereClause,
        select: {
          price: true,
          appointmentTime: true,
          masterID: true,
          master: {
            select: {
              surname: true,
              name: true
            }
          }
        }
      }),
      this.prisma.$queryRaw<Array<{ month: string; revenue: string }>>`
        SELECT 
          TO_CHAR("appointment_time", 'YYYY-MM') as month,
          SUM(price)::text as revenue
        FROM appointment
        WHERE "appointment_time" >= ${dateRange.start}
          AND "appointment_time" <= ${dateRange.end}
          AND status = 'Завершен'
        GROUP BY TO_CHAR("appointment_time", 'YYYY-MM')
        ORDER BY month
      `
    ]);

    const byMonth: RevenueByMonthDto[] = byMonthRaw.map(item => ({
      month: item.month,
      revenue: parseFloat(item.revenue) || 0
    }));

    const revenueByMasterMap = new Map<number, RevenueByMasterDto>();

    appointments.forEach(app => {
      const masterId = app.masterID;
      const existing = revenueByMasterMap.get(masterId);

      if (existing) {
        existing.revenue += Number(app.price);
      } else {
        revenueByMasterMap.set(masterId, {
          masterId,
          masterName: `${app.master.surname} ${app.master.name}`,
          revenue: Number(app.price)
        });
      }
    });

    const revenueByMaster = Array.from(revenueByMasterMap.values());

    const totalRevenue = appointments.reduce(
      (sum, a) => sum + Number(a.price),
      0
    );
    const currentMonth = format(dateRange.start, 'yyyy-MM');
    const monthlyIncome =
      byMonth.find(m => m.month === currentMonth)?.revenue || 0;

    return {
      totalRevenue,
      monthlyIncome,
      revenueByMonth: byMonth,
      revenueByMaster,
      averageCheck:
        appointments.length > 0 ? totalRevenue / appointments.length : 0
    };
  }


// ===== ОБНОВЛЕННЫЙ МЕТОД НОРМАЛИЗАЦИИ КЛИЕНТОВ =====
  private getClientKey(app: {
    clientPhone?: string | null;
    clientName?: string | null;
    clientSurname?: string | null;
  }): string {
    const phone = (app.clientPhone || '').trim();
    const name = (app.clientName || '').trim();
    const surname = (app.clientSurname || '').trim();

    // Оставляем только цифры
    let phoneDigits = phone.replace(/\D/g, '');

    // Нормализуем российские номера: 8999... и 7999... превращаем в 999...
    if (phoneDigits.length === 11 && (phoneDigits.startsWith('7') || phoneDigits.startsWith('8'))) {
      phoneDigits = phoneDigits.substring(1);
    }

    if (phoneDigits.length > 0) {
      return `p:${phoneDigits}`;
    }
    return `n:${surname.toLowerCase()}|${name.toLowerCase()}`;
  }

  // ===== ОБНОВЛЕННЫЙ МЕТОД ПОДСЧЕТА МЕТРИК =====
  async getClientMetrics(dateRange: { start: Date; end: Date }): Promise<{
    totalClients: number;
    newClients: number;
    returningClients: number;
    repeatClients: number;
    retentionRate: number;
    repeatRate: number;
    conversionToRegularRate: number;
    clientsByMonth: ClientGrowthDto[];
  }> {
    // 1. Загружаем ВСЮ историю записей до конца периода
    const allAppointments = await this.prisma.appointment.findMany({
      where: {
        appointmentTime: { lte: dateRange.end }
      },
      select: {
        appointmentTime: true,
        clientPhone: true,
        clientName: true,
        clientSurname: true
      }
    });

    const clientHistory = new Map<string, Date[]>();

    for (const app of allAppointments) {
      const key = this.getClientKey(app);
      if (!clientHistory.has(key)) {
        clientHistory.set(key, []);
      }
      clientHistory.get(key)!.push(app.appointmentTime);
    }

    let totalClients = 0;
    let newClients = 0;
    let returningClients = 0;
    let repeatClients = 0;
    
    // Для подсчета реальной конверсии новых клиентов
    let classicNewClients = 0;
    let newClientsWithRepeatVisits = 0;

    for (const [key, dates] of clientHistory.entries()) {
      // Записи клиента в текущем периоде
      const currentPeriodVisits = dates.filter(d => d >= dateRange.start && d <= dateRange.end);

      if (currentPeriodVisits.length > 0) {
        totalClients++;
        
        const hasHistoryBefore = dates.some(d => d < dateRange.start);
        const hasMultipleCurrentVisits = currentPeriodVisits.length >= 2;

        if (hasMultipleCurrentVisits) {
          repeatClients++;
        }

        // Клиент считается повторным/вернувшимся, если он был у нас ДО этого периода,
        // ИЛИ если он пришел впервые, но уже успел сходить 2+ раза за текущий период
        if (hasHistoryBefore || hasMultipleCurrentVisits) {
          returningClients++;
        } else {
          // Строго новый: первый визит в салоне и был только 1 раз в этом периоде
          newClients++;
        }

        // Логика конверсии (сколько из новых вернулись)
        if (!hasHistoryBefore) {
          classicNewClients++;
          if (hasMultipleCurrentVisits) {
            newClientsWithRepeatVisits++;
          }
        }
      }
    }

    const conversionToRegularRate = classicNewClients > 0 
      ? (newClientsWithRepeatVisits / classicNewClients) * 100 
      : 0;

    // 9. Данные по месяцам (добавлена нормализация телефонов 7/8 прямо в SQL)
    const clientsByMonthRaw = await this.prisma.$queryRaw<
      Array<{ month: string; clients: string }>
    >`
      SELECT 
        TO_CHAR(DATE_TRUNC('month', "appointment_time"), 'YYYY-MM') as month,
        COUNT(DISTINCT COALESCE(
          NULLIF(REGEXP_REPLACE(REGEXP_REPLACE(TRIM("client_phone"), '\\D', '', 'g'), '^[78](\\d{10})$', '\\1'), ''),
          CONCAT(TRIM("client_surname"), '|', TRIM("client_name"))
        ))::text as clients
      FROM appointment
      WHERE "appointment_time" >= ${dateRange.start}
        AND "appointment_time" <= ${dateRange.end}
      GROUP BY DATE_TRUNC('month', "appointment_time")
      ORDER BY month
    `;

    return {
      totalClients,
      newClients,
      returningClients,
      repeatClients,
      retentionRate: totalClients > 0 ? (returningClients / totalClients) * 100 : 0,
      repeatRate: totalClients > 0 ? (repeatClients / totalClients) * 100 : 0,
      conversionToRegularRate: parseFloat(conversionToRegularRate.toFixed(2)),
      clientsByMonth: clientsByMonthRaw.map(item => ({
        month: item.month,
        clients: parseInt(item.clients, 10)
      }))
    };
  }

  // ===== ИСПРАВЛЕННЫЙ МЕТОД getAppointmentMetrics =====
  async getAppointmentMetrics(
    dateRange: { start: Date; end: Date },
    masterIds?: number[],
    serviceIds?: number[]
  ): Promise<{
    totalAppointments: number;
    newAppointments: number;
    confirmedAppointments: number;
    cancelledAppointments: number;
    completedAppointments: number;
    conversionRate: number;
  }> {
    const whereClause: any = {
      appointmentTime: { gte: dateRange.start, lte: dateRange.end },
      ...(masterIds && masterIds.length > 0 && { masterID: { in: masterIds } }),
      ...(serviceIds &&
        serviceIds.length > 0 && { serviceId: { in: serviceIds } })
    };

    // Получаем ВСЕ записи сразу для точного подсчета
    const allAppointments = await this.prisma.appointment.findMany({
      where: whereClause,
      select: {
        id: true,
        status: true,
        createdAt: true
      }
    });

    const totalAppointments = allAppointments.length;

    // Считаем по статусам с помощью reduce для точности
    const statusCounts = allAppointments.reduce(
      (acc, app) => {
        acc[app.status] = (acc[app.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // Логируем для отладки
    console.log('Status counts:', statusCounts);
    console.log('All statuses:', Object.keys(statusCounts));

    // Определяем завершенные записи (проверяем разные варианты написания)
    const completedStatuses = [
      'Завершен',
      'Завершён',
      'COMPLETED',
      'completed',
      'Done'
    ];
    const confirmedStatuses = [
      'Подтвержден',
      'Подтверждён',
      'CONFIRMED',
      'confirmed'
    ];
    const cancelledStatuses = [
      'Отменен',
      'Отменён',
      'CANCELLED',
      'cancelled',
      'CANCELED',
      'canceled'
    ];

    const completedAppointments = completedStatuses.reduce(
      (sum, status) => sum + (statusCounts[status] || 0),
      0
    );

    const confirmedAppointments = confirmedStatuses.reduce(
      (sum, status) => sum + (statusCounts[status] || 0),
      0
    );

    const cancelledAppointments = cancelledStatuses.reduce(
      (sum, status) => sum + (statusCounts[status] || 0),
      0
    );

    // Новые записи — созданные в этом периоде
    const newAppointments = allAppointments.filter(
      app => app.createdAt >= dateRange.start
    ).length;

    // Конверсия: завершенные / общее количество * 100
    const conversionRate =
      totalAppointments > 0
        ? (completedAppointments / totalAppointments) * 100
        : 0;

    // Дополнительно считаем "эффективную конверсию"
    // (исключая отмененные из знаменателя)
    const effectiveAppointments = totalAppointments - cancelledAppointments;
    const effectiveConversionRate =
      effectiveAppointments > 0
        ? (completedAppointments / effectiveAppointments) * 100
        : 0;

    console.log('Metrics:', {
      totalAppointments,
      completedAppointments,
      cancelledAppointments,
      conversionRate: conversionRate.toFixed(2) + '%',
      effectiveConversionRate: effectiveConversionRate.toFixed(2) + '%'
    });

    return {
      totalAppointments,
      newAppointments,
      confirmedAppointments,
      cancelledAppointments,
      completedAppointments,
      conversionRate: parseFloat(conversionRate.toFixed(2))
    };
  }

  async getMasterMetrics(dateRange: { start: Date; end: Date }): Promise<{
    mastersCount: number;
    averageLoad: number;
    topMasters: MasterPerformanceDto[];
  }> {
    const [masters, appointments] = await Promise.all([
      this.prisma.master.count({ where: { isActive: true } }),
      this.prisma.appointment.groupBy({
        by: ['masterID'],
        where: {
          appointmentTime: { gte: dateRange.start, lte: dateRange.end },
          status: { in: this.COMPLETED_STATUS }
        },
        _count: { id: true },
        _sum: { price: true }
      })
    ]);

    const topMastersPromises = appointments.slice(0, 5).map(async app => {
      const master = await this.prisma.master.findUnique({
        where: { id: app.masterID }
      });
      return {
        masterId: app.masterID,
        masterName: master ? `${master.surname} ${master.name}` : 'Unknown',
        appointmentsCount: app._count.id,
        totalRevenue: Number(app._sum.price || 0)
      } as MasterPerformanceDto;
    });

    const topMasters = await Promise.all(topMastersPromises);

    return {
      mastersCount: masters,
      averageLoad: 78,
      topMasters
    };
  }

  async getServiceMetrics(dateRange: { start: Date; end: Date }): Promise<{
    servicesCount: number;
    popularServices: PopularServiceDto[];
  }> {
    const [services, popularServices] = await Promise.all([
      this.prisma.service.count({ where: { isActive: true } }),
      this.prisma.appointment.groupBy({
        by: ['serviceId'],
        where: {
          appointmentTime: { gte: dateRange.start, lte: dateRange.end },
          status: { in: this.COMPLETED_STATUS }
        },
        _count: { id: true },
        _sum: { price: true },
        orderBy: { _count: { id: 'desc' } },
        take: 5
      })
    ]);

    const popularServicesPromises = popularServices.map(async service => {
      const serviceData = await this.prisma.service.findUnique({
        where: { id: service.serviceId }
      });
      return {
        serviceId: service.serviceId,
        serviceName: serviceData?.title || 'Unknown',
        appointmentsCount: service._count.id,
        totalRevenue: Number(service._sum.price || 0),
        averagePrice:
          service._count.id > 0
            ? Number(service._sum.price || 0) / service._count.id
            : 0
      } as PopularServiceDto;
    });

    const popularServicesWithNames = await Promise.all(popularServicesPromises);

    return {
      servicesCount: services,
      popularServices: popularServicesWithNames
    };
  }

  private async getPreviousPeriodData(currentRange: {
    start: Date;
    end: Date;
  }): Promise<{ totalRevenue: number }> {
    const duration = currentRange.end.getTime() - currentRange.start.getTime();
    const previousStart = new Date(currentRange.start.getTime() - duration);
    const previousEnd = new Date(currentRange.start.getTime() - 1);

    const appointments = await this.prisma.appointment.findMany({
      where: {
        appointmentTime: { gte: previousStart, lte: previousEnd },
        status: { in: this.COMPLETED_STATUS }
      }
    });

    return {
      totalRevenue: appointments.reduce((sum, a) => sum + Number(a.price), 0)
    };
  }

  private getDateRange(
    period: TimePeriod,
    startDate?: string,
    endDate?: string
  ): { start: Date; end: Date } {
    const now = new Date();

    if (period === TimePeriod.CUSTOM && startDate && endDate) {
      return {
        start: new Date(startDate),
        end: new Date(endDate)
      };
    }

    let start: Date;
    let end: Date;

    switch (period) {
      case TimePeriod.DAY:
        start = startOfDay(now);
        end = endOfDay(now);
        break;
      case TimePeriod.WEEK:
        start = startOfWeek(now, { weekStartsOn: 1 });
        end = endOfWeek(now, { weekStartsOn: 1 });
        break;
      case TimePeriod.MONTH:
        start = startOfMonth(now);
        end = endOfMonth(now);
        break;
      case TimePeriod.QUARTER: {
        const quarterMonth = Math.floor(now.getMonth() / 3) * 3;
        start = new Date(now.getFullYear(), quarterMonth, 1);
        end = new Date(now.getFullYear(), quarterMonth + 3, 0);
        break;
      }
      case TimePeriod.YEAR:
        start = new Date(now.getFullYear(), 0, 1);
        end = new Date(now.getFullYear(), 11, 31);
        break;
      default:
        start = startOfMonth(now);
        end = endOfMonth(now);
    }

    return { start, end };
  }

  async getQuickStats() {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [revenue, clients, appointments] = await Promise.all([
      this.getFinancialMetrics({ start: monthStart, end: now }),
      this.getClientMetrics({ start: monthStart, end: now }),
      this.getAppointmentMetrics({ start: monthStart, end: now })
    ]);

    return {
      revenue: revenue.totalRevenue,
      clients: clients.totalClients,
      appointments: appointments.totalAppointments,
      newClients: clients.newClients,
      completedAppointments: appointments.completedAppointments,
      averageCheck: revenue.averageCheck
    };
  }
}
