import { 
  Controller, 
  Get, 
  Query, 
  UsePipes, 
  ValidationPipe, 
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { AnalyticsRequestDto, TimePeriod } from './dto/analytics-request.dto';
import { KeyMetricsResponseDto, AnalyticsSummaryResponseDto } from './dto/analytics-response.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from 'generated/prisma/enums';

@ApiTags('Аналитика')
@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@Roles(Role.admin)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('key-metrics')
  @ApiOperation({ 
    summary: 'Получить ключевые показатели',
    description: 'Возвращает все ключевые метрики аналитики для указанного периода'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Ключевые метрики успешно получены',
    type: KeyMetricsResponseDto 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Не авторизован' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Нет прав доступа' 
  })
  @ApiQuery({
    name: 'period',
    required: false,
    enum: TimePeriod,
    description: 'Период аналитики',
    example: TimePeriod.MONTH
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Начальная дата (только для custom периода)'
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'Конечная дата (только для custom периода)'
  })
  @ApiQuery({
    name: 'masterIds',
    required: false,
    type: String,
    description: 'ID мастеров через запятую (фильтрация)',
    example: '1,2,3'
  })
  @ApiQuery({
    name: 'serviceIds',
    required: false,
    type: String,
    description: 'ID услуг через запятую (фильтрация)',
    example: '1,2,3'
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async getKeyMetrics(@Query() dto: AnalyticsRequestDto) {
    // Преобразуем строки запросов в массивы чисел
    const queryParams = dto as any;
    
    if (queryParams.masterIds && typeof queryParams.masterIds === 'string') {
      dto.masterIds = queryParams.masterIds.split(',').map((id: string) => parseInt(id.trim(), 10));
    }
    
    if (queryParams.serviceIds && typeof queryParams.serviceIds === 'string') {
      dto.serviceIds = queryParams.serviceIds.split(',').map((id: string) => parseInt(id.trim(), 10));
    }

    return this.analyticsService.getKeyMetrics(dto);
  }

  @Get('dashboard-summary')
  @ApiOperation({ 
    summary: 'Сводка для дашборда',
    description: 'Краткая сводка основных показателей для главного дашборда'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Сводка успешно получена',
    type: AnalyticsSummaryResponseDto 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Не авторизован' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Нет прав доступа' 
  })
  async getDashboardSummary() {
    return this.analyticsService.getDashboardSummary();
  }

  @Get('financial-report')
  @ApiOperation({ 
    summary: 'Финансовый отчет',
    description: 'Детальный финансовый отчет с разбивкой по дням и мастерам'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Финансовый отчет успешно получен' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Не авторизован' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Нет прав доступа' 
  })
  @ApiQuery({
    name: 'period',
    required: false,
    enum: TimePeriod,
    description: 'Период отчета',
    example: TimePeriod.MONTH
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Начальная дата (только для custom периода)'
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'Конечная дата (только для custom периода)'
  })
  @ApiQuery({
    name: 'masterIds',
    required: false,
    type: String,
    description: 'ID мастеров через запятую (фильтрация)',
    example: '1,2,3'
  })
  @ApiQuery({
    name: 'serviceIds',
    required: false,
    type: String,
    description: 'ID услуг через запятую (фильтрация)',
    example: '1,2,3'
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async getFinancialReport(@Query() dto: AnalyticsRequestDto) {
    // Преобразуем строки запросов в массивы чисел
    const queryParams = dto as any;
    
    if (queryParams.masterIds && typeof queryParams.masterIds === 'string') {
      dto.masterIds = queryParams.masterIds.split(',').map((id: string) => parseInt(id.trim(), 10));
    }
    
    if (queryParams.serviceIds && typeof queryParams.serviceIds === 'string') {
      dto.serviceIds = queryParams.serviceIds.split(',').map((id: string) => parseInt(id.trim(), 10));
    }

    return this.analyticsService.getFinancialReport(dto);
  }

  @Get('top-masters')
  @ApiOperation({ 
    summary: 'Топ мастеров по выручке',
    description: 'Возвращает список мастеров отсортированный по выручке за последний месяц'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Топ мастеров успешно получен' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Не авторизован' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Нет прав доступа' 
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Количество мастеров в топе',
    example: 5
  })
  async getTopMasters(
    @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit?: number
  ) {
    return this.analyticsService.getTopMasters(limit);
  }

  @Get('popular-services')
  @ApiOperation({ 
    summary: 'Популярные услуги',
    description: 'Возвращает список услуг отсортированный по количеству записей за последний месяц'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Популярные услуги успешно получены' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Не авторизован' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Нет прав доступа' 
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Количество услуг в списке',
    example: 5
  })
  async getPopularServices(
    @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit?: number
  ) {
    return this.analyticsService.getPopularServices(limit);
  }

  @Get('quick-stats')
  @ApiOperation({ 
    summary: 'Быстрая статистика',
    description: 'Основные показатели за текущий месяц для быстрого отображения'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Статистика успешно получена' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Не авторизован' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Нет прав доступа' 
  })
  async getQuickStats() {
    return this.analyticsService.getQuickStats();
  }

  @Get('appointments-status')
  @ApiOperation({ 
    summary: 'Статистика по статусам записей',
    description: 'Количество записей по каждому статусу за текущий месяц'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Статистика по статусам получена' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Не авторизован' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Нет прав доступа' 
  })
  async getAppointmentsStatus() {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const appointmentMetrics = await this.analyticsService.getAppointmentMetrics({ 
      start: monthStart, 
      end: now 
    });

    return {
      new: appointmentMetrics.newAppointments,
      confirmed: appointmentMetrics.confirmedAppointments,
      completed: appointmentMetrics.completedAppointments,
      cancelled: appointmentMetrics.cancelledAppointments,
      total: appointmentMetrics.totalAppointments,
      conversionRate: appointmentMetrics.conversionRate
    };
  }

  @Get('client-statistics')
  @ApiOperation({ 
    summary: 'Статистика по клиентам',
    description: 'Детальная статистика по клиентам за текущий месяц'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Статистика по клиентам получена' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Не авторизован' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Нет прав доступа' 
  })
  async getClientStatistics() {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const clientMetrics = await this.analyticsService.getClientMetrics({ 
      start: monthStart, 
      end: now 
    });

    return clientMetrics;
  }

  @Get('revenue-trend')
  @ApiOperation({ 
    summary: 'Тренд выручки',
    description: 'Выручка по месяцам за последние 6 месяцев'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Тренд выручки получен' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Не авторизован' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Нет прав доступа' 
  })
  async getRevenueTrend() {
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    
    const financialMetrics = await this.analyticsService.getFinancialMetrics({ 
      start: sixMonthsAgo, 
      end: now 
    });

    return {
      months: financialMetrics.revenueByMonth.slice(-6),
      totalRevenue: financialMetrics.totalRevenue,
      averageMonthlyRevenue: financialMetrics.revenueByMonth.length > 0 
        ? financialMetrics.revenueByMonth.reduce((sum, month) => sum + month.revenue, 0) / financialMetrics.revenueByMonth.length
        : 0
    };
  }
}