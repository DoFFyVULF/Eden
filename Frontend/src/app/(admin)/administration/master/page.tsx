"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  Users,
  UserPlus,
  Phone,
  Scissors,
  MoreVertical,
  Edit,
  Trash2,
  Power,
  Calendar,
  RefreshCw,
  X,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Activity,
  SlidersHorizontal,
  Eye,
  Loader2,
  CheckCircle,
  CalendarDays,
  Bell,
} from "lucide-react";
import EmployeesCard from "@/app/(admin)/administration/master/CreateMasterModal";
import { masterService } from "@/services/master/master.service";
import { masterScheduleService } from "@/services/schedule/schedule.service";
import { MasterStatusInfo, IMasterTimeOff } from "@/types/schedule.types";
import { IMaster } from "@/types/masters.type";
import { formatPhoneNumber } from "@/app/lib/formatPhoneNumber";

type VacationType = "vacation" | "sick_leave" | "day_off" | "other";
type VacationFormData = {
  masterId: number;
  startDate: string;
  endDate: string;
  type: VacationType;
  comment?: string;
};

// ── Vacation type config ─────────────────────────────────────────────────────
const VTYPE: Record<
  VacationType,
  {
    label: string;
    emoji: string;
    gradDark: string;
    gradLight: string;
    chipDark: string;
    chipLight: string;
  }
> = {
  vacation: {
    label: "Отпуск",
    emoji: "🌴",
    gradDark: "from-blue-500 to-cyan-500",
    gradLight: "from-blue-400 to-cyan-400",
    chipDark: "bg-blue-500/15 border-blue-400/20 text-blue-300",
    chipLight: "bg-blue-50 border-blue-200 text-blue-700",
  },
  sick_leave: {
    label: "Больничный",
    emoji: "🤒",
    gradDark: "from-rose-500 to-red-500",
    gradLight: "from-rose-400 to-red-400",
    chipDark: "bg-rose-500/15 border-rose-400/20 text-rose-300",
    chipLight: "bg-rose-50 border-rose-200 text-rose-700",
  },
  day_off: {
    label: "Отгул",
    emoji: "📅",
    gradDark: "from-amber-500 to-orange-500",
    gradLight: "from-amber-400 to-orange-400",
    chipDark: "bg-amber-500/15 border-amber-400/20 text-amber-300",
    chipLight: "bg-amber-50 border-amber-200 text-amber-700",
  },
  other: {
    label: "Недоступен",
    emoji: "⚙️",
    gradDark: "from-slate-500 to-gray-600",
    gradLight: "from-gray-400 to-gray-500",
    chipDark: "bg-slate-500/15 border-slate-400/20 text-slate-300",
    chipLight: "bg-gray-100 border-gray-200 text-gray-600",
  },
};

// ── Specialization gradient map ──────────────────────────────────────────────
const SPEC_GRAD: Record<string, string> = {
  парикмахер: "from-blue-500 to-cyan-500",
  массажист: "from-emerald-500 to-green-500",
  косметолог: "from-purple-500 to-pink-500",
  маникюр: "from-amber-500 to-orange-500",
  визажист: "from-rose-500 to-red-500",
  стилист: "from-indigo-500 to-blue-500",
};
const specGrad = (s: string) =>
  SPEC_GRAD[s.toLowerCase()] ?? "from-slate-500 to-gray-600";
const getInitials = (m: IMaster) =>
  `${(m.name[0] ?? "").toUpperCase()}${(m.surname[0] ?? "").toUpperCase()}`;

// ── VacationModal ─────────────────────────────────────────────────────────────
function VacationModal({
  isOpen,
  onClose,
  onSubmit,
  master,
  isDark,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (d: VacationFormData) => Promise<void>;
  master: IMaster | null;
  isDark: boolean;
}) {
  const [form, setForm] = useState<VacationFormData>({
    masterId: master?.id || 0,
    startDate: "",
    endDate: "",
    type: "vacation",
    comment: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && master) {
      setForm({
        masterId: master.id,
        startDate: "",
        endDate: "",
        type: "vacation",
        comment: "",
      });
      setErr(null);
    }
  }, [isOpen, master]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.startDate || !form.endDate) {
      setErr("Укажите даты начала и окончания");
      return;
    }

    const startDateTime = new Date(form.startDate);
    const endDateTime = new Date(form.endDate);

    if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
      setErr("Некорректный формат даты");
      return;
    }

    if (endDateTime <= startDateTime) {
      setErr("Дата окончания не может быть раньше начала");
      return;
    }

    setSubmitting(true);
    setErr(null);
    try {
      await onSubmit(form);
      onClose();
    } catch (e: any) {
      setErr(e.message || "Ошибка");
    } finally {
      setSubmitting(false);
    }
  };

  const cfg = VTYPE[form.type];
  const modalCls = isDark
    ? "bg-slate-900/90 backdrop-blur-3xl border border-white/[0.1] shadow-[0_32px_80px_rgba(0,0,0,0.7)]"
    : "bg-white/95 backdrop-blur-xl border border-gray-200/70 shadow-2xl";

  const inputCls = isDark
    ? "bg-white/[0.07] border-white/[0.1] text-white/90 focus:border-indigo-400/50 placeholder-white/25"
    : "bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400 focus:border-blue-400";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            background: isDark ? "rgba(0,0,0,0.75)" : "rgba(15,23,42,0.4)",
            backdropFilter: "blur(12px)",
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ type: "spring", damping: 28, stiffness: 340 }}
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-md rounded-3xl overflow-hidden ${modalCls}`}
          >
            <div
              className={`relative px-6 py-5 bg-gradient-to-r ${isDark ? cfg.gradDark : cfg.gradLight} overflow-hidden`}
            >
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full" />
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl">
                    {cfg.emoji}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">
                      Период недоступности
                    </h3>
                    <p className="text-white/70 text-xs mt-0.5">
                      {master ? `${master.surname} ${master.name}` : ""}
                    </p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ duration: 0.18 }}
                  onClick={onClose}
                  className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center text-white hover:bg-white/25 transition-colors"
                >
                  <X size={16} />
                </motion.button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label
                  className={`block text-xs font-bold uppercase tracking-wider mb-2.5 ${isDark ? "text-white/35" : "text-gray-400"}`}
                >
                  Тип периода
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(VTYPE) as VacationType[]).map((t) => {
                    const tc = VTYPE[t];
                    const active = form.type === t;
                    return (
                      <motion.button
                        key={t}
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setForm((p) => ({ ...p, type: t }))}
                        className={`p-3 rounded-2xl border-2 text-left transition-all text-sm font-semibold ${
                          active
                            ? `border-transparent bg-gradient-to-r ${isDark ? tc.gradDark : tc.gradLight} text-white shadow-lg`
                            : isDark
                              ? "border-white/[0.08] bg-white/[0.04] text-white/60 hover:bg-white/[0.07]"
                              : "border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        <span className="mr-2">{tc.emoji}</span>
                        {tc.label}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Начало", key: "startDate" },
                  { label: "Окончание", key: "endDate" },
                ].map((f) => (
                  <div key={f.key}>
                    <label
                      className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? "text-white/35" : "text-gray-400"}`}
                    >
                      {f.label}
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={form[f.key as "startDate" | "endDate"]}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, [f.key]: e.target.value }))
                      }
                      className={`w-full h-11 px-3 rounded-xl text-sm border outline-none transition-all focus:ring-2 focus:ring-indigo-400/20 ${inputCls}`}
                    />
                  </div>
                ))}
              </div>

              <div>
                <label
                  className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? "text-white/35" : "text-gray-400"}`}
                >
                  Комментарий{" "}
                  <span
                    className={`normal-case font-normal ${isDark ? "text-white/20" : "text-gray-300"}`}
                  >
                    (необязательно)
                  </span>
                </label>
                <textarea
                  rows={2}
                  value={form.comment}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, comment: e.target.value }))
                  }
                  placeholder="Ежегодный отпуск, больничный лист..."
                  className={`w-full px-3 py-2.5 rounded-xl text-sm border outline-none resize-none transition-all focus:ring-2 focus:ring-indigo-400/20 ${inputCls}`}
                />
              </div>

              <AnimatePresence>
                {err && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border text-sm ${
                      isDark
                        ? "bg-rose-500/10 border-rose-400/20 text-rose-400"
                        : "bg-rose-50 border-rose-200 text-rose-600"
                    }`}
                  >
                    <AlertCircle size={14} />
                    {err}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex gap-3 pt-1">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={onClose}
                  className={`flex-1 h-12 rounded-2xl text-sm font-semibold border transition-all ${
                    isDark
                      ? "bg-white/[0.06] border-white/[0.1] text-white/60 hover:bg-white/[0.09]"
                      : "bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200"
                  }`}
                  disabled={submitting}
                >
                  Отмена
                </motion.button>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.97 }}
                  disabled={submitting}
                  className={`flex-1 h-12 rounded-2xl text-sm font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 bg-gradient-to-r ${isDark ? cfg.gradDark : cfg.gradLight}`}
                >
                  {submitting ? (
                    <>
                      <Clock size={15} className="animate-spin" />
                      Сохранение...
                    </>
                  ) : (
                    <>
                      <Plus size={15} />
                      Добавить
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── UpcomingTimeOffBadge ─────────────────────────────────────────────────────
function UpcomingTimeOffBadge({
  period,
  isDark,
  onClick,
}: {
  period: IMasterTimeOff;
  isDark: boolean;
  onClick?: () => void;
}) {
  const cfg = VTYPE[period.type as VacationType] ?? VTYPE.other;
  const start = new Date(period.startDate).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
  });

  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border cursor-pointer ${
        isDark
          ? "bg-purple-500/15 border-purple-400/20 text-purple-300"
          : "bg-purple-50 border-purple-200 text-purple-700"
      }`}
    >
      <Bell size={10} />
      <span>{cfg.emoji}</span>
      <span>{cfg.label}</span>
      <span className="opacity-50">·</span>
      <span>с {start}</span>
      <Eye size={10} className="opacity-60 ml-0.5" />
    </motion.button>
  );
}

// ── CurrentVacationBadge ─────────────────────────────────────────────────────
function CurrentVacationBadge({
  period,
  isDark,
  onClick,
}: {
  period: NonNullable<MasterStatusInfo["currentPeriod"]>;
  isDark: boolean;
  onClick?: () => void;
}) {
  const cfg = VTYPE[period.type as VacationType] ?? VTYPE.other;
  const end = new Date(period.endDate).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
  });

  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border cursor-pointer ${isDark ? cfg.chipDark : cfg.chipLight}`}
    >
      <span>{cfg.emoji}</span>
      <span>{cfg.label}</span>
      <span className="opacity-50">·</span>
      <span>до {end}</span>
      <Eye size={10} className="opacity-60 ml-0.5" />
    </motion.button>
  );
}

// ── TimeOffDetailsModal (расширен для работы с будущими периодами) ───────────
function TimeOffDetailsModal({
  isOpen,
  onClose,
  master,
  period,
  onDeleted,
  onUpdated,
  isDark,
  isUpcoming = false,
}: {
  isOpen: boolean;
  onClose: () => void;
  master: IMaster | null;
  period:
    | (NonNullable<MasterStatusInfo["currentPeriod"]> | IMasterTimeOff)
    | null;
  onDeleted: () => void;
  onUpdated: () => void;
  isDark: boolean;
  isUpcoming?: boolean;
}) {
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [editForm, setEditForm] = useState<{
    startDate: string;
    endDate: string;
    type: VacationType;
    comment: string;
  }>({ startDate: "", endDate: "", type: "vacation", comment: "" });

  useEffect(() => {
    if (isOpen && period) {
      const toLocalInput = (iso: string) => {
        const d = new Date(iso);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}T${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
      };
      setEditForm({
        startDate: toLocalInput(period.startDate),
        endDate: toLocalInput(period.endDate),
        type: (period.type as VacationType) ?? "vacation",
        comment: period.comment ?? "",
      });
      setMode("view");
      setErr(null);
      setConfirmDelete(false);
    }
  }, [isOpen, period]);

  const handleDelete = async () => {
    if (!period) return;
    setDeleting(true);
    setErr(null);
    try {
      await masterScheduleService.deleteTimeOff(period.id);
      onDeleted();
      onClose();
    } catch (e: any) {
      setErr(e.message || "Ошибка при удалении");
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  const handleSave = async () => {
    if (!period) return;
    if (!editForm.startDate || !editForm.endDate) {
      setErr("Укажите даты начала и окончания");
      return;
    }

    const startDateTime = new Date(editForm.startDate);
    const endDateTime = new Date(editForm.endDate);

    if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
      setErr("Некорректный формат даты");
      return;
    }

    if (endDateTime <= startDateTime) {
      setErr("Дата окончания должна быть позже начала");
      return;
    }

    setSaving(true);
    setErr(null);
    try {
      await masterScheduleService.updateTimeOff(period.id, {
        startDate: startDateTime.toISOString(),
        endDate: endDateTime.toISOString(),
        type: editForm.type,
        comment: editForm.comment || undefined,
      });
      onUpdated();
      onClose();
    } catch (e: any) {
      setErr(e.message || "Ошибка при сохранении");
    } finally {
      setSaving(false);
    }
  };

  const cfg = period
    ? (VTYPE[period.type as VacationType] ?? VTYPE.other)
    : VTYPE.vacation;

  const modalCls = isDark
    ? "bg-slate-900/90 backdrop-blur-3xl border border-white/[0.1] shadow-[0_32px_80px_rgba(0,0,0,0.7)]"
    : "bg-white/95 backdrop-blur-xl border border-gray-200/70 shadow-2xl";

  const inputCls = isDark
    ? "bg-white/[0.07] border-white/[0.1] text-white/90 focus:border-indigo-400/50 placeholder-white/25"
    : "bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400 focus:border-blue-400";

  if (!period || !master) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            background: isDark ? "rgba(0,0,0,0.75)" : "rgba(15,23,42,0.4)",
            backdropFilter: "blur(12px)",
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ type: "spring", damping: 28, stiffness: 340 }}
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-md rounded-3xl overflow-hidden ${modalCls}`}
          >
            {/* Header */}
            <div
              className={`relative px-6 py-5 bg-gradient-to-r ${isDark ? cfg.gradDark : cfg.gradLight} overflow-hidden`}
            >
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full" />
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl">
                    {cfg.emoji}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">
                      {mode === "edit"
                        ? "Редактирование периода"
                        : isUpcoming
                          ? "Будущий период недоступности"
                          : "Текущий период недоступности"}
                    </h3>
                    <p className="text-white/70 text-xs mt-0.5">
                      {master.surname} {master.name}
                    </p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ duration: 0.18 }}
                  onClick={onClose}
                  className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center text-white hover:bg-white/25 transition-colors"
                >
                  <X size={16} />
                </motion.button>
              </div>
            </div>

            <div className="p-5 space-y-4">
              {mode === "view" ? (
                // VIEW MODE
                <>
                  <div
                    className={`flex items-center gap-3 p-4 rounded-2xl border ${
                      isDark
                        ? "bg-white/[0.04] border-white/[0.07]"
                        : "bg-gray-50 border-gray-100"
                    }`}
                  >
                    <div className="text-3xl">{cfg.emoji}</div>
                    <div>
                      <p
                        className={`text-xs font-bold uppercase tracking-wider ${isDark ? "text-white/30" : "text-gray-400"}`}
                      >
                        Тип
                      </p>
                      <p
                        className={`font-bold text-base ${isDark ? "text-white/90" : "text-gray-900"}`}
                      >
                        {cfg.label}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Начало", value: period.startDate },
                      { label: "Окончание", value: period.endDate },
                    ].map((f) => (
                      <div
                        key={f.label}
                        className={`p-3.5 rounded-2xl border ${
                          isDark
                            ? "bg-white/[0.04] border-white/[0.07]"
                            : "bg-gray-50 border-gray-100"
                        }`}
                      >
                        <p
                          className={`text-xs font-bold uppercase tracking-wider mb-1 ${isDark ? "text-white/30" : "text-gray-400"}`}
                        >
                          {f.label}
                        </p>
                        <p
                          className={`text-sm font-semibold ${isDark ? "text-white/80" : "text-gray-800"}`}
                        >
                          {new Date(f.value).toLocaleDateString("ru-RU", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                        <p
                          className={`text-xs mt-0.5 ${isDark ? "text-white/30" : "text-gray-400"}`}
                        >
                          {new Date(f.value).toLocaleTimeString("ru-RU", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    ))}
                  </div>

                  {period.comment && (
                    <div
                      className={`p-3.5 rounded-2xl border ${
                        isDark
                          ? "bg-white/[0.04] border-white/[0.07]"
                          : "bg-gray-50 border-gray-100"
                      }`}
                    >
                      <p
                        className={`text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? "text-white/30" : "text-gray-400"}`}
                      >
                        Комментарий
                      </p>
                      <p
                        className={`text-sm ${isDark ? "text-white/70" : "text-gray-600"}`}
                      >
                        {period.comment}
                      </p>
                    </div>
                  )}

                  <AnimatePresence>
                    {confirmDelete && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className={`p-4 rounded-2xl border ${
                          isDark
                            ? "bg-rose-500/10 border-rose-400/20"
                            : "bg-rose-50 border-rose-200"
                        }`}
                      >
                        <p
                          className={`text-sm font-semibold mb-3 ${isDark ? "text-rose-400" : "text-rose-600"}`}
                        >
                          Вы уверены? Период будет удалён и мастер снова станет
                          доступен.
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setConfirmDelete(false)}
                            className={`flex-1 h-9 rounded-xl text-sm font-semibold border transition-all ${
                              isDark
                                ? "bg-white/[0.06] border-white/[0.1] text-white/60"
                                : "bg-white border-gray-200 text-gray-600"
                            }`}
                          >
                            Отмена
                          </button>
                          <button
                            onClick={handleDelete}
                            disabled={deleting}
                            className="flex-1 h-9 rounded-xl text-sm font-bold text-white bg-rose-500 hover:bg-rose-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            {deleting ? (
                              <>
                                <Loader2 size={14} className="animate-spin" />{" "}
                                Удаление...
                              </>
                            ) : (
                              <>
                                <Trash2 size={14} /> Удалить
                              </>
                            )}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {!confirmDelete && (
                    <div className="flex gap-2.5">
                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setConfirmDelete(true)}
                        className={`flex items-center justify-center gap-2 h-11 rounded-2xl text-sm font-semibold border transition-all px-4 ${
                          isDark
                            ? "bg-rose-500/10 border-rose-400/20 text-rose-400 hover:bg-rose-500/15"
                            : "bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100"
                        }`}
                      >
                        <Trash2 size={14} />
                        Удалить
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setMode("edit")}
                        className={`flex-1 flex items-center justify-center gap-2 h-11 rounded-2xl text-sm font-bold text-white shadow-lg transition-all bg-gradient-to-r ${
                          isDark ? cfg.gradDark : cfg.gradLight
                        }`}
                      >
                        <Edit size={14} />
                        Редактировать
                      </motion.button>
                    </div>
                  )}
                </>
              ) : (
                // EDIT MODE
                <>
                  <div>
                    <label
                      className={`block text-xs font-bold uppercase tracking-wider mb-2.5 ${isDark ? "text-white/35" : "text-gray-400"}`}
                    >
                      Тип периода
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {(Object.keys(VTYPE) as VacationType[]).map((t) => {
                        const tc = VTYPE[t];
                        const active = editForm.type === t;
                        return (
                          <motion.button
                            key={t}
                            type="button"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() =>
                              setEditForm((p) => ({ ...p, type: t }))
                            }
                            className={`p-3 rounded-2xl border-2 text-left transition-all text-sm font-semibold ${
                              active
                                ? `border-transparent bg-gradient-to-r ${isDark ? tc.gradDark : tc.gradLight} text-white shadow-lg`
                                : isDark
                                  ? "border-white/[0.08] bg-white/[0.04] text-white/60 hover:bg-white/[0.07]"
                                  : "border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100"
                            }`}
                          >
                            <span className="mr-2">{tc.emoji}</span>
                            {tc.label}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Начало", key: "startDate" },
                      { label: "Окончание", key: "endDate" },
                    ].map((f) => (
                      <div key={f.key}>
                        <label
                          className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? "text-white/35" : "text-gray-400"}`}
                        >
                          {f.label}
                        </label>
                        <input
                          type="datetime-local"
                          required
                          value={editForm[f.key as "startDate" | "endDate"]}
                          onChange={(e) =>
                            setEditForm((p) => ({
                              ...p,
                              [f.key]: e.target.value,
                            }))
                          }
                          className={`w-full h-11 px-3 rounded-xl text-sm border outline-none transition-all focus:ring-2 focus:ring-indigo-400/20 ${inputCls}`}
                        />
                      </div>
                    ))}
                  </div>

                  <div>
                    <label
                      className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? "text-white/35" : "text-gray-400"}`}
                    >
                      Комментарий{" "}
                      <span
                        className={`normal-case font-normal ${isDark ? "text-white/20" : "text-gray-300"}`}
                      >
                        (необязательно)
                      </span>
                    </label>
                    <textarea
                      rows={2}
                      value={editForm.comment}
                      onChange={(e) =>
                        setEditForm((p) => ({ ...p, comment: e.target.value }))
                      }
                      placeholder="Ежегодный отпуск, больничный лист..."
                      className={`w-full px-3 py-2.5 rounded-xl text-sm border outline-none resize-none transition-all focus:ring-2 focus:ring-indigo-400/20 ${inputCls}`}
                    />
                  </div>

                  <AnimatePresence>
                    {err && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className={`flex items-center gap-2.5 p-3 rounded-xl border text-sm ${
                          isDark
                            ? "bg-rose-500/10 border-rose-400/20 text-rose-400"
                            : "bg-rose-50 border-rose-200 text-rose-600"
                        }`}
                      >
                        <AlertCircle size={14} />
                        {err}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex gap-3">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        setMode("view");
                        setErr(null);
                      }}
                      className={`flex-1 h-11 rounded-2xl text-sm font-semibold border transition-all ${
                        isDark
                          ? "bg-white/[0.06] border-white/[0.1] text-white/60 hover:bg-white/[0.09]"
                          : "bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      Назад
                    </motion.button>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleSave}
                      disabled={saving}
                      className={`flex-1 h-11 rounded-2xl text-sm font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 bg-gradient-to-r ${
                        isDark ? cfg.gradDark : cfg.gradLight
                      }`}
                    >
                      {saving ? (
                        <>
                          <Loader2 size={15} className="animate-spin" />{" "}
                          Сохранение...
                        </>
                      ) : (
                        <>
                          <CheckCircle size={15} /> Сохранить
                        </>
                      )}
                    </motion.button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── UpcomingTimeOffsModal (обновленная версия с автозакрытием) ──
function UpcomingTimeOffsModal({
  isOpen,
  onClose,
  master,
  timeOffs,
  onPeriodClick,
  onDeleted,
  onUpdated,
  isDark,
}: {
  isOpen: boolean;
  onClose: () => void;
  master: IMaster;
  timeOffs: IMasterTimeOff[];
  onPeriodClick: (period: IMasterTimeOff) => void;
  onDeleted: () => void;
  onUpdated: () => void;
  isDark: boolean;
}) {
  const [selectedPeriod, setSelectedPeriod] = useState<IMasterTimeOff | null>(
    null,
  );
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [localTimeOffs, setLocalTimeOffs] =
    useState<IMasterTimeOff[]>(timeOffs);

  // Обновляем локальный список при изменении пропсов
  useEffect(() => {
    setLocalTimeOffs(timeOffs);
  }, [timeOffs]);

  const handlePeriodClick = (period: IMasterTimeOff) => {
    setSelectedPeriod(period);
    setShowDetailsModal(true);
  };

  const handlePeriodDeleted = async () => {
    await onDeleted();
    // Закрываем модал деталей
    setShowDetailsModal(false);
    setSelectedPeriod(null);

    // Если после удаления не осталось периодов, закрываем основной модал
    if (localTimeOffs.length <= 1) {
      onClose();
    }
  };

  const handlePeriodUpdated = async () => {
    await onUpdated();
    // Закрываем модал деталей
    setShowDetailsModal(false);
    setSelectedPeriod(null);
  };

  const modalCls = isDark
    ? "bg-slate-900/90 backdrop-blur-3xl border border-white/[0.1] shadow-[0_32px_80px_rgba(0,0,0,0.7)]"
    : "bg-white/95 backdrop-blur-xl border border-gray-200/70 shadow-2xl";

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => e.target === e.currentTarget && onClose()}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{
              background: isDark ? "rgba(0,0,0,0.75)" : "rgba(15,23,42,0.4)",
              backdropFilter: "blur(12px)",
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              transition={{ type: "spring", damping: 28, stiffness: 340 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-md rounded-3xl overflow-hidden ${modalCls}`}
            >
              <div
                className={`relative px-6 py-5 bg-gradient-to-r from-purple-500 to-pink-500 overflow-hidden`}
              >
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full" />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl">
                      <CalendarDays size={20} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white">
                        Будущие периоды
                      </h3>
                      <p className="text-white/70 text-xs mt-0.5">
                        {master.surname} {master.name}
                      </p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ duration: 0.18 }}
                    onClick={onClose}
                    className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center text-white hover:bg-white/25 transition-colors"
                  >
                    <X size={16} />
                  </motion.button>
                </div>
              </div>

              <div className="p-5">
                {localTimeOffs.length === 0 ? (
                  <div className="text-center py-8">
                    <CalendarDays
                      size={48}
                      className={`mx-auto mb-3 ${isDark ? "text-white/20" : "text-gray-300"}`}
                    />
                    <p
                      className={`text-sm ${isDark ? "text-white/40" : "text-gray-500"}`}
                    >
                      Нет запланированных периодов недоступности
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {localTimeOffs.map((period) => {
                      const cfg =
                        VTYPE[period.type as VacationType] ?? VTYPE.other;
                      const start = new Date(
                        period.startDate,
                      ).toLocaleDateString("ru-RU", {
                        day: "numeric",
                        month: "long",
                      });
                      const end = new Date(period.endDate).toLocaleDateString(
                        "ru-RU",
                        {
                          day: "numeric",
                          month: "long",
                        },
                      );

                      return (
                        <motion.button
                          key={period.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handlePeriodClick(period)}
                          className={`w-full p-4 rounded-2xl border text-left transition-all ${
                            isDark
                              ? "bg-white/[0.04] border-white/[0.07] hover:bg-white/[0.08]"
                              : "bg-gray-50 border-gray-100 hover:bg-gray-100"
                          }`}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">{cfg.emoji}</span>
                            <span
                              className={`font-bold ${isDark ? "text-white/90" : "text-gray-900"}`}
                            >
                              {cfg.label}
                            </span>
                          </div>
                          <div
                            className={`text-xs ${isDark ? "text-white/50" : "text-gray-500"}`}
                          >
                            {start} — {end}
                          </div>
                          {period.comment && (
                            <div
                              className={`text-xs mt-2 ${isDark ? "text-white/30" : "text-gray-400"}`}
                            >
                              {period.comment}
                            </div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div
                className={`px-6 py-3 border-t flex items-center justify-between text-xs ${
                  isDark
                    ? "border-white/[0.06] text-white/20"
                    : "border-gray-100 text-gray-400"
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Bell size={11} />
                  {localTimeOffs.length} запланированных периодов
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Детальный модал для выбранного периода */}
      {selectedPeriod && (
        <TimeOffDetailsModal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedPeriod(null);
          }}
          master={master}
          period={selectedPeriod}
          onDeleted={() => {
            handlePeriodDeleted();
          }}
          onUpdated={() => {
            handlePeriodUpdated();
          }}
          isDark={isDark}
          isUpcoming={true}
        />
      )}
    </>
  );
}

// ── Master card (обновлен с поддержкой будущих периодов) ─────────────────────
function MasterCard({
  master,
  status,
  upcomingTimeOffs,
  isDark,
  onEdit,
  onDelete,
  onToggle,
  onVacation,
  onViewTimeOff,
  onViewUpcoming,
  onMenuToggle,
  menuButtonRef,
}: {
  master: IMaster;
  status?: MasterStatusInfo;
  upcomingTimeOffs: IMasterTimeOff[];
  isDark: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
  onVacation: () => void;
  onViewTimeOff: () => void;
  onViewUpcoming: () => void;
  onMenuToggle: (id: number) => void;
  menuButtonRef: (el: HTMLButtonElement | null) => void;
}) {
  const isTimeOff = !!(status?.isOnTimeOff && status.currentPeriod);
  const hasUpcoming = upcomingTimeOffs.length > 0;
  const grad = specGrad(master.specialization);

  const cardCls = isDark
    ? "bg-gradient-to-b from-white/[0.06] to-transparent backdrop-blur-xl border border-white/[0.08] hover:border-white/[0.14] transition-all duration-300"
    : "bg-gradient-to-b from-white to-gray-50/50 border border-gray-200/60 hover:border-gray-300/70 transition-all duration-300";

  const menuCls = isDark
    ? "bg-zinc-900/95 backdrop-blur-xl border border-white/[0.08] shadow-2xl"
    : "bg-white border border-gray-100 shadow-xl";

  const MENU_ITEMS = [
    ...(hasUpcoming
      ? [
          {
            label: "Будущие периоды",
            sub: `${upcomingTimeOffs.length} запланирован${upcomingTimeOffs.length === 1 ? "а" : "о"}`,
            icon: <CalendarDays size={14} />,
            color: isDark ? "text-purple-400" : "text-purple-600",
            hover: isDark ? "hover:bg-purple-500/10" : "hover:bg-purple-50",
            onClick: onViewUpcoming,
          },
        ]
      : []),
    isTimeOff
      ? {
          label: "Текущий период",
          sub: "Просмотр текущей недоступности",
          icon: <Eye size={14} />,
          color: isDark ? "text-blue-400" : "text-blue-600",
          hover: isDark ? "hover:bg-blue-500/10" : "hover:bg-blue-50",
          onClick: onViewTimeOff,
        }
      : {
          label: "Отправить в отпуск",
          sub: "Добавить период недоступности",
          icon: <Calendar size={14} />,
          color: isDark ? "text-purple-400" : "text-purple-600",
          hover: isDark ? "hover:bg-purple-500/10" : "hover:bg-purple-50",
          onClick: onVacation,
        },
    {
      label: master.isActive ? "Деактивировать" : "Активировать",
      sub: master.isActive ? "Сделать недоступным" : "Вернуть в работу",
      icon: <Power size={14} />,
      color: isDark ? "text-blue-400" : "text-blue-600",
      hover: isDark ? "hover:bg-blue-500/10" : "hover:bg-blue-50",
      onClick: onToggle,
    },
    {
      label: "Редактировать",
      sub: "Изменить данные",
      icon: <Edit size={14} />,
      color: isDark ? "text-emerald-400" : "text-emerald-600",
      hover: isDark ? "hover:bg-emerald-500/10" : "hover:bg-emerald-50",
      onClick: onEdit,
    },
    {
      label: "Удалить",
      sub: "Удалить сотрудника",
      icon: <Trash2 size={14} />,
      color: isDark ? "text-rose-400" : "text-rose-500",
      hover: isDark ? "hover:bg-rose-500/10" : "hover:bg-rose-50",
      onClick: onDelete,
    },
  ];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25 }}
      className={`rounded-[20px] overflow-hidden ${cardCls}`}
    >
      <div className="p-5 pb-4">
        {/* Top row: avatar + info */}
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div
              className={`w-[60px] h-[60px] rounded-[16px] bg-gradient-to-br ${grad} flex items-center justify-center text-white font-semibold text-lg overflow-hidden shadow-md`}
            >
              {master.photo ? (
                <img
                  src={master.photo}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                getInitials(master)
              )}
            </div>
            {/* Status dot */}
            <div
              className={`absolute -bottom-[3px] -right-[3px] w-[14px] h-[14px] rounded-full border-2 ${
                isTimeOff
                  ? "bg-amber-400"
                  : master.isActive
                    ? "bg-emerald-400"
                    : "bg-gray-300"
              } ${isDark ? "border-zinc-900" : "border-white"}`}
            />
          </div>

          {/* Info */}
          <div className="min-w-0 flex-1">
            <h3
              className={`font-semibold text-[16px] leading-tight ${isDark ? "text-white" : "text-gray-900"}`}
            >
              {master.surname} {master.name}
            </h3>
            {master.middlename && (
              <p
                className={`text-[13px] mt-0.5 ${isDark ? "text-white/35" : "text-gray-400"}`}
              >
                {master.middlename}
              </p>
            )}
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[12px] font-medium bg-gradient-to-r ${grad} text-white mt-2`}
            >
              {master.specialization}
            </span>
          </div>

          {/* Menu trigger */}
          <div className="relative shrink-0">
            <motion.button
              ref={menuButtonRef}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                onMenuToggle(master.id!);
              }}
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                isDark
                  ? "text-white/30 hover:text-white/60 hover:bg-white/[0.06]"
                  : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              }`}
            >
              <MoreVertical size={15} />
            </motion.button>
          </div>
        </div>

        {/* Phone */}
        {master.phone && (
          <div
            className={`flex items-center gap-2 text-[13px] mt-3.5 px-3 py-2 rounded-xl ${
              isDark
                ? "bg-white/[0.04] text-white/50"
                : "bg-gray-50/80 text-gray-500"
            }`}
          >
            <Phone size={13} />
            <span>{formatPhoneNumber(master.phone)}</span>
          </div>
        )}
      </div>

      {/* Bottom section */}
      <div
        className={`pt-3.5 pb-4 px-5 border-t ${isDark ? "border-white/[0.06]" : "border-gray-100"}`}
      >
        <div className="flex items-center justify-between">
          {/* Status */}
          {isTimeOff && status?.currentPeriod ? (
            <CurrentVacationBadge
              period={status.currentPeriod}
              isDark={isDark}
              onClick={onViewTimeOff}
            />
          ) : (
            <div className="flex items-center gap-2">
              <div
                className={`w-[7px] h-[7px] rounded-full ${
                  master.isActive ? "bg-emerald-400" : "bg-gray-300"
                }`}
              />
              <span
                className={`text-[13px] font-medium ${
                  master.isActive
                    ? isDark
                      ? "text-emerald-400"
                      : "text-emerald-600"
                    : isDark
                      ? "text-white/30"
                      : "text-gray-400"
                }`}
              >
                {master.isActive ? "Активен" : "Неактивен"}
              </span>
            </div>
          )}

          {/* Upcoming periods count */}
          {hasUpcoming && !isTimeOff && (
            <button
              onClick={onViewUpcoming}
              className={`text-[12px] font-medium flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${
                isDark
                  ? "bg-purple-500/10 text-purple-300 hover:bg-purple-500/15"
                  : "bg-purple-50 text-purple-600 hover:bg-purple-100"
              }`}
            >
              <CalendarDays size={11} />
              {upcomingTimeOffs.length} {upcomingTimeOffs.length === 1 ? "период" : upcomingTimeOffs.length < 5 ? "периода" : "периодов"}
            </button>
          )}

          {!hasUpcoming && !isTimeOff && <div />}
        </div>
      </div>
    </motion.div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Employees() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isVacOpen, setIsVacOpen] = useState(false);
  const [editMaster, setEditMaster] = useState<IMaster | null>(null);
  const [vacMaster, setVacMaster] = useState<IMaster | null>(null);
  const [masters, setMasters] = useState<IMaster[]>([]);
  const [statuses, setStatuses] = useState<Record<number, MasterStatusInfo>>(
    {},
  );
  const [upcomingTimeOffs, setUpcomingTimeOffs] = useState<
    Record<number, IMasterTimeOff[]>
  >({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [search, setSearch] = useState("");
  const [specFilter, setSpecFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);

  const [isTimeOffDetailsOpen, setIsTimeOffDetailsOpen] = useState(false);
  const [timeOffDetailsMaster, setTimeOffDetailsMaster] =
    useState<IMaster | null>(null);
  const [timeOffDetailsPeriod, setTimeOffDetailsPeriod] = useState<NonNullable<
    MasterStatusInfo["currentPeriod"]
  > | null>(null);

  const [isUpcomingModalOpen, setIsUpcomingModalOpen] = useState(false);
  const [upcomingModalMaster, setUpcomingModalMaster] =
    useState<IMaster | null>(null);
  const [upcomingModalPeriods, setUpcomingModalPeriods] = useState<
    IMasterTimeOff[]
  >([]);

  // Global menu state — only one menu open at a time
  const [openMenuMasterId, setOpenMenuMasterId] = useState<number | null>(null);
  const menuButtonRefs = useRef<Record<number, HTMLButtonElement | null>>({});
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);

  const handleMenuToggle = useCallback((masterId: number) => {
    setOpenMenuMasterId((prev) => (prev === masterId ? null : masterId));
  }, []);

  // Clear menuPosition when menu is closed
  useEffect(() => {
    if (openMenuMasterId === null) {
      setMenuPosition(null);
    }
  }, [openMenuMasterId]);

  // Update menu position on scroll
  useEffect(() => {
    if (openMenuMasterId === null) return;

    const updatePosition = () => {
      const btn = menuButtonRefs.current[openMenuMasterId];
      if (!btn) {
        setOpenMenuMasterId(null);
        setMenuPosition(null);
        return;
      }
      const rect = btn.getBoundingClientRect();
      // Close menu if button is off-screen
      if (rect.bottom < 0 || rect.top > window.innerHeight) {
        setOpenMenuMasterId(null);
        setMenuPosition(null);
        return;
      }
      setMenuPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.right + window.scrollX - 208,
      });
    };

    // Set initial position
    updatePosition();

    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [openMenuMasterId]);

  // Close menu on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (openMenuMasterId !== null) {
        const target = e.target as Node;
        const isMenuButton = Object.values(menuButtonRefs.current).some(
          (btn) => btn && target === btn
        );
        const isMenuDropdown = target.parentElement?.closest('[data-master-menu]');
        if (!isMenuButton && !isMenuDropdown) {
          setOpenMenuMasterId(null);
          setMenuPosition(null);
        }
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [openMenuMasterId]);

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

  const loadMasters = async (showLoader = true) => {
    showLoader ? setLoading(true) : setRefreshing(true);
    try {
      const data = await masterService.getAll();
      setMasters(data);
      const st: Record<number, MasterStatusInfo> = {};
      const upcoming: Record<number, IMasterTimeOff[]> = {};

      await Promise.all(
        data.map(async (m) => {
          if (m.id) {
            try {
              // Получаем текущий статус
              st[m.id] = await masterScheduleService.getMasterStatus(m.id);

              // Получаем все периоды недоступности для мастера
              const allTimeOffs =
                await masterScheduleService.getTimeOffByMaster(m.id);
              const now = new Date();

              // Фильтруем будущие периоды (дата начала > текущей даты)
              upcoming[m.id] = allTimeOffs.filter((t) => {
                const startDate = new Date(t.startDate);
                return startDate > now;
              });
            } catch {
              st[m.id] = { isOnTimeOff: false, currentPeriod: null };
              upcoming[m.id] = [];
            }
          }
        }),
      );
      setStatuses(st);
      setUpcomingTimeOffs(upcoming);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadMasters();
    const id = setInterval(() => loadMasters(false), 5 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  const filtered = useMemo(
    () =>
      masters.filter((m) => {
        const q = search.toLowerCase();
        const matchQ =
          !q ||
          `${m.name} ${m.surname} ${m.middlename ?? ""} ${m.specialization} ${m.phone ?? ""}`
            .toLowerCase()
            .includes(q);
        const matchS =
          !specFilter ||
          m.specialization.toLowerCase().includes(specFilter.toLowerCase());
        const matchSt =
          !statusFilter ||
          (statusFilter === "active" && m.isActive) ||
          (statusFilter === "inactive" && !m.isActive);
        return matchQ && matchS && matchSt;
      }),
    [masters, search, specFilter, statusFilter],
  );

  const stats = useMemo(
    () => ({
      total: masters.length,
      active: masters.filter((m) => m.isActive && !statuses[m.id!]?.isOnTimeOff)
        .length,
      inactive: masters.filter((m) => !m.isActive).length,
      onLeave: Object.values(statuses).filter((s) => s.isOnTimeOff).length,
      upcoming: Object.values(upcomingTimeOffs).reduce(
        (sum, arr) => sum + arr.length,
        0,
      ),
    }),
    [masters, statuses, upcomingTimeOffs],
  );

  const handleCreate = async (data: any) => {
    await masterService.create({
      name: data.name,
      surname: data.surname,
      middlename: data.middlename || "",
      specialization: data.specialization,
      photo: data.photoUrl || "", // Передаем ссылку в поле photo
      phone: data.phone?.replace(/\D/g, "") || "",
      isActive: data.isActive ?? true,
    });
    await loadMasters(false);
    setIsCreateOpen(false);
  };

  const handleUpdate = async (data: any) => {
    if (!editMaster) return;

    // Формируем полный объект обновления.
    // Берем старые значения из editMaster и перезаписываем новыми из формы.
    // Это гарантирует, что все обязательные поля (name, surname и т.д.) будут отправлены.
    const updatePayload = {
      name: data.name || editMaster.name,
      surname: data.surname || editMaster.surname,
      middlename: data.middlename !== undefined ? data.middlename : editMaster.middlename,
      specialization: data.specialization || editMaster.specialization,
      phone: data.phone ? data.phone.replace(/\D/g, "") : editMaster.phone,
      isActive: data.isActive !== undefined ? data.isActive : editMaster.isActive,
      // Логика фото: если в форме есть ссылка - берем её, иначе оставляем старую
      photo: data.photoUrl ? data.photoUrl : editMaster.photo,
    };

    try {
      await masterService.update(editMaster.id!, updatePayload);
      await loadMasters(false);
      setIsEditOpen(false);
      setEditMaster(null);
    } catch (error) {
      console.error("Ошибка при обновлении:", error);
      alert("Не удалось обновить сотрудника. Проверьте консоль или формат данных.");
    }
  };

  const handleVacation = async (d: VacationFormData) => {
    const startDate = new Date(d.startDate);
    const endDate = new Date(d.endDate);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new Error("Invalid date format");
    }

    await masterScheduleService.createTimeOff({
      masterId: d.masterId,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      type: d.type,
      comment: d.comment || undefined,
    });
    await loadMasters(false);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Удалить сотрудника?")) return;
    await masterService.delete(id);
    await loadMasters(false);
  };

  const handleToggle = async (m: IMaster) => {
    await masterService.update(m.id!, { isActive: !m.isActive });
    await loadMasters(false);
  };

  const handleOpenTimeOffDetails = (master: IMaster) => {
    const status = statuses[master.id!];
    if (status?.currentPeriod) {
      setTimeOffDetailsMaster(master);
      setTimeOffDetailsPeriod(status.currentPeriod);
      setIsTimeOffDetailsOpen(true);
    }
  };

  const handleOpenUpcomingModal = (master: IMaster) => {
    const upcoming = upcomingTimeOffs[master.id!] || [];
    if (upcoming.length > 0) {
      setUpcomingModalMaster(master);
      setUpcomingModalPeriods(upcoming);
      setIsUpcomingModalOpen(true);
    }
  };

  const refreshAfterTimeOffChange = async () => {
    await loadMasters(false);
    // Обновляем данные в открытом модале, если он открыт
    if (isUpcomingModalOpen && upcomingModalMaster) {
      const updatedUpcoming = upcomingTimeOffs[upcomingModalMaster.id!] || [];
      setUpcomingModalPeriods(updatedUpcoming);
      // Если после обновления не осталось периодов, закрываем модал
      if (updatedUpcoming.length === 0) {
        setIsUpcomingModalOpen(false);
        setUpcomingModalMaster(null);
        setUpcomingModalPeriods([]);
      }
    }
  };

  const glassCls = isDark
    ? "bg-white/[0.07] backdrop-blur-2xl border border-white/[0.1] shadow-lg"
    : "bg-white border border-gray-200/70 shadow-sm";

  const SPECIALIZATIONS = [
    "Парикмахер",
    "Массажист",
    "Косметолог",
    "Маникюр",
    "Визажист",
    "Стилист",
  ];

  const STAT_CARDS = [
    {
      num: stats.total,
      label: "Всего",
      sub: "сотрудников",
      grad: "from-blue-500 to-indigo-600",
      glow: "shadow-blue-500/20",
    },
    {
      num: stats.active,
      label: "Активных",
      sub: "сейчас работают",
      grad: "from-emerald-500 to-teal-600",
      glow: "shadow-emerald-500/20",
    },
    {
      num: stats.onLeave,
      label: "В отпуске",
      sub: "недоступны",
      grad: "from-amber-500 to-orange-500",
      glow: "shadow-amber-500/20",
    },
    {
      num: stats.upcoming,
      label: "Будущих",
      sub: "запланированных",
      grad: "from-purple-500 to-pink-600",
      glow: "shadow-purple-500/20",
    },
  ];

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <div className="max-w-9xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className={`flex items-center gap-2 mb-2.5`}>
                <div
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border ${
                    isDark
                      ? "bg-white/[0.06] border-white/[0.09] text-white/40"
                      : "bg-gray-100 border-gray-200 text-gray-400"
                  }`}
                >
                  <Activity size={11} />
                  Команда
                </div>
              </div>
              <h1
                className={`text-4xl md:text-5xl font-black leading-none tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}
              >
                Сотрудники
              </h1>
              <p
                className={`mt-2 text-sm ${isDark ? "text-white/35" : "text-gray-400"}`}
              >
                {stats.total} человек · {stats.active} активны
                {stats.onLeave > 0 && ` · ${stats.onLeave} в отпуске`}
                {stats.upcoming > 0 && ` · ${stats.upcoming} будущих`}
              </p>
            </div>

            <div className="flex gap-2.5 flex-wrap">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => loadMasters(false)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                  isDark
                    ? "bg-white/[0.07] border-white/[0.1] text-white/60 hover:text-white/80 hover:bg-white/[0.1]"
                    : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50 shadow-sm"
                }`}
              >
                <RefreshCw
                  size={14}
                  className={refreshing ? "animate-spin" : ""}
                />
                Обновить
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setIsCreateOpen(true)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg transition-all ${
                  isDark
                    ? "bg-gradient-to-r from-indigo-500 to-purple-600 shadow-purple-500/25 hover:shadow-purple-500/40"
                    : "bg-gradient-to-r from-blue-500 to-purple-600 shadow-blue-500/20 hover:shadow-blue-500/35"
                }`}
              >
                <UserPlus size={16} />
                Новый сотрудник
              </motion.button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {STAT_CARDS.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ y: -3, scale: 1.02 }}
              className={`relative rounded-2xl p-5 overflow-hidden transition-all duration-300 ${
                isDark
                  ? `bg-white/[0.07] backdrop-blur-xl border border-white/[0.1] shadow-lg hover:shadow-xl ${s.glow}`
                  : `bg-white border border-gray-200/70 shadow-sm hover:shadow-md ${s.glow}`
              }`}
            >
              <div
                className={`absolute -top-5 -right-5 w-16 h-16 bg-gradient-to-br ${s.grad} opacity-[0.12] rounded-xl rotate-12 blur-sm`}
              />
              <div className="relative">
                <div
                  className={`w-9 h-9 rounded-xl bg-gradient-to-br ${s.grad} flex items-center justify-center shadow-md mb-3`}
                >
                  {i === 3 ? (
                    <CalendarDays size={17} className="text-white" />
                  ) : (
                    <Users size={17} className="text-white" />
                  )}
                </div>
                <div
                  className={`text-3xl font-black leading-none mb-1 ${isDark ? "text-white" : "text-gray-900"}`}
                >
                  {s.num}
                </div>
                <div
                  className={`text-sm font-semibold ${isDark ? "text-white/70" : "text-gray-700"}`}
                >
                  {s.label}
                </div>
                <div
                  className={`text-xs mt-0.5 ${isDark ? "text-white/30" : "text-gray-400"}`}
                >
                  {s.sub}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className={`rounded-2xl p-4 ${glassCls}`}
        >
          <div className="flex gap-3 flex-wrap">
            <div className="flex-1 min-w-[180px] relative">
              <Search
                size={15}
                className={`absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? "text-white/25" : "text-gray-400"}`}
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Поиск по имени, специализации..."
                className={`w-full h-11 pl-10 pr-4 rounded-xl text-sm border outline-none transition-all ${
                  isDark
                    ? "bg-white/[0.07] border-white/[0.08] text-white/90 placeholder-white/25 focus:border-indigo-400/40"
                    : "bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400 focus:border-blue-300 focus:bg-white"
                }`}
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDark ? "text-white/30 hover:text-white/60" : "text-gray-400"}`}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setFilterOpen(!filterOpen)}
              className={`h-11 flex items-center gap-2 px-4 rounded-xl text-sm font-semibold border transition-all ${
                filterOpen
                  ? isDark
                    ? "bg-indigo-500/20 border-indigo-400/30 text-indigo-300"
                    : "bg-blue-50 border-blue-300 text-blue-600"
                  : isDark
                    ? "bg-white/[0.07] border-white/[0.09] text-white/55 hover:bg-white/[0.1]"
                    : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-white shadow-sm"
              }`}
            >
              <SlidersHorizontal size={15} />
              Фильтры
              {filterOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </motion.button>

            {(search || specFilter || statusFilter) && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSearch("");
                  setSpecFilter("");
                  setStatusFilter("");
                }}
                className={`h-11 px-4 rounded-xl text-sm font-semibold border transition-all ${
                  isDark
                    ? "bg-rose-500/10 border-rose-400/20 text-rose-400"
                    : "bg-rose-50 border-rose-200 text-rose-500"
                }`}
              >
                <X size={15} />
              </motion.button>
            )}
          </div>

          <AnimatePresence>
            {filterOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: "auto", marginTop: 12 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                className="overflow-hidden"
              >
                <div
                  className={`pt-3 border-t grid grid-cols-1 sm:grid-cols-2 gap-3 ${isDark ? "border-white/[0.07]" : "border-gray-100"}`}
                >
                  <div>
                    <p
                      className={`text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? "text-white/25" : "text-gray-400"}`}
                    >
                      Специализация
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {SPECIALIZATIONS.map((sp) => (
                        <motion.button
                          key={sp}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() =>
                            setSpecFilter(specFilter === sp ? "" : sp)
                          }
                          className={`h-7 px-3 rounded-full text-xs font-semibold border transition-all ${
                            specFilter === sp
                              ? isDark
                                ? "bg-indigo-500/20 border-indigo-400/30 text-indigo-300"
                                : "bg-blue-100 border-blue-300 text-blue-700"
                              : isDark
                                ? "bg-white/[0.05] border-white/[0.07] text-white/45 hover:border-white/[0.12]"
                                : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-white"
                          }`}
                        >
                          {sp}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p
                      className={`text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? "text-white/25" : "text-gray-400"}`}
                    >
                      Статус
                    </p>
                    <div className="flex gap-2">
                      {[
                        { v: "", l: "Все" },
                        { v: "active", l: "Активные" },
                        { v: "inactive", l: "Неактивные" },
                      ].map((o) => (
                        <motion.button
                          key={o.v}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => setStatusFilter(o.v)}
                          className={`h-7 px-3 rounded-full text-xs font-semibold border transition-all ${
                            statusFilter === o.v
                              ? isDark
                                ? "bg-indigo-500/20 border-indigo-400/30 text-indigo-300"
                                : "bg-blue-100 border-blue-300 text-blue-700"
                              : isDark
                                ? "bg-white/[0.05] border-white/[0.07] text-white/45"
                                : "bg-gray-50 border-gray-200 text-gray-500"
                          }`}
                        >
                          {o.l}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {!loading && (
          <div
            className={`px-1 text-xs ${isDark ? "text-white/25" : "text-gray-400"}`}
          >
            {filtered.length === masters.length
              ? `${filtered.length} сотрудников`
              : `${filtered.length} из ${masters.length}`}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div
              className={`w-10 h-10 rounded-full border-t-transparent animate-spin mb-4 ${isDark ? "border-purple-400" : "border-blue-400"}`}
              style={{ borderWidth: 3, borderStyle: "solid" }}
            />
            <p
              className={`text-sm ${isDark ? "text-white/35" : "text-gray-400"}`}
            >
              Загрузка сотрудников...
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className={`rounded-2xl p-16 text-center ${glassCls}`}>
            <div
              className={`w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center ${isDark ? "bg-white/[0.06]" : "bg-gray-100"}`}
            >
              <Users
                size={26}
                className={isDark ? "text-white/20" : "text-gray-300"}
              />
            </div>
            <p
              className={`text-lg font-bold mb-1 ${isDark ? "text-white/50" : "text-gray-500"}`}
            >
              Сотрудники не найдены
            </p>
            <p
              className={`text-sm ${isDark ? "text-white/25" : "text-gray-400"}`}
            >
              {search || specFilter || statusFilter
                ? "Попробуйте изменить параметры поиска"
                : "Создайте первого сотрудника"}
            </p>
            {!search && !specFilter && !statusFilter && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={() => setIsCreateOpen(true)}
                className={`mt-5 px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg ${
                  isDark
                    ? "bg-gradient-to-r from-indigo-500 to-purple-600"
                    : "bg-gradient-to-r from-blue-500 to-purple-600"
                }`}
              >
                + Создать сотрудника
              </motion.button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5">
            <AnimatePresence mode="popLayout">
              {filtered.map((m) => (
                <MasterCard
                  key={m.id}
                  master={m}
                  status={statuses[m.id!]}
                  upcomingTimeOffs={upcomingTimeOffs[m.id!] || []}
                  isDark={isDark}
                  onEdit={() => {
                    setEditMaster(m);
                    setIsEditOpen(true);
                  }}
                  onDelete={() => handleDelete(m.id!)}
                  onToggle={() => handleToggle(m)}
                  onVacation={() => {
                    setVacMaster(m);
                    setIsVacOpen(true);
                  }}
                  onViewTimeOff={() => handleOpenTimeOffDetails(m)}
                  onViewUpcoming={() => handleOpenUpcomingModal(m)}
                  onMenuToggle={handleMenuToggle}
                  menuButtonRef={(el) => {
                    menuButtonRefs.current[m.id!] = el;
                  }}
                />
              ))}
            </AnimatePresence>

            {/* Global menu dropdown — rendered once, outside cards */}
            <AnimatePresence>
              {openMenuMasterId !== null && (() => {
                const master = masters.find((m) => m.id === openMenuMasterId);
                if (!master) return null;

                const isTimeOff = !!(
                  statuses[openMenuMasterId]?.isOnTimeOff &&
                  statuses[openMenuMasterId]?.currentPeriod
                );
                const upcoming = upcomingTimeOffs[openMenuMasterId] || [];
                const hasUpcoming = upcoming.length > 0;

                const MENU_ITEMS = [
                  ...(hasUpcoming
                    ? [
                        {
                          label: "Будущие периоды",
                          icon: <CalendarDays size={14} />,
                          color: isDark ? "text-purple-400" : "text-purple-600",
                          hover: isDark
                            ? "hover:bg-purple-500/10"
                            : "hover:bg-purple-50",
                          onClick: () => {
                            handleOpenUpcomingModal(master);
                            setOpenMenuMasterId(null);
                          },
                        },
                      ]
                    : []),
                  isTimeOff
                    ? {
                        label: "Текущий период",
                        icon: <Eye size={14} />,
                        color: isDark ? "text-blue-400" : "text-blue-600",
                        hover: isDark
                          ? "hover:bg-blue-500/10"
                          : "hover:bg-blue-50",
                        onClick: () => {
                          handleOpenTimeOffDetails(master);
                          setOpenMenuMasterId(null);
                        },
                      }
                    : {
                        label: "Отправить в отпуск",
                        icon: <Calendar size={14} />,
                        color: isDark ? "text-purple-400" : "text-purple-600",
                        hover: isDark
                          ? "hover:bg-purple-500/10"
                          : "hover:bg-purple-50",
                        onClick: () => {
                          setVacMaster(master);
                          setIsVacOpen(true);
                          setOpenMenuMasterId(null);
                        },
                      },
                  {
                    label: master.isActive ? "Деактивировать" : "Активировать",
                    icon: <Power size={14} />,
                    color: isDark ? "text-blue-400" : "text-blue-600",
                    hover: isDark
                      ? "hover:bg-blue-500/10"
                      : "hover:bg-blue-50",
                    onClick: () => {
                      handleToggle(master);
                      setOpenMenuMasterId(null);
                    },
                  },
                  {
                    label: "Редактировать",
                    icon: <Edit size={14} />,
                    color: isDark ? "text-emerald-400" : "text-emerald-600",
                    hover: isDark
                      ? "hover:bg-emerald-500/10"
                      : "hover:bg-emerald-50",
                    onClick: () => {
                      setEditMaster(master);
                      setIsEditOpen(true);
                      setOpenMenuMasterId(null);
                    },
                  },
                  {
                    label: "Удалить",
                    icon: <Trash2 size={14} />,
                    color: isDark ? "text-rose-400" : "text-rose-500",
                    hover: isDark
                      ? "hover:bg-rose-500/10"
                      : "hover:bg-rose-50",
                    onClick: () => {
                      handleDelete(master.id!);
                      setOpenMenuMasterId(null);
                    },
                  },
                ];

                const menuCls = isDark
                  ? "bg-zinc-900/95 backdrop-blur-xl border border-white/[0.08] shadow-2xl"
                  : "bg-white border border-gray-100 shadow-xl";

                return (
                  <motion.div
                    key="global-menu"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.1 }}
                    data-master-menu
                    className={`absolute w-52 rounded-xl overflow-hidden z-[100] ${menuCls}`}
                    style={{
                      top: menuPosition?.top ?? 0,
                      left: menuPosition?.left ?? 0,
                    }}
                  >
                    <div className="p-1.5 space-y-0.5">
                      {MENU_ITEMS.map((item) => (
                        <motion.button
                          key={item.label}
                          whileHover={{ scale: 1.02, x: 2 }}
                          onClick={item.onClick}
                          className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-colors text-left ${item.color} ${item.hover}`}
                        >
                          <div className="shrink-0">{item.icon}</div>
                          <div>
                            <div className="text-[13px] font-medium">
                              {item.label}
                            </div>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                );
              })()}
            </AnimatePresence>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className={`flex flex-wrap items-center justify-between gap-3 pt-5 border-t text-xs ${
              isDark
                ? "border-white/[0.06] text-white/20"
                : "border-gray-100 text-gray-400"
            }`}
          >
            <div className="flex flex-wrap gap-4">
              {[
                { c: "bg-emerald-400", l: "Активные" },
                { c: "bg-amber-400", l: "В отпуске" },
                { c: "bg-purple-400", l: "Будущие периоды" },
                { c: "bg-rose-400", l: "Неактивные" },
              ].map((x) => (
                <div key={x.l} className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${x.c}`} />
                  {x.l}
                </div>
              ))}
            </div>
            <span>Загружено: {masters.length} сотрудников</span>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {isCreateOpen && (
          <EmployeesCard
            isOpen={isCreateOpen}
            onClose={() => setIsCreateOpen(false)}
            onSubmit={handleCreate}
          />
        )}
        {isEditOpen && editMaster && (
          <EmployeesCard
            isOpen={isEditOpen}
            onClose={() => {
              setIsEditOpen(false);
              setEditMaster(null);
            }}
            onSubmit={handleUpdate}
            master={editMaster}
            isEditMode
          />
        )}
        {isVacOpen && (
          <VacationModal
            isOpen={isVacOpen}
            onClose={() => {
              setIsVacOpen(false);
              setVacMaster(null);
            }}
            onSubmit={handleVacation}
            master={vacMaster}
            isDark={isDark}
          />
        )}
        {isTimeOffDetailsOpen && (
          <TimeOffDetailsModal
            isOpen={isTimeOffDetailsOpen}
            onClose={() => {
              setIsTimeOffDetailsOpen(false);
              setTimeOffDetailsMaster(null);
              setTimeOffDetailsPeriod(null);
            }}
            master={timeOffDetailsMaster}
            period={timeOffDetailsPeriod}
            onDeleted={async () => {
              setIsTimeOffDetailsOpen(false);
              await loadMasters(false);
            }}
            onUpdated={async () => {
              setIsTimeOffDetailsOpen(false);
              await loadMasters(false);
            }}
            isDark={isDark}
            isUpcoming={false}
          />
        )}
        {isUpcomingModalOpen && upcomingModalMaster && (
          <UpcomingTimeOffsModal
            isOpen={isUpcomingModalOpen}
            onClose={() => {
              setIsUpcomingModalOpen(false);
              setUpcomingModalMaster(null);
              setUpcomingModalPeriods([]);
            }}
            master={upcomingModalMaster}
            timeOffs={upcomingModalPeriods}
            onPeriodClick={(period) => {
              // Эта функция будет вызвана при клике на период в модале
              // Мы уже обрабатываем это внутри компонента
            }}
            onDeleted={async () => {
              await refreshAfterTimeOffChange();
            }}
            onUpdated={async () => {
              await refreshAfterTimeOffChange();
            }}
            isDark={isDark}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
