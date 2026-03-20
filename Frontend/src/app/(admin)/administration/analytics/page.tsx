"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
  Clock,
  TrendingDown,
  Target,
  Award,
  CalendarDays,
  Download,
  RefreshCw,
  ChevronRight,
  Activity,
  UserCheck,
  Wallet,
  CheckCircle,
  XCircle,
  Clock4,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Users as Clients,
  Calendar as Appointments,
  Package,
  ChartBar,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Zap,
  Sparkles,
  Filter,
  Search,
  X,
  History,
  FileText,
  PieChart,
  TrendingUp as Growth,
  Award as Quality,
  Percent,
  Repeat,
} from "lucide-react";
import { analyticsService } from "@/services/analytics/analytics.service";
import { useAnalytics } from "@/hooks/useAnalytics";
import { TimePeriod, KeyMetricsResponse } from "@/types/analytics.types";
import { ADMIN_ROUTES } from "@/app/lib/admin.routes";

// Конфигурация карточек аналитики
const analyticsCardsConfig = [
  {
    id: 1,
    title: "Общая финансовая аналитика",
    description: "Полный анализ доходов и выручки",
    icon: <DollarSign className="w-8 h-8" />,
    href: ADMIN_ROUTES.ANALYTICS.FINANCIAL,
    gradient: "from-emerald-500 to-green-500",
    glow: "shadow-emerald-500/25",
    category: "Финансы",
    iconBg: "from-emerald-500 to-green-500",
  },
  {
    id: 2,
    title: "Клиентская аналитика",
    description: "Анализ клиентской базы и лояльности",
    icon: <Clients className="w-8 h-8" />,
    href: ADMIN_ROUTES.ANALYTICS.CLIENTS,
    gradient: "from-blue-500 to-cyan-500",
    glow: "shadow-blue-500/25",
    category: "Клиенты",
    iconBg: "from-blue-500 to-cyan-500",
  },
  {
    id: 3,
    title: "Аналитика записей",
    description: "Статистика и эффективность записей",
    icon: <Appointments className="w-8 h-8" />,
    href: ADMIN_ROUTES.ANALYTICS.APPOINTMENTS,
    gradient: "from-purple-500 to-pink-500",
    glow: "shadow-purple-500/25",
    category: "Записи",
    iconBg: "from-purple-500 to-pink-500",
  },
  {
    id: 4,
    title: "Аналитика мастеров",
    description: "Эффективность и производительность мастеров",
    icon: <UserCheck className="w-8 h-8" />,
    href: ADMIN_ROUTES.ANALYTICS.MASTERS,
    gradient: "from-amber-500 to-orange-500",
    glow: "shadow-amber-500/25",
    category: "Мастера",
    iconBg: "from-amber-500 to-orange-500",
  },
  {
    id: 5,
    title: "Аналитика услуг",
    description: "Популярность и прибыльность услуг",
    icon: <Package className="w-8 h-8" />,
    href: ADMIN_ROUTES.ANALYTICS.SERVICES,
    gradient: "from-violet-500 to-indigo-500",
    glow: "shadow-violet-500/25",
    category: "Услуги",
    iconBg: "from-violet-500 to-indigo-500",
  },
  {
    id: 6,
    title: "Сравнительная аналитика",
    description: "Сравнение показателей и периодов",
    icon: <ChartBar className="w-8 h-8" />,
    href: ADMIN_ROUTES.ANALYTICS.COMPARSION,
    gradient: "from-rose-500 to-red-500",
    glow: "shadow-rose-500/25",
    category: "Сравнение",
    iconBg: "from-rose-500 to-red-500",
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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const {
    fetchKeyMetrics,
    formatCurrency,
    formatPercent,
    formatNumber,
    getPeriodDisplayName,
  } = useAnalytics();

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

  // Загрузка данных при изменении периода
  useEffect(() => {
    loadAnalyticsData();
  }, [selectedPeriod]);

  const loadAnalyticsData = async (showLoading = true) => {
    if (showLoading) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }
    setError(null);
    try {
      const data = await fetchKeyMetrics({ period: selectedPeriod });
      setAnalyticsData(data);
    } catch (err) {
      setError("Не удалось загрузить данные аналитики");
      console.error("Ошибка загрузки аналитики:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
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

  // Стили
  const glassCls = isDark
    ? "bg-white/[0.07] backdrop-blur-2xl border border-white/[0.1] shadow-[0_4px_24px_rgba(0,0,0,0.2)]"
    : "bg-white border border-gray-200/70 shadow-sm";

  // Функция для создания карточек аналитики на основе данных
  const getAnalyticsCards = () => {
    if (!analyticsData)
      return analyticsCardsConfig.map((card) => ({
        ...card,
        stats: "Загрузка...",
        trend: "+0%",
        isTrendUp: true,
        subFeatures: [
          { label: "Загрузка...", value: "..." },
          { label: "Загрузка...", value: "..." },
          { label: "Загрузка...", value: "..." },
          { label: "Загрузка...", value: "..." },
        ],
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
          gradient: "from-emerald-500 to-green-500",
        },
        {
          title: "Клиенты",
          value: "0",
          change: "+0%",
          isPositive: true,
          icon: <Users className="w-5 h-5" />,
          description: "0 новых",
          gradient: "from-blue-500 to-cyan-500",
        },
        {
          title: "Записи",
          value: "0",
          change: "+0%",
          isPositive: true,
          icon: <CalendarDays className="w-5 h-5" />,
          description: "0 завершено",
          gradient: "from-purple-500 to-pink-500",
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
        gradient: "from-emerald-500 to-green-500",
      },
      {
        title: "Клиенты",
        value: formatNumber(clients.totalClients),
        change: `+${clients.newClients}`,
        isPositive: clients.newClients > 0,
        icon: <Users className="w-5 h-5" />,
        description: `${formatNumber(clients.newClients)} новых`,
        gradient: "from-blue-500 to-cyan-500",
      },
      {
        title: "Записи",
        value: formatNumber(appointments.totalAppointments),
        change: `+${formatPercent(appointments.conversionRate)}`,
        isPositive: appointments.conversionRate >= 50,
        icon: <CalendarDays className="w-5 h-5" />,
        description: `${formatNumber(appointments.completedAppointments)} завершено`,
        gradient: "from-purple-500 to-pink-500",
      },
    ];
  };

  const STAT_CARDS = getSummaryStats();
  const analyticsCards = getAnalyticsCards();

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <div className="max-w-9xl mx-auto">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p
                className={`text-xs font-semibold tracking-widest uppercase mb-2 ${
                  isDark ? "text-white/30" : "text-gray-400"
                }`}
              >
                Аналитика
              </p>
              <h1
                className={`text-4xl md:text-5xl font-black leading-none tracking-tight ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                Бизнес аналитика 📈
              </h1>
              <p
                className={`mt-2 text-sm ${
                  isDark ? "text-white/40" : "text-gray-400"
                }`}
              >
                Ключевые метрики и показатели для принятия решений
              </p>
            </div>

            <div className="flex gap-2.5 flex-wrap">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => loadAnalyticsData(false)}
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
                onClick={handleExportReport}
                disabled={isLoading || isRefreshing}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 shadow-lg ${
                  isDark
                    ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-purple-500/25 hover:shadow-purple-500/40"
                    : "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-blue-500/20 hover:shadow-blue-500/35"
                }`}
              >
                <Download size={17} />
                Экспорт
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* PERIOD SELECTOR & FILTERS */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`rounded-2xl p-4 mb-6 transition-all duration-300 ${glassCls}`}
        >
          <div className="flex gap-3 flex-wrap items-center">
            {/* Period selector */}
            <div className="relative min-w-[200px]">
              <Calendar
                size={16}
                className={`absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${
                  isDark ? "text-white/30" : "text-gray-400"
                }`}
              />
              <select
                value={selectedPeriod}
                onChange={(e) => handlePeriodChange(e.target.value as TimePeriod)}
                disabled={isLoading}
                className={`w-full h-11 pl-10 pr-8 rounded-xl text-sm border outline-none appearance-none cursor-pointer transition-all ${
                  isDark
                    ? "bg-white/[0.07] border-white/[0.1] text-white/90 focus:border-white/20"
                    : "bg-gray-50 border-gray-200 text-gray-700 focus:border-blue-300 focus:bg-white"
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

            {/* Error display */}
            {error && (
              <div className="flex-1 text-sm text-rose-500 bg-rose-50/50 px-4 py-2 rounded-xl border border-rose-200">
                {error}
              </div>
            )}
          </div>

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
                        Финансы — выручка, доходы, средний чек
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500" />
                      <span className={isDark ? "text-white/60" : "text-gray-600"}>
                        Клиенты — новые, повторные, удержание
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
                      <span className={isDark ? "text-white/60" : "text-gray-600"}>
                        Записи — статусы, конверсия, отмены
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* STAT CARDS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-8">
          {STAT_CARDS.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 + 0.2 }}
              whileHover={{ y: -3 }}
              className={`relative rounded-2xl p-5 overflow-hidden transition-all duration-300 ${
                isDark
                  ? `bg-white/[0.07] border border-white/[0.1] backdrop-blur-xl shadow-lg`
                  : "bg-white border border-gray-200/70 shadow-sm hover:shadow-md"
              }`}
            >
              {/* Gradient accent corner */}
              <div
                className={`absolute -top-4 -right-4 w-20 h-20 rounded-full bg-gradient-to-br ${stat.gradient} opacity-${isDark ? "15" : "8"} blur-xl`}
              />

              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`inline-flex p-2 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}
                  >
                    <span className="text-white">{stat.icon}</span>
                  </div>
                  <div
                    className={`flex items-center gap-1 text-sm font-medium ${
                      stat.isPositive
                        ? isDark ? "text-emerald-400" : "text-emerald-600"
                        : isDark ? "text-rose-400" : "text-rose-600"
                    }`}
                  >
                    {stat.isPositive ? (
                      <ArrowUpRight size={16} />
                    ) : (
                      <ArrowDownRight size={16} />
                    )}
                    {stat.change}
                  </div>
                </div>

                <div
                  className={`text-3xl font-black leading-none mb-1 ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  {stat.value}
                </div>
                <div
                  className={`text-sm font-semibold ${
                    isDark ? "text-white/70" : "text-gray-700"
                  }`}
                >
                  {stat.title}
                </div>
                <div
                  className={`text-xs mt-1 ${
                    isDark ? "text-white/35" : "text-gray-400"
                  }`}
                >
                  {stat.description}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* MAIN CONTENT - Analytics Categories */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2
              className={`text-2xl font-bold ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              Категории аналитики
            </h2>
            <div
              className={`text-sm ${
                isDark ? "text-white/30" : "text-gray-400"
              }`}
            >
              {analyticsCards.length} основных категорий
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div
                className={`w-10 h-10 rounded-full border-3 border-t-transparent animate-spin mb-4 ${
                  isDark ? "border-purple-400" : "border-blue-400"
                }`}
                style={{ borderWidth: 3 }}
              />
              <p
                className={`text-sm ${
                  isDark ? "text-white/40" : "text-gray-400"
                }`}
              >
                Загрузка аналитики...
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {analyticsCards.map((card, index) => (
                <motion.a
                  key={card.id}
                  href={card.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 + 0.3 }}
                  whileHover={{ y: -6 }}
                  className="group block"
                >
                  <div
                    className={`h-full rounded-2xl transition-all duration-300 overflow-hidden ${
                      isDark
                        ? "bg-white/[0.07] backdrop-blur-xl border border-white/[0.1] hover:bg-white/[0.1] shadow-lg hover:shadow-xl"
                        : "bg-white border border-gray-200/70 shadow-sm hover:shadow-md"
                    }`}
                  >
                    {/* Category tag */}
                    <div className="px-6 pt-6">
                      <div
                        className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-full ${
                          isDark
                            ? "bg-white/[0.05] text-white/50"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {card.category}
                      </div>
                    </div>

                    {/* Main content */}
                    <div className="px-6 pb-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div
                          className={`p-3 rounded-xl bg-gradient-to-br ${card.iconBg} shadow-lg`}
                        >
                          <span className="text-white">{card.icon}</span>
                        </div>
                        <div className="flex-1">
                          <h3
                            className={`text-lg font-bold mb-1 ${
                              isDark ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {card.title}
                          </h3>
                          <p
                            className={`text-sm ${
                              isDark ? "text-white/40" : "text-gray-500"
                            }`}
                          >
                            {card.description}
                          </p>
                        </div>
                      </div>

                      {/* Main metric */}
                      <div
                        className={`mb-4 p-4 rounded-xl ${
                          isDark
                            ? "bg-white/[0.04] border border-white/[0.05]"
                            : "bg-gray-50 border border-gray-200/50"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className={`text-xs ${
                              isDark ? "text-white/30" : "text-gray-400"
                            }`}
                          >
                            Основной показатель
                          </span>
                          <div
                            className={`flex items-center gap-1 text-xs font-semibold ${
                              card.isTrendUp
                                ? isDark
                                  ? "text-emerald-400"
                                  : "text-emerald-600"
                                : isDark
                                  ? "text-rose-400"
                                  : "text-rose-600"
                            }`}
                          >
                            {card.isTrendUp ? (
                              <ArrowUpRight size={12} />
                            ) : (
                              <ArrowDownRight size={12} />
                            )}
                            {card.trend}
                          </div>
                        </div>
                        <div
                          className={`text-2xl font-bold ${
                            isDark ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {card.stats}
                        </div>
                      </div>

                      {/* Features */}
                      <div className="mb-6">
                        <div
                          className={`text-xs font-semibold mb-2 ${
                            isDark ? "text-white/30" : "text-gray-400"
                          }`}
                        >
                          Анализирует:
                        </div>
                        <div className="space-y-2">
                          {card.subFeatures.map((feature, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between"
                            >
                              <span
                                className={`text-sm ${
                                  isDark ? "text-white/50" : "text-gray-500"
                                }`}
                              >
                                {feature.label}
                              </span>
                              <span
                                className={`text-sm font-semibold ${
                                  isDark ? "text-white" : "text-gray-900"
                                }`}
                              >
                                {feature.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Action button */}
                      <div
                        className={`flex items-center justify-between pt-4 border-t ${
                          isDark ? "border-white/[0.07]" : "border-gray-100"
                        }`}
                      >
                        <span
                          className={`text-sm transition-colors ${
                            isDark
                              ? "text-white/40 group-hover:text-white/60"
                              : "text-gray-500 group-hover:text-gray-700"
                          }`}
                        >
                          Подробный анализ
                        </span>
                        <div
                          className={`p-2 rounded-lg transition-all duration-300 ${
                            isDark
                              ? "bg-white/[0.05] group-hover:bg-gradient-to-r group-hover:from-indigo-500 group-hover:to-purple-600"
                              : "bg-gray-100 group-hover:bg-gradient-to-r group-hover:from-blue-500 group-hover:to-purple-600"
                          }`}
                        >
                          <ChevronRight
                            size={18}
                            className={`transition-colors ${
                              isDark
                                ? "text-white/40 group-hover:text-white"
                                : "text-gray-500 group-hover:text-white"
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.a>
              ))}
            </div>
          )}
        </div>

        {/* SYSTEM STATUS */}
        {analyticsData && !isLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Appointment Status */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className={`rounded-2xl p-6 ${glassCls}`}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <h3
                  className={`text-xl font-bold ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
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
                    color: "bg-rose-500",
                    icon: XCircle,
                  },
                ].map((status, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${status.color}`} />
                      <span
                        className={`text-sm ${
                          isDark ? "text-white/60" : "text-gray-600"
                        }`}
                      >
                        {status.label}
                      </span>
                    </div>
                    <span
                      className={`font-semibold ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {formatNumber(status.count)}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Key Metrics */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className={`rounded-2xl p-6 ${glassCls}`}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <h3
                  className={`text-xl font-bold ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
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
                  <div key={index} className="flex items-center justify-between">
                    <span
                      className={`text-sm ${
                        isDark ? "text-white/60" : "text-gray-600"
                      }`}
                    >
                      {metric.label}
                    </span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-semibold ${
                          isDark ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {metric.value}
                      </span>
                      <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">
                        {metric.trend}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}

        {/* FOOTER */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className={`pt-6 border-t ${
            isDark ? "border-white/[0.07]" : "border-gray-100"
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div
              className={`text-sm ${
                isDark ? "text-white/30" : "text-gray-400"
              }`}
            >
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
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )
                    : "сегодня"}
                </span>
                <span>•</span>
                <span>Всего метрик: 24</span>
              </div>
              <div className={isDark ? "text-white/20" : "text-gray-300"}>
                Используйте аналитику для роста бизнеса и улучшения услуг
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => loadAnalyticsData(false)}
                disabled={isRefreshing}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isDark
                    ? "text-white/50 hover:text-white/70 disabled:opacity-50"
                    : "text-gray-500 hover:text-gray-700 disabled:opacity-50"
                }`}
              >
                <RefreshCw
                  size={14}
                  className={isRefreshing ? "animate-spin" : ""}
                />
                {isRefreshing ? "Обновление..." : "Обновить"}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleExportReport}
                disabled={isLoading || isRefreshing}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 shadow-lg ${
                  isDark
                    ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-purple-500/25 hover:shadow-purple-500/40"
                    : "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-blue-500/20 hover:shadow-blue-500/35"
                }`}
              >
                <Download size={14} />
                Полный отчет
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}