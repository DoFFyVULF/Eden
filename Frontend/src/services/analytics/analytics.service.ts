import { axiosWithAuth } from "@/api/interceptors";
import {
  AnalyticsRequest,
  KeyMetricsResponse,
  AnalyticsSummary,
  FinancialReport,
  MasterPerformance,
  PopularService,
  QuickStats,
  AppointmentsStatus,
  ClientMetrics,
  RevenueTrend,
  TimePeriod,
  FinancialAnalyticsResponse,
  FinancialComparison,
  RevenueGoals,
} from "@/types/analytics.types";

// Вспомогательная функция для подготовки параметров
const prepareParams = (params?: AnalyticsRequest): Record<string, any> => {
  if (!params) return {};

  const result: Record<string, any> = {};
  
  if (params.period) result.period = params.period;
  if (params.startDate) result.startDate = params.startDate;
  if (params.endDate) result.endDate = params.endDate;
  
  if (params.masterIds && params.masterIds.length > 0) {
    result.masterIds = params.masterIds.join(',');
  }
  
  if (params.serviceIds && params.serviceIds.length > 0) {
    result.serviceIds = params.serviceIds.join(',');
  }
  
  return result;
};

export const analyticsService = {
  // ===== ОСНОВНЫЕ МЕТОДЫ =====
  
  // Основные ключевые показатели
  async getKeyMetrics(params?: AnalyticsRequest): Promise<KeyMetricsResponse> {
    const { data } = await axiosWithAuth.get<KeyMetricsResponse>("/analytics/key-metrics", {
      params: prepareParams(params)
    });
    return data;
  },

  // Сводка для дашборда
  async getDashboardSummary(): Promise<AnalyticsSummary> {
    const { data } = await axiosWithAuth.get<AnalyticsSummary>("/analytics/dashboard-summary");
    return data;
  },

  // Финансовый отчет
  async getFinancialReport(params?: AnalyticsRequest): Promise<FinancialReport> {
    const { data } = await axiosWithAuth.get<FinancialReport>("/analytics/financial-report", {
      params: prepareParams(params)
    });
    return data;
  },

  // Топ мастеров
  async getTopMasters(limit?: number): Promise<MasterPerformance[]> {
    const { data } = await axiosWithAuth.get<MasterPerformance[]>("/analytics/top-masters", {
      params: { limit }
    });
    return data;
  },

  // Популярные услуги
  async getPopularServices(limit?: number): Promise<PopularService[]> {
    const { data } = await axiosWithAuth.get<PopularService[]>("/analytics/popular-services", {
      params: { limit }
    });
    return data;
  },

  // Быстрая статистика
  async getQuickStats(): Promise<QuickStats> {
    const { data } = await axiosWithAuth.get<QuickStats>("/analytics/quick-stats");
    return data;
  },

  // Статистика по статусам записей
  async getAppointmentsStatus(): Promise<AppointmentsStatus> {
    const { data } = await axiosWithAuth.get<AppointmentsStatus>("/analytics/appointments-status");
    return data;
  },

  // Статистика по клиентам
  async getClientStatistics(): Promise<ClientMetrics> {
    const { data } = await axiosWithAuth.get<ClientMetrics>("/analytics/client-statistics");
    return data;
  },

  // Тренд выручки
  async getRevenueTrend(): Promise<RevenueTrend> {
    const { data } = await axiosWithAuth.get<RevenueTrend>("/analytics/revenue-trend");
    return data;
  },

  // Экспорт отчета
  async exportReport(params?: AnalyticsRequest): Promise<Blob> {
    const response = await axiosWithAuth.get("/analytics/export", {
      params: prepareParams(params),
      responseType: 'blob'
    });
    return response.data;
  },

  // ===== МЕТОДЫ ДЕТАЛЬНОЙ ФИНАНСОВОЙ АНАЛИТИКИ =====
  
  // Получить детальную финансовую аналитику
  async getFinancialAnalytics(
    params?: AnalyticsRequest
  ): Promise<FinancialAnalyticsResponse> {
    const { data } = await axiosWithAuth.get<FinancialAnalyticsResponse>(
      "/analytics/financial",
      {
        params: prepareParams(params),
      }
    );
    return data;
  },

  // Сравнение периодов
  async getFinancialComparison(
    params?: AnalyticsRequest
  ): Promise<FinancialComparison> {
    const { data } = await axiosWithAuth.get<FinancialComparison>(
      "/analytics/financial/comparison",
      {
        params: prepareParams(params),
      }
    );
    return data;
  },

  // Получить цели по выручке
  async getRevenueGoals(): Promise<RevenueGoals> {
    const { data } = await axiosWithAuth.get<RevenueGoals>(
      "/analytics/financial/goals"
    );
    return data;
  },

  // Экспорт финансового отчёта
  async exportFinancialReport(params?: AnalyticsRequest): Promise<Blob> {
    const response = await axiosWithAuth.get("/analytics/financial/export", {
      params: prepareParams(params),
      responseType: "blob",
    });
    return response.data;
  },

  // ===== УТИЛИТЫ =====
  
  // Утилиты для работы с периодами
  getPeriodDisplayName(period: TimePeriod): string {
    const periodNames: Record<TimePeriod, string> = {
      [TimePeriod.DAY]: 'За день',
      [TimePeriod.WEEK]: 'За неделю',
      [TimePeriod.MONTH]: 'За месяц',
      [TimePeriod.QUARTER]: 'За квартал',
      [TimePeriod.YEAR]: 'За год',
      [TimePeriod.CUSTOM]: 'Произвольный период'
    };
    return periodNames[period] || 'За месяц';
  },

  // Форматирование чисел для отображения
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  },

  formatPercent(value: number): string {
    return `${value.toFixed(1)}%`;
  },

  formatNumber(value: number): string {
    return new Intl.NumberFormat('ru-RU').format(value);
  }
};