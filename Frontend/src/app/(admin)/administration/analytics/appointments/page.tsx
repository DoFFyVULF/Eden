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
  ChevronUp,
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
  SlidersHorizontal,
  ArrowUpRight,
  ArrowDownRight,
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
} from "@/app/components/charts";
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
    TimePeriod.MONTH,
  );
  const [analyticsData, setAnalyticsData] = useState<KeyMetricsResponse | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "overview" | "status" | "conversion" | "timeline"
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
    loadAppointmentsData();
  }, [selectedPeriod]);

  const loadAppointmentsData = async (showLoading = true) => {
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
      setError("Не удалось загрузить данные записей");
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
      a.download = `appointments-report-${new Date().toISOString().split("T")[0]}.pdf`;
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
    { id: "status", label: "По статусам", icon: PieChartIcon },
    { id: "conversion", label: "Конверсия", icon: Target },
    { id: "timeline", label: "Динамика", icon: LineChartIcon },
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
                Аналитика записей
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
                Статистика и эффективность 📅
              </h1>
              <p
                className={`mt-2 text-sm ${
                  isDark ? "text-white/40" : "text-gray-400"
                }`}
              >
                Детальный анализ записей и их статусов
              </p>
            </div>

            <div className="flex gap-2.5 flex-wrap">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => loadAppointmentsData(false)}
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
                    ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-purple-500/25 hover:shadow-purple-500/40"
                    : "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-purple-500/20 hover:shadow-purple-500/35"
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
                          | "status"
                          | "conversion"
                          | "timeline",
                      )
                    }
                    className={`
                      flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200
                      ${
                        activeTab === tab.id
                          ? isDark
                            ? "bg-purple-500/20 border border-purple-400/30 text-purple-300"
                            : "bg-purple-50 border border-purple-300 text-purple-600"
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
                      : "bg-gray-50 border-gray-200 text-gray-700 focus:border-purple-300 focus:bg-white"
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
                      ? "bg-purple-500/20 border-purple-400/30 text-purple-300"
                      : "bg-purple-50 border-purple-300 text-purple-600"
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
                      <div className="w-3 h-3 rounded-full bg-gradient-to-r from-amber-500 to-orange-500" />
                      <span
                        className={isDark ? "text-white/60" : "text-gray-600"}
                      >
                        Новые записи
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500" />
                      <span
                        className={isDark ? "text-white/60" : "text-gray-600"}
                      >
                        Подтверждённые
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-500 to-green-500" />
                      <span
                        className={isDark ? "text-white/60" : "text-gray-600"}
                      >
                        Завершённые
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-r from-red-500 to-pink-500" />
                      <span
                        className={isDark ? "text-white/60" : "text-gray-600"}
                      >
                        Отменённые
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
                isDark ? "border-purple-400" : "border-purple-400"
              }`}
              style={{ borderWidth: 3 }}
            />
            <p
              className={`text-sm ${
                isDark ? "text-white/40" : "text-gray-400"
              }`}
            >
              Загрузка данных записей...
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
                {activeTab === "status" && (
                  <StatusTab data={analyticsData} isDark={isDark} />
                )}
                {activeTab === "conversion" && (
                  <ConversionTab data={analyticsData} isDark={isDark} />
                )}
                {activeTab === "timeline" && (
                  <TimelineTab data={analyticsData} isDark={isDark} />
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
  const { formatPercent, formatNumber } = useAnalytics();

  const glassCls = isDark
    ? "bg-white/[0.07] backdrop-blur-2xl border border-white/[0.1]"
    : "bg-white border border-gray-200/70";

  const stats = [
    {
      title: "Всего записей",
      value: formatNumber(data.appointments.totalAppointments),
      change: 100,
      icon: Calendar,
      gradient: "from-purple-500 to-pink-500",
      bgColor: isDark ? "bg-purple-500/10" : "bg-purple-50",
      textColor: isDark ? "text-purple-400" : "text-purple-600",
      description: "За период",
    },
    {
      title: "Подтверждено",
      value: formatNumber(data.appointments.confirmedAppointments),
      change: 15,
      icon: CalendarCheck,
      gradient: "from-blue-500 to-cyan-500",
      bgColor: isDark ? "bg-blue-500/10" : "bg-blue-50",
      textColor: isDark ? "text-blue-400" : "text-blue-600",
      description: "Ожидают визита",
    },
    {
      title: "Завершено",
      value: formatNumber(data.appointments.completedAppointments),
      change: 12,
      icon: CheckCircle2,
      gradient: "from-emerald-500 to-green-500",
      bgColor: isDark ? "bg-emerald-500/10" : "bg-emerald-50",
      textColor: isDark ? "text-emerald-400" : "text-emerald-600",
      description: "Успешно выполнено",
    },
    {
      title: "Отменено",
      value: formatNumber(data.appointments.cancelledAppointments),
      change: -5,
      icon: XCircle,
      gradient: "from-red-500 to-pink-500",
      bgColor: isDark ? "bg-red-500/10" : "bg-red-50",
      textColor: isDark ? "text-red-400" : "text-red-600",
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

      {/* Конверсия и эффективность */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Конверсия */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className={`rounded-2xl p-6 transition-all duration-300 bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-purple-500/10 border ${
            isDark ? "border-purple-500/30" : "border-purple-200"
          }`}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3
                className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}
              >
                Конверсия записей
              </h3>
              <p
                className={`text-sm ${isDark ? "text-white/40" : "text-gray-600"}`}
              >
                Завершённые из общего числа
              </p>
            </div>
          </div>
          <div
            className={`text-5xl font-bold ${isDark ? "text-purple-400" : "text-purple-600"} mb-2`}
          >
            {(
              (data.appointments.completedAppointments /
                data.appointments.totalAppointments) *
              100
            ).toFixed(1)}
            %
          </div>
          <p
            className={`text-sm ${isDark ? "text-white/70" : "text-gray-700"}`}
          >
            {data.appointments.completedAppointments} из{" "}
            {data.appointments.totalAppointments} записей завершены успешно
          </p>

          <div className="mt-4 h-3 bg-gray-200 dark:bg-white/[0.07] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${(data.appointments.completedAppointments / data.appointments.totalAppointments) * 100}%`,
              }}
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
          className={`rounded-2xl p-6 transition-all duration-300 ${glassCls}`}
        >
          <div className="flex items-center gap-3 mb-6">
            <div
              className={`p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500`}
            >
              <PieChartIcon className="w-5 h-5 text-white" />
            </div>
            <h3
              className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}
            >
              Распределение по статусам
            </h3>
          </div>

          <ResponsiveContainer width="100%" height={200}>
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
            {statusData.map((item, index) => (
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
                  {item.value} записей
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Топ мастера по записям */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={`rounded-2xl p-6 transition-all duration-300 ${glassCls}`}
      >
        <div className="flex items-center gap-3 mb-6">
          <div
            className={`p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500`}
          >
            <Award className="w-5 h-5 text-white" />
          </div>
          <h3
            className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}
          >
            Топ мастера по количеству записей
          </h3>
        </div>

        <div className="space-y-4">
          {data.masters.topMasters.slice(0, 5).map((master, index) => {
            const percentage =
              (master.appointmentsCount / data.appointments.totalAppointments) *
              100;
            return (
              <div key={master.masterId} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 text-xs font-bold text-white`}
                    >
                      {index + 1}
                    </div>
                    <span
                      className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}
                    >
                      {master.masterName}
                    </span>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-sm font-bold ${isDark ? "text-white" : "text-gray-900"}`}
                    >
                      {formatNumber(master.appointmentsCount)}
                    </span>
                  </div>
                </div>
                <div
                  className={`h-1.5 ${isDark ? "bg-white/[0.07]" : "bg-gray-200"} rounded-full overflow-hidden`}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                  />
                </div>
                <div className="flex justify-end text-xs">
                  <span className={isDark ? "text-white/40" : "text-gray-500"}>
                    {percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Дополнительная статистика */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className={`rounded-2xl p-6 transition-all duration-300 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-purple-500/5 border ${
          isDark ? "border-purple-500/20" : "border-purple-200"
        }`}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
            <Info className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3
              className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}
            >
              Статистика записей
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
              <Clock
                className={`w-4 h-4 ${isDark ? "text-purple-400" : "text-purple-600"}`}
              />
              <span
                className={`text-sm ${isDark ? "text-white/60" : "text-gray-600"}`}
              >
                Среднее время
              </span>
            </div>
            <div
              className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"} mb-1`}
            >
              45 мин
            </div>
            <div
              className={`text-xs ${isDark ? "text-white/30" : "text-gray-400"}`}
            >
              На одну запись
            </div>
          </div>

          <div
            className={`p-5 rounded-xl ${isDark ? "bg-white/[0.04] border border-white/[0.05]" : "bg-white border border-gray-200/50"}`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Users
                className={`w-4 h-4 ${isDark ? "text-emerald-400" : "text-emerald-600"}`}
              />
              <span
                className={`text-sm ${isDark ? "text-white/60" : "text-gray-600"}`}
              >
                Уникальных клиентов
              </span>
            </div>
            <div
              className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"} mb-1`}
            >
              {data.clients.totalClients}
            </div>
            <div
              className={`text-xs ${isDark ? "text-white/30" : "text-gray-400"}`}
            >
              За период
            </div>
          </div>

          <div
            className={`p-5 rounded-xl ${isDark ? "bg-white/[0.04] border border-white/[0.05]" : "bg-white border border-gray-200/50"}`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Activity
                className={`w-4 h-4 ${isDark ? "text-amber-400" : "text-amber-600"}`}
              />
              <span
                className={`text-sm ${isDark ? "text-white/60" : "text-gray-600"}`}
              >
                Загруженность
              </span>
            </div>
            <div
              className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"} mb-1`}
            >
              78%
            </div>
            <div
              className={`text-xs ${isDark ? "text-white/30" : "text-gray-400"}`}
            >
              От общего времени
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ===== ВКЛАДКА "ПО СТАТУСАМ" =====
function StatusTab({
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

  const statusCards = [
    {
      title: "Новые записи",
      value: data.appointments.newAppointments,
      icon: AlertCircle,
      gradient: "from-amber-500 to-orange-500",
      bgColor: isDark ? "bg-amber-500/10" : "bg-amber-50",
      textColor: isDark ? "text-amber-400" : "text-amber-600",
      borderColor: isDark ? "border-amber-500/30" : "border-amber-200",
      description: "Ожидают обработки",
    },
    {
      title: "Подтверждённые",
      value: data.appointments.confirmedAppointments,
      icon: CalendarCheck,
      gradient: "from-blue-500 to-cyan-500",
      bgColor: isDark ? "bg-blue-500/10" : "bg-blue-50",
      textColor: isDark ? "text-blue-400" : "text-blue-600",
      borderColor: isDark ? "border-blue-500/30" : "border-blue-200",
      description: "Ожидают визита",
    },
    {
      title: "Завершённые",
      value: data.appointments.completedAppointments,
      icon: CheckCircle2,
      gradient: "from-emerald-500 to-green-500",
      bgColor: isDark ? "bg-emerald-500/10" : "bg-emerald-50",
      textColor: isDark ? "text-emerald-400" : "text-emerald-600",
      borderColor: isDark ? "border-emerald-500/30" : "border-emerald-200",
      description: "Успешно выполнены",
    },
    {
      title: "Отменённые",
      value: data.appointments.cancelledAppointments,
      icon: XCircle,
      gradient: "from-red-500 to-pink-500",
      bgColor: isDark ? "bg-red-500/10" : "bg-red-50",
      textColor: isDark ? "text-red-400" : "text-red-600",
      borderColor: isDark ? "border-red-500/30" : "border-red-200",
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
                className={`absolute -top-4 -right-4 w-20 h-20 rounded-full bg-gradient-to-br ${card.gradient} opacity-${isDark ? "15" : "8"} blur-xl`}
              />

              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-xl ${card.bgColor}`}>
                    <Icon className={`w-5 h-5 ${card.textColor}`} />
                  </div>
                  <div
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${card.bgColor} ${card.textColor}`}
                  >
                    {percentage.toFixed(1)}%
                  </div>
                </div>

                <div
                  className={`text-2xl font-bold leading-none mb-1 ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  {formatNumber(card.value)}
                </div>
                <div
                  className={`text-sm font-medium ${
                    isDark ? "text-white/70" : "text-gray-700"
                  }`}
                >
                  {card.title}
                </div>
                <div
                  className={`text-xs ${
                    isDark ? "text-white/40" : "text-gray-500"
                  } mt-1`}
                >
                  {card.description}
                </div>

                <div className="mt-4 h-1.5 bg-gray-200 dark:bg-white/[0.07] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                    className={`h-full bg-gradient-to-r ${card.gradient} rounded-full`}
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
        className={`rounded-2xl p-6 transition-all duration-300 ${glassCls}`}
      >
        <h3
          className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"} mb-6`}
        >
          Сравнение по статусам
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={isDark ? "#ffffff10" : "#E5E7EB"}
            />
            <XAxis
              dataKey="name"
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
              cursor={{
                fill: isDark ? "#8B5CF620" : "rgba(139, 92, 246, 0.1)",
              }}
              formatter={(value: any) => [value, "Количество"]}
            />
            // В компоненте StatusTab, в месте где используется Cell
            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
              {chartData.map((entry, index) => {
                // Получаем цвет в зависимости от индекса
                const getColor = () => {
                  switch (index) {
                    case 0:
                      return COLORS.new;
                    case 1:
                      return COLORS.confirmed;
                    case 2:
                      return COLORS.completed;
                    case 3:
                      return COLORS.cancelled;
                    default:
                      return COLORS.primary[0];
                  }
                };
                return <Cell key={`cell-${index}`} fill={getColor()} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}

// ===== ВКЛАДКА "КОНВЕРСИЯ" =====
function ConversionTab({
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

  const conversionFunnel = [
    {
      stage: "Всего записей",
      value: data.appointments.totalAppointments,
      percentage: 100,
      color: "from-purple-500 to-pink-500",
    },
    {
      stage: "Подтверждено",
      value: data.appointments.confirmedAppointments,
      percentage:
        (data.appointments.confirmedAppointments /
          data.appointments.totalAppointments) *
        100,
      color: "from-blue-500 to-cyan-500",
    },
    {
      stage: "Завершено",
      value: data.appointments.completedAppointments,
      percentage:
        (data.appointments.completedAppointments /
          data.appointments.totalAppointments) *
        100,
      color: "from-emerald-500 to-green-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Основная метрика конверсии */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl p-8 transition-all duration-300 bg-gradient-to-br from-purple-500 to-pink-500 text-white`}
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="p-4 bg-white/20 rounded-xl backdrop-blur-sm">
            <Target className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-1">Общая конверсия</h2>
            <p className="text-white/80">Завершённые записи из общего числа</p>
          </div>
        </div>
        <div className="text-7xl font-bold mb-4">
          {(
            (data.appointments.completedAppointments /
              data.appointments.totalAppointments) *
            100
          ).toFixed(1)}
          %
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
        className={`rounded-2xl p-6 transition-all duration-300 ${glassCls}`}
      >
        <h3
          className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"} mb-6`}
        >
          Воронка конверсии
        </h3>

        <div className="space-y-4">
          {conversionFunnel.map((stage, index) => (
            <div key={index} className="relative">
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`text-sm font-medium ${isDark ? "text-white/70" : "text-gray-700"}`}
                >
                  {stage.stage}
                </span>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}
                  >
                    {formatNumber(stage.value)}
                  </span>
                  <span
                    className={`text-sm ${isDark ? "text-white/40" : "text-gray-500"}`}
                  >
                    {stage.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div
                className={`h-12 ${isDark ? "bg-white/[0.07]" : "bg-gray-100"} rounded-xl overflow-hidden`}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stage.percentage}%` }}
                  transition={{ duration: 1, delay: index * 0.2 }}
                  className={`h-full bg-gradient-to-r ${stage.color} flex items-center justify-center text-white font-semibold`}
                >
                  {stage.percentage.toFixed(1)}%
                </motion.div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Детальная статистика */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className={`rounded-2xl p-6 transition-all duration-300 ${glassCls}`}
        >
          <div className="flex items-center gap-2 mb-4">
            <div
              className={`p-2 rounded-xl ${isDark ? "bg-emerald-500/20" : "bg-emerald-100"}`}
            >
              <CheckCircle2
                className={`w-5 h-5 ${isDark ? "text-emerald-400" : "text-emerald-600"}`}
              />
            </div>
            <h4
              className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}
            >
              Успешные записи
            </h4>
          </div>
          <div
            className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-900"} mb-2`}
          >
            {formatNumber(data.appointments.completedAppointments)}
          </div>
          <p
            className={`text-sm ${isDark ? "text-white/40" : "text-gray-600"}`}
          >
            {(
              (data.appointments.completedAppointments /
                data.appointments.totalAppointments) *
              100
            ).toFixed(1)}
            % от общего числа
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`rounded-2xl p-6 transition-all duration-300 ${glassCls}`}
        >
          <div className="flex items-center gap-2 mb-4">
            <div
              className={`p-2 rounded-xl ${isDark ? "bg-red-500/20" : "bg-red-100"}`}
            >
              <XCircle
                className={`w-5 h-5 ${isDark ? "text-red-400" : "text-red-600"}`}
              />
            </div>
            <h4
              className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}
            >
              Отменённые
            </h4>
          </div>
          <div
            className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-900"} mb-2`}
          >
            {formatNumber(data.appointments.cancelledAppointments)}
          </div>
          <p
            className={`text-sm ${isDark ? "text-white/40" : "text-gray-600"}`}
          >
            {(
              (data.appointments.cancelledAppointments /
                data.appointments.totalAppointments) *
              100
            ).toFixed(1)}
            % от общего числа
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
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
              В процессе
            </h4>
          </div>
          <div
            className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-900"} mb-2`}
          >
            {formatNumber(
              data.appointments.confirmedAppointments +
                data.appointments.newAppointments,
            )}
          </div>
          <p
            className={`text-sm ${isDark ? "text-white/40" : "text-gray-600"}`}
          >
            Новые и подтверждённые
          </p>
        </motion.div>
      </div>
    </div>
  );
}

// ===== ВКЛАДКА "ДИНАМИКА" =====
function TimelineTab({
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
        className={`rounded-2xl p-6 transition-all duration-300 ${glassCls}`}
      >
        <h3
          className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"} mb-6`}
        >
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
              formatter={(value: any) => [value, "Записей"]}
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
      </motion.div>

      {/* Статистика и рекомендации */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`rounded-2xl p-6 transition-all duration-300 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-purple-500/5 border ${
          isDark ? "border-purple-500/20" : "border-purple-200"
        }`}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <h3
            className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}
          >
            Рекомендации по улучшению
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            className={`p-4 rounded-xl ${
              isDark
                ? "bg-white/[0.04] border border-white/[0.05]"
                : "bg-white border border-gray-200/50"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Target
                className={`w-5 h-5 ${isDark ? "text-purple-400" : "text-purple-600"}`}
              />
              <h4
                className={`font-semibold ${isDark ? "text-purple-400" : "text-purple-900"}`}
              >
                Увеличьте конверсию
              </h4>
            </div>
            <p
              className={`text-sm ${isDark ? "text-white/60" : "text-gray-700"}`}
            >
              Сократите время подтверждения новых записей для улучшения
              конверсии
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
              <Info
                className={`w-5 h-5 ${isDark ? "text-pink-400" : "text-pink-600"}`}
              />
              <h4
                className={`font-semibold ${isDark ? "text-pink-400" : "text-pink-900"}`}
              >
                Снизьте отмены
              </h4>
            </div>
            <p
              className={`text-sm ${isDark ? "text-white/60" : "text-gray-700"}`}
            >
              Отправляйте напоминания клиентам за день до визита
            </p>
          </div>
        </div>

        <div
          className={`mt-4 p-4 rounded-xl ${
            isDark
              ? "bg-emerald-500/10 border border-emerald-500/20"
              : "bg-emerald-50 border border-emerald-200"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp
              className={`w-5 h-5 ${isDark ? "text-emerald-400" : "text-emerald-600"}`}
            />
            <h4
              className={`font-semibold ${isDark ? "text-emerald-400" : "text-emerald-900"}`}
            >
              Тренд записей
            </h4>
          </div>
          <p
            className={`text-sm ${isDark ? "text-white/60" : "text-gray-700"}`}
          >
            Наблюдается рост количества записей. Рекомендуется оптимизировать
            расписание мастеров.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
