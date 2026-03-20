"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { masterService } from "@/services/master/master.service";
import { masterScheduleService } from "@/services/schedule/schedule.service";
import type { IMaster } from "@/types/masters.type";
import {
  X, Calendar, Clock, Users, CalendarDays, CalendarRange,
  Loader2, CheckCircle, Shield, ChevronDown, AlertCircle,
} from "lucide-react";

type Mode = "template" | "specific";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const DAY_NAMES = [
  "Понедельник", "Вторник", "Среда", "Четверг",
  "Пятница", "Суббота", "Воскресенье",
];

export default function ScheduleModal({ isOpen, onClose, onSuccess }: Props) {
  const [mode, setMode] = useState<Mode>("template");
  const [masters, setMasters] = useState<IMaster[]>([]);
  const [selectedMaster, setSelectedMaster] = useState<number | "">("");
  const [dayOfWeek, setDayOfWeek] = useState(0);
  const [specificDate, setSpecificDate] = useState(() =>
    new Date().toISOString().split("T")[0]
  );
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:00");
  const [loading, setLoading] = useState(false);
  const [loadingMasters, setLoadingMasters] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains("dark"));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    setLoadingMasters(true);
    masterService
      .getAll()
      .then(data => setMasters(data.filter(m => m.isActive)))
      .catch(() => setError("Не удалось загрузить мастеров"))
      .finally(() => setLoadingMasters(false));
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMaster) { setError("Выберите мастера"); return; }
    if (mode === "specific" && !specificDate) { setError("Укажите дату"); return; }
    if (startTime >= endTime) { setError("Время окончания должно быть позже начала"); return; }

    setLoading(true);
    setError(null);

    try {
      let payload: any;

      if (mode === "template") {
        const now = new Date();
        const curDay = (now.getDay() + 6) % 7;
        const diff = dayOfWeek - curDay;
        const d = new Date(now);
        d.setDate(now.getDate() + diff + (diff < 0 ? 7 : 0));
        const iso = d.toISOString().split("T")[0];
        payload = {
          masterId: Number(selectedMaster),
          dayOfWeek,
          startTime: `${iso}T${startTime}:00`,
          endTime:   `${iso}T${endTime}:00`,
        };
      } else {
        payload = {
          masterId: Number(selectedMaster),
          dayOfWeek: null,
          startTime: new Date(`${specificDate}T${startTime}:00`).toISOString(),
          endTime:   new Date(`${specificDate}T${endTime}:00`).toISOString(),
        };
      }

      await masterScheduleService.create(payload);
      onSuccess?.();
      onClose();

      // Reset
      setSelectedMaster("");
      setDayOfWeek(0);
      setSpecificDate(new Date().toISOString().split("T")[0]);
      setStartTime("09:00");
      setEndTime("18:00");
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Неизвестная ошибка";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  const duration = useMemo(() => {
    const s = new Date(`2000-01-01T${startTime}:00`);
    const e = new Date(`2000-01-01T${endTime}:00`);
    const diff = (e.getTime() - s.getTime()) / (1000 * 60 * 60);
    return diff > 0 ? `${diff} ч` : "—";
  }, [startTime, endTime]);

  const selectedMasterObj = masters.find(m => m.id === Number(selectedMaster));
  const isTemplate = mode === "template";

  // ── design tokens ───────────────────────────────────────────────────────────
  const modeGrad = isTemplate
    ? "from-blue-500 via-indigo-500 to-purple-500"
    : "from-emerald-500 via-teal-500 to-cyan-500";

  const modalCls = isDark
    ? "bg-slate-900/88 backdrop-blur-3xl border border-white/[0.1] shadow-[0_32px_80px_rgba(0,0,0,0.7)]"
    : "bg-white/96 backdrop-blur-xl border border-gray-200/70 shadow-2xl";

  const inputCls = `w-full h-11 pl-10 pr-4 rounded-xl text-sm border outline-none transition-all appearance-none ${
    isDark
      ? "bg-white/[0.07] border-white/[0.09] text-white/90 placeholder-white/25 focus:border-indigo-400/50 focus:ring-1 focus:ring-indigo-400/20"
      : "bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 focus:bg-white"
  }`;

  const sectionCls = `rounded-2xl p-4 border ${
    isDark ? "bg-white/[0.04] border-white/[0.07]" : "bg-gray-50/60 border-gray-200/60"
  }`;

  const infoBoxCls = (accent: string) => `mt-2.5 px-3 py-2 rounded-xl border flex items-center justify-between ${
    isDark
      ? `bg-${accent}-500/8 border-${accent}-400/15`
      : `bg-${accent}-50/80 border-${accent}-200/60`
  }`;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={e => e.target === e.currentTarget && onClose()}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
          style={{
            background: isDark ? "rgba(0,0,0,0.78)" : "rgba(15,23,42,0.42)",
            backdropFilter: "blur(16px)",
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 24 }}
            transition={{ type: "spring", damping: 28, stiffness: 340 }}
            onClick={e => e.stopPropagation()}
            className={`relative w-full max-w-lg rounded-3xl overflow-hidden my-4 flex flex-col max-h-[90vh] ${modalCls}`}
          >
            {/* ── HEADER ── */}
            <div className={`relative px-7 py-6 bg-gradient-to-r ${modeGrad} overflow-hidden flex-shrink-0`}>
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full" />
              <div className="absolute bottom-0 left-0 right-0 h-px bg-white/15" />
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                    {isTemplate
                      ? <CalendarDays size={20} className="text-white" />
                      : <CalendarRange size={20} className="text-white" />
                    }
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white">Добавить смену</h2>
                    <p className="text-white/65 text-xs mt-0.5">
                      {isTemplate ? "Повторяется каждую неделю" : "Конкретный день"}
                    </p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }}
                  transition={{ duration: 0.18 }}
                  onClick={onClose}
                  className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-white hover:bg-white/25 transition-colors"
                >
                  <X size={17} />
                </motion.button>
              </div>
            </div>

            {/* ── BODY ── */}
            <div className="flex-1 overflow-y-auto">
              <form onSubmit={handleSubmit} className="p-6 space-y-4">

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className={`flex items-center gap-2.5 p-3 rounded-xl border text-sm ${
                        isDark
                          ? "bg-rose-500/10 border-rose-400/20 text-rose-400"
                          : "bg-rose-50 border-rose-200 text-rose-600"
                      }`}
                    >
                      <AlertCircle size={14} className="flex-shrink-0" />
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Mode toggle */}
                <div className={`flex rounded-2xl p-1.5 border ${
                  isDark ? "bg-white/[0.05] border-white/[0.08]" : "bg-gray-100/80 border-gray-200/60"
                }`}>
                  {(["template", "specific"] as Mode[]).map(m => (
                    <motion.button key={m} type="button"
                      whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                      onClick={() => setMode(m)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                        mode === m
                          ? `text-white shadow-lg bg-gradient-to-r ${m === "template" ? "from-blue-500 to-indigo-600" : "from-emerald-500 to-teal-600"}`
                          : isDark
                            ? "text-white/45 hover:text-white/65"
                            : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {m === "template" ? <CalendarDays size={15} /> : <CalendarRange size={15} />}
                      {m === "template" ? "Еженедельно" : "Конкретная дата"}
                    </motion.button>
                  ))}
                </div>

                <p className={`text-xs px-1 ${isDark ? "text-white/30" : "text-gray-400"}`}>
                  {isTemplate
                    ? "Смена будет повторяться каждую неделю в выбранный день"
                    : "Смена запланирована только на одну конкретную дату"}
                </p>

                {/* Master */}
                <div className={sectionCls}>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-2.5 ${
                    isDark ? "text-white/35" : "text-gray-400"
                  }`}>
                    Сотрудник *
                  </label>
                  <div className="relative">
                    <Users size={14} className={`absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${
                      isDark ? "text-white/25" : "text-gray-400"
                    }`} />
                    <select
                      value={selectedMaster}
                      onChange={e => setSelectedMaster(e.target.value as any)}
                      required
                      className={inputCls}
                    >
                      <option value="">
                        {loadingMasters ? "Загрузка..." : "Выберите сотрудника"}
                      </option>
                      {masters.map(m => (
                        <option key={m.id} value={m.id}>{m.surname} {m.name}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className={`absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${
                      isDark ? "text-white/25" : "text-gray-400"
                    }`} />
                  </div>
                  <p className={`flex items-center gap-1.5 text-xs mt-2 ${
                    isDark ? "text-white/20" : "text-gray-400"
                  }`}>
                    <Shield size={11} />
                    Только активные сотрудники
                  </p>
                </div>

                {/* Day / Date */}
                {isTemplate ? (
                  <div className={sectionCls}>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2.5 ${
                      isDark ? "text-white/35" : "text-gray-400"
                    }`}>
                      День недели *
                    </label>
                    <div className="relative">
                      <Calendar size={14} className={`absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${
                        isDark ? "text-white/25" : "text-gray-400"
                      }`} />
                      <select
                        value={dayOfWeek}
                        onChange={e => setDayOfWeek(Number(e.target.value))}
                        className={inputCls}
                      >
                        {DAY_NAMES.map((name, i) => (
                          <option key={i} value={i}>{name}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} className={`absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${
                        isDark ? "text-white/25" : "text-gray-400"
                      }`} />
                    </div>
                    <div className={`mt-2.5 px-3 py-2 rounded-xl border flex items-center justify-between ${
                      isDark
                        ? "bg-indigo-500/8 border-indigo-400/15"
                        : "bg-blue-50/80 border-blue-200/60"
                    }`}>
                      <span className={`text-xs ${isDark ? "text-white/35" : "text-gray-400"}`}>
                        Выбранный день
                      </span>
                      <span className={`text-sm font-bold ${isDark ? "text-indigo-300" : "text-blue-700"}`}>
                        {DAY_NAMES[dayOfWeek]}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className={sectionCls}>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2.5 ${
                      isDark ? "text-white/35" : "text-gray-400"
                    }`}>
                      Дата *
                    </label>
                    <div className="relative">
                      <Calendar size={14} className={`absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${
                        isDark ? "text-white/25" : "text-gray-400"
                      }`} />
                      <input
                        type="date"
                        value={specificDate}
                        onChange={e => setSpecificDate(e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                        required
                        className={inputCls}
                      />
                    </div>
                    {specificDate && (
                      <div className={`mt-2.5 px-3 py-2 rounded-xl border flex items-center justify-between ${
                        isDark
                          ? "bg-emerald-500/8 border-emerald-400/15"
                          : "bg-emerald-50/80 border-emerald-200/60"
                      }`}>
                        <span className={`text-xs ${isDark ? "text-white/35" : "text-gray-400"}`}>
                          Выбранная дата
                        </span>
                        <span className={`text-sm font-bold ${isDark ? "text-emerald-300" : "text-emerald-700"}`}>
                          {new Date(specificDate).toLocaleDateString("ru-RU", {
                            weekday: "short", day: "numeric", month: "long",
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Time */}
                <div className={sectionCls}>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-2.5 ${
                    isDark ? "text-white/35" : "text-gray-400"
                  }`}>
                    Время работы *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Начало",  val: startTime, set: setStartTime },
                      { label: "Конец",   val: endTime,   set: setEndTime   },
                    ].map(f => (
                      <div key={f.label}>
                        <p className={`text-xs mb-1.5 ${isDark ? "text-white/30" : "text-gray-400"}`}>
                          {f.label}
                        </p>
                        <div className="relative">
                          <Clock size={13} className={`absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${
                            isDark ? "text-white/25" : "text-gray-400"
                          }`} />
                          <input
                            type="time"
                            value={f.val}
                            onChange={e => f.set(e.target.value)}
                            required
                            className={inputCls}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className={`mt-2.5 px-3 py-2 rounded-xl border flex items-center justify-between ${
                    isDark ? "bg-amber-500/8 border-amber-400/15" : "bg-amber-50/80 border-amber-200/60"
                  }`}>
                    <span className={`text-xs ${isDark ? "text-white/35" : "text-gray-400"}`}>
                      Продолжительность
                    </span>
                    <span className={`text-sm font-bold ${isDark ? "text-amber-300" : "text-amber-700"}`}>
                      {duration}
                    </span>
                  </div>
                </div>

                {/* Summary */}
                <AnimatePresence>
                  {selectedMasterObj && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className={`flex items-center justify-between p-3.5 rounded-2xl border ${
                        isDark ? "bg-white/[0.05] border-white/[0.07]" : "bg-gray-50/80 border-gray-200/60"
                      }`}
                    >
                      <div>
                        <p className={`text-xs mb-0.5 ${isDark ? "text-white/30" : "text-gray-400"}`}>Сводка</p>
                        <p className={`text-sm font-bold ${isDark ? "text-white/85" : "text-gray-800"}`}>
                          {selectedMasterObj.surname} {selectedMasterObj.name}
                        </p>
                        <p className={`text-xs mt-0.5 ${isDark ? "text-white/30" : "text-gray-400"}`}>
                          {isTemplate
                            ? `Каждый ${DAY_NAMES[dayOfWeek].toLowerCase()}`
                            : new Date(specificDate).toLocaleDateString("ru-RU")
                          }
                          {" · "}{startTime} — {endTime}
                        </p>
                      </div>
                      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                        isDark
                          ? "bg-emerald-500/10 border-emerald-400/15 text-emerald-400"
                          : "bg-emerald-50 border-emerald-200 text-emerald-700"
                      }`}>
                        <CheckCircle size={11} />
                        Готово
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Buttons */}
                <div className={`flex flex-col sm:flex-row gap-3 pt-5 border-t ${
                  isDark ? "border-white/[0.07]" : "border-gray-100"
                }`}>
                  <motion.button
                    type="button" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                    onClick={onClose}
                    className={`flex-1 h-12 rounded-2xl text-sm font-semibold border transition-all ${
                      isDark
                        ? "bg-white/[0.06] border-white/[0.1] text-white/60 hover:bg-white/[0.09]"
                        : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 shadow-sm"
                    }`}
                  >
                    Отмена
                  </motion.button>

                  <motion.button
                    type="submit" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                    disabled={loading || loadingMasters}
                    className={`flex-1 h-12 rounded-2xl text-sm font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 bg-gradient-to-r ${modeGrad}`}
                  >
                    {loading ? (
                      <><Loader2 size={16} className="animate-spin" />Сохранение...</>
                    ) : (
                      <>
                        {isTemplate ? <CalendarDays size={16} /> : <CalendarRange size={16} />}
                        Сохранить смену
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </div>

            {/* ── FOOTER ── */}
            <div className={`px-7 py-3 border-t flex items-center justify-between text-xs flex-shrink-0 ${
              isDark
                ? "border-white/[0.06] text-white/20 bg-white/[0.02]"
                : "border-gray-100 text-gray-400 bg-gray-50/50"
            }`}>
              <span className="flex items-center gap-1.5">
                <Shield size={11} />
                Данные защищены
              </span>
              <span>ID: Новый</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}