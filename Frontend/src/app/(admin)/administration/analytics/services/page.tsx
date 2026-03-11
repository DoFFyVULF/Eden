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
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "overview" | "popularity" | "profitability" | "matrix"
  >("overview");

  const { formatCurrency, formatPercent, formatNumber, getPeriodDisplayName } =
    useAnalytics();

  useEffect(() => {
    loadServicesData();
  }, [selectedPeriod]);

  const loadServicesData = async () => {
    setIsLoading(true);
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

  const tabs = [
    { id: "overview", label: "Обзор", icon: BarChart3 },
    { id: "popularity", label: "Популярность", icon: Star },
    { id: "profitability", label: "Прибыльность", icon: DollarSign },
    { id: "matrix", label: "Матрица услуг", icon: Activity },
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
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50">
      {/* Декоративный фон */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-violet-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-pink-500/5 rounded-full blur-[80px]" />
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
                <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-500 rounded-lg">
                  <Package className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Аналитика услуг
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Популярность и прибыльность 📦
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
                        tab.id as "overview" | "popularity" | "profitability" | "matrix"
                      )
                    }
                    className={`
                      flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all
                      ${
                        activeTab === tab.id
                          ? "bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg shadow-violet-500/25"
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
                  className="pl-11 pr-10 py-3 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium appearance-none cursor-pointer transition-all shadow-sm disabled:opacity-50 focus:ring-2 focus:ring-violet-500/50 focus:outline-none focus:border-violet-500"
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
                onClick={loadServicesData}
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
                className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-xl font-semibold shadow-lg shadow-violet-500/25 transition-all disabled:opacity-50"
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
              {activeTab === "popularity" && (
                <PopularityTab data={analyticsData} isLoading={isLoading} />
              )}
              {activeTab === "profitability" && (
                <ProfitabilityTab data={analyticsData} isLoading={isLoading} />
              )}
              {activeTab === "matrix" && (
                <MatrixTab data={analyticsData} isLoading={isLoading} />
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
  const { formatCurrency, formatNumber } = useAnalytics();

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
      bgColor: "bg-violet-50",
      textColor: "text-violet-600",
      description: "В каталоге",
    },
    {
      title: "Топ услуга",
      value: data.services.popularServices[0]?.serviceName || "Нет данных",
      change: 0,
      icon: Award,
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
      description: "Самая популярная",
      isText: true,
    },
    {
      title: "Средняя цена",
      value: formatCurrency(averagePrice),
      change: 8,
      icon: Tag,
      bgColor: "bg-pink-50",
      textColor: "text-pink-600",
      description: "Стоимость услуг",
    },
    {
      title: "Записей на услугу",
      value: formatNumber(Math.round(averageAppointmentsPerService)),
      change: 12,
      icon: Calendar,
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
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
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className="group relative overflow-hidden"
            >
              <div className="relative p-6 bg-white border border-gray-200 rounded-2xl hover:border-gray-300 hover:shadow-lg transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 ${stat.bgColor} rounded-xl`}>
                    <Icon className={`w-6 h-6 ${stat.textColor}`} />
                  </div>
                  {stat.change !== 0 && !stat.isText && (
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
                  )}
                </div>
                <div className={`${stat.isText ? "text-xl" : "text-3xl"} font-bold text-gray-900 mb-1 ${stat.isText ? "line-clamp-2" : ""}`}>
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

      {/* Топ услуги */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative overflow-hidden rounded-2xl"
      >
        <div className="relative p-6 bg-white border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-violet-100 rounded-lg">
              <Star className="w-5 h-5 text-violet-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">
              Топ услуги по популярности и выручке
            </h3>
          </div>

          <div className="space-y-3">
            {data.services.popularServices.map((service, index) => {
              const revenuePercentage =
                (service.totalRevenue / data.financial.totalRevenue) * 100;

              return (
                <div
                  key={service.serviceId}
                  className="group p-5 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-xl transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex items-center justify-center w-10 h-10 bg-gradient-to-br rounded-xl text-sm font-bold text-white ${
                          index === 0
                            ? "from-violet-500 to-purple-500"
                            : index === 1
                              ? "from-purple-400 to-pink-400"
                              : index === 2
                                ? "from-pink-400 to-rose-400"
                                : "from-gray-300 to-gray-400"
                        }`}
                      >
                        {index === 0 ? <Star className="w-5 h-5" /> : index + 1}
                      </div>
                      <div>
                        <div className="font-semibold text-lg text-gray-900">
                          {service.serviceName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {service.appointmentsCount} записей • Средняя цена:{" "}
                          {formatCurrency(service.averagePrice)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-xl text-gray-900">
                        {formatCurrency(service.totalRevenue)}
                      </div>
                      <div className="text-sm text-violet-600 font-semibold">
                        {revenuePercentage.toFixed(1)}% от выручки
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div className="p-3 bg-white rounded-lg border border-gray-200">
                      <div className="text-xs text-gray-500 mb-1">
                        Популярность
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-amber-500" />
                        <span className="font-semibold text-gray-900">
                          {service.appointmentsCount} записей
                        </span>
                      </div>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-gray-200">
                      <div className="text-xs text-gray-500 mb-1">
                        Прибыльность
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-emerald-500" />
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(service.totalRevenue)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${revenuePercentage}%` }}
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

      {/* Распределение услуг */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="relative overflow-hidden rounded-2xl"
        >
          <div className="relative p-6 bg-white border border-gray-200 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              Распределение по выручке
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={data.services.popularServices}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => {
                    const dataItem =
                      data.services.popularServices[entry.index];
                    return dataItem.serviceName.length > 15
                      ? dataItem.serviceName.substring(0, 12) + "..."
                      : dataItem.serviceName;
                  }}
                  outerRadius={100}
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
                    backgroundColor: "white",
                    border: "1px solid #E5E7EB",
                    borderRadius: "12px",
                    padding: "12px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                  formatter={(value: any) => [formatCurrency(value), "Выручка"]}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="relative overflow-hidden rounded-2xl"
        >
          <div className="relative p-6 bg-white border border-gray-200 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              Ключевые показатели
            </h3>

            <div className="space-y-4">
              <div className="p-4 bg-violet-50 rounded-xl border border-violet-200">
                <div className="flex items-center gap-2 mb-2">
                  <ShoppingBag className="w-5 h-5 text-violet-600" />
                  <span className="text-sm font-medium text-violet-900">
                    Общая выручка от услуг
                  </span>
                </div>
                <div className="text-2xl font-bold text-violet-900">
                  {formatCurrency(data.financial.totalRevenue)}
                </div>
              </div>

              <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium text-purple-900">
                    Всего записей
                  </span>
                </div>
                <div className="text-2xl font-bold text-purple-900">
                  {formatNumber(totalAppointments)}
                </div>
              </div>

              <div className="p-4 bg-pink-50 rounded-xl border border-pink-200">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-pink-600" />
                  <span className="text-sm font-medium text-pink-900">
                    Средний чек
                  </span>
                </div>
                <div className="text-2xl font-bold text-pink-900">
                  {formatCurrency(data.financial.averageCheck)}
                </div>
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
  isLoading,
}: {
  data: KeyMetricsResponse;
  isLoading: boolean;
}) {
  const { formatNumber } = useAnalytics();

  return (
    <div className="space-y-6">
      {/* График популярности */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl"
      >
        <div className="relative p-6 bg-white border border-gray-200 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            Популярность услуг по количеству записей
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data.services.popularServices}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="serviceName"
                stroke="#9CA3AF"
                tick={{ fill: "#6B7280" }}
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis stroke="#9CA3AF" tick={{ fill: "#6B7280" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #E5E7EB",
                  borderRadius: "12px",
                  padding: "12px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
                formatter={(value: any) => [value, "Записей"]}
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
        </div>
      </motion.div>

      {/* Рейтинг популярности */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative overflow-hidden rounded-2xl"
      >
        <div className="relative p-6 bg-white border border-gray-200 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            Рейтинг по популярности
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.services.popularServices.map((service, index) => {
              const totalAppointments = data.services.popularServices.reduce(
                (sum, s) => sum + s.appointmentsCount,
                0
              );
              const percentage =
                (service.appointmentsCount / totalAppointments) * 100;

              return (
                <div
                  key={service.serviceId}
                  className="p-5 bg-gray-50 rounded-xl border border-gray-200"
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
                      <h4 className="font-semibold text-gray-900 line-clamp-1">
                        {service.serviceName}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {percentage.toFixed(1)}% от всех записей
                      </p>
                    </div>
                  </div>

                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {formatNumber(service.appointmentsCount)}
                  </div>
                  <div className="text-sm text-gray-600 mb-3">записей</div>

                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
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
    </div>
  );
}

// ===== ВКЛАДКА "ПРИБЫЛЬНОСТЬ" =====
function ProfitabilityTab({
  data,
  isLoading,
}: {
  data: KeyMetricsResponse;
  isLoading: boolean;
}) {
  const { formatCurrency } = useAnalytics();

  return (
    <div className="space-y-6">
      {/* График прибыльности */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl"
      >
        <div className="relative p-6 bg-white border border-gray-200 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            Прибыльность услуг по выручке
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data.services.popularServices} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                type="number"
                stroke="#9CA3AF"
                tick={{ fill: "#6B7280" }}
                tickFormatter={(value) => `₽${(value / 1000).toFixed(0)}к`}
              />
              <YAxis
                type="category"
                dataKey="serviceName"
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
        </div>
      </motion.div>

      {/* Таблица прибыльности */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative overflow-hidden rounded-2xl"
      >
        <div className="relative p-6 bg-white border border-gray-200 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            Детальный анализ прибыльности
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
                    Записей
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">
                    Средняя цена
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">
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
                      <td className="py-4 px-4 text-right">
                        <span className="px-3 py-1 bg-violet-100 text-violet-700 rounded-lg text-sm font-semibold">
                          {percentage.toFixed(1)}%
                        </span>
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

// ===== ВКЛАДКА "МАТРИЦА УСЛУГ" =====
function MatrixTab({
  data,
  isLoading,
}: {
  data: KeyMetricsResponse;
  isLoading: boolean;
}) {
  const { formatCurrency, formatNumber } = useAnalytics();

  // Подготовка данных для scatter chart (матрица популярности и прибыльности)
  const scatterData = data.services.popularServices.map((service) => ({
    name: service.serviceName,
    popularity: service.appointmentsCount,
    revenue: service.totalRevenue,
    avgPrice: service.averagePrice,
  }));

  return (
    <div className="space-y-6">
      {/* Scatter chart - матрица */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl"
      >
        <div className="relative p-6 bg-white border border-gray-200 shadow-sm">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Матрица популярности и прибыльности
            </h3>
            <p className="text-sm text-gray-600">
              Правый верхний квадрант - наиболее эффективные услуги
            </p>
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart
              margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                type="number"
                dataKey="popularity"
                name="Популярность"
                stroke="#9CA3AF"
                tick={{ fill: "#6B7280" }}
                label={{
                  value: "Количество записей",
                  position: "insideBottom",
                  offset: -10,
                  fill: "#6B7280",
                }}
              />
              <YAxis
                type="number"
                dataKey="revenue"
                name="Выручка"
                stroke="#9CA3AF"
                tick={{ fill: "#6B7280" }}
                tickFormatter={(value) => `₽${(value / 1000).toFixed(0)}к`}
                label={{
                  value: "Выручка",
                  angle: -90,
                  position: "insideLeft",
                  fill: "#6B7280",
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
                  backgroundColor: "white",
                  border: "1px solid #E5E7EB",
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
        </div>
      </motion.div>

      {/* Категоризация услуг */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative overflow-hidden rounded-2xl"
      >
        <div className="relative p-6 bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-violet-500 rounded-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">
              Категории услуг по эффективности
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Звёзды (высокая популярность + высокая выручка) */}
            <div className="p-5 bg-white rounded-xl border border-violet-200">
              <div className="flex items-center gap-2 mb-3">
                <Star className="w-5 h-5 text-amber-500" />
                <h4 className="font-semibold text-violet-900">Звёзды ⭐</h4>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Высокая популярность и выручка
              </p>
              <div className="space-y-2">
                {data.services.popularServices.slice(0, 2).map((service) => (
                  <div
                    key={service.serviceId}
                    className="text-sm font-medium text-gray-900"
                  >
                    • {service.serviceName}
                  </div>
                ))}
              </div>
            </div>

            {/* Рабочие лошадки */}
            <div className="p-5 bg-white rounded-xl border border-blue-200">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="w-5 h-5 text-blue-500" />
                <h4 className="font-semibold text-blue-900">
                  Рабочие лошадки 💪
                </h4>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Стабильный спрос и доход
              </p>
              <div className="space-y-2">
                {data.services.popularServices.slice(2, 4).map((service) => (
                  <div
                    key={service.serviceId}
                    className="text-sm font-medium text-gray-900"
                  >
                    • {service.serviceName}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-white rounded-xl border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-5 h-5 text-gray-600" />
              <h4 className="font-semibold text-gray-900">Рекомендации</h4>
            </div>
            <p className="text-sm text-gray-700">
              Инвестируйте в продвижение "звёзд" и оптимизируйте ценообразование
              для остальных услуг
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}