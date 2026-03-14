"use client";

import { useState, useEffect, useMemo } from "react";
import AppointmentItem from "./AppointmentItem";
import AppointmentConfirmWindow from "./appointmentsConfirWnd";
import NewAppointmentsWindow from "./newAppointmentsWindow";
import { appointmentService } from "@/services/appointment/appointment.service";
import { IAppointment, AppointmentStatus } from "@/types/appointment.types";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  Calendar,
  UserCheck,
  Clock,
  Users,
  CalendarDays,
  CheckCircle,
  XCircle,
  Clock4,
  AlertCircle,
  Plus,
  ChevronUp,
  ChevronDown,
  TrendingUp,
  RefreshCw,
  Download,
} from "lucide-react";

type SortField = "time" | "client" | "service" | "date" | "master";
type SortOrder = "asc" | "desc";

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState<IAppointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [isTodayAppointmentsWindow, setTodayAppointmentsWindow] =
    useState(false);
  const [isConfirmWindowOpen, setIsConfirmWindowOpen] = useState(false);
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [editingAppointment, setEditingAppointment] =
    useState<IAppointment | null>(null);

  const [sortField, setSortField] = useState<SortField>("time");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const loadAppointments = async () => {
    setIsRefreshing(true);
    setError(null);
    try {
      const data = await appointmentService.getAll();
      setAppointments(data);
    } catch (err) {
      console.error("Ошибка загрузки записей:", err);
      setError("Не удалось загрузить записи. Проверьте соединение.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  // Фильтрация записей - ТОЛЬКО подтвержденные записи в основном списке
  const confirmedAppointments = useMemo(() => {
    return appointments.filter(app => app.status === AppointmentStatus.Подтвержден);
  }, [appointments]);

  // Записи на сегодня (только подтвержденные)
  const todayAppointments = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return confirmedAppointments.filter(
      (app) => new Date(app.appointmentTime).toISOString().split('T')[0] === today
    );
  }, [confirmedAppointments]);

  // Новые записи (только для окна подтверждения)
  const pendingAppointments = useMemo(
    () => appointments.filter((a) => a.status === AppointmentStatus.Новый),
    [appointments],
  );

  // Завершенные записи
  const completedAppointments = useMemo(
    () => appointments.filter((a) => a.status === AppointmentStatus.Завершен),
    [appointments],
  );

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
          aValue = a.service.title;
          bValue = b.service.title;
          break;
        case "master":
          aValue = `${a.master.surname} ${a.master.name}`.toLowerCase();
          bValue = `${b.master.surname} ${b.master.name}`.toLowerCase();
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
          `${app.master.surname} ${app.master.name}`
            .toLowerCase()
            .includes(q) ||
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

  // Обработчики
  const handleWindowConfirm = () => {
    setIsConfirmWindowOpen(true);
    setTodayAppointmentsWindow(false);
  };

  const handleTodayAppointments = () => {
    setTodayAppointmentsWindow(true);
    setIsConfirmWindowOpen(false);
  };

  const handleNewAppWindow = () => {
    setEditingAppointment(null);
    setIsNewAppointmentOpen(true);
  };

  const handleCloseWindow = () => setIsConfirmWindowOpen(false);
  const handleCloseTodayWindow = () => setTodayAppointmentsWindow(false);
  const handleCloseNewAppWindow = () => {
    setIsNewAppointmentOpen(false);
    setEditingAppointment(null);
  };

  const handleConfirmAppointment = async (appointmentId: string) => {
    try {
      await appointmentService.update(Number(appointmentId), {
        status: AppointmentStatus.Подтвержден,
      });
      await loadAppointments();
      setIsConfirmWindowOpen(false);
    } catch (err) {
      alert("Ошибка подтверждения записи.");
      console.error(err);
    }
  };

  const handleCompleteAppointment = async (appointmentId: string) => {
    try {
      await appointmentService.complete(Number(appointmentId));
      await loadAppointments();
    } catch (err) {
      alert("Ошибка завершения записи.");
      console.error(err);
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    if (!window.confirm("Вы уверены, что хотите отменить запись?")) return;

    try {
      await appointmentService.update(Number(appointmentId), {
        status: AppointmentStatus.Отменен,
      });
      await loadAppointments();
      setIsConfirmWindowOpen(false);
      setTodayAppointmentsWindow(false);
    } catch (err) {
      alert("Ошибка отмены записи.");
      console.error(err);
    }
  };

  const handleEditAppointment = (item: {
    id: string;
    clientName: string;
    service: string;
    time: string;
    price: string;
    master: string;
    status: string;
    date: string;
    duration: number;
    rawDateTime: string;
  }) => {
    const appointment = appointments.find((a) => a.id.toString() === item.id);
    if (appointment) {
      setEditingAppointment(appointment);
      setIsNewAppointmentOpen(true);
    } else {
      console.warn("Запись не найдена для редактирования");
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    if (!window.confirm("Удалить запись?")) return;
    try {
      await appointmentService.delete(Number(id));
      await loadAppointments();
    } catch (err) {
      console.error("Ошибка удаления:", err);
      alert("Не удалось удалить запись");
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      {/* Заголовок и управление */}
      <div className="max-w-9xl mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 mb-2"
            >
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
                <CalendarDays className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                Управление записями
              </h1>
            </motion.div>
            <p className="text-gray-600">
              Подтвержденные записи:{" "}
              <span className="font-semibold text-gray-800">
                {confirmedAppointments.length}
              </span>
              {filteredAndSortedAppointments.length !== confirmedAppointments.length && (
                <span className="ml-2">
                  (показано {filteredAndSortedAppointments.length})
                </span>
              )}
              <span className="ml-4">
                Новых записей:{" "}
                <span className="font-semibold text-gray-800">
                  {pendingAppointments.length}
                </span>
              </span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-300 shadow-sm"
            >
              <Filter className="w-4 h-4" />
              Фильтры
              {isFilterOpen ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={loadAppointments}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-300 shadow-sm"
            >
              <RefreshCw
                className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
              Обновить
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNewAppWindow}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-purple-700"
            >
              <Plus className="w-5 h-5" />
              Новая запись
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
                      placeholder="Поиск по клиентам, услугам, мастерам..."
                      className="w-full pl-10 pr-4 py-3 bg-white/90 backdrop-blur-sm border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-gray-900 placeholder-gray-500 transition-all duration-300"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  {/* Фильтр по дате */}
                  <div className="relative">
                    <Calendar className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="date"
                      className="w-full pl-10 pr-4 py-3 bg-white/90 backdrop-blur-sm border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-gray-900 transition-all duration-300"
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
                        { field: "time", label: "Время", icon: Clock },
                        { field: "client", label: "Клиент", icon: Users },
                        { field: "service", label: "Услуга", icon: TrendingUp },
                        { field: "master", label: "Мастер", icon: UserCheck },
                        { field: "date", label: "Дата", icon: Calendar },
                      ] as const
                    ).map(({ field, label, icon: Icon }) => (
                      <motion.button
                        key={field}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleSortChange(field)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-300 ${
                          sortField === field
                            ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white border-transparent shadow-lg"
                            : "bg-white/80 backdrop-blur-sm text-gray-700 border-gray-300/50 hover:bg-gray-50"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="font-medium">{label}</span>
                        {sortField === field && (
                          <span className="ml-1">
                            {sortOrder === "asc" ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
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
        {/* Новые записи (требуют подтверждения) */}
        <motion.div
          whileHover={{ scale: 1.02, y: -2 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onClick={handleWindowConfirm}
          className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-6 text-white cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <AlertCircle className="w-16 h-16" />
          </div>
          <div className="relative z-10">
            <div className="text-4xl font-bold mb-2">
              {pendingAppointments.length}
            </div>
            <div className="text-amber-100 font-medium">Новые записи</div>
            <div className="text-sm text-amber-200/80 mt-2">
              Требуют подтверждения
            </div>
            {pendingAppointments.length > 0 && (
              <div className="mt-3 text-xs text-amber-300">
                Нажмите для подтверждения
              </div>
            )}
          </div>
        </motion.div>

        {/* Подтвержденные записи на сегодня */}
        <motion.div
          whileHover={{ scale: 1.02, y: -2 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onClick={handleTodayAppointments}
          className="bg-gradient-to-br from-emerald-500 to-green-500 rounded-2xl p-6 text-white cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
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
            {todayAppointments.length > 0 && (
              <div className="mt-3 text-xs text-emerald-300">
                Нажмите для просмотра
              </div>
            )}
          </div>
        </motion.div>

        {/* Все подтвержденные записи */}
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
              Все предстоящие записи
            </div>
          </div>
        </motion.div>

        {/* Завершенные записи */}
        <motion.div
          whileHover={{ scale: 1.02, y: -2 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <Clock4 className="w-16 h-16" />
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

      {/* Список записей */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden">
        {/* Тело таблицы */}
        <div className="divide-y divide-gray-100/50">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
              <p className="mt-4 text-gray-500">Загрузка записей...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-4">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <p className="text-red-600 font-medium">{error}</p>
              <button
                onClick={loadAppointments}
                className="mt-4 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                Попробовать снова
              </button>
            </div>
          ) : filteredAndSortedAppointments.length > 0 ? (
            <AnimatePresence>
              {filteredAndSortedAppointments.map((appointment, index) => (
                <motion.div
                  key={appointment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50/50 transition-colors duration-200"
                >
                  <AppointmentItem
                    appointment={{
                      id: appointment.id.toString(),
                      clientName: `${appointment.clientSurname} ${appointment.clientName}`,
                      service: appointment.service.title,
                      time: formatTime(appointment.appointmentTime),
                      price: `${appointment.price.toLocaleString()} ₽`,
                      master: `${appointment.master.surname} ${appointment.master.name}`,
                      status: appointment.status,
                      date: formatDate(appointment.appointmentTime),
                      duration: appointment.service.duration,
                      rawDateTime: appointment.appointmentTime,
                      clientPhone: appointment.clientPhone,
                    }}
                    onEdit={handleEditAppointment}
                    onDelete={handleDeleteAppointment}
                    onComplete={handleCompleteAppointment}
                    onCancel={handleCancelAppointment}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <div className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">Записи не найдены</p>
              <p className="text-gray-400 text-sm mt-1">
                {confirmedAppointments.length === 0 
                  ? "Нет подтвержденных записей" 
                  : "Попробуйте изменить параметры поиска или фильтрации"}
              </p>
              {(dateFilter || searchQuery) && (
                <button
                  onClick={clearFilters}
                  className="mt-4 px-4 py-2 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Сбросить фильтры
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Футер с информацией */}
      <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-4 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            <span>Подтвержденные</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            <span>Новые (требуют подтверждения)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span>Завершенные</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span>Загружено: {appointments.length} записей</span>
          <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
            <Download className="w-4 h-4" />
            Экспорт в CSV
          </button>
        </div>
      </div>

      {/* Модальные окна */}
      <AnimatePresence>
        {isConfirmWindowOpen && (
          <AppointmentConfirmWindow
            title="Подтверждение записи"
            isOpen={isConfirmWindowOpen}
            onClose={handleCloseWindow}
            pendingAppointments={pendingAppointments.map((a) => ({
              id: a.id.toString(),
              clientName: `${a.clientSurname} ${a.clientName}`,
              service: a.service.title,
              time: formatTime(a.appointmentTime),
              price: `${a.price.toLocaleString()} ₽`,
              master: `${a.master.surname} ${a.master.name}`,
              status: a.status,
              date: formatDate(a.appointmentTime),
              duration: a.service.duration,
              rawDateTime: a.appointmentTime,
              clientPhone: a.clientPhone,
            }))}
            onConfirm={handleConfirmAppointment}
            onCancel={handleCancelAppointment}
            windowType="new"
          />
        )}

        {isTodayAppointmentsWindow && (
          <AppointmentConfirmWindow
            title="Записи на сегодня"
            isOpen={isTodayAppointmentsWindow}
            onClose={handleCloseTodayWindow}
            pendingAppointments={todayAppointments.map((a) => ({
              id: a.id.toString(),
              clientName: `${a.clientSurname} ${a.clientName}`,
              service: a.service.title,
              time: formatTime(a.appointmentTime),
              price: `${a.price.toLocaleString()} ₽`,
              master: `${a.master.surname} ${a.master.name}`,
              status: a.status,
              date: formatDate(a.appointmentTime),
              duration: a.service.duration,
              rawDateTime: a.appointmentTime,
              clientPhone: a.clientPhone,
            }))}
            onCancel={handleCancelAppointment}
            windowType="confirmed"
          />
        )}

        {isNewAppointmentOpen && (
          <NewAppointmentsWindow
            isOpen={isNewAppointmentOpen}
            onClose={handleCloseNewAppWindow}
            onSuccess={() => {
              loadAppointments();
            }}
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