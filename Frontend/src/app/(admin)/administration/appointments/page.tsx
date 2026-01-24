"use client";

import { useState, useEffect, useMemo } from "react";
import AppointmentItem from "./AppointmentItem";
import AppointmentConfirmWindow from "./appointmentsConfirWnd";
import NewAppointmentsWindow from "./newAppointmentsWindow";
import { appointmentService } from "@/services/appointment/appointment.service";
import { IAppointment, AppointmentStatus } from "@/types/appointment.types";

type SortField = "status" | "time" | "client" | "service" | "date" | "master";
type SortOrder = "asc" | "desc";

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState<IAppointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isPlannedAppointmentWindow, setPlannedAppointmentWindow] =
    useState(false);
  const [isConfirmWindowOpen, setIsConfirmWindowOpen] = useState(false);
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false);

  const [editingAppointment, setEditingAppointment] =
    useState<IAppointment | null>(null);

  const [sortField, setSortField] = useState<SortField>("time");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    const loadAppointments = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await appointmentService.getAll();
        setAppointments(data);
      } catch (err) {
        console.error("Ошибка загрузки записей:", err);
        setError("Не удалось загрузить записи. Проверьте соединение.");
      } finally {
        setIsLoading(false);
      }
    };

    loadAppointments();
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
          `${app.master.surname} ${app.master.name}`
            .toLowerCase()
            .includes(q) ||
          app.clientPhone.includes(q),
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
        (app) => app.status === statusMap[statusFilter],
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
    appointments,
    sortField,
    sortOrder,
    statusFilter,
    dateFilter,
    searchQuery,
  ]);

  const pendingAppointments = useMemo(
    () => appointments.filter((a) => a.status === AppointmentStatus.Новый),
    [appointments],
  );

  const plannedAppointments = useMemo(
    () =>
      appointments.filter((a) => a.status === AppointmentStatus.Подтвержден),
    [appointments],
  );

  const handleWindowConfirm = () => {
    setIsConfirmWindowOpen(true);
    setPlannedAppointmentWindow(false);
  };

  const handlePlanedAppointments = () => {
    setPlannedAppointmentWindow(true);
    setIsConfirmWindowOpen(false);
  };

  const handleNewAppWindow = () => {
    setEditingAppointment(null);
    setIsNewAppointmentOpen(true);
  };

  const handleCloseWindow = () => setIsConfirmWindowOpen(false);
  const handleClosePlannedWindow = () => setPlannedAppointmentWindow(false);
  const handleCloseNewAppWindow = () => {
    setIsNewAppointmentOpen(false);
    setEditingAppointment(null);
  };

  const handleConfirmAppointment = async (appointmentId: string) => {
    try {
      await appointmentService.update(Number(appointmentId), {
        status: AppointmentStatus.Подтвержден,
      });
      const updated = await appointmentService.getAll();
      setAppointments(updated);
      setIsConfirmWindowOpen(false);
    } catch (err) {
      alert("Ошибка подтверждения записи.");
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
      const updated = await appointmentService.getAll();
      setAppointments(updated);
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
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Заголовок и управление */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Управление записями
            </h1>
            <p className="text-gray-600">
              Всего записей:{" "}
              <span className="font-semibold">
                {filteredAndSortedAppointments.length}
              </span>
              {filteredAndSortedAppointments.length !== appointments.length &&
                ` (из ${appointments.length})`}
            </p>
          </div>
          <button
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
            onClick={handleNewAppWindow}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Новая запись
          </button>
        </div>

        {/* Фильтры */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
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
                placeholder="Поиск по клиентам, услугам, мастерам..."
                className="w-full pl-10 pr-4 py-3 border text-black border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <select
              className="px-4 py-3 text-black border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
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
              className="px-4 py-3 text-black border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />

            {(statusFilter || dateFilter || searchQuery) && (
              <button
                onClick={clearFilters}
                className="px-4 py-3 text-red-600 border border-red-300 rounded-xl hover:bg-red-50"
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
                "master",
                "date",
                "status",
              ] as SortField[]
            ).map((field) => (
              <button
                key={field}
                onClick={() => handleSortChange(field)}
                className={`px-3 py-1 text-sm rounded-lg border transition-colors ${
                  sortField === field
                    ? "bg-blue-100 text-blue-700 border-blue-300"
                    : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                }`}
              >
                {field === "time" && "Время"}
                {field === "client" && "Клиент"}
                {field === "service" && "Услуга"}
                {field === "master" && "Мастер"}
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white cursor-pointer hover:-translate-y-1 transition"
          onClick={handleWindowConfirm}
        >
          <div className="text-3xl font-bold mb-2">
            {pendingAppointments.length}
          </div>
          <div className="text-blue-100">Новые записи</div>
          <div className="text-sm text-blue-200 mt-1">
            Требуют подтверждения
          </div>
        </div>

        <div
          className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white cursor-pointer hover:-translate-y-1 transition"
          onClick={handlePlanedAppointments}
        >
          <div className="text-3xl font-bold mb-2">
            {plannedAppointments.length}
          </div>
          <div className="text-green-100">Подтвержденные</div>
          <div className="text-sm text-green-200 mt-1">На ближайшее время</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white hover:-translate-y-1 transition">
          <div className="text-3xl font-bold mb-2">{appointments.length}</div>
          <div className="text-purple-100">Всего записей</div>
          <div className="text-sm text-purple-200 mt-1">В системе</div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white hover:-translate-y-1 transition">
          <div className="text-3xl font-bold mb-2">
            {filteredAndSortedAppointments.length}
          </div>
          <div className="text-orange-100">Показано</div>
          <div className="text-sm text-orange-200 mt-1">После фильтрации</div>
        </div>
      </div>

      {/* Список */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
            <p className="mt-2 text-gray-500">Загрузка...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-600 bg-red-50 rounded-xl">
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
                // Самое важное — передаём оригинальную дату-время
                rawDateTime: appointment.appointmentTime,
              }}
              onEdit={handleEditAppointment}
              onDelete={handleDeleteAppointment}
            />
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            Записи не найдены. Попробуйте изменить фильтры.
          </div>
        )}
      </div>

      {/* Пагинация */}
      <div className="flex justify-center items-center gap-2 mt-8">
        <span className="text-gray-500 text-sm">
          Показано {filteredAndSortedAppointments.length} из{" "}
          {appointments.length}
        </span>
      </div>

      {/* Модальные окна */}
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
          }))}
          onConfirm={handleConfirmAppointment}
        />
      )}

      {isPlannedAppointmentWindow && (
        <AppointmentConfirmWindow
          title="Подтвержденные записи"
          isOpen={isPlannedAppointmentWindow}
          onClose={handleClosePlannedWindow}
          pendingAppointments={plannedAppointments.map((a) => ({
            id: a.id.toString(),
            clientName: `${a.clientSurname} ${a.clientName}`,
            service: a.service.title,
            time: formatTime(a.appointmentTime),
            price: `${a.price.toLocaleString()} ₽`,
            master: `${a.master.surname} ${a.master.name}`,
            status: a.status,
            date: formatDate(a.appointmentTime),
            duration: a.service.duration,
          }))}
          onConfirm={handleConfirmAppointment}
          showAcceptButton={false}
        />
      )}

      {isNewAppointmentOpen && (
        <NewAppointmentsWindow
          isOpen={isNewAppointmentOpen}
          onClose={handleCloseNewAppWindow}
          onSuccess={() => {
            appointmentService.getAll().then(setAppointments);
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
    </div>
  );
}
