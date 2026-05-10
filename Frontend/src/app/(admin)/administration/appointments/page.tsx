"use client";

import { useState, useEffect, useMemo } from "react";
import AppointmentItem from "./AppointmentItem";
import AppointmentConfirmWindow from "./appointmentsConfirWnd";
import NewAppointmentsWindow from "./newAppointmentsWindow";
import { useAdminAppointmentNotifications } from "@/app/components/ui/admin/appointments/AdminAppointmentNotifications";
import { appointmentService } from "@/services/appointment/appointment.service";
import { IAppointment, AppointmentStatus } from "@/types/appointment.types";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Calendar,
  Plus,
  RefreshCw,
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronUp,
  Zap,
  CalendarCheck,
  CheckCircle2,
  Clock4,
  AlertCircle,
  Download,
  UserCheck,
  Clock,
  Users,
  TrendingUp,
} from "lucide-react";

type SortField = "time" | "client" | "service" | "date" | "master";
type SortOrder = "asc" | "desc";

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState<IAppointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDark, setIsDark] = useState(false);

  const [isTodayWindowOpen, setTodayWindowOpen] = useState(false);
  const [isConfirmWindowOpen, setIsConfirmWindowOpen] = useState(false);
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] =
    useState<IAppointment | null>(null);

  const [sortField, setSortField] = useState<SortField>("time");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [dateFilter, setDateFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const { latestAppointment, latestEventKey } = useAdminAppointmentNotifications();

  useEffect(() => {
    if (!latestAppointment || !latestEventKey) {
      return;
    }

    setAppointments((prev) => {
      if (prev.some((appointment) => appointment.id === latestAppointment.id)) {
        return prev;
      }

      return [latestAppointment, ...prev];
    });
  }, [latestAppointment, latestEventKey]);


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

  const loadAppointments = async () => {
    setIsRefreshing(true);
    setError(null);
    try {
      setAppointments(await appointmentService.getAll());
    } catch {
      setError("Не удалось загрузить записи.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const confirmed = useMemo(
    () =>
      appointments.filter((a) => a.status === AppointmentStatus.Подтвержден),
    [appointments],
  );
  const today = useMemo(() => {
    const d = new Date().toISOString().split("T")[0];
    return confirmed.filter(
      (a) => new Date(a.appointmentTime).toISOString().split("T")[0] === d,
    );
  }, [confirmed]);
  const pending = useMemo(
    () => appointments.filter((a) => a.status === AppointmentStatus.Новый),
    [appointments],
  );
  const completed = useMemo(
    () => appointments.filter((a) => a.status === AppointmentStatus.Завершен),
    [appointments],
  );

  const sortList = (list: IAppointment[]) =>
    [...list].sort((a, b) => {
      let av: string | number = "",
        bv: string | number = "";
      switch (sortField) {
        case "time":
          av = new Date(a.appointmentTime).getTime();
          bv = new Date(b.appointmentTime).getTime();
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
        case "date":
          av = new Date(a.appointmentTime).setHours(0, 0, 0, 0);
          bv = new Date(b.appointmentTime).setHours(0, 0, 0, 0);
          break;
      }
      if (typeof av === "string")
        return sortOrder === "asc"
          ? av.localeCompare(bv as string)
          : (bv as string).localeCompare(av);
      return sortOrder === "asc"
        ? (av as number) - (bv as number)
        : (bv as number) - (av as number);
    });

  const filtered = useMemo(() => {
    let list = confirmed;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (a) =>
          `${a.clientSurname} ${a.clientName}`.toLowerCase().includes(q) ||
          a.service.title.toLowerCase().includes(q) ||
          `${a.master.surname} ${a.master.name}`.toLowerCase().includes(q) ||
          a.clientPhone.includes(q),
      );
    }
    if (dateFilter)
      list = list.filter(
        (a) =>
          new Date(a.appointmentTime).toISOString().split("T")[0] ===
          dateFilter,
      );
    return sortList(list);
  }, [confirmed, sortField, sortOrder, dateFilter, searchQuery]);

  const fmt = (s: string) =>
    new Date(s).toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  const fmtT = (s: string) =>
    new Date(s).toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    });
  const toItem = (a: IAppointment) => ({
    id: a.id.toString(),
    clientName: `${a.clientSurname} ${a.clientName}`,
    service: a.service.title,
    time: fmtT(a.appointmentTime),
    price: `${a.price.toLocaleString()} ₽`,
    master: `${a.master.surname} ${a.master.name}`,
    status: a.status,
    date: fmt(a.appointmentTime),
    duration: a.service.duration,
    rawDateTime: a.appointmentTime,
    clientPhone: a.clientPhone,
  });

  const handleConfirm = async (id: string) => {
    try {
      await appointmentService.update(Number(id), {
        status: AppointmentStatus.Подтвержден,
      });
      await loadAppointments();
      setIsConfirmWindowOpen(false);
    } catch {
      alert("Ошибка");
    }
  };
  const handleComplete = async (id: string) => {
    try {
      await appointmentService.complete(Number(id));
      await loadAppointments();
    } catch {
      alert("Ошибка");
    }
  };
  const handleCancel = async (id: string) => {
    try {
      await appointmentService.update(Number(id), {
        status: AppointmentStatus.Отменен,
      });
      await loadAppointments();
      setIsConfirmWindowOpen(false);
      setTodayWindowOpen(false);
    } catch {
      alert("Ошибка");
    }
  };
  const handleEdit = (item: any) => {
    const a = appointments.find((x) => x.id.toString() === item.id);
    if (a) {
      setEditingAppointment(a);
      setIsNewAppointmentOpen(true);
    }
  };
  const handleDelete = async (id: string) => {
    try {
      await appointmentService.delete(Number(id));
      await loadAppointments();
    } catch {
      alert("Ошибка");
    }
  };
  const handleSort = (f: SortField) => {
    if (sortField === f) setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    else {
      setSortField(f);
      setSortOrder("asc");
    }
  };

  // Shared style helpers
  const glassCls = isDark
    ? "bg-white/[0.07] backdrop-blur-2xl border border-white/[0.1] shadow-[0_4px_24px_rgba(0,0,0,0.2)]"
    : "bg-white border border-gray-200/70 shadow-sm";

  const SORT_OPTS: {
    field: SortField;
    label: string;
    icon: React.ReactNode;
  }[] = [
    { field: "time", label: "Время", icon: <Clock size={14} /> },
    { field: "date", label: "Дата", icon: <Calendar size={14} /> },
    { field: "client", label: "Клиент", icon: <Users size={14} /> },
    { field: "master", label: "Мастер", icon: <UserCheck size={14} /> },
    { field: "service", label: "Услуга", icon: <TrendingUp size={14} /> },
  ];

  const STAT_CARDS = [
    {
      num: pending.length,
      label: "Новых",
      sub: "ждут подтверждения",
      icon: <AlertCircle size={22} />,
      gradient: "from-amber-500 to-orange-500",
      glow: "shadow-amber-500/25",
      onClick: () => setIsConfirmWindowOpen(true),
      pulse: pending.length > 0,
    },
    {
      num: today.length,
      label: "Сегодня",
      sub: "подтверждённых",
      icon: <CalendarCheck size={22} />,
      gradient: "from-emerald-500 to-teal-500",
      glow: "shadow-emerald-500/25",
      onClick: () => setTodayWindowOpen(true),
      pulse: false,
    },
    {
      num: confirmed.length,
      label: "Активных",
      sub: "в очереди",
      icon: <CheckCircle2 size={22} />,
      gradient: "from-blue-500 to-indigo-500",
      glow: "shadow-blue-500/25",
      onClick: undefined,
      pulse: false,
    },
    {
      num: completed.length,
      label: "Завершено",
      sub: "всего выполнено",
      icon: <Clock4 size={22} />,
      gradient: "from-purple-500 to-pink-500",
      glow: "shadow-purple-500/25",
      onClick: undefined,
      pulse: false,
    },
  ];

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <div className="max-w-9xl mx-auto">
        {/* ── HEADER ── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p
                className={`text-xs font-semibold tracking-widest uppercase mb-2 ${isDark ? "text-white/30" : "text-gray-400"}`}
              >
                Панель управления
              </p>
              <h1
                className={`text-4xl md:text-5xl font-black leading-none tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}
              >
                Записи
              </h1>
              <p
                className={`mt-2 text-sm ${isDark ? "text-white/40" : "text-gray-400"}`}
              >
                {confirmed.length} активных · {pending.length} новых
              </p>
            </div>

            <div className="flex gap-2.5 flex-wrap">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={loadAppointments}
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
                onClick={() => {
                  setEditingAppointment(null);
                  setIsNewAppointmentOpen(true);
                }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 shadow-lg ${
                  isDark
                    ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-purple-500/25 hover:shadow-purple-500/40"
                    : "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-blue-500/20 hover:shadow-blue-500/35"
                }`}
              >
                <Plus size={17} />
                Новая запись
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* ── STAT CARDS ── */}
        <div className="grid grid-cols-2 not-sm:grid-cols-1 lg:grid-cols-4 gap-3 mb-6">
          {STAT_CARDS.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              whileHover={{
                y: s.onClick ? -3 : 0,
                scale: s.onClick ? 1.02 : 1,
              }}
              whileTap={{ scale: s.onClick ? 0.98 : 1 }}
              onClick={s.onClick}
              className={`relative rounded-2xl p-5 overflow-hidden transition-all duration-300 ${
                s.onClick ? "cursor-pointer" : ""
              } ${
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
                {s.pulse && s.num > 0 && (
                  <span className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                )}
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

        {/* ── SEARCH & FILTER ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28 }}
          className={`rounded-2xl p-4 mb-4 transition-all duration-300 ${glassCls}`}
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
                onClick={() => {
                  setSearchQuery("");
                  setDateFilter("");
                }}
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
                          onClick={() => handleSort(opt.field)}
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

        {/* ── RESULT META ── */}
        {!isLoading && !error && (
          <div
            className={`flex items-center justify-between px-1 mb-3 text-xs ${isDark ? "text-white/30" : "text-gray-400"}`}
          >
            <span>
              {filtered.length === confirmed.length
                ? `${filtered.length} записей`
                : `${filtered.length} из ${confirmed.length}`}
            </span>
            <button
              className={`flex items-center gap-1.5 font-medium transition-colors ${isDark ? "text-white/30 hover:text-white/50" : "text-gray-400 hover:text-gray-600"}`}
            >
              <Download size={13} /> Экспорт CSV
            </button>
          </div>
        )}

        {/* ── LIST ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
        >
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div
                className={`w-10 h-10 rounded-full border-3 border-t-transparent animate-spin mb-4 ${
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
                onClick={loadAppointments}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r ${
                  isDark
                    ? "from-indigo-500 to-purple-600"
                    : "from-blue-500 to-purple-600"
                }`}
              >
                Повторить
              </motion.button>
            </div>
          ) : filtered.length === 0 ? (
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
                {confirmed.length === 0
                  ? "Нет активных записей"
                  : "Ничего не найдено"}
              </p>
              <p
                className={`text-sm ${isDark ? "text-white/30" : "text-gray-400"}`}
              >
                {searchQuery || dateFilter
                  ? "Попробуйте изменить параметры поиска"
                  : "Создайте первую запись"}
              </p>
              {(searchQuery || dateFilter) && (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  onClick={() => {
                    setSearchQuery("");
                    setDateFilter("");
                  }}
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
                {filtered.map((a, i) => (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ delay: Math.min(i * 0.04, 0.3) }}
                  >
                    <AppointmentItem
                      appointment={toItem(a)}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onComplete={handleComplete}
                      onCancel={handleCancel}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>

        {/* ── FOOTER ── */}
        {!isLoading && !error && filtered.length > 0 && (
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

      {/* ── MODALS ── */}
      <AnimatePresence>
        {isConfirmWindowOpen && (
          <AppointmentConfirmWindow
            title="Новые записи"
            isOpen={isConfirmWindowOpen}
            onClose={() => setIsConfirmWindowOpen(false)}
            pendingAppointments={pending.map(toItem)}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
            windowType="new"
          />
        )}
        {isTodayWindowOpen && (
          <AppointmentConfirmWindow
            title="Записи на сегодня"
            isOpen={isTodayWindowOpen}
            onClose={() => setTodayWindowOpen(false)}
            pendingAppointments={today.map(toItem)}
            onCancel={handleCancel}
            windowType="confirmed"
          />
        )}
        {isNewAppointmentOpen && (
          <NewAppointmentsWindow
            isOpen={isNewAppointmentOpen}
            onClose={() => {
              setIsNewAppointmentOpen(false);
              setEditingAppointment(null);
            }}
            onSuccess={loadAppointments}
            mode={editingAppointment ? "edit" : "create"}
            initialData={
              editingAppointment
                ? {
                    id: editingAppointment.id,
                    clientSurname: editingAppointment.clientSurname,
                    clientName: editingAppointment.clientName,
                    clientPhone: editingAppointment.clientPhone,
                    masterId: editingAppointment.master.id,
                    serviceId: editingAppointment.service.id,
                    appointmentTime: editingAppointment.appointmentTime,
                  }
                : undefined
            }
          />
        )}
      </AnimatePresence>
    </div>
  );
}
