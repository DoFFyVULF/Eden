"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Users,
  UserPlus,
  UserCheck,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Star,
  Award,
  Download,
  RefreshCw,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Activity,
  BarChart3,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  AlertCircle,
  CheckCircle2,
  Info,
  Heart,
  Repeat,
  Target,
  Clock,
  TrendingUp as Growth,
  SlidersHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Receipt,
  Wallet,
  Package,
  Zap,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "@/app/components/charts";
import { analyticsService } from "@/services/analytics/analytics.service";
import { ADMIN_ROUTES } from "@/app/lib/admin.routes";

// ===== ТИПЫ (соответствуют DTO) =====

enum TimePeriod {
  DAY = "day",
  WEEK = "week",
  MONTH = "month",
  QUARTER = "quarter",
  YEAR = "year",
  CUSTOM = "custom",
}

interface RevenueByMonth {
  month: string;
  revenue: number;
}

interface RevenueByMaster {
  masterId: number;
  masterName: string;
  revenue: number;
}

interface ClientGrowth {
  month: string;
  clients: number;
}

interface FinancialMetrics {
  totalRevenue: number;
  monthlyIncome: number;
  revenueByMonth: RevenueByMonth[];
  revenueByMaster: RevenueByMaster[];
  averageCheck: number;
  revenueGrowth: number;
}

interface ClientMetrics {
  totalClients: number;
  newClients: number;
  returningClients: number;
  repeatClients: number; // ← ДОБАВЛЕНО
  retentionRate: number;
  repeatRate: number; // ← ДОБАВЛЕНО
  clientsByMonth: ClientGrowth[];
}

interface AppointmentMetrics {
  totalAppointments: number;
  newAppointments: number;
  confirmedAppointments: number;
  cancelledAppointments: number;
  completedAppointments: number;
  conversionRate: number;
}

interface MasterPerformance {
  masterId: number;
  masterName: string;
  appointmentsCount: number;
  totalRevenue: number;
  averageRating?: number;
}

interface MasterMetrics {
  mastersCount: number;
  averageLoad: number;
  topMasters: MasterPerformance[];
}

interface PopularService {
  serviceId: number;
  serviceName: string;
  appointmentsCount: number;
  totalRevenue: number;
  averagePrice: number;
}

interface ServiceMetrics {
  servicesCount: number;
  popularServices: PopularService[];
}

interface KeyMetricsResponse {
  period: TimePeriod;
  financial: FinancialMetrics;
  clients: ClientMetrics;
  appointments: AppointmentMetrics;
  masters: MasterMetrics;
  services: ServiceMetrics;
  lastUpdated: Date;
}

// ===== ХУК ДЛЯ ФОРМАТИРОВАНИЯ =====

function useAnalytics() {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("ru-RU").format(value);
  };

  const getPeriodDisplayName = (period: TimePeriod) => {
    const map: Record<TimePeriod, string> = {
      [TimePeriod.DAY]: "День",
      [TimePeriod.WEEK]: "Неделя",
      [TimePeriod.MONTH]: "Месяц",
      [TimePeriod.QUARTER]: "Квартал",
      [TimePeriod.YEAR]: "Год",
      [TimePeriod.CUSTOM]: "Период",
    };
    return map[period] || period;
  };

  return { formatCurrency, formatPercent, formatNumber, getPeriodDisplayName };
}

// ===== КОМПОНЕНТ СТРАНИЦЫ =====

// Цветовая палитра
const COLORS = {
  primary: ["#3B82F6", "#2563EB", "#1D4ED8", "#1E40AF", "#1E3A8A"],
  success: ["#10B981", "#059669", "#047857"],
  warning: ["#F59E0B", "#D97706", "#B45309"],
  purple: ["#8B5CF6", "#7C3AED", "#6D28D9"],
  cyan: ["#06B6D4", "#0891B2", "#0E7490"],
};

export default function ClientAnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>(
    TimePeriod.MONTH,
  );
  const [analyticsData, setAnalyticsData] = useState<KeyMetricsResponse | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "overview" | "growth" | "retention" | "segmentation"
  >("overview");
  const [isDark, setIsDark] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const { formatCurrency, formatPercent, formatNumber, getPeriodDisplayName } =
    useAnalytics();

  useEffect(() => {
    const checkDarkMode = () =>
      setIsDark(document.documentElement.classList.contains("dark"));
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    loadClientData();
  }, [selectedPeriod]);

  const loadClientData = async (showLoading = true) => {
    if (showLoading) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }
    setError(null);
    try {
      const data = await analyticsService.getKeyMetrics({
        period: selectedPeriod,
      });
      setAnalyticsData(data);
    } catch (err) {
      setError("Не удалось загрузить данные клиентов");
      console.error("Ошибка загрузки:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await analyticsService.exportReport({
        period: selectedPeriod,
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `clients-report-${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert("Ошибка при экспорте отчета");
    }
  };

  // Стили
  const glassCls = isDark
    ? "bg-white/[0.07] backdrop-blur-2xl border border-white/[0.1] shadow-[0_4px_24px_rgba(0,0,0,0.2)]"
    : "bg-white border border-gray-200/70 shadow-sm";

  const tabs = [
    { id: "overview", label: "Обзор", icon: BarChart3 },
    { id: "growth", label: "Рост базы", icon: Growth },
    { id: "retention", label: "Удержание", icon: Heart },
    { id: "segmentation", label: "Сегментация", icon: PieChartIcon },
  ];

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <div className="max-w-9xl mx-auto">
        {/* HEADER with back button */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <motion.a
              href={ADMIN_ROUTES.ANALYTICS.DASHBOARD}
              whileHover={{ scale: 1.05, x: -2 }}
              whileTap={{ scale: 0.95 }}
              className={`p-2.5 rounded-xl transition-all duration-200 ${
                isDark
                  ? "bg-white/[0.07] border border-white/[0.1] text-white/60 hover:text-white/80 hover:bg-white/[0.1]"
                  : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 shadow-sm"
              }`}
            >
              <ArrowLeft size={18} />
            </motion.a>
            <div>
              <p
                className={`text-xs font-semibold tracking-widest uppercase ${
                  isDark ? "text-white/30" : "text-gray-400"
                }`}
              >
                Клиентская аналитика
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1
                className={`text-4xl md:text-5xl font-black leading-none tracking-tight ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                Анализ клиентской базы 👥
              </h1>
              <p
                className={`mt-2 text-sm ${
                  isDark ? "text-white/40" : "text-gray-400"
                }`}
              >
                Детальный анализ клиентов и их активности
              </p>
            </div>

            <div className="flex gap-2.5 flex-wrap">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => loadClientData(false)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-200 ${
                  isDark
                    ? "bg-white/[0.07] border-white/[0.1] text-white/60 hover:text-white/80 hover:bg-white/[0.1]"
                    : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50 shadow-sm"
                }`}
              >
                <RefreshCw
                  size={15}
                  className={isRefreshing ? "animate-spin" : ""}
                />
                Обновить
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleExport}
                disabled={isLoading || isRefreshing}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 shadow-lg ${
                  isDark
                    ? "bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-blue-500/25 hover:shadow-blue-500/40"
                    : "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-blue-500/20 hover:shadow-blue-500/35"
                }`}
              >
                <Download size={17} />
                Экспорт
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* TABS & FILTERS */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`rounded-2xl p-4 mb-6 transition-all duration-300 ${glassCls}`}
        >
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <motion.button
                    key={tab.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() =>
                      setActiveTab(
                        tab.id as
                          | "overview"
                          | "growth"
                          | "retention"
                          | "segmentation",
                      )
                    }
                    className={`
                      flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200
                      ${
                        activeTab === tab.id
                          ? isDark
                            ? "bg-blue-500/20 border border-blue-400/30 text-blue-300"
                            : "bg-blue-50 border border-blue-300 text-blue-600"
                          : isDark
                            ? "bg-white/[0.07] border border-white/[0.1] text-white/60 hover:text-white/80"
                            : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 shadow-sm"
                      }
                    `}
                  >
                    <Icon size={16} />
                    <span className="whitespace-nowrap">{tab.label}</span>
                  </motion.button>
                );
              })}
            </div>

            {/* Controls */}
            <div className="flex gap-3">
              {/* Period selector */}
              <div className="relative">
                <Calendar
                  size={16}
                  className={`absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${
                    isDark ? "text-white/30" : "text-gray-400"
                  }`}
                />
                <select
                  value={selectedPeriod}
                  onChange={(e) =>
                    setSelectedPeriod(e.target.value as TimePeriod)
                  }
                  disabled={isLoading}
                  className={`h-11 pl-10 pr-8 rounded-xl text-sm border outline-none appearance-none cursor-pointer transition-all ${
                    isDark
                      ? "bg-white/[0.07] border-white/[0.1] text-white/90 focus:border-white/20"
                      : "bg-gray-50 border-gray-200 text-gray-700 focus:border-blue-300 focus:bg-white"
                  }`}
                >
                  <option value={TimePeriod.WEEK}>За неделю</option>
                  <option value={TimePeriod.MONTH}>За месяц</option>
                  <option value={TimePeriod.QUARTER}>За квартал</option>
                  <option value={TimePeriod.YEAR}>За год</option>
                </select>
                <ChevronDown
                  size={14}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${
                    isDark ? "text-white/30" : "text-gray-400"
                  }`}
                />
              </div>

              {/* Filter toggle */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`h-11 flex items-center gap-2 px-4 rounded-xl text-sm font-semibold border transition-all duration-200 ${
                  isFilterOpen
                    ? isDark
                      ? "bg-indigo-500/20 border-indigo-400/30 text-indigo-300"
                      : "bg-indigo-50 border-indigo-300 text-indigo-600"
                    : isDark
                      ? "bg-white/[0.07] border-white/[0.1] text-white/60 hover:text-white/80"
                      : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-white shadow-sm"
                }`}
              >
                <SlidersHorizontal size={15} />
                Детализация
                {isFilterOpen ? (
                  <ChevronUp size={13} />
                ) : (
                  <ChevronDown size={13} />
                )}
              </motion.button>
            </div>
          </div>

          {/* Error display */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
              <p className="text-rose-700 text-sm">{error}</p>
            </motion.div>
          )}

          {/* Expanded filters */}
          <AnimatePresence>
            {isFilterOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: "auto", marginTop: 12 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                className="overflow-hidden"
              >
                <div
                  className={`pt-3 border-t ${
                    isDark ? "border-white/[0.07]" : "border-gray-100"
                  }`}
                >
                  <p
                    className={`text-xs font-semibold mb-2.5 ${
                      isDark ? "text-white/30" : "text-gray-400"
                    }`}
                  >
                    Детальная информация:
                  </p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500" />
                      <span
                        className={isDark ? "text-white/60" : "text-gray-600"}
                      >
                        Новые и повторные клиенты
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
                      <span
                        className={isDark ? "text-white/60" : "text-gray-600"}
                      >
                        Удержание и лояльность
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-500 to-green-500" />
                      <span
                        className={isDark ? "text-white/60" : "text-gray-600"}
                      >
                        Активность и конверсия
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* MAIN CONTENT */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div
              className={`w-10 h-10 rounded-full border-3 border-t-transparent animate-spin mb-4 ${
                isDark ? "border-blue-400" : "border-blue-400"
              }`}
              style={{ borderWidth: 3 }}
            />
            <p
              className={`text-sm ${
                isDark ? "text-white/40" : "text-gray-400"
              }`}
            >
              Загрузка данных клиентов...
            </p>
          </div>
        ) : (
          analyticsData && (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {activeTab === "overview" && (
                  <OverviewTab data={analyticsData} isDark={isDark} />
                )}
                {activeTab === "growth" && (
                  <GrowthTab data={analyticsData} isDark={isDark} />
                )}
                {activeTab === "retention" && (
                  <RetentionTab data={analyticsData} isDark={isDark} />
                )}
                {activeTab === "segmentation" && (
                  <SegmentationTab data={analyticsData} isDark={isDark} />
                )}
              </motion.div>
            </AnimatePresence>
          )
        )}
      </div>
    </div>
  );
}

// ===== ВКЛАДКА "ОБЗОР" =====
function OverviewTab({
  data,
  isDark,
}: {
  data: KeyMetricsResponse;
  isDark: boolean;
}) {
  const { formatPercent, formatNumber, getPeriodDisplayName } = useAnalytics();

  const glassCls = isDark
    ? "bg-white/[0.07] backdrop-blur-2xl border border-white/[0.1]"
    : "bg-white border border-gray-200/70";

  const stats = [
    {
      title: "Всего клиентов",
      value: formatNumber(data.clients.totalClients),
      change: data.financial.revenueGrowth || 15,
      icon: Users,
      gradient: "from-blue-500 to-cyan-500",
      bgColor: isDark ? "bg-blue-500/10" : "bg-blue-50",
      textColor: isDark ? "text-blue-400" : "text-blue-600",
      description: "База клиентов",
    },
    {
      title: "Новые клиенты",
      value: formatNumber(data.clients.newClients),
      change: 22,
      icon: UserPlus,
      gradient: "from-emerald-500 to-green-500",
      bgColor: isDark ? "bg-emerald-500/10" : "bg-emerald-50",
      textColor: isDark ? "text-emerald-400" : "text-emerald-600",
      description: "За период",
    },
    {
      title: "Повторные клиенты",
      value: formatNumber(data.clients.returningClients),
      change: 8,
      icon: Repeat,
      gradient: "from-purple-500 to-pink-500",
      bgColor: isDark ? "bg-purple-500/10" : "bg-purple-50",
      textColor: isDark ? "text-purple-400" : "text-purple-600",
      description: "Вернулись повторно",
    },
    {
      title: "Уровень удержания",
      value: formatPercent(data.clients.retentionRate),
      change: 5,
      icon: Heart,
      gradient: "from-rose-500 to-red-500",
      bgColor: isDark ? "bg-rose-500/10" : "bg-rose-50",
      textColor: isDark ? "text-rose-400" : "text-rose-600",
      description: "Retention rate",
    },
  ];

  // Данные для круговой диаграммы
  const clientTypeData = [
    { name: "Новые", value: data.clients.newClients, color: "#10B981" },
    {
      name: "Повторные",
      value: data.clients.returningClients,
      color: "#8B5CF6",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Ключевые метрики */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const isPositive = stat.change >= 0;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
              whileHover={{ y: -4 }}
              className={`relative rounded-2xl p-5 overflow-hidden transition-all duration-300 ${
                isDark
                  ? `bg-white/[0.07] border border-white/[0.1] backdrop-blur-xl shadow-lg`
                  : "bg-white border border-gray-200/70 shadow-sm hover:shadow-md"
              }`}
            >
              {/* Gradient accent */}
              <div
                className={`absolute -top-4 -right-4 w-20 h-20 rounded-full bg-gradient-to-br ${stat.gradient} opacity-${isDark ? "15" : "8"} blur-xl`}
              />

              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-xl ${stat.bgColor}`}>
                    <Icon className={`w-5 h-5 ${stat.textColor}`} />
                  </div>
                  <div
                    className={`flex items-center gap-1 text-sm font-medium ${
                      isPositive
                        ? isDark
                          ? "text-emerald-400"
                          : "text-emerald-600"
                        : isDark
                          ? "text-rose-400"
                          : "text-rose-600"
                    }`}
                  >
                    {isPositive ? (
                      <ArrowUpRight size={16} />
                    ) : (
                      <ArrowDownRight size={16} />
                    )}
                    {Math.abs(stat.change).toFixed(1)}%
                  </div>
                </div>

                <div
                  className={`text-2xl font-bold leading-none mb-1 ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  {stat.value}
                </div>
                <div
                  className={`text-sm font-medium ${
                    isDark ? "text-white/70" : "text-gray-700"
                  }`}
                >
                  {stat.title}
                </div>
                <div
                  className={`text-xs ${
                    isDark ? "text-white/40" : "text-gray-500"
                  } mt-1`}
                >
                  {stat.description}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* График роста клиентской базы */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`rounded-2xl p-6 transition-all duration-300 ${glassCls}`}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3
              className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"} mb-1`}
            >
              Рост клиентской базы
            </h3>
            <p
              className={`text-sm ${isDark ? "text-white/40" : "text-gray-500"}`}
            >
              Количество клиентов по месяцам
            </p>
          </div>
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
              isDark ? "bg-blue-500/20" : "bg-blue-100"
            }`}
          >
            <TrendingUp
              className={`w-4 h-4 ${
                isDark ? "text-blue-400" : "text-blue-700"
              }`}
            />
            <span
              className={`text-sm font-semibold ${
                isDark ? "text-blue-400" : "text-blue-700"
              }`}
            >
              +15.2%
            </span>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={data.clients.clientsByMonth}>
            <defs>
              <linearGradient id="clientsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={isDark ? "#ffffff10" : "#E5E7EB"}
            />
            <XAxis
              dataKey="month"
              stroke={isDark ? "#ffffff30" : "#9CA3AF"}
              tick={{ fill: isDark ? "#ffffff60" : "#6B7280" }}
            />
            <YAxis
              stroke={isDark ? "#ffffff30" : "#9CA3AF"}
              tick={{ fill: isDark ? "#ffffff60" : "#6B7280" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? "#1F2937" : "white",
                border: isDark ? "1px solid #ffffff20" : "1px solid #E5E7EB",
                borderRadius: "12px",
                padding: "12px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                color: isDark ? "#fff" : "#374151",
              }}
              labelStyle={{
                color: isDark ? "#ffffff80" : "#374151",
                marginBottom: "8px",
              }}
              formatter={(value: any) => [value, "Клиентов"]}
            />
            <Area
              type="monotone"
              dataKey="clients"
              stroke="#3B82F6"
              strokeWidth={3}
              fill="url(#clientsGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Двухколоночная секция */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Распределение клиентов */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className={`rounded-2xl p-6 transition-all duration-300 ${glassCls}`}
        >
          <div className="flex items-center gap-3 mb-6">
            <div
              className={`p-2 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500`}
            >
              <PieChartIcon className="w-5 h-5 text-white" />
            </div>
            <h3
              className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}
            >
              Распределение клиентов
            </h3>
          </div>

          <ResponsiveContainer width="100%" height={250}>
            <RechartsPieChart>
              <Pie
                data={clientTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry: any) => {
                  const dataItem = clientTypeData[entry.index];
                  const percent =
                    (dataItem.value / data.clients.totalClients) * 100;
                  return `${dataItem.name} ${percent.toFixed(0)}%`;
                }}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {clientTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? "#1F2937" : "white",
                  border: isDark ? "1px solid #ffffff20" : "1px solid #E5E7EB",
                  borderRadius: "12px",
                  padding: "12px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
              />
            </RechartsPieChart>
          </ResponsiveContainer>

          <div className="mt-4 space-y-2">
            {clientTypeData.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span
                    className={`text-sm ${isDark ? "text-white/70" : "text-gray-700"}`}
                  >
                    {item.name}
                  </span>
                </div>
                <span
                  className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}
                >
                  {item.value} клиентов
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Ключевые показатели */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className={`rounded-2xl p-6 transition-all duration-300 ${glassCls}`}
        >
          <div className="flex items-center gap-3 mb-6">
            <div
              className={`p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500`}
            >
              <Target className="w-5 h-5 text-white" />
            </div>
            <h3
              className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}
            >
              Ключевые показатели
            </h3>
          </div>

          <div className="space-y-4">
            <div
              className={`p-4 rounded-xl ${
                isDark
                  ? "bg-blue-500/20 border border-blue-500/30"
                  : "bg-blue-50 border border-blue-200"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Target
                  className={`w-5 h-5 ${isDark ? "text-blue-400" : "text-blue-600"}`}
                />
                <span
                  className={`text-sm font-medium ${isDark ? "text-blue-400" : "text-blue-900"}`}
                >
                  Конверсия в постоянных
                </span>
              </div>
              <div
                className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"} mb-1`}
              >
                {data.clients.totalClients > 0
                  ? (
                      (data.clients.returningClients /
                        data.clients.totalClients) *
                      100
                    ).toFixed(1)
                  : "0.0"}
                %
              </div>
              <p
                className={`text-xs ${isDark ? "text-white/40" : "text-gray-600"}`}
              >
                {data.clients.returningClients} из {data.clients.totalClients}{" "}
                клиентов вернулись
              </p>
            </div>

            <div
              className={`p-4 rounded-xl ${
                isDark
                  ? "bg-emerald-500/20 border border-emerald-500/30"
                  : "bg-emerald-50 border border-emerald-200"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <UserPlus
                  className={`w-5 h-5 ${isDark ? "text-emerald-400" : "text-emerald-600"}`}
                />
                <span
                  className={`text-sm font-medium ${isDark ? "text-emerald-400" : "text-emerald-900"}`}
                >
                  Активность новых клиентов
                </span>
              </div>
              <div
                className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"} mb-1`}
              >
                {data.clients.newClients}
              </div>
              <p
                className={`text-xs ${isDark ? "text-white/40" : "text-gray-600"}`}
              >
                За выбранный период
              </p>
            </div>

            <div
              className={`p-4 rounded-xl ${
                isDark
                  ? "bg-purple-500/20 border border-purple-500/30"
                  : "bg-purple-50 border border-purple-200"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Heart
                  className={`w-5 h-5 ${isDark ? "text-purple-400" : "text-purple-600"}`}
                />
                <span
                  className={`text-sm font-medium ${isDark ? "text-purple-400" : "text-purple-900"}`}
                >
                  Лояльность клиентов
                </span>
              </div>
              <div
                className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"} mb-1`}
              >
                {data.clients.retentionRate.toFixed(1)}%
              </div>
              <p
                className={`text-xs ${isDark ? "text-white/40" : "text-gray-600"}`}
              >
                Retention rate за период
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Дополнительная статистика */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className={`rounded-2xl p-6 transition-all duration-300 bg-gradient-to-br from-blue-500/10 via-cyan-500/10 to-blue-500/5 border ${
          isDark ? "border-blue-500/20" : "border-blue-200"
        }`}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
            <Info className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3
              className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}
            >
              Статистика активности
            </h3>
            <p
              className={`text-sm ${isDark ? "text-white/40" : "text-gray-600"}`}
            >
              Основные показатели за выбранный период
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            className={`p-5 rounded-xl ${isDark ? "bg-white/[0.04] border border-white/[0.05]" : "bg-white border border-gray-200/50"}`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Activity
                className={`w-4 h-4 ${isDark ? "text-blue-400" : "text-blue-600"}`}
              />
              <span
                className={`text-sm ${isDark ? "text-white/60" : "text-gray-600"}`}
              >
                Всего записей
              </span>
            </div>
            <div
              className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"} mb-1`}
            >
              {data.appointments.totalAppointments.toLocaleString()}
            </div>
            <div
              className={`text-xs ${isDark ? "text-white/30" : "text-gray-400"}`}
            >
              Завершено: {data.appointments.completedAppointments}
            </div>
          </div>

          <div
            className={`p-5 rounded-xl ${isDark ? "bg-white/[0.04] border border-white/[0.05]" : "bg-white border border-gray-200/50"}`}
          >
            <div className="flex items-center gap-2 mb-2">
              <DollarSign
                className={`w-4 h-4 ${isDark ? "text-emerald-400" : "text-emerald-600"}`}
              />
              <span
                className={`text-sm ${isDark ? "text-white/60" : "text-gray-600"}`}
              >
                Средний чек
              </span>
            </div>
            <div
              className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"} mb-1`}
            >
              {data.financial.averageCheck.toLocaleString()} ₽
            </div>
            <div
              className={`text-xs ${isDark ? "text-white/30" : "text-gray-400"}`}
            >
              На одного клиента
            </div>
          </div>

          <div
            className={`p-5 rounded-xl ${isDark ? "bg-white/[0.04] border border-white/[0.05]" : "bg-white border border-gray-200/50"}`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Target
                className={`w-4 h-4 ${isDark ? "text-purple-400" : "text-purple-600"}`}
              />
              <span
                className={`text-sm ${isDark ? "text-white/60" : "text-gray-600"}`}
              >
                Конверсия
              </span>
            </div>
            <div
              className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"} mb-1`}
            >
              {data.appointments.conversionRate.toFixed(1)}%
            </div>
            <div
              className={`text-xs ${isDark ? "text-white/30" : "text-gray-400"}`}
            >
              В завершенные записи
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ===== ВКЛАДКА "РОСТ БАЗЫ" =====
function GrowthTab({
  data,
  isDark,
}: {
  data: KeyMetricsResponse;
  isDark: boolean;
}) {
  const { formatNumber } = useAnalytics();

  const glassCls = isDark
    ? "bg-white/[0.07] backdrop-blur-2xl border border-white/[0.1]"
    : "bg-white border border-gray-200/70";

  return (
    <div className="space-y-6">
      {/* График роста */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl p-6 transition-all duration-300 ${glassCls}`}
      >
        <h3
          className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"} mb-6`}
        >
          Динамика роста клиентской базы
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={data.clients.clientsByMonth}>
            <defs>
              <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.6} />
                <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={isDark ? "#ffffff10" : "#E5E7EB"}
            />
            <XAxis
              dataKey="month"
              stroke={isDark ? "#ffffff30" : "#9CA3AF"}
              tick={{ fill: isDark ? "#ffffff60" : "#6B7280" }}
            />
            <YAxis
              stroke={isDark ? "#ffffff30" : "#9CA3AF"}
              tick={{ fill: isDark ? "#ffffff60" : "#6B7280" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? "#1F2937" : "white",
                border: isDark ? "1px solid #ffffff20" : "1px solid #E5E7EB",
                borderRadius: "12px",
                padding: "12px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
              labelStyle={{
                color: isDark ? "#ffffff80" : "#374151",
                marginBottom: "8px",
              }}
              formatter={(value: any) => [value, "Клиентов"]}
            />
            <Area
              type="monotone"
              dataKey="clients"
              stroke="#3B82F6"
              strokeWidth={2}
              fill="url(#growthGradient)"
              name="Клиентов"
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Статистика прироста */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className={`rounded-2xl p-6 transition-all duration-300 ${glassCls}`}
        >
          <div className="flex items-center gap-2 mb-4">
            <div
              className={`p-2 rounded-xl ${isDark ? "bg-blue-500/20" : "bg-blue-100"}`}
            >
              <Users
                className={`w-5 h-5 ${isDark ? "text-blue-400" : "text-blue-600"}`}
              />
            </div>
            <h4
              className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}
            >
              Всего клиентов
            </h4>
          </div>
          <div
            className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-900"} mb-2`}
          >
            {formatNumber(data.clients.totalClients)}
          </div>
          <p
            className={`text-sm ${isDark ? "text-white/40" : "text-gray-600"}`}
          >
            Общая база клиентов
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`rounded-2xl p-6 transition-all duration-300 ${glassCls}`}
        >
          <div className="flex items-center gap-2 mb-4">
            <div
              className={`p-2 rounded-xl ${isDark ? "bg-emerald-500/20" : "bg-emerald-100"}`}
            >
              <UserPlus
                className={`w-5 h-5 ${isDark ? "text-emerald-400" : "text-emerald-600"}`}
              />
            </div>
            <h4
              className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}
            >
              Новых клиентов
            </h4>
          </div>
          <div
            className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-900"} mb-2`}
          >
            +{formatNumber(data.clients.newClients)}
          </div>
          <p
            className={`text-sm ${isDark ? "text-white/40" : "text-gray-600"}`}
          >
            Прирост за период
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className={`rounded-2xl p-6 transition-all duration-300 ${glassCls}`}
        >
          <div className="flex items-center gap-2 mb-4">
            <div
              className={`p-2 rounded-xl ${isDark ? "bg-purple-500/20" : "bg-purple-100"}`}
            >
              <Activity
                className={`w-5 h-5 ${isDark ? "text-purple-400" : "text-purple-600"}`}
              />
            </div>
            <h4
              className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}
            >
              Темп роста
            </h4>
          </div>
          <div
            className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-900"} mb-2`}
          >
            {data.clients.totalClients > 0
              ? (
                  (data.clients.newClients / data.clients.totalClients) *
                  100
                ).toFixed(1)
              : 0}
            %
          </div>
          <p
            className={`text-sm ${isDark ? "text-white/40" : "text-gray-600"}`}
          >
            За выбранный период
          </p>
        </motion.div>
      </div>
    </div>
  );
}

// ===== ВКЛАДКА "УДЕРЖАНИЕ" =====
function RetentionTab({
  data,
  isDark,
}: {
  data: KeyMetricsResponse;
  isDark: boolean;
}) {
  const { formatPercent, formatNumber } = useAnalytics();

  const glassCls = isDark
    ? "bg-white/[0.07] backdrop-blur-2xl border border-white/[0.1]"
    : "bg-white border border-gray-200/70";

  return (
    <div className="space-y-6">
      {/* Ключевые метрики удержания */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`rounded-2xl p-6 transition-all duration-300 bg-gradient-to-br from-rose-500/20 via-pink-500/20 to-rose-500/10 border ${
            isDark ? "border-rose-500/30" : "border-rose-200"
          }`}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-rose-500 to-pink-500 rounded-xl">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3
                className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}
              >
                Уровень удержания
              </h3>
              <p
                className={`text-sm ${isDark ? "text-white/40" : "text-gray-600"}`}
              >
                Retention Rate
              </p>
            </div>
          </div>
          <div
            className={`text-5xl font-bold ${isDark ? "text-rose-400" : "text-rose-600"} mb-2`}
          >
            {formatPercent(data.clients.retentionRate)}
          </div>
          <p
            className={`text-sm ${isDark ? "text-white/70" : "text-gray-700"}`}
          >
            {data.clients.returningClients} клиентов вернулись повторно
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`rounded-2xl p-6 transition-all duration-300 bg-gradient-to-br from-purple-500/20 via-blue-500/20 to-purple-500/10 border ${
            isDark ? "border-purple-500/30" : "border-purple-200"
          }`}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl">
              <Repeat className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3
                className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}
              >
                Повторные клиенты
              </h3>
              <p
                className={`text-sm ${isDark ? "text-white/40" : "text-gray-600"}`}
              >
                Вернулись за период
              </p>
            </div>
          </div>
          <div
            className={`text-5xl font-bold ${isDark ? "text-purple-400" : "text-purple-600"} mb-2`}
          >
            {formatNumber(data.clients.returningClients)}
          </div>
          <p
            className={`text-sm ${isDark ? "text-white/70" : "text-gray-700"}`}
          >
            Из {data.clients.totalClients} общих клиентов
          </p>
        </motion.div>

        {/* ← ДОБАВЛЕНО: Repeat Clients Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className={`rounded-2xl p-6 transition-all duration-300 bg-gradient-to-br from-amber-500/20 via-orange-500/20 to-amber-500/10 border ${
            isDark ? "border-amber-500/30" : "border-amber-200"
          }`}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3
                className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}
              >
                Активные повторы
              </h3>
              <p
                className={`text-sm ${isDark ? "text-white/40" : "text-gray-600"}`}
              >
                2+ визита в периоде
              </p>
            </div>
          </div>
          <div
            className={`text-5xl font-bold ${isDark ? "text-amber-400" : "text-amber-600"} mb-2`}
          >
            {formatNumber(data.clients.repeatClients)}
          </div>
          <p
            className={`text-sm ${isDark ? "text-white/70" : "text-gray-700"}`}
          >
            {formatPercent(data.clients.repeatRate)} от общей базы
          </p>
        </motion.div>

        {/* ← ДОБАВЛЕНО: Repeat Rate Card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className={`rounded-2xl p-6 transition-all duration-300 bg-gradient-to-br from-cyan-500/20 via-teal-500/20 to-cyan-500/10 border ${
            isDark ? "border-cyan-500/30" : "border-cyan-200"
          }`}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-xl">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3
                className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}
              >
                Частота визитов
              </h3>
              <p
                className={`text-sm ${isDark ? "text-white/40" : "text-gray-600"}`}
              >
                Repeat Rate
              </p>
            </div>
          </div>
          <div
            className={`text-5xl font-bold ${isDark ? "text-cyan-400" : "text-cyan-600"} mb-2`}
          >
            {formatPercent(data.clients.repeatRate)}
          </div>
          <p
            className={`text-sm ${isDark ? "text-white/70" : "text-gray-700"}`}
          >
            Клиенты с множественными визитами
          </p>
        </motion.div>
      </div>

      {/* Дополнительная статистика */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`rounded-2xl p-6 transition-all duration-300 ${glassCls}`}
      >
        <h3
          className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"} mb-6`}
        >
          Анализ лояльности
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            className={`p-4 rounded-xl ${
              isDark
                ? "bg-emerald-500/20 border border-emerald-500/30"
                : "bg-emerald-50 border border-emerald-200"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2
                className={`w-5 h-5 ${isDark ? "text-emerald-400" : "text-emerald-600"}`}
              />
              <span
                className={`text-sm font-medium ${isDark ? "text-emerald-400" : "text-emerald-900"}`}
              >
                Активные клиенты
              </span>
            </div>
            <div
              className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}
            >
              {formatNumber(data.clients.totalClients)}
            </div>
          </div>

          <div
            className={`p-4 rounded-xl ${
              isDark
                ? "bg-blue-500/20 border border-blue-500/30"
                : "bg-blue-50 border border-blue-200"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <UserPlus
                className={`w-5 h-5 ${isDark ? "text-blue-400" : "text-blue-600"}`}
              />
              <span
                className={`text-sm font-medium ${isDark ? "text-blue-400" : "text-blue-900"}`}
              >
                Новые за период
              </span>
            </div>
            <div
              className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}
            >
              {formatNumber(data.clients.newClients)}
            </div>
          </div>

          <div
            className={`p-4 rounded-xl ${
              isDark
                ? "bg-purple-500/20 border border-purple-500/30"
                : "bg-purple-50 border border-purple-200"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Award
                className={`w-5 h-5 ${isDark ? "text-purple-400" : "text-purple-600"}`}
              />
              <span
                className={`text-sm font-medium ${isDark ? "text-purple-400" : "text-purple-900"}`}
              >
                Лояльные клиенты
              </span>
            </div>
            <div
              className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}
            >
              {formatNumber(data.clients.returningClients)}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ===== ВКЛАДКА "СЕГМЕНТАЦИЯ" =====
function SegmentationTab({
  data,
  isDark,
}: {
  data: KeyMetricsResponse;
  isDark: boolean;
}) {
  const { formatNumber, formatPercent } = useAnalytics();

  const glassCls = isDark
    ? "bg-white/[0.07] backdrop-blur-2xl border border-white/[0.1]"
    : "bg-white border border-gray-200/70";

  const segmentData = [
    {
      name: "Новые клиенты",
      value: data.clients.newClients,
      percentage:
        data.clients.totalClients > 0
          ? (data.clients.newClients / data.clients.totalClients) * 100
          : 0,
      color: "#10B981",
      icon: UserPlus,
    },
    {
      name: "Вернувшиеся клиенты",
      value: data.clients.returningClients,
      percentage:
        data.clients.totalClients > 0
          ? (data.clients.returningClients / data.clients.totalClients) * 100
          : 0,
      color: "#8B5CF6",
      icon: Repeat,
    },
    {
      name: "Активные повторы",
      value: data.clients.repeatClients,
      percentage:
        data.clients.totalClients > 0
          ? (data.clients.repeatClients / data.clients.totalClients) * 100
          : 0,
      color: "#F59E0B",
      icon: Zap,
    },
  ];

  // Данные для круговой диаграммы
  const pieData = [
    { name: "Новые", value: data.clients.newClients, color: "#10B981" },
    {
      name: "Вернувшиеся",
      value: data.clients.returningClients,
      color: "#8B5CF6",
    },
    {
      name: "Активные повторы",
      value: data.clients.repeatClients,
      color: "#F59E0B",
    },
  ].filter((item) => item.value > 0);

  return (
    <div className="space-y-6">
      {/* Сегментация клиентов - прогресс бары */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl p-6 transition-all duration-300 ${glassCls}`}
      >
        <h3
          className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"} mb-6`}
        >
          Сегментация клиентской базы
        </h3>

        <div className="space-y-4">
          {segmentData.map((segment, index) => {
            const Icon = segment.icon;
            return (
              <div
                key={index}
                className={`p-5 rounded-xl ${
                  isDark
                    ? "bg-white/[0.04] border border-white/[0.05]"
                    : "bg-gray-50 border border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="p-2 rounded-lg"
                      style={{ backgroundColor: `${segment.color}20` }}
                    >
                      <Icon
                        className="w-5 h-5"
                        style={{ color: segment.color }}
                      />
                    </div>
                    <div>
                      <h4
                        className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}
                      >
                        {segment.name}
                      </h4>
                      <p
                        className={`text-sm ${isDark ? "text-white/40" : "text-gray-600"}`}
                      >
                        {formatPercent(segment.percentage)} от общей базы
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}
                    >
                      {formatNumber(segment.value)}
                    </div>
                    <div
                      className={`text-sm ${isDark ? "text-white/40" : "text-gray-600"}`}
                    >
                      клиентов
                    </div>
                  </div>
                </div>
                <div
                  className={`h-2 ${isDark ? "bg-white/[0.07]" : "bg-gray-200"} rounded-full overflow-hidden`}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${segment.percentage}%` }}
                    transition={{ duration: 1, delay: index * 0.2 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: segment.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Двухколоночная секция: Диаграмма + Рекомендации */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Круговая диаграмма */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className={`rounded-2xl p-6 transition-all duration-300 ${glassCls}`}
        >
          <div className="flex items-center gap-3 mb-6">
            <div
              className={`p-2 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500`}
            >
              <PieChartIcon className="w-5 h-5 text-white" />
            </div>
            <h3
              className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}
            >
              Распределение сегментов
            </h3>
          </div>

          <ResponsiveContainer width="100%" height={280}>
            <RechartsPieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry: any) => {
                  const percent = entry.percent * 100;
                  return `${entry.name}: ${percent.toFixed(0)}%`;
                }}
                outerRadius={90}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? "#1F2937" : "white",
                  border: isDark ? "1px solid #ffffff20" : "1px solid #E5E7EB",
                  borderRadius: "12px",
                  padding: "12px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
                formatter={(value, name) => {
                  const numValue = typeof value === "number" ? value : 0;
                  return [`${formatNumber(numValue)} клиентов`, name];
                }}
              />
            </RechartsPieChart>
          </ResponsiveContainer>

          {/* Легенда */}
          <div className="mt-4 grid grid-cols-3 gap-2">
            {pieData.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span
                  className={`text-xs ${isDark ? "text-white/60" : "text-gray-600"}`}
                >
                  {item.name}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Рекомендации */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className={`rounded-2xl p-6 transition-all duration-300 bg-gradient-to-br from-blue-500/10 via-cyan-500/10 to-blue-500/5 border ${
            isDark ? "border-blue-500/20" : "border-blue-200"
          }`}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <h3
              className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}
            >
              Рекомендации
            </h3>
          </div>

          <div className="space-y-3">
            <div
              className={`p-4 rounded-xl ${
                isDark
                  ? "bg-white/[0.04] border border-white/[0.05]"
                  : "bg-white border border-gray-200/50"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Target
                  className={`w-5 h-5 ${isDark ? "text-blue-400" : "text-blue-600"}`}
                />
                <h4
                  className={`font-semibold ${isDark ? "text-blue-400" : "text-blue-900"}`}
                >
                  Новые клиенты (
                  {formatPercent(
                    data.clients.totalClients > 0
                      ? (data.clients.newClients / data.clients.totalClients) *
                          100
                      : 0,
                  )}
                  )
                </h4>
              </div>
              <p
                className={`text-sm ${isDark ? "text-white/60" : "text-gray-700"}`}
              >
                Сфокусируйтесь на адаптации и создании позитивного первого
                впечатления
              </p>
            </div>

            <div
              className={`p-4 rounded-xl ${
                isDark
                  ? "bg-white/[0.04] border border-white/[0.05]"
                  : "bg-white border border-gray-200/50"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Heart
                  className={`w-5 h-5 ${isDark ? "text-purple-400" : "text-purple-600"}`}
                />
                <h4
                  className={`font-semibold ${isDark ? "text-purple-400" : "text-purple-900"}`}
                >
                  Вернувшиеся (
                  {formatPercent(
                    data.clients.totalClients > 0
                      ? (data.clients.returningClients /
                          data.clients.totalClients) *
                          100
                      : 0,
                  )}
                  )
                </h4>
              </div>
              <p
                className={`text-sm ${isDark ? "text-white/60" : "text-gray-700"}`}
              >
                Внедрите программу лояльности для увеличения частоты визитов
              </p>
            </div>

            <div
              className={`p-4 rounded-xl ${
                isDark
                  ? "bg-white/[0.04] border border-white/[0.05]"
                  : "bg-white border border-gray-200/50"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Zap
                  className={`w-5 h-5 ${isDark ? "text-amber-400" : "text-amber-600"}`}
                />
                <h4
                  className={`font-semibold ${isDark ? "text-amber-400" : "text-amber-900"}`}
                >
                  Активные повторы ({formatPercent(data.clients.repeatRate)})
                </h4>
              </div>
              <p
                className={`text-sm ${isDark ? "text-white/60" : "text-gray-700"}`}
              >
                {data.clients.repeatRate > 30
                  ? "Отличная база для VIP-программы! Предложите эксклюзивные бонусы."
                  : "Работайте над увеличением частоты визитов через персональные предложения."}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Ключевой инсайт */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={`rounded-2xl p-6 transition-all duration-300 ${
          isDark
            ? "bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-amber-500/5 border border-amber-500/20"
            : "bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 border border-amber-200"
        }`}
      >
        <div className="flex items-center gap-3 mb-4">
          <div
            className={`p-2 rounded-xl ${isDark ? "bg-amber-500/20" : "bg-amber-100"}`}
          >
            <Info
              className={`w-5 h-5 ${isDark ? "text-amber-400" : "text-amber-600"}`}
            />
          </div>
          <h3
            className={`text-lg font-bold ${isDark ? "text-amber-400" : "text-amber-900"}`}
          >
            Ключевой инсайт
          </h3>
        </div>

        <p
          className={`text-sm ${isDark ? "text-white/70" : "text-gray-700"} mb-4`}
        >
          Структура вашей клиентской базы:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            className={`p-4 rounded-xl ${isDark ? "bg-white/[0.04]" : "bg-white/60"}`}
          >
            <div
              className={`text-2xl font-bold ${isDark ? "text-emerald-400" : "text-emerald-600"} mb-1`}
            >
              {formatPercent(
                data.clients.totalClients > 0
                  ? (data.clients.newClients / data.clients.totalClients) * 100
                  : 0,
              )}
            </div>
            <div
              className={`text-xs ${isDark ? "text-white/50" : "text-gray-600"}`}
            >
              Доля новых клиентов
            </div>
          </div>

          <div
            className={`p-4 rounded-xl ${isDark ? "bg-white/[0.04]" : "bg-white/60"}`}
          >
            <div
              className={`text-2xl font-bold ${isDark ? "text-purple-400" : "text-purple-600"} mb-1`}
            >
              {formatPercent(data.clients.retentionRate)}
            </div>
            <div
              className={`text-xs ${isDark ? "text-white/50" : "text-gray-600"}`}
            >
              Retention Rate
            </div>
          </div>

          <div
            className={`p-4 rounded-xl ${isDark ? "bg-white/[0.04]" : "bg-white/60"}`}
          >
            <div
              className={`text-2xl font-bold ${isDark ? "text-amber-400" : "text-amber-600"} mb-1`}
            >
              {formatPercent(data.clients.repeatRate)}
            </div>
            <div
              className={`text-xs ${isDark ? "text-white/50" : "text-gray-gray-600"}`}
            >
              Repeat Rate (2+ визита)
            </div>
          </div>
        </div>

        <div
          className={`mt-4 p-3 rounded-xl ${isDark ? "bg-white/[0.04]" : "bg-white/60"}`}
        >
          <p
            className={`text-sm ${isDark ? "text-white/60" : "text-gray-700"}`}
          >
            {data.clients.retentionRate > 50 && data.clients.repeatRate > 30
              ? "✨ Отличная лояльность! У вас сильная база постоянных клиентов. Фокусируйтесь на удержании и развитии VIP-программы."
              : data.clients.retentionRate > 50
                ? "👍 Хорошее удержание, но есть потенциал для увеличения частоты визитов. Рекомендуется работа над повторными продажами."
                : "⚠️ Требуется внимание к удержанию. Рекомендуется улучшить программу лояльности и качество обслуживания."}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
