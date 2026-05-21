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
  ChevronUp,
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
} from "@/app/components/charts";
import { analyticsService } from "@/services/analytics/analytics.service";
import {
  KeyMetricsResponse,
  TimePeriod,
  RevenueByMonth,
} from "@/types/analytics.types";
import { useAnalytics } from "@/hooks/useAnalytics";
import { ADMIN_ROUTES } from "@/app/lib/admin.routes";

// Цветовая палитра
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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "overview" | "trends" | "breakdown" | "comparison"
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

  // Загрузка данных
  useEffect(() => {
    loadFinancialData();
  }, [selectedPeriod]);

  const loadFinancialData = async (showLoading = true) => {
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
      setError("Не удалось загрузить финансовые данные");
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
      a.download = `financial-report-${new Date().toISOString().split("T")[0]}.pdf`;
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
    { id: "trends", label: "Динамика", icon: LineChartIcon },
    { id: "breakdown", label: "Детализация", icon: PieChart },
    { id: "comparison", label: "Сравнение", icon: Activity },
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
                Финансовая аналитика
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
                Анализ доходов и выручки 💰
              </h1>
              <p
                className={`mt-2 text-sm ${
                  isDark ? "text-white/40" : "text-gray-400"
                }`}
              >
                Детальный анализ финансовых показателей и динамики
              </p>
            </div>

            <div className="flex gap-2.5 flex-wrap">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => loadFinancialData(false)}
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
                    ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-emerald-500/25 hover:shadow-emerald-500/40"
                    : "bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-emerald-500/20 hover:shadow-emerald-500/35"
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
                        tab.id as "overview" | "trends" | "breakdown" | "comparison"
                      )
                    }
                    className={`
                      flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200
                      ${
                        activeTab === tab.id
                          ? isDark
                            ? "bg-emerald-500/20 border border-emerald-400/30 text-emerald-300"
                            : "bg-emerald-50 border border-emerald-300 text-emerald-600"
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
                      : "bg-gray-50 border-gray-200 text-gray-700 focus:border-emerald-300 focus:bg-white"
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
                      <div className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-500 to-green-500" />
                      <span className={isDark ? "text-white/60" : "text-gray-600"}>
                        Выручка и доходы
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500" />
                      <span className={isDark ? "text-white/60" : "text-gray-600"}>
                        Клиенты и записи
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
                      <span className={isDark ? "text-white/60" : "text-gray-600"}>
                        Мастера и услуги
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
                isDark ? "border-emerald-400" : "border-emerald-400"
              }`}
              style={{ borderWidth: 3 }}
            />
            <p
              className={`text-sm ${
                isDark ? "text-white/40" : "text-gray-400"
              }`}
            >
              Загрузка финансовых данных...
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
                {activeTab === "trends" && (
                  <TrendsTab data={analyticsData} isDark={isDark} />
                )}
                {activeTab === "breakdown" && (
                  <BreakdownTab data={analyticsData} isDark={isDark} />
                )}
                {activeTab === "comparison" && (
                  <ComparisonTab data={analyticsData} isDark={isDark} />
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

  const stats = [
    {
      title: "Общая выручка",
      value: formatCurrency(data.financial.totalRevenue),
      change: data.financial.revenueGrowth,
      icon: Wallet,
      gradient: "from-emerald-500 to-green-500",
      bgColor: isDark ? "bg-emerald-500/10" : "bg-emerald-50",
      textColor: isDark ? "text-emerald-400" : "text-emerald-600",
    },
    {
      title: "Месячный доход",
      value: formatCurrency(data.financial.monthlyIncome),
      change: 12.3,
      icon: DollarSign,
      gradient: "from-cyan-500 to-blue-500",
      bgColor: isDark ? "bg-cyan-500/10" : "bg-cyan-50",
      textColor: isDark ? "text-cyan-400" : "text-cyan-600",
    },
    {
      title: "Средний чек",
      value: formatCurrency(data.financial.averageCheck),
      change: 8.7,
      icon: Receipt,
      gradient: "from-violet-500 to-purple-500",
      bgColor: isDark ? "bg-violet-500/10" : "bg-violet-50",
      textColor: isDark ? "text-violet-400" : "text-violet-600",
    },
    {
      title: "Транзакций",
      value: formatNumber(data.appointments.totalAppointments),
      change: 15.2,
      icon: Activity,
      gradient: "from-fuchsia-500 to-pink-500",
      bgColor: isDark ? "bg-fuchsia-500/10" : "bg-fuchsia-50",
      textColor: isDark ? "text-fuchsia-400" : "text-fuchsia-600",
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
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* График выручки */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`rounded-2xl p-6 transition-all duration-300 ${glassCls}`}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"} mb-1`}>
              Динамика выручки
            </h3>
            <p className={`text-sm ${isDark ? "text-white/40" : "text-gray-500"}`}>
              Выручка по месяцам за выбранный период
            </p>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
            isDark ? "bg-emerald-500/20" : "bg-emerald-100"
          }`}>
            <TrendingUp className={`w-4 h-4 ${
              isDark ? "text-emerald-400" : "text-emerald-700"
            }`} />
            <span className={`text-sm font-semibold ${
              isDark ? "text-emerald-400" : "text-emerald-700"
            }`}>
              +{data.financial.revenueGrowth.toFixed(1)}%
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
                color: isDark ? "#fff" : "#374151",
              }}
              labelStyle={{ color: isDark ? "#ffffff80" : "#374151", marginBottom: "8px" }}
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
      </motion.div>

      {/* Двухколоночная секция */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Топ услуги */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className={`rounded-2xl p-6 transition-all duration-300 ${glassCls}`}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-2 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500`}>
              <Package className="w-5 h-5 text-white" />
            </div>
            <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
              Топ услуги по выручке
            </h3>
          </div>

          <div className="space-y-4">
            {data.services.popularServices.slice(0, 5).map((service, index) => {
              const percentage =
                (service.totalRevenue / data.financial.totalRevenue) * 100;
              return (
                <div key={service.serviceId} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 text-xs font-bold text-white`}>
                        {index + 1}
                      </div>
                      <span className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                        {service.serviceName}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                        {formatCurrency(service.totalRevenue)}
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-gray-200 dark:bg-white/[0.07] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                      className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"
                    />
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className={isDark ? "text-white/40" : "text-gray-500"}>
                      {service.appointmentsCount} услуг
                    </span>
                    <span className={isDark ? "text-emerald-400" : "text-emerald-600"}>
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Топ мастера */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className={`rounded-2xl p-6 transition-all duration-300 ${glassCls}`}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-2 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500`}>
              <Award className="w-5 h-5 text-white" />
            </div>
            <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
              Топ мастера по выручке
            </h3>
          </div>

          <div className="space-y-4">
            {data.masters.topMasters.slice(0, 5).map((master, index) => {
              const percentage =
                (master.totalRevenue / data.financial.totalRevenue) * 100;
              return (
                <div key={master.masterId} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 text-xs font-bold text-white`}>
                        {index + 1}
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
                  <div className="h-1.5 bg-gray-200 dark:bg-white/[0.07] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                    />
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className={isDark ? "text-white/40" : "text-gray-500"}>
                      {master.appointmentsCount} записей
                    </span>
                    <span className={isDark ? "text-emerald-400" : "text-emerald-600"}>
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Дополнительная статистика */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className={`rounded-2xl p-6 transition-all duration-300 bg-gradient-to-br from-emerald-500/10 via-green-500/10 to-emerald-500/5 border ${
          isDark ? "border-emerald-500/20" : "border-emerald-200"
        }`}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl">
            <Info className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
              Статистика клиентов и записей
            </h3>
            <p className={`text-sm ${isDark ? "text-white/40" : "text-gray-600"}`}>
              Основные показатели за выбранный период
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-5 rounded-xl ${isDark ? "bg-white/[0.04] border border-white/[0.05]" : "bg-white border border-gray-200/50"}`}>
            <div className="flex items-center gap-2 mb-2">
              <Users className={`w-4 h-4 ${isDark ? "text-emerald-400" : "text-emerald-600"}`} />
              <span className={`text-sm ${isDark ? "text-white/60" : "text-gray-600"}`}>
                Всего клиентов
              </span>
            </div>
            <div className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"} mb-1`}>
              {data.clients.totalClients.toLocaleString()}
            </div>
            <div className={`text-xs ${isDark ? "text-white/30" : "text-gray-400"}`}>
              Новых: {data.clients.newClients}
            </div>
          </div>

          <div className={`p-5 rounded-xl ${isDark ? "bg-white/[0.04] border border-white/[0.05]" : "bg-white border border-gray-200/50"}`}>
            <div className="flex items-center gap-2 mb-2">
              <Calendar className={`w-4 h-4 ${isDark ? "text-cyan-400" : "text-cyan-600"}`} />
              <span className={`text-sm ${isDark ? "text-white/60" : "text-gray-600"}`}>
                Всего записей
              </span>
            </div>
            <div className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"} mb-1`}>
              {data.appointments.totalAppointments.toLocaleString()}
            </div>
            <div className={`text-xs ${isDark ? "text-white/30" : "text-gray-400"}`}>
              Завершено: {data.appointments.completedAppointments}
            </div>
          </div>

          <div className={`p-5 rounded-xl ${isDark ? "bg-white/[0.04] border border-white/[0.05]" : "bg-white border border-gray-200/50"}`}>
            <div className="flex items-center gap-2 mb-2">
              <Target className={`w-4 h-4 ${isDark ? "text-violet-400" : "text-violet-600"}`} />
              <span className={`text-sm ${isDark ? "text-white/60" : "text-gray-600"}`}>
                Конверсия
              </span>
            </div>
            <div className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"} mb-1`}>
              {data.appointments.conversionRate.toFixed(1)}%
            </div>
            <div className={`text-xs ${isDark ? "text-white/30" : "text-gray-400"}`}>
              Удержание: {data.clients.retentionRate.toFixed(1)}%
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
      {/* График выручки по месяцам */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl p-6 transition-all duration-300 ${glassCls}`}
      >
        <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"} mb-6`}>
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
              labelStyle={{ color: isDark ? "#ffffff80" : "#374151", marginBottom: "8px" }}
              formatter={(value: any) => [formatCurrency(value), "Выручка"]}
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
      </motion.div>

      {/* График клиентов по месяцам */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`rounded-2xl p-6 transition-all duration-300 ${glassCls}`}
      >
        <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"} mb-6`}>
          Клиенты по месяцам
        </h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data.clients.clientsByMonth}>
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
              cursor={{ fill: isDark ? "#8B5CF620" : "rgba(139, 92, 246, 0.1)" }}
              formatter={(value: any) => [formatNumber(value), "Клиенты"]}
            />
            <Bar dataKey="clients" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}

// ===== ВКЛАДКА "ДЕТАЛИЗАЦИЯ" =====
function BreakdownTab({
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
      {/* Детализация по мастерам */}
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
                  fill={COLORS.gradient[index % COLORS.gradient.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Таблица услуг */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`rounded-2xl p-6 transition-all duration-300 ${glassCls}`}
      >
        <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"} mb-6`}>
          Детализация по услугам
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
                  Количество
                </th>
                <th className={`text-right py-3 px-4 text-sm font-semibold ${isDark ? "text-white/60" : "text-gray-600"}`}>
                  Ср. цена
                </th>
              </tr>
            </thead>
            <tbody>
              {data.services.popularServices.map((service, index) => (
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
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
  const { formatCurrency, formatPercent, formatNumber } = useAnalytics();

  const glassCls = isDark
    ? "bg-white/[0.07] backdrop-blur-2xl border border-white/[0.1]"
    : "bg-white border border-gray-200/70";

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
            gradient: "from-emerald-500 to-green-500",
          },
          {
            title: "Клиентов",
            current: data.clients.totalClients,
            icon: Users,
            change: 15,
            gradient: "from-blue-500 to-cyan-500",
          },
          {
            title: "Записей",
            current: data.appointments.totalAppointments,
            icon: Calendar,
            change: 12,
            gradient: "from-purple-500 to-pink-500",
          },
          {
            title: "Средний чек",
            current: data.financial.averageCheck,
            icon: Receipt,
            change: 8,
            gradient: "from-amber-500 to-orange-500",
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
              whileHover={{ y: -4 }}
              className={`relative rounded-2xl p-5 overflow-hidden transition-all duration-300 ${
                isDark
                  ? "bg-white/[0.07] border border-white/[0.1] backdrop-blur-xl shadow-lg"
                  : "bg-white border border-gray-200/70 shadow-sm hover:shadow-md"
              }`}
            >
              <div
                className={`absolute -top-4 -right-4 w-20 h-20 rounded-full bg-gradient-to-br ${metric.gradient} opacity-${isDark ? "15" : "8"} blur-xl`}
              />

              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <Icon className={`w-4 h-4 ${isDark ? "text-white/50" : "text-gray-400"}`} />
                  <span className={`text-sm ${isDark ? "text-white/60" : "text-gray-600"}`}>
                    {metric.title}
                  </span>
                </div>

                <div className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"} mb-3`}>
                  {metric.title === "Выручка" || metric.title === "Средний чек"
                    ? formatCurrency(metric.current)
                    : formatNumber(metric.current)}
                </div>

                <div
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold w-fit ${
                    isPositive
                      ? isDark ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-100 text-emerald-700"
                      : isDark ? "bg-rose-500/20 text-rose-400" : "bg-red-100 text-red-700"
                  }`}
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
        className={`rounded-2xl p-6 transition-all duration-300 ${glassCls}`}
      >
        <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"} mb-6`}>
          Сравнение мастеров по выручке
        </h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data.masters.topMasters}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke={isDark ? "#ffffff10" : "#E5E7EB"} 
            />
            <XAxis
              dataKey="masterName"
              stroke={isDark ? "#ffffff30" : "#9CA3AF"}
              tick={{ fill: isDark ? "#ffffff60" : "#6B7280" }}
              angle={-45}
              textAnchor="end"
              height={100}
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
      </motion.div>

      {/* Инсайты */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={`rounded-2xl p-6 transition-all duration-300 bg-gradient-to-br from-emerald-500/10 via-green-500/10 to-emerald-500/5 border ${
          isDark ? "border-emerald-500/20" : "border-emerald-200"
        }`}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
            Ключевые инсайты
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-4 rounded-xl ${isDark ? "bg-white/[0.04] border border-white/[0.05]" : "bg-white border border-gray-200/50"}`}>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span className={`font-semibold ${isDark ? "text-emerald-400" : "text-emerald-700"}`}>
                Лучший мастер
              </span>
            </div>
            <p className={`text-sm ${isDark ? "text-white/60" : "text-gray-700"}`}>
              {data.masters.topMasters[0]?.masterName || "Нет данных"} показывает
              максимальную выручку
            </p>
          </div>

          <div className={`p-4 rounded-xl ${isDark ? "bg-white/[0.04] border border-white/[0.05]" : "bg-white border border-gray-200/50"}`}>
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-5 h-5 text-cyan-500" />
              <span className={`font-semibold ${isDark ? "text-cyan-400" : "text-cyan-700"}`}>
                Популярная услуга
              </span>
            </div>
            <p className={`text-sm ${isDark ? "text-white/60" : "text-gray-700"}`}>
              {data.services.popularServices[0]?.serviceName || "Нет данных"}{" "}
              пользуется наибольшим спросом
            </p>
          </div>

          <div className={`p-4 rounded-xl ${isDark ? "bg-white/[0.04] border border-white/[0.05]" : "bg-white border border-gray-200/50"}`}>
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-violet-500" />
              <span className={`font-semibold ${isDark ? "text-violet-400" : "text-violet-700"}`}>
                Конверсия
              </span>
            </div>
            <p className={`text-sm ${isDark ? "text-white/60" : "text-gray-700"}`}>
              Уровень конверсии составляет{" "}
              {data.appointments.conversionRate.toFixed(1)}%
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}