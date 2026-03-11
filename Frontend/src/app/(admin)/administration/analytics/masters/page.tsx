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
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "overview" | "performance" | "comparison" | "workload"
  >("overview");

  const { formatCurrency, formatPercent, formatNumber, getPeriodDisplayName } =
    useAnalytics();

  useEffect(() => {
    loadMastersData();
  }, [selectedPeriod]);

  const loadMastersData = async () => {
    setIsLoading(true);
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

  const tabs = [
    { id: "overview", label: "Обзор", icon: BarChart3 },
    { id: "performance", label: "Эффективность", icon: Award },
    { id: "comparison", label: "Сравнение", icon: Activity },
    { id: "workload", label: "Загрузка", icon: Percent },
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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
      {/* Декоративный фон */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-red-500/5 rounded-full blur-[80px]" />
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
                <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg">
                  <UserCheck className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Аналитика мастеров
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
                Эффективность и производительность 👨‍💼
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
                        tab.id as "overview" | "performance" | "comparison" | "workload"
                      )
                    }
                    className={`
                      flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all
                      ${
                        activeTab === tab.id
                          ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25"
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
                  className="pl-11 pr-10 py-3 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium appearance-none cursor-pointer transition-all shadow-sm disabled:opacity-50 focus:ring-2 focus:ring-amber-500/50 focus:outline-none focus:border-amber-500"
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
                onClick={loadMastersData}
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
                className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-xl font-semibold shadow-lg shadow-amber-500/25 transition-all disabled:opacity-50"
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
              {activeTab === "performance" && (
                <PerformanceTab data={analyticsData} isLoading={isLoading} />
              )}
              {activeTab === "comparison" && (
                <ComparisonTab data={analyticsData} isLoading={isLoading} />
              )}
              {activeTab === "workload" && (
                <WorkloadTab data={analyticsData} isLoading={isLoading} />
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
      bgColor: "bg-amber-50",
      textColor: "text-amber-600",
      description: "Активных мастеров",
    },
    {
      title: "Средняя загрузка",
      value: formatPercent(data.masters.averageLoad),
      change: 5,
      icon: Activity,
      bgColor: "bg-orange-50",
      textColor: "text-orange-600",
      description: "Уровень загрузки",
    },
    {
      title: "Записей на мастера",
      value: formatNumber(Math.round(averageAppointmentsPerMaster)),
      change: 15,
      icon: Calendar,
      bgColor: "bg-red-50",
      textColor: "text-red-600",
      description: "Среднее количество",
    },
    {
      title: "Общая выручка",
      value: formatCurrency(data.financial.totalRevenue),
      change: 12,
      icon: DollarSign,
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-600",
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
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className="group relative overflow-hidden"
            >
              <div className="relative p-6 bg-white border border-gray-200 rounded-2xl hover:border-gray-300 hover:shadow-lg transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 ${stat.bgColor} rounded-xl`}>
                    <Icon className={`w-6 h-6 ${stat.textColor}`} />
                  </div>
                  {stat.change !== 0 && (
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

      {/* Лучший мастер */}
      {data.masters.topMasters.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl text-white"
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
        className="relative overflow-hidden rounded-2xl"
      >
        <div className="relative p-6 bg-white border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Award className="w-5 h-5 text-amber-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">
              Рейтинг мастеров по выручке
            </h3>
          </div>

          <div className="space-y-3">
            {data.masters.topMasters.map((master, index) => {
              const percentage =
                (master.totalRevenue / data.financial.totalRevenue) * 100;
              return (
                <div
                  key={master.masterId}
                  className="group p-5 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-xl transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex items-center justify-center w-10 h-10 bg-gradient-to-br rounded-xl text-sm font-bold text-white ${
                          index === 0
                            ? "from-amber-500 to-orange-500"
                            : index === 1
                              ? "from-gray-400 to-gray-500"
                              : index === 2
                                ? "from-orange-400 to-red-400"
                                : "from-gray-300 to-gray-400"
                        }`}
                      >
                        {index === 0 ? (
                          <Crown className="w-5 h-5" />
                        ) : (
                          index + 1
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-lg text-gray-900">
                          {master.masterName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {master.appointmentsCount} записей
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-xl text-gray-900">
                        {formatCurrency(master.totalRevenue)}
                      </div>
                      <div className="text-sm text-amber-600 font-semibold">
                        {percentage.toFixed(1)}% от общей выручки
                      </div>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                      className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
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

// ===== ВКЛАДКА "ЭФФЕКТИВНОСТЬ" =====
function PerformanceTab({
  data,
  isLoading,
}: {
  data: KeyMetricsResponse;
  isLoading: boolean;
}) {
  const { formatCurrency, formatNumber } = useAnalytics();

  return (
    <div className="space-y-6">
      {/* График выручки по мастерам */}
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
                    fill={COLORS.primary[index % COLORS.primary.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
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
              className="p-6 bg-white border border-gray-200 rounded-xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl text-white font-bold">
                  {index + 1}
                </div>
                <div>
                  <h4 className="font-bold text-lg text-gray-900">
                    {master.masterName}
                  </h4>
                  <p className="text-sm text-gray-500">
                    Показатели эффективности
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm text-gray-700">Выручка</span>
                  </div>
                  <span className="font-bold text-gray-900">
                    {formatCurrency(master.totalRevenue)}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-gray-700">Записей</span>
                  </div>
                  <span className="font-bold text-gray-900">
                    {formatNumber(master.appointmentsCount)}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-amber-600" />
                    <span className="text-sm text-gray-700">Средний чек</span>
                  </div>
                  <span className="font-bold text-gray-900">
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
  isLoading,
}: {
  data: KeyMetricsResponse;
  isLoading: boolean;
}) {
  const { formatCurrency, formatNumber } = useAnalytics();

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
        className="relative overflow-hidden rounded-2xl"
      >
        <div className="relative p-6 bg-white border border-gray-200 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            Сравнительный анализ мастеров
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#E5E7EB" />
              <PolarAngleAxis
                dataKey="master"
                stroke="#6B7280"
                tick={{ fill: "#6B7280" }}
              />
              <PolarRadiusAxis stroke="#9CA3AF" tick={{ fill: "#6B7280" }} />
              <Radar
                name="Выручка (тыс. ₽)"
                dataKey="revenue"
                stroke="#F59E0B"
                fill="#F59E0B"
                fillOpacity={0.6}
              />
              <Radar
                name="Записей"
                dataKey="appointments"
                stroke="#EF4444"
                fill="#EF4444"
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

      {/* Сравнительная таблица */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative overflow-hidden rounded-2xl"
      >
        <div className="relative p-6 bg-white border border-gray-200 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            Детальное сравнение
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                    Место
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                    Мастер
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">
                    Выручка
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">
                    Записей
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">
                    Средний чек
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">
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
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
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
                      <td className="py-4 px-4 font-medium text-gray-900">
                        {master.masterName}
                      </td>
                      <td className="py-4 px-4 text-right font-semibold text-gray-900">
                        {formatCurrency(master.totalRevenue)}
                      </td>
                      <td className="py-4 px-4 text-right text-gray-600">
                        {formatNumber(master.appointmentsCount)}
                      </td>
                      <td className="py-4 px-4 text-right text-gray-600">
                        {formatCurrency(averageCheck)}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-lg text-sm font-semibold">
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

// ===== ВКЛАДКА "ЗАГРУЗКА" =====
function WorkloadTab({
  data,
  isLoading,
}: {
  data: KeyMetricsResponse;
  isLoading: boolean;
}) {
  const { formatPercent, formatNumber } = useAnalytics();

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
        className="p-8 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl"
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="p-4 bg-amber-500 rounded-xl">
            <Activity className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              Средняя загрузка мастеров
            </h2>
            <p className="text-gray-600">Общий уровень занятости</p>
          </div>
        </div>
        <div className="text-6xl font-bold text-amber-600 mb-4">
          {formatPercent(data.masters.averageLoad)}
        </div>
        <p className="text-lg text-gray-700">
          В среднем {formatNumber(Math.round(averageAppointmentsPerMaster))}{" "}
          записей на мастера
        </p>

        <div className="mt-6 h-4 bg-gray-200 rounded-full overflow-hidden">
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
        className="relative overflow-hidden rounded-2xl"
      >
        <div className="relative p-6 bg-white border border-gray-200 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
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
                  className="p-5 bg-gray-50 rounded-xl border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-lg text-gray-900">
                        {master.masterName}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {master.appointmentsCount} записей
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        {formatPercent(Math.min(workload, 100))}
                      </div>
                      <div className="text-sm text-gray-500">загрузка</div>
                    </div>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
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
        </div>
      </motion.div>

      {/* Рекомендации */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-500 rounded-lg">
            <Info className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">
            Рекомендации по оптимизации
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-white rounded-xl border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-blue-600" />
              <h4 className="font-semibold text-blue-900">
                Перегруженные мастера
              </h4>
            </div>
            <p className="text-sm text-gray-700">
              Распределите нагрузку равномернее между всеми мастерами
            </p>
          </div>

          <div className="p-4 bg-white rounded-xl border border-cyan-200">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-cyan-600" />
              <h4 className="font-semibold text-cyan-900">
                Недозагруженные мастера
              </h4>
            </div>
            <p className="text-sm text-gray-700">
              Увеличьте видимость мастеров с низкой загрузкой
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}