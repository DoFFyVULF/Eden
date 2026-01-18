"use client";

import { useState, useEffect, useMemo } from "react";
import { masterScheduleService } from "@/services/schedule/schedule.service";
import { masterService } from "@/services/master/master.service";
import type { IMasterSchedule } from "@/types/schedule.types";
import type { IMaster } from "@/types/masters.type";
import ScheduleModal from "./ScheduleModal";
import { Trash2, Calendar, Clock, Plus, User } from "lucide-react";

const DAYS_OF_WEEK = [
  "Понедельник",
  "Вторник",
  "Среда",
  "Четверг",
  "Пятница",
  "Суббота",
  "Воскресенье",
];

export default function MasterSchedulePage() {
  const [schedules, setSchedules] = useState<IMasterSchedule[]>([]);
  const [masters, setMasters] = useState<IMaster[]>([]);
  const [selectedMasterId, setSelectedMasterId] = useState<number | "all">(
    "all"
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // 1. Исправленный маппинг: учитываем опциональность id и приведение типов
  const mastersLookup = useMemo(() => {
    const lookup: Record<string, string> = {};
    masters.forEach((m) => {
      if (m.id !== undefined && m.id !== null) {
        // Форматируем имя: "Фамилия И."
        const displayName = `${m.surname} ${m.name ? m.name[0] + "." : ""}`;
        lookup[String(m.id)] = displayName.trim();
      }
    });
    return lookup;
  }, [masters]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [schedData, mastersData] = await Promise.all([
        masterScheduleService.getAll(),
        masterService.getAll(),
      ]);
      setSchedules(schedData);
      setMasters(mastersData.filter((m) => m.isActive));
    } catch (err) {
      console.error("Ошибка загрузки данных", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 2. Фильтрация с приведением типов (string/number)
  const filteredSchedules = useMemo(() => {
    if (selectedMasterId === "all") return schedules;
    return schedules.filter((s) => {
      // Проверяем ID либо напрямую, либо через вложенный объект master
      const mId = s.masterId || s.master?.id;
      return String(mId) === String(selectedMasterId);
    });
  }, [schedules, selectedMasterId]);

  const templateSchedules = useMemo(() => {
    const groups: Record<number, IMasterSchedule[]> = {};
    filteredSchedules
      .filter((s) => s.dayOfWeek !== null && s.dayOfWeek !== undefined)
      .forEach((s) => {
        if (!groups[s.dayOfWeek!]) groups[s.dayOfWeek!] = [];
        groups[s.dayOfWeek!].push(s);
      });
    return groups;
  }, [filteredSchedules]);

  const specificSchedules = useMemo(() => {
    return filteredSchedules
      .filter((s) => s.dayOfWeek === null || s.dayOfWeek === undefined)
      .sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      );
  }, [filteredSchedules]);

  const handleDelete = async (id: number) => {
    if (!confirm("Удалить эту запись из расписания?")) return;
    try {
      await masterScheduleService.delete(id);
      fetchData();
    } catch (err) {
      alert("Ошибка при удалении");
    }
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 text-black">
      <div className="max-w-8xl mx-auto">
        {/* Заголовок и управление в стиле EmployeePage */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Рабочее расписание
              </h1>
              <p className="text-gray-600">
                Настройка рабочих часов и индивидуальных смен сотрудников
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2 w-fit"
            >
              <Plus className="w-5 h-5" />
              Добавить смену
            </button>
          </div>

          {/* Фильтр в стиле EmployeePage */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full">
                <User className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <select
                  value={selectedMasterId}
                  onChange={(e) =>
                    setSelectedMasterId(
                      e.target.value === "all" ? "all" : Number(e.target.value)
                    )
                  }
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white appearance-none"
                >
                  <option value="all">Все сотрудники (общий просмотр)</option>
                  {masters.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.surname} {m.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="text-sm font-medium text-gray-500 bg-gray-100 px-4 py-2 rounded-lg">
                Всего записей: {filteredSchedules.length}
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">Загрузка расписания...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Левая колонка: Еженедельный шаблон */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                <h2 className="text-xl font-bold text-gray-900">
                  Еженедельный шаблон
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {DAYS_OF_WEEK.map((day, index) => (
                  <div
                    key={day}
                    className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-center mb-4 border-b border-gray-50 pb-3">
                      <span className="font-bold text-gray-800 text-lg">
                        {day}
                      </span>
                      <span className="text-[10px] uppercase font-bold tracking-wider bg-blue-50 text-blue-600 px-2 py-1 rounded-md">
                        {templateSchedules[index]?.length || 0} смен
                      </span>
                    </div>

                    <div className="space-y-3">
                      {templateSchedules[index]?.map((item) => (
                        <div
                          key={item.id}
                          className="group bg-gray-50 hover:bg-white p-3 rounded-xl border border-transparent hover:border-blue-200 transition-all"
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2 text-blue-900 font-bold">
                              <Clock className="w-4 h-4 text-blue-500" />
                              {formatTime(item.startTime)} —{" "}
                              {formatTime(item.endTime)}
                            </div>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="opacity-0 group-hover:opacity-100 p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Вместо поиска по Lookup используем данные из вложенного master */}
                          {selectedMasterId === "all" && item.master && (
                            <div className="mt-2 flex items-center gap-2 border-t border-gray-100 pt-2">
                              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-[10px] text-white font-bold">
                                {item.master.surname[0]}
                              </div>
                              <span className="text-[11px] font-bold text-gray-600 uppercase tracking-tight">
                                {item.master.surname} {item.master.name[0]}.
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                      {!templateSchedules[index] && (
                        <div className="text-center py-4 border-2 border-dashed border-gray-100 rounded-xl">
                          <span className="text-xs text-gray-400 font-medium">
                            Выходной
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Правая колонка: Исключения */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-6 bg-purple-600 rounded-full"></div>
                <h2 className="text-xl font-bold text-gray-900">
                  Индивидуальные даты
                </h2>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                {specificSchedules.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {specificSchedules.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white w-12 h-12 rounded-xl flex flex-col items-center justify-center shadow-md">
                            <span className="text-[10px] uppercase font-bold leading-none mb-0.5">
                              {new Date(item.startTime).toLocaleDateString(
                                "ru-RU",
                                { month: "short" }
                              )}
                            </span>
                            <span className="text-lg font-black leading-none">
                              {new Date(item.startTime).getDate()}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-bold text-gray-900">
                              {formatTime(item.startTime)} —{" "}
                              {formatTime(item.endTime)}
                            </div>
                            <div className="text-[10px] font-bold text-purple-600 uppercase mt-0.5">
                              {selectedMasterId === "all"
                                ? mastersLookup[String(item.masterId)] ||
                                  "Мастер"
                                : "Особый график"}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 transition-all"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center">
                    <Calendar className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                    <p className="text-sm text-gray-500 font-medium">
                      Специфических смен не запланировано
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <ScheduleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          fetchData();
          setIsModalOpen(false);
        }}
      />
    </div>
  );
}
