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
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Activity,
  Users,
  Watch,
  ArrowUpRight,
  Flame,
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
  const [isDark, setIsDark] = useState(false);

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
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatDateLong = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("ru-RU", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  const getTodayDayOfWeek = () => {
    const today = new Date();
    return (today.getDay() + 6) % 7;
  };

  const todayDayOfWeek = getTodayDayOfWeek();

  // Stats
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

  const getDuration = (startTime: string, endTime: string) => {
    return Math.round(
      (new Date(endTime).getTime() - new Date(startTime).getTime()) /
        (1000 * 60 * 60),
    );
  };

  const glassCls = isDark
    ? "bg-white/[0.07] backdrop-blur-2xl border border-white/[0.1] shadow-lg"
    : "bg-white border border-gray-200/70 shadow-sm";

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
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
                  Расписание
                </div>
              </div>

              <h1
                className={`text-4xl md:text-5xl lg:text-6xl font-black leading-none tracking-tight mb-3 ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                Моё{" "}
                <span
                  className={`${
                    isDark
                      ? "bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
                      : "bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                  }`}
                >
                  расписание
                </span>
              </h1>
              <p
                className={`text-base ${isDark ? "text-white/40" : "text-gray-400"}`}
              >
                {masterInfo
                  ? `${masterInfo.surname} ${masterInfo.name}`
                  : currentUser?.name || currentUser?.login || "Мастер"}{" "}
                · {stats.totalSchedules} смен всего
              </p>
            </div>

            {/* Right — actions */}
            <div className="flex gap-2.5 flex-wrap">
              {/* View mode toggle */}
              <div
                className={`flex rounded-xl overflow-hidden border ${
                  isDark
                    ? "border-white/[0.1] bg-white/[0.07]"
                    : "border-gray-200 bg-gray-50"
                }`}
              >
                <button
                  onClick={() => setViewMode("weekly")}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition-all ${
                    viewMode === "weekly"
                      ? isDark
                        ? "bg-indigo-500/20 text-indigo-300"
                        : "bg-blue-500 text-white"
                      : isDark
                        ? "text-white/50 hover:text-white/70"
                        : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <CalendarDays size={15} />
                  Еженедельное
                </button>
                <button
                  onClick={() => setViewMode("specific")}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition-all ${
                    viewMode === "specific"
                      ? isDark
                        ? "bg-indigo-500/20 text-indigo-300"
                        : "bg-blue-500 text-white"
                      : isDark
                        ? "text-white/50 hover:text-white/70"
                        : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <CalendarRange size={15} />
                  Конкретные даты
                </button>
              </div>

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

        {/* ── STAT CARDS ──────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2
                className={`text-lg font-black tracking-tight ${isDark ? "text-white/90" : "text-gray-900"}`}
              >
                {viewMode === "weekly" ? "Еженедельно" : "По датам"}
              </h2>
              <p
                className={`text-xs ${isDark ? "text-white/30" : "text-gray-400"}`}
              >
                Ключевые показатели
              </p>
            </div>
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                isDark
                  ? "border-white/[0.08] text-white/30"
                  : "border-gray-200 text-gray-400"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Card 1 */}
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
              <div
                className={`absolute -top-4 -right-4 w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 opacity-${isDark ? "15" : "8"} blur-xl`}
              />
              <div className="relative">
                <div className="inline-flex p-2 rounded-xl mb-3 bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25">
                  <CalendarDays size={22} className="text-white" />
                </div>
                <div
                  className={`text-3xl font-black leading-none mb-1 ${isDark ? "text-white" : "text-gray-900"}`}
                >
                  {loading ? "—" : stats.totalWeeklyDays}
                </div>
                <div
                  className={`text-sm font-semibold ${isDark ? "text-white/70" : "text-gray-700"}`}
                >
                  Дней в неделе
                </div>
                <div
                  className={`text-xs mt-0.5 ${isDark ? "text-white/35" : "text-gray-400"}`}
                >
                  С рабочими сменами
                </div>
              </div>
            </motion.div>

            {/* Card 2 */}
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
              <div
                className={`absolute -top-4 -right-4 w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 opacity-${isDark ? "15" : "8"} blur-xl`}
              />
              <div className="relative">
                <div className="inline-flex p-2 rounded-xl mb-3 bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25">
                  <Clock size={22} className="text-white" />
                </div>
                {stats.todaySchedules > 0 && (
                  <span className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                )}
                <div
                  className={`text-3xl font-black leading-none mb-1 ${isDark ? "text-white" : "text-gray-900"}`}
                >
                  {loading ? "—" : stats.todaySchedules}
                </div>
                <div
                  className={`text-sm font-semibold ${isDark ? "text-white/70" : "text-gray-700"}`}
                >
                  Смен сегодня
                </div>
                <div
                  className={`text-xs mt-0.5 ${isDark ? "text-white/35" : "text-gray-400"}`}
                >
                  Запланировано
                </div>
              </div>
            </motion.div>

            {/* Card 3 */}
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
              <div
                className={`absolute -top-4 -right-4 w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 opacity-${isDark ? "15" : "8"} blur-xl`}
              />
              <div className="relative">
                <div className="inline-flex p-2 rounded-xl mb-3 bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg shadow-purple-500/25">
                  <Users size={22} className="text-white" />
                </div>
                <div
                  className={`text-3xl font-black leading-none mb-1 ${isDark ? "text-white" : "text-gray-900"}`}
                >
                  {loading ? "—" : stats.totalSpecific}
                </div>
                <div
                  className={`text-sm font-semibold ${isDark ? "text-white/70" : "text-gray-700"}`}
                >
                  Специальных дат
                </div>
                <div
                  className={`text-xs mt-0.5 ${isDark ? "text-white/35" : "text-gray-400"}`}
                >
                  Всего смен
                </div>
              </div>
            </motion.div>

            {/* Card 4 */}
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
              <div
                className={`absolute -top-4 -right-4 w-20 h-20 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 opacity-${isDark ? "15" : "8"} blur-xl`}
              />
              <div className="relative">
                <div className="inline-flex p-2 rounded-xl mb-3 bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/25">
                  <Watch size={22} className="text-white" />
                </div>
                <div
                  className={`text-3xl font-black leading-none mb-1 ${isDark ? "text-white" : "text-gray-900"}`}
                >
                  {loading ? "—" : stats.totalSchedules}
                </div>
                <div
                  className={`text-sm font-semibold ${isDark ? "text-white/70" : "text-gray-700"}`}
                >
                  Всего смен
                </div>
                <div
                  className={`text-xs mt-0.5 ${isDark ? "text-white/35" : "text-gray-400"}`}
                >
                  В расписании
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ── WEEKLY VIEW ─────────────────────────────────────── */}
        {viewMode === "weekly" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {loading ? (
              <div className={`rounded-2xl p-16 text-center ${glassCls}`}>
                <div
                  className={`w-10 h-10 rounded-full border-3 border-t-transparent animate-spin mx-auto mb-4 ${
                    isDark ? "border-purple-400" : "border-blue-400"
                  }`}
                  style={{ borderWidth: 3 }}
                />
                <p
                  className={`text-sm ${isDark ? "text-white/40" : "text-gray-400"}`}
                >
                  Загрузка расписания...
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {DAYS_OF_WEEK.map((day, index) => {
                  const isToday = index === todayDayOfWeek;
                  const daySchedules = weeklySchedules[index] || [];

                  return (
                    <motion.div
                      key={day}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04 }}
                      className={`rounded-2xl overflow-hidden transition-all duration-300 ${
                        isDark
                          ? `bg-white/[0.05] border ${isToday ? "border-blue-400/30" : "border-white/[0.08]"} hover:bg-white/[0.07]`
                          : `bg-white border ${isToday ? "border-blue-300 shadow-md" : "border-gray-200/70 shadow-sm"}`
                      }`}
                    >
                      {/* Day header */}
                      <div
                        className={`px-5 py-4 flex items-center justify-between border-b ${
                          isDark ? "border-white/[0.07]" : "border-gray-100"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-md ${
                              isToday
                                ? "bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-500/30"
                                : isDark
                                  ? "bg-white/[0.07]"
                                  : "bg-gray-100"
                            }`}
                          >
                            <Calendar
                              size={16}
                              className={
                                isToday
                                  ? "text-white"
                                  : isDark
                                    ? "text-white/50"
                                    : "text-gray-500"
                              }
                            />
                          </div>
                          <div>
                            <h3
                              className={`font-black text-sm ${isDark ? "text-white" : "text-gray-900"}`}
                            >
                              {day}
                              {isToday && (
                                <span
                                  className={`ml-2 text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                    isDark
                                      ? "bg-blue-500/20 text-blue-300"
                                      : "bg-blue-100 text-blue-700"
                                  }`}
                                >
                                  СЕГОДНЯ
                                </span>
                              )}
                            </h3>
                            <p
                              className={`text-xs ${isDark ? "text-white/30" : "text-gray-400"}`}
                            >
                              {daySchedules.length}{" "}
                              {daySchedules.length === 1
                                ? "смена"
                                : daySchedules.length < 5
                                  ? "смены"
                                  : "смен"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Schedule list */}
                      <div className="p-3">
                        {daySchedules.length > 0 ? (
                          <div className="space-y-2">
                            {daySchedules.map((item) => {
                              const duration = getDuration(
                                item.startTime,
                                item.endTime,
                              );

                              return (
                                <div
                                  key={item.id}
                                  className={`group flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 cursor-default ${
                                    isDark
                                      ? "hover:bg-white/[0.06]"
                                      : "hover:bg-gray-50/80"
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    {/* Time block */}
                                    <div
                                      className={`text-center py-2 px-3 rounded-xl font-black text-xs leading-none ${
                                        isDark
                                          ? "bg-white/[0.07] text-white/90"
                                          : "bg-gray-100 text-gray-800"
                                      }`}
                                    >
                                      <div>{formatTime(item.startTime)}</div>
                                      <div
                                        className={`text-[10px] mt-0.5 font-semibold ${isDark ? "text-white/40" : "text-gray-500"}`}
                                      >
                                        {formatTime(item.endTime)}
                                      </div>
                                    </div>

                                    <div>
                                      <div
                                        className={`text-xs font-semibold ${isDark ? "text-white/70" : "text-gray-600"}`}
                                      >
                                        {duration}{" "}
                                        {duration === 1
                                          ? "час"
                                          : duration < 5
                                            ? "часа"
                                            : "часов"}
                                      </div>
                                      <div
                                        className={`text-[10px] ${isDark ? "text-white/25" : "text-gray-400"}`}
                                      >
                                        Длительность
                                      </div>
                                    </div>
                                  </div>

                                  <ArrowUpRight
                                    size={12}
                                    className={`opacity-0 group-hover:opacity-100 transition-opacity ${
                                      isDark ? "text-white/30" : "text-gray-400"
                                    }`}
                                  />
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="py-8 text-center">
                            <div
                              className={`w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center ${
                                isDark ? "bg-white/[0.05]" : "bg-gray-100"
                              }`}
                            >
                              <CalendarRange
                                size={20}
                                className={
                                  isDark ? "text-white/20" : "text-gray-300"
                                }
                              />
                            </div>
                            <p
                              className={`text-xs font-semibold ${isDark ? "text-white/40" : "text-gray-400"}`}
                            >
                              Выходной
                            </p>
                            <p
                              className={`text-[10px] mt-1 ${isDark ? "text-white/20" : "text-gray-300"}`}
                            >
                              Нет смен
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* ── SPECIFIC DATES VIEW ─────────────────────────────── */}
        {viewMode === "specific" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {loading ? (
              <div className={`rounded-2xl p-16 text-center ${glassCls}`}>
                <div
                  className={`w-10 h-10 rounded-full border-3 border-t-transparent animate-spin mx-auto mb-4 ${
                    isDark ? "border-purple-400" : "border-blue-400"
                  }`}
                  style={{ borderWidth: 3 }}
                />
                <p
                  className={`text-sm ${isDark ? "text-white/40" : "text-gray-400"}`}
                >
                  Загрузка расписания...
                </p>
              </div>
            ) : specificSchedules.length > 0 ? (
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {specificSchedules.map((item, index) => {
                    const scheduleDate = new Date(item.startTime);
                    const isToday =
                      scheduleDate.toDateString() ===
                      new Date().toDateString();
                    const isPast = scheduleDate < new Date();
                    const duration = getDuration(item.startTime, item.endTime);

                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ delay: Math.min(index * 0.04, 0.3) }}
                        whileHover={{ x: 4 }}
                        className={`rounded-2xl p-5 transition-all duration-200 cursor-default group ${
                          isDark
                            ? `bg-white/[0.05] border ${isToday ? "border-blue-400/30" : "border-white/[0.08]"} hover:bg-white/[0.07]`
                            : `bg-white border ${isToday ? "border-blue-300 shadow-md" : "border-gray-200/70 shadow-sm"}`
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          {/* Date badge */}
                          <div
                            className={`text-center py-3 px-4 rounded-xl flex-shrink-0 ${
                              isToday
                                ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25"
                                : isPast
                                  ? isDark
                                    ? "bg-white/[0.07] text-white/70"
                                    : "bg-gray-100 text-gray-600"
                                  : isDark
                                    ? "bg-white/[0.07] text-white/90"
                                    : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            <div className="text-[10px] uppercase font-bold leading-none opacity-60">
                              {scheduleDate.toLocaleDateString("ru-RU", {
                                month: "short",
                              })}
                            </div>
                            <div className="text-lg font-black leading-none">
                              {scheduleDate.getDate()}
                            </div>
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <div
                                  className={`font-bold text-base mb-0.5 ${isDark ? "text-white/90" : "text-gray-800"}`}
                                >
                                  {formatDateLong(item.startTime)}
                                </div>
                                <div
                                  className={`text-xs ${isDark ? "text-white/35" : "text-gray-400"}`}
                                >
                                  Специальная смена
                                </div>
                              </div>

                              {/* Status badge */}
                              <div
                                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold ${
                                  isToday
                                    ? isDark
                                      ? "bg-blue-500/20 text-blue-300"
                                      : "bg-blue-100 text-blue-700"
                                    : isPast
                                      ? isDark
                                        ? "bg-white/[0.06] text-white/40"
                                        : "bg-gray-100 text-gray-500"
                                      : isDark
                                        ? "bg-emerald-500/20 text-emerald-300"
                                        : "bg-emerald-100 text-emerald-700"
                                }`}
                              >
                                {isToday
                                  ? "СЕГОДНЯ"
                                  : isPast
                                    ? "ПРОШЛО"
                                    : "ПРЕДСТОИТ"}
                              </div>
                            </div>

                            {/* Time + Duration */}
                            <div className="flex items-center gap-6 mt-3">
                              <div className="flex items-center gap-2">
                                <Clock
                                  size={14}
                                  className={
                                    isDark ? "text-white/40" : "text-gray-400"
                                  }
                                />
                                <span
                                  className={`text-sm font-semibold ${isDark ? "text-white/80" : "text-gray-700"}`}
                                >
                                  {formatTime(item.startTime)} —{" "}
                                  {formatTime(item.endTime)}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <Watch
                                  size={14}
                                  className={
                                    isDark ? "text-white/40" : "text-gray-400"
                                  }
                                />
                                <span
                                  className={`text-sm font-semibold ${isDark ? "text-white/80" : "text-gray-700"}`}
                                >
                                  {duration}{" "}
                                  {duration === 1
                                    ? "час"
                                    : duration < 5
                                      ? "часа"
                                      : "часов"}
                                </span>
                              </div>
                            </div>

                            {/* Today indicator */}
                            {isToday && (
                              <div className="flex items-center gap-2 mt-3 text-xs text-blue-400">
                                <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                                <span className="font-semibold">
                                  Смена активна сегодня
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            ) : (
              <div className={`rounded-2xl p-16 text-center ${glassCls}`}>
                <div
                  className={`w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center ${isDark ? "bg-white/[0.07]" : "bg-gray-100"}`}
                >
                  <CalendarRange
                    size={26}
                    className={isDark ? "text-white/25" : "text-gray-300"}
                  />
                </div>
                <p
                  className={`text-lg font-bold mb-1 ${isDark ? "text-white/70" : "text-gray-600"}`}
                >
                  Нет специальных смен
                </p>
                <p
                  className={`text-sm ${isDark ? "text-white/30" : "text-gray-400"}`}
                >
                  Ваше расписание состоит только из регулярных еженедельных смен
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* ── FOOTER ──────────────────────────────────────────── */}
        {!loading && (
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
                Сегодня
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                Предстоит
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gray-400" />
                Прошло
              </div>
            </div>
            <span>
              {viewMode === "weekly"
                ? `${Object.keys(weeklySchedules).length} из 7 дней`
                : `${specificSchedules.length} специальных дат`}
            </span>
          </motion.div>
        )}
      </div>
    </div>
  );
}
