"use client";

import { useState, useEffect, useMemo } from "react";
import { masterScheduleService } from "@/services/schedule/schedule.service";
import { userService } from "@/services/user/user.service";
import type { IMasterSchedule } from "@/types/schedule.types";
import type { IUser } from "@/types/user.types";
import { masterService } from "@/services/master/master.service";
import type { IMaster } from "@/types/masters.type";
import {
  Calendar,
  Clock,
  CalendarDays,
  CalendarRange,
  CheckCircle,
  XCircle,
} from "lucide-react";

const DAYS_OF_WEEK = [
  "Понедельник",
  "Вторник",
  "Среда",
  "Четверг",
  "Пятница",
  "Суббота",
  "Воскресенье",
];

export default function MasterSchedule() {
  const [schedules, setSchedules] = useState<IMasterSchedule[]>([]);
  const [currentUser, setCurrentUser] = useState<IUser | null>(null);
  const [masterInfo, setMasterInfo] = useState<IMaster | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"weekly" | "specific">("weekly");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Получаем информацию о текущем пользователе-мастере
        const userData = await userService.getMe();
        setCurrentUser(userData.data);

        // Получаем информацию о мастере из таблицы мастеров
        try {
          // Получаем всех мастеров и находим текущего
          const allMasters = await masterService.getAll();
          const currentMaster = allMasters.find(
            (m) => m.id === userData.data.masterId,
          );
          setMasterInfo(currentMaster || null);
        } catch (err) {
          console.warn("Не удалось загрузить данные мастера:", err);
        }

        // Получаем все расписания - ЭТО ВАЖНО!
        const allSchedules = await masterScheduleService.getAll();

        // Фильтруем расписания только для текущего мастера
        const masterSchedules = allSchedules.filter((schedule) => {
          const scheduleMasterId = schedule.masterId || schedule.master?.id;
          return scheduleMasterId === userData.data.masterId;
        });

        setSchedules(masterSchedules);
      } catch (err) {
        console.error("Ошибка загрузки данных", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Разделяем расписания на шаблонные (еженедельные) и конкретные даты
  const weeklySchedules = useMemo(() => {
    const groups: Record<number, IMasterSchedule[]> = {};
    schedules
      .filter((s) => s.dayOfWeek !== null && s.dayOfWeek !== undefined)
      .forEach((s) => {
        if (!groups[s.dayOfWeek!]) groups[s.dayOfWeek!] = [];
        groups[s.dayOfWeek!].push(s);
      });
    return groups;
  }, [schedules]);

  const specificSchedules = useMemo(() => {
    return schedules
      .filter((s) => s.dayOfWeek === null || s.dayOfWeek === undefined)
      .sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
      );
  }, [schedules]);

  // Фильтруем будущие расписания
  const upcomingSpecificSchedules = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return specificSchedules.filter((s) => new Date(s.startTime) >= today);
  }, [specificSchedules]);

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("ru-RU", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Получаем сегодняшний день недели
  const getTodayDayOfWeek = () => {
    const today = new Date();
    return (today.getDay() + 6) % 7; // 0 = Пн ... 6 = Вс
  };

  const todayDayOfWeek = getTodayDayOfWeek();

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Заголовок и приветствие */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                Мое расписание
              </h1>
              <p className="text-gray-600">
                Приветствую,{" "}
                <span className="font-semibold">
                  {masterInfo
                    ? `${masterInfo.surname} ${masterInfo.name}`
                    : currentUser?.name || currentUser?.login || "Мастер"}
                </span>
                ! Здесь вы можете просмотреть свое рабочее расписание.
              </p>
            </div>
            <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2 border border-gray-200">
              <Calendar className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">
                Только просмотр
              </span>
            </div>
          </div>

          {/* Переключатель режимов просмотра */}
          <div className="bg-white rounded-xl md:rounded-2xl p-4 shadow-sm border border-gray-200 mb-6">
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("weekly")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all ${
                  viewMode === "weekly"
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                }`}
              >
                <CalendarDays className="w-5 h-5" />
                Еженедельное
              </button>
              <button
                onClick={() => setViewMode("specific")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all ${
                  viewMode === "specific"
                    ? "bg-purple-50 text-purple-700 border border-purple-200"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                }`}
              >
                <CalendarRange className="w-5 h-5" />
                Конкретные даты
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
            <p className="mt-4 text-gray-500">Загрузка расписания...</p>
          </div>
        ) : viewMode === "weekly" ? (
          <>
            {/* Статистика недельного расписания */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl md:rounded-2xl p-4 md:p-6 text-white">
                <div className="text-2xl md:text-3xl font-bold mb-2">
                  {Object.keys(weeklySchedules).length}
                </div>
                <div className="text-blue-100 text-sm md:text-base">
                  Дней в неделе
                </div>
                <div className="text-xs md:text-sm text-blue-200 mt-1">
                  С рабочими сменами
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl md:rounded-2xl p-4 md:p-6 text-white">
                <div className="text-2xl md:text-3xl font-bold mb-2">
                  {
                    schedules.filter((s) => s.dayOfWeek === todayDayOfWeek)
                      .length
                  }
                </div>
                <div className="text-green-100 text-sm md:text-base">
                  Сегодня
                </div>
                <div className="text-xs md:text-sm text-green-200 mt-1">
                  Смен на сегодня
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl md:rounded-2xl p-4 md:p-6 text-white">
                <div className="text-2xl md:text-3xl font-bold mb-2">
                  {schedules.length}
                </div>
                <div className="text-purple-100 text-sm md:text-base">
                  Всего смен
                </div>
                <div className="text-xs md:text-sm text-purple-200 mt-1">
                  В расписании
                </div>
              </div>
            </div>

            {/* Еженедельное расписание - исправленная сетка */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {DAYS_OF_WEEK.map((day, index) => (
                <div
                  key={day}
                  className={`
            bg-white p-4 md:p-5 rounded-xl md:rounded-2xl border transition-all
            ${index === todayDayOfWeek ? "border-blue-300 shadow-lg ring-1 ring-blue-100" : "border-gray-200 hover:border-gray-300 hover:shadow-md"}
            ${index === DAYS_OF_WEEK.length - 1 ? "col-span-full" : ""}
            `}
                >
                  {/* Заголовок дня */}
                  <div
                    className={`flex justify-between items-center mb-3 md:mb-4 pb-2 md:pb-3 border-b ${
                      index === todayDayOfWeek
                        ? "border-blue-100"
                        : "border-gray-100"
                    }`}
                  >
                    <div>
                      <span
                        className={`font-bold text-sm md:text-base ${
                          index === todayDayOfWeek
                            ? "text-blue-700"
                            : "text-gray-800"
                        }`}
                      >
                        {day}
                      </span>
                      {index === todayDayOfWeek && (
                        <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                          Сегодня
                        </span>
                      )}
                    </div>
                    <div
                      className={`text-[10px] md:text-xs px-2 py-1 rounded-md font-medium ${
                        weeklySchedules[index]?.length
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {weeklySchedules[index]?.length || 0} смен
                    </div>
                  </div>

                  {/* Список смен */}
                  <div className="space-y-2 md:space-y-3">
                    {weeklySchedules[index]?.map((item) => (
                      <div
                        key={item.id}
                        className="group bg-gradient-to-r from-gray-50 to-white hover:from-blue-50 hover:to-white p-3 rounded-lg md:rounded-xl border border-gray-100 hover:border-blue-200 transition-all duration-200"
                      >
                        <div className="flex justify-between items-center mb-1">
                          <div className="flex items-center gap-2 text-blue-900 font-semibold text-sm md:text-base">
                            <Clock className="w-3 h-3 md:w-4 md:h-4 text-blue-500 flex-shrink-0" />
                            <span className="truncate">
                              {formatTime(item.startTime)} —{" "}
                              {formatTime(item.endTime)}
                            </span>
                          </div>
                          <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-500 flex-shrink-0" />
                        </div>

                        {/* Дополнительная информация */}
                        <div className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>
                            Длительность:{" "}
                            {Math.round(
                              (new Date(item.endTime).getTime() -
                                new Date(item.startTime).getTime()) /
                                (1000 * 60 * 60),
                            )}
                            ч
                          </span>
                        </div>
                      </div>
                    ))}

                    {/* Сообщение если нет смен */}
                    {!weeklySchedules[index] && (
                      <div className="text-center py-3 md:py-4 border-2 border-dashed border-gray-100 rounded-lg md:rounded-xl">
                        <XCircle className="w-5 h-5 md:w-6 md:h-6 text-gray-300 mx-auto mb-1" />
                        <span className="text-xs text-gray-400 font-medium">
                          Выходной
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Подсказка */}
            <div className="mt-6 md:mt-8 p-4 bg-blue-50 border border-blue-100 rounded-xl">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800 mb-1">
                    Еженедельное расписание
                  </p>
                  <p className="text-xs text-blue-600">
                    Это ваше регулярное расписание на каждую неделю. Смены,
                    отмеченные синим цветом — сегодняшние. Для просмотра
                    изменений в конкретные даты переключитесь на вкладку
                    «Конкретные даты».
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Статистика конкретных дат */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl md:rounded-2xl p-4 md:p-6 text-white">
                <div className="text-2xl md:text-3xl font-bold mb-2">
                  {specificSchedules.length}
                </div>
                <div className="text-purple-100 text-sm md:text-base">
                  Всего дат
                </div>
                <div className="text-xs md:text-sm text-purple-200 mt-1">
                  Специальные смены
                </div>
              </div>

              <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl md:rounded-2xl p-4 md:p-6 text-white">
                <div className="text-2xl md:text-3xl font-bold mb-2">
                  {upcomingSpecificSchedules.length}
                </div>
                <div className="text-indigo-100 text-sm md:text-base">
                  Предстоящие
                </div>
                <div className="text-xs md:text-sm text-indigo-200 mt-1">
                  Будущие специальные смены
                </div>
              </div>

              <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl md:rounded-2xl p-4 md:p-6 text-white">
                <div className="text-2xl md:text-3xl font-bold mb-2">
                  {
                    specificSchedules.filter(
                      (s) =>
                        new Date(s.startTime).toDateString() ===
                        new Date().toDateString(),
                    ).length
                  }
                </div>
                <div className="text-pink-100 text-sm md:text-base">
                  Сегодня
                </div>
                <div className="text-xs md:text-sm text-pink-200 mt-1">
                  Специальные смены сегодня
                </div>
              </div>
            </div>

            {/* Список конкретных дат */}
            <div className="bg-white rounded-xl md:rounded-2xl border border-gray-200 overflow-hidden">
              {specificSchedules.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {specificSchedules.map((item) => {
                    const scheduleDate = new Date(item.startTime);
                    const isToday =
                      scheduleDate.toDateString() === new Date().toDateString();
                    const isPast = scheduleDate < new Date();
                    const isUpcoming = scheduleDate >= new Date();

                    return (
                      <div
                        key={item.id}
                        className={`p-4 md:p-5 transition-colors ${
                          isToday
                            ? "bg-blue-50"
                            : isPast
                              ? "bg-gray-50"
                              : "hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                          {/* Дата */}
                          <div className="flex items-center gap-4">
                            <div
                              className={`flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-xl flex flex-col items-center justify-center shadow ${
                                isToday
                                  ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white"
                                  : isPast
                                    ? "bg-gradient-to-br from-gray-400 to-gray-500 text-white"
                                    : "bg-gradient-to-br from-purple-500 to-indigo-600 text-white"
                              }`}
                            >
                              <span className="text-[10px] uppercase font-bold leading-none mb-0.5">
                                {scheduleDate.toLocaleDateString("ru-RU", {
                                  month: "short",
                                })}
                              </span>
                              <span className="text-lg md:text-xl font-black leading-none">
                                {scheduleDate.getDate()}
                              </span>
                            </div>

                            <div>
                              <div className="font-bold text-gray-900 text-sm md:text-base">
                                {formatDate(item.startTime)}
                              </div>
                              <div className="text-xs text-gray-600 mt-1 flex items-center gap-2">
                                <div
                                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                                    isToday
                                      ? "bg-blue-100 text-blue-700"
                                      : isPast
                                        ? "bg-gray-100 text-gray-600"
                                        : "bg-green-100 text-green-700"
                                  }`}
                                >
                                  {isToday && "Сегодня"}
                                  {isPast && !isToday && "Прошло"}
                                  {isUpcoming && !isToday && "Предстоящая"}
                                </div>
                                <div className="flex items-center gap-1 text-gray-500">
                                  <Clock className="w-3 h-3" />
                                  {formatTime(item.startTime)} —{" "}
                                  {formatTime(item.endTime)}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Статус и длительность */}
                          <div className="flex flex-col items-end gap-1">
                            <div
                              className={`px-3 py-1 rounded-lg text-xs font-medium ${
                                !isPast
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-green-100 text-green-700"
                              }`}
                            >
                              {isPast ? "Завершено" : "Активно"}
                            </div>
                            <div className="text-xs text-gray-500">
                              Длительность:{" "}
                              {Math.round(
                                (new Date(item.endTime).getTime() -
                                  new Date(item.startTime).getTime()) /
                                  (1000 * 60 * 60),
                              )}
                              ч
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 md:p-12 text-center">
                  <CalendarRange className="w-12 h-12 md:w-16 md:h-16 text-gray-200 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium text-base md:text-lg mb-2">
                    Нет запланированных специальных смен
                  </p>
                  <p className="text-gray-400 text-sm">
                    Ваше расписание состоит только из регулярных еженедельных
                    смен
                  </p>
                </div>
              )}
            </div>

            {/* Подсказка */}
            <div className="mt-6 md:mt-8 p-4 bg-purple-50 border border-purple-100 rounded-xl">
              <div className="flex items-start gap-3">
                <CalendarRange className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-purple-800 mb-1">
                    Специальные смены
                  </p>
                  <p className="text-xs text-purple-600">
                    Здесь отображаются смены, назначенные на конкретные даты.
                    Смены выделенные синим — сегодняшние. Серым цветом отмечены
                    прошедшие смены. Для просмотра регулярного расписания
                    вернитесь на вкладку «Еженедельное».
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
