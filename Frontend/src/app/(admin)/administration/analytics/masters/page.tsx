"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Users,
  User,
  UserCheck,
  Award,
  Star,
  DollarSign,
  Calendar,
  Clock,
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
  Target,
  Zap,
  Crown,
  TrendingUp as Growth,
  Percent,
  Briefcase,
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { analyticsService } from "@/services/analytics/analytics.service";
import { KeyMetricsResponse, TimePeriod } from "@/types/analytics.types";
import { useAnalytics } from "@/hooks/useAnalytics";
import { ADMIN_ROUTES } from "@/app/lib/admin.routes";

// Цветовая палитра
const COLORS = {
  primary: ["#F59E0B", "#EF4444", "#EC4899", "#8B5CF6", "#3B82F6"],
  gradient: [
    "rgba(245, 158, 11, 0.8)",
    "rgba(239, 68, 68, 0.8)",
    "rgba(236, 72, 153, 0.8)",
    "rgba(139, 92, 246, 0.8)",
    "rgba(59, 130, 246, 0.8)",
  ],
};

export default function MastersAnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>(
    TimePeriod.MONTH
  );
  const [analyticsData, setAnalyticsData] = useState<KeyMetricsResponse | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "overview" | "performance" | "comparison" | "workload"
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
    loadMastersData();
  }, [selectedPeriod]);

  const loadMastersData = async (showLoading = true) => {
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
      setError("Не удалось загрузить данные мастеров");
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
      a.download = `masters-report-${new Date().toISOString().split("T")[0]}.pdf`;
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
    { id: "performance", label: "Эффективность", icon: Award },
    { id: "comparison", label: "Сравнение", icon: Activity },
    { id: "workload", label: "Загрузка", icon: Percent },
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
                Аналитика мастеров
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
                Эффективность и производительность 👨‍💼
              </h1>
              <p
                className={`mt-2 text-sm ${
                  isDark ? "text-white/40" : "text-gray-400"
                }`}
              >
                Детальный анализ работы мастеров и их показателей
              </p>
            </div>

            <div className="flex gap-2.5 flex-wrap">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => loadMastersData(false)}
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
                    ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-amber-500/25 hover:shadow-amber-500/40"
                    : "bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-amber-500/20 hover:shadow-amber-500/35"
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
                        tab.id as "overview" | "performance" | "comparison" | "workload"
                      )
                    }
                    className={`
                      flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200
                      ${
                        activeTab === tab.id
                          ? isDark
                            ? "bg-amber-500/20 border border-amber-400/30 text-amber-300"
                            : "bg-amber-50 border border-amber-300 text-amber-600"
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
                      : "bg-gray-50 border-gray-200 text-gray-700 focus:border-amber-300 focus:bg-white"
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
                      ? "bg-amber-500/20 border-amber-400/30 text-amber-300"
                      : "bg-amber-50 border-amber-300 text-amber-600"
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
                      <span className={isDark ? "text-white/60" : "text-gray-600"}>
                        Выручка мастеров
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-r from-red-500 to-pink-500" />
                      <span className={isDark ? "text-white/60" : "text-gray-600"}>
                        Количество записей
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500" />
                      <span className={isDark ? "text-white/60" : "text-gray-600"}>
                        Средний чек
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
                isDark ? "border-amber-400" : "border-amber-400"
              }`}
              style={{ borderWidth: 3 }}
            />
            <p
              className={`text-sm ${
                isDark ? "text-white/40" : "text-gray-400"
              }`}
            >
              Загрузка данных мастеров...
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
                {activeTab === "performance" && (
                  <PerformanceTab data={analyticsData} isDark={isDark} />
                )}
                {activeTab === "comparison" && (
                  <ComparisonTab data={analyticsData} isDark={isDark} />
                )}
                {activeTab === "workload" && (
                  <WorkloadTab data={analyticsData} isDark={isDark} />
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
  const { formatCurrency, formatPercent, formatNumber } = useAnalytics();

  const glassCls = isDark
    ? "bg-white/[0.07] backdrop-blur-2xl border border-white/[0.1]"
    : "bg-white border border-gray-200/70";

  const averageAppointmentsPerMaster =
    data.masters.mastersCount > 0
      ? data.appointments.totalAppointments / data.masters.mastersCount
      : 0;

  const stats = [
    {
      title: "Всего мастеров",
      value: formatNumber(data.masters.mastersCount),
      change: 0,
      icon: Users,
      gradient: "from-amber-500 to-orange-500",
      bgColor: isDark ? "bg-amber-500/10" : "bg-amber-50",
      textColor: isDark ? "text-amber-400" : "text-amber-600",
      description: "Активных мастеров",
    },
    {
      title: "Средняя загрузка",
      value: formatPercent(data.masters.averageLoad),
      change: 5,
      icon: Activity,
      gradient: "from-red-500 to-orange-500",
      bgColor: isDark ? "bg-red-500/10" : "bg-red-50",
      textColor: isDark ? "text-red-400" : "text-red-600",
      description: "Уровень загрузки",
    },
    {
      title: "Записей на мастера",
      value: formatNumber(Math.round(averageAppointmentsPerMaster)),
      change: 15,
      icon: Calendar,
      gradient: "from-blue-500 to-cyan-500",
      bgColor: isDark ? "bg-blue-500/10" : "bg-blue-50",
      textColor: isDark ? "text-blue-400" : "text-blue-600",
      description: "Среднее количество",
    },
    {
      title: "Общая выручка",
      value: formatCurrency(data.financial.totalRevenue),
      change: 12,
      icon: DollarSign,
      gradient: "from-emerald-500 to-green-500",
      bgColor: isDark ? "bg-emerald-500/10" : "bg-emerald-50",
      textColor: isDark ? "text-emerald-400" : "text-emerald-600",
      description: "От всех мастеров",
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
                  {stat.change !== 0 && (
                    <div
                      className={`flex items-center gap-1 text-sm font-medium ${
                        isPositive
                          ? isDark ? "text-emerald-400" : "text-emerald-600"
                          : isDark ? "text-rose-400" : "text-rose-600"
                      }`}
                    >
                      {isPositive ? (
                        <ArrowUpRight size={16} />
                      ) : (
                        <ArrowDownRight size={16} />
                      )}
                      {Math.abs(stat.change).toFixed(1)}%
                    </div>
                  )}
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

      {/* Лучший мастер */}
      {data.masters.topMasters.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`rounded-2xl p-8 transition-all duration-300 bg-gradient-to-br from-amber-500 to-orange-500 text-white`}
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 bg-white/20 rounded-xl backdrop-blur-sm">
              <Crown className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-1">
                Лучший мастер месяца 🏆
              </h2>
              <p className="text-white/80">По выручке и количеству записей</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-sm text-white/70 mb-2">Имя мастера</div>
              <div className="text-3xl font-bold">
                {data.masters.topMasters[0].masterName}
              </div>
            </div>
            <div>
              <div className="text-sm text-white/70 mb-2">Выручка</div>
              <div className="text-3xl font-bold">
                {formatCurrency(data.masters.topMasters[0].totalRevenue)}
              </div>
            </div>
            <div>
              <div className="text-sm text-white/70 mb-2">Записей</div>
              <div className="text-3xl font-bold">
                {formatNumber(data.masters.topMasters[0].appointmentsCount)}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Рейтинг мастеров */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={`rounded-2xl p-6 transition-all duration-300 ${glassCls}`}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className={`p-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500`}>
            <Award className="w-5 h-5 text-white" />
          </div>
          <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
            Рейтинг мастеров по выручке
          </h3>
        </div>

        <div className="space-y-4">
          {data.masters.topMasters.map((master, index) => {
            const percentage =
              (master.totalRevenue / data.financial.totalRevenue) * 100;
            return (
              <div key={master.masterId} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold text-white ${
                        index === 0
                          ? "bg-gradient-to-br from-amber-500 to-orange-500"
                          : index === 1
                            ? "bg-gradient-to-br from-gray-400 to-gray-500"
                            : index === 2
                              ? "bg-gradient-to-br from-orange-400 to-red-400"
                              : "bg-gradient-to-br from-gray-300 to-gray-400"
                      }`}
                    >
                      {index === 0 ? (
                        <Crown className="w-4 h-4" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <span className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                      {master.masterName}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                      {formatCurrency(master.totalRevenue)}
                    </span>
                  </div>
                </div>
                <div className={`h-1.5 ${isDark ? "bg-white/[0.07]" : "bg-gray-200"} rounded-full overflow-hidden`}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                  />
                </div>
                <div className="flex justify-between text-xs">
                  <span className={isDark ? "text-white/40" : "text-gray-500"}>
                    {master.appointmentsCount} записей
                  </span>
                  <span className={isDark ? "text-amber-400" : "text-amber-600"}>
                    {percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}

// ===== ВКЛАДКА "ЭФФЕКТИВНОСТЬ" =====
function PerformanceTab({
  data,
  isDark,
}: {
  data: KeyMetricsResponse;
  isDark: boolean;
}) {
  const { formatCurrency, formatNumber } = useAnalytics();

  const glassCls = isDark
    ? "bg-white/[0.07] backdrop-blur-2xl border border-white/[0.1]"
    : "bg-white border border-gray-200/70";

  return (
    <div className="space-y-6">
      {/* График выручки по мастерам */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl p-6 transition-all duration-300 ${glassCls}`}
      >
        <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"} mb-6`}>
          Выручка по мастерам
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data.financial.revenueByMaster} layout="vertical">
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke={isDark ? "#ffffff10" : "#E5E7EB"} 
            />
            <XAxis
              type="number"
              stroke={isDark ? "#ffffff30" : "#9CA3AF"}
              tick={{ fill: isDark ? "#ffffff60" : "#6B7280" }}
              tickFormatter={(value) => `₽${(value / 1000).toFixed(0)}к`}
            />
            <YAxis
              type="category"
              dataKey="masterName"
              stroke={isDark ? "#ffffff30" : "#9CA3AF"}
              tick={{ fill: isDark ? "#ffffff60" : "#6B7280" }}
              width={150}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? "#1F2937" : "white",
                border: isDark ? "1px solid #ffffff20" : "1px solid #E5E7EB",
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
                  fill={COLORS.primary[index % COLORS.primary.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Детальная статистика */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {data.masters.topMasters.slice(0, 4).map((master, index) => {
          const averagePerAppointment =
            master.appointmentsCount > 0
              ? master.totalRevenue / master.appointmentsCount
              : 0;

          return (
            <motion.div
              key={master.masterId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`rounded-2xl p-6 transition-all duration-300 ${glassCls}`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white font-bold`}>
                  {index + 1}
                </div>
                <div>
                  <h4 className={`font-bold text-lg ${isDark ? "text-white" : "text-gray-900"}`}>
                    {master.masterName}
                  </h4>
                  <p className={`text-sm ${isDark ? "text-white/40" : "text-gray-500"}`}>
                    Показатели эффективности
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className={`flex items-center justify-between p-3 rounded-lg ${
                  isDark ? "bg-emerald-500/20 border border-emerald-500/30" : "bg-emerald-50 border border-emerald-200"
                }`}>
                  <div className="flex items-center gap-2">
                    <DollarSign className={`w-4 h-4 ${isDark ? "text-emerald-400" : "text-emerald-600"}`} />
                    <span className={`text-sm ${isDark ? "text-white/70" : "text-gray-700"}`}>
                      Выручка
                    </span>
                  </div>
                  <span className={`font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                    {formatCurrency(master.totalRevenue)}
                  </span>
                </div>

                <div className={`flex items-center justify-between p-3 rounded-lg ${
                  isDark ? "bg-blue-500/20 border border-blue-500/30" : "bg-blue-50 border border-blue-200"
                }`}>
                  <div className="flex items-center gap-2">
                    <Calendar className={`w-4 h-4 ${isDark ? "text-blue-400" : "text-blue-600"}`} />
                    <span className={`text-sm ${isDark ? "text-white/70" : "text-gray-700"}`}>
                      Записей
                    </span>
                  </div>
                  <span className={`font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                    {formatNumber(master.appointmentsCount)}
                  </span>
                </div>

                <div className={`flex items-center justify-between p-3 rounded-lg ${
                  isDark ? "bg-amber-500/20 border border-amber-500/30" : "bg-amber-50 border border-amber-200"
                }`}>
                  <div className="flex items-center gap-2">
                    <Target className={`w-4 h-4 ${isDark ? "text-amber-400" : "text-amber-600"}`} />
                    <span className={`text-sm ${isDark ? "text-white/70" : "text-gray-700"}`}>
                      Средний чек
                    </span>
                  </div>
                  <span className={`font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                    {formatCurrency(averagePerAppointment)}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ===== ВКЛАДКА "СРАВНЕНИЕ" =====
function ComparisonTab({
  data,
  isDark,
}: {
  data: KeyMetricsResponse;
  isDark: boolean;
}) {
  const { formatCurrency, formatNumber } = useAnalytics();

  const glassCls = isDark
    ? "bg-white/[0.07] backdrop-blur-2xl border border-white/[0.1]"
    : "bg-white border border-gray-200/70";

  // Подготовка данных для радарной диаграммы
  const radarData = data.masters.topMasters.slice(0, 5).map((master) => ({
    master: master.masterName.split(" ")[0], // Только имя
    revenue: master.totalRevenue / 1000, // В тысячах
    appointments: master.appointmentsCount,
  }));

  return (
    <div className="space-y-6">
      {/* Радарная диаграмма */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl p-6 transition-all duration-300 ${glassCls}`}
      >
        <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"} mb-6`}>
          Сравнительный анализ мастеров
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart data={radarData}>
            <PolarGrid 
              stroke={isDark ? "#ffffff20" : "#E5E7EB"} 
            />
            <PolarAngleAxis
              dataKey="master"
              stroke={isDark ? "#ffffff40" : "#6B7280"}
              tick={{ fill: isDark ? "#ffffff60" : "#6B7280" }}
            />
            <PolarRadiusAxis 
              stroke={isDark ? "#ffffff30" : "#9CA3AF"} 
              tick={{ fill: isDark ? "#ffffff40" : "#6B7280" }}
            />
            <Radar
              name="Выручка (тыс. ₽)"
              dataKey="revenue"
              stroke="#F59E0B"
              fill="#F59E0B"
              fillOpacity={0.4}
            />
            <Radar
              name="Записей"
              dataKey="appointments"
              stroke="#EF4444"
              fill="#EF4444"
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

      {/* Сравнительная таблица */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`rounded-2xl p-6 transition-all duration-300 ${glassCls}`}
      >
        <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"} mb-6`}>
          Детальное сравнение
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${isDark ? "border-white/[0.07]" : "border-gray-200"}`}>
                <th className={`text-left py-3 px-4 text-sm font-semibold ${isDark ? "text-white/60" : "text-gray-600"}`}>
                  Место
                </th>
                <th className={`text-left py-3 px-4 text-sm font-semibold ${isDark ? "text-white/60" : "text-gray-600"}`}>
                  Мастер
                </th>
                <th className={`text-right py-3 px-4 text-sm font-semibold ${isDark ? "text-white/60" : "text-gray-600"}`}>
                  Выручка
                </th>
                <th className={`text-right py-3 px-4 text-sm font-semibold ${isDark ? "text-white/60" : "text-gray-600"}`}>
                  Записей
                </th>
                <th className={`text-right py-3 px-4 text-sm font-semibold ${isDark ? "text-white/60" : "text-gray-600"}`}>
                  Средний чек
                </th>
                <th className={`text-right py-3 px-4 text-sm font-semibold ${isDark ? "text-white/60" : "text-gray-600"}`}>
                  % от выручки
                </th>
              </tr>
            </thead>
            <tbody>
              {data.masters.topMasters.map((master, index) => {
                const averageCheck =
                  master.appointmentsCount > 0
                    ? master.totalRevenue / master.appointmentsCount
                    : 0;
                const percentage =
                  (master.totalRevenue / data.financial.totalRevenue) * 100;

                return (
                  <tr
                    key={master.masterId}
                    className={`border-b ${isDark ? "border-white/[0.07] hover:bg-white/[0.03]" : "border-gray-100 hover:bg-gray-50"} transition-colors`}
                  >
                    <td className="py-4 px-4">
                      <div
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-bold text-white ${
                          index === 0
                            ? "bg-gradient-to-br from-amber-500 to-orange-500"
                            : "bg-gray-400"
                        }`}
                      >
                        {index + 1}
                      </div>
                    </td>
                    <td className={`py-4 px-4 font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                      {master.masterName}
                    </td>
                    <td className={`py-4 px-4 text-right font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                      {formatCurrency(master.totalRevenue)}
                    </td>
                    <td className={`py-4 px-4 text-right ${isDark ? "text-white/70" : "text-gray-600"}`}>
                      {formatNumber(master.appointmentsCount)}
                    </td>
                    <td className={`py-4 px-4 text-right ${isDark ? "text-white/70" : "text-gray-600"}`}>
                      {formatCurrency(averageCheck)}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                        isDark ? "bg-amber-500/20 text-amber-400" : "bg-amber-100 text-amber-700"
                      }`}>
                        {percentage.toFixed(1)}%
                      </span>
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

// ===== ВКЛАДКА "ЗАГРУЗКА" =====
function WorkloadTab({
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

  const averageAppointmentsPerMaster =
    data.masters.mastersCount > 0
      ? data.appointments.totalAppointments / data.masters.mastersCount
      : 0;

  return (
    <div className="space-y-6">
      {/* Общая загрузка */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl p-8 transition-all duration-300 bg-gradient-to-br from-amber-500/20 via-orange-500/20 to-amber-500/10 border ${
          isDark ? "border-amber-500/30" : "border-amber-200"
        }`}
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="p-4 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl">
            <Activity className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"} mb-1`}>
              Средняя загрузка мастеров
            </h2>
            <p className={`${isDark ? "text-white/40" : "text-gray-600"}`}>
              Общий уровень занятости
            </p>
          </div>
        </div>
        <div className={`text-6xl font-bold ${isDark ? "text-amber-400" : "text-amber-600"} mb-4`}>
          {formatPercent(data.masters.averageLoad)}
        </div>
        <p className={`text-lg ${isDark ? "text-white/70" : "text-gray-700"}`}>
          В среднем {formatNumber(Math.round(averageAppointmentsPerMaster))}{" "}
          записей на мастера
        </p>

        <div className="mt-6 h-4 bg-gray-200 dark:bg-white/[0.07] rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${data.masters.averageLoad}%` }}
            transition={{ duration: 1.5, delay: 0.3 }}
            className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
          />
        </div>
      </motion.div>

      {/* Загрузка по мастерам */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`rounded-2xl p-6 transition-all duration-300 ${glassCls}`}
      >
        <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"} mb-6`}>
          Загрузка каждого мастера
        </h3>

        <div className="space-y-4">
          {data.masters.topMasters.map((master, index) => {
            // Примерная загрузка на основе количества записей
            const workload =
              averageAppointmentsPerMaster > 0
                ? (master.appointmentsCount / averageAppointmentsPerMaster) *
                  data.masters.averageLoad
                : 0;

            return (
              <div
                key={master.masterId}
                className={`p-5 rounded-xl ${
                  isDark ? "bg-white/[0.04] border border-white/[0.05]" : "bg-gray-50 border border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className={`font-semibold text-lg ${isDark ? "text-white" : "text-gray-900"}`}>
                      {master.masterName}
                    </h4>
                    <p className={`text-sm ${isDark ? "text-white/40" : "text-gray-500"}`}>
                      {master.appointmentsCount} записей
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                      {formatPercent(Math.min(workload, 100))}
                    </div>
                    <div className={`text-sm ${isDark ? "text-white/40" : "text-gray-500"}`}>
                      загрузка
                    </div>
                  </div>
                </div>
                <div className={`h-3 ${isDark ? "bg-white/[0.07]" : "bg-gray-200"} rounded-full overflow-hidden`}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(workload, 100)}%` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                    className={`h-full rounded-full ${
                      workload >= 90
                        ? "bg-gradient-to-r from-red-500 to-orange-500"
                        : workload >= 70
                          ? "bg-gradient-to-r from-amber-500 to-orange-500"
                          : "bg-gradient-to-r from-emerald-500 to-green-500"
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Рекомендации */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={`rounded-2xl p-6 transition-all duration-300 bg-gradient-to-br from-blue-500/10 via-cyan-500/10 to-blue-500/5 border ${
          isDark ? "border-blue-500/20" : "border-blue-200"
        }`}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
            Рекомендации по оптимизации
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`p-4 rounded-xl ${
            isDark ? "bg-white/[0.04] border border-white/[0.05]" : "bg-white border border-gray-200/50"
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <Zap className={`w-5 h-5 ${isDark ? "text-red-400" : "text-red-600"}`} />
              <h4 className={`font-semibold ${isDark ? "text-red-400" : "text-red-900"}`}>
                Перегруженные мастера
              </h4>
            </div>
            <p className={`text-sm ${isDark ? "text-white/60" : "text-gray-700"}`}>
              Распределите нагрузку равномернее между всеми мастерами
            </p>
          </div>

          <div className={`p-4 rounded-xl ${
            isDark ? "bg-white/[0.04] border border-white/[0.05]" : "bg-white border border-gray-200/50"
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <Target className={`w-5 h-5 ${isDark ? "text-emerald-400" : "text-emerald-600"}`} />
              <h4 className={`font-semibold ${isDark ? "text-emerald-400" : "text-emerald-900"}`}>
                Недозагруженные мастера
              </h4>
            </div>
            <p className={`text-sm ${isDark ? "text-white/60" : "text-gray-700"}`}>
              Увеличьте видимость мастеров с низкой загрузкой
            </p>
          </div>
        </div>

        <div className={`mt-4 p-4 rounded-xl ${
          isDark ? "bg-amber-500/10 border border-amber-500/20" : "bg-amber-50 border border-amber-200"
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <Info className={`w-5 h-5 ${isDark ? "text-amber-400" : "text-amber-600"}`} />
            <h4 className={`font-semibold ${isDark ? "text-amber-400" : "text-amber-900"}`}>
              Ключевой инсайт
            </h4>
          </div>
          <p className={`text-sm ${isDark ? "text-white/60" : "text-gray-700"}`}>
            Средняя загрузка составляет {data.masters.averageLoad.toFixed(1)}%. 
            {data.masters.averageLoad > 80 
              ? " Мастера работают с высокой нагрузкой. Рассмотрите возможность найма дополнительных сотрудников."
              : data.masters.averageLoad < 50
                ? " Загрузка ниже оптимальной. Рекомендуется активизировать маркетинг."
                : " Загрузка находится в оптимальном диапазоне."}
          </p>
        </div>
      </motion.div>
    </div>
  );
}