"use client";

import { useState, useEffect, useMemo } from "react";
import { appointmentService } from "@/services/appointment/appointment.service";
import { userService } from "@/services/user/user.service";
import { IAppointment, AppointmentStatus } from "@/types/appointment.types";
import { IUser } from "@/types/user.types";
import AppointmentItem from "@/app/(admin)/administration/appointments/AppointmentItem";

type SortField = "status" | "time" | "client" | "service" | "date";
type SortOrder = "asc" | "desc";

export default function MasterAppointments() {
  const [currentUser, setCurrentUser] = useState<IUser | null>(null);
  const [appointments, setAppointments] = useState<IAppointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [sortField, setSortField] = useState<SortField>("time");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Получаем информацию о текущем пользователе
        const userData = await userService.getMe();
        console.log("Пользователь загружен:", userData.data);
        setCurrentUser(userData.data);
        
        // Получаем все записи
        const allAppointments = await appointmentService.getAll();
        console.log("Все записи:", allAppointments);
        
        // Фильтруем записи только для текущего мастера
        const masterAppointments = allAppointments.filter(
          (appointment) => {
            return appointment.master.id === (userData.data.masterId || userData.data.id);
          }
        );
        
        console.log("Отфильтрованные записи мастера:", masterAppointments);
        setAppointments(masterAppointments);
      } catch (err) {
        console.error("Ошибка загрузки данных:", err);
        setError("Не удалось загрузить данные. Проверьте соединение.");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

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

  const todayAppointments = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return appointments.filter(
      (app) =>
        new Date(app.appointmentTime).toISOString().split("T")[0] === today &&
        app.status === AppointmentStatus.Подтвержден
    );
  }, [appointments]);

  const upcomingAppointments = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return appointments.filter(
      (app) =>
        new Date(app.appointmentTime) >= today &&
        app.status === AppointmentStatus.Подтвержден
    );
  }, [appointments]);

  const newAppointments = useMemo(() => {
    return appointments.filter(app => app.status === AppointmentStatus.Новый);
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

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Заголовок и информация о мастере */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Мои записи
            </h1>
            <p className="text-gray-600">
              Приветствую,{" "}
              <span className="font-semibold">
                {currentUser?.name || "Мастер"}
              </span>
              ! Здесь вы можете просмотреть свои записи.
            </p>
          </div>
          <div className="text-left md:text-right">
            <p className="text-gray-600">
              Всего ваших записей:{" "}
              <span className="font-semibold">
                {filteredAndSortedAppointments.length}
              </span>
              {filteredAndSortedAppointments.length !== appointments.length &&
                ` (из ${appointments.length})`}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Только просмотр — редактирование недоступно
            </p>
          </div>
        </div>

        {/* Фильтры */}
        <div className="bg-white rounded-xl md:rounded-2xl p-4 shadow-sm border border-gray-200">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <svg
                className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Поиск по клиентам, услугам, телефону..."
                className="w-full pl-10 pr-4 py-3 border text-black border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <select
              className="px-4 py-3 text-black border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Все статусы</option>
              <option value="new">Новые</option>
              <option value="confirmed">Подтвержденные</option>
              <option value="completed">Завершенные</option>
              <option value="cancelled">Отмененные</option>
            </select>

            <input
              type="date"
              className="px-4 py-3 text-black border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />

            {(statusFilter || dateFilter || searchQuery) && (
              <button
                onClick={clearFilters}
                className="px-4 py-3 text-red-600 border border-red-300 rounded-xl hover:bg-red-50 transition-colors"
              >
                Сбросить
              </button>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-sm text-gray-600 font-medium mr-2">
              Сортировка:
            </span>
            {(
              [
                "time",
                "client",
                "service",
                "date",
                "status",
              ] as SortField[]
            ).map((field) => (
              <button
                key={field}
                onClick={() => handleSortChange(field)}
                className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                  sortField === field
                    ? "bg-blue-100 text-blue-700 border-blue-300"
                    : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                }`}
              >
                {field === "time" && "Время"}
                {field === "client" && "Клиент"}
                {field === "service" && "Услуга"}
                {field === "date" && "Дата"}
                {field === "status" && "Статус"}
                {sortField === field && (
                  <span className="ml-1">
                    {sortOrder === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl md:rounded-2xl p-4 md:p-6 text-white hover:-translate-y-1 transition-transform duration-200">
          <div className="text-2xl md:text-3xl font-bold mb-2">{todayAppointments.length}</div>
          <div className="text-blue-100 text-sm md:text-base">Сегодня</div>
          <div className="text-xs md:text-sm text-blue-200 mt-1">
            Подтвержденные записи на сегодня
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl md:rounded-2xl p-4 md:p-6 text-white hover:-translate-y-1 transition-transform duration-200">
          <div className="text-2xl md:text-3xl font-bold mb-2">{newAppointments.length}</div>
          <div className="text-green-100 text-sm md:text-base">Новые</div>
          <div className="text-xs md:text-sm text-green-200 mt-1">
            Требуют подтверждения
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl md:rounded-2xl p-4 md:p-6 text-white hover:-translate-y-1 transition-transform duration-200">
          <div className="text-2xl md:text-3xl font-bold mb-2">{appointments.length}</div>
          <div className="text-purple-100 text-sm md:text-base">Всего</div>
          <div className="text-xs md:text-sm text-purple-200 mt-1">
            Ваших записей за все время
          </div>
        </div>
      </div>

      {/* Список записей */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8 md:py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 md:h-10 md:w-10 border-2 border-blue-600 border-t-transparent"></div>
            <p className="mt-3 text-gray-500">Загрузка записей...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8 md:py-12 text-red-600 bg-red-50 rounded-xl">
            <svg className="w-12 h-12 mx-auto mb-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.346 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            {error}
          </div>
        ) : filteredAndSortedAppointments.length > 0 ? (
          filteredAndSortedAppointments.map((appointment) => (
            <AppointmentItem
              key={appointment.id}
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
              }}
              hideActions={true} // Для мастера скрываем кнопки редактирования/удаления
            />
          ))
        ) : (
          <div className="text-center py-8 md:py-12 text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            {appointments.length === 0 
              ? "У вас пока нет записей." 
              : "Записи не найдены. Попробуйте изменить фильтры."}
          </div>
        )}
      </div>

      {/* Пагинация/информация */}
      {filteredAndSortedAppointments.length > 0 && (
        <div className="flex flex-col md:flex-row justify-between items-center gap-2 mt-6 md:mt-8 pt-4 md:pt-6 border-t border-gray-200">
          <span className="text-gray-500 text-sm">
            Показано {filteredAndSortedAppointments.length} из {appointments.length} записей
          </span>
          <div className="text-xs md:text-sm text-gray-400">
            {currentUser?.login && `Ваш логин: ${currentUser.login}`}
          </div>
        </div>
      )}
    </div>
  );
}