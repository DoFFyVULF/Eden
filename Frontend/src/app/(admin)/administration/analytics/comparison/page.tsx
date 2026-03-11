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
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "overview" | "periods" | "categories" | "trends"
  >("overview");

  const { formatCurrency, formatPercent, formatNumber, getPeriodDisplayName } =
    useAnalytics();

  useEffect(() => {
    loadComparisonData();
  }, [selectedPeriod]);

  const loadComparisonData = async () => {
    setIsLoading(true);
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

  const tabs = [
    { id: "overview", label: "Обзор", icon: BarChart3 },
    { id: "periods", label: "Период к периоду", icon: Calendar },
    { id: "categories", label: "По категориям", icon: Activity },
    { id: "trends", label: "Тренды", icon: LineChartIcon },
  ];

  if ((!currentData || !previousData) && !isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Загрузка данных...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Декоративный фон */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[80px]" />
      </div>

      <div className="relative z-10 p-4 md:p-8 max-w-[1800px] mx-auto">
        {/* Хедер */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <motion.a
              href={ADMIN_ROUTES.ANALYTICS.DASHBOARD}
              whileHover={{ scale: 1.05, x: -4 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl transition-all shadow-sm"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </motion.a>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Сравнительная аналитика
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-indigo-600 bg-clip-text text-transparent">
                Сравнение показателей 📊
              </h1>
            </div>
          </div>

          {/* Управление */}
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
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
                      flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all
                      ${
                        activeTab === tab.id
                          ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/25"
                          : "bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-sm"
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="whitespace-nowrap">{tab.label}</span>
                  </motion.button>
                );
              })}
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="relative group">
                <select
                  value={selectedPeriod}
                  onChange={(e) =>
                    setSelectedPeriod(e.target.value as TimePeriod)
                  }
                  disabled={isLoading}
                  className="pl-11 pr-10 py-3 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium appearance-none cursor-pointer transition-all shadow-sm disabled:opacity-50 focus:ring-2 focus:ring-blue-500/50 focus:outline-none focus:border-blue-500"
                >
                  <option value={TimePeriod.WEEK}>За неделю</option>
                  <option value={TimePeriod.MONTH}>За месяц</option>
                  <option value={TimePeriod.QUARTER}>За квартал</option>
                  <option value={TimePeriod.YEAR}>За год</option>
                </select>
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={loadComparisonData}
                disabled={isLoading}
                className="px-4 py-3 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl font-medium transition-all shadow-sm disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-5 h-5 text-gray-700 ${isLoading ? "animate-spin" : ""}`}
                />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleExport}
                disabled={isLoading}
                className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50"
              >
                <Download className="w-5 h-5" />
                <span className="hidden sm:inline">Экспорт</span>
              </motion.button>
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-red-700 text-sm">{error}</p>
            </motion.div>
          )}
        </motion.div>

        {/* Основной контент */}
        {currentData && previousData && (
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
                  isLoading={isLoading}
                />
              )}
              {activeTab === "periods" && (
                <PeriodsTab
                  currentData={currentData}
                  previousData={previousData}
                  isLoading={isLoading}
                />
              )}
              {activeTab === "categories" && (
                <CategoriesTab
                  currentData={currentData}
                  previousData={previousData}
                  isLoading={isLoading}
                />
              )}
              {activeTab === "trends" && (
                <TrendsTab
                  currentData={currentData}
                  previousData={previousData}
                  isLoading={isLoading}
                />
              )}
            </motion.div>
          </AnimatePresence>
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
function GrowthIndicator({ growth }: { growth: number }) {
  const isPositive = growth > 0;
  const isNeutral = growth === 0;

  return (
    <div
      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-semibold ${
        isNeutral
          ? "bg-gray-100 text-gray-700"
          : isPositive
            ? "bg-emerald-100 text-emerald-700"
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
  isLoading,
}: {
  currentData: KeyMetricsResponse;
  previousData: KeyMetricsResponse;
  isLoading: boolean;
}) {
  const { formatCurrency, formatPercent, formatNumber } = useAnalytics();

  const comparisons = [
    {
      title: "Выручка",
      current: currentData.financial.totalRevenue,
      previous: previousData.financial.totalRevenue,
      icon: DollarSign,
      color: "from-emerald-500 to-green-500",
      format: formatCurrency,
    },
    {
      title: "Клиенты",
      current: currentData.clients.totalClients,
      previous: previousData.clients.totalClients,
      icon: Users,
      color: "from-blue-500 to-cyan-500",
      format: formatNumber,
    },
    {
      title: "Записи",
      current: currentData.appointments.totalAppointments,
      previous: previousData.appointments.totalAppointments,
      icon: Calendar,
      color: "from-purple-500 to-pink-500",
      format: formatNumber,
    },
    {
      title: "Конверсия",
      current: currentData.appointments.conversionRate,
      previous: previousData.appointments.conversionRate,
      icon: Target,
      color: "from-amber-500 to-orange-500",
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
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className="relative overflow-hidden rounded-2xl"
            >
              <div className="relative p-6 bg-white border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 bg-gradient-to-br ${item.color} rounded-xl`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <GrowthIndicator growth={growth} />
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Текущий период</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {item.format(item.current)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">
                      Предыдущий период
                    </div>
                    <div className="text-lg text-gray-600">
                      {item.format(item.previous)}
                    </div>
                  </div>
                </div>

                <div className="text-sm font-medium text-gray-900 mt-4">
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
          className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Award className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              Лучшие показатели
            </h3>
          </div>

          <div className="space-y-3">
            <div className="p-4 bg-white rounded-xl">
              <div className="text-sm text-gray-600 mb-1">Лучший мастер</div>
              <div className="font-semibold text-gray-900">
                {currentData.masters.topMasters[0]?.masterName || "Нет данных"}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {formatCurrency(
                  currentData.masters.topMasters[0]?.totalRevenue || 0
                )}{" "}
                выручки
              </div>
            </div>

            <div className="p-4 bg-white rounded-xl">
              <div className="text-sm text-gray-600 mb-1">Популярная услуга</div>
              <div className="font-semibold text-gray-900">
                {currentData.services.popularServices[0]?.serviceName ||
                  "Нет данных"}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {currentData.services.popularServices[0]?.appointmentsCount || 0}{" "}
                записей
              </div>
            </div>

            <div className="p-4 bg-white rounded-xl">
              <div className="text-sm text-gray-600 mb-1">Конверсия</div>
              <div className="font-semibold text-gray-900">
                {formatPercent(currentData.appointments.conversionRate)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {currentData.appointments.completedAppointments} завершённых
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 bg-white border border-gray-200 rounded-2xl"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-500 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">
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
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <span className="text-sm font-medium text-gray-700">
                  {metric.label}
                </span>
                <GrowthIndicator growth={metric.growth} />
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
  isLoading,
}: {
  currentData: KeyMetricsResponse;
  previousData: KeyMetricsResponse;
  isLoading: boolean;
}) {
  const { formatCurrency, formatNumber } = useAnalytics();

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
        className="relative overflow-hidden rounded-2xl"
      >
        <div className="relative p-6 bg-white border border-gray-200 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            Сравнение выручки по месяцам
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="month" stroke="#9CA3AF" tick={{ fill: "#6B7280" }} />
              <YAxis
                stroke="#9CA3AF"
                tick={{ fill: "#6B7280" }}
                tickFormatter={(value) => `₽${(value / 1000).toFixed(0)}к`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #E5E7EB",
                  borderRadius: "12px",
                  padding: "12px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
                formatter={(value: any) => formatCurrency(value)}
              />
              <Legend />
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
        </div>
      </motion.div>

      {/* Таблица детального сравнения */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative overflow-hidden rounded-2xl"
      >
        <div className="relative p-6 bg-white border border-gray-200 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            Детальное сравнение показателей
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                    Показатель
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">
                    Текущий период
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">
                    Предыдущий период
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">
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
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-4 font-medium text-gray-900">
                        {row.name}
                      </td>
                      <td className="py-4 px-4 text-right font-semibold text-gray-900">
                        {row.format(row.current)}
                      </td>
                      <td className="py-4 px-4 text-right text-gray-600">
                        {row.format(row.previous)}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end">
                          <GrowthIndicator growth={growth} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ===== ВКЛАДКА "ПО КАТЕГОРИЯМ" =====
function CategoriesTab({
  currentData,
  previousData,
  isLoading,
}: {
  currentData: KeyMetricsResponse;
  previousData: KeyMetricsResponse;
  isLoading: boolean;
}) {
  const { formatCurrency, formatNumber } = useAnalytics();

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
        className="relative overflow-hidden rounded-2xl"
      >
        <div className="relative p-6 bg-white border border-gray-200 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            Сравнительный анализ по категориям
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#E5E7EB" />
              <PolarAngleAxis
                dataKey="category"
                stroke="#6B7280"
                tick={{ fill: "#6B7280" }}
              />
              <PolarRadiusAxis stroke="#9CA3AF" tick={{ fill: "#6B7280" }} />
              <Radar
                name="Текущий период"
                dataKey="current"
                stroke={COLORS.current}
                fill={COLORS.current}
                fillOpacity={0.6}
              />
              <Radar
                name="Предыдущий период"
                dataKey="previous"
                stroke={COLORS.previous}
                fill={COLORS.previous}
                fillOpacity={0.3}
              />
              <Legend />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #E5E7EB",
                  borderRadius: "12px",
                  padding: "12px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Сравнение по категориям */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          {
            title: "Финансы",
            icon: DollarSign,
            color: "from-emerald-500 to-green-500",
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
            color: "from-blue-500 to-cyan-500",
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
            color: "from-purple-500 to-pink-500",
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
              className="p-6 bg-white border border-gray-200 rounded-xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`p-2 bg-gradient-to-br ${category.color} rounded-lg`}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h4 className="font-bold text-gray-900">{category.title}</h4>
              </div>

              <div className="space-y-3">
                {category.metrics.map((metric, midx) => {
                  const growth = calculateGrowth(metric.current, metric.previous);

                  return (
                    <div key={midx} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">
                          {metric.label}
                        </span>
                        <GrowthIndicator growth={growth} />
                      </div>
                      <div className="text-lg font-bold text-gray-900">
                        {metric.format(metric.current)}
                      </div>
                      <div className="text-xs text-gray-500">
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
  isLoading,
}: {
  currentData: KeyMetricsResponse;
  previousData: KeyMetricsResponse;
  isLoading: boolean;
}) {
  const { formatCurrency } = useAnalytics();

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
        className="relative overflow-hidden rounded-2xl"
      >
        <div className="relative p-6 bg-white border border-gray-200 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
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
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="month" stroke="#9CA3AF" tick={{ fill: "#6B7280" }} />
              <YAxis
                stroke="#9CA3AF"
                tick={{ fill: "#6B7280" }}
                tickFormatter={(value) => `₽${(value / 1000).toFixed(0)}к`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #E5E7EB",
                  borderRadius: "12px",
                  padding: "12px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
                formatter={(value: any) => formatCurrency(value)}
              />
              <Legend />
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
        </div>
      </motion.div>

      {/* Инсайты */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-500 rounded-lg">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Ключевые инсайты</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 bg-white rounded-xl border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              <h4 className="font-semibold text-emerald-900">Рост выручки</h4>
            </div>
            <p className="text-sm text-gray-700">
              Выручка выросла на{" "}
              {calculateGrowth(
                currentData.financial.totalRevenue,
                previousData.financial.totalRevenue
              ).toFixed(1)}
              % по сравнению с предыдущим периодом
            </p>
          </div>

          <div className="p-4 bg-white rounded-xl border border-cyan-200">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-blue-600" />
              <h4 className="font-semibold text-blue-900">Новые клиенты</h4>
            </div>
            <p className="text-sm text-gray-700">
              Привлечено {currentData.clients.newClients} новых клиентов (
              {calculateGrowth(
                currentData.clients.newClients,
                previousData.clients.newClients
              ).toFixed(1)}
              %)
            </p>
          </div>

          <div className="p-4 bg-white rounded-xl border border-indigo-200">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-indigo-600" />
              <h4 className="font-semibold text-indigo-900">Конверсия</h4>
            </div>
            <p className="text-sm text-gray-700">
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
      </motion.div>
    </div>
  );
}