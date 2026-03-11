"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { masterScheduleService } from "@/services/schedule/schedule.service";
import { masterService } from "@/services/master/master.service";
import type { IMasterSchedule } from "@/types/schedule.types";
import type { IMaster } from "@/types/masters.type";
import ScheduleModal from "./ScheduleModal";
import { 
  Trash2, 
  Calendar, 
  Clock, 
  Plus, 
  User, 
  ChevronDown, 
  Filter,
  RefreshCw,
  CalendarDays,
  CalendarRange,
  Zap,
  Users,
  TrendingUp,
  Shield
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

export default function MasterSchedulePage() {
  const [schedules, setSchedules] = useState<IMasterSchedule[]>([]);
  const [masters, setMasters] = useState<IMaster[]>([]);
  const [selectedMasterId, setSelectedMasterId] = useState<number | "all">("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Маппинг мастеров с безопасным доступом
  const mastersLookup = useMemo(() => {
    const lookup: Record<string, string> = {};
    masters.forEach((m) => {
      if (m?.id !== undefined && m?.id !== null) {
        const displayName = `${m.surname || ""} ${m.name ? m.name[0] + "." : ""}`;
        lookup[String(m.id)] = displayName.trim();
      }
    });
    return lookup;
  }, [masters]);

  const fetchData = async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    } else {
      setIsRefreshing(true);
    }
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
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredSchedules = useMemo(() => {
    if (selectedMasterId === "all") return schedules;
    return schedules.filter((s) => {
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

  // Статистика
  const stats = useMemo(() => {
    const totalSchedules = filteredSchedules.length;
    const weeklySchedules = filteredSchedules.filter(s => s.dayOfWeek !== null && s.dayOfWeek !== undefined).length;
    const specificSchedulesCount = filteredSchedules.filter(s => s.dayOfWeek === null || s.dayOfWeek === undefined).length;
    const activeMasters = masters.length;
    
    return { totalSchedules, weeklySchedules, specificSchedulesCount, activeMasters };
  }, [filteredSchedules, masters]);

  const handleDelete = async (id: number) => {
    if (!confirm("Удалить эту запись из расписания?")) return;
    try {
      await masterScheduleService.delete(id);
      fetchData(false);
    } catch (err) {
      alert("Ошибка при удалении");
    }
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  };

  const getMasterDisplayName = (item: IMasterSchedule): string => {
    if (selectedMasterId === "all") {
      if (item.master && item.master.surname) {
        return `${item.master.surname} ${item.master.name ? item.master.name[0] + "." : ""}`.trim();
      }
      const masterId = item.masterId || (item as any).masterID;
      if (masterId !== undefined && masterId !== null) {
        const masterName = mastersLookup[String(masterId)];
        if (masterName && masterName !== "undefined") {
          return masterName;
        }
      }
      return "Мастер";
    }
    return "Особый график";
  };

  const getWeeklyMasterDisplayName = (item: IMasterSchedule): string => {
    if (selectedMasterId === "all" && item.master) {
      if (item.master.surname) {
        return `${item.master.surname} ${item.master.name ? item.master.name[0] + "." : ""}`;
      }
    }
    return "";
  };

  const getMasterInitial = (item: IMasterSchedule): string => {
    if (selectedMasterId === "all" && item.master && item.master.surname) {
      return item.master.surname[0]?.toUpperCase() || "М";
    }
    return "М";
  };

  // Получение цвета для дня недели
  const getDayColor = (index: number) => {
    const colors = [
      'from-blue-500 to-cyan-500',
      'from-emerald-500 to-green-500',
      'from-purple-500 to-pink-500',
      'from-amber-500 to-orange-500',
      'from-rose-500 to-red-500',
      'from-indigo-500 to-blue-500',
      'from-violet-500 to-purple-500'
    ];
    return colors[index % colors.length];
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
                <div className="p-2.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl">
                  <CalendarDays className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                  Рабочее расписание
                </h1>
              </motion.div>
              <p className="text-gray-600">
                Управление рабочими часами и сменами сотрудников
              </p>
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
                {isFilterOpen ? <ChevronDown className="w-4 h-4 rotate-180" /> : <ChevronDown className="w-4 h-4" />}
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => fetchData(false)}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-300/50 text-gray-700 rounded-xl font-medium hover:bg-gray-50/80 transition-all duration-300 shadow-sm"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
                Обновить
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsModalOpen(true)}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:from-amber-700 hover:to-orange-700"
              >
                <Plus className="w-5 h-5" />
                Добавить смену
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
                    <div className="relative">
                      <User className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <select
                        value={selectedMasterId}
                        onChange={(e) =>
                          setSelectedMasterId(
                            e.target.value === "all" ? "all" : Number(e.target.value)
                          )
                        }
                        className="w-full pl-10 pr-4 py-3.5 bg-white/90 backdrop-blur-sm border border-gray-300/50 rounded-2xl focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-gray-900 transition-all duration-300"
                      >
                        <option value="all">Все сотрудники</option>
                        {masters.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.surname} {m.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="flex items-center justify-end">
                      <div className="bg-gradient-to-r from-gray-100 to-gray-50/50 px-4 py-3 rounded-xl border border-gray-200/50">
                        <span className="text-sm font-medium text-gray-700">
                          Всего записей: <span className="font-bold text-gray-900">{stats.totalSchedules}</span>
                        </span>
                      </div>
                    </div>
                  </div>
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
            className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-20">
              <CalendarDays className="w-16 h-16" />
            </div>
            <div className="relative z-10">
              <div className="text-4xl font-bold mb-2">{stats.totalSchedules}</div>
              <div className="text-blue-100 font-medium">Всего смен</div>
              <div className="text-sm text-blue-200/80 mt-2">Запланировано</div>
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
              <Zap className="w-16 h-16" />
            </div>
            <div className="relative z-10">
              <div className="text-4xl font-bold mb-2">{stats.weeklySchedules}</div>
              <div className="text-emerald-100 font-medium">Еженедельные</div>
              <div className="text-sm text-emerald-200/80 mt-2">Повторяются</div>
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
              <CalendarRange className="w-16 h-16" />
            </div>
            <div className="relative z-10">
              <div className="text-4xl font-bold mb-2">{stats.specificSchedulesCount}</div>
              <div className="text-purple-100 font-medium">Индивидуальные</div>
              <div className="text-sm text-purple-200/80 mt-2">Особые даты</div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-20">
              <Users className="w-16 h-16" />
            </div>
            <div className="relative z-10">
              <div className="text-4xl font-bold mb-2">{stats.activeMasters}</div>
              <div className="text-amber-100 font-medium">Сотрудников</div>
              <div className="text-sm text-amber-200/80 mt-2">Активных</div>
            </div>
          </motion.div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-500 font-medium">Загрузка расписания...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Еженедельный шаблон */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl">
                    <CalendarDays className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Еженедельный шаблон
                  </h2>
                </div>
                <div className="text-sm font-medium text-gray-600 bg-gradient-to-r from-gray-50 to-white/50 px-4 py-2 rounded-xl border border-gray-200/50">
                  Повторяется каждую неделю
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {DAYS_OF_WEEK.map((day, index) => (
                  <motion.div
                    key={day}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.01, y: -2 }}
                    className="bg-gradient-to-br from-white to-gray-50/50 rounded-3xl border border-gray-200/50 p-5 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getDayColor(index)} flex items-center justify-center text-white font-bold`}>
                          {day.charAt(0)}
                        </div>
                        <span className="font-bold text-gray-900 text-lg">
                          {day}
                        </span>
                      </div>
                      <div className={`px-3 py-1 text-xs font-bold tracking-wide rounded-full ${
                        templateSchedules[index]?.length 
                          ? 'bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border border-emerald-200/50' 
                          : 'bg-gradient-to-r from-rose-50 to-red-50 text-rose-700 border border-rose-200/50'
                      }`}>
                        {templateSchedules[index]?.length || 0} смен
                      </div>
                    </div>

                    <div className="space-y-3">
                      {templateSchedules[index]?.map((item) => {
                        const masterName = getWeeklyMasterDisplayName(item);
                        const masterInitial = getMasterInitial(item);
                        
                        return (
                          <motion.div
                            key={item.id}
                            whileHover={{ x: 2 }}
                            className="group bg-gradient-to-r from-gray-50/50 to-white/50 hover:from-white hover:to-white border border-gray-200/50 hover:border-blue-200/70 p-4 rounded-2xl transition-all duration-300"
                          >
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-md">
                                  <Clock className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                  <div className="text-base font-bold text-gray-900">
                                    {formatTime(item.startTime)} — {formatTime(item.endTime)}
                                  </div>
                                  {selectedMasterId === "all" && masterName && (
                                    <div className="mt-1 flex items-center gap-2">
                                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-[9px] text-white font-bold">
                                        {masterInitial}
                                      </div>
                                      <span className="text-xs font-semibold text-gray-600">
                                        {masterName}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleDelete(item.id)}
                                className="opacity-0 group-hover:opacity-100 p-2 bg-gradient-to-r from-red-50 to-rose-50 hover:from-red-100 hover:to-rose-100 text-red-500 hover:text-red-600 rounded-xl transition-all duration-300"
                              >
                                <Trash2 className="w-4 h-4" />
                              </motion.button>
                            </div>
                          </motion.div>
                        );
                      })}
                      
                      {!templateSchedules[index] && (
                        <div className="text-center py-6 border-2 border-dashed border-gray-300/50 rounded-2xl bg-gradient-to-br from-gray-50/30 to-transparent">
                          <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                          <span className="text-sm text-gray-500 font-medium">
                            Выходной день
                          </span>
                        </div>
                      )}
                      
                      {templateSchedules[index]?.length === 0 && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setIsModalOpen(true)}
                          className="w-full py-3 bg-gradient-to-r from-gray-50 to-white/50 border-2 border-dashed border-gray-300/50 hover:border-blue-300/50 rounded-2xl text-gray-600 hover:text-blue-600 transition-all duration-300 flex items-center justify-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Добавить смену
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Индивидуальные даты */}
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-2 pr-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                    <CalendarRange className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Индивидуальные даты
                  </h2>
                </div>
              </div>

              <div className="bg-gradient-to-br from-white to-gray-50/50 rounded-3xl border border-gray-200/50 shadow-lg overflow-hidden">
                <div className="p-6 border-b border-gray-200/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Специальные смены</h3>
                      <p className="text-sm text-gray-600 mt-1">Работа в нестандартные дни</p>
                    </div>
                    <div className="px-4 py-2 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 rounded-lg font-bold border border-purple-200/50">
                      {specificSchedules.length}
                    </div>
                  </div>
                </div>
                
                {specificSchedules.length > 0 ? (
                  <div className="divide-y divide-gray-100/50">
                    <AnimatePresence>
                      {specificSchedules.map((item, index) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="p-4 hover:bg-gradient-to-r hover:from-white hover:to-gray-50/30 transition-all duration-300 group"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="relative">
                                <div className="bg-gradient-to-br from-purple-500 to-pink-600 text-white w-14 h-14 rounded-2xl flex flex-col items-center justify-center shadow-lg">
                                  <span className="text-[10px] font-bold uppercase tracking-wide leading-tight">
                                    {new Date(item.startTime).toLocaleDateString("ru-RU", { month: "short" })}
                                  </span>
                                  <span className="text-xl font-black leading-none">
                                    {new Date(item.startTime).getDate()}
                                  </span>
                                </div>
                                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[8px] flex items-center justify-center font-bold shadow-md">
                                  {new Date(item.startTime).toLocaleDateString("ru-RU", { weekday: "short" }).charAt(0)}
                                </div>
                              </div>
                              <div>
                                <div className="text-lg font-bold text-gray-900">
                                  {formatTime(item.startTime)} — {formatTime(item.endTime)}
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-[9px] text-white font-bold">
                                    {getMasterInitial(item)}
                                  </div>
                                  <span className="text-xs font-semibold text-gray-600">
                                    {getMasterDisplayName(item)}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleDelete(item.id)}
                              className="opacity-0 group-hover:opacity-100 p-2 bg-gradient-to-r from-red-50 to-rose-50 hover:from-red-100 hover:to-rose-100 text-red-500 hover:text-red-600 rounded-xl transition-all duration-300"
                            >
                              <Trash2 className="w-5 h-5" />
                            </motion.button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                ) : (
                  <div className="p-12 text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Calendar className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Нет индивидуальных смен</h3>
                    <p className="text-gray-600 mb-6">Запланируйте работу в особые дни</p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsModalOpen(true)}
                      className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 inline-flex items-center gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      Добавить особую смену
                    </motion.button>
                  </div>
                )}
              </div>

              {/* Информация */}
              <div className="bg-gradient-to-br from-gray-50/50 to-white/30 rounded-3xl border border-gray-200/50 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Информация</h3>
                </div>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex justify-between items-center">
                    <span>Еженедельных смен:</span>
                    <span className="font-bold text-gray-900">{stats.weeklySchedules}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Индивидуальных дат:</span>
                    <span className="font-bold text-gray-900">{stats.specificSchedulesCount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Активных сотрудников:</span>
                    <span className="font-bold text-gray-900">{stats.activeMasters}</span>
                  </div>
                  <div className="pt-3 border-t border-gray-200/50">
                    <div className="flex justify-between items-center font-semibold text-gray-900">
                      <span>Всего записей:</span>
                      <span>{stats.totalSchedules}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"></div>
              <span>Еженедельные смены</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"></div>
              <span>Индивидуальные даты</span>
            </div>
          </div>
          <div className="text-amber-600 font-medium flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            <span>Всего смен запланировано: {stats.totalSchedules}</span>
          </div>
        </div>
      </div>

      <ScheduleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          fetchData(false);
          setIsModalOpen(false);
        }}
      />
    </div>
  );
}