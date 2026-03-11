"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Users,
  UserPlus,
  UserCheck,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Star,
  Award,
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
  Heart,
  Repeat,
  Target,
  Clock,
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
  primary: ["#3B82F6", "#2563EB", "#1D4ED8", "#1E40AF", "#1E3A8A"],
  success: ["#10B981", "#059669", "#047857"],
  warning: ["#F59E0B", "#D97706", "#B45309"],
  purple: ["#8B5CF6", "#7C3AED", "#6D28D9"],
  cyan: ["#06B6D4", "#0891B2", "#0E7490"],
};

export default function ClientAnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>(
    TimePeriod.MONTH
  );
  const [analyticsData, setAnalyticsData] = useState<KeyMetricsResponse | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "overview" | "growth" | "retention" | "segmentation"
  >("overview");

  const { formatCurrency, formatPercent, formatNumber, getPeriodDisplayName } =
    useAnalytics();

  useEffect(() => {
    loadClientData();
  }, [selectedPeriod]);

  const loadClientData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await analyticsService.getKeyMetrics({
        period: selectedPeriod,
      });
      setAnalyticsData(data);
    } catch (err) {
      setError("Не удалось загрузить данные клиентов");
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
      a.download = `clients-report-${new Date().toISOString().split("T")[0]}.pdf`;
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
    { id: "growth", label: "Рост базы", icon: Growth },
    { id: "retention", label: "Удержание", icon: Heart },
    { id: "segmentation", label: "Сегментация", icon: PieChartIcon },
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Декоративный фон */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[80px]" />
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
                  <Users className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Клиентская аналитика
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-purple-600 bg-clip-text text-transparent">
                Анализ клиентской базы 👥
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
                        tab.id as "overview" | "growth" | "retention" | "segmentation"
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
                onClick={loadClientData}
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
              {activeTab === "growth" && (
                <GrowthTab data={analyticsData} isLoading={isLoading} />
              )}
              {activeTab === "retention" && (
                <RetentionTab data={analyticsData} isLoading={isLoading} />
              )}
              {activeTab === "segmentation" && (
                <SegmentationTab data={analyticsData} isLoading={isLoading} />
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
  const { formatPercent, formatNumber, getPeriodDisplayName } = useAnalytics();

  const stats = [
    {
      title: "Всего клиентов",
      value: formatNumber(data.clients.totalClients),
      change: 15,
      icon: Users,
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
      description: "База клиентов",
    },
    {
      title: "Новые клиенты",
      value: formatNumber(data.clients.newClients),
      change: 22,
      icon: UserPlus,
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-600",
      description: "За период",
    },
    {
      title: "Повторные клиенты",
      value: formatNumber(data.clients.returningClients),
      change: 8,
      icon: Repeat,
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
      description: "Вернулись повторно",
    },
    {
      title: "Уровень удержания",
      value: formatPercent(data.clients.retentionRate),
      change: 5,
      icon: Heart,
      bgColor: "bg-rose-50",
      textColor: "text-rose-600",
      description: "Retention rate",
    },
  ];

  // Данные для круговой диаграммы
  const clientTypeData = [
    { name: "Новые", value: data.clients.newClients, color: "#10B981" },
    {
      name: "Повторные",
      value: data.clients.returningClients,
      color: "#8B5CF6",
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

      {/* График роста клиентской базы */}
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
                Рост клиентской базы
              </h3>
              <p className="text-sm text-gray-500">
                Количество клиентов по месяцам
              </p>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={data.clients.clientsByMonth}>
              <defs>
                <linearGradient id="clientsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
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
                itemStyle={{ color: "#3B82F6", fontWeight: 600 }}
                formatter={(value: any) => [value, "Клиентов"]}
              />
              <Area
                type="monotone"
                dataKey="clients"
                stroke="#3B82F6"
                strokeWidth={3}
                fill="url(#clientsGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Двухколоночная секция */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Распределение клиентов */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="relative overflow-hidden rounded-2xl"
        >
          <div className="relative p-6 bg-white border border-gray-200 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              Распределение клиентов
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={clientTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => {
                    const dataItem = clientTypeData[entry.index];
                    const percent =
                      (dataItem.value / data.clients.totalClients) * 100;
                    return `${dataItem.name} ${percent.toFixed(0)}%`;
                  }}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {clientTypeData.map((entry, index) => (
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

            <div className="mt-4 space-y-2">
              {clientTypeData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-gray-700">{item.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {item.value} клиентов
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Статистика */}
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
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">
                    Конверсия в постоянных
                  </span>
                </div>
                <div className="text-2xl font-bold text-blue-900 mb-1">
                  {formatPercent(
                    data.clients.totalClients > 0
                      ? (data.clients.returningClients /
                          data.clients.totalClients) *
                          100
                      : 0
                  )}
                </div>
                <p className="text-xs text-blue-700">
                  {data.clients.returningClients} из {data.clients.totalClients}{" "}
                  клиентов вернулись
                </p>
              </div>

              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-5 h-5 text-emerald-600" />
                  <span className="text-sm font-medium text-emerald-900">
                    Активность новых клиентов
                  </span>
                </div>
                <div className="text-2xl font-bold text-emerald-900 mb-1">
                  {data.clients.newClients}
                </div>
                <p className="text-xs text-emerald-700">
                  За {getPeriodDisplayName(data.period).toLowerCase()}
                </p>
              </div>

              <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium text-purple-900">
                    Лояльность клиентов
                  </span>
                </div>
                <div className="text-2xl font-bold text-purple-900 mb-1">
                  {formatPercent(data.clients.retentionRate)}
                </div>
                <p className="text-xs text-purple-700">
                  Retention rate за период
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ===== ВКЛАДКА "РОСТ БАЗЫ" =====
function GrowthTab({
  data,
  isLoading,
}: {
  data: KeyMetricsResponse;
  isLoading: boolean;
}) {
  const { formatNumber } = useAnalytics();

  return (
    <div className="space-y-6">
      {/* График роста */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl"
      >
        <div className="relative p-6 bg-white border border-gray-200 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            Динамика роста клиентской базы
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={data.clients.clientsByMonth}>
              <defs>
                <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.1} />
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
                dataKey="clients"
                stroke="#3B82F6"
                strokeWidth={2}
                fill="url(#growthGradient)"
                name="Клиентов"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Статистика прироста */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 bg-white border border-gray-200 rounded-xl"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <h4 className="font-semibold text-gray-900">Всего клиентов</h4>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {formatNumber(data.clients.totalClients)}
          </div>
          <p className="text-sm text-gray-600">Общая база клиентов</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 bg-white border border-gray-200 rounded-xl"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <UserPlus className="w-5 h-5 text-emerald-600" />
            </div>
            <h4 className="font-semibold text-gray-900">Новых клиентов</h4>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            +{formatNumber(data.clients.newClients)}
          </div>
          <p className="text-sm text-gray-600">Прирост за период</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 bg-white border border-gray-200 rounded-xl"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Activity className="w-5 h-5 text-purple-600" />
            </div>
            <h4 className="font-semibold text-gray-900">Темп роста</h4>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {data.clients.totalClients > 0
              ? ((data.clients.newClients / data.clients.totalClients) * 100).toFixed(
                  1
                )
              : 0}
            %
          </div>
          <p className="text-sm text-gray-600">За выбранный период</p>
        </motion.div>
      </div>
    </div>
  );
}

// ===== ВКЛАДКА "УДЕРЖАНИЕ" =====
function RetentionTab({
  data,
  isLoading,
}: {
  data: KeyMetricsResponse;
  isLoading: boolean;
}) {
  const { formatPercent, formatNumber } = useAnalytics();

  return (
    <div className="space-y-6">
      {/* Ключевые метрики удержания */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="p-6 bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-200 rounded-2xl"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-rose-500 rounded-xl">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Уровень удержания
              </h3>
              <p className="text-sm text-gray-600">Retention Rate</p>
            </div>
          </div>
          <div className="text-5xl font-bold text-rose-600 mb-2">
            {formatPercent(data.clients.retentionRate)}
          </div>
          <p className="text-sm text-gray-700">
            {data.clients.returningClients} клиентов вернулись повторно
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-2xl"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-purple-500 rounded-xl">
              <Repeat className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Повторные клиенты
              </h3>
              <p className="text-sm text-gray-600">Вернулись за период</p>
            </div>
          </div>
          <div className="text-5xl font-bold text-purple-600 mb-2">
            {formatNumber(data.clients.returningClients)}
          </div>
          <p className="text-sm text-gray-700">
            Из {data.clients.totalClients} общих клиентов
          </p>
        </motion.div>
      </div>

      {/* Дополнительная статистика */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="p-6 bg-white border border-gray-200 rounded-2xl"
      >
        <h3 className="text-xl font-bold text-gray-900 mb-6">
          Анализ лояльности
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-900">
                Активные клиенты
              </span>
            </div>
            <div className="text-2xl font-bold text-emerald-900">
              {formatNumber(data.clients.totalClients)}
            </div>
          </div>

          <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <UserCheck className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">
                Новые за период
              </span>
            </div>
            <div className="text-2xl font-bold text-blue-900">
              {formatNumber(data.clients.newClients)}
            </div>
          </div>

          <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-900">
                Лояльные клиенты
              </span>
            </div>
            <div className="text-2xl font-bold text-purple-900">
              {formatNumber(data.clients.returningClients)}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ===== ВКЛАДКА "СЕГМЕНТАЦИЯ" =====
function SegmentationTab({
  data,
  isLoading,
}: {
  data: KeyMetricsResponse;
  isLoading: boolean;
}) {
  const { formatNumber, formatPercent } = useAnalytics();

  const segmentData = [
    {
      name: "Новые клиенты",
      value: data.clients.newClients,
      percentage:
        (data.clients.newClients / data.clients.totalClients) * 100,
      color: "#10B981",
      icon: UserPlus,
    },
    {
      name: "Повторные клиенты",
      value: data.clients.returningClients,
      percentage:
        (data.clients.returningClients / data.clients.totalClients) * 100,
      color: "#8B5CF6",
      icon: Repeat,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Сегментация клиентов */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 bg-white border border-gray-200 rounded-2xl"
      >
        <h3 className="text-xl font-bold text-gray-900 mb-6">
          Сегментация клиентской базы
        </h3>

        <div className="space-y-4">
          {segmentData.map((segment, index) => {
            const Icon = segment.icon;
            return (
              <div
                key={index}
                className="p-5 bg-gray-50 rounded-xl border border-gray-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="p-2 rounded-lg"
                      style={{ backgroundColor: `${segment.color}20` }}
                    >
                      <Icon
                        className="w-5 h-5"
                        style={{ color: segment.color }}
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {segment.name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {formatPercent(segment.percentage)} от общей базы
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      {formatNumber(segment.value)}
                    </div>
                    <div className="text-sm text-gray-600">клиентов</div>
                  </div>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${segment.percentage}%` }}
                    transition={{ duration: 1, delay: index * 0.2 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: segment.color }}
                  />
                </div>
              </div>
            );
          })}
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
            <Info className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">
            Рекомендации по работе с клиентами
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-white rounded-xl border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-blue-600" />
              <h4 className="font-semibold text-blue-900">Новые клиенты</h4>
            </div>
            <p className="text-sm text-gray-700">
              Сфокусируйтесь на адаптации новых клиентов и создании позитивного
              первого впечатления
            </p>
          </div>

          <div className="p-4 bg-white rounded-xl border border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-5 h-5 text-purple-600" />
              <h4 className="font-semibold text-purple-900">
                Повторные клиенты
              </h4>
            </div>
            <p className="text-sm text-gray-700">
              Внедрите программу лояльности для увеличения частоты визитов
              постоянных клиентов
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}