"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
  Clock,
  TrendingDown,
  PieChart,
  Target,
  Award,
  CalendarDays,
  LineChart,
  Download,
  Filter,
  RefreshCw,
  ChevronRight,
  Sparkles,
  Zap,
  Activity,
  UserCheck,
  Receipt,
  Wallet,
  Repeat,
  CheckCircle,
  XCircle,
  Clock4,
  AlertCircle,
  BarChart,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
  Award as Quality,
  Users as Clients,
  Calendar as Appointments,
  Package,
  TrendingUp as Growth,
  ChartBar,
} from "lucide-react";
import { analyticsService } from "@/services/analytics/analytics.service";
import { useAnalytics } from "@/hooks/useAnalytics";
import { TimePeriod, KeyMetricsResponse } from "@/types/analytics.types";
import { ADMIN_ROUTES } from "@/app/lib/admin.routes";

// Карточки аналитики (конфигурация)
const analyticsCardsConfig = [
  {
    id: 1,
    title: "Общая финансовая аналитика",
    description: "Полный анализ доходов и выручки",
    icon: <DollarSign className="w-8 h-8" />,
    href: ADMIN_ROUTES.ANALYTICS.FINANCIAL,
    color: "from-emerald-500 to-green-500",
    category: "Финансы",
  },
  {
    id: 2,
    title: "Клиентская аналитика",
    description: "Анализ клиентской базы и лояльности",
    icon: <Clients className="w-8 h-8" />,
    href: ADMIN_ROUTES.ANALYTICS.CLIENTS,
    color: "from-blue-500 to-cyan-500",
    category: "Клиенты",
  },
  {
    id: 3,
    title: "Аналитика записей",
    description: "Статистика и эффективность записей",
    icon: <Appointments className="w-8 h-8" />,
    href: ADMIN_ROUTES.ANALYTICS.APPOINTMENTS,
    color: "from-purple-500 to-pink-500",
    category: "Записи",
  },
  {
    id: 4,
    title: "Аналитика мастеров",
    description: "Эффективность и производительность мастеров",
    icon: <UserCheck className="w-8 h-8" />,
    href: ADMIN_ROUTES.ANALYTICS.MASTERS,
    color: "from-amber-500 to-orange-500",
    category: "Мастера",
  },
  {
    id: 5,
    title: "Аналитика услуг",
    description: "Популярность и прибыльность услуг",
    icon: <Package className="w-8 h-8" />,
    href: ADMIN_ROUTES.ANALYTICS.SERVICES,
    color: "from-violet-500 to-indigo-500",
    category: "Услуги",
  },
  {
    id: 6,
    title: "Сравнительная аналитика",
    description: "Сравнение показателей и периодов",
    icon: <ChartBar className="w-8 h-8" />,
    href: ADMIN_ROUTES.ANALYTICS.COMPARSION,
    color: "from-rose-500 to-red-500",
    category: "Сравнение",
  },
];

const quickReports = [
  {
    title: "Отчет по выручке",
    description: "Детальный анализ доходов",
    type: "financial" as const,
    lastUpdated: "Сегодня, 10:30",
    link: "/admin/analytics/reports/revenue",
  },
  {
    title: "Топ мастера",
    description: "Лучшие по выручке и количеству записей",
    type: "masters" as const,
    lastUpdated: "Вчера, 14:45",
    link: "/admin/analytics/reports/top-masters",
  },
  {
    title: "Популярные услуги",
    description: "Анализ спроса на услуги",
    type: "services" as const,
    lastUpdated: "2 дня назад",
    link: "/admin/analytics/reports/popular-services",
  },
];

export default function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>(
    TimePeriod.MONTH,
  );
  const [analyticsData, setAnalyticsData] = useState<KeyMetricsResponse | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    fetchKeyMetrics,
    fetchDashboardSummary,
    formatCurrency,
    formatPercent,
    formatNumber,
    getPeriodDisplayName,
  } = useAnalytics();

  // Загрузка данных при изменении периода
  useEffect(() => {
    loadAnalyticsData();
  }, [selectedPeriod]);

  const loadAnalyticsData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchKeyMetrics({ period: selectedPeriod });
      setAnalyticsData(data);
    } catch (err) {
      setError("Не удалось загрузить данные аналитики");
      console.error("Ошибка загрузки аналитики:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePeriodChange = (period: TimePeriod) => {
    setSelectedPeriod(period);
  };

  const handleExportReport = async () => {
    try {
      const blob = await analyticsService.exportReport({
        period: selectedPeriod,
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `analytics-report-${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert("Ошибка при экспорте отчета");
      console.error("Ошибка экспорта:", err);
    }
  };

  const handleRefreshData = () => {
    loadAnalyticsData();
  };

  // Функция для создания карточек аналитики на основе данных
  const getAnalyticsCards = () => {
    if (!analyticsData)
      return analyticsCardsConfig.map((card) => ({
        ...card,
        stats: "Загрузка...",
        trend: "+0%",
        isTrendUp: true,
        subFeatures: [{ label: "Загрузка...", value: "..." }],
      }));

    const { financial, clients, appointments, masters, services } =
      analyticsData;

    return [
      {
        ...analyticsCardsConfig[0],
        stats: formatCurrency(financial.totalRevenue),
        trend: `${financial.revenueGrowth > 0 ? "+" : ""}${formatPercent(financial.revenueGrowth)}`,
        isTrendUp: financial.revenueGrowth >= 0,
        subFeatures: [
          { label: "Выручка", value: formatCurrency(financial.totalRevenue) },
          {
            label: "Месячный доход",
            value: formatCurrency(financial.monthlyIncome),
          },
          {
            label: "Прирост",
            value: `${financial.revenueGrowth > 0 ? "+" : ""}${formatPercent(financial.revenueGrowth)}`,
          },
          {
            label: "Средний чек",
            value: formatCurrency(financial.averageCheck),
          },
        ],
      },
      {
        ...analyticsCardsConfig[1],
        stats: `${formatNumber(clients.totalClients)} клиентов`,
        trend: `+${clients.newClients}`,
        isTrendUp: true,
        subFeatures: [
          { label: "Всего", value: formatNumber(clients.totalClients) },
          { label: "Новые", value: formatNumber(clients.newClients) },
          { label: "Повторные", value: formatNumber(clients.returningClients) },
          { label: "Удержание", value: formatPercent(clients.retentionRate) },
        ],
      },
      {
        ...analyticsCardsConfig[2],
        stats: `${formatNumber(appointments.totalAppointments)} записей`,
        trend: `+${formatPercent(appointments.conversionRate)}`,
        isTrendUp: appointments.conversionRate >= 50,
        subFeatures: [
          {
            label: "Всего",
            value: formatNumber(appointments.totalAppointments),
          },
          {
            label: "Подтверждено",
            value: formatNumber(appointments.confirmedAppointments),
          },
          {
            label: "Завершено",
            value: formatNumber(appointments.completedAppointments),
          },
          {
            label: "Отменено",
            value: formatNumber(appointments.cancelledAppointments),
          },
        ],
      },
      {
        ...analyticsCardsConfig[3],
        stats: `${formatNumber(masters.mastersCount)} мастеров`,
        trend: `+${formatPercent(masters.averageLoad)}`,
        isTrendUp: masters.averageLoad >= 70,
        subFeatures: [
          { label: "Мастеров", value: formatNumber(masters.mastersCount) },
          {
            label: "Средняя загрузка",
            value: formatPercent(masters.averageLoad),
          },
          {
            label: "Лучший мастер",
            value: masters.topMasters[0]?.masterName || "Нет данных",
          },
          {
            label: "Записей/мастер",
            value:
              masters.topMasters.length > 0
                ? formatNumber(
                    Math.round(
                      masters.topMasters.reduce(
                        (sum, m) => sum + m.appointmentsCount,
                        0,
                      ) / masters.topMasters.length,
                    ),
                  )
                : "0",
          },
        ],
      },
      {
        ...analyticsCardsConfig[4],
        stats: `${formatNumber(services.servicesCount)} услуг`,
        trend:
          services.popularServices.length > 0
            ? `+${formatNumber(services.popularServices[0].appointmentsCount)}`
            : "+0",
        isTrendUp: true,
        subFeatures: [
          { label: "Всего услуг", value: formatNumber(services.servicesCount) },
          {
            label: "Топ услуга",
            value: services.popularServices[0]?.serviceName || "Нет данных",
          },
          {
            label: "Средняя цена",
            value:
              services.popularServices.length > 0
                ? formatCurrency(
                    Math.round(
                      services.popularServices.reduce(
                        (sum, s) => sum + s.averagePrice,
                        0,
                      ) / services.popularServices.length,
                    ),
                  )
                : "₽ 0",
          },
          {
            label: "Записей/услуга",
            value:
              services.popularServices.length > 0
                ? formatNumber(
                    Math.round(
                      services.popularServices.reduce(
                        (sum, s) => sum + s.appointmentsCount,
                        0,
                      ) / services.popularServices.length,
                    ),
                  )
                : "0",
          },
        ],
      },
      {
        ...analyticsCardsConfig[5],
        stats: "Сравнение",
        trend: `+${formatPercent(financial.revenueGrowth)}`,
        isTrendUp: financial.revenueGrowth >= 0,
        subFeatures: [
          {
            label: "Месяц к месяцу",
            value: `${financial.revenueGrowth > 0 ? "+" : ""}${formatPercent(financial.revenueGrowth)}`,
          },
          {
            label: "Лучший мастер",
            value: masters.topMasters[0]?.masterName || "Нет данных",
          },
          {
            label: "Популярная услуга",
            value: services.popularServices[0]?.serviceName || "Нет данных",
          },
          {
            label: "Конверсия",
            value: formatPercent(appointments.conversionRate),
          },
        ],
      },
    ];
  };

  // Основные показатели для верхнего блока
  const getSummaryStats = () => {
    if (!analyticsData) {
      return [
        {
          title: "Общая выручка",
          value: "₽ 0",
          change: "+0%",
          isPositive: true,
          icon: <Wallet className="w-5 h-5" />,
          description: "Загрузка...",
        },
        {
          title: "Клиенты",
          value: "0",
          change: "+0%",
          isPositive: true,
          icon: <Users className="w-5 h-5" />,
          description: "0 новых",
        },
        {
          title: "Записи",
          value: "0",
          change: "+0%",
          isPositive: true,
          icon: <CalendarDays className="w-5 h-5" />,
          description: "0 завершено",
        },
      ];
    }

    const { financial, clients, appointments } = analyticsData;

    return [
      {
        title: "Общая выручка",
        value: formatCurrency(financial.totalRevenue),
        change: `${financial.revenueGrowth > 0 ? "+" : ""}${formatPercent(financial.revenueGrowth)}`,
        isPositive: financial.revenueGrowth >= 0,
        icon: <Wallet className="w-5 h-5" />,
        description: `За ${getPeriodDisplayName(selectedPeriod).toLowerCase()}`,
      },
      {
        title: "Клиенты",
        value: formatNumber(clients.totalClients),
        change: `+${clients.newClients}`,
        isPositive: clients.newClients > 0,
        icon: <Users className="w-5 h-5" />,
        description: `${formatNumber(clients.newClients)} новых`,
      },
      {
        title: "Записи",
        value: formatNumber(appointments.totalAppointments),
        change: `+${formatPercent(appointments.conversionRate)}`,
        isPositive: appointments.conversionRate >= 50,
        icon: <CalendarDays className="w-5 h-5" />,
        description: `${formatNumber(appointments.completedAppointments)} завершено`,
      },
    ];
  };

  const analyticsCards = getAnalyticsCards();
  const summaryStats = getSummaryStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100/50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Заголовок и фильтры */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div className="text-sm font-medium text-gray-600 uppercase tracking-wider">
                  Панель аналитики
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
                Бизнес аналитика 📈
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl">
                Ключевые метрики и показатели для принятия решений
              </p>
              {error && (
                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}
            </div>

            {/* Управление */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Выбор периода */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
                    <Calendar className="w-4 h-4 text-white" />
                  </div>
                  {/* 👇 Этот div теперь займёт всё оставшееся пространство */}
                  <div className="flex-1 min-w-0">
                    <select
                      value={selectedPeriod}
                      onChange={(e) =>
                        handlePeriodChange(e.target.value as TimePeriod)
                      }
                      disabled={isLoading}
                      className="w-full text-base font-bold text-gray-900 bg-transparent border-none focus:ring-0 cursor-pointer disabled:opacity-50"
                    >
                      <option value={TimePeriod.WEEK}>За неделю</option>
                      <option value={TimePeriod.MONTH}>За месяц</option>
                      <option value={TimePeriod.QUARTER}>За квартал</option>
                      <option value={TimePeriod.YEAR}>За год</option>
                      <option value={TimePeriod.CUSTOM}>
                        Произвольный период
                      </option>
                    </select>
                    <div className="text-sm text-gray-500">Период анализа</div>
                  </div>
                </div>
              </div>

              {/* Кнопки действий */}
              <div className="flex flex-wrap gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleExportReport}
                  disabled={isLoading}
                  className="flex not-lg:w-full items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="w-5 h-5" />
                  Экспорт
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleRefreshData}
                  disabled={isLoading}
                  className="flex not-lg:w-full items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-300 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw
                    className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`}
                  />
                  {isLoading ? "Загрузка..." : "Обновить"}
                </motion.button>
              </div>
            </div>
          </div>

          {/* Ключевые показатели */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
            {summaryStats.map((stat, index) => {
              const isLastOddItem = summaryStats.length === 3 && index === 2;

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -4 }}
                  className={`
                    bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-gray-200/50 
                    shadow-sm hover:shadow-lg transition-all duration-300
                    ${isLastOddItem ? "col-span-1 lg:col-span-2 xl:col-span-1" : ""}
                  `}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`p-2 rounded-xl ${stat.isPositive ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"}`}
                    >
                      {stat.icon}
                    </div>
                    <div
                      className={`flex items-center gap-1 text-sm font-medium ${stat.isPositive ? "text-emerald-600" : "text-red-600"}`}
                    >
                      {stat.isPositive ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                      {stat.change}
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm font-medium text-gray-700">
                    {stat.title}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {stat.description}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Основные категории аналитики */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Категории аналитики
            </h2>
            <div className="text-sm text-gray-500">
              {analyticsCards.length} основных категорий
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {analyticsCards.map((card, index) => (
              <motion.a
                key={card.id}
                href={card.href}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{
                  y: -6,
                  scale: 1.02,
                  transition: { duration: 0.2 },
                }}
                whileTap={{ scale: 0.98 }}
                className="group block"
              >
                <div className="h-full bg-white rounded-2xl border border-gray-200/50 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
                  {/* Заголовок с категорией */}
                  <div className="px-6 pt-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg mb-4">
                      {card.category}
                    </div>
                  </div>

                  {/* Основной контент */}
                  <div className="px-6 pb-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div
                        className={`p-3 bg-gradient-to-br ${card.color} rounded-xl`}
                      >
                        {card.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                          {card.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {card.description}
                        </p>
                      </div>
                    </div>

                    {/* Главный показатель */}
                    <div className="mb-6 p-4 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl border border-gray-200/50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm text-gray-500">
                          Основной показатель
                        </div>
                        <div
                          className={`flex items-center gap-1 text-sm font-semibold ${card.isTrendUp ? "text-emerald-600" : "text-red-600"}`}
                        >
                          {card.isTrendUp ? (
                            <ArrowUpRight className="w-4 h-4" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4" />
                          )}
                          {card.trend}
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-gray-900">
                        {card.stats}
                      </div>
                    </div>

                    {/* Особенности */}
                    <div className="mb-6">
                      <div className="text-sm font-semibold text-gray-700 mb-3">
                        Анализирует:
                      </div>
                      <div className="space-y-2">
                        {card.subFeatures.map((feature, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between"
                          >
                            <span className="text-sm text-gray-600">
                              {feature.label}
                            </span>
                            <span className="text-sm font-semibold text-gray-900">
                              {feature.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Кнопка перехода */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                        Подробный анализ
                      </span>
                      <div className="p-2 bg-gray-100 group-hover:bg-gradient-to-r group-hover:from-blue-500 group-hover:to-purple-500 rounded-lg transition-all duration-300">
                        <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.a>
            ))}
          </div>
        </div>

        {/* Быстрые отчеты */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white">
            <div className="flex items-center gap-3 mb-6">
              <Zap className="w-5 h-5 text-yellow-400" />
              <h3 className="text-xl font-bold">Быстрые отчеты</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {quickReports.map((report, index) => (
                <motion.a
                  key={index}
                  href={report.link}
                  whileHover={{ scale: 1.02 }}
                  className="p-4 bg-white/10 hover:bg-white/15 rounded-xl transition-all duration-300"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      {report.type === "financial" && (
                        <DollarSign className="w-4 h-4" />
                      )}
                      {report.type === "masters" && (
                        <UserCheck className="w-4 h-4" />
                      )}
                      {report.type === "services" && (
                        <Package className="w-4 h-4" />
                      )}
                    </div>
                    <div className="text-sm text-gray-300">
                      {report.type === "financial"
                        ? "Финансы"
                        : report.type === "masters"
                          ? "Мастера"
                          : "Услуги"}
                    </div>
                  </div>
                  <h4 className="font-bold text-lg mb-2">{report.title}</h4>
                  <p className="text-sm text-gray-300 mb-3">
                    {report.description}
                  </p>
                  <div className="text-xs text-gray-400">
                    Обновлено: {report.lastUpdated}
                  </div>
                </motion.a>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Статус системы - используем реальные данные */}
        {analyticsData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Статус записей */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  Статус записей
                </h3>
              </div>

              <div className="space-y-4">
                {[
                  {
                    label: "Новые",
                    count: analyticsData.appointments.newAppointments,
                    color: "bg-amber-500",
                    icon: AlertCircle,
                  },
                  {
                    label: "Подтвержденные",
                    count: analyticsData.appointments.confirmedAppointments,
                    color: "bg-emerald-500",
                    icon: CheckCircle,
                  },
                  {
                    label: "Завершенные",
                    count: analyticsData.appointments.completedAppointments,
                    color: "bg-blue-500",
                    icon: Clock4,
                  },
                  {
                    label: "Отмененные",
                    count: analyticsData.appointments.cancelledAppointments,
                    color: "bg-red-500",
                    icon: XCircle,
                  },
                ].map((status, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-3 h-3 rounded-full ${status.color}`}
                      ></div>
                      <span className="text-gray-700">{status.label}</span>
                    </div>
                    <span className="font-semibold text-gray-900">
                      {formatNumber(status.count)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Эффективность */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  Ключевые показатели
                </h3>
              </div>

              <div className="space-y-4">
                {[
                  {
                    label: "Конверсия записей",
                    value: formatPercent(
                      analyticsData.appointments.conversionRate,
                    ),
                    trend: "+5%",
                  },
                  {
                    label: "Средний чек",
                    value: formatCurrency(analyticsData.financial.averageCheck),
                    trend: "+8%",
                  },
                  {
                    label: "Повторные клиенты",
                    value: formatPercent(analyticsData.clients.retentionRate),
                    trend: "+12%",
                  },
                  {
                    label: "Загрузка мастеров",
                    value: formatPercent(analyticsData.masters.averageLoad),
                    trend: "+3%",
                  },
                ].map((metric, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <span className="text-gray-700">{metric.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">
                        {metric.value}
                      </span>
                      <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">
                        {metric.trend}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Рекомендации */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Рекомендации по аналитике
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-white/80 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                  <h4 className="font-semibold text-gray-900">
                    Анализ выручки
                  </h4>
                </div>
                <p className="text-sm text-gray-600">
                  Сравнивайте выручку по дням недели для оптимизации расписания
                </p>
              </div>

              <div className="p-4 bg-white/80 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-emerald-500" />
                  <h4 className="font-semibold text-gray-900">
                    Клиентская база
                  </h4>
                </div>
                <p className="text-sm text-gray-600">
                  Увеличьте долю повторных клиентов с помощью программ
                  лояльности
                </p>
              </div>

              <div className="p-4 bg-white/80 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="w-4 h-4 text-purple-500" />
                  <h4 className="font-semibold text-gray-900">Услуги</h4>
                </div>
                <p className="text-sm text-gray-600">
                  Анализируйте популярность услуг для корректировки прайс-листа
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Футер */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="pt-8 border-t border-gray-200/50"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="text-sm text-gray-500">
              <div className="flex flex-wrap items-center gap-4 mb-2">
                <span>
                  Период: {getPeriodDisplayName(selectedPeriod).toLowerCase()}
                </span>
                <span>•</span>
                <span>
                  Данные обновлены:{" "}
                  {analyticsData
                    ? new Date(analyticsData.lastUpdated).toLocaleString(
                        "ru-RU",
                        {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )
                    : "сегодня, 14:30"}
                </span>
                <span>•</span>
                <span>Всего метрик: 24</span>
              </div>
              <div className="text-gray-400">
                Используйте аналитику для роста бизнеса и улучшения услуг
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRefreshData}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed max-[350px]:w-full"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
                />
                {isLoading ? "Обновление..." : "Обновить данные"}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleExportReport}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                Полный отчет
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
