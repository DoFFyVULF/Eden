// ===== БАЗОВЫЕ ТИПЫ =====

export enum TimePeriod {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  QUARTER = 'quarter',
  YEAR = 'year',
  CUSTOM = 'custom'
}

export interface AnalyticsRequest {
  period?: TimePeriod;
  startDate?: string;
  endDate?: string;
  masterIds?: number[];
  serviceIds?: number[];
}

export interface RevenueByMonth {
  month: string;
  revenue: number;
}

export interface RevenueByMaster {
  masterId: number;
  masterName: string;
  revenue: number;
}

export interface FinancialMetrics {
  totalRevenue: number;
  monthlyIncome: number;
  revenueByMonth: RevenueByMonth[];
  revenueByMaster: RevenueByMaster[];
  averageCheck: number;
  revenueGrowth: number;
}

export interface ClientGrowth {
  month: string;
  clients: number;
}

export interface ClientMetrics {
  totalClients: number;
  newClients: number;
  returningClients: number;
  retentionRate: number;
  clientsByMonth: ClientGrowth[];
}

export interface AppointmentMetrics {
  totalAppointments: number;
  newAppointments: number;
  confirmedAppointments: number;
  cancelledAppointments: number;
  completedAppointments: number;
  conversionRate: number;
}

export interface MasterPerformance {
  masterId: number;
  masterName: string;
  appointmentsCount: number;
  totalRevenue: number;
  averageRevenuePerAppointment?: number;
  averageRating?: number;
}

export interface MasterMetrics {
  mastersCount: number;
  averageLoad: number;
  topMasters: MasterPerformance[];
}

export interface PopularService {
  serviceId: number;
  serviceName: string;
  appointmentsCount: number;
  totalRevenue: number;
  averagePrice: number;
}

export interface ServiceMetrics {
  servicesCount: number;
  popularServices: PopularService[];
}

export interface KeyMetricsResponse {
  period: TimePeriod;
  financial: FinancialMetrics;
  clients: ClientMetrics;
  appointments: AppointmentMetrics;
  masters: MasterMetrics;
  services: ServiceMetrics;
  lastUpdated: Date;
}

export interface AnalyticsSummary {
  totalRevenue: number;
  totalClients: number;
  totalAppointments: number;
  mastersCount: number;
  servicesCount: number;
  revenueGrowth: number;
  clientGrowth: number;
  appointmentGrowth: number;
}

export interface FinancialReport {
  appointments: any[];
  summary: {
    totalRevenue: number;
    totalAppointments: number;
    averageCheck: number;
  };
  breakdown: {
    byDay: Array<{ date: string; revenue: number }>;
    byMaster: Array<{
      masterName: string;
      revenue: number;
      appointments: number;
    }>;
  };
}

export interface QuickStats {
  revenue: number;
  clients: number;
  appointments: number;
  newClients: number;
  completedAppointments: number;
  averageCheck: number;
}

export interface AppointmentsStatus {
  new: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  total: number;
  conversionRate: number;
}

export interface RevenueTrend {
  months: RevenueByMonth[];
  totalRevenue: number;
  averageMonthlyRevenue: number;
}

// ===== ТИПЫ ДЛЯ ДЕТАЛЬНОЙ ФИНАНСОВОЙ АНАЛИТИКИ =====

export interface FinancialAnalyticsResponse {
  // Основные показатели
  overview: {
    totalRevenue: number;
    revenueGrowth: number;
    monthlyIncome: number;
    averageCheck: number;
    totalTransactions: number;
    activeClients: number;
  };

  // Динамика выручки по дням/неделям/месяцам
  revenueTrend: {
    date: string;
    revenue: number;
    transactions: number;
    averageCheck: number;
  }[];

  // Распределение выручки по категориям
  revenueByCategory: {
    category: string;
    amount: number;
    percentage: number;
    growth: number;
  }[];

  // Выручка по мастерам
  revenueByMasters: {
    masterId: number;
    masterName: string;
    revenue: number;
    percentage: number;
    transactions: number;
    averageCheck: number;
    growth: number;
  }[];

  // Выручка по услугам
  revenueByServices: {
    serviceId: number;
    serviceName: string;
    revenue: number;
    percentage: number;
    quantity: number;
    averagePrice: number;
    growth: number;
  }[];

  // Почасовая статистика
  revenueByHour: {
    hour: number;
    revenue: number;
    transactions: number;
  }[];

  // Статистика по дням недели
  revenueByWeekday: {
    weekday: string;
    revenue: number;
    transactions: number;
    averageCheck: number;
  }[];

  // Методы оплаты
  paymentMethods: {
    method: string;
    amount: number;
    percentage: number;
    count: number;
  }[];

  // Прогноз
  forecast: {
    nextMonth: number;
    nextQuarter: number;
    confidence: number;
  };

  // Метаданные
  period: {
    startDate: string;
    endDate: string;
    periodType: string;
  };
  
  lastUpdated: string;
}

export interface FinancialComparison {
  current: {
    period: string;
    revenue: number;
    transactions: number;
    averageCheck: number;
  };
  previous: {
    period: string;
    revenue: number;
    transactions: number;
    averageCheck: number;
  };
  growth: {
    revenue: number;
    transactions: number;
    averageCheck: number;
  };
}

export interface RevenueGoals {
  daily: {
    target: number;
    current: number;
    percentage: number;
  };
  weekly: {
    target: number;
    current: number;
    percentage: number;
  };
  monthly: {
    target: number;
    current: number;
    percentage: number;
  };
}