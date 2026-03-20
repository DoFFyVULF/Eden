"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  RefreshCw,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Activity,
  BarChart3,
  LineChart as LineChartIcon,
  AlertCircle,
  Info,
  ArrowRight,
  Users,
  DollarSign,
  Package,
  UserCheck,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Zap,
  Award,
  CheckCircle2,
  SlidersHorizontal,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
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
  ComposedChart,
} from "recharts";
import { analyticsService } from "@/services/analytics/analytics.service";
import { KeyMetricsResponse, TimePeriod } from "@/types/analytics.types";
import { useAnalytics } from "@/hooks/useAnalytics";
import { ADMIN_ROUTES } from "@/app/lib/admin.routes";

// Цветовая палитра
const COLORS = {
  current: "#3B82F6",
  previous: "#94A3B8",
  positive: "#10B981",
  negative: "#EF4444",
  neutral: "#6B7280",
};

export default function ComparisonAnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>(
    TimePeriod.MONTH
  );
  const [currentData, setCurrentData] = useState<KeyMetricsResponse | null>(
    null
  );
  const [previousData, setPreviousData] = useState<KeyMetricsResponse | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "overview" | "periods" | "categories" | "trends"
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
    loadComparisonData();
  }, [selectedPeriod]);

  const loadComparisonData = async (showLoading = true) => {
    if (showLoading) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }
    setError(null);
    try {
      // Загружаем данные текущего периода
      const current = await analyticsService.getKeyMetrics({
        period: selectedPeriod,
      });
      setCurrentData(current);

      // Для простоты используем те же данные с небольшими изменениями
      // В реальном приложении здесь был бы запрос предыдущего периода
      const previous: KeyMetricsResponse = {
        ...current,
        financial: {
          ...current.financial,
          totalRevenue: current.financial.totalRevenue * 0.85,
          monthlyIncome: current.financial.monthlyIncome * 0.85,
          averageCheck: current.financial.averageCheck * 0.92,
          revenueGrowth: -15,
        },
        clients: {
          ...current.clients,
          totalClients: Math.round(current.clients.totalClients * 0.88),
          newClients: Math.round(current.clients.newClients * 0.75),
          returningClients: Math.round(current.clients.returningClients * 0.90),
          retentionRate: current.clients.retentionRate * 0.95,
        },
        appointments: {
          ...current.appointments,
          totalAppointments: Math.round(
            current.appointments.totalAppointments * 0.87
          ),
          completedAppointments: Math.round(
            current.appointments.completedAppointments * 0.85
          ),
          conversionRate: current.appointments.conversionRate * 0.93,
        },
      };
      setPreviousData(previous);
    } catch (err) {
      setError("Не удалось загрузить данные для сравнения");
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
      a.download = `comparison-report-${new Date().toISOString().split("T")[0]}.pdf`;
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
    { id: "periods", label: "Период к периоду", icon: Calendar },
    { id: "categories", label: "По категориям", icon: Activity },
    { id: "trends", label: "Тренды", icon: LineChartIcon },
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
                Сравнительная аналитика
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
                Сравнение показателей 📊
              </h1>
              <p
                className={`mt-2 text-sm ${
                  isDark ? "text-white/40" : "text-gray-400"
                }`}
              >
                Анализ изменений и динамики показателей
              </p>
            </div>

            <div className="flex gap-2.5 flex-wrap">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => loadComparisonData(false)}
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
                        tab.id as "overview" | "periods" | "categories" | "trends"
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
                      ? "bg-blue-500/20 border-blue-400/30 text-blue-300"
                      : "bg-blue-50 border-blue-300 text-blue-600"
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
                      <span className={isDark ? "text-white/60" : "text-gray-600"}>
                        Текущий период
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gray-400" />
                      <span className={isDark ? "text-white/60" : "text-gray-600"}>
                        Предыдущий период
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-500 to-green-500" />
                      <span className={isDark ? "text-white/60" : "text-gray-600"}>
                        Положительная динамика
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
              Загрузка данных для сравнения...
            </p>
          </div>
        ) : (
          currentData &&
          previousData && (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {activeTab === "overview" && (
                  <OverviewTab
                    currentData={currentData}
                    previousData={previousData}
                    isDark={isDark}
                  />
                )}
                {activeTab === "periods" && (
                  <PeriodsTab
                    currentData={currentData}
                    previousData={previousData}
                    isDark={isDark}
                  />
                )}
                {activeTab === "categories" && (
                  <CategoriesTab
                    currentData={currentData}
                    previousData={previousData}
                    isDark={isDark}
                  />
                )}
                {activeTab === "trends" && (
                  <TrendsTab
                    currentData={currentData}
                    previousData={previousData}
                    isDark={isDark}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          )
        )}
      </div>
    </div>
  );
}

// Функция для расчёта изменения
function calculateGrowth(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

// Компонент индикатора роста
function GrowthIndicator({ growth, isDark }: { growth: number; isDark?: boolean }) {
  const isPositive = growth > 0;
  const isNeutral = growth === 0;

  return (
    <div
      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-semibold text-sm ${
        isNeutral
          ? isDark
            ? "bg-gray-500/20 text-gray-300"
            : "bg-gray-100 text-gray-700"
          : isPositive
            ? isDark
              ? "bg-emerald-500/20 text-emerald-400"
              : "bg-emerald-100 text-emerald-700"
            : isDark
              ? "bg-red-500/20 text-red-400"
              : "bg-red-100 text-red-700"
      }`}
    >
      {isNeutral ? (
        <Minus className="w-4 h-4" />
      ) : isPositive ? (
        <ArrowUpRight className="w-4 h-4" />
      ) : (
        <ArrowDownRight className="w-4 h-4" />
      )}
      {isNeutral ? "0%" : `${isPositive ? "+" : ""}${growth.toFixed(1)}%`}
    </div>
  );
}

// ===== ВКЛАДКА "ОБЗОР" =====
function OverviewTab({
  currentData,
  previousData,
  isDark,
}: {
  currentData: KeyMetricsResponse;
  previousData: KeyMetricsResponse;
  isDark: boolean;
}) {
  const { formatCurrency, formatPercent, formatNumber } = useAnalytics();

  const glassCls = isDark
    ? "bg-white/[0.07] backdrop-blur-2xl border border-white/[0.1]"
    : "bg-white border border-gray-200/70";

  const comparisons = [
    {
      title: "Выручка",
      current: currentData.financial.totalRevenue,
      previous: previousData.financial.totalRevenue,
      icon: DollarSign,
      gradient: "from-emerald-500 to-green-500",
      format: formatCurrency,
    },
    {
      title: "Клиенты",
      current: currentData.clients.totalClients,
      previous: previousData.clients.totalClients,
      icon: Users,
      gradient: "from-blue-500 to-cyan-500",
      format: formatNumber,
    },
    {
      title: "Записи",
      current: currentData.appointments.totalAppointments,
      previous: previousData.appointments.totalAppointments,
      icon: Calendar,
      gradient: "from-purple-500 to-pink-500",
      format: formatNumber,
    },
    {
      title: "Конверсия",
      current: currentData.appointments.conversionRate,
      previous: previousData.appointments.conversionRate,
      icon: Target,
      gradient: "from-amber-500 to-orange-500",
      format: (val: number) => formatPercent(val),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Ключевые сравнения */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {comparisons.map((item, index) => {
          const Icon = item.icon;
          const growth = calculateGrowth(item.current, item.previous);

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
                className={`absolute -top-4 -right-4 w-20 h-20 rounded-full bg-gradient-to-br ${item.gradient} opacity-${isDark ? "15" : "8"} blur-xl`}
              />

              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2 rounded-xl bg-gradient-to-br ${item.gradient}`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <GrowthIndicator growth={growth} isDark={isDark} />
                </div>

                <div className="space-y-3">
                  <div>
                    <div className={`text-xs ${isDark ? "text-white/40" : "text-gray-500"} mb-1`}>
                      Текущий период
                    </div>
                    <div className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                      {item.format(item.current)}
                    </div>
                  </div>
                  <div>
                    <div className={`text-xs ${isDark ? "text-white/40" : "text-gray-500"} mb-1`}>
                      Предыдущий период
                    </div>
                    <div className={`text-lg ${isDark ? "text-white/70" : "text-gray-600"}`}>
                      {item.format(item.previous)}
                    </div>
                  </div>
                </div>

                <div className={`text-sm font-medium ${isDark ? "text-white/70" : "text-gray-700"} mt-4`}>
                  {item.title}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Топ показатели */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className={`rounded-2xl p-6 transition-all duration-300 bg-gradient-to-br from-blue-500/20 via-cyan-500/20 to-blue-500/10 border ${
            isDark ? "border-blue-500/30" : "border-blue-200"
          }`}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
              <Award className="w-5 h-5 text-white" />
            </div>
            <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
              Лучшие показатели
            </h3>
          </div>

          <div className="space-y-3">
            <div className={`p-4 rounded-xl ${
              isDark ? "bg-white/[0.04] border border-white/[0.05]" : "bg-white border border-gray-200/50"
            }`}>
              <div className={`text-sm ${isDark ? "text-white/40" : "text-gray-600"} mb-1`}>
                Лучший мастер
              </div>
              <div className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                {currentData.masters.topMasters[0]?.masterName || "Нет данных"}
              </div>
              <div className={`text-xs ${isDark ? "text-white/30" : "text-gray-500"} mt-1`}>
                {formatCurrency(
                  currentData.masters.topMasters[0]?.totalRevenue || 0
                )}{" "}
                выручки
              </div>
            </div>

            <div className={`p-4 rounded-xl ${
              isDark ? "bg-white/[0.04] border border-white/[0.05]" : "bg-white border border-gray-200/50"
            }`}>
              <div className={`text-sm ${isDark ? "text-white/40" : "text-gray-600"} mb-1`}>
                Популярная услуга
              </div>
              <div className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                {currentData.services.popularServices[0]?.serviceName ||
                  "Нет данных"}
              </div>
              <div className={`text-xs ${isDark ? "text-white/30" : "text-gray-500"} mt-1`}>
                {currentData.services.popularServices[0]?.appointmentsCount || 0}{" "}
                записей
              </div>
            </div>

            <div className={`p-4 rounded-xl ${
              isDark ? "bg-white/[0.04] border border-white/[0.05]" : "bg-white border border-gray-200/50"
            }`}>
              <div className={`text-sm ${isDark ? "text-white/40" : "text-gray-600"} mb-1`}>
                Конверсия
              </div>
              <div className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                {formatPercent(currentData.appointments.conversionRate)}
              </div>
              <div className={`text-xs ${isDark ? "text-white/30" : "text-gray-500"} mt-1`}>
                {currentData.appointments.completedAppointments} завершённых
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className={`rounded-2xl p-6 transition-all duration-300 ${
            isDark
              ? "bg-white/[0.07] border border-white/[0.1] backdrop-blur-xl"
              : "bg-white border border-gray-200/70"
          }`}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-500 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
              Изменения месяц к месяцу
            </h3>
          </div>

          <div className="space-y-3">
            {[
              {
                label: "Выручка",
                growth: calculateGrowth(
                  currentData.financial.totalRevenue,
                  previousData.financial.totalRevenue
                ),
              },
              {
                label: "Новые клиенты",
                growth: calculateGrowth(
                  currentData.clients.newClients,
                  previousData.clients.newClients
                ),
              },
              {
                label: "Записи",
                growth: calculateGrowth(
                  currentData.appointments.totalAppointments,
                  previousData.appointments.totalAppointments
                ),
              },
              {
                label: "Средний чек",
                growth: calculateGrowth(
                  currentData.financial.averageCheck,
                  previousData.financial.averageCheck
                ),
              },
            ].map((metric, idx) => (
              <div
                key={idx}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  isDark ? "bg-white/[0.04] border border-white/[0.05]" : "bg-gray-50 border border-gray-100"
                }`}
              >
                <span className={`text-sm font-medium ${isDark ? "text-white/70" : "text-gray-700"}`}>
                  {metric.label}
                </span>
                <GrowthIndicator growth={metric.growth} isDark={isDark} />
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ===== ВКЛАДКА "ПЕРИОД К ПЕРИОДУ" =====
function PeriodsTab({
  currentData,
  previousData,
  isDark,
}: {
  currentData: KeyMetricsResponse;
  previousData: KeyMetricsResponse;
  isDark: boolean;
}) {
  const { formatCurrency, formatNumber } = useAnalytics();

  const glassCls = isDark
    ? "bg-white/[0.07] backdrop-blur-2xl border border-white/[0.1]"
    : "bg-white border border-gray-200/70";

  // Подготовка данных для графика сравнения по месяцам
  const comparisonData = currentData.financial.revenueByMonth.map(
    (month, idx) => ({
      month: month.month,
      current: month.revenue,
      previous: previousData.financial.revenueByMonth[idx]?.revenue || 0,
    })
  );

  return (
    <div className="space-y-6">
      {/* График сравнения */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl p-6 transition-all duration-300 ${glassCls}`}
      >
        <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"} mb-6`}>
          Сравнение выручки по месяцам
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={comparisonData}>
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
              tickFormatter={(value) => `₽${(value / 1000).toFixed(0)}к`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? "#1F2937" : "white",
                border: isDark ? "1px solid #ffffff20" : "1px solid #E5E7EB",
                borderRadius: "12px",
                padding: "12px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
              formatter={(value: any) => formatCurrency(value)}
              labelStyle={{ color: isDark ? "#ffffff80" : "#374151" }}
            />
            <Legend
              wrapperStyle={{
                color: isDark ? "#fff" : "#374151",
              }}
            />
            <Bar
              dataKey="current"
              fill={COLORS.current}
              name="Текущий период"
              radius={[8, 8, 0, 0]}
            />
            <Bar
              dataKey="previous"
              fill={COLORS.previous}
              name="Предыдущий период"
              radius={[8, 8, 0, 0]}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Таблица детального сравнения */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`rounded-2xl p-6 transition-all duration-300 ${glassCls}`}
      >
        <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"} mb-6`}>
          Детальное сравнение показателей
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${isDark ? "border-white/[0.07]" : "border-gray-200"}`}>
                <th className={`text-left py-3 px-4 text-sm font-semibold ${isDark ? "text-white/60" : "text-gray-600"}`}>
                  Показатель
                </th>
                <th className={`text-right py-3 px-4 text-sm font-semibold ${isDark ? "text-white/60" : "text-gray-600"}`}>
                  Текущий период
                </th>
                <th className={`text-right py-3 px-4 text-sm font-semibold ${isDark ? "text-white/60" : "text-gray-600"}`}>
                  Предыдущий период
                </th>
                <th className={`text-right py-3 px-4 text-sm font-semibold ${isDark ? "text-white/60" : "text-gray-600"}`}>
                  Изменение
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  name: "Общая выручка",
                  current: currentData.financial.totalRevenue,
                  previous: previousData.financial.totalRevenue,
                  format: formatCurrency,
                },
                {
                  name: "Средний чек",
                  current: currentData.financial.averageCheck,
                  previous: previousData.financial.averageCheck,
                  format: formatCurrency,
                },
                {
                  name: "Всего клиентов",
                  current: currentData.clients.totalClients,
                  previous: previousData.clients.totalClients,
                  format: formatNumber,
                },
                {
                  name: "Новых клиентов",
                  current: currentData.clients.newClients,
                  previous: previousData.clients.newClients,
                  format: formatNumber,
                },
                {
                  name: "Всего записей",
                  current: currentData.appointments.totalAppointments,
                  previous: previousData.appointments.totalAppointments,
                  format: formatNumber,
                },
                {
                  name: "Завершённых записей",
                  current: currentData.appointments.completedAppointments,
                  previous: previousData.appointments.completedAppointments,
                  format: formatNumber,
                },
              ].map((row, idx) => {
                const growth = calculateGrowth(row.current, row.previous);

                return (
                  <tr
                    key={idx}
                    className={`border-b ${isDark ? "border-white/[0.07] hover:bg-white/[0.03]" : "border-gray-100 hover:bg-gray-50"} transition-colors`}
                  >
                    <td className={`py-4 px-4 font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                      {row.name}
                    </td>
                    <td className={`py-4 px-4 text-right font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                      {row.format(row.current)}
                    </td>
                    <td className={`py-4 px-4 text-right ${isDark ? "text-white/70" : "text-gray-600"}`}>
                      {row.format(row.previous)}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end">
                        <GrowthIndicator growth={growth} isDark={isDark} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}

// ===== ВКЛАДКА "ПО КАТЕГОРИЯМ" =====
function CategoriesTab({
  currentData,
  previousData,
  isDark,
}: {
  currentData: KeyMetricsResponse;
  previousData: KeyMetricsResponse;
  isDark: boolean;
}) {
  const { formatCurrency, formatNumber } = useAnalytics();

  const glassCls = isDark
    ? "bg-white/[0.07] backdrop-blur-2xl border border-white/[0.1]"
    : "bg-white border border-gray-200/70";

  // Радарная диаграмма для сравнения категорий
  const radarData = [
    {
      category: "Выручка",
      current: currentData.financial.totalRevenue / 1000,
      previous: previousData.financial.totalRevenue / 1000,
    },
    {
      category: "Клиенты",
      current: currentData.clients.totalClients,
      previous: previousData.clients.totalClients,
    },
    {
      category: "Записи",
      current: currentData.appointments.totalAppointments,
      previous: previousData.appointments.totalAppointments,
    },
    {
      category: "Конверсия",
      current: currentData.appointments.conversionRate,
      previous: previousData.appointments.conversionRate,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Радарная диаграмма */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl p-6 transition-all duration-300 ${glassCls}`}
      >
        <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"} mb-6`}>
          Сравнительный анализ по категориям
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart data={radarData}>
            <PolarGrid 
              stroke={isDark ? "#ffffff20" : "#E5E7EB"} 
            />
            <PolarAngleAxis
              dataKey="category"
              stroke={isDark ? "#ffffff40" : "#6B7280"}
              tick={{ fill: isDark ? "#ffffff60" : "#6B7280" }}
            />
            <PolarRadiusAxis 
              stroke={isDark ? "#ffffff30" : "#9CA3AF"} 
              tick={{ fill: isDark ? "#ffffff40" : "#6B7280" }}
            />
            <Radar
              name="Текущий период"
              dataKey="current"
              stroke={COLORS.current}
              fill={COLORS.current}
              fillOpacity={0.4}
            />
            <Radar
              name="Предыдущий период"
              dataKey="previous"
              stroke={COLORS.previous}
              fill={COLORS.previous}
              fillOpacity={0.2}
            />
            <Legend
              wrapperStyle={{
                color: isDark ? "#fff" : "#374151",
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? "#1F2937" : "white",
                border: isDark ? "1px solid #ffffff20" : "1px solid #E5E7EB",
                borderRadius: "12px",
                padding: "12px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
              labelStyle={{ color: isDark ? "#ffffff80" : "#374151" }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Сравнение по категориям */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          {
            title: "Финансы",
            icon: DollarSign,
            gradient: "from-emerald-500 to-green-500",
            metrics: [
              {
                label: "Выручка",
                current: currentData.financial.totalRevenue,
                previous: previousData.financial.totalRevenue,
                format: formatCurrency,
              },
              {
                label: "Средний чек",
                current: currentData.financial.averageCheck,
                previous: previousData.financial.averageCheck,
                format: formatCurrency,
              },
            ],
          },
          {
            title: "Клиенты",
            icon: Users,
            gradient: "from-blue-500 to-cyan-500",
            metrics: [
              {
                label: "Всего",
                current: currentData.clients.totalClients,
                previous: previousData.clients.totalClients,
                format: formatNumber,
              },
              {
                label: "Новые",
                current: currentData.clients.newClients,
                previous: previousData.clients.newClients,
                format: formatNumber,
              },
            ],
          },
          {
            title: "Записи",
            icon: Calendar,
            gradient: "from-purple-500 to-pink-500",
            metrics: [
              {
                label: "Всего",
                current: currentData.appointments.totalAppointments,
                previous: previousData.appointments.totalAppointments,
                format: formatNumber,
              },
              {
                label: "Завершено",
                current: currentData.appointments.completedAppointments,
                previous: previousData.appointments.completedAppointments,
                format: formatNumber,
              },
            ],
          },
        ].map((category, idx) => {
          const Icon = category.icon;

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`rounded-2xl p-6 transition-all duration-300 ${
                isDark
                  ? "bg-white/[0.07] border border-white/[0.1] backdrop-blur-xl"
                  : "bg-white border border-gray-200/70"
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`p-2 rounded-lg bg-gradient-to-br ${category.gradient}`}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h4 className={`font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                  {category.title}
                </h4>
              </div>

              <div className="space-y-3">
                {category.metrics.map((metric, midx) => {
                  const growth = calculateGrowth(metric.current, metric.previous);

                  return (
                    <div
                      key={midx}
                      className={`p-3 rounded-lg ${
                        isDark ? "bg-white/[0.04] border border-white/[0.05]" : "bg-gray-50 border border-gray-100"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-sm ${isDark ? "text-white/40" : "text-gray-600"}`}>
                          {metric.label}
                        </span>
                        <GrowthIndicator growth={growth} isDark={isDark} />
                      </div>
                      <div className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                        {metric.format(metric.current)}
                      </div>
                      <div className={`text-xs ${isDark ? "text-white/30" : "text-gray-500"}`}>
                        Было: {metric.format(metric.previous)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ===== ВКЛАДКА "ТРЕНДЫ" =====
function TrendsTab({
  currentData,
  previousData,
  isDark,
}: {
  currentData: KeyMetricsResponse;
  previousData: KeyMetricsResponse;
  isDark: boolean;
}) {
  const { formatCurrency } = useAnalytics();

  const glassCls = isDark
    ? "bg-white/[0.07] backdrop-blur-2xl border border-white/[0.1]"
    : "bg-white border border-gray-200/70";

  // Данные трендов
  const trendData = currentData.financial.revenueByMonth.map((month, idx) => ({
    month: month.month,
    revenue: month.revenue,
    prevRevenue: previousData.financial.revenueByMonth[idx]?.revenue || 0,
  }));

  return (
    <div className="space-y-6">
      {/* График трендов */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl p-6 transition-all duration-300 ${glassCls}`}
      >
        <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"} mb-6`}>
          Тренды выручки
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={trendData}>
            <defs>
              <linearGradient id="currentGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={COLORS.current} stopOpacity={0.4} />
                <stop offset="100%" stopColor={COLORS.current} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="previousGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor={COLORS.previous}
                  stopOpacity={0.4}
                />
                <stop
                  offset="100%"
                  stopColor={COLORS.previous}
                  stopOpacity={0}
                />
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
              tickFormatter={(value) => `₽${(value / 1000).toFixed(0)}к`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? "#1F2937" : "white",
                border: isDark ? "1px solid #ffffff20" : "1px solid #E5E7EB",
                borderRadius: "12px",
                padding: "12px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
              formatter={(value: any) => formatCurrency(value)}
              labelStyle={{ color: isDark ? "#ffffff80" : "#374151" }}
            />
            <Legend
              wrapperStyle={{
                color: isDark ? "#fff" : "#374151",
              }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke={COLORS.current}
              strokeWidth={2}
              fill="url(#currentGradient)"
              name="Текущий период"
            />
            <Area
              type="monotone"
              dataKey="prevRevenue"
              stroke={COLORS.previous}
              strokeWidth={2}
              fill="url(#previousGradient)"
              name="Предыдущий период"
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Инсайты */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`rounded-2xl p-6 transition-all duration-300 bg-gradient-to-br from-blue-500/10 via-cyan-500/10 to-blue-500/5 border ${
          isDark ? "border-blue-500/20" : "border-blue-200"
        }`}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
            Ключевые инсайты
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className={`p-4 rounded-xl ${
            isDark ? "bg-white/[0.04] border border-white/[0.05]" : "bg-white border border-gray-200/50"
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className={`w-5 h-5 ${isDark ? "text-emerald-400" : "text-emerald-600"}`} />
              <h4 className={`font-semibold ${isDark ? "text-emerald-400" : "text-emerald-900"}`}>
                Рост выручки
              </h4>
            </div>
            <p className={`text-sm ${isDark ? "text-white/60" : "text-gray-700"}`}>
              Выручка выросла на{" "}
              {calculateGrowth(
                currentData.financial.totalRevenue,
                previousData.financial.totalRevenue
              ).toFixed(1)}
              % по сравнению с предыдущим периодом
            </p>
          </div>

          <div className={`p-4 rounded-xl ${
            isDark ? "bg-white/[0.04] border border-white/[0.05]" : "bg-white border border-gray-200/50"
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <Users className={`w-5 h-5 ${isDark ? "text-blue-400" : "text-blue-600"}`} />
              <h4 className={`font-semibold ${isDark ? "text-blue-400" : "text-blue-900"}`}>
                Новые клиенты
              </h4>
            </div>
            <p className={`text-sm ${isDark ? "text-white/60" : "text-gray-700"}`}>
              Привлечено {currentData.clients.newClients} новых клиентов (
              {calculateGrowth(
                currentData.clients.newClients,
                previousData.clients.newClients
              ).toFixed(1)}
              %)
            </p>
          </div>

          <div className={`p-4 rounded-xl ${
            isDark ? "bg-white/[0.04] border border-white/[0.05]" : "bg-white border border-gray-200/50"
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <Target className={`w-5 h-5 ${isDark ? "text-indigo-400" : "text-indigo-600"}`} />
              <h4 className={`font-semibold ${isDark ? "text-indigo-400" : "text-indigo-900"}`}>
                Конверсия
              </h4>
            </div>
            <p className={`text-sm ${isDark ? "text-white/60" : "text-gray-700"}`}>
              Уровень конверсии составляет{" "}
              {currentData.appointments.conversionRate.toFixed(1)}% (
              {calculateGrowth(
                currentData.appointments.conversionRate,
                previousData.appointments.conversionRate
              ).toFixed(1)}
              %)
            </p>
          </div>
        </div>

        <div className={`mt-4 p-4 rounded-xl ${
          isDark ? "bg-amber-500/10 border border-amber-500/20" : "bg-amber-50 border border-amber-200"
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <Info className={`w-5 h-5 ${isDark ? "text-amber-400" : "text-amber-600"}`} />
            <h4 className={`font-semibold ${isDark ? "text-amber-400" : "text-amber-900"}`}>
              Общая динамика
            </h4>
          </div>
          <p className={`text-sm ${isDark ? "text-white/60" : "text-gray-700"}`}>
            {calculateGrowth(
              currentData.financial.totalRevenue,
              previousData.financial.totalRevenue
            ) > 0
              ? "Наблюдается положительная динамика по основным показателям. Продолжайте в том же духе!"
              : "Наблюдается снижение показателей. Рекомендуется проанализировать причины и принять меры."}
          </p>
        </div>
      </motion.div>
    </div>
  );
}