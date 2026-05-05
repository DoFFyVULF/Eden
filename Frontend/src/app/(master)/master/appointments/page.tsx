"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { appointmentService } from "@/services/appointment/appointment.service";
import { userService } from "@/services/user/user.service";
import { masterService } from "@/services/master/master.service";
import { IAppointment, AppointmentStatus } from "@/types/appointment.types";
import { IUser } from "@/types/user.types";
import { IMaster } from "@/types/masters.type";
import AppointmentCard from "@/app/components/ui/master/AppointmentCard";
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
  CalendarRange,
  SlidersHorizontal,
  X,
  UserCheck,
  Clock4,
  ArrowUpRight,
  TrendingUp,
  Activity,
  Filter,
} from "lucide-react";

type SortField = "status" | "time" | "client" | "service" | "date";
type SortOrder = "asc" | "desc";

export default function MasterAppointments() {
  const [currentUser, setCurrentUser] = useState<IUser | null>(null);
  const [masterInfo, setMasterInfo] = useState<IMaster | null>(null);
  const [appointments, setAppointments] = useState<IAppointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(false);

  // Filters & Sort
  const [sortField, setSortField] = useState<SortField>("time");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

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
      // 1. Get User
      const userData = await userService.getMe();
      setCurrentUser(userData.data);

      // 2. Get Master Info (Optional but good for header)
      try {
        if (userData.data.masterId) {
          const allMasters = await masterService.getAll();
          const currentMaster = allMasters.find(
            (m) => m.id === userData.data.masterId
          );
          setMasterInfo(currentMaster || null);
        }
      } catch (err) {
        console.warn("Не удалось загрузить данные мастера:", err);
      }

      // 3. Get Appointments
      const allAppointments = await appointmentService.getAll();
      
      // Filter for current master and "Подтвержден" status only
      const masterAppointments = allAppointments.filter((appointment) => {
        // Depending on your backend structure, adjust this check
        const appMasterId = appointment.master?.id || appointment.master;
        const isMasterAppointment = appMasterId === (userData.data.masterId || userData.data.id);
        const isConfirmed = appointment.status === AppointmentStatus.Подтвержден;
        return isMasterAppointment && isConfirmed;
      });

      setAppointments(masterAppointments);
    } catch (err) {
      console.error("Ошибка загрузки данных:", err);
      setError("Не удалось загрузить данные. Проверьте соединение.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // --- Logic Helpers ---

  const sortAppointments = (apps: IAppointment[]): IAppointment[] => {
    const sorted = [...apps].sort((a, b) => {
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
        case "status":
          const statusOrder = [
            AppointmentStatus.Новый,
            AppointmentStatus.Подтвержден,
            AppointmentStatus.Завершен,
            AppointmentStatus.Отменен,
          ];
          aValue = statusOrder.indexOf(a.status);
          bValue = statusOrder.indexOf(b.status);
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
    let filtered = appointments;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (app) =>
          `${app.clientSurname} ${app.clientName}`.toLowerCase().includes(q) ||
          app.service.title.toLowerCase().includes(q) ||
          app.clientPhone.includes(q)
      );
    }

    if (statusFilter) {
      const statusMap: Record<string, AppointmentStatus> = {
        new: AppointmentStatus.Новый,
        confirmed: AppointmentStatus.Подтвержден,
        completed: AppointmentStatus.Завершен,
        cancelled: AppointmentStatus.Отменен,
      };
      filtered = filtered.filter(
        (app) => app.status === statusMap[statusFilter]
      );
    }

    if (dateFilter) {
      filtered = filtered.filter(
        (app) =>
          new Date(app.appointmentTime).toISOString().split("T")[0] ===
          dateFilter
      );
    }

    return sortAppointments(filtered);
  }, [
    appointments,
    sortField,
    sortOrder,
    statusFilter,
    dateFilter,
    searchQuery,
  ]);

  // Stats Calculation
  const stats = useMemo(() => {
    // Filter to only "Подтвержден" appointments for master
    const confirmedApps = appointments;
    
    const todayStr = new Date().toISOString().split("T")[0];
    
    const todayApps = confirmedApps.filter(
      (app) =>
        new Date(app.appointmentTime).toISOString().split("T")[0] === todayStr
    );

    const upcomingApps = confirmedApps.filter(
      (app) =>
        new Date(app.appointmentTime) >= new Date()
    );

    const newApps = confirmedApps.filter(
      (app) => app.status === AppointmentStatus.Новый
    );

    return {
      total: confirmedApps.length,
      today: todayApps.length,
      upcoming: upcomingApps.length,
      new: newApps.length,
    };
  }, [appointments]);

  const clearFilters = () => {
    setStatusFilter("");
    setDateFilter("");
    setSearchQuery("");
  };

  const formatDate = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const formatTime = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Styling Constants
  const glassCls = isDark
    ? "bg-white/[0.07] backdrop-blur-2xl border border-white/[0.1] shadow-lg"
    : "bg-white border border-gray-200/70 shadow-sm";

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 relative">
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
            {/* Left — title */}
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
                  Записи
                </div>
              </div>

              <h1
                className={`text-4xl md:text-5xl lg:text-6xl font-black leading-none tracking-tight mb-3 ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                Мои{ " " }
                <span
                  className={`${
                    isDark
                      ? "bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
                      : "bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                  }`}
                >
                  клиенты
                </span>
              </h1>
              <p
                className={`text-base ${isDark ? "text-white/40" : "text-gray-400"}`}
              >
                {masterInfo
                  ? `${masterInfo.surname} ${masterInfo.name}`
                  : currentUser?.name || currentUser?.login || "Мастер"}
                { " " }· {stats.total} записей всего
              </p>
            </div>

            {/* Right — actions */}
            <div className="flex gap-2.5 flex-wrap">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-200 ${
                   showFilters
                    ? isDark 
                      ? "bg-indigo-500/20 border-indigo-500/30 text-indigo-300"
                      : "bg-blue-50 border-blue-200 text-blue-600"
                    : isDark
                      ? "bg-white/[0.07] border-white/[0.1] text-white/60 hover:text-white/80 hover:bg-white/[0.1]"
                      : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50 shadow-sm"
                }`}
              >
                <SlidersHorizontal size={15} />
                Фильтры
              </motion.button>

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

        {/* ── FILTERS PANEL (Collapsible) ────────────────────── */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className={`overflow-hidden rounded-2xl ${glassCls}`}
            >
              <div className="p-5 space-y-4">
                 <div className="flex flex-col lg:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                      <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Поиск по клиентам, услугам..."
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none transition-all ${
                          isDark 
                            ? "bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-blue-500/50" 
                            : "bg-gray-50 border-gray-200 text-gray-900 focus:bg-white"
                        }`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>

                    {/* Status Select */}
                    <select
                      className={`px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer ${
                         isDark 
                           ? "bg-white/5 border-white/10 text-white focus:border-blue-500/50" 
                           : "bg-gray-50 border-gray-200 text-gray-900 focus:bg-white"
                      }`}
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="">Все статусы</option>
                      <option value="new">Новые</option>
                      <option value="confirmed">Подтвержденные</option>
                      <option value="completed">Завершенные</option>
                      <option value="cancelled">Отмененные</option>
                    </select>

                    {/* Date Input */}
                    <input
                      type="date"
                      className={`px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none transition-all ${
                         isDark 
                           ? "bg-white/5 border-white/10 text-white focus:border-blue-500/50 [color-scheme:dark]" 
                           : "bg-gray-50 border-gray-200 text-gray-900 focus:bg-white"
                      }`}
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                    />

                    {(statusFilter || dateFilter || searchQuery) && (
                      <button
                        onClick={clearFilters}
                        className="px-4 py-3 text-red-500 hover:text-red-600 hover:bg-red-500/10 rounded-xl transition-colors flex items-center justify-center"
                      >
                        <X size={20} />
                      </button>
                    )}
                 </div>

                 {/* Sort Toggles */}
                 <div className="flex flex-wrap gap-2 pt-2 border-t border-dashed border-gray-200/20">
                    <span className={`text-sm font-medium mr-2 self-center ${isDark ? "text-white/40" : "text-gray-500"}`}>
                      Сортировка:
                    </span>
                    {(
                      ["time", "client", "service", "date", "status"] as SortField[]
                    ).map((field) => (
                      <button
                        key={field}
                        onClick={() => {
                          if (sortField === field) {
                            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                          } else {
                            setSortField(field);
                            setSortOrder("asc");
                          }
                        }}
                        className={`px-3 py-1.5 text-sm rounded-lg border transition-all ${
                          sortField === field
                            ? isDark
                              ? "bg-indigo-500/20 border-indigo-500/30 text-indigo-300"
                              : "bg-blue-100 text-blue-700 border-blue-200"
                            : isDark
                              ? "bg-white/5 border-white/10 text-white/50 hover:text-white/80"
                              : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {field === "time" && "Время"}
                        {field === "client" && "Клиент"}
                        {field === "service" && "Услуга"}
                        {field === "date" && "Дата"}
                        {field === "status" && "Статус"}
                        {sortField === field && (
                          <span className="ml-1 inline-block">
                            {sortOrder === "asc" ? <ChevronUp size={12}/> : <ChevronDown size={12}/>}
                          </span>
                        )}
                      </button>
                    ))}
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── STAT CARDS ──────────────────────────────────────── */}
        <div>
           <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            
            {/* Card 1: Today */}
             <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              whileHover={{ y: -3, scale: 1.02 }}
               className={`relative rounded-2xl p-5 overflow-hidden transition-all duration-300 ${
                isDark
                  ? "bg-white/[0.07] border border-white/[0.1] backdrop-blur-xl hover:bg-white/[0.1] shadow-lg shadow-blue-500/20"
                  : "bg-white border border-gray-200/70 shadow-sm hover:shadow-md"
              }`}
             >
               <div className={`absolute -top-4 -right-4 w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 opacity-${isDark ? "15" : "8"} blur-xl`} />
               <div className="relative">
                 <div className="inline-flex p-2 rounded-xl mb-3 bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25">
                   <CalendarDays size={22} className="text-white" />
                 </div>
                 <div className={`text-3xl font-black leading-none mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>
                  {isLoading ? "—" : stats.today}
                 </div>
                 <div className={`text-sm font-semibold ${isDark ? "text-white/70" : "text-gray-700"}`}>
                  Сегодня
                 </div>
                 <div className={`text-xs mt-0.5 ${isDark ? "text-white/35" : "text-gray-400"}`}>
                  Записей на сегодня
                 </div>
               </div>
             </motion.div>

            {/* Card 2: New */}
             <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              whileHover={{ y: -3, scale: 1.02 }}
               className={`relative rounded-2xl p-5 overflow-hidden transition-all duration-300 ${
                isDark
                  ? "bg-white/[0.07] border border-white/[0.1] backdrop-blur-xl hover:bg-white/[0.1] shadow-lg shadow-emerald-500/20"
                  : "bg-white border border-gray-200/70 shadow-sm hover:shadow-md"
              }`}
             >
               <div className={`absolute -top-4 -right-4 w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 opacity-${isDark ? "15" : "8"} blur-xl`} />
               <div className="relative">
                 <div className="inline-flex p-2 rounded-xl mb-3 bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25">
                   <AlertCircle size={22} className="text-white" />
                 </div>
                 <div className={`text-3xl font-black leading-none mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>
                  {isLoading ? "—" : stats.new}
                 </div>
                 <div className={`text-sm font-semibold ${isDark ? "text-white/70" : "text-gray-700"}`}>
                  Новые
                 </div>
                 <div className={`text-xs mt-0.5 ${isDark ? "text-white/35" : "text-gray-400"}`}>
                  Требуют внимания
                 </div>
               </div>
             </motion.div>

            {/* Card 3: Upcoming */}
             <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              whileHover={{ y: -3, scale: 1.02 }}
               className={`relative rounded-2xl p-5 overflow-hidden transition-all duration-300 ${
                isDark
                  ? "bg-white/[0.07] border border-white/[0.1] backdrop-blur-xl hover:bg-white/[0.1] shadow-lg shadow-purple-500/20"
                  : "bg-white border border-gray-200/70 shadow-sm hover:shadow-md"
              }`}
             >
               <div className={`absolute -top-4 -right-4 w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 opacity-${isDark ? "15" : "8"} blur-xl`} />
               <div className="relative">
                 <div className="inline-flex p-2 rounded-xl mb-3 bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg shadow-purple-500/25">
                   <Clock size={22} className="text-white" />
                 </div>
                 <div className={`text-3xl font-black leading-none mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>
                  {isLoading ? "—" : stats.upcoming}
                 </div>
                 <div className={`text-sm font-semibold ${isDark ? "text-white/70" : "text-gray-700"}`}>
                  Предстоит
                 </div>
                 <div className={`text-xs mt-0.5 ${isDark ? "text-white/35" : "text-gray-400"}`}>
                  Ближайшие записи
                 </div>
               </div>
             </motion.div>

            {/* Card 4: Total */}
             <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              whileHover={{ y: -3, scale: 1.02 }}
               className={`relative rounded-2xl p-5 overflow-hidden transition-all duration-300 ${
                isDark
                  ? "bg-white/[0.07] border border-white/[0.1] backdrop-blur-xl hover:bg-white/[0.1] shadow-lg shadow-amber-500/20"
                  : "bg-white border border-gray-200/70 shadow-sm hover:shadow-md"
              }`}
             >
               <div className={`absolute -top-4 -right-4 w-20 h-20 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 opacity-${isDark ? "15" : "8"} blur-xl`} />
               <div className="relative">
                 <div className="inline-flex p-2 rounded-xl mb-3 bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/25">
                   <Users size={22} className="text-white" />
                 </div>
                 <div className={`text-3xl font-black leading-none mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>
                  {isLoading ? "—" : stats.total}
                 </div>
                 <div className={`text-sm font-semibold ${isDark ? "text-white/70" : "text-gray-700"}`}>
                  Всего
                 </div>
                 <div className={`text-xs mt-0.5 ${isDark ? "text-white/35" : "text-gray-400"}`}>
                  За все время
                 </div>
               </div>
             </motion.div>
           </div>
         </div>

        {/* ── APPOINTMENTS LIST ─────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {isLoading ? (
            <div className={`rounded-2xl p-16 text-center ${glassCls}`}>
              <div
                className={`w-10 h-10 rounded-full border-3 border-t-transparent animate-spin mx-auto mb-4 ${
                  isDark ? "border-purple-400" : "border-blue-400"
                }`}
                style={{ borderWidth: 3 }}
              />
              <p className={`text-sm ${isDark ? "text-white/40" : "text-gray-400"}`}>
                Загрузка записей...
              </p>
            </div>
          ) : error ? (
             <div className={`rounded-2xl p-16 text-center ${glassCls} border-red-500/20`}>
               <AlertCircle className={`w-12 h-12 mx-auto mb-4 ${isDark ? "text-red-400" : "text-red-500"}`} />
               <p className={`font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Ошибка</p>
               <p className={`text-sm mt-2 ${isDark ? "text-white/60" : "text-gray-500"}`}>{error}</p>
             </div>
          ) : filteredAndSortedAppointments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <AnimatePresence mode="popLayout">
                {filteredAndSortedAppointments.map((appointment, index) => (
                  <motion.div
                    key={appointment.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ delay: Math.min(index * 0.04, 0.3) }}
                    layout
                  >
                    <AppointmentCard
                      appointment={{
                        clientSurname: appointment.clientSurname,
                        clientName: appointment.clientName,
                        clientPhone: appointment.clientPhone,
                        service: appointment.service.title,
                        appointmentTime: appointment.appointmentTime,
                        price: `${appointment.price.toLocaleString()} ₽`,
                        status: appointment.status,
                      }}
                      index={index}
                      isDark={isDark}
                      formatTime={formatTime}
                      formatDate={formatDate}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className={`rounded-2xl p-16 text-center ${glassCls}`}>
              <div
                className={`w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center ${
                  isDark ? "bg-white/[0.07]" : "bg-gray-100"
                }`}
              >
                <CalendarRange size={26} className={isDark ? "text-white/25" : "text-gray-300"} />
              </div>
              <p className={`text-lg font-bold mb-1 ${isDark ? "text-white/70" : "text-gray-600"}`}>
                Записей не найдено
              </p>
              <p className={`text-sm ${isDark ? "text-white/30" : "text-gray-400"}`}>
                Попробуйте изменить параметры фильтрации
              </p>
            </div>
          )}
        </motion.div>

        {/* ── FOOTER ──────────────────────────────────────────── */}
        {!isLoading && filteredAndSortedAppointments.length > 0 && (
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
               <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-blue-400" />
                 Новый
               </div>
               <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-400" />
                 Подтвержден
               </div>
               <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-gray-400" />
                 Завершен/Отменен
               </div>
            </div>
            <span>
              Показано {filteredAndSortedAppointments.length} из {appointments.length}
            </span>
          </motion.div>
        )}
      </div>
    </div>
  );
}