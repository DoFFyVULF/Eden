"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Users,
  Receipt,
  Wallet,
  Download,
  RefreshCw,
  ArrowLeft,
  ChevronDown,
  Target,
  Activity,
  CreditCard,
  Clock,
  PieChart,
  BarChart3,
  LineChart as LineChartIcon,
  Zap,
  Award,
  AlertCircle,
  CheckCircle2,
  Info,
  Package,
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
} from "recharts";
import { analyticsService } from "@/services/analytics/analytics.service";
import {
  KeyMetricsResponse,
  TimePeriod,
  RevenueByMonth,
} from "@/types/analytics.types";
import { useAnalytics } from "@/hooks/useAnalytics";
import { ADMIN_ROUTES } from "@/app/lib/admin.routes";

// Цветовая палитра для светлой темы
const COLORS = {
  primary: ["#8B5CF6", "#6366F1", "#3B82F6", "#0EA5E9", "#06B6D4"],
  success: ["#10B981", "#059669", "#047857"],
  warning: ["#F59E0B", "#D97706", "#B45309"],
  danger: ["#EF4444", "#DC2626", "#B91C1C"],
  gradient: [
    "rgba(139, 92, 246, 0.8)",
    "rgba(99, 102, 241, 0.8)",
    "rgba(59, 130, 246, 0.8)",
    "rgba(14, 165, 233, 0.8)",
  ],
};

export default function FinancialAnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>(
    TimePeriod.MONTH
  );
  const [analyticsData, setAnalyticsData] = useState<KeyMetricsResponse | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "overview" | "trends" | "breakdown" | "comparison"
  >("overview");

  const { formatCurrency, formatPercent, formatNumber, getPeriodDisplayName } =
    useAnalytics();

  // Загрузка данных
  useEffect(() => {
    loadFinancialData();
  }, [selectedPeriod]);

  const loadFinancialData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await analyticsService.getKeyMetrics({
        period: selectedPeriod,
      });
      setAnalyticsData(data);
    } catch (err) {
      setError("Не удалось загрузить финансовые данные");
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
      a.download = `financial-report-${new Date().toISOString().split("T")[0]}.pdf`;
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
    { id: "trends", label: "Динамика", icon: LineChartIcon },
    { id: "breakdown", label: "Детализация", icon: PieChart },
    { id: "comparison", label: "Сравнение", icon: Activity },
  ];

  if (!analyticsData && !isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Загрузка данных...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Декоративный фон */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-violet-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[80px]" />
      </div>

      <div className="relative z-10 p-4 md:p-8 max-w-[1800px] mx-auto">
        {/* Хедер */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          {/* Навигация и заголовок */}
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
                <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-500 rounded-lg">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Финансовая аналитика
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-600 via-green-600 to-cyan-600 bg-clip-text text-transparent">
                Анализ доходов и выручки 💰
              </h1>
            </div>
          </div>

          {/* Управление */}
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Табы */}
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
                        tab.id as "overview" | "trends" | "breakdown" | "comparison"
                      )
                    }
                    className={`
                      flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all
                      ${
                        activeTab === tab.id
                          ? "bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-500/25"
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

            {/* Фильтры и экспорт */}
            <div className="flex flex-wrap gap-3">
              {/* Период */}
              <div className="relative group">
                <select
                  value={selectedPeriod}
                  onChange={(e) =>
                    setSelectedPeriod(e.target.value as TimePeriod)
                  }
                  disabled={isLoading}
                  className="pl-11 pr-10 py-3 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium appearance-none cursor-pointer transition-all shadow-sm disabled:opacity-50 focus:ring-2 focus:ring-emerald-500/50 focus:outline-none focus:border-emerald-500"
                >
                  <option value={TimePeriod.WEEK}>За неделю</option>
                  <option value={TimePeriod.MONTH}>За месяц</option>
                  <option value={TimePeriod.QUARTER}>За квартал</option>
                  <option value={TimePeriod.YEAR}>За год</option>
                </select>
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>

              {/* Обновить */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={loadFinancialData}
                disabled={isLoading}
                className="px-4 py-3 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl font-medium transition-all shadow-sm disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-5 h-5 text-gray-700 ${isLoading ? "animate-spin" : ""}`}
                />
              </motion.button>

              {/* Экспорт */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleExport}
                disabled={isLoading}
                className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-xl font-semibold shadow-lg shadow-emerald-500/25 transition-all disabled:opacity-50"
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
        {analyticsData && (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === "overview" && (
                <OverviewTab data={analyticsData} isLoading={isLoading} />
              )}
              {activeTab === "trends" && (
                <TrendsTab data={analyticsData} isLoading={isLoading} />
              )}
              {activeTab === "breakdown" && (
                <BreakdownTab data={analyticsData} isLoading={isLoading} />
              )}
              {activeTab === "comparison" && (
                <ComparisonTab data={analyticsData} isLoading={isLoading} />
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

// ===== ВКЛАДКА "ОБЗОР" =====
function OverviewTab({
  data,
  isLoading,
}: {
  data: KeyMetricsResponse;
  isLoading: boolean;
}) {
  const { formatCurrency, formatPercent, formatNumber } = useAnalytics();

  const stats = [
    {
      title: "Общая выручка",
      value: formatCurrency(data.financial.totalRevenue),
      change: data.financial.revenueGrowth,
      icon: Wallet,
      color: "from-emerald-500 to-green-500",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-600",
    },
    {
      title: "Месячный доход",
      value: formatCurrency(data.financial.monthlyIncome),
      change: 12.3,
      icon: DollarSign,
      color: "from-cyan-500 to-blue-500",
      bgColor: "bg-cyan-50",
      textColor: "text-cyan-600",
    },
    {
      title: "Средний чек",
      value: formatCurrency(data.financial.averageCheck),
      change: 8.7,
      icon: Receipt,
      color: "from-violet-500 to-purple-500",
      bgColor: "bg-violet-50",
      textColor: "text-violet-600",
    },
    {
      title: "Транзакций",
      value: formatNumber(data.appointments.totalAppointments),
      change: 15.2,
      icon: Activity,
      color: "from-fuchsia-500 to-pink-500",
      bgColor: "bg-fuchsia-50",
      textColor: "text-fuchsia-600",
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
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className="group relative overflow-hidden"
            >
              <div className="relative p-6 bg-white border border-gray-200 rounded-2xl hover:border-gray-300 hover:shadow-lg transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 ${stat.bgColor} rounded-xl`}>
                    <Icon className={`w-6 h-6 ${stat.textColor}`} />
                  </div>
                  <div
                    className={`
                    flex items-center gap-1 px-2.5 py-1 rounded-lg text-sm font-semibold
                    ${isPositive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}
                  `}
                  >
                    {isPositive ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    {Math.abs(stat.change).toFixed(1)}%
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600">{stat.title}</div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* График выручки за период */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative overflow-hidden rounded-2xl"
      >
        <div className="relative p-6 bg-white border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                Динамика выручки
              </h3>
              <p className="text-sm text-gray-500">
                Выручка по месяцам за выбранный период
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-100 rounded-lg">
              <TrendingUp className="w-4 h-4 text-emerald-700" />
              <span className="text-sm font-semibold text-emerald-700">
                +{formatPercent(data.financial.revenueGrowth)}
              </span>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={data.financial.revenueByMonth}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="month"
                stroke="#9CA3AF"
                tick={{ fill: "#6B7280" }}
              />
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
                labelStyle={{ color: "#374151", marginBottom: "8px" }}
                itemStyle={{ color: "#10B981", fontWeight: 600 }}
                formatter={(value: any) => [`₽${value.toLocaleString()}`, "Выручка"]}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#10B981"
                strokeWidth={3}
                fill="url(#revenueGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Двухколоночная секция */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Топ услуги */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="relative overflow-hidden rounded-2xl"
        >
          <div className="relative p-6 bg-white border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-violet-100 rounded-lg">
                <Package className="w-5 h-5 text-violet-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                Топ услуги по выручке
              </h3>
            </div>

            <div className="space-y-3">
              {data.services.popularServices.slice(0, 5).map((service, index) => {
                const percentage =
                  (service.totalRevenue / data.financial.totalRevenue) * 100;
                return (
                  <div
                    key={service.serviceId}
                    className="group p-4 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-xl transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-500 rounded-lg text-sm font-bold text-white">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">
                            {service.serviceName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {service.appointmentsCount} услуг
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg text-gray-900">
                          {formatCurrency(service.totalRevenue)}
                        </div>
                        <div className="text-xs text-emerald-600">
                          {percentage.toFixed(1)}% от общей выручки
                        </div>
                      </div>
                    </div>
                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                        className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Топ мастера */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="relative overflow-hidden rounded-2xl"
        >
          <div className="relative p-6 bg-white border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-cyan-100 rounded-lg">
                <Award className="w-5 h-5 text-cyan-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                Топ мастера по выручке
              </h3>
            </div>

            <div className="space-y-3">
              {data.masters.topMasters.slice(0, 5).map((master, index) => {
                const percentage =
                  (master.totalRevenue / data.financial.totalRevenue) * 100;
                return (
                  <div
                    key={master.masterId}
                    className="group p-4 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-xl transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg text-sm font-bold text-white">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">
                            {master.masterName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {master.appointmentsCount} записей
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg text-gray-900">
                          {formatCurrency(master.totalRevenue)}
                        </div>
                        <div className="text-xs text-emerald-600">
                          {percentage.toFixed(1)}% от общей выручки
                        </div>
                      </div>
                    </div>
                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Дополнительная статистика */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="relative overflow-hidden rounded-2xl"
      >
        <div className="relative p-6 bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-500 rounded-lg">
              <Info className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Статистика клиентов и записей
              </h3>
              <p className="text-sm text-gray-600">
                Основные показатели за выбранный период
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 bg-white rounded-xl border border-emerald-200">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-emerald-600" />
                <span className="text-sm text-gray-600">Всего клиентов</span>
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {formatNumber(data.clients.totalClients)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Новых: {formatNumber(data.clients.newClients)}
              </div>
            </div>

            <div className="p-5 bg-white rounded-xl border border-cyan-200">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-cyan-600" />
                <span className="text-sm text-gray-600">Всего записей</span>
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {formatNumber(data.appointments.totalAppointments)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Завершено: {formatNumber(data.appointments.completedAppointments)}
              </div>
            </div>

            <div className="p-5 bg-white rounded-xl border border-violet-200">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-violet-600" />
                <span className="text-sm text-gray-600">Конверсия</span>
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {formatPercent(data.appointments.conversionRate)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Удержание: {formatPercent(data.clients.retentionRate)}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ===== ВКЛАДКА "ДИНАМИКА" =====
function TrendsTab({
  data,
  isLoading,
}: {
  data: KeyMetricsResponse;
  isLoading: boolean;
}) {
  const { formatCurrency, formatNumber } = useAnalytics();

  return (
    <div className="space-y-6">
      {/* График выручки по месяцам */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl"
      >
        <div className="relative p-6 bg-white border border-gray-200 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            Выручка по месяцам
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={data.financial.revenueByMonth}>
              <defs>
                <linearGradient id="revenueGradient2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#10B981" stopOpacity={0.1} />
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
                labelStyle={{ color: "#374151", marginBottom: "8px" }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#10B981"
                strokeWidth={2}
                fill="url(#revenueGradient2)"
                name="Выручка"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* График клиентов по месяцам */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative overflow-hidden rounded-2xl"
      >
        <div className="relative p-6 bg-white border border-gray-200 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            Клиенты по месяцам
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data.clients.clientsByMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="month" stroke="#9CA3AF" tick={{ fill: "#6B7280" }} />
              <YAxis stroke="#9CA3AF" tick={{ fill: "#6B7280" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #E5E7EB",
                  borderRadius: "12px",
                  padding: "12px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
                cursor={{ fill: "rgba(139, 92, 246, 0.1)" }}
              />
              <Bar dataKey="clients" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}

// ===== ВКЛАДКА "ДЕТАЛИЗАЦИЯ" =====
function BreakdownTab({
  data,
  isLoading,
}: {
  data: KeyMetricsResponse;
  isLoading: boolean;
}) {
  const { formatCurrency, formatPercent } = useAnalytics();

  return (
    <div className="space-y-6">
      {/* Детализация по мастерам */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl"
      >
        <div className="relative p-6 bg-white border border-gray-200 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            Выручка по мастерам
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data.financial.revenueByMaster} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                type="number"
                stroke="#9CA3AF"
                tick={{ fill: "#6B7280" }}
                tickFormatter={(value) => `₽${(value / 1000).toFixed(0)}к`}
              />
              <YAxis
                type="category"
                dataKey="masterName"
                stroke="#9CA3AF"
                tick={{ fill: "#6B7280" }}
                width={150}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #E5E7EB",
                  borderRadius: "12px",
                  padding: "12px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
                formatter={(value: any) => [formatCurrency(value), "Выручка"]}
              />
              <Bar dataKey="revenue" radius={[0, 8, 8, 0]}>
                {data.financial.revenueByMaster.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS.gradient[index % COLORS.gradient.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Таблица услуг */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative overflow-hidden rounded-2xl"
      >
        <div className="relative p-6 bg-white border border-gray-200 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            Детализация по услугам
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                    Услуга
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">
                    Выручка
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">
                    Количество
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">
                    Ср. цена
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.services.popularServices.map((service, index) => (
                  <tr
                    key={service.serviceId}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-4 font-medium text-gray-900">
                      {service.serviceName}
                    </td>
                    <td className="py-4 px-4 text-right font-semibold text-gray-900">
                      {formatCurrency(service.totalRevenue)}
                    </td>
                    <td className="py-4 px-4 text-right text-gray-600">
                      {service.appointmentsCount}
                    </td>
                    <td className="py-4 px-4 text-right text-gray-600">
                      {formatCurrency(service.averagePrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ===== ВКЛАДКА "СРАВНЕНИЕ" =====
function ComparisonTab({
  data,
  isLoading,
}: {
  data: KeyMetricsResponse;
  isLoading: boolean;
}) {
  const { formatCurrency, formatPercent, formatNumber } = useAnalytics();

  return (
    <div className="space-y-6">
      {/* Сравнительная панель */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: "Выручка",
            current: data.financial.totalRevenue,
            icon: DollarSign,
            change: data.financial.revenueGrowth,
          },
          {
            title: "Клиентов",
            current: data.clients.totalClients,
            icon: Users,
            change: 15,
          },
          {
            title: "Записей",
            current: data.appointments.totalAppointments,
            icon: Calendar,
            change: 12,
          },
          {
            title: "Средний чек",
            current: data.financial.averageCheck,
            icon: Receipt,
            change: 8,
          },
        ].map((metric, index) => {
          const Icon = metric.icon;
          const isPositive = metric.change >= 0;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative overflow-hidden rounded-2xl"
            >
              <div className="relative p-5 bg-white border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Icon className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{metric.title}</span>
                </div>

                <div className="text-2xl font-bold text-gray-900 mb-3">
                  {metric.title === "Выручка" || metric.title === "Средний чек"
                    ? formatCurrency(metric.current)
                    : formatNumber(metric.current)}
                </div>

                <div
                  className={`
                    flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-semibold w-fit
                    ${isPositive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}
                  `}
                >
                  {isPositive ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {Math.abs(metric.change).toFixed(1)}%
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Сравнение мастеров */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative overflow-hidden rounded-2xl"
      >
        <div className="relative p-6 bg-white border border-gray-200 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            Сравнение мастеров по выручке
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data.masters.topMasters}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="masterName"
                stroke="#9CA3AF"
                tick={{ fill: "#6B7280" }}
                angle={-45}
                textAnchor="end"
                height={100}
              />
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
                formatter={(value: any) => [formatCurrency(value), "Выручка"]}
              />
              <Bar dataKey="totalRevenue" radius={[8, 8, 0, 0]}>
                {data.masters.topMasters.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS.primary[index % COLORS.primary.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Инсайты */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="relative overflow-hidden rounded-2xl"
      >
        <div className="relative p-6 bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-500 rounded-lg">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Ключевые инсайты</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-white border border-emerald-200 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span className="font-semibold text-emerald-700">Лучший мастер</span>
              </div>
              <p className="text-sm text-gray-700">
                {data.masters.topMasters[0]?.masterName || "Нет данных"} показывает
                максимальную выручку
              </p>
            </div>

            <div className="p-4 bg-white border border-cyan-200 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-5 h-5 text-cyan-600" />
                <span className="font-semibold text-cyan-700">Популярная услуга</span>
              </div>
              <p className="text-sm text-gray-700">
                {data.services.popularServices[0]?.serviceName || "Нет данных"}{" "}
                пользуется наибольшим спросом
              </p>
            </div>

            <div className="p-4 bg-white border border-violet-200 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-violet-600" />
                <span className="font-semibold text-violet-700">Конверсия</span>
              </div>
              <p className="text-sm text-gray-700">
                Уровень конверсии составляет{" "}
                {formatPercent(data.appointments.conversionRate)}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}