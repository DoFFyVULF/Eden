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
  ArrowUpRight,
  TrendingUp,
  Flame,
  Activity,
} from "lucide-react";

type SortField = "time" | "client" | "service" | "date";
type SortOrder = "asc" | "desc";

export default function MasterAppointments() {
  const [currentUser, setCurrentUser] = useState<IUser | null>(null);
  const [appointments, setAppointments] = useState<IAppointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [sortField, setSortField] = useState<SortField>("time");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

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

      setAppointments(masterAppointments);
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

  const confirmedAppointments = useMemo(() => {
    return appointments.filter(app => app.status === AppointmentStatus.Подтвержден);
  }, [appointments]);

  const todayAppointments = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return confirmedAppointments.filter(
      (app) =>
        new Date(app.appointmentTime).toISOString().split("T")[0] === today
    );
  }, [confirmedAppointments]);

  const newAppointments = useMemo(() => {
    return appointments.filter((app) => app.status === AppointmentStatus.Новый);
  }, [appointments]);

  const completedAppointments = useMemo(() => {
    return appointments.filter((app) => app.status === AppointmentStatus.Завершен);
  }, [appointments]);

  const sortAppointments = (list: IAppointment[]): IAppointment[] => {
    const sorted = [...list].sort((a, b) => {
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
  };

  const filteredAndSortedAppointments = useMemo(() => {
    let filtered = confirmedAppointments;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (app) =>
          `${app.clientSurname} ${app.clientName}`.toLowerCase().includes(q) ||
          app.service.title.toLowerCase().includes(q) ||
          app.clientPhone.includes(q),
      );
    }

    if (dateFilter) {
      filtered = filtered.filter(
        (app) =>
          new Date(app.appointmentTime).toISOString().split("T")[0] ===
          dateFilter,
      );
    }

    return sortAppointments(filtered);
  }, [
    confirmedAppointments,
    sortField,
    sortOrder,
    dateFilter,
    searchQuery,
  ]);

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
  };

  const formatDate = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
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
      case AppointmentStatus.Новый:
        return { dot: "bg-amber-400", label: "Новый", color: "text-amber-400" };
      case AppointmentStatus.Подтвержден:
        return { dot: "bg-emerald-400", label: "Подтверждён", color: "text-emerald-400" };
      case AppointmentStatus.Завершен:
        return { dot: "bg-blue-400", label: "Завершён", color: "text-blue-400" };
      case AppointmentStatus.Отменен:
        return { dot: "bg-rose-400", label: "Отменён", color: "text-rose-400" };
      default:
        return { dot: "bg-gray-400", label: status, color: "text-gray-400" };
    }
  };

  const glassCls = isDark
    ? "bg-white/[0.07] backdrop-blur-2xl border border-white/[0.1] shadow-lg"
    : "bg-white border border-gray-200/70 shadow-sm";

  const STAT_CARDS = [
    {
      num: todayAppointments.length,
      label: "Сегодня",
      sub: "подтверждённых",
      icon: <CalendarDays size={22} />,
      gradient: "from-emerald-500 to-teal-500",
      glow: "shadow-emerald-500/25",
    },
    {
      num: newAppointments.length,
      label: "Новых",
      sub: "ждут подтверждения",
      icon: <AlertCircle size={22} />,
      gradient: "from-amber-500 to-orange-500",
      glow: "shadow-amber-500/25",
      pulse: newAppointments.length > 0,
    },
    {
      num: confirmedAppointments.length,
      label: "Активных",
      sub: "в очереди",
      icon: <CheckCircle2 size={22} />,
      gradient: "from-blue-500 to-indigo-500",
      glow: "shadow-blue-500/25",
    },
    {
      num: completedAppointments.length,
      label: "Завершено",
      sub: "всего выполнено",
      icon: <Clock4 size={22} />,
      gradient: "from-purple-500 to-pink-500",
      glow: "shadow-purple-500/25",
    },
  ];

  const SORT_OPTS: { field: SortField; label: string; icon: React.ReactNode }[] = [
    { field: "time", label: "Время", icon: <Clock size={14} /> },
    { field: "date", label: "Дата", icon: <Calendar size={14} /> },
    { field: "client", label: "Клиент", icon: <Users size={14} /> },
    { field: "service", label: "Услуга", icon: <TrendingUp size={14} /> },
  ];

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
                  <Activity size={11} />
                  Управление записями
                </div>
              </div>

              <h1
                className={`text-4xl md:text-5xl lg:text-6xl font-black leading-none tracking-tight mb-3 ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                Мои{" "}
                <span
                  className={`${
                    isDark
                      ? "bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
                      : "bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                  }`}
                >
                  записи
                </span>
              </h1>
              <p
                className={`text-base ${isDark ? "text-white/40" : "text-gray-400"}`}
              >
                {confirmedAppointments.length} активных · {newAppointments.length} новых
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
                Ключевые показатели
              </p>
            </div>
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                isDark
                  ? "border-white/[0.08] text-white/30"
                  : "border-gray-200 text-gray-400"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {STAT_CARDS.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ y: -3, scale: 1.02 }}
                className={`relative rounded-2xl p-5 overflow-hidden transition-all duration-300 ${
                  isDark
                    ? `bg-white/[0.07] border border-white/[0.1] backdrop-blur-xl hover:bg-white/[0.1] shadow-lg ${s.glow}`
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
                  {"pulse" in s && s.pulse && s.num > 0 && (
                    <span className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                  )}
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

            {/* Sort toggle */}
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
              Сортировка
              {isFilterOpen ? (
                <ChevronUp size={13} />
              ) : (
                <ChevronDown size={13} />
              )}
            </motion.button>

            {/* Clear all */}
            {(searchQuery || dateFilter) && (
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

          {/* Sort pills */}
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
                    Сортировать по:
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
              {filteredAndSortedAppointments.length === confirmedAppointments.length
                ? `${filteredAndSortedAppointments.length} записей`
                : `${filteredAndSortedAppointments.length} из ${confirmedAppointments.length}`}
            </span>
          </div>
        )}

        {/* ── APPOINTMENTS LIST ────────────────────────────────── */}
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
                Загрузка записей...
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
          ) : confirmedAppointments.length === 0 ? (
            <div className={`rounded-2xl p-16 text-center ${glassCls}`}>
              <div
                className={`w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center ${isDark ? "bg-white/[0.07]" : "bg-gray-100"}`}
              >
                <CalendarDays
                  size={26}
                  className={isDark ? "text-white/25" : "text-gray-300"}
                />
              </div>
              <p
                className={`text-lg font-bold mb-1 ${isDark ? "text-white/70" : "text-gray-600"}`}
              >
                Нет подтверждённых записей
              </p>
              <p
                className={`text-sm ${isDark ? "text-white/30" : "text-gray-400"}`}
              >
                Записи появятся после подтверждения администратором
              </p>
            </div>
          ) : filteredAndSortedAppointments.length === 0 ? (
            <div className={`rounded-2xl p-16 text-center ${glassCls}`}>
              <div
                className={`w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center ${isDark ? "bg-white/[0.07]" : "bg-gray-100"}`}
              >
                <Search
                  size={26}
                  className={isDark ? "text-white/25" : "text-gray-300"}
                />
              </div>
              <p
                className={`text-lg font-bold mb-1 ${isDark ? "text-white/70" : "text-gray-600"}`}
              >
                Ничего не найдено
              </p>
              <p
                className={`text-sm ${isDark ? "text-white/30" : "text-gray-400"}`}
              >
                Попробуйте изменить параметры поиска
              </p>
              {(searchQuery || dateFilter) && (
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
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {filteredAndSortedAppointments.map((appointment, index) => (
                  <motion.div
                    key={appointment.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ delay: Math.min(index * 0.04, 0.3) }}
                    whileHover={{ x: 4 }}
                    className={`rounded-2xl p-5 transition-all duration-200 cursor-default group ${
                      isDark
                        ? "bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.08] hover:border-white/[0.12]"
                        : "bg-white border border-gray-200/70 hover:shadow-md"
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      {/* Left: Time + Client */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-4">
                          {/* Time block */}
                          <div
                            className={`text-center py-3 px-4 rounded-xl font-black text-sm leading-none flex-shrink-0 ${
                              isDark
                                ? "bg-white/[0.07] text-white/90"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            <div>{formatTime(appointment.appointmentTime)}</div>
                            <div className={`text-xs mt-1 font-semibold ${isDark ? "text-white/40" : "text-gray-500"}`}>
                              {formatDate(appointment.appointmentTime)}
                            </div>
                          </div>

                          {/* Client info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              {/* Avatar */}
                              <div
                                className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0 bg-gradient-to-br ${
                                  isDark
                                    ? "from-indigo-500 to-purple-600"
                                    : "from-blue-500 to-purple-600"
                                }`}
                              >
                                {appointment.clientName[0]?.toUpperCase() || "К"}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div
                                  className={`font-bold text-base truncate ${isDark ? "text-white/90" : "text-gray-800"}`}
                                >
                                  {appointment.clientSurname} {appointment.clientName}
                                </div>
                                <div
                                  className={`text-xs ${isDark ? "text-white/35" : "text-gray-400"}`}
                                >
                                  {appointment.clientPhone}
                                </div>
                              </div>
                            </div>

                            {/* Service */}
                            <div
                              className={`text-sm font-semibold ${isDark ? "text-white/70" : "text-gray-600"}`}
                            >
                              {appointment.service.title}
                            </div>
                            <div
                              className={`text-xs mt-0.5 ${isDark ? "text-white/30" : "text-gray-400"}`}
                            >
                              {appointment.service.duration} мин.
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right: Price + Status */}
                      <div className="flex items-center gap-4 lg:flex-shrink-0">
                        {/* Price */}
                        <div className="text-right">
                          <div
                            className={`text-xl font-black ${
                              isDark ? "text-emerald-400" : "text-emerald-600"
                            }`}
                          >
                            {appointment.price.toLocaleString()} ₽
                          </div>
                          <div
                            className={`text-xs ${isDark ? "text-white/30" : "text-gray-400"}`}
                          >
                            Стоимость
                          </div>
                        </div>

                        {/* Status */}
                        <div
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl ${
                            isDark
                              ? "bg-white/[0.06] border border-white/[0.08]"
                              : "bg-gray-50 border border-gray-200/60"
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${getStatusInfo(appointment.status).dot}`}
                          />
                          <span
                            className={`text-xs font-semibold ${getStatusInfo(appointment.status).color}`}
                          >
                            {getStatusInfo(appointment.status).label}
                          </span>
                          <ArrowUpRight
                            size={12}
                            className={`opacity-0 group-hover:opacity-100 transition-opacity ${isDark ? "text-white/30" : "text-gray-400"}`}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>

        {/* ── FOOTER ──────────────────────────────────────────── */}
        {!isLoading && !error && filteredAndSortedAppointments.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className={`mt-8 pt-6 border-t flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs ${
              isDark
                ? "border-white/[0.07] text-white/25"
                : "border-gray-100 text-gray-400"
            }`}
          >
            <div className="flex flex-wrap items-center gap-5">
              {[
                { color: "bg-amber-400", label: "Новые" },
                { color: "bg-emerald-400", label: "Подтверждённые" },
                { color: "bg-indigo-400", label: "Завершённые" },
                { color: "bg-rose-400", label: "Отменённые" },
              ].map((l) => (
                <div key={l.label} className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${l.color}`} />
                  {l.label}
                </div>
              ))}
            </div>
            <span>Загружено: {appointments.length} записей</span>
          </motion.div>
        )}
      </div>
    </div>
  );
}
