"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { appointmentService } from "@/services/appointment/appointment.service";
import { IAppointment, AppointmentStatus } from "@/types/appointment.types";
import {
  Search,
  Filter,
  Calendar,
  Clock,
  Users,
  TrendingUp,
  Download,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  X,
  History,
  CheckCircle,
  DollarSign,
  Award,
  BarChart3,
  Archive,
  Eye,
  Ban,
  AlertCircle,
  UserCheck,
  CalendarCheck,
  Clock4,
} from "lucide-react";

type SortField = "time" | "client" | "service" | "master" | "date" | "price";
type SortOrder = "asc" | "desc";
type StatusFilter = "all" | AppointmentStatus;

// 📦 Компонент пагинации
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
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
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
        className="px-4 py-2 rounded-xl border border-gray-300/50 bg-white/80 text-gray-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50/80 transition-all duration-300"
      >
        ← Назад
      </motion.button>

      {getPageNumbers().map((page, idx) =>
        page === "..." ? (
          <span key={`ellipsis-${idx}`} className="px-3 py-2 text-gray-400 font-medium">
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
                : "border border-gray-300/50 bg-white/80 text-gray-700 hover:bg-gray-50/80"
            }`}
          >
            {page}
          </motion.button>
        )
      )}

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="px-4 py-2 rounded-xl border border-gray-300/50 bg-white/80 text-gray-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50/80 transition-all duration-300"
      >
        Вперёд →
      </motion.button>
    </div>
  );
}

export default function AppointmentsHistoryPage() {
  const [appointments, setAppointments] = useState<IAppointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  const [sortField, setSortField] = useState<SortField>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [dateFilter, setDateFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [masterFilter, setMasterFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  // 📄 Пагинация
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 9;

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

  const loadAllAppointments = async (showLoading = true) => {
    if (showLoading) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }
    setError(null);
    try {
      const data = await appointmentService.getAll();
      
      const validatedData = data.map(item => ({
        ...item,
        price: Number(item.price) || 0,
        clientName: item.clientName || '',
        clientSurname: item.clientSurname || '',
        clientPhone: item.clientPhone || '',
        appointmentTime: item.appointmentTime || new Date().toISOString(),
        service: {
          ...item.service,
          title: item.service?.title || 'Неизвестная услуга',
          duration: Number(item.service?.duration) || 0,
        },
        master: {
          ...item.master,
          name: item.master?.name || 'Неизвестный',
          surname: item.master?.surname || 'мастер',
          id: Number(item.master?.id) || 0,
        }
      }));
      
      setAppointments(validatedData);
    } catch (e) {
      console.error('Ошибка загрузки записей:', e);
      setError("Не удалось загрузить историю записей");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadAllAppointments();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, dateFilter, masterFilter, statusFilter, sortField, sortOrder]);

  const masters = useMemo(() => {
    const uniqueMasters = new Map();
    appointments.forEach((a) => {
      const key = a.master.id;
      if (!uniqueMasters.has(key)) {
        uniqueMasters.set(key, {
          id: a.master.id,
          name: `${a.master.surname} ${a.master.name}`,
        });
      }
    });
    return Array.from(uniqueMasters.values());
  }, [appointments]);

  const filteredAndSorted = useMemo(() => {
    let filtered = appointments;

    if (statusFilter !== "all") {
      filtered = filtered.filter((a) => a.status === statusFilter);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          `${a.clientSurname} ${a.clientName}`.toLowerCase().includes(q) ||
          a.service.title.toLowerCase().includes(q) ||
          `${a.master.surname} ${a.master.name}`.toLowerCase().includes(q) ||
          a.clientPhone.includes(q)
      );
    }

    if (dateFilter) {
      filtered = filtered.filter(
        (a) =>
          new Date(a.appointmentTime).toISOString().split("T")[0] === dateFilter
      );
    }

    if (masterFilter) {
      filtered = filtered.filter((a) => a.master.id === Number(masterFilter));
    }

    const sorted = [...filtered].sort((a, b) => {
      let av: number | string = "";
      let bv: number | string = "";

      switch (sortField) {
        case "time":
          av = new Date(a.appointmentTime).getTime();
          bv = new Date(b.appointmentTime).getTime();
          break;
        case "date":
          av = new Date(a.appointmentTime).setHours(0, 0, 0, 0);
          bv = new Date(b.appointmentTime).setHours(0, 0, 0, 0);
          break;
        case "client":
          av = `${a.clientSurname} ${a.clientName}`.toLowerCase();
          bv = `${b.clientSurname} ${b.clientName}`.toLowerCase();
          break;
        case "service":
          av = a.service.title;
          bv = b.service.title;
          break;
        case "master":
          av = `${a.master.surname} ${a.master.name}`.toLowerCase();
          bv = `${b.master.surname} ${b.master.name}`.toLowerCase();
          break;
        case "price":
          av = Number(a.price) || 0;
          bv = Number(b.price) || 0;
          break;
      }

      if (typeof av === "string") {
        return sortOrder === "asc"
          ? av.localeCompare(bv as string)
          : (bv as string).localeCompare(av);
      }

      return sortOrder === "asc"
        ? (av as number) - (bv as number)
        : (bv as number) - (av as number);
    });

    return sorted;
  }, [appointments, sortField, sortOrder, dateFilter, searchQuery, masterFilter, statusFilter]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSorted.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredAndSorted, currentPage]);

  const totalPages = useMemo(() => {
    return Math.ceil(filteredAndSorted.length / ITEMS_PER_PAGE);
  }, [filteredAndSorted.length]);

  // Статистика
  const stats = useMemo(() => {
    const total = appointments.length;
    
    const revenueRelevantStatuses = [AppointmentStatus.Завершен, AppointmentStatus.Подтвержден];
    
    const totalRevenue = appointments.reduce((sum, a) => {
      if (!revenueRelevantStatuses.includes(a.status)) return sum;
      return sum + (Number(a.price) || 0);
    }, 0);
    
    const paidAppointments = appointments.filter(a => revenueRelevantStatuses.includes(a.status));
    const avgRevenue = paidAppointments.length > 0 ? Math.round(totalRevenue / paidAppointments.length) : 0;
    
    const today = new Date().toISOString().split("T")[0];
    const todayCount = appointments.filter(
      (a) => new Date(a.appointmentTime).toISOString().split("T")[0] === today
    ).length;

    const serviceCounts: Record<string, number> = {};
    appointments.forEach(a => {
      const serviceTitle = a.service?.title || 'Неизвестная услуга';
      serviceCounts[serviceTitle] = (serviceCounts[serviceTitle] || 0) + 1;
    });
    
    const mostPopularService = Object.entries(serviceCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || "—";

    const statusCounts = {
      [AppointmentStatus.Завершен]: appointments.filter(a => a.status === AppointmentStatus.Завершен).length,
      [AppointmentStatus.Отменен]: appointments.filter(a => a.status === AppointmentStatus.Отменен).length,
      [AppointmentStatus.Новый]: appointments.filter(a => a.status === AppointmentStatus.Новый).length,
      [AppointmentStatus.Подтвержден]: appointments.filter(a => a.status === AppointmentStatus.Подтвержден).length,
    };

    return {
      total,
      totalRevenue,
      avgRevenue,
      todayCount,
      mostPopularService,
      statusCounts
    };
  }, [appointments]);

  // Стили
  const glassCls = isDark
    ? "bg-white/[0.07] backdrop-blur-2xl border border-white/[0.1] shadow-[0_4px_24px_rgba(0,0,0,0.2)]"
    : "bg-white border border-gray-200/70 shadow-sm";

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString("ru-RU", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    } catch {
      return "Некорректная дата";
    }
  };

  const formatTime = (iso: string) => {
    try {
      return new Date(iso).toLocaleTimeString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Некорректное время";
    }
  };

  const handleSortChange = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setDateFilter("");
    setMasterFilter("");
    setStatusFilter("all");
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortOrder === "asc" ? "↑" : "↓";
  };

  const exportToCSV = () => {
    const headers = ["Дата", "Время", "Статус", "Клиент", "Телефон", "Услуга", "Мастер", "Цена"];
    const rows = filteredAndSorted.map(a => [
      formatDate(a.appointmentTime),
      formatTime(a.appointmentTime),
      a.status,
      `${a.clientSurname} ${a.clientName}`,
      a.clientPhone,
      a.service.title,
      `${a.master.surname} ${a.master.name}`,
      `${(Number(a.price) || 0).toLocaleString('ru-RU')} ₽`
    ]);
    
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `все_записи_${new Date().toISOString().split("T")[0]}.csv`);
    link.click();
  };

  const getStatusConfig = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.Завершен:
        return {
          label: "Завершена",
          color: "from-emerald-500 to-green-500",
          bgColor: "from-emerald-50 to-green-50",
          textColor: "text-emerald-700",
          icon: <CheckCircle className="w-3 h-3 mr-1" />
        };
      case AppointmentStatus.Отменен:
        return {
          label: "Отменена",
          color: "from-red-500 to-rose-500",
          bgColor: "from-red-50 to-rose-50",
          textColor: "text-red-700",
          icon: <Ban className="w-3 h-3 mr-1" />
        };
      case AppointmentStatus.Новый:
        return {
          label: "Новая",
          color: "from-amber-500 to-orange-500",
          bgColor: "from-amber-50 to-orange-50",
          textColor: "text-amber-700",
          icon: <AlertCircle className="w-3 h-3 mr-1" />
        };
      case AppointmentStatus.Подтвержден:
        return {
          label: "Подтверждена",
          color: "from-blue-500 to-indigo-500",
          bgColor: "from-blue-50 to-indigo-50",
          textColor: "text-blue-700",
          icon: <Eye className="w-3 h-3 mr-1" />
        };
      default:
        return {
          label: status,
          color: "from-gray-500 to-slate-500",
          bgColor: "from-gray-50 to-slate-50",
          textColor: "text-gray-700",
          icon: null
        };
    }
  };

  const STAT_CARDS = [
    {
      num: stats.total,
      label: "Всего записей",
      sub: "за всё время",
      icon: <Archive size={22} />,
      gradient: "from-indigo-500 to-purple-600",
      glow: "shadow-indigo-500/25",
    },
    {
      num: stats.totalRevenue.toLocaleString('ru-RU') + ' ₽',
      label: "Выручка",
      sub: "завершённые + подтвержд.",
      icon: <DollarSign size={22} />,
      gradient: "from-emerald-500 to-teal-500",
      glow: "shadow-emerald-500/25",
    },
    {
      num: stats.avgRevenue.toLocaleString('ru-RU') + ' ₽',
      label: "Средний чек",
      sub: "по оплаченным",
      icon: <BarChart3 size={22} />,
      gradient: "from-blue-500 to-cyan-500",
      glow: "shadow-blue-500/25",
    },
    {
      num: stats.mostPopularService,
      label: "Популярная услуга",
      sub: "чаще всего заказывают",
      icon: <Award size={22} />,
      gradient: "from-amber-500 to-orange-500",
      glow: "shadow-amber-500/25",
    },
  ];

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
                Архив
              </p>
              <h1
                className={`text-4xl md:text-5xl font-black leading-none tracking-tight ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                История записей
              </h1>
              <p
                className={`mt-2 text-sm ${
                  isDark ? "text-white/40" : "text-gray-400"
                }`}
              >
                {stats.total} записей · {stats.statusCounts[AppointmentStatus.Завершен]} завершённых
              </p>
            </div>

            <div className="flex gap-2.5 flex-wrap">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => loadAllAppointments(false)}
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

        {/* STAT CARDS */}
        <div className="grid grid-cols-2 not-sm:grid-cols-1  lg:grid-cols-4 gap-3 mb-6">
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
                  {s.num}
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

        {/* FILTERS */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28 }}
          className={`rounded-2xl p-4 mb-6 transition-all duration-300 ${glassCls}`}
        >
          <div className="flex gap-3 flex-wrap">
            {/* Search */}
            <div className="flex-1 min-w-[200px] relative">
              <Search
                size={16}
                className={`absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${
                  isDark ? "text-white/30" : "text-gray-400"
                }`}
              />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск по клиенту, услуге, мастеру..."
                className={`w-full h-11 pl-10 pr-4 rounded-xl text-sm border outline-none transition-all ${
                  isDark
                    ? "bg-white/[0.07] border-white/[0.1] text-white/90 placeholder-white/25 focus:border-white/20 focus:bg-white/[0.09]"
                    : "bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400 focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-500/10"
                }`}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-lg ${
                    isDark ? "text-white/40 hover:text-white/60" : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Date */}
            <div className="relative">
              <Calendar
                size={15}
                className={`absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${
                  isDark ? "text-white/30" : "text-gray-400"
                }`}
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

            {/* Master filter */}
            <select
              className={`h-11 px-4 rounded-xl text-sm border outline-none cursor-pointer transition-all ${
                isDark
                  ? "bg-white/[0.07] border-white/[0.1] text-white/90 focus:border-white/20"
                  : "bg-gray-50 border-gray-200 text-gray-700 focus:border-blue-300 focus:bg-white"
              }`}
              value={masterFilter}
              onChange={(e) => setMasterFilter(e.target.value)}
            >
              <option value="">Все мастера</option>
              {masters.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
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
              <Filter size={15} />
              Фильтры
              {isFilterOpen ? (
                <ChevronUp size={13} />
              ) : (
                <ChevronDown size={13} />
              )}
            </motion.button>

            {/* Clear all */}
            {(searchQuery || dateFilter || masterFilter || statusFilter !== "all") && (
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
                  className={`pt-4 border-t ${isDark ? "border-white/[0.07]" : "border-gray-100"}`}
                >
                  {/* Status filter */}
                  <div className="mb-4">
                    <p
                      className={`text-xs font-semibold mb-2.5 ${
                        isDark ? "text-white/30" : "text-gray-400"
                      }`}
                    >
                      Статус:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { val: "all", label: "Все", color: "from-gray-500 to-slate-500" },
                        { val: AppointmentStatus.Завершен, label: "Завершённые", color: "from-emerald-500 to-green-500" },
                        { val: AppointmentStatus.Подтвержден, label: "Подтверждённые", color: "from-blue-500 to-indigo-500" },
                        { val: AppointmentStatus.Новый, label: "Новые", color: "from-amber-500 to-orange-500" },
                        { val: AppointmentStatus.Отменен, label: "Отменённые", color: "from-red-500 to-rose-500" },
                      ].map((opt) => (
                        <motion.button
                          key={opt.val}
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.96 }}
                          onClick={() => setStatusFilter(opt.val as StatusFilter)}
                          className={`flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-semibold border transition-all duration-150 ${
                            statusFilter === opt.val
                              ? isDark
                                ? `bg-gradient-to-r ${opt.color} text-white border-transparent`
                                : `bg-gradient-to-r ${opt.color} text-white border-transparent shadow-md`
                              : isDark
                                ? "bg-white/[0.05] border-white/[0.08] text-white/50 hover:text-white/70"
                                : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-white"
                          }`}
                        >
                          {opt.label}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Sort options */}
                  <div>
                    <p
                      className={`text-xs font-semibold mb-2.5 ${
                        isDark ? "text-white/30" : "text-gray-400"
                      }`}
                    >
                      Сортировка:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { field: "date" as SortField, label: "Дата", icon: Calendar },
                        { field: "time" as SortField, label: "Время", icon: Clock },
                        { field: "price" as SortField, label: "Цена", icon: DollarSign },
                        { field: "client" as SortField, label: "Клиент", icon: Users },
                        { field: "master" as SortField, label: "Мастер", icon: UserCheck },
                        { field: "service" as SortField, label: "Услуга", icon: TrendingUp },
                      ].map((opt) => (
                        <motion.button
                          key={opt.field}
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.96 }}
                          onClick={() => handleSortChange(opt.field)}
                          className={`flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-semibold border transition-all duration-150 ${
                            sortField === opt.field
                              ? isDark
                                ? "bg-indigo-500/20 border-indigo-400/30 text-indigo-300"
                                : "bg-blue-100 border-blue-300 text-blue-700"
                              : isDark
                                ? "bg-white/[0.05] border-white/[0.08] text-white/50 hover:text-white/70"
                                : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-white"
                          }`}
                        >
                          
                          {opt.label}
                          {sortField === opt.field && (
                            sortOrder === "asc" ? <ChevronUp size={11} /> : <ChevronDown size={11} />
                          )}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Results info */}
        {!isLoading && !error && (
          <div
            className={`flex items-center justify-between px-1 mb-3 text-xs ${
              isDark ? "text-white/30" : "text-gray-400"
            }`}
          >
            <span>
              {filteredAndSorted.length === appointments.length
                ? `${filteredAndSorted.length} записей`
                : `${filteredAndSorted.length} из ${appointments.length}`}
            </span>
          </div>
        )}

        {/* Cards grid */}
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
              Загрузка истории...
            </p>
          </div>
        ) : error ? (
          <div className={`rounded-2xl p-8 text-center ${glassCls}`}>
            <p className="text-rose-500 font-medium mb-4">{error}</p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => loadAllAppointments(true)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r ${
                isDark
                  ? "from-indigo-500 to-purple-600"
                  : "from-blue-500 to-purple-600"
              }`}
            >
              Повторить
            </motion.button>
          </div>
        ) : filteredAndSorted.length === 0 ? (
          <div className={`rounded-2xl p-16 text-center ${glassCls}`}>
            <div
              className={`w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center ${
                isDark ? "bg-white/[0.07]" : "bg-gray-100"
              }`}
            >
              <History
                size={26}
                className={isDark ? "text-white/25" : "text-gray-300"}
              />
            </div>
            <p
              className={`text-lg font-bold mb-1 ${
                isDark ? "text-white/70" : "text-gray-600"
              }`}
            >
              Записей не найдено
            </p>
            <p
              className={`text-sm ${
                isDark ? "text-white/30" : "text-gray-400"
              }`}
            >
              {searchQuery || dateFilter || masterFilter || statusFilter !== "all"
                ? "Попробуйте изменить параметры поиска"
                : "История записей пока пуста"}
            </p>
            {(searchQuery || dateFilter || masterFilter || statusFilter !== "all") && (
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
                  const statusCfg = getStatusConfig(appointment.status);
                  const isRevenueRelevant = [AppointmentStatus.Завершен, AppointmentStatus.Подтвержден].includes(appointment.status);

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
                          <div className={`text-xs font-medium mb-1 ${
                            isDark ? "text-white/40" : "text-gray-400"
                          }`}>
                            {formatDate(appointment.appointmentTime)}
                          </div>
                          <div className={`text-xl font-bold flex items-center gap-2 ${
                            isDark ? "text-white" : "text-gray-900"
                          }`}>
                            <Clock4 size={16} className={isDark ? "text-white/50" : "text-gray-400"} />
                            {formatTime(appointment.appointmentTime)}
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${statusCfg.bgColor} ${statusCfg.textColor} flex items-center border ${
                          isDark ? "border-white/[0.1]" : "border-gray-200/50"
                        }`}>
                          {statusCfg.icon}
                          {statusCfg.label}
                        </span>
                      </div>

                      {/* Client */}
                      <div className="mb-4">
                        <div className={`text-xs font-medium mb-2 ${
                          isDark ? "text-white/30" : "text-gray-400"
                        }`}>
                          Клиент
                        </div>
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm bg-gradient-to-br ${
                            isDark ? "from-indigo-500/50 to-purple-600/50" : "from-blue-500 to-purple-600"
                          }`}>
                            {appointment.clientName[0]?.toUpperCase() || "К"}
                          </div>
                          <div>
                            <div className={`text-sm font-bold ${
                              isDark ? "text-white" : "text-gray-900"
                            }`}>
                              {appointment.clientSurname} {appointment.clientName}
                            </div>
                            <div className={`text-xs ${
                              isDark ? "text-white/40" : "text-gray-400"
                            }`}>
                              {appointment.clientPhone}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Service and master */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className={`rounded-xl p-3 ${
                          isDark ? "bg-white/[0.04]" : "bg-gray-50"
                        }`}>
                          <div className={`text-xs mb-1 ${
                            isDark ? "text-white/30" : "text-gray-400"
                          }`}>
                            Услуга
                          </div>
                          <div className={`text-sm font-bold truncate ${
                            isDark ? "text-white" : "text-gray-900"
                          }`}>
                            {appointment.service.title}
                          </div>
                          <div className={`text-xs mt-1 ${
                            isDark ? "text-white/30" : "text-gray-400"
                          }`}>
                            {appointment.service.duration} мин.
                          </div>
                        </div>
                        <div className={`rounded-xl p-3 ${
                          isDark ? "bg-white/[0.04]" : "bg-gray-50"
                        }`}>
                          <div className={`text-xs mb-1 ${
                            isDark ? "text-white/30" : "text-gray-400"
                          }`}>
                            Мастер
                          </div>
                          <div className={`text-sm font-bold ${
                            isDark ? "text-white" : "text-gray-900"
                          }`}>
                            {appointment.master.surname} {appointment.master.name}
                          </div>
                        </div>
                      </div>

                      {/* Price */}
                      <div className={`flex items-center justify-between pt-3 border-t ${
                        isDark ? "border-white/[0.07]" : "border-gray-100"
                      }`}>
                        <div>
                          <div className={`text-xs ${
                            isDark ? "text-white/30" : "text-gray-400"
                          }`}>
                            Стоимость
                          </div>
                          <div className={`text-lg font-bold ${
                            isRevenueRelevant
                              ? isDark ? "text-emerald-400" : "text-emerald-600"
                              : isDark ? "text-white/40" : "text-gray-400"
                          }`}>
                            {price.toLocaleString('ru-RU')} ₽
                          </div>
                        </div>
                        {!isRevenueRelevant && (
                          <span className={`text-[10px] px-2 py-1 rounded ${
                            isDark ? "bg-white/[0.05] text-white/30" : "bg-gray-100 text-gray-400"
                          }`}>
                            не в выручке
                          </span>
                        )}
                        <div className={`text-xs ${
                          isDark ? "text-white/20" : "text-gray-300"
                        }`}>
                          ID: {appointment.id}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Pagination */}
            {filteredAndSorted.length > ITEMS_PER_PAGE && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}

            {/* Pagination info */}
            {filteredAndSorted.length > 0 && (
              <div className={`text-center text-sm mt-2 ${
                isDark ? "text-white/30" : "text-gray-400"
              }`}>
                Страница {currentPage} из {totalPages} • 
                Показано {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
                {Math.min(currentPage * ITEMS_PER_PAGE, filteredAndSorted.length)} из {filteredAndSorted.length}
              </div>
            )}
          </>
        )}

        {/* Footer legend */}
        {!isLoading && !error && filteredAndSorted.length > 0 && (
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
                { color: "bg-blue-400", label: "Подтверждённые" },
                { color: "bg-amber-400", label: "Новые" },
                { color: "bg-rose-400", label: "Отменённые" },
              ].map((l) => (
                <div key={l.label} className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${l.color}`} />
                  {l.label}
                </div>
              ))}
            </div>
            <span>Выручка: {stats.totalRevenue.toLocaleString('ru-RU')} ₽</span>
          </motion.div>
        )}
      </div>
    </div>
  );
}