"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { masterScheduleService } from "@/services/schedule/schedule.service";
import type { CreateScheduleSuggestionDto, IMasterSchedule } from "@/types/schedule.types";
import {
  Calendar,
  CalendarDays,
  CalendarRange,
  ChevronDown,
  Clock3,
  Loader2,
  MessageSquareText,
  Send,
  Sparkles,
  WandSparkles,
  X,
} from "lucide-react";

type Mode = "template" | "specific";

interface Props {
  isOpen: boolean;
  masterId: number;
  schedules: IMasterSchedule[];
  onClose: () => void;
  onSuccess: () => Promise<void> | void;
}

const DAY_NAMES = [
  "Понедельник",
  "Вторник",
  "Среда",
  "Четверг",
  "Пятница",
  "Суббота",
  "Воскресенье",
];

const getDayName = (dayOfWeek: number | null | undefined) =>
  dayOfWeek != null ? DAY_NAMES[dayOfWeek] ?? "День не указан" : "День не указан";

const formatCalendarDate = (value: string) =>
  new Date(value).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    weekday: "long",
  });

const formatTime = (value: string) =>
  new Date(value).toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });

export default function ScheduleSuggestionModal({
  isOpen,
  masterId,
  schedules,
  onClose,
  onSuccess,
}: Props) {
  const [mode, setMode] = useState<Mode>("template");
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>("new");
  const [dayOfWeek, setDayOfWeek] = useState(0);
  const [specificDate, setSpecificDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:00");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains("dark"));
    check();

    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const templateSchedules = useMemo(
    () =>
      schedules
        .filter((item) => item.dayOfWeek != null)
        .sort((a, b) => (a.dayOfWeek ?? 0) - (b.dayOfWeek ?? 0)),
    [schedules],
  );

  const specificSchedules = useMemo(
    () =>
      schedules
        .filter((item) => item.dayOfWeek == null)
        .sort(
          (a, b) =>
            new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
        ),
    [schedules],
  );

  const currentOptions = mode === "template" ? templateSchedules : specificSchedules;

  const selectedSchedule =
    selectedScheduleId !== "new"
      ? currentOptions.find((item) => item.id === Number(selectedScheduleId)) ?? null
      : null;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setError(null);
  }, [isOpen]);

  useEffect(() => {
    setSelectedScheduleId("new");

    if (mode === "template") {
      setDayOfWeek(0);
      setSpecificDate(new Date().toISOString().split("T")[0]);
    }
  }, [mode]);

  useEffect(() => {
    if (!selectedSchedule) {
      return;
    }

    setStartTime(formatTimeForInput(selectedSchedule.startTime));
    setEndTime(formatTimeForInput(selectedSchedule.endTime));

    if (selectedSchedule.dayOfWeek !== null) {
      setMode("template");
      setDayOfWeek(selectedSchedule.dayOfWeek);
      return;
    }

    setMode("specific");
    setSpecificDate(toInputDate(selectedSchedule.startTime));
  }, [selectedSchedule]);

  const durationHours = useMemo(() => {
    const start = new Date(`2000-01-01T${startTime}:00`);
    const end = new Date(`2000-01-01T${endTime}:00`);
    const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

    return diff > 0 ? diff : 0;
  }, [endTime, startTime]);

  const buildWeeklyDate = (targetDayOfWeek: number) => {
    const now = new Date();
    const todayIndex = (now.getDay() + 6) % 7;
    const offset = targetDayOfWeek - todayIndex;
    const result = new Date(now);
    result.setDate(now.getDate() + offset + (offset < 0 ? 7 : 0));
    return result.toISOString().split("T")[0];
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (startTime >= endTime) {
      setError("Время окончания должно быть позже времени начала");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      let payload: CreateScheduleSuggestionDto;

      if (mode === "template") {
        const baseDate = buildWeeklyDate(dayOfWeek);
        payload = {
          masterId,
          targetScheduleId: selectedSchedule?.id ?? null,
          dayOfWeek,
          startTime: `${baseDate}T${startTime}:00`,
          endTime: `${baseDate}T${endTime}:00`,
          reason: reason.trim() || undefined,
        };
      } else {
        payload = {
          masterId,
          targetScheduleId: selectedSchedule?.id ?? null,
          dayOfWeek: null,
          date: specificDate,
          startTime: new Date(`${specificDate}T${startTime}:00`).toISOString(),
          endTime: new Date(`${specificDate}T${endTime}:00`).toISOString(),
          reason: reason.trim() || undefined,
        };
      }

      await masterScheduleService.createSuggestion(payload);
      await onSuccess();
      onClose();
      resetForm();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Не удалось отправить предложение",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setMode("template");
    setSelectedScheduleId("new");
    setDayOfWeek(0);
    setSpecificDate(new Date().toISOString().split("T")[0]);
    setStartTime("09:00");
    setEndTime("18:00");
    setReason("");
    setError(null);
  };

  const inputCls = `w-full rounded-2xl border px-4 py-3 text-sm outline-none transition-all ${
    isDark
      ? "border-white/[0.1] bg-white/[0.06] text-white placeholder:text-white/20 focus:border-indigo-400/40"
      : "border-gray-200 bg-white text-gray-800 placeholder:text-gray-400 focus:border-blue-400"
  }`;

  const iconInputCls = `${inputCls} pl-11`;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(event) => event.target === event.currentTarget && onClose()}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            background: isDark ? "rgba(2,6,23,0.82)" : "rgba(15,23,42,0.42)",
            backdropFilter: "blur(16px)",
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 24 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            onClick={(event) => event.stopPropagation()}
            className={`relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-[30px] ${
              isDark
                ? "bg-slate-900/94 border border-white/[0.1] shadow-[0_32px_90px_rgba(0,0,0,0.72)]"
                : "bg-white/95 border border-gray-200/80 shadow-2xl"
            }`}
          >
            <div className="relative overflow-hidden bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-7 py-6 text-white">
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
              <div className="relative flex items-start justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/18 shadow-lg backdrop-blur-sm">
                    <WandSparkles size={22} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black tracking-tight">
                      Предложить изменение
                    </h2>
                    <p className="mt-1 text-sm text-white/75">
                      Новую смену или корректировку текущего графика
                    </p>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.08, rotate: 90 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.18 }}
                  onClick={onClose}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 transition-colors hover:bg-white/25"
                >
                  <X size={18} />
                </motion.button>
              </div>
            </div>

            <form
              id="schedule-suggestion-form"
              onSubmit={handleSubmit}
              className="flex-1 overflow-y-auto p-6"
            >
              <div className="space-y-5">
                <div
                  className={`grid grid-cols-2 gap-2 rounded-2xl border p-1.5 ${
                    isDark
                      ? "border-white/[0.1] bg-white/[0.05]"
                      : "border-gray-200/80 bg-gray-100/80"
                  }`}
                >
                  {(["template", "specific"] as Mode[]).map((item) => {
                    const active = item === mode;
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setMode(item)}
                        className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition-all ${
                          active
                            ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg"
                            : isDark
                              ? "text-white/45 hover:text-white/70"
                              : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        {item === "template" ? (
                          <CalendarDays size={16} />
                        ) : (
                          <CalendarRange size={16} />
                        )}
                        {item === "template" ? "Регулярная смена" : "Конкретный день"}
                      </button>
                    );
                  })}
                </div>

                {error && (
                  <div
                    className={`rounded-2xl border px-4 py-3 text-sm ${
                      isDark
                        ? "border-rose-400/20 bg-rose-500/10 text-rose-300"
                        : "border-rose-200 bg-rose-50 text-rose-600"
                    }`}
                  >
                    {error}
                  </div>
                )}

                <section
                  className={`rounded-[26px] border p-4 ${
                    isDark
                      ? "border-white/[0.08] bg-white/[0.04]"
                      : "border-gray-200/70 bg-gray-50/80"
                  }`}
                >
                  <div className="mb-3">
                    <p className={`text-xs font-bold uppercase tracking-[0.18em] ${isDark ? "text-white/30" : "text-gray-400"}`}>
                      Тип предложения
                    </p>
                    <p className={`mt-1 text-sm ${isDark ? "text-white/55" : "text-gray-500"}`}>
                      Выберите, создать новую смену или скорректировать существующую.
                    </p>
                  </div>

                  <div className="relative">
                    <ChevronDown
                      size={16}
                      className={`pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 ${
                        isDark ? "text-white/25" : "text-gray-400"
                      }`}
                    />
                    <select
                      value={selectedScheduleId}
                      onChange={(event) => setSelectedScheduleId(event.target.value)}
                      className={`${inputCls} appearance-none pr-10`}
                    >
                      <option value="new">Новая смена</option>
                      {currentOptions.map((item) => (
                        <option key={item.id} value={item.id}>
                          {mode === "template"
                            ? `${getDayName(item.dayOfWeek)} · ${formatTime(item.startTime)} - ${formatTime(item.endTime)}`
                            : `${formatCalendarDate(item.startTime)} · ${formatTime(item.startTime)} - ${formatTime(item.endTime)}`}
                        </option>
                      ))}
                    </select>
                  </div>
                </section>

                <section
                  className={`grid gap-4 rounded-[26px] border p-4 md:grid-cols-2 ${
                    isDark
                      ? "border-white/[0.08] bg-white/[0.04]"
                      : "border-gray-200/70 bg-gray-50/80"
                  }`}
                >
                  {mode === "template" ? (
                    <div className="relative md:col-span-2">
                      <Calendar
                        size={16}
                        className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 ${
                          isDark ? "text-white/25" : "text-gray-400"
                        }`}
                      />
                      <ChevronDown
                        size={16}
                        className={`pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 ${
                          isDark ? "text-white/25" : "text-gray-400"
                        }`}
                      />
                      <select
                        value={dayOfWeek}
                        onChange={(event) => setDayOfWeek(Number(event.target.value))}
                        className={`${iconInputCls} appearance-none pr-10`}
                      >
                        {DAY_NAMES.map((day, index) => (
                          <option key={day} value={index}>
                            {day}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="relative md:col-span-2">
                      <Calendar
                        size={16}
                        className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 ${
                          isDark ? "text-white/25" : "text-gray-400"
                        }`}
                      />
                      <input
                        type="date"
                        value={specificDate}
                        min={new Date().toISOString().split("T")[0]}
                        onChange={(event) => setSpecificDate(event.target.value)}
                        className={iconInputCls}
                        required
                      />
                    </div>
                  )}

                  <div className="relative">
                    <Clock3
                      size={16}
                      className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 ${
                        isDark ? "text-white/25" : "text-gray-400"
                      }`}
                    />
                    <input
                      type="time"
                      value={startTime}
                      onChange={(event) => setStartTime(event.target.value)}
                      className={iconInputCls}
                      required
                    />
                  </div>

                  <div className="relative">
                    <Clock3
                      size={16}
                      className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 ${
                        isDark ? "text-white/25" : "text-gray-400"
                      }`}
                    />
                    <input
                      type="time"
                      value={endTime}
                      onChange={(event) => setEndTime(event.target.value)}
                      className={iconInputCls}
                      required
                    />
                  </div>
                </section>

                <section
                  className={`rounded-[26px] border p-4 ${
                    isDark
                      ? "border-white/[0.08] bg-white/[0.04]"
                      : "border-gray-200/70 bg-gray-50/80"
                  }`}
                >
                  <div className="relative">
                    <MessageSquareText
                      size={16}
                      className={`pointer-events-none absolute left-4 top-4 ${
                        isDark ? "text-white/25" : "text-gray-400"
                      }`}
                    />
                    <textarea
                      value={reason}
                      onChange={(event) => setReason(event.target.value)}
                      rows={4}
                      placeholder="Коротко объясните, почему нужна эта смена или корректировка"
                      className={`${inputCls} min-h-[120px] resize-none pl-11`}
                    />
                  </div>
                </section>

                <div
                  className={`rounded-[26px] border px-4 py-4 ${
                    isDark
                      ? "border-white/[0.08] bg-white/[0.04]"
                      : "border-gray-200/70 bg-gray-50/80"
                  }`}
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className={`text-xs font-bold uppercase tracking-[0.18em] ${isDark ? "text-white/30" : "text-gray-400"}`}>
                        Сводка
                      </p>
                      <p className={`mt-1 text-sm font-semibold ${isDark ? "text-white/85" : "text-gray-800"}`}>
                        {selectedSchedule ? "Изменение текущей смены" : "Создание новой смены"}
                      </p>
                      <p className={`mt-1 text-sm ${isDark ? "text-white/50" : "text-gray-500"}`}>
                        {mode === "template"
                          ? `${getDayName(dayOfWeek)} · ${startTime} - ${endTime}`
                          : `${formatCalendarDate(`${specificDate}T00:00:00`)} · ${startTime} - ${endTime}`}
                      </p>
                    </div>

                    <div className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold ${
                      isDark ? "bg-indigo-500/14 text-indigo-300" : "bg-blue-50 text-blue-700"
                    }`}>
                      <Sparkles size={13} />
                      {durationHours > 0 ? `${durationHours} ч` : "Проверьте время"}
                    </div>
                  </div>
                </div>
              </div>
            </form>

            <div
              className={`flex flex-col gap-3 border-t px-6 py-4 sm:flex-row ${
                isDark ? "border-white/[0.08]" : "border-gray-100"
              }`}
            >
              <button
                type="button"
                onClick={onClose}
                className={`h-12 flex-1 rounded-2xl border text-sm font-semibold transition-all ${
                  isDark
                    ? "border-white/[0.1] bg-white/[0.05] text-white/70 hover:bg-white/[0.08]"
                    : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                Отмена
              </button>

              <button
                type="submit"
                form="schedule-suggestion-form"
                disabled={submitting}
                className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition-all disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Отправка...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Отправить на согласование
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function formatTimeForInput(value: string) {
  const date = new Date(value);
  return date.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function toInputDate(value: string) {
  return new Date(value).toISOString().split("T")[0];
}
