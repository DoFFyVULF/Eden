"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { appointmentService } from "@/services/appointment/appointment.service";
import { userService } from "@/services/user/user.service";
import { IAppointment, AppointmentStatus } from "@/types/appointment.types";
import { IUser } from "@/types/user.types";
import {
  Search,
  Filter,
  Calendar,
  Clock,
  Users,
  UserCheck,
  CheckCircle,
  XCircle,
  Clock4,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  RefreshCw,
  CalendarDays,
  BarChart3,
  Shield,
  Calendar as CalendarIcon,
} from "lucide-react";

type SortField = "time" | "client" | "service" | "date";
type SortOrder = "asc" | "desc";

export default function MasterAppointments() {
  const [currentUser, setCurrentUser] = useState<IUser | null>(null);
  const [appointments, setAppointments] = useState<IAppointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [sortField, setSortField] = useState<SortField>("time");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

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

  // Только подтвержденные записи для основного списка
  const confirmedAppointments = useMemo(() => {
    return appointments.filter(app => app.status === AppointmentStatus.Подтвержден);
  }, [appointments]);

  const sortAppointments = (appointments: IAppointment[]): IAppointment[] => {
    const sorted = [...appointments].sort((a, b) => {
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

  const todayAppointments = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return confirmedAppointments.filter(
      (app) =>
        new Date(app.appointmentTime).toISOString().split("T")[0] === today
    );
  }, [confirmedAppointments]);

  const upcomingAppointments = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return confirmedAppointments.filter(
      (app) =>
        new Date(app.appointmentTime) >= today
    );
  }, [confirmedAppointments]);

  const newAppointments = useMemo(() => {
    return appointments.filter((app) => app.status === AppointmentStatus.Новый);
  }, [appointments]);

  const completedAppointments = useMemo(() => {
    return appointments.filter((app) => app.status === AppointmentStatus.Завершен);
  }, [appointments]);

  const cancelledAppointments = useMemo(() => {
    return appointments.filter((app) => app.status === AppointmentStatus.Отменен);
  }, [appointments]);

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

  const getStatusIcon = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.Новый:
        return <AlertCircle className="w-4 h-4 text-amber-500" />;
      case AppointmentStatus.Подтвержден:
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case AppointmentStatus.Завершен:
        return <Clock4 className="w-4 h-4 text-blue-500" />;
      case AppointmentStatus.Отменен:
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.Новый:
        return "bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 border-amber-200";
      case AppointmentStatus.Подтвержден:
        return "bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 border-emerald-200";
      case AppointmentStatus.Завершен:
        return "bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 border-blue-200";
      case AppointmentStatus.Отменен:
        return "bg-gradient-to-r from-rose-100 to-red-100 text-rose-700 border-rose-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-8xl mx-auto">
        {/* Заголовок и управление */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
            <div>
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 mb-2"
              >
                <div className="p-2.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
                  <CalendarDays className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                    Мои записи
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Добро пожаловать,{" "}
                    <span className="font-semibold text-gray-900">
                      {currentUser?.name || "Мастер"}
                    </span>
                    ! Управляйте своими записями.
                  </p>
                </div>
              </motion.div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-300/50 text-gray-700 rounded-xl font-medium hover:bg-gray-50/80 transition-all duration-300 shadow-sm"
              >
                <Filter className="w-4 h-4" />
                Фильтры
                {isFilterOpen ? (
                  <ChevronDown className="w-4 h-4 rotate-180" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => loadData(false)}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-300/50 text-gray-700 rounded-xl font-medium hover:bg-gray-50/80 transition-all duration-300 shadow-sm"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
                Обновить
              </motion.button>
            </div>
          </div>

          {/* Расширенные фильтры */}
          <AnimatePresence>
            {isFilterOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50 mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Поиск */}
                    <div className="relative">
                      <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Поиск по клиентам, услугам..."
                        className="w-full pl-10 pr-4 py-3.5 bg-white/90 backdrop-blur-sm border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-gray-900 placeholder-gray-500 transition-all duration-300"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>

                    {/* Фильтр по дате */}
                    <div className="relative">
                      <Calendar className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="date"
                        className="w-full pl-10 pr-4 py-3.5 bg-white/90 backdrop-blur-sm border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-gray-900 transition-all duration-300"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Сортировка */}
                  <div className="mt-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">
                      Сортировка:
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {(
                        [
                          {
                            field: "time" as SortField,
                            label: "Время",
                            icon: Clock,
                          },
                          {
                            field: "client" as SortField,
                            label: "Клиент",
                            icon: Users,
                          },
                          {
                            field: "service" as SortField,
                            label: "Услуга",
                            icon: TrendingUp,
                          },
                          {
                            field: "date" as SortField,
                            label: "Дата",
                            icon: CalendarIcon,
                          },
                        ] as const
                      ).map(({ field, label, icon: Icon }) => (
                        <motion.button
                          key={field}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleSortChange(field)}
                          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-xl transition-all duration-300 border ${
                            sortField === field
                              ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md border-transparent"
                              : "bg-white/80 text-gray-700 border-gray-300/50 hover:bg-gray-50/80"
                          }`}
                        >
                          <Icon className="w-3 h-3" />
                          {label}
                          {sortField === field && (
                            <span className="ml-1">
                              {sortOrder === "asc" ? (
                                <ChevronUp className="w-3 h-3" />
                              ) : (
                                <ChevronDown className="w-3 h-3" />
                              )}
                            </span>
                          )}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Кнопки управления фильтрами */}
                  {(dateFilter || searchQuery) && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-end mt-6 pt-4 border-t border-gray-200/50"
                    >
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={clearFilters}
                        className="flex items-center gap-2 px-4 py-2 text-red-600 border border-red-300/50 rounded-lg hover:bg-red-50/50 transition-all duration-300"
                      >
                        <XCircle className="w-4 h-4" />
                        Сбросить фильтры
                      </motion.button>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-emerald-500 to-green-500 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-20">
              <CheckCircle className="w-16 h-16" />
            </div>
            <div className="relative z-10">
              <div className="text-4xl font-bold mb-2">
                {todayAppointments.length}
              </div>
              <div className="text-emerald-100 font-medium">На сегодня</div>
              <div className="text-sm text-emerald-200/80 mt-2">
                Подтвержденные записи
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-20">
              <AlertCircle className="w-16 h-16" />
            </div>
            <div className="relative z-10">
              <div className="text-4xl font-bold mb-2">
                {newAppointments.length}
              </div>
              <div className="text-amber-100 font-medium">Новые</div>
              <div className="text-sm text-amber-200/80 mt-2">
                Требуют подтверждения
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-20">
              <CalendarDays className="w-16 h-16" />
            </div>
            <div className="relative z-10">
              <div className="text-4xl font-bold mb-2">
                {confirmedAppointments.length}
              </div>
              <div className="text-blue-100 font-medium">Подтверждено</div>
              <div className="text-sm text-blue-200/80 mt-2">
                Предстоящие записи
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-20">
              <BarChart3 className="w-16 h-16" />
            </div>
            <div className="relative z-10">
              <div className="text-4xl font-bold mb-2">
                {completedAppointments.length}
              </div>
              <div className="text-purple-100 font-medium">Завершено</div>
              <div className="text-sm text-purple-200/80 mt-2">
                Выполненные записи
              </div>
            </div>
          </motion.div>
        </div>

        {/* Информация о фильтрации */}
        {filteredAndSortedAppointments.length !== confirmedAppointments.length && (
          <div className="mb-4 px-4 py-2 bg-blue-50/80 backdrop-blur-sm rounded-xl text-sm text-blue-700 border border-blue-200/50">
            Показано {filteredAndSortedAppointments.length} из {confirmedAppointments.length} подтвержденных записей
          </div>
        )}

        {/* Карточки записей */}
        {isLoading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-500 font-medium">
              Загрузка записей...
            </p>
          </div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="col-span-full bg-white/80 backdrop-blur-sm rounded-2xl p-12 text-center border border-gray-200/50"
          >
            <div className="w-20 h-20 bg-gradient-to-r from-red-200 to-red-300 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-10 h-10 text-red-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Ошибка загрузки
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">{error}</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => loadData(true)}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 inline-flex items-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Попробовать снова
            </motion.button>
          </motion.div>
        ) : confirmedAppointments.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="col-span-full bg-white/80 backdrop-blur-sm rounded-2xl p-12 text-center border border-gray-200/50"
          >
            <div className="w-20 h-20 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
              <CalendarDays className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Нет подтвержденных записей
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              У вас пока нет подтвержденных записей. Новые записи появятся после подтверждения администратором.
            </p>
          </motion.div>
        ) : filteredAndSortedAppointments.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="col-span-full bg-white/80 backdrop-blur-sm rounded-2xl p-12 text-center border border-gray-200/50"
          >
            <div className="w-20 h-20 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Ничего не найдено
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Попробуйте изменить параметры поиска или фильтрации
            </p>
            {(searchQuery || dateFilter) && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={clearFilters}
                className="px-6 py-2.5 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300 inline-flex items-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                Сбросить фильтры
              </motion.button>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
            <AnimatePresence>
              {filteredAndSortedAppointments.map((appointment, index) => (
                <motion.div
                  key={appointment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -2 }}
                  className="bg-gradient-to-br from-white to-gray-50/50 rounded-2xl border border-gray-200/50 p-4 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm group"
                >
                  {/* Верхняя часть с датой и статусом */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-gray-500 mb-1">
                        Запланировано
                      </div>
                      <div className="text-lg font-bold text-gray-900 truncate">
                        {formatDate(appointment.appointmentTime)}
                      </div>
                      <div className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {formatTime(appointment.appointmentTime)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {getStatusIcon(appointment.status)}
                      <span
                        className={`px-2.5 py-1 text-xs font-bold rounded-full border ${getStatusColor(appointment.status)} whitespace-nowrap`}
                      >
                        {appointment.status}
                      </span>
                    </div>
                  </div>

                  {/* Разделитель */}
                  <div className="h-px bg-gradient-to-r from-transparent via-gray-300/50 to-transparent my-4" />

                  {/* Клиент */}
                  <div className="mb-4">
                    <div className="text-xs text-gray-600 mb-2">Клиент</div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {appointment.clientName[0]?.toUpperCase() || "К"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-gray-900 truncate">
                          {appointment.clientSurname} {appointment.clientName}
                        </div>
                        <div className="text-xs text-gray-600 truncate">
                          {appointment.clientPhone}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Услуга и детали */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    <div className="bg-gradient-to-br from-blue-50/50 to-cyan-50/50 rounded-xl p-3 border border-blue-200/30">
                      <div className="text-xs text-gray-600 mb-1">Услуга</div>
                      <div className="text-sm font-bold text-gray-900 truncate">
                        {appointment.service.title}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {appointment.service.duration} мин.
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-50/50 to-green-50/50 rounded-xl p-3 border border-emerald-200/30">
                      <div className="text-xs text-gray-600 mb-1">
                        Стоимость
                      </div>
                      <div className="text-base font-bold text-emerald-700">
                        {appointment.price.toLocaleString()} ₽
                      </div>
                    </div>
                  </div>

                  {/* Информация */}
                  <div className="pt-3 border-t border-gray-200/50">
                    <div className="text-xs text-gray-500 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2 truncate">
                        <UserCheck className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">
                          Мастер: {appointment.master.surname}{" "}
                          {appointment.master.name}
                        </span>
                      </div>
                      <div className="text-gray-400 font-mono text-xs sm:text-sm flex-shrink-0">
                        ID: {appointment.id}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Информация внизу */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-sm text-gray-500">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-amber-500 to-orange-500"></div>
              <span>Новые ({newAppointments.length})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-500 to-green-500"></div>
              <span>Подтвержденные ({confirmedAppointments.length})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"></div>
              <span>Завершенные ({completedAppointments.length})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-rose-500 to-red-500"></div>
              <span>Отмененные ({cancelledAppointments.length})</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span>
              Показано: {filteredAndSortedAppointments.length} из{" "}
              {confirmedAppointments.length} подтвержденных
            </span>
            {currentUser?.login && (
              <span className="text-blue-600 font-medium flex items-center gap-2">
                <Shield className="w-4 h-4" />
                {currentUser.login}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}