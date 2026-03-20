"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Package,
  Star,
  DollarSign,
  Calendar,
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
  Info,
  Target,
  Zap,
  Award,
  Tag,
  ShoppingBag,
  Sparkles,
  TrendingUp as Growth,
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
  ScatterChart,
  Scatter,
  ZAxis,
} from "recharts";
import { analyticsService } from "@/services/analytics/analytics.service";
import { KeyMetricsResponse, TimePeriod } from "@/types/analytics.types";
import { useAnalytics } from "@/hooks/useAnalytics";
import { ADMIN_ROUTES } from "@/app/lib/admin.routes";

// Цветовая палитра
const COLORS = {
  primary: ["#8B5CF6", "#A78BFA", "#C4B5FD", "#DDD6FE", "#EDE9FE"],
  vibrant: ["#8B5CF6", "#EC4899", "#F59E0B", "#10B981", "#3B82F6"],
  gradient: [
    "rgba(139, 92, 246, 0.8)",
    "rgba(236, 72, 153, 0.8)",
    "rgba(245, 158, 11, 0.8)",
    "rgba(16, 185, 129, 0.8)",
    "rgba(59, 130, 246, 0.8)",
  ],
};

export default function ServicesAnalyticsPage() {
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
    "overview" | "popularity" | "profitability" | "matrix"
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
    loadServicesData();
  }, [selectedPeriod]);

  const loadServicesData = async (showLoading = true) => {
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
      setError("Не удалось загрузить данные услуг");
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
      a.download = `services-report-${new Date().toISOString().split("T")[0]}.pdf`;
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
    { id: "popularity", label: "Популярность", icon: Star },
    { id: "profitability", label: "Прибыльность", icon: DollarSign },
    { id: "matrix", label: "Матрица услуг", icon: Activity },
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
                Аналитика услуг
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
                Популярность и прибыльность 📦
              </h1>
              <p
                className={`mt-2 text-sm ${
                  isDark ? "text-white/40" : "text-gray-400"
                }`}
              >
                Детальный анализ услуг и их эффективности
              </p>
            </div>

            <div className="flex gap-2.5 flex-wrap">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => loadServicesData(false)}
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
                    ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-violet-500/25 hover:shadow-violet-500/40"
                    : "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-violet-500/20 hover:shadow-violet-500/35"
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
                        tab.id as "overview" | "popularity" | "profitability" | "matrix"
                      )
                    }
                    className={`
                      flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200
                      ${
                        activeTab === tab.id
                          ? isDark
                            ? "bg-violet-500/20 border border-violet-400/30 text-violet-300"
                            : "bg-violet-50 border border-violet-300 text-violet-600"
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
                      : "bg-gray-50 border-gray-200 text-gray-700 focus:border-violet-300 focus:bg-white"
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
                      ? "bg-violet-500/20 border-violet-400/30 text-violet-300"
                      : "bg-violet-50 border-violet-300 text-violet-600"
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
                      <div className="w-3 h-3 rounded-full bg-gradient-to-r from-violet-500 to-purple-500" />
                      <span className={isDark ? "text-white/60" : "text-gray-600"}>
                        Популярные услуги
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-r from-pink-500 to-rose-500" />
                      <span className={isDark ? "text-white/60" : "text-gray-600"}>
                        Прибыльные услуги
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-500 to-green-500" />
                      <span className={isDark ? "text-white/60" : "text-gray-600"}>
                        Стабильный спрос
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
                isDark ? "border-violet-400" : "border-violet-400"
              }`}
              style={{ borderWidth: 3 }}
            />
            <p
              className={`text-sm ${
                isDark ? "text-white/40" : "text-gray-400"
              }`}
            >
              Загрузка данных услуг...
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
                {activeTab === "popularity" && (
                  <PopularityTab data={analyticsData} isDark={isDark} />
                )}
                {activeTab === "profitability" && (
                  <ProfitabilityTab data={analyticsData} isDark={isDark} />
                )}
                {activeTab === "matrix" && (
                  <MatrixTab data={analyticsData} isDark={isDark} />
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
  const { formatCurrency, formatNumber } = useAnalytics();

  const glassCls = isDark
    ? "bg-white/[0.07] backdrop-blur-2xl border border-white/[0.1]"
    : "bg-white border border-gray-200/70";

  const totalAppointments = data.services.popularServices.reduce(
    (sum, s) => sum + s.appointmentsCount,
    0
  );

  const averageAppointmentsPerService =
    data.services.servicesCount > 0 ? totalAppointments / data.services.servicesCount : 0;

  const averagePrice =
    data.services.popularServices.length > 0
      ? data.services.popularServices.reduce((sum, s) => sum + s.averagePrice, 0) /
        data.services.popularServices.length
      : 0;

  const stats = [
    {
      title: "Всего услуг",
      value: formatNumber(data.services.servicesCount),
      change: 0,
      icon: Package,
      gradient: "from-violet-500 to-purple-500",
      bgColor: isDark ? "bg-violet-500/10" : "bg-violet-50",
      textColor: isDark ? "text-violet-400" : "text-violet-600",
      description: "В каталоге",
    },
    {
      title: "Топ услуга",
      value: data.services.popularServices[0]?.serviceName || "Нет данных",
      change: 0,
      icon: Award,
      gradient: "from-purple-500 to-pink-500",
      bgColor: isDark ? "bg-purple-500/10" : "bg-purple-50",
      textColor: isDark ? "text-purple-400" : "text-purple-600",
      description: "Самая популярная",
      isText: true,
    },
    {
      title: "Средняя цена",
      value: formatCurrency(averagePrice),
      change: 8,
      icon: Tag,
      gradient: "from-pink-500 to-rose-500",
      bgColor: isDark ? "bg-pink-500/10" : "bg-pink-50",
      textColor: isDark ? "text-pink-400" : "text-pink-600",
      description: "Стоимость услуг",
    },
    {
      title: "Записей на услугу",
      value: formatNumber(Math.round(averageAppointmentsPerService)),
      change: 12,
      icon: Calendar,
      gradient: "from-blue-500 to-cyan-500",
      bgColor: isDark ? "bg-blue-500/10" : "bg-blue-50",
      textColor: isDark ? "text-blue-400" : "text-blue-600",
      description: "Среднее количество",
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
                  {stat.change !== 0 && !stat.isText && (
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
                  className={`${stat.isText ? "text-xl" : "text-2xl"} font-bold leading-none mb-1 ${
                    isDark ? "text-white" : "text-gray-900"
                  } ${stat.isText ? "line-clamp-2" : ""}`}
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

      {/* Топ услуги */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`rounded-2xl p-6 transition-all duration-300 ${glassCls}`}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className={`p-2 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500`}>
            <Star className="w-5 h-5 text-white" />
          </div>
          <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
            Топ услуги по популярности и выручке
          </h3>
        </div>

        <div className="space-y-4">
          {data.services.popularServices.map((service, index) => {
            const revenuePercentage =
              (service.totalRevenue / data.financial.totalRevenue) * 100;

            return (
              <div key={service.serviceId} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold text-white ${
                        index === 0
                          ? "bg-gradient-to-br from-violet-500 to-purple-500"
                          : index === 1
                            ? "bg-gradient-to-br from-purple-400 to-pink-400"
                            : index === 2
                              ? "bg-gradient-to-br from-pink-400 to-rose-400"
                              : "bg-gradient-to-br from-gray-300 to-gray-400"
                      }`}
                    >
                      {index === 0 ? <Star className="w-4 h-4" /> : index + 1}
                    </div>
                    <div>
                      <span className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                        {service.serviceName}
                      </span>
                      <span className={`text-xs ${isDark ? "text-white/40" : "text-gray-500"} ml-2`}>
                        {service.appointmentsCount} записей
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                      {formatCurrency(service.totalRevenue)}
                    </span>
                  </div>
                </div>

                <div className={`h-1.5 ${isDark ? "bg-white/[0.07]" : "bg-gray-200"} rounded-full overflow-hidden`}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${revenuePercentage}%` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                    className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"
                  />
                </div>
                <div className="flex justify-between text-xs">
                  <span className={isDark ? "text-white/40" : "text-gray-500"}>
                    Средняя цена: {formatCurrency(service.averagePrice)}
                  </span>
                  <span className={isDark ? "text-violet-400" : "text-violet-600"}>
                    {revenuePercentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Распределение услуг */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className={`rounded-2xl p-6 transition-all duration-300 ${glassCls}`}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-2 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500`}>
              <PieChartIcon className="w-5 h-5 text-white" />
            </div>
            <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
              Распределение по выручке
            </h3>
          </div>

          <ResponsiveContainer width="100%" height={250}>
            <RechartsPieChart>
              <Pie
                data={data.services.popularServices}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry: any) => {
                  const dataItem = data.services.popularServices[entry.index];
                  return dataItem.serviceName.length > 15
                    ? dataItem.serviceName.substring(0, 12) + "..."
                    : dataItem.serviceName;
                }}
                outerRadius={80}
                fill="#8884d8"
                dataKey="totalRevenue"
              >
                {data.services.popularServices.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS.vibrant[index % COLORS.vibrant.length]}
                  />
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
                formatter={(value: any) => [formatCurrency(value), "Выручка"]}
              />
            </RechartsPieChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className={`rounded-2xl p-6 transition-all duration-300 ${glassCls}`}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500`}>
              <Target className="w-5 h-5 text-white" />
            </div>
            <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
              Ключевые показатели
            </h3>
          </div>

          <div className="space-y-4">
            <div className={`p-4 rounded-xl ${
              isDark ? "bg-violet-500/20 border border-violet-500/30" : "bg-violet-50 border border-violet-200"
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <ShoppingBag className={`w-5 h-5 ${isDark ? "text-violet-400" : "text-violet-600"}`} />
                <span className={`text-sm font-medium ${isDark ? "text-violet-400" : "text-violet-900"}`}>
                  Общая выручка от услуг
                </span>
              </div>
              <div className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                {formatCurrency(data.financial.totalRevenue)}
              </div>
            </div>

            <div className={`p-4 rounded-xl ${
              isDark ? "bg-purple-500/20 border border-purple-500/30" : "bg-purple-50 border border-purple-200"
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <Activity className={`w-5 h-5 ${isDark ? "text-purple-400" : "text-purple-600"}`} />
                <span className={`text-sm font-medium ${isDark ? "text-purple-400" : "text-purple-900"}`}>
                  Всего записей
                </span>
              </div>
              <div className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                {formatNumber(totalAppointments)}
              </div>
            </div>

            <div className={`p-4 rounded-xl ${
              isDark ? "bg-pink-500/20 border border-pink-500/30" : "bg-pink-50 border border-pink-200"
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className={`w-5 h-5 ${isDark ? "text-pink-400" : "text-pink-600"}`} />
                <span className={`text-sm font-medium ${isDark ? "text-pink-400" : "text-pink-900"}`}>
                  Средний чек
                </span>
              </div>
              <div className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                {formatCurrency(data.financial.averageCheck)}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ===== ВКЛАДКА "ПОПУЛЯРНОСТЬ" =====
function PopularityTab({
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

  const totalAppointments = data.services.popularServices.reduce(
    (sum, s) => sum + s.appointmentsCount,
    0
  );

  return (
    <div className="space-y-6">
      {/* График популярности */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl p-6 transition-all duration-300 ${glassCls}`}
      >
        <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"} mb-6`}>
          Популярность услуг по количеству записей
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data.services.popularServices}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke={isDark ? "#ffffff10" : "#E5E7EB"} 
            />
            <XAxis
              dataKey="serviceName"
              stroke={isDark ? "#ffffff30" : "#9CA3AF"}
              tick={{ fill: isDark ? "#ffffff60" : "#6B7280" }}
              angle={-45}
              textAnchor="end"
              height={100}
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
              formatter={(value: any) => [value, "Записей"]}
              cursor={{ fill: isDark ? "#8B5CF620" : "rgba(139, 92, 246, 0.1)" }}
            />
            <Bar dataKey="appointmentsCount" radius={[8, 8, 0, 0]}>
              {data.services.popularServices.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS.vibrant[index % COLORS.vibrant.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Рейтинг популярности */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`rounded-2xl p-6 transition-all duration-300 ${glassCls}`}
      >
        <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"} mb-6`}>
          Рейтинг по популярности
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.services.popularServices.map((service, index) => {
            const percentage =
              (service.appointmentsCount / totalAppointments) * 100;

            return (
              <div
                key={service.serviceId}
                className={`p-5 rounded-xl ${
                  isDark ? "bg-white/[0.04] border border-white/[0.05]" : "bg-gray-50 border border-gray-200"
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-lg font-bold text-white ${
                      index === 0
                        ? "bg-gradient-to-br from-violet-500 to-purple-500"
                        : "bg-gray-400"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-semibold ${isDark ? "text-white" : "text-gray-900"} line-clamp-1`}>
                      {service.serviceName}
                    </h4>
                    <p className={`text-xs ${isDark ? "text-white/40" : "text-gray-500"}`}>
                      {percentage.toFixed(1)}% от всех записей
                    </p>
                  </div>
                </div>

                <div className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-900"} mb-2`}>
                  {formatNumber(service.appointmentsCount)}
                </div>
                <div className={`text-sm ${isDark ? "text-white/40" : "text-gray-600"} mb-3`}>
                  записей
                </div>

                <div className={`h-2 ${isDark ? "bg-white/[0.07]" : "bg-gray-200"} rounded-full overflow-hidden`}>
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
      </motion.div>
    </div>
  );
}

// ===== ВКЛАДКА "ПРИБЫЛЬНОСТЬ" =====
function ProfitabilityTab({
  data,
  isDark,
}: {
  data: KeyMetricsResponse;
  isDark: boolean;
}) {
  const { formatCurrency } = useAnalytics();

  const glassCls = isDark
    ? "bg-white/[0.07] backdrop-blur-2xl border border-white/[0.1]"
    : "bg-white border border-gray-200/70";

  return (
    <div className="space-y-6">
      {/* График прибыльности */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl p-6 transition-all duration-300 ${glassCls}`}
      >
        <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"} mb-6`}>
          Прибыльность услуг по выручке
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data.services.popularServices} layout="vertical">
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
              dataKey="serviceName"
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
            <Bar dataKey="totalRevenue" radius={[0, 8, 8, 0]}>
              {data.services.popularServices.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS.gradient[index % COLORS.gradient.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Таблица прибыльности */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`rounded-2xl p-6 transition-all duration-300 ${glassCls}`}
      >
        <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"} mb-6`}>
          Детальный анализ прибыльности
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${isDark ? "border-white/[0.07]" : "border-gray-200"}`}>
                <th className={`text-left py-3 px-4 text-sm font-semibold ${isDark ? "text-white/60" : "text-gray-600"}`}>
                  Услуга
                </th>
                <th className={`text-right py-3 px-4 text-sm font-semibold ${isDark ? "text-white/60" : "text-gray-600"}`}>
                  Выручка
                </th>
                <th className={`text-right py-3 px-4 text-sm font-semibold ${isDark ? "text-white/60" : "text-gray-600"}`}>
                  Записей
                </th>
                <th className={`text-right py-3 px-4 text-sm font-semibold ${isDark ? "text-white/60" : "text-gray-600"}`}>
                  Средняя цена
                </th>
                <th className={`text-right py-3 px-4 text-sm font-semibold ${isDark ? "text-white/60" : "text-gray-600"}`}>
                  % от выручки
                </th>
              </tr>
            </thead>
            <tbody>
              {data.services.popularServices.map((service, index) => {
                const percentage =
                  (service.totalRevenue / data.financial.totalRevenue) * 100;

                return (
                  <tr
                    key={service.serviceId}
                    className={`border-b ${isDark ? "border-white/[0.07] hover:bg-white/[0.03]" : "border-gray-100 hover:bg-gray-50"} transition-colors`}
                  >
                    <td className={`py-4 px-4 font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                      {service.serviceName}
                    </td>
                    <td className={`py-4 px-4 text-right font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                      {formatCurrency(service.totalRevenue)}
                    </td>
                    <td className={`py-4 px-4 text-right ${isDark ? "text-white/70" : "text-gray-600"}`}>
                      {service.appointmentsCount}
                    </td>
                    <td className={`py-4 px-4 text-right ${isDark ? "text-white/70" : "text-gray-600"}`}>
                      {formatCurrency(service.averagePrice)}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                        isDark ? "bg-violet-500/20 text-violet-400" : "bg-violet-100 text-violet-700"
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

// ===== ВКЛАДКА "МАТРИЦА УСЛУГ" =====
function MatrixTab({
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

  // Подготовка данных для scatter chart (матрица популярности и прибыльности)
  const scatterData = data.services.popularServices.map((service) => ({
    name: service.serviceName,
    popularity: service.appointmentsCount,
    revenue: service.totalRevenue,
    avgPrice: service.averagePrice,
  }));

  const totalAppointments = data.services.popularServices.reduce(
    (sum, s) => sum + s.appointmentsCount,
    0
  );

  return (
    <div className="space-y-6">
      {/* Scatter chart - матрица */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl p-6 transition-all duration-300 ${glassCls}`}
      >
        <div className="mb-6">
          <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"} mb-2`}>
            Матрица популярности и прибыльности
          </h3>
          <p className={`text-sm ${isDark ? "text-white/40" : "text-gray-600"}`}>
            Правый верхний квадрант - наиболее эффективные услуги
          </p>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke={isDark ? "#ffffff10" : "#E5E7EB"} 
            />
            <XAxis
              type="number"
              dataKey="popularity"
              name="Популярность"
              stroke={isDark ? "#ffffff30" : "#9CA3AF"}
              tick={{ fill: isDark ? "#ffffff60" : "#6B7280" }}
              label={{
                value: "Количество записей",
                position: "insideBottom",
                offset: -10,
                fill: isDark ? "#ffffff60" : "#6B7280",
              }}
            />
            <YAxis
              type="number"
              dataKey="revenue"
              name="Выручка"
              stroke={isDark ? "#ffffff30" : "#9CA3AF"}
              tick={{ fill: isDark ? "#ffffff60" : "#6B7280" }}
              tickFormatter={(value) => `₽${(value / 1000).toFixed(0)}к`}
              label={{
                value: "Выручка",
                angle: -90,
                position: "insideLeft",
                fill: isDark ? "#ffffff60" : "#6B7280",
              }}
            />
            <ZAxis
              type="number"
              dataKey="avgPrice"
              range={[100, 1000]}
              name="Средняя цена"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? "#1F2937" : "white",
                border: isDark ? "1px solid #ffffff20" : "1px solid #E5E7EB",
                borderRadius: "12px",
                padding: "12px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
              formatter={(value: any, name?: string) => {
                if (name === "Популярность") return [value, "Записей"];
                if (name === "Выручка") return [formatCurrency(value), "Выручка"];
                if (name === "Средняя цена")
                  return [formatCurrency(value), "Средняя цена"];
                return [value, name || ""];
              }}
            />
            <Scatter data={scatterData} fill="#8B5CF6">
              {scatterData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS.vibrant[index % COLORS.vibrant.length]}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Категоризация услуг */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`rounded-2xl p-6 transition-all duration-300 bg-gradient-to-br from-violet-500/10 via-purple-500/10 to-violet-500/5 border ${
          isDark ? "border-violet-500/20" : "border-violet-200"
        }`}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
            Категории услуг по эффективности
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Звёзды (высокая популярность + высокая выручка) */}
          <div className={`p-4 rounded-xl ${
            isDark ? "bg-white/[0.04] border border-white/[0.05]" : "bg-white border border-gray-200/50"
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-5 h-5 text-amber-500" />
              <h4 className={`font-semibold ${isDark ? "text-amber-400" : "text-amber-900"}`}>
                Звёзды ⭐
              </h4>
            </div>
            <p className={`text-sm ${isDark ? "text-white/40" : "text-gray-600"} mb-3`}>
              Высокая популярность и выручка
            </p>
            <div className="space-y-2">
              {data.services.popularServices.slice(0, 2).map((service) => (
                <div
                  key={service.serviceId}
                  className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}
                >
                  • {service.serviceName}
                </div>
              ))}
            </div>
          </div>

          {/* Рабочие лошадки */}
          <div className={`p-4 rounded-xl ${
            isDark ? "bg-white/[0.04] border border-white/[0.05]" : "bg-white border border-gray-200/50"
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-5 h-5 text-blue-500" />
              <h4 className={`font-semibold ${isDark ? "text-blue-400" : "text-blue-900"}`}>
                Рабочие лошадки 💪
              </h4>
            </div>
            <p className={`text-sm ${isDark ? "text-white/40" : "text-gray-600"} mb-3`}>
              Стабильный спрос и доход
            </p>
            <div className="space-y-2">
              {data.services.popularServices.slice(2, 4).map((service) => (
                <div
                  key={service.serviceId}
                  className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}
                >
                  • {service.serviceName}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={`mt-4 p-4 rounded-xl ${
          isDark ? "bg-amber-500/10 border border-amber-500/20" : "bg-amber-50 border border-amber-200"
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <Info className={`w-5 h-5 ${isDark ? "text-amber-400" : "text-amber-600"}`} />
            <h4 className={`font-semibold ${isDark ? "text-amber-400" : "text-amber-900"}`}>
              Рекомендации
            </h4>
          </div>
          <p className={`text-sm ${isDark ? "text-white/60" : "text-gray-700"}`}>
            Инвестируйте в продвижение "звёзд" и оптимизируйте ценообразование
            для остальных услуг
          </p>
        </div>
      </motion.div>
    </div>
  );
}