"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { appointmentService } from "@/services/appointment/appointment.service";
import { userService } from "@/services/user/user.service";
import { IAppointment, AppointmentStatus } from "@/types/appointment.types";
import { IUser } from "@/types/user.types";
import {
  Search,
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  CalendarDays,
  SlidersHorizontal,
  X,
  UserCheck,
  Clock4,
  Archive,
  DollarSign,
  BarChart3,
  Award,
  Download,
  History,
  CheckCircle,
  TrendingUp,
  Eye,
  Ban,
  AlertCircle as AlertCircleLucide,
  UserCheck as UserCheckLucide,
  CalendarCheck,
  Clock as ClockLucide,
  Clock4 as Clock4Lucide,
} from "lucide-react";

type SortField = "time" | "client" | "service" | "date" | "price";
type SortOrder = "asc" | "desc";
type StatusFilter = "all" | AppointmentStatus;

export default function MasterHistoryAppointments() {
  const [currentUser, setCurrentUser] = useState<IUser | null>(null);
  const [appointments, setAppointments] = useState<IAppointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [sortField, setSortField] = useState<SortField>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  // Пагинация
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 9;

  // Theme detection
  useEffect(() => {
    const check = () =>
      setIsDark(document.documentElement.classList.contains("dark"));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => obs.disconnect();
  }, []);

  const loadData = async (showLoading = true) => {
    if (showLoading) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }

    setError(null);

    try {
      const userData = await userService.getMe();
      setCurrentUser(userData.data);

      const allAppointments = await appointmentService.getAll();

      const masterAppointments = allAppointments.filter((appointment) => {
        return (
          appointment.master.id === (userData.data.masterId || userData.data.id)
        );
      });

      // Фильтрация только завершенных и отмененных
      const historyAppointments = masterAppointments.filter(
        (app) =>
          app.status === AppointmentStatus.Завершен ||
          app.status === AppointmentStatus.Отменен,
      );

      setAppointments(historyAppointments);
    } catch (err) {
      setError("Не удалось загрузить данные. Проверьте соединение.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setCurrentPage(1); // Сброс на первую страницу при изменении фильтров
  }, [searchQuery, dateFilter, statusFilter, sortField, sortOrder]);

  // Статистика для истории
  const stats = useMemo(() => {
    const total = appointments.length;
    const revenueRelevantStatuses = [AppointmentStatus.Завершен];

    const totalRevenue = appointments.reduce((sum, a) => {
      if (!revenueRelevantStatuses.includes(a.status)) return sum;
      return sum + (Number(a.price) || 0);
    }, 0);

    const paidAppointments = appointments.filter((a) =>
      revenueRelevantStatuses.includes(a.status),
    );
    const avgRevenue =
      paidAppointments.length > 0
        ? Math.round(totalRevenue / paidAppointments.length)
        : 0;

    const serviceCounts: Record<string, number> = {};
    appointments.forEach((a) => {
      const serviceTitle = a.service?.title || "Неизвестная услуга";
      serviceCounts[serviceTitle] = (serviceCounts[serviceTitle] || 0) + 1;
    });

    const mostPopularService =
      Object.entries(serviceCounts).sort(([, a], [, b]) => b - a)[0]?.[0] ||
      "—";

    const statusCounts = {
      [AppointmentStatus.Завершен]: appointments.filter(
        (a) => a.status === AppointmentStatus.Завершен,
      ).length,
      [AppointmentStatus.Отменен]: appointments.filter(
        (a) => a.status === AppointmentStatus.Отменен,
      ).length,
    };

    return {
      total,
      totalRevenue,
      avgRevenue,
      mostPopularService,
      statusCounts,
    };
  }, [appointments]);

  const filteredAndSortedAppointments = useMemo(() => {
    let filtered = appointments;

    // Фильтрация по статусу (только Завершен или Отменен)
    if (statusFilter !== "all") {
      filtered = filtered.filter((a) => a.status === statusFilter);
    }

    // Поиск
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (app) =>
          `${app.clientSurname} ${app.clientName}`.toLowerCase().includes(q) ||
          app.service.title.toLowerCase().includes(q) ||
          app.clientPhone.includes(q),
      );
    }

    // Фильтрация по дате
    if (dateFilter) {
      filtered = filtered.filter(
        (app) =>
          new Date(app.appointmentTime).toISOString().split("T")[0] ===
          dateFilter,
      );
    }

    // Сортировка
    const sorted = [...filtered].sort((a, b) => {
      let aValue: string | number = "";
      let bValue: string | number = "";

      switch (sortField) {
        case "time":
          aValue = new Date(a.appointmentTime).getTime();
          bValue = new Date(b.appointmentTime).getTime();
          break;
        case "client":
          aValue = `${a.clientSurname} ${a.clientName}`.toLowerCase();
          bValue = `${b.clientSurname} ${b.clientName}`.toLowerCase();
          break;
        case "service":
          aValue = a.service.title.toLowerCase();
          bValue = b.service.title.toLowerCase();
          break;
        case "date":
          aValue = new Date(a.appointmentTime).setHours(0, 0, 0, 0);
          bValue = new Date(b.appointmentTime).setHours(0, 0, 0, 0);
          break;
        case "price":
          aValue = Number(a.price) || 0;
          bValue = Number(b.price) || 0;
          break;
        default:
          return 0;
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortOrder === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      return sortOrder === "asc"
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });

    return sorted;
  }, [
    appointments,
    sortField,
    sortOrder,
    dateFilter,
    searchQuery,
    statusFilter,
  ]);

  // Пагинация
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedAppointments.slice(
      startIndex,
      startIndex + ITEMS_PER_PAGE,
    );
  }, [filteredAndSortedAppointments, currentPage]);

  const totalPages = useMemo(() => {
    return Math.ceil(filteredAndSortedAppointments.length / ITEMS_PER_PAGE);
  }, [filteredAndSortedAppointments.length]);

  const handleSortChange = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const clearFilters = () => {
    setDateFilter("");
    setSearchQuery("");
    setStatusFilter("all");
  };

  const formatDate = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusInfo = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.Завершен:
        return {
          dot: "bg-emerald-400",
          label: "Завершён",
          color: "text-emerald-400",
          icon: <CheckCircle size={14} />,
        };
      case AppointmentStatus.Отменен:
        return {
          dot: "bg-rose-400",
          label: "Отменён",
          color: "text-rose-400",
          icon: <Ban size={14} />,
        };
      default:
        return {
          dot: "bg-gray-400",
          label: status,
          color: "text-gray-400",
          icon: null,
        };
    }
  };

  const glassCls = isDark
    ? "bg-white/[0.07] backdrop-blur-2xl border border-white/[0.1] shadow-lg"
    : "bg-white border border-gray-200/70 shadow-sm";

  const STAT_CARDS = [
    {
      num: stats.total,
      label: "Всего записей",
      sub: "в истории",
      icon: <Archive size={22} />,
      gradient: "from-indigo-500 to-purple-600",
      glow: "shadow-indigo-500/25",
    },
    {
      num: stats.totalRevenue.toLocaleString("ru-RU") + " ₽",
      label: "Выручка",
      sub: "только завершённые",
      icon: <DollarSign size={22} />,
      gradient: "from-emerald-500 to-teal-500",
      glow: "shadow-emerald-500/25",
    },
    {
      num: stats.avgRevenue.toLocaleString("ru-RU") + " ₽",
      label: "Средний чек",
      sub: "по завершённым",
      icon: <BarChart3 size={22} />,
      gradient: "from-blue-500 to-cyan-500",
      glow: "shadow-blue-500/25",
    },
    {
      num: stats.mostPopularService,
      label: "Популярная услуга",
      sub: "чаще всего завершали",
      icon: <Award size={22} />,
      gradient: "from-amber-500 to-orange-500",
      glow: "shadow-amber-500/25",
    },
  ];

  const SORT_OPTS: {
    field: SortField;
    label: string;
    icon: React.ReactNode;
  }[] = [
    { field: "date", label: "Дата", icon: <Calendar size={14} /> },
    { field: "time", label: "Время", icon: <Clock size={14} /> },
    { field: "price", label: "Цена", icon: <DollarSign size={14} /> },
    { field: "client", label: "Клиент", icon: <Users size={14} /> },
    { field: "service", label: "Услуга", icon: <TrendingUp size={14} /> },
  ];

  const exportToCSV = () => {
    const headers = [
      "Дата",
      "Время",
      "Статус",
      "Клиент",
      "Телефон",
      "Услуга",
      "Цена",
    ];
    const rows = filteredAndSortedAppointments.map((a) => [
      formatDate(a.appointmentTime),
      formatTime(a.appointmentTime),
      a.status,
      `${a.clientSurname} ${a.clientName}`,
      a.clientPhone,
      a.service.title,
      `${(Number(a.price) || 0).toLocaleString("ru-RU")} ₽`,
    ]);

    const csvContent = [
      headers.join(", "),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(", ")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `история_моих_записей_${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.click();
  };

  // Компонент пагинации
  function Pagination({
    currentPage,
    totalPages,
    onPageChange,
  }: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  }) {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
      const pages: (number | string)[] = [];
      const maxVisible = 5;

      if (totalPages <= maxVisible) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
      } else {
        if (currentPage <= 3) {
          for (let i = 1; i <= 4; i++) pages.push(i);
          pages.push("...");
          pages.push(totalPages);
        } else if (currentPage >= totalPages - 2) {
          pages.push(1);
          pages.push("...");
          for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
        } else {
          pages.push(1);
          pages.push("...");
          for (let i = currentPage - 1; i <= currentPage + 1; i++)
            pages.push(i);
          pages.push("...");
          pages.push(totalPages);
        }
      }
      return pages;
    };

    return (
      <div className="flex items-center justify-center gap-2 mt-6 flex-wrap">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 rounded-xl border border-gray-300/50 bg-white/80 text-gray-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50/80 transition-all duration-300 dark:bg-white/[0.07] dark:border-white/[0.1] dark:text-white/70 dark:hover:bg-white/[0.1]"
        >
          {/* Отображаем стрелку и текст для больших экранов, только стрелку для маленьких */}
          <div className="flex items-center gap-1">
            <span className="sm:hidden">←</span>{" "}
            {/* Только стрелка на маленьких экранах */}
            <span className="hidden sm:inline-flex items-center gap-1">
              ← <span>Назад</span>
            </span>
          </div>
        </motion.button>

        {getPageNumbers().map((page, idx) =>
          page === "..." ? (
            <span
              key={`ellipsis-${idx}`}
              className="px-3 py-2 text-gray-400 font-medium"
            >
              ...
            </span>
          ) : (
            <motion.button
              key={page}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onPageChange(page as number)}
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 min-w-[40px] ${
                currentPage === page
                  ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg"
                  : "border border-gray-300/50 bg-white/80 text-gray-700 hover:bg-gray-50/80 dark:bg-white/[0.07] dark:border-white/[0.1] dark:text-white/70 dark:hover:bg-white/[0.1]"
              }`}
            >
              {page}
            </motion.button>
          ),
        )}

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="px-4 py-2 rounded-xl border border-gray-300/50 bg-white/80 text-gray-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50/80 transition-all duration-300 dark:bg-white/[0.07] dark:border-white/[0.1] dark:text-white/70 dark:hover:bg-white/[0.1]"
        >
          {/* Отображаем текст и стрелку для больших экранов, только стрелку для маленьких */}
          <div className="flex items-center gap-1 justify-end">
            <span className="hidden sm:inline-flex items-center gap-1">
              <span>Вперёд</span> →
            </span>
            <span className="sm:hidden">→</span>{" "}
            {/* Только стрелка на маленьких экранах */}
          </div>
        </motion.button>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      {/* Ambient orbs — dark only */}
      {isDark && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden -z-0">
          <div className="absolute -top-48 -right-48 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-48 -left-48 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-indigo-500/8 rounded-full blur-3xl" />
        </div>
      )}

      <div className="max-w-9xl mx-auto relative z-10 space-y-8">
        {/* ── HEADER ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            {/* Left — greeting */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border ${
                    isDark
                      ? "bg-white/[0.07] border-white/[0.1] text-white/50"
                      : "bg-gray-100 border-gray-200 text-gray-400"
                  }`}
                >
                  <History size={11} />
                  Архив
                </div>
              </div>

              <h1
                className={`text-4xl md:text-5xl lg:text-6xl font-black leading-none tracking-tight mb-3 ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                История{" "}
                <span
                  className={`${
                    isDark
                      ? "bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
                      : "bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                  }`}
                >
                  моих записей
                </span>
              </h1>
              <p
                className={`text-base ${isDark ? "text-white/40" : "text-gray-400"}`}
              >
                {stats.total} записей ·{" "}
                {stats.statusCounts[AppointmentStatus.Завершен]} завершённых
              </p>
            </div>

            {/* Right — actions */}
            <div className="flex gap-2.5 flex-wrap">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => loadData(false)}
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
                onClick={exportToCSV}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 shadow-lg ${
                  isDark
                    ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-purple-500/25 hover:shadow-purple-500/40"
                    : "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-blue-500/20 hover:shadow-blue-500/35"
                }`}
              >
                <Download size={17} />
                Экспорт CSV
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* ── STAT CARDS ──────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2
                className={`text-lg font-black tracking-tight ${isDark ? "text-white/90" : "text-gray-900"}`}
              >
                Статистика
              </h2>
              <p
                className={`text-xs ${isDark ? "text-white/30" : "text-gray-400"}`}
              >
                История ваших записей
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 not-sm:grid-cols-1 gap-3">
            {STAT_CARDS.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className={`relative rounded-2xl p-5 overflow-hidden transition-all duration-300 ${
                  isDark
                    ? `bg-white/[0.07] border border-white/[0.1] backdrop-blur-xl shadow-lg ${s.glow}`
                    : "bg-white border border-gray-200/70 shadow-sm hover:shadow-md"
                }`}
              >
                {/* Gradient accent corner */}
                <div
                  className={`absolute -top-4 -right-4 w-20 h-20 rounded-full bg-gradient-to-br ${s.gradient} opacity-${isDark ? "15" : "8"} blur-xl`}
                />

                <div className="relative">
                  <div
                    className={`inline-flex p-2 rounded-xl mb-3 bg-gradient-to-br ${s.gradient} shadow-lg ${s.glow}`}
                  >
                    <span className="text-white">{s.icon}</span>
                  </div>
                  <div
                    className={`text-3xl font-black leading-none mb-1 ${isDark ? "text-white" : "text-gray-900"}`}
                  >
                    {isLoading ? "—" : s.num}
                  </div>
                  <div
                    className={`text-sm font-semibold ${isDark ? "text-white/70" : "text-gray-700"}`}
                  >
                    {s.label}
                  </div>
                  <div
                    className={`text-xs mt-0.5 ${isDark ? "text-white/35" : "text-gray-400"}`}
                  >
                    {s.sub}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── SEARCH & FILTER ─────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28 }}
          className={`rounded-2xl p-4 transition-all duration-300 ${glassCls}`}
        >
          <div className="flex gap-3 flex-wrap">
            {/* Search */}
            <div className="flex-1 min-w-[200px] relative">
              <Search
                size={16}
                className={`absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? "text-white/30" : "text-gray-400"}`}
              />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск по клиенту, услуге..."
                className={`w-full h-11 pl-10 pr-4 rounded-xl text-sm border outline-none transition-all ${
                  isDark
                    ? "bg-white/[0.07] border-white/[0.1] text-white/90 placeholder-white/25 focus:border-white/20 focus:bg-white/[0.09]"
                    : "bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400 focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-500/10"
                }`}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-lg ${isDark ? "text-white/40 hover:text-white/60" : "text-gray-400 hover:text-gray-600"}`}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Date */}
            <div className="relative">
              <Calendar
                size={15}
                className={`absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? "text-white/30" : "text-gray-400"}`}
              />
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className={`h-11 pl-10 pr-4 rounded-xl text-sm border outline-none cursor-pointer transition-all ${
                  isDark
                    ? "bg-white/[0.07] border-white/[0.1] text-white/90 focus:border-white/20"
                    : "bg-gray-50 border-gray-200 text-gray-700 focus:border-blue-300 focus:bg-white"
                }`}
              />
            </div>

            {/* Status filter */}
            <select
              className={`h-11 px-4 rounded-xl text-sm border outline-none cursor-pointer transition-all ${
                isDark
                  ? "bg-white/[0.07] border-white/[0.1] text-white/90 focus:border-white/20"
                  : "bg-gray-50 border-gray-200 text-gray-700 focus:border-blue-300 focus:bg-white"
              }`}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            >
              <option value="all">Все статусы</option>
              <option value={AppointmentStatus.Завершен}>Завершённые</option>
              <option value={AppointmentStatus.Отменен}>Отменённые</option>
            </select>

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
              Фильтры
              {isFilterOpen ? (
                <ChevronUp size={13} />
              ) : (
                <ChevronDown size={13} />
              )}
            </motion.button>

            {/* Clear all */}
            {(searchQuery || dateFilter || statusFilter !== "all") && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={clearFilters}
                className={`h-11 px-4 rounded-xl text-sm font-semibold border transition-all ${
                  isDark
                    ? "bg-rose-500/10 border-rose-400/20 text-rose-400 hover:bg-rose-500/15"
                    : "bg-rose-50 border-rose-200 text-rose-500 hover:bg-rose-100"
                }`}
              >
                <X size={15} />
              </motion.button>
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
                  className={`pt-3 border-t ${isDark ? "border-white/[0.07]" : "border-gray-100"}`}
                >
                  <p
                    className={`text-xs font-semibold mb-2.5 ${isDark ? "text-white/30" : "text-gray-400"}`}
                  >
                    Сортировка:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {SORT_OPTS.map((opt) => {
                      const active = sortField === opt.field;
                      return (
                        <motion.button
                          key={opt.field}
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.96 }}
                          onClick={() => handleSortChange(opt.field)}
                          className={`flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-semibold border transition-all duration-150 ${
                            active
                              ? isDark
                                ? "bg-indigo-500/20 border-indigo-400/30 text-indigo-300"
                                : "bg-blue-100 border-blue-300 text-blue-700"
                              : isDark
                                ? "bg-white/[0.05] border-white/[0.08] text-white/50 hover:text-white/70 hover:border-white/[0.12]"
                                : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-white"
                          }`}
                        >
                          {opt.icon}
                          {opt.label}
                          {active &&
                            (sortOrder === "asc" ? (
                              <ChevronUp size={11} />
                            ) : (
                              <ChevronDown size={11} />
                            ))}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── RESULT META ─────────────────────────────────────── */}
        {!isLoading && !error && (
          <div
            className={`flex items-center justify-between px-1 mb-3 text-xs ${isDark ? "text-white/30" : "text-gray-400"}`}
          >
            <span>
              {filteredAndSortedAppointments.length === appointments.length
                ? `${filteredAndSortedAppointments.length} записей`
                : `${filteredAndSortedAppointments.length} из ${appointments.length}`}
            </span>
          </div>
        )}

        {/* ── APPOINTMENTS GRID ────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
        >
          {isLoading ? (
            <div className={`rounded-2xl p-16 text-center ${glassCls}`}>
              <div
                className={`w-10 h-10 rounded-full border-3 border-t-transparent animate-spin mx-auto mb-4 ${
                  isDark ? "border-purple-400" : "border-blue-400"
                }`}
                style={{ borderWidth: 3 }}
              />
              <p
                className={`text-sm ${isDark ? "text-white/40" : "text-gray-400"}`}
              >
                Загрузка истории записей...
              </p>
            </div>
          ) : error ? (
            <div className={`rounded-2xl p-8 text-center ${glassCls}`}>
              <p className="text-rose-500 font-medium mb-4">{error}</p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => loadData(true)}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r ${
                  isDark
                    ? "from-indigo-500 to-purple-600"
                    : "from-blue-500 to-purple-600"
                }`}
              >
                Повторить
              </motion.button>
            </div>
          ) : filteredAndSortedAppointments.length === 0 ? (
            <div className={`rounded-2xl p-16 text-center ${glassCls}`}>
              <div
                className={`w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center ${isDark ? "bg-white/[0.07]" : "bg-gray-100"}`}
              >
                <History
                  size={26}
                  className={isDark ? "text-white/25" : "text-gray-300"}
                />
              </div>
              <p
                className={`text-lg font-bold mb-1 ${isDark ? "text-white/70" : "text-gray-600"}`}
              >
                Записей не найдено
              </p>
              <p
                className={`text-sm ${isDark ? "text-white/30" : "text-gray-400"}`}
              >
                {searchQuery || dateFilter || statusFilter !== "all"
                  ? "Попробуйте изменить параметры поиска"
                  : "История ваших записей пока пуста"}
              </p>
              {(searchQuery || dateFilter || statusFilter !== "all") && (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  onClick={clearFilters}
                  className={`mt-5 px-5 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
                    isDark
                      ? "border-white/10 text-white/50 hover:bg-white/[0.07]"
                      : "border-gray-200 text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  Сбросить фильтры
                </motion.button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
                <AnimatePresence mode="popLayout">
                  {paginatedData.map((appointment, index) => {
                    const price = Number(appointment.price) || 0;
                    const statusInfo = getStatusInfo(appointment.status);
                    const isRevenueRelevant =
                      appointment.status === AppointmentStatus.Завершен;

                    return (
                      <motion.div
                        key={appointment.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ delay: Math.min(index * 0.04, 0.3) }}
                        whileHover={{ y: -4 }}
                        className={`rounded-2xl p-5 transition-all duration-300 ${
                          isDark
                            ? "bg-white/[0.07] backdrop-blur-xl border border-white/[0.1] shadow-lg hover:shadow-xl hover:bg-white/[0.1]"
                            : "bg-white border border-gray-200/70 shadow-sm hover:shadow-md"
                        }`}
                      >
                        {/* Header with date and status */}
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div
                              className={`text-xs font-medium mb-1 ${
                                isDark ? "text-white/40" : "text-gray-400"
                              }`}
                            >
                              {formatDate(appointment.appointmentTime)}
                            </div>
                            <div
                              className={`text-xl font-bold flex items-center gap-2 ${
                                isDark ? "text-white" : "text-gray-900"
                              }`}
                            >
                              <Clock4Lucide
                                size={16}
                                className={
                                  isDark ? "text-white/50" : "text-gray-400"
                                }
                              />
                              {formatTime(appointment.appointmentTime)}
                            </div>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border ${
                              isDark
                                ? "bg-white/[0.04] border-white/[0.1] text-white/70"
                                : "bg-gray-50 border-gray-200/50 text-gray-700"
                            }`}
                          >
                            {statusInfo.icon}
                            {statusInfo.label}
                          </span>
                        </div>

                        {/* Client */}
                        <div className="mb-4">
                          <div
                            className={`text-xs font-medium mb-2 ${
                              isDark ? "text-white/30" : "text-gray-400"
                            }`}
                          >
                            Клиент
                          </div>
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm bg-gradient-to-br ${
                                isDark
                                  ? "from-indigo-500/50 to-purple-600/50"
                                  : "from-blue-500 to-purple-600"
                              }`}
                            >
                              {appointment.clientName[0]?.toUpperCase() || "К"}
                            </div>
                            <div>
                              <div
                                className={`text-sm font-bold ${
                                  isDark ? "text-white" : "text-gray-900"
                                }`}
                              >
                                {appointment.clientSurname}{" "}
                                {appointment.clientName}
                              </div>
                              <div
                                className={`text-xs ${
                                  isDark ? "text-white/40" : "text-gray-400"
                                }`}
                              >
                                {appointment.clientPhone}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Service */}
                        <div
                          className={`rounded-xl p-3 mb-4 ${
                            isDark ? "bg-white/[0.04]" : "bg-gray-50"
                          }`}
                        >
                          <div
                            className={`text-xs mb-1 ${
                              isDark ? "text-white/30" : "text-gray-400"
                            }`}
                          >
                            Услуга
                          </div>
                          <div
                            className={`text-sm font-bold truncate ${
                              isDark ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {appointment.service.title}
                          </div>
                          <div
                            className={`text-xs mt-1 ${
                              isDark ? "text-white/30" : "text-gray-400"
                            }`}
                          >
                            {appointment.service.duration} мин.
                          </div>
                        </div>

                        {/* Price */}
                        <div
                          className={`flex items-center justify-between pt-3 border-t ${
                            isDark ? "border-white/[0.07]" : "border-gray-100"
                          }`}
                        >
                          <div>
                            <div
                              className={`text-xs ${
                                isDark ? "text-white/30" : "text-gray-400"
                              }`}
                            >
                              Стоимость
                            </div>
                            <div
                              className={`text-lg font-bold ${
                                isRevenueRelevant
                                  ? isDark
                                    ? "text-emerald-400"
                                    : "text-emerald-600"
                                  : isDark
                                    ? "text-white/40"
                                    : "text-gray-400"
                              }`}
                            >
                              {price.toLocaleString("ru-RU")} ₽
                            </div>
                          </div>
                          {!isRevenueRelevant && (
                            <span
                              className={`text-[10px] px-2 py-1 rounded ${
                                isDark
                                  ? "bg-white/[0.05] text-white/30"
                                  : "bg-gray-100 text-gray-400"
                              }`}
                            >
                              не в выручке
                            </span>
                          )}
                          <div
                            className={`text-xs ${
                              isDark ? "text-white/20" : "text-gray-300"
                            }`}
                          >
                            ID: {appointment.id}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              {/* Pagination */}
              {filteredAndSortedAppointments.length > ITEMS_PER_PAGE && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              )}

              {/* Pagination info */}
              {filteredAndSortedAppointments.length > 0 && (
                <div
                  className={`text-center text-sm mt-2 ${
                    isDark ? "text-white/30" : "text-gray-400"
                  }`}
                >
                  Страница {currentPage} из {totalPages} • Показано{" "}
                  {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
                  {Math.min(
                    currentPage * ITEMS_PER_PAGE,
                    filteredAndSortedAppointments.length,
                  )}{" "}
                  из {filteredAndSortedAppointments.length}
                </div>
              )}
            </>
          )}
        </motion.div>

        {/* ── FOOTER LEGEND ──────────────────────────────────────────── */}
        {!isLoading && !error && filteredAndSortedAppointments.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className={`mt-8 pt-6 border-t flex flex-wrap items-center justify-between gap-4 text-xs ${
              isDark
                ? "border-white/[0.07] text-white/25"
                : "border-gray-100 text-gray-400"
            }`}
          >
            <div className="flex flex-wrap items-center gap-5">
              {[
                { color: "bg-emerald-400", label: "Завершённые" },
                { color: "bg-rose-400", label: "Отменённые" },
              ].map((l) => (
                <div key={l.label} className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${l.color}`} />
                  {l.label}
                </div>
              ))}
            </div>
            <span>Выручка: {stats.totalRevenue.toLocaleString("ru-RU")} ₽</span>
          </motion.div>
        )}
      </div>
    </div>
  );
}
