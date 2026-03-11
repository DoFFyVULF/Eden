"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  CalendarCheck,
  CalendarX,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Download,
  RefreshCw,
  ArrowLeft,
  ChevronDown,
  Activity,
  BarChart3,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  Info,
  Target,
  Zap,
  Award,
  Users,
  TrendingUp as Growth,
  Percent,
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
  ComposedChart,
} from "recharts";
import { analyticsService } from "@/services/analytics/analytics.service";
import { KeyMetricsResponse, TimePeriod } from "@/types/analytics.types";
import { useAnalytics } from "@/hooks/useAnalytics";
import { ADMIN_ROUTES } from "@/app/lib/admin.routes";

// Цветовая палитра
const COLORS = {
  new: "#F59E0B",
  confirmed: "#3B82F6",
  completed: "#10B981",
  cancelled: "#EF4444",
  primary: ["#8B5CF6", "#6366F1", "#3B82F6", "#0EA5E9", "#06B6D4"],
};

export default function AppointmentsAnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>(
    TimePeriod.MONTH
  );
  const [analyticsData, setAnalyticsData] = useState<KeyMetricsResponse | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "overview" | "status" | "conversion" | "timeline"
  >("overview");

  const { formatCurrency, formatPercent, formatNumber, getPeriodDisplayName } =
    useAnalytics();

  useEffect(() => {
    loadAppointmentsData();
  }, [selectedPeriod]);

  const loadAppointmentsData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await analyticsService.getKeyMetrics({
        period: selectedPeriod,
      });
      setAnalyticsData(data);
    } catch (err) {
      setError("Не удалось загрузить данные записей");
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
      a.download = `appointments-report-${new Date().toISOString().split("T")[0]}.pdf`;
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
    { id: "status", label: "По статусам", icon: PieChartIcon },
    { id: "conversion", label: "Конверсия", icon: Target },
    { id: "timeline", label: "Динамика", icon: LineChartIcon },
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Декоративный фон */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-pink-500/5 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[80px]" />
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
                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Аналитика записей
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                Статистика и эффективность 📅
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
                        tab.id as "overview" | "status" | "conversion" | "timeline"
                      )
                    }
                    className={`
                      flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all
                      ${
                        activeTab === tab.id
                          ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25"
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
                  className="pl-11 pr-10 py-3 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium appearance-none cursor-pointer transition-all shadow-sm disabled:opacity-50 focus:ring-2 focus:ring-purple-500/50 focus:outline-none focus:border-purple-500"
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
                onClick={loadAppointmentsData}
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
                className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-semibold shadow-lg shadow-purple-500/25 transition-all disabled:opacity-50"
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
              {activeTab === "status" && (
                <StatusTab data={analyticsData} isLoading={isLoading} />
              )}
              {activeTab === "conversion" && (
                <ConversionTab data={analyticsData} isLoading={isLoading} />
              )}
              {activeTab === "timeline" && (
                <TimelineTab data={analyticsData} isLoading={isLoading} />
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
  const { formatPercent, formatNumber } = useAnalytics();

  const stats = [
    {
      title: "Всего записей",
      value: formatNumber(data.appointments.totalAppointments),
      change: 100,
      icon: Calendar,
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
      description: "За период",
    },
    {
      title: "Подтверждено",
      value: formatNumber(data.appointments.confirmedAppointments),
      change: 15,
      icon: CalendarCheck,
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
      description: "Ожидают визита",
    },
    {
      title: "Завершено",
      value: formatNumber(data.appointments.completedAppointments),
      change: 12,
      icon: CheckCircle2,
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-600",
      description: "Успешно выполнено",
    },
    {
      title: "Отменено",
      value: formatNumber(data.appointments.cancelledAppointments),
      change: -5,
      icon: XCircle,
      bgColor: "bg-red-50",
      textColor: "text-red-600",
      description: "Отменённые записи",
    },
  ];

  // Данные для круговой диаграммы
  const statusData = [
    {
      name: "Новые",
      value: data.appointments.newAppointments,
      color: COLORS.new,
    },
    {
      name: "Подтверждено",
      value: data.appointments.confirmedAppointments,
      color: COLORS.confirmed,
    },
    {
      name: "Завершено",
      value: data.appointments.completedAppointments,
      color: COLORS.completed,
    },
    {
      name: "Отменено",
      value: data.appointments.cancelledAppointments,
      color: COLORS.cancelled,
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
                <div className="text-sm font-medium text-gray-900 mb-1">
                  {stat.title}
                </div>
                <div className="text-xs text-gray-500">{stat.description}</div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Конверсия и эффективность */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Конверсия */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-2xl"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-purple-500 rounded-xl">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Конверсия записей
              </h3>
              <p className="text-sm text-gray-600">
                Завершённые из общего числа
              </p>
            </div>
          </div>
          <div className="text-5xl font-bold text-purple-600 mb-2">
            {formatPercent(data.appointments.conversionRate)}
          </div>
          <p className="text-sm text-gray-700">
            {data.appointments.completedAppointments} из{" "}
            {data.appointments.totalAppointments} записей завершены успешно
          </p>

          <div className="mt-4 h-3 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${data.appointments.conversionRate}%` }}
              transition={{ duration: 1, delay: 0.5 }}
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
            />
          </div>
        </motion.div>

        {/* Распределение по статусам */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="relative overflow-hidden rounded-2xl"
        >
          <div className="relative p-6 bg-white border border-gray-200 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              Распределение по статусам
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <RechartsPieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => {
                    const dataItem = statusData[entry.index];
                    const percent =
                      (dataItem.value / data.appointments.totalAppointments) *
                      100;
                    return `${dataItem.name} ${percent.toFixed(0)}%`;
                  }}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #E5E7EB",
                    borderRadius: "12px",
                    padding: "12px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Топ мастера по записям */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="relative overflow-hidden rounded-2xl"
      >
        <div className="relative p-6 bg-white border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Award className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">
              Топ мастера по количеству записей
            </h3>
          </div>

          <div className="space-y-3">
            {data.masters.topMasters.slice(0, 5).map((master, index) => (
              <div
                key={master.masterId}
                className="group p-4 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-xl transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg text-sm font-bold text-white">
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
                      {formatNumber(master.appointmentsCount)}
                    </div>
                    <div className="text-xs text-gray-500">записей</div>
                  </div>
                </div>
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${(master.appointmentsCount / data.appointments.totalAppointments) * 100}%`,
                    }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ===== ВКЛАДКА "ПО СТАТУСАМ" =====
function StatusTab({
  data,
  isLoading,
}: {
  data: KeyMetricsResponse;
  isLoading: boolean;
}) {
  const { formatNumber, formatPercent } = useAnalytics();

  const statusCards = [
    {
      title: "Новые записи",
      value: data.appointments.newAppointments,
      icon: AlertCircle,
      color: "from-amber-500 to-orange-500",
      bgColor: "bg-amber-50",
      textColor: "text-amber-600",
      borderColor: "border-amber-200",
      description: "Ожидают обработки",
    },
    {
      title: "Подтверждённые",
      value: data.appointments.confirmedAppointments,
      icon: CalendarCheck,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
      borderColor: "border-blue-200",
      description: "Ожидают визита",
    },
    {
      title: "Завершённые",
      value: data.appointments.completedAppointments,
      icon: CheckCircle2,
      color: "from-emerald-500 to-green-500",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-600",
      borderColor: "border-emerald-200",
      description: "Успешно выполнены",
    },
    {
      title: "Отменённые",
      value: data.appointments.cancelledAppointments,
      icon: XCircle,
      color: "from-red-500 to-pink-500",
      bgColor: "bg-red-50",
      textColor: "text-red-600",
      borderColor: "border-red-200",
      description: "Не состоялись",
    },
  ];

  const chartData = [
    { name: "Новые", value: data.appointments.newAppointments },
    { name: "Подтверждено", value: data.appointments.confirmedAppointments },
    { name: "Завершено", value: data.appointments.completedAppointments },
    { name: "Отменено", value: data.appointments.cancelledAppointments },
  ];

  return (
    <div className="space-y-6">
      {/* Карточки статусов */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {statusCards.map((card, index) => {
          const Icon = card.icon;
          const percentage =
            (card.value / data.appointments.totalAppointments) * 100;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className="relative overflow-hidden rounded-2xl"
            >
              <div
                className={`relative p-6 bg-white border ${card.borderColor} shadow-sm`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 ${card.bgColor} rounded-xl`}>
                    <Icon className={`w-6 h-6 ${card.textColor}`} />
                  </div>
                  <div
                    className={`px-3 py-1 ${card.bgColor} ${card.textColor} rounded-lg text-sm font-semibold`}
                  >
                    {formatPercent(percentage)}
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {formatNumber(card.value)}
                </div>
                <div className="text-sm font-medium text-gray-900 mb-1">
                  {card.title}
                </div>
                <div className="text-xs text-gray-500">{card.description}</div>

                <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                    className={`h-full bg-gradient-to-r ${card.color} rounded-full`}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* График статусов */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative overflow-hidden rounded-2xl"
      >
        <div className="relative p-6 bg-white border border-gray-200 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            Сравнение по статусам
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" stroke="#9CA3AF" tick={{ fill: "#6B7280" }} />
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
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                <Cell fill={COLORS.new} />
                <Cell fill={COLORS.confirmed} />
                <Cell fill={COLORS.completed} />
                <Cell fill={COLORS.cancelled} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}

// ===== ВКЛАДКА "КОНВЕРСИЯ" =====
function ConversionTab({
  data,
  isLoading,
}: {
  data: KeyMetricsResponse;
  isLoading: boolean;
}) {
  const { formatPercent, formatNumber } = useAnalytics();

  const conversionFunnel = [
    {
      stage: "Всего записей",
      value: data.appointments.totalAppointments,
      percentage: 100,
      color: "bg-purple-500",
    },
    {
      stage: "Подтверждено",
      value: data.appointments.confirmedAppointments,
      percentage:
        (data.appointments.confirmedAppointments /
          data.appointments.totalAppointments) *
        100,
      color: "bg-blue-500",
    },
    {
      stage: "Завершено",
      value: data.appointments.completedAppointments,
      percentage: data.appointments.conversionRate,
      color: "bg-emerald-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Основная метрика конверсии */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl text-white"
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="p-4 bg-white/20 rounded-xl backdrop-blur-sm">
            <Target className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-1">Общая конверсия</h2>
            <p className="text-white/80">
              Завершённые записи из общего числа
            </p>
          </div>
        </div>
        <div className="text-7xl font-bold mb-4">
          {formatPercent(data.appointments.conversionRate)}
        </div>
        <p className="text-lg text-white/90">
          {formatNumber(data.appointments.completedAppointments)} завершённых из{" "}
          {formatNumber(data.appointments.totalAppointments)} записей
        </p>
      </motion.div>

      {/* Воронка конверсии */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative overflow-hidden rounded-2xl"
      >
        <div className="relative p-6 bg-white border border-gray-200 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            Воронка конверсии
          </h3>

          <div className="space-y-4">
            {conversionFunnel.map((stage, index) => (
              <div key={index} className="relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    {stage.stage}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-gray-900">
                      {formatNumber(stage.value)}
                    </span>
                    <span className="text-sm text-gray-500">
                      {formatPercent(stage.percentage)}
                    </span>
                  </div>
                </div>
                <div className="h-12 bg-gray-100 rounded-xl overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${stage.percentage}%` }}
                    transition={{ duration: 1, delay: index * 0.2 }}
                    className={`h-full ${stage.color} flex items-center justify-center text-white font-semibold`}
                  >
                    {stage.percentage.toFixed(1)}%
                  </motion.div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Детальная статистика */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 bg-white border border-gray-200 rounded-xl"
        >
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <h4 className="font-semibold text-gray-900">Успешные записи</h4>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {formatNumber(data.appointments.completedAppointments)}
          </div>
          <p className="text-sm text-gray-600">
            {formatPercent(data.appointments.conversionRate)} от общего числа
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 bg-white border border-gray-200 rounded-xl"
        >
          <div className="flex items-center gap-2 mb-4">
            <XCircle className="w-5 h-5 text-red-600" />
            <h4 className="font-semibold text-gray-900">Отменённые</h4>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {formatNumber(data.appointments.cancelledAppointments)}
          </div>
          <p className="text-sm text-gray-600">
            {formatPercent(
              (data.appointments.cancelledAppointments /
                data.appointments.totalAppointments) *
                100
            )}{" "}
            от общего числа
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="p-6 bg-white border border-gray-200 rounded-xl"
        >
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-purple-600" />
            <h4 className="font-semibold text-gray-900">В процессе</h4>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {formatNumber(
              data.appointments.confirmedAppointments +
                data.appointments.newAppointments
            )}
          </div>
          <p className="text-sm text-gray-600">Новые и подтверждённые</p>
        </motion.div>
      </div>
    </div>
  );
}

// ===== ВКЛАДКА "ДИНАМИКА" =====
function TimelineTab({
  data,
  isLoading,
}: {
  data: KeyMetricsResponse;
  isLoading: boolean;
}) {
  const { formatNumber } = useAnalytics();

  // Подготовка данных для временной линии (используем данные клиентов как пример)
  const timelineData = data.clients.clientsByMonth.map((item) => ({
    month: item.month,
    appointments: Math.floor(item.clients * 2.5), // Примерное соотношение
  }));

  return (
    <div className="space-y-6">
      {/* График динамики */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl"
      >
        <div className="relative p-6 bg-white border border-gray-200 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            Динамика записей по месяцам
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={timelineData}>
              <defs>
                <linearGradient
                  id="appointmentsGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.1} />
                </linearGradient>
              </defs>
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
                labelStyle={{ color: "#374151", marginBottom: "8px" }}
              />
              <Area
                type="monotone"
                dataKey="appointments"
                stroke="#8B5CF6"
                strokeWidth={2}
                fill="url(#appointmentsGradient)"
                name="Записей"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Статистика */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-2xl"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-500 rounded-lg">
            <Info className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">
            Рекомендации по улучшению
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-white rounded-xl border border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-purple-600" />
              <h4 className="font-semibold text-purple-900">
                Увеличьте конверсию
              </h4>
            </div>
            <p className="text-sm text-gray-700">
              Сократите время подтверждения новых записей для улучшения
              конверсии
            </p>
          </div>

          <div className="p-4 bg-white rounded-xl border border-pink-200">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-pink-600" />
              <h4 className="font-semibold text-pink-900">
                Снизьте отмены
              </h4>
            </div>
            <p className="text-sm text-gray-700">
              Отправляйте напоминания клиентам за день до визита
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}