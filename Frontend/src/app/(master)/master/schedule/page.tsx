"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { masterScheduleService } from "@/services/schedule/schedule.service";
import { userService } from "@/services/user/user.service";
import { masterService } from "@/services/master/master.service";
import type { IMasterSchedule } from "@/types/schedule.types";
import type { IUser } from "@/types/user.types";
import type { IMaster } from "@/types/masters.type";
import {
  Calendar,
  Clock,
  CalendarDays,
  CalendarRange,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Target,
  Award,
  BarChart3,
  Sparkles,
  Watch,
  Calendar as CalendarIcon,
  TrendingUp,
  RefreshCw,
  Filter,
  Search,
  Shield,
  Zap,
  Users,
  Clock4,
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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<"weekly" | "specific">("weekly");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const loadData = async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    } else {
      setIsRefreshing(true);
    }

    try {
      const userData = await userService.getMe();
      setCurrentUser(userData.data);

      try {
        const allMasters = await masterService.getAll();
        const currentMaster = allMasters.find(
          (m) => m.id === userData.data.masterId,
        );
        setMasterInfo(currentMaster || null);
      } catch (err) {
        console.warn("Не удалось загрузить данные мастера:", err);
      }

      const allSchedules = await masterScheduleService.getAll();
      const masterSchedules = allSchedules.filter((schedule) => {
        const scheduleMasterId = schedule.masterId || schedule.master?.id;
        return scheduleMasterId === userData.data.masterId;
      });

      setSchedules(masterSchedules);
    } catch (err) {
      console.error("Ошибка загрузки данных", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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

  const getTodayDayOfWeek = () => {
    const today = new Date();
    return (today.getDay() + 6) % 7;
  };

  const todayDayOfWeek = getTodayDayOfWeek();

  // Статистика
  const stats = useMemo(() => {
    const totalWeeklyDays = Object.keys(weeklySchedules).length;
    const todaySchedules = schedules.filter(
      (s) => s.dayOfWeek === todayDayOfWeek,
    ).length;
    const totalSchedules = schedules.length;
    const totalSpecific = specificSchedules.length;
    const upcomingSpecific = upcomingSpecificSchedules.length;
    const todaySpecific = specificSchedules.filter(
      (s) => new Date(s.startTime).toDateString() === new Date().toDateString(),
    ).length;

    return {
      totalWeeklyDays,
      todaySchedules,
      totalSchedules,
      totalSpecific,
      upcomingSpecific,
      todaySpecific,
    };
  }, [
    schedules,
    weeklySchedules,
    specificSchedules,
    upcomingSpecificSchedules,
    todayDayOfWeek,
  ]);

  const getDayColor = (dayIndex: number) => {
    if (dayIndex === todayDayOfWeek) return "from-blue-500 to-cyan-500";
    const colors = [
      "from-indigo-500 to-purple-500",
      "from-emerald-500 to-green-500",
      "from-amber-500 to-orange-500",
      "from-rose-500 to-red-500",
      "from-violet-500 to-pink-500",
      "from-cyan-500 to-blue-500",
      "from-purple-500 to-indigo-500",
    ];
    return colors[dayIndex % colors.length];
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
                    Мое расписание
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Добро пожаловать,{" "}
                    <span className="font-semibold text-gray-900">
                      {masterInfo
                        ? `${masterInfo.surname} ${masterInfo.name}`
                        : currentUser?.name || currentUser?.login || "Мастер"}
                    </span>
                    ! Управляйте своим рабочим расписанием.
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
                Детали
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

          {/* Панель переключения режимов */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Режим просмотра:
                </h3>
                <div className="flex gap-2 not-sm:flex-col">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setViewMode("weekly")}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-300 border ${
                      viewMode === "weekly"
                        ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md border-transparent"
                        : "bg-white/80 text-gray-700 border-gray-300/50 hover:bg-gray-50/80"
                    }`}
                  >
                    <CalendarDays className="w-4 h-4" />
                    Еженедельное
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setViewMode("specific")}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-300 border ${
                      viewMode === "specific"
                        ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md border-transparent"
                        : "bg-white/80 text-gray-700 border-gray-300/50 hover:bg-gray-50/80"
                    }`}
                  >
                    <CalendarRange className="w-4 h-4" />
                    Конкретные даты
                  </motion.button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200/50">
                  <Shield className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-sm">
                  <div className="font-medium text-gray-900">
                    Только просмотр
                  </div>
                  <div className="text-gray-500">Редактирование недоступно</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {viewMode === "weekly" ? (
            <>
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-20">
                  <CalendarDays className="w-16 h-16" />
                </div>
                <div className="relative z-10">
                  <div className="text-4xl font-bold mb-2">
                    {stats.totalWeeklyDays}
                  </div>
                  <div className="text-blue-100 font-medium">Дней в неделе</div>
                  <div className="text-sm text-blue-200/80 mt-2">
                    С рабочими сменами
                  </div>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-emerald-500 to-green-500 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-20">
                  <Clock className="w-16 h-16" />
                </div>
                <div className="relative z-10">
                  <div className="text-4xl font-bold mb-2">
                    {stats.todaySchedules}
                  </div>
                  <div className="text-emerald-100 font-medium">
                    Смен сегодня
                  </div>
                  <div className="text-sm text-emerald-200/80 mt-2">
                    Запланировано на сегодня
                  </div>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-20">
                  <BarChart3 className="w-16 h-16" />
                </div>
                <div className="relative z-10">
                  <div className="text-4xl font-bold mb-2">
                    {stats.totalSchedules}
                  </div>
                  <div className="text-purple-100 font-medium">Всего смен</div>
                  <div className="text-sm text-purple-200/80 mt-2">
                    В расписании
                  </div>
                </div>
              </motion.div>
            </>
          ) : (
            <>
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-20">
                  <CalendarRange className="w-16 h-16" />
                </div>
                <div className="relative z-10">
                  <div className="text-4xl font-bold mb-2">
                    {stats.totalSpecific}
                  </div>
                  <div className="text-amber-100 font-medium">
                    Специальных дат
                  </div>
                  <div className="text-sm text-amber-200/80 mt-2">
                    Всего смен на даты
                  </div>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-indigo-500 to-blue-500 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-20">
                  <TrendingUp className="w-16 h-16" />
                </div>
                <div className="relative z-10">
                  <div className="text-4xl font-bold mb-2">
                    {stats.upcomingSpecific}
                  </div>
                  <div className="text-indigo-100 font-medium">Предстоящие</div>
                  <div className="text-sm text-indigo-200/80 mt-2">
                    Будущие специальные смены
                  </div>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-rose-500 to-pink-500 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-20">
                  <Zap className="w-16 h-16" />
                </div>
                <div className="relative z-10">
                  <div className="text-4xl font-bold mb-2">
                    {stats.todaySpecific}
                  </div>
                  <div className="text-rose-100 font-medium">Сегодня</div>
                  <div className="text-sm text-rose-200/80 mt-2">
                    Специальные смены сегодня
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-500 font-medium">
              Загрузка расписания...
            </p>
          </div>
        ) : viewMode === "weekly" ? (
          <>
            {/* Еженедельное расписание */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
              <AnimatePresence>
                {DAYS_OF_WEEK.map((day, index) => (
                  <motion.div
                    key={day}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.01, y: -2 }}
                    className={`bg-gradient-to-br from-white to-gray-50/50 rounded-3xl border ${
                      index === todayDayOfWeek
                        ? "border-blue-300/50 shadow-xl ring-2 ring-blue-100/50"
                        : "border-gray-200/50"
                    } p-5 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm`}
                  >
                    {/* Заголовок дня */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getDayColor(index)} flex items-center justify-center`}
                        >
                          <Calendar className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg">
                            {day}
                            {index === todayDayOfWeek && (
                              <span className="ml-2 text-xs bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-2 py-0.5 rounded-full font-bold">
                                СЕГОДНЯ
                              </span>
                            )}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {weeklySchedules[index]?.length || 0} смен
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Список смен */}
                    <div className="space-y-3">
                      {weeklySchedules[index]?.map((item) => {
                        const duration = Math.round(
                          (new Date(item.endTime).getTime() -
                            new Date(item.startTime).getTime()) /
                            (1000 * 60 * 60),
                        );

                        return (
                          <motion.div
                            key={item.id}
                            whileHover={{ scale: 1.02 }}
                            className="group bg-gradient-to-r from-gray-50/50 to-white/30 p-4 rounded-2xl border border-gray-200/30 hover:border-blue-200/50 transition-all duration-200 backdrop-blur-sm"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-blue-500" />
                                <span className="font-bold text-gray-900">
                                  {formatTime(item.startTime)} —{" "}
                                  {formatTime(item.endTime)}
                                </span>
                              </div>
                              <CheckCircle className="w-4 h-4 text-emerald-500" />
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2 text-gray-600">
                                <Watch className="w-3.5 h-3.5" />
                                <span>{duration} часов</span>
                              </div>
                              <span className="text-xs bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                                Регулярная
                              </span>
                            </div>
                          </motion.div>
                        );
                      })}

                      {!weeklySchedules[index] && (
                        <div className="text-center py-6 border-2 border-dashed border-gray-200/50 rounded-2xl">
                          <XCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                          <p className="text-gray-400 font-medium">Выходной</p>
                          <p className="text-gray-300 text-sm mt-1">
                            Нет запланированных смен
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Подсказка */}
            <div className="bg-gradient-to-r from-blue-50/50 to-cyan-50/50 rounded-2xl p-6 border border-blue-200/50 backdrop-blur-sm">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl">
                  <CalendarDays className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">
                    Еженедельное расписание
                  </h4>
                  <p className="text-gray-600 text-sm">
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
            {/* Конкретные даты */}
            {/* Конкретные даты */}
            <div className="bg-gradient-to-br from-white/90 to-white/50 rounded-2xl border border-gray-200/30 shadow-sm backdrop-blur-sm overflow-hidden mb-8">
              {specificSchedules.length > 0 ? (
                <div className="p-4 md:p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl">
                        <CalendarRange className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          Специальные смены
                        </h3>
                        <p className="text-sm text-gray-600">
                          {specificSchedules.length}{" "}
                          {specificSchedules.length === 1
                            ? "смена"
                            : specificSchedules.length < 5
                              ? "смены"
                              : "смен"}{" "}
                          на конкретные даты
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full">
                        {upcomingSpecificSchedules.length} предстоит
                      </span>
                      <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
                        {specificSchedules.length -
                          upcomingSpecificSchedules.length}{" "}
                        прошло
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {specificSchedules.map((item, index) => {
                      const scheduleDate = new Date(item.startTime);
                      const isToday =
                        scheduleDate.toDateString() ===
                        new Date().toDateString();
                      const isPast = scheduleDate < new Date();
                      const isUpcoming = scheduleDate >= new Date();
                      const duration = Math.round(
                        (new Date(item.endTime).getTime() -
                          new Date(item.startTime).getTime()) /
                          (1000 * 60 * 60),
                      );

                      return (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ y: -2 }}
                          className={`group relative overflow-hidden rounded-xl border transition-all duration-200 hover:shadow-md ${
                            isToday
                              ? "border-blue-300/50 bg-gradient-to-br from-blue-50/50 to-cyan-50/30"
                              : isPast
                                ? "border-gray-200/50 bg-white/50"
                                : "border-emerald-200/50 bg-gradient-to-br from-emerald-50/30 to-green-50/20"
                          }`}
                        >
                          {/* Цветной индикатор */}
                          <div
                            className={`absolute top-0 left-0 right-0 h-1 ${
                              isToday
                                ? "bg-gradient-to-r from-blue-500 to-cyan-500"
                                : isPast
                                  ? "bg-gradient-to-r from-gray-400 to-gray-500"
                                  : "bg-gradient-to-r from-emerald-500 to-green-500"
                            }`}
                          />

                          <div className="p-4">
                            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                              {/* Дата в кружке */}
                              <div className="flex-shrink-0">
                                <div
                                  className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center ${
                                    isToday
                                      ? "bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg"
                                      : isPast
                                        ? "bg-gradient-to-br from-gray-400 to-gray-500"
                                        : "bg-gradient-to-br from-emerald-500 to-green-500 shadow-lg"
                                  } text-white not-sm:w-full`}
                                >
                                  <span className="text-[10px] uppercase font-bold leading-none mb-0.5">
                                    {scheduleDate.toLocaleDateString("ru-RU", {
                                      month: "short",
                                    })}
                                  </span>
                                  <span className="text-lg font-black leading-none">
                                    {scheduleDate.getDate()}
                                  </span>
                                </div>
                              </div>

                              {/* Основная информация */}
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
                                  <div className="flex-1">
                                    <h4 className="font-bold text-gray-900 text-sm sm:text-base mb-1">
                                      {formatDate(item.startTime)}
                                    </h4>
                                    <p className="text-xs sm:text-sm text-gray-600">
                                      {scheduleDate.toLocaleDateString(
                                        "ru-RU",
                                        { weekday: "long" },
                                      )}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span
                                      className={`px-2 py-1 text-[10px] sm:text-xs font-medium rounded-full ${
                                        isToday
                                          ? "bg-blue-100 text-blue-700"
                                          : isPast
                                            ? "bg-gray-100 text-gray-600"
                                            : "bg-emerald-100 text-emerald-700"
                                      }`}
                                    >
                                      {isToday
                                        ? "СЕГОДНЯ"
                                        : isPast
                                          ? "ПРОШЛО"
                                          : "ПРЕДСТОИТ"}
                                    </span>
                                    <span className="text-[10px] sm:text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">
                                      СПЕЦИАЛЬНАЯ
                                    </span>
                                  </div>
                                </div>

                                {/* Время и длительность */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <div className="flex items-center gap-3 p-2 bg-gray-50/50 rounded-lg">
                                    <div
                                      className={`p-1.5 rounded-lg ${
                                        isToday
                                          ? "bg-blue-100"
                                          : isPast
                                            ? "bg-gray-100"
                                            : "bg-emerald-100"
                                      }`}
                                    >
                                      <Clock
                                        className={`w-4 h-4 ${
                                          isToday
                                            ? "text-blue-500"
                                            : isPast
                                              ? "text-gray-500"
                                              : "text-emerald-500"
                                        }`}
                                      />
                                    </div>
                                    <div>
                                      <div className="text-xs text-gray-600">
                                        Время работы
                                      </div>
                                      <div className="text-sm font-medium text-gray-900">
                                        {formatTime(item.startTime)} —{" "}
                                        {formatTime(item.endTime)}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-3 p-2 bg-gray-50/50 rounded-lg">
                                    <div
                                      className={`p-1.5 rounded-lg ${
                                        isToday
                                          ? "bg-cyan-100"
                                          : isPast
                                            ? "bg-gray-100"
                                            : "bg-green-100"
                                      }`}
                                    >
                                      <Watch
                                        className={`w-4 h-4 ${
                                          isToday
                                            ? "text-cyan-500"
                                            : isPast
                                              ? "text-gray-500"
                                              : "text-green-500"
                                        }`}
                                      />
                                    </div>
                                    <div>
                                      <div className="text-xs text-gray-600">
                                        Длительность
                                      </div>
                                      <div className="text-sm font-medium text-gray-900">
                                        {duration}{" "}
                                        {duration === 1
                                          ? "час"
                                          : duration < 5
                                            ? "часа"
                                            : "часов"}
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Индикатор для сегодняшней смены */}
                                {isToday && (
                                  <div className="mt-3 flex items-center gap-2 text-xs text-blue-600">
                                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                    <span className="font-medium">
                                      Смена активна сегодня
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="p-8 md:p-12 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CalendarRange className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    Нет специальных смен
                  </h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    Ваше расписание состоит только из регулярных еженедельных
                    смен
                  </p>
                </div>
              )}
            </div>

            {/* Подсказка */}
            <div className="bg-gradient-to-r from-amber-50/50 to-orange-50/50 rounded-2xl p-6 border border-amber-200/50 backdrop-blur-sm">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl">
                  <CalendarRange className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">
                    Специальные смены
                  </h4>
                  <p className="text-gray-600 text-sm">
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

        {/* Информация внизу */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-sm text-gray-500 mt-8">
          <div className="flex items-center gap-4 not-sm:flex-col">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"></div>
              <span>Сегодняшний день</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-500 to-green-500"></div>
              <span>Регулярные смены</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-amber-500 to-orange-500"></div>
              <span>Специальные смены</span>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-8">
            <span>
              Показано:{" "}
              {viewMode === "weekly"
                ? `${Object.keys(weeklySchedules).length} из 7 дней`
                : `${specificSchedules.length} специальных дат`}
            </span>
            <span className="text-blue-600 font-medium flex items-center gap-2">
              <Users className="w-4 h-4" />
              {currentUser?.login
                ? `Логин: ${currentUser.login}`
                : "Режим просмотра"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
