"use client";

import { useEffect, useMemo, useState } from "react";
import { appointmentService } from "@/services/appointment/appointment.service";
import { IAppointment, AppointmentStatus } from "@/types/appointment.types";
import AppointmentItem from "../AppointmentItem";

type SortField = "time" | "client" | "service" | "master" | "date";
type SortOrder = "asc" | "desc";

export default function AppointmentsHistoryPage() {
  const [appointments, setAppointments] = useState<IAppointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [sortField, setSortField] = useState<SortField>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [dateFilter, setDateFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const loadCompleted = async () => {
      setIsLoading(true);
      try {
        const data = await appointmentService.getCompleted();
        setAppointments(data);
      } catch (e) {
        console.error(e);
        setError("Не удалось загрузить историю записей");
      } finally {
        setIsLoading(false);
      }
    };

    loadCompleted();
  }, []);

  const filteredAndSorted = useMemo(() => {
    let filtered = appointments;

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
  }, [appointments, sortField, sortOrder, dateFilter, searchQuery]);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("ru-RU");

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Заголовок */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          История записей
        </h1>
        <p className="text-gray-600">
          Завершённые записи:{" "}
          <span className="font-semibold">{filteredAndSorted.length}</span>
        </p>
      </div>

      {/* Фильтры */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <input
            type="text"
            placeholder="Поиск по клиентам, услугам, мастерам..."
            className="flex-1 px-4 py-3 border text-black border-gray-300 rounded-xl"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <input
            type="date"
            className="px-4 py-3 text-black border border-gray-300 rounded-xl"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />

          <select
            className="px-4 py-3 text-black border border-gray-300 rounded-xl"
            value={sortField}
            onChange={(e) => setSortField(e.target.value as SortField)}
          >
            <option value="date">Дата</option>
            <option value="time">Время</option>
            <option value="client">Клиент</option>
            <option value="service">Услуга</option>
            <option value="master">Мастер</option>
          </select>

          <button
            onClick={() =>
              setSortOrder((o) => (o === "asc" ? "desc" : "asc"))
            }
            className="px-4 py-3 border rounded-xl bg-gray-100"
          >
            {sortOrder === "asc" ? "↑" : "↓"}
          </button>
        </div>
      </div>

      {/* Список */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">Загрузка...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-600">{error}</div>
        ) : filteredAndSorted.length ? (
          filteredAndSorted.map((a) => (
            <AppointmentItem
              key={a.id}
              appointment={{
                id: a.id.toString(),
                clientName: `${a.clientSurname} ${a.clientName}`,
                service: a.service.title,
                time: formatTime(a.appointmentTime),
                price: `${a.price.toLocaleString()} ₽`,
                master: `${a.master.surname} ${a.master.name}`,
                status: AppointmentStatus.Завершен,
                date: formatDate(a.appointmentTime),
                duration: a.service.duration,
                rawDateTime: a.appointmentTime,
              }}
               hideActions
            />
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            История пуста
          </div>
        )}
      </div>
    </div>
  );
}
