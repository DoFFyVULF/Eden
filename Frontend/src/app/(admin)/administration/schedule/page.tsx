"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { masterScheduleService } from "@/services/schedule/schedule.service";
import { masterService } from "@/services/master/master.service";
import type { IMasterSchedule } from "@/types/schedule.types";
import type { IMaster } from "@/types/masters.type";
import AdminConfirmModal from "@/app/components/ui/admin/AdminConfirmModal";
import ScheduleModal from "./ScheduleModal";
import {
  Trash2, Calendar, Clock, Plus, User, ChevronDown, ChevronUp,
  RefreshCw, CalendarDays, CalendarRange, Users, Activity,
  SlidersHorizontal, Info, TrendingUp,
} from "lucide-react";

const DAYS = [
  "Понедельник", "Вторник", "Среда", "Четверг",
  "Пятница", "Суббота", "Воскресенье",
];

const DAY_GRADS = [
  "from-blue-500 to-indigo-600",
  "from-emerald-500 to-teal-600",
  "from-purple-500 to-pink-600",
  "from-amber-500 to-orange-500",
  "from-rose-500 to-red-600",
  "from-indigo-500 to-blue-600",
  "from-violet-500 to-purple-600",
];

export default function MasterSchedulePage() {
  const [schedules, setSchedules] = useState<IMasterSchedule[]>([]);
  const [masters, setMasters] = useState<IMaster[]>([]);
  const [selectedMasterId, setSelectedMasterId] = useState<number | "all">("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState<IMasterSchedule | null>(null);
  const [isDeletingSchedule, setIsDeletingSchedule] = useState(false);

  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains("dark"));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  const mastersLookup = useMemo(() => {
    const map: Record<string, string> = {};
    masters.forEach(m => {
      if (m?.id != null)
        map[String(m.id)] = `${m.surname || ""} ${m.name ? m.name[0] + "." : ""}`.trim();
    });
    return map;
  }, [masters]);

  const fetchData = async (showLoader = true) => {
    showLoader ? setLoading(true) : setRefreshing(true);
    try {
      const [sched, mast] = await Promise.all([
        masterScheduleService.getAll(),
        masterService.getAll(),
      ]);
      setSchedules(sched);
      setMasters(mast.filter(m => m.isActive));
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = useMemo(() => {
    if (selectedMasterId === "all") return schedules;
    return schedules.filter(s => String(s.masterId || s.master?.id) === String(selectedMasterId));
  }, [schedules, selectedMasterId]);

  const byDay = useMemo(() => {
    const g: Record<number, IMasterSchedule[]> = {};
    filtered.filter(s => s.dayOfWeek != null).forEach(s => {
      if (!g[s.dayOfWeek!]) g[s.dayOfWeek!] = [];
      g[s.dayOfWeek!].push(s);
    });
    return g;
  }, [filtered]);

  const specificList = useMemo(() =>
    filtered
      .filter(s => s.dayOfWeek == null)
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()),
    [filtered]
  );

  const stats = useMemo(() => ({
    total: filtered.length,
    weekly: filtered.filter(s => s.dayOfWeek != null).length,
    specific: filtered.filter(s => s.dayOfWeek == null).length,
    masters: masters.length,
  }), [filtered, masters]);

  const handleDelete = async () => {
    if (!scheduleToDelete) return;
    setIsDeletingSchedule(true);
    try {
      await masterScheduleService.delete(scheduleToDelete.id);
      setScheduleToDelete(null);
      fetchData(false);
    } catch {
      alert("Ошибка при удалении");
    } finally {
      setIsDeletingSchedule(false);
    }
  };

  const fmtTime = (s: string) =>
    new Date(s).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const getMasterName = (item: IMasterSchedule) => {
    if (item.master?.surname)
      return `${item.master.surname} ${item.master.name ? item.master.name[0] + "." : ""}`.trim();
    const id = item.masterId || (item as any).masterID;
    return mastersLookup[String(id)] || "Мастер";
  };

  const getInitial = (item: IMasterSchedule) =>
    (item.master?.surname?.[0] ?? mastersLookup[String(item.masterId)]?.[0] ?? "М").toUpperCase();

  // ── shared design tokens ────────────────────────────────────────────────────
  const glassCls = isDark
    ? "bg-white/[0.07] backdrop-blur-2xl border border-white/[0.1] shadow-lg"
    : "bg-white border border-gray-200/70 shadow-sm";

  const cardCls = isDark
    ? "bg-white/[0.06] backdrop-blur-xl border border-white/[0.09] hover:bg-white/[0.09] hover:border-white/[0.13] shadow-md hover:shadow-lg"
    : "bg-white border border-gray-200/70 hover:border-gray-300 shadow-sm hover:shadow-md";

  const STAT_CARDS = [
    { num: stats.total,   label: "Всего смен",      sub: "запланировано",  grad: "from-blue-500 to-indigo-600",   glow: "shadow-blue-500/15"    },
    { num: stats.weekly,  label: "Еженедельных",    sub: "повторяются",    grad: "from-emerald-500 to-teal-600",  glow: "shadow-emerald-500/15" },
    { num: stats.specific,label: "Индивидуальных",  sub: "особые даты",    grad: "from-purple-500 to-pink-600",   glow: "shadow-purple-500/15"  },
    { num: stats.masters, label: "Сотрудников",     sub: "активных",       grad: "from-amber-500 to-orange-500",  glow: "shadow-amber-500/15"   },
  ];

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <div className="max-w-9xl mx-auto space-y-6">

        {/* ── HEADER ── */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border ${
                  isDark
                    ? "bg-white/[0.06] border-white/[0.09] text-white/40"
                    : "bg-gray-100 border-gray-200 text-gray-400"
                }`}>
                  <Activity size={11} />
                  Расписание
                </div>
              </div>
              <h1 className={`text-4xl md:text-5xl font-black leading-none tracking-tight ${
                isDark ? "text-white" : "text-gray-900"
              }`}>
                Рабочие смены
              </h1>
              <p className={`mt-2 text-sm ${isDark ? "text-white/35" : "text-gray-400"}`}>
                {stats.total} записей · {stats.masters} сотрудников
              </p>
            </div>

            <div className="flex gap-2.5 flex-wrap">
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={() => fetchData(false)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                  isDark
                    ? "bg-white/[0.07] border-white/[0.1] text-white/60 hover:text-white/80 hover:bg-white/[0.1]"
                    : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50 shadow-sm"
                }`}
              >
                <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
                Обновить
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={() => setIsModalOpen(true)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg transition-all ${
                  isDark
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 shadow-amber-500/25 hover:shadow-amber-500/40"
                    : "bg-gradient-to-r from-amber-500 to-orange-500 shadow-amber-500/20 hover:shadow-amber-500/35"
                }`}
              >
                <Plus size={16} />
                Добавить смену
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* ── STAT CARDS ── */}
        <div className="grid grid-cols-2 not-sm:grid-cols-1 lg:grid-cols-4 gap-3">
          {STAT_CARDS.map((s, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ y: -3, scale: 1.02 }}
              className={`relative rounded-2xl p-5 overflow-hidden transition-all duration-300 ${
                isDark
                  ? `bg-white/[0.07] backdrop-blur-xl border border-white/[0.1] shadow-lg hover:shadow-xl ${s.glow}`
                  : `bg-white border border-gray-200/70 shadow-sm hover:shadow-md`
              }`}
            >
              <div className={`absolute -top-5 -right-5 w-16 h-16 bg-gradient-to-br ${s.grad} opacity-[0.12] rounded-xl rotate-12 blur-sm`} />
              <div className="relative">
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${s.grad} flex items-center justify-center shadow-md mb-3`}>
                  <CalendarDays size={17} className="text-white" />
                </div>
                <div className={`text-3xl font-black leading-none mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>{s.num}</div>
                <div className={`text-sm font-semibold ${isDark ? "text-white/70" : "text-gray-700"}`}>{s.label}</div>
                <div className={`text-xs mt-0.5 ${isDark ? "text-white/30" : "text-gray-400"}`}>{s.sub}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── FILTER BAR ── */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.28 }}
          className={`rounded-2xl p-4 ${glassCls}`}
        >
          <div className="flex gap-3 flex-wrap items-center">
            <div className="flex-1 min-w-[180px] relative">
              <User size={15} className={`absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${
                isDark ? "text-white/25" : "text-gray-400"
              }`} />
              <select
                value={selectedMasterId}
                onChange={e => setSelectedMasterId(e.target.value === "all" ? "all" : Number(e.target.value))}
                className={`w-full h-11 pl-10 pr-4 rounded-xl text-sm border outline-none appearance-none transition-all ${
                  isDark
                    ? "bg-white/[0.07] border-white/[0.09] text-white/90 focus:border-amber-400/40"
                    : "bg-gray-50 border-gray-200 text-gray-800 focus:border-amber-400 focus:bg-white"
                }`}
              >
                <option value="all">Все сотрудники</option>
                {masters.map(m => <option key={m.id} value={m.id}>{m.surname} {m.name}</option>)}
              </select>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={() => setFilterOpen(!filterOpen)}
              className={`h-11 flex items-center gap-2 px-4 rounded-xl text-sm font-semibold border transition-all ${
                filterOpen
                  ? isDark
                    ? "bg-amber-500/20 border-amber-400/30 text-amber-300"
                    : "bg-amber-50 border-amber-300 text-amber-600"
                  : isDark
                    ? "bg-white/[0.07] border-white/[0.09] text-white/55 hover:bg-white/[0.1]"
                    : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-white shadow-sm"
              }`}
            >
              <SlidersHorizontal size={15} />
              Сводка
              {filterOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </motion.button>
          </div>

          <AnimatePresence>
            {filterOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: "auto", marginTop: 12 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                className="overflow-hidden"
              >
                <div className={`pt-3 border-t grid grid-cols-2 sm:grid-cols-4 gap-3 ${
                  isDark ? "border-white/[0.07]" : "border-gray-100"
                }`}>
                  {[
                    { label: "Всего записей",    val: stats.total    },
                    { label: "Еженедельных",      val: stats.weekly   },
                    { label: "Индивидуальных",    val: stats.specific },
                    { label: "Сотрудников",       val: stats.masters  },
                  ].map(item => (
                    <div key={item.label} className={`rounded-xl p-3 border ${
                      isDark ? "bg-white/[0.04] border-white/[0.07]" : "bg-gray-50 border-gray-200/60"
                    }`}>
                      <div className={`text-xs mb-1 ${isDark ? "text-white/30" : "text-gray-400"}`}>{item.label}</div>
                      <div className={`text-xl font-black ${isDark ? "text-white/90" : "text-gray-900"}`}>{item.val}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── CONTENT ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div
              className={`w-10 h-10 rounded-full border-t-transparent animate-spin mb-4 ${
                isDark ? "border-amber-400" : "border-amber-500"
              }`}
              style={{ borderWidth: 3, borderStyle: "solid" }}
            />
            <p className={`text-sm ${isDark ? "text-white/35" : "text-gray-400"}`}>Загрузка расписания...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* ── WEEKLY — 2/3 ── */}
            <div className="lg:col-span-2 space-y-5">
              <div className="flex items-center gap-3 mb-1">
                <div className="relative">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                    <CalendarDays size={18} className="text-white" />
                  </div>
                  <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white dark:border-gray-900" />
                </div>
                <div>
                  <h2 className={`text-xl font-black tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}>
                    Еженедельный шаблон
                  </h2>
                  <p className={`text-xs font-medium ${isDark ? "text-white/35" : "text-gray-400"}`}>
                    Повторяется каждую неделю · {stats.weekly} смен
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                {DAYS.map((day, idx) => {
                  const dayItems = byDay[idx] ?? [];
                  const grad = DAY_GRADS[idx];
                  const hasItems = dayItems.length > 0;

                  return (
                    <motion.div key={day}
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      whileHover={{ y: -2, transition: { duration: 0.2 } }}
                      className={`group relative rounded-3xl p-5 transition-all duration-300 overflow-hidden ${
                        isDark
                          ? "bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] hover:border-white/[0.14] hover:bg-white/[0.08] shadow-lg hover:shadow-xl"
                          : "bg-white border border-gray-100 hover:border-gray-200 shadow-sm hover:shadow-lg"
                      }`}
                    >
                      {/* Decorative gradient orb */}
                      <div className={`absolute -top-12 -right-12 w-28 h-28 bg-gradient-to-br ${grad} opacity-[0.08] rounded-full blur-3xl group-hover:opacity-[0.15] transition-opacity duration-500`} />

                      {/* Header */}
                      <div className="relative flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`relative w-11 h-11 rounded-2xl bg-gradient-to-br ${grad} flex items-center justify-center text-white shadow-md overflow-hidden`}>
                            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <span className="text-base font-black relative z-10">
                              {day.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <span className={`block font-bold text-sm ${isDark ? "text-white/90" : "text-gray-800"}`}>
                              {day}
                            </span>
                            <span className={`text-xs font-medium ${
                              hasItems
                                ? isDark ? "text-emerald-400/70" : "text-emerald-600/70"
                                : isDark ? "text-white/20" : "text-gray-400"
                            }`}>
                              {hasItems ? `${dayItems.length} ${dayItems.length === 1 ? "смена" : "смен"}` : "выходной"}
                            </span>
                          </div>
                        </div>

                        {/* Status indicator */}
                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                          hasItems
                            ? isDark
                              ? "bg-emerald-500/15 text-emerald-300 border border-emerald-400/20"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : isDark
                              ? "bg-white/[0.04] text-white/25 border border-white/[0.06]"
                              : "bg-gray-50 text-gray-400 border border-gray-100"
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            hasItems ? "bg-emerald-400 animate-pulse" : isDark ? "bg-white/20" : "bg-gray-300"
                          }`} />
                          {hasItems ? "Рабочий" : "Выходной"}
                        </div>
                      </div>

                      {/* Divider */}
                      <div className={`h-px mb-4 ${
                        isDark
                          ? "bg-gradient-to-r from-white/[0.08] via-white/[0.06] to-transparent"
                          : "bg-gradient-to-r from-gray-100 via-gray-100 to-transparent"
                      }`} />

                      {/* Shifts */}
                      <div className="relative space-y-2.5">
                        {dayItems.map((item, itemIdx) => (
                          <motion.div key={item.id}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: itemIdx * 0.06 }}
                            whileHover={{ x: 3, scale: 1.01 }}
                            className={`group/item relative flex items-center justify-between px-4 py-3 rounded-2xl border transition-all duration-200 ${
                              isDark
                                ? "bg-white/[0.04] border-white/[0.06] hover:bg-white/[0.07] hover:border-white/[0.1]"
                                : "bg-gray-50/50 border-gray-100/50 hover:bg-white hover:border-gray-200 hover:shadow-sm"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {/* Time badge */}
                              <div className={`relative flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${grad} flex flex-col items-center justify-center shadow-sm overflow-hidden`}>
                                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                                <span className="text-xs font-bold text-white leading-none relative z-10">
                                  {fmtTime(item.startTime)}
                                </span>
                                <span className="text-[8px] text-white/70 font-medium relative z-10">
                                  {fmtTime(item.endTime)}
                                </span>
                              </div>

                              {/* Master info */}
                              <div>
                                <div className={`text-sm font-bold ${isDark ? "text-white/90" : "text-gray-800"}`}>
                                  {fmtTime(item.startTime)} — {fmtTime(item.endTime)}
                                </div>
                                {selectedMasterId === "all" && (
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    <div className={`w-5 h-5 rounded-lg bg-gradient-to-br ${grad} flex items-center justify-center text-[9px] text-white font-bold shadow-sm`}>
                                      {getInitial(item)}
                                    </div>
                                    <span className={`text-xs font-medium ${isDark ? "text-white/40" : "text-gray-400"}`}>
                                      {getMasterName(item)}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Delete button */}
                            <motion.button
                              whileHover={{ scale: 1.15, rotate: 90 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => setScheduleToDelete(item)}
                              className={`opacity-0 group-hover/item:opacity-100 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 ${
                                isDark
                                  ? "bg-rose-500/15 text-rose-400 hover:bg-rose-500/30"
                                  : "bg-rose-50 text-rose-500 hover:bg-rose-100 hover:text-rose-600"
                              }`}
                            >
                              <Trash2 size={14} />
                            </motion.button>
                          </motion.div>
                        ))}

                        {dayItems.length === 0 && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className={`flex flex-col items-center justify-center py-6 rounded-2xl border-2 border-dashed ${
                              isDark
                                ? "border-white/[0.05] hover:border-white/[0.08]"
                                : "border-gray-100 hover:border-gray-200"
                            } transition-colors`}
                          >
                            <div className={`w-10 h-10 rounded-xl mb-2 flex items-center justify-center ${
                              isDark ? "bg-white/[0.04]" : "bg-gray-50"
                            }`}>
                              <Calendar size={18} className={isDark ? "text-white/15" : "text-gray-300"} />
                            </div>
                            <span className={`text-xs font-semibold ${isDark ? "text-white/20" : "text-gray-300"}`}>
                              Выходной
                            </span>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* ── SPECIFIC DATES — 1/3 ── */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-md">
                  <CalendarRange size={17} className="text-white" />
                </div>
                <div>
                  <h2 className={`text-lg font-black ${isDark ? "text-white" : "text-gray-900"}`}>
                    Особые даты
                  </h2>
                  <p className={`text-xs ${isDark ? "text-white/30" : "text-gray-400"}`}>
                    Индивидуальные смены
                  </p>
                </div>
              </div>

              {/* Specific list card */}
              <div className={`rounded-2xl overflow-hidden ${glassCls} mt-6`}>
                <div className={`px-5 py-4 border-b flex items-center justify-between ${
                  isDark ? "border-white/[0.07]" : "border-gray-100"
                }`}>
                  <div>
                    <p className={`text-sm font-bold ${isDark ? "text-white/85" : "text-gray-800"}`}>
                      Специальные смены
                    </p>
                    <p className={`text-xs mt-0.5 ${isDark ? "text-white/30" : "text-gray-400"}`}>
                      Нестандартные дни
                    </p>
                  </div>
                  <span className={`text-sm font-black px-3 py-1 rounded-full border ${
                    isDark
                      ? "bg-purple-500/10 border-purple-400/15 text-purple-300"
                      : "bg-purple-50 border-purple-200 text-purple-700"
                  }`}>
                    {specificList.length}
                  </span>
                </div>

                {specificList.length > 0 ? (
                  <div className={`divide-y ${isDark ? "divide-white/[0.05]" : "divide-gray-100"}`}>
                    <AnimatePresence>
                      {specificList.map((item, i) => {
                        const d = new Date(item.startTime);
                        return (
                          <motion.div key={item.id}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.04 }}
                            className={`group flex items-center gap-4 px-5 py-4 transition-colors ${
                              isDark ? "hover:bg-white/[0.04]" : "hover:bg-gray-50/60"
                            }`}
                          >
                            {/* Date block */}
                            <div className="relative flex-shrink-0">
                              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex flex-col items-center justify-center shadow-lg text-white">
                                <span className="text-[10px] font-bold uppercase leading-none">
                                  {d.toLocaleDateString("ru-RU", { month: "short" })}
                                </span>
                                <span className="text-xl font-black leading-tight">{d.getDate()}</span>
                              </div>
                              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[8px] flex items-center justify-center font-bold shadow-md">
                                {d.toLocaleDateString("ru-RU", { weekday: "short" }).charAt(0).toUpperCase()}
                              </div>
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className={`text-sm font-bold ${isDark ? "text-white/90" : "text-gray-800"}`}>
                                {fmtTime(item.startTime)} — {fmtTime(item.endTime)}
                              </div>
                              <div className="flex items-center gap-1.5 mt-1">
                                <div className="w-4 h-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-[8px] text-white font-bold flex-shrink-0">
                                  {getInitial(item)}
                                </div>
                                <span className={`text-xs truncate ${isDark ? "text-white/35" : "text-gray-400"}`}>
                                  {getMasterName(item)}
                                </span>
                              </div>
                            </div>

                            <motion.button
                              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                              onClick={() => setScheduleToDelete(item)}
                              className={`opacity-0 group-hover:opacity-100 w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                                isDark
                                  ? "bg-rose-500/15 text-rose-400 hover:bg-rose-500/25"
                                  : "bg-rose-50 text-rose-500 hover:bg-rose-100"
                              }`}
                            >
                              <Trash2 size={14} />
                            </motion.button>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                ) : (
                  <div className="py-14 text-center px-6">
                    <div className={`w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center ${
                      isDark ? "bg-white/[0.06]" : "bg-gray-100"
                    }`}>
                      <Calendar size={24} className={isDark ? "text-white/20" : "text-gray-300"} />
                    </div>
                    <p className={`font-bold text-sm mb-1 ${isDark ? "text-white/45" : "text-gray-500"}`}>
                      Нет особых смен
                    </p>
                    <p className={`text-xs mb-5 ${isDark ? "text-white/25" : "text-gray-400"}`}>
                      Запланируйте работу в особые дни
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                      onClick={() => setIsModalOpen(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-purple-500 to-pink-600 shadow-md"
                    >
                      <Plus size={14} />
                      Добавить
                    </motion.button>
                  </div>
                )}
              </div>

              {/* Info summary */}
              <div className={`rounded-2xl p-4 ${glassCls}`}>
                <div className="flex items-center gap-2 mb-3">
                  <Info size={15} className={isDark ? "text-white/30" : "text-gray-400"} />
                  <p className={`text-xs font-bold uppercase tracking-wider ${
                    isDark ? "text-white/30" : "text-gray-400"
                  }`}>Сводка</p>
                </div>
                <div className={`space-y-0 divide-y ${isDark ? "divide-white/[0.05]" : "divide-gray-100"}`}>
                  {[
                    { label: "Еженедельных смен",  val: stats.weekly   },
                    { label: "Особых дат",          val: stats.specific },
                    { label: "Активных мастеров",   val: stats.masters  },
                    { label: "Всего записей",        val: stats.total, bold: true },
                  ].map(row => (
                    <div key={row.label} className="flex items-center justify-between py-2.5">
                      <span className={`text-sm ${isDark ? "text-white/45" : "text-gray-500"}`}>
                        {row.label}
                      </span>
                      <span className={`font-black text-sm ${
                        row.bold
                          ? isDark ? "text-white" : "text-gray-900"
                          : isDark ? "text-white/70" : "text-gray-700"
                      }`}>
                        {row.val}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── FOOTER ── */}
        {!loading && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className={`flex flex-wrap items-center justify-between gap-3 pt-5 border-t text-xs ${
              isDark ? "border-white/[0.06] text-white/20" : "border-gray-100 text-gray-400"
            }`}
          >
            <div className="flex flex-wrap gap-4">
              {[
                { grad: "from-blue-500 to-indigo-600",  label: "Еженедельные"   },
                { grad: "from-purple-500 to-pink-600",  label: "Индивидуальные" },
              ].map(x => (
                <div key={x.label} className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${x.grad}`} />
                  {x.label}
                </div>
              ))}
            </div>
            <span className="flex items-center gap-1.5">
              <TrendingUp size={12} />
              Всего смен: {stats.total}
            </span>
          </motion.div>
        )}
      </div>

      <ScheduleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => { fetchData(false); setIsModalOpen(false); }}
      />
      <AdminConfirmModal
        isOpen={scheduleToDelete !== null}
        isDark={isDark}
        title="Удалить смену"
        description="Запись исчезнет из расписания, и этот слот больше не будет доступен."
        itemLabel={
          scheduleToDelete
            ? `${getMasterName(scheduleToDelete)} · ${fmtTime(scheduleToDelete.startTime)} — ${fmtTime(scheduleToDelete.endTime)}`
            : null
        }
        confirmText="Удалить смену"
        isLoading={isDeletingSchedule}
        onClose={() => {
          if (isDeletingSchedule) return;
          setScheduleToDelete(null);
        }}
        onConfirm={handleDelete}
      />
    </div>
  );
}
