"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { IScheduleSuggestion } from "@/types/schedule.types";
import {
  CalendarClock,
  Check,
  Clock3,
  Loader2,
  MessageSquareText,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";

interface Props {
  isOpen: boolean;
  suggestions: IScheduleSuggestion[];
  onClose: () => void;
  onAccept: (suggestionId: number) => Promise<void>;
  onReject: (suggestionId: number) => Promise<void>;
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

type ActionState = {
  id: number | null;
  type: "accept" | "reject" | null;
};

export default function ScheduleSuggestionsModal({
  isOpen,
  suggestions,
  onClose,
  onAccept,
  onReject,
}: Props) {
  const [isDark, setIsDark] = useState(false);
  const [actionState, setActionState] = useState<ActionState>({
    id: null,
    type: null,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const check = () =>
      setIsDark(document.documentElement.classList.contains("dark"));
    check();

    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setError(null);
      setActionState({ id: null, type: null });
    }
  }, [isOpen]);

  const pendingCount = suggestions.length;

  const modalCls = isDark
    ? "bg-slate-900/92 border border-white/[0.1] shadow-[0_32px_90px_rgba(0,0,0,0.72)]"
    : "bg-white/95 border border-gray-200/80 shadow-2xl";

  const surfaceCls = isDark
    ? "bg-white/[0.05] border border-white/[0.08]"
    : "bg-gray-50/80 border border-gray-200/70";

  const emptyStateCopy = useMemo(
    () => ({
      title: "Новых предложений нет",
      description:
        "Когда сотрудники отправят изменения по сменам, они появятся здесь для подтверждения.",
    }),
    [],
  );

  const formatTime = (value: string) =>
    new Date(value).toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const formatDate = (suggestion: IScheduleSuggestion) => {
    if (suggestion.dayOfWeek !== null && suggestion.dayOfWeek !== undefined) {
      return `Каждый ${DAY_NAMES[suggestion.dayOfWeek].toLowerCase()}`;
    }

    const baseDate = suggestion.date ?? suggestion.startTime;
    return new Date(baseDate).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      weekday: "long",
    });
  };

  const getMasterName = (suggestion: IScheduleSuggestion) => {
    const surname = suggestion.master?.surname?.trim();
    const name = suggestion.master?.name?.trim();

    if (surname || name) {
      return [surname, name].filter(Boolean).join(" ");
    }

    return `Сотрудник #${suggestion.masterId}`;
  };

  const runAction = async (
    suggestionId: number,
    type: "accept" | "reject",
  ) => {
    setError(null);
    setActionState({ id: suggestionId, type });

    try {
      if (type === "accept") {
        await onAccept(suggestionId);
      } else {
        await onReject(suggestionId);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Не удалось обработать предложение";
      setError(message);
    } finally {
      setActionState({ id: null, type: null });
    }
  };

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
            background: isDark ? "rgba(2, 6, 23, 0.82)" : "rgba(15, 23, 42, 0.45)",
            backdropFilter: "blur(16px)",
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 24 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            onClick={(event) => event.stopPropagation()}
            className={`relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-[28px] ${modalCls}`}
          >
            <div className="relative overflow-hidden bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 px-7 py-6 text-white">
              <div className="absolute -right-8 -top-10 h-36 w-36 rounded-full bg-white/10 blur-2xl" />
              <div className="absolute inset-x-0 bottom-0 h-px bg-white/15" />

              <div className="relative flex items-start justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/18 backdrop-blur-sm shadow-lg">
                    <Sparkles size={22} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black tracking-tight">
                      Предложенные расписания
                    </h2>
                    <p className="mt-1 text-sm text-white/75">
                      Подтвердите изменения по сменам или отклоните их
                    </p>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.08, rotate: 90 }}
                  whileTap={{ scale: 0.94 }}
                  transition={{ duration: 0.18 }}
                  onClick={onClose}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-white transition-colors hover:bg-white/25"
                >
                  <X size={18} />
                </motion.button>
              </div>

              <div className="relative mt-5 flex flex-wrap items-center gap-2.5">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/12 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em]">
                  <CalendarClock size={13} />
                  Ожидают решения
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1.5 text-sm font-semibold">
                  <span className="text-xl font-black leading-none">{pendingCount}</span>
                  <span className="text-white/80">
                    {pendingCount === 1 ? "предложение" : pendingCount < 5 ? "предложения" : "предложений"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`mb-4 rounded-2xl border px-4 py-3 text-sm ${
                      isDark
                        ? "border-rose-400/20 bg-rose-500/10 text-rose-300"
                        : "border-rose-200 bg-rose-50 text-rose-600"
                    }`}
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {suggestions.length === 0 ? (
                <div
                  className={`flex min-h-[320px] flex-col items-center justify-center rounded-[28px] border border-dashed px-6 text-center ${surfaceCls}`}
                >
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/20">
                    <CalendarClock size={28} />
                  </div>
                  <h3
                    className={`text-lg font-black ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {emptyStateCopy.title}
                  </h3>
                  <p
                    className={`mt-2 max-w-md text-sm leading-6 ${
                      isDark ? "text-white/45" : "text-gray-500"
                    }`}
                  >
                    {emptyStateCopy.description}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {suggestions.map((suggestion, index) => {
                    const isAccepting =
                      actionState.id === suggestion.id &&
                      actionState.type === "accept";
                    const isRejecting =
                      actionState.id === suggestion.id &&
                      actionState.type === "reject";
                    const isBusy = isAccepting || isRejecting;

                    return (
                      <motion.div
                        key={suggestion.id}
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`rounded-[28px] p-5 ${surfaceCls}`}
                      >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1 text-xs font-bold text-white shadow-md">
                                <UserRound size={12} />
                                {getMasterName(suggestion)}
                              </div>
                              <div
                                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                                  suggestion.targetScheduleId
                                    ? isDark
                                      ? "bg-indigo-500/15 text-indigo-300"
                                      : "bg-blue-50 text-blue-700"
                                    : isDark
                                      ? "bg-emerald-500/15 text-emerald-300"
                                      : "bg-emerald-50 text-emerald-700"
                                }`}
                              >
                                <Sparkles size={12} />
                                {suggestion.targetScheduleId ? "Изменит смену" : "Создаст смену"}
                              </div>
                              <div
                                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                                  isDark
                                    ? "bg-white/[0.06] text-white/50"
                                    : "bg-white text-gray-500"
                                }`}
                              >
                                <Clock3 size={12} />
                                {formatTime(suggestion.startTime)} - {formatTime(suggestion.endTime)}
                              </div>
                            </div>

                            <div className="mt-4 grid gap-3 md:grid-cols-2">
                              <div
                                className={`rounded-2xl px-4 py-3 ${
                                  isDark ? "bg-white/[0.04]" : "bg-white"
                                }`}
                              >
                                <p
                                  className={`text-[11px] font-bold uppercase tracking-[0.16em] ${
                                    isDark ? "text-white/30" : "text-gray-400"
                                  }`}
                                >
                                  Формат
                                </p>
                                <p
                                  className={`mt-1 text-sm font-semibold ${
                                    isDark ? "text-white/85" : "text-gray-800"
                                  }`}
                                >
                                  {formatDate(suggestion)}
                                </p>
                              </div>

                              <div
                                className={`rounded-2xl px-4 py-3 ${
                                  isDark ? "bg-white/[0.04]" : "bg-white"
                                }`}
                              >
                                <p
                                  className={`text-[11px] font-bold uppercase tracking-[0.16em] ${
                                    isDark ? "text-white/30" : "text-gray-400"
                                  }`}
                                >
                                  Отправлено
                                </p>
                                <p
                                  className={`mt-1 text-sm font-semibold ${
                                    isDark ? "text-white/85" : "text-gray-800"
                                  }`}
                                >
                                  {new Date(suggestion.createdAt).toLocaleDateString("ru-RU", {
                                    day: "numeric",
                                    month: "long",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                              </div>
                            </div>

                            {suggestion.reason && (
                              <div
                                className={`mt-4 rounded-2xl border px-4 py-3 ${
                                  isDark
                                    ? "border-white/[0.08] bg-white/[0.03]"
                                    : "border-gray-200/80 bg-white/80"
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <MessageSquareText
                                    size={14}
                                    className={isDark ? "text-white/35" : "text-gray-400"}
                                  />
                                  <p
                                    className={`text-[11px] font-bold uppercase tracking-[0.16em] ${
                                      isDark ? "text-white/30" : "text-gray-400"
                                    }`}
                                  >
                                    Комментарий
                                  </p>
                                </div>
                                <p
                                  className={`mt-2 text-sm leading-6 ${
                                    isDark ? "text-white/70" : "text-gray-600"
                                  }`}
                                >
                                  {suggestion.reason}
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="flex w-full flex-col gap-2 lg:w-[180px]">
                            <motion.button
                              whileHover={{ scale: 1.01 }}
                              whileTap={{ scale: 0.98 }}
                              disabled={isBusy}
                              onClick={() => void runAction(suggestion.id, "accept")}
                              className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition-all disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {isAccepting ? (
                                <>
                                  <Loader2 size={16} className="animate-spin" />
                                  Принятие...
                                </>
                              ) : (
                                <>
                                  <Check size={16} />
                                  Принять
                                </>
                              )}
                            </motion.button>

                            <motion.button
                              whileHover={{ scale: 1.01 }}
                              whileTap={{ scale: 0.98 }}
                              disabled={isBusy}
                              onClick={() => void runAction(suggestion.id, "reject")}
                              className={`flex h-12 items-center justify-center gap-2 rounded-2xl border text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-60 ${
                                isDark
                                  ? "border-white/[0.1] bg-white/[0.05] text-white/70 hover:bg-white/[0.08]"
                                  : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                              }`}
                            >
                              {isRejecting ? (
                                <>
                                  <Loader2 size={16} className="animate-spin" />
                                  Отклонение...
                                </>
                              ) : (
                                <>
                                  <X size={16} />
                                  Отклонить
                                </>
                              )}
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
