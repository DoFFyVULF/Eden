"use client";
import AppointmentConfirmWindow from "@/app/components/ui/admin/appointments/appointmentsConfirWnd/appointmentsConfirWnd";
import AppointmentItem from "@/app/components/ui/admin/appointments/appoinmentItem/AppointmentItem";
import NewAppointmentsWindow from "@/app/components/ui/admin/appointments/newAppointmentsWindow/newAppointmentsWindow";
import { useState, useMemo } from "react";

interface Appointment {
  id: string;
  clientName: string;
  service: string;
  time: string;
  price: string;
  master: string;
  status: string;
  date: string;
}

type SortField = "status" | "time" | "client" | "service" | "date" | "master";
type SortOrder = "asc" | "desc";

export default function AdminAppointments() {
  const [isPlannedAppointmentWindow, setPlannedAppointmentWindow] = useState(false);
  const [isConfirmWindowOpen, setIsConfirmWindowOpen] = useState(false);
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false);
  const [sortField, setSortField] = useState<SortField>("time");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const appointmentsData: Appointment[] = [
    {
      id: "001",
      clientName: "Иван Иванов",
      service: "Массаж",
      time: "14:00",
      price: "2 000 ₽",
      master: "Сасун Дмитрий Береста",
      status: "Новая",
      date: "2024-01-15",
    },
    {
      id: "002",
      clientName: "Мария Петрова",
      service: "Стрижка",
      time: "15:30",
      price: "1 500 ₽",
      master: "Анна Сидорова",
      status: "Новая",
      date: "2024-01-15",
    },
    {
      id: "003",
      clientName: "Алексей Козлов",
      service: "Окрашивание",
      time: "16:00",
      price: "3 000 ₽",
      master: "Елена Иванова",
      status: "Подтверждена",
      date: "2024-01-15",
    },
    {
      id: "004",
      clientName: "Сергей Васильев",
      service: "Маникюр",
      time: "10:00",
      price: "1 200 ₽",
      master: "Ольга Петрова",
      status: "Завершена",
      date: "2024-01-14",
    },
  ];

  // Функция для сортировки записей
  const sortAppointments = (appointments: Appointment[]): Appointment[] => {
    const sorted = [...appointments].sort((a, b) => {
      let aValue: string | number = "";
      let bValue: string | number = "";

      switch (sortField) {
        case "time":
          aValue = a.time;
          bValue = b.time;
          break;
        case "client":
          aValue = a.clientName;
          bValue = b.clientName;
          break;
        case "service":
          aValue = a.service;
          bValue = b.service;
          break;
        case "master":
          aValue = a.master;
          bValue = b.master;
          break;
        case "date":
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
          break;
        case "status":
          const statusOrder = ["Новая", "Подтверждена", "Завершена", "Отменена"];
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
      } else {
        return sortOrder === "asc" 
          ? (aValue as number) - (bValue as number)
          : (bValue as number) - (aValue as number);
      }
    });

    return sorted;
  };

  // Фильтрация и сортировка данных
  const filteredAndSortedAppointments = useMemo(() => {
    let filtered = appointmentsData;

    // Фильтрация по поисковому запросу
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(appointment =>
        appointment.clientName.toLowerCase().includes(query) ||
        appointment.service.toLowerCase().includes(query) ||
        appointment.master.toLowerCase().includes(query)
      );
    }

    // Фильтрация по статусу
    if (statusFilter) {
      const statusMap: { [key: string]: string } = {
        "new": "Новая",
        "confirmed": "Подтверждена",
        "completed": "Завершена",
        "cancelled": "Отменена"
      };
      filtered = filtered.filter(appointment => 
        appointment.status === statusMap[statusFilter]
      );
    }

    // Фильтрация по дате
    if (dateFilter) {
      filtered = filtered.filter(appointment => 
        appointment.date === dateFilter
      );
    }

    return sortAppointments(filtered);
  }, [appointmentsData, sortField, sortOrder, statusFilter, dateFilter, searchQuery]);

  // Получаем только неподтвержденные записи
  const pendingAppointments = useMemo(() => 
    appointmentsData.filter((app) => app.status === "Новая"),
    [appointmentsData]
  );

  // Получаем подтвержденные записи на сегодня
  const plannedAppointments = useMemo(() => 
    appointmentsData.filter((app) => app.status === "Подтверждена"),
    [appointmentsData]
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
    setIsNewAppointmentOpen(true);
  };

  const handleCloseWindow = () => {
    setIsConfirmWindowOpen(false);
  };

  const handleClosePlannedWindow = () => {
    setPlannedAppointmentWindow(false);
  };

  const handleCloseNewAppWindow = () => {
    setIsNewAppointmentOpen(false);
  };

  const handleConfirmAppointment = (appointmentId: string) => {
    console.log("Подтверждаем запись:", appointmentId);
    setIsConfirmWindowOpen(false);
  };

  const handleSortChange = (field: SortField) => {
    if (sortField === field) {
      // Если поле то же самое, меняем порядок сортировки
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      // Если новое поле, устанавливаем его и сбрасываем порядок на ascending
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const clearFilters = () => {
    setStatusFilter("");
    setDateFilter("");
    setSearchQuery("");
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
              <span className="font-semibold">{filteredAndSortedAppointments.length}</span>
              {filteredAndSortedAppointments.length !== appointmentsData.length && 
                ` (из ${appointmentsData.length})`
              }
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

        {/* Фильтры и поиск */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <svg
                  className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
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
                  className="w-full pl-10 pr-4 py-3 border text-black border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
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
                className="px-4 py-3 text-red-600 border border-red-300 rounded-xl hover:bg-red-50 transition-colors duration-200"
              >
                Сбросить
              </button>
            )}
          </div>

          {/* Сортировка */}
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-sm text-gray-600 font-medium mr-2">Сортировка:</span>
            {(["time", "client", "service", "master", "date", "status"] as SortField[]).map((field) => (
              <button
                key={field}
                onClick={() => handleSortChange(field)}
                className={`px-3 py-1 text-sm rounded-lg border transition-colors duration-200 ${
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

      {/* Статистика в карточках */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white cursor-pointer hover:-translate-y-2 transition-all duration-200"
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
          className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white hover:-translate-y-2 transition-all duration-200 cursor-pointer" 
          onClick={handlePlanedAppointments}
        >
          <div className="text-3xl font-bold mb-2">
            {plannedAppointments.length}
          </div>
          <div className="text-green-100">На сегодня</div>
          <div className="text-sm text-green-200 mt-1">
            Запланировано визитов
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white hover:-translate-y-2 transition-all duration-200">
          <div className="text-3xl font-bold mb-2">
            {appointmentsData.length}
          </div>
          <div className="text-purple-100">Всего записей</div>
          <div className="text-sm text-purple-200 mt-1">
            Предстоящих записей
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white hover:-translate-y-2 transition-all duration-200">
          <div className="text-3xl font-bold mb-2">
            {filteredAndSortedAppointments.length}
          </div>
          <div className="text-orange-100">Показано</div>
          <div className="text-sm text-orange-200 mt-1">
            После фильтрации
          </div>
        </div>
      </div>

      {/* Список ОТФИЛЬТРОВАННЫХ И ОТСОРТИРОВАННЫХ записей */}
      <div className="space-y-4">
        {filteredAndSortedAppointments.length > 0 ? (
          filteredAndSortedAppointments.map((appointment) => (
            <AppointmentItem key={appointment.id} appointment={appointment} />
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            Записи не найдены. Попробуйте изменить параметры фильтрации.
          </div>
        )}
      </div>

      {/* Пагинация */}
      <div className="flex justify-center items-center gap-2 mt-8">
        <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          Назад
        </button>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium">
          1
        </button>
        <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          2
        </button>
        <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          3
        </button>
        <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          Вперед
        </button>
      </div>

      {/* Окно подтверждения с неподтвержденными записями */}
      {isConfirmWindowOpen && (
        <AppointmentConfirmWindow
          title='Подтверждение записи'
          isOpen={isConfirmWindowOpen}
          onClose={handleCloseWindow}
          pendingAppointments={pendingAppointments}
          onConfirm={handleConfirmAppointment}
        />
      )}

      {/* Окно запланированных записей */}
      {isPlannedAppointmentWindow && (
        <AppointmentConfirmWindow
          title='Записи на сегодня'
          isOpen={isPlannedAppointmentWindow}
          onClose={handleClosePlannedWindow}
          pendingAppointments={plannedAppointments}
          onConfirm={handleConfirmAppointment}
          showAcceptButton={false}
        />
      )}

      {/* Окно создания новой записи */}
      {isNewAppointmentOpen && (
        <div className="">
          <NewAppointmentsWindow
            isOpen={isNewAppointmentOpen}
            onClose={handleCloseNewAppWindow}
          />
        </div>
      )}
    </div>
  );
}