"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Clock4,
  CheckCheck,
  Ban,
  Edit,
  Trash2,
  Phone,
  Scissors,
  User2,
  CalendarDays,
  Zap,
  Timer,
  X,
  MessageSquareText,
} from "lucide-react";
import { formatPhoneNumber } from "@/app/lib/formatPhoneNumber";

interface Appointment {
  id: string;
  clientName: string;
  service: string;
  time: string;
  price: string;
  master: string;
  status: string;
  date: string;
  duration: number;
  rawDateTime: string;
  clientPhone?: string;
  comment?: string;
}

interface AppointmentItemProps {
  appointment: Appointment;
  onEdit?: (a: Appointment) => void;
  onDelete?: (id: string) => void;
  onComplete?: (id: string) => void;
  onCancel?: (id: string) => void;
  hideActions?: boolean;
  variant?: "default" | "confirmWindow";
  onConfirmAction?: (id: string) => void;
  onRejectAction?: (id: string) => void;
}

const fmtDT = (s: string) => {
  const d = new Date(s);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getInitials = (n: string) =>
  n
    .split(" ")
    .map((x) => x[0] ?? "")
    .join("")
    .toUpperCase()
    .slice(0, 2);

type SK = "Новый" | "Подтвержден" | "Завершен" | "Отменен";

const STATUS_CFG: Record<
  SK,
  {
    label: string;
    dot: string;
    gradFrom: string;
    gradTo: string;
    chipDark: string;
    chipLight: string;
    textDark: string;
    textLight: string;
    glowDark: string;
  }
> = {
  Новый: {
    label: "Новый",
    dot: "#f59e0b",
    gradFrom: "#f59e0b",
    gradTo: "#ef4444",
    chipDark: "bg-amber-500/15 border-amber-400/20",
    chipLight: "bg-amber-50 border-amber-200",
    textDark: "text-amber-300",
    textLight: "text-amber-700",
    glowDark: "shadow-amber-500/20",
  },
  Подтвержден: {
    label: "Подтверждён",
    dot: "#22c55e",
    gradFrom: "#22c55e",
    gradTo: "#10b981",
    chipDark: "bg-emerald-500/15 border-emerald-400/20",
    chipLight: "bg-emerald-50 border-emerald-200",
    textDark: "text-emerald-300",
    textLight: "text-emerald-700",
    glowDark: "shadow-emerald-500/20",
  },
  Завершен: {
    label: "Завершён",
    dot: "#6366f1",
    gradFrom: "#6366f1",
    gradTo: "#8b5cf6",
    chipDark: "bg-indigo-500/15 border-indigo-400/20",
    chipLight: "bg-indigo-50 border-indigo-200",
    textDark: "text-indigo-300",
    textLight: "text-indigo-700",
    glowDark: "shadow-indigo-500/20",
  },
  Отменен: {
    label: "Отменён",
    dot: "#ef4444",
    gradFrom: "#ef4444",
    gradTo: "#f43f5e",
    chipDark: "bg-rose-500/15 border-rose-400/20",
    chipLight: "bg-rose-50 border-rose-200",
    textDark: "text-rose-300",
    textLight: "text-rose-600",
    glowDark: "shadow-rose-500/20",
  },
};

const DEFAULT_CFG = {
  label: "Статус",
  dot: "#94a3b8",
  gradFrom: "#94a3b8",
  gradTo: "#64748b",
  chipDark: "bg-slate-500/15 border-slate-400/20",
  chipLight: "bg-slate-50 border-slate-200",
  textDark: "text-slate-300",
  textLight: "text-slate-600",
  glowDark: "shadow-slate-500/10",
};

export default function AppointmentItem({
  appointment,
  onEdit,
  onDelete,
  onComplete,
  onCancel,
  hideActions = false,
  variant = "default",
  onConfirmAction,
  onRejectAction,
}: AppointmentItemProps) {
  const [isDark, setIsDark] = useState(false);

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

  const st = STATUS_CFG[appointment.status as SK] ?? DEFAULT_CFG;
  const isActive = appointment.status === "Подтвержден";
  const isNew = appointment.status === "Новый";
  const isConfirmWindow = variant === "confirmWindow";

  const handleComplete = () =>
    onComplete &&
    window.confirm("Отметить как завершённую?") &&
    onComplete(appointment.id);

  const handleCancel = () =>
    onCancel && window.confirm("Отменить запись?") && onCancel(appointment.id);

  const handleDelete = () =>
    onDelete &&
    window.confirm("Удалить запись навсегда?") &&
    onDelete(appointment.id);

  // Card styles for Default View
  const cardCls = isDark
    ? `bg-white/[0.06] border border-white/[0.1] backdrop-blur-xl hover:bg-white/[0.09] hover:border-white/[0.15] shadow-[0_4px_24px_rgba(0,0,0,0.2)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)] ${st.glowDark}`
    : "bg-white border border-gray-200/70 hover:border-gray-300/80 shadow-sm hover:shadow-md";

  const avatarGrad = `linear-gradient(135deg, ${st.gradFrom}, ${st.gradTo})`;

  // ---------------------------------------------------------
  // CONFIRM WINDOW VARIANT (REDESIGNED FOR ADAPTIVITY)
  // ---------------------------------------------------------
  if (isConfirmWindow) {
    const confirmCardCls = isDark
      ? "bg-slate-900/60 border border-white/10 backdrop-blur-md shadow-xl hover:border-white/20 transition-colors duration-300"
      : "bg-white border border-slate-100 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-slate-200/60 transition-all duration-300";

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className={`relative overflow-hidden rounded-3xl ${confirmCardCls}`}
      >
        {/* Top Gradient Line */}
        <div
          className="absolute inset-x-0 top-0 h-1"
          style={{
            background: `linear-gradient(90deg, ${st.gradFrom}, ${st.gradTo})`,
          }}
        />

        <div className="p-5 sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            
            {/* Left Column: Avatar & Main Info */}
            <div className="flex min-w-0 items-start gap-4 flex-1">
              {/* Avatar with Status Dot */}
              <div className="relative flex-shrink-0 group">
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-2xl text-lg font-bold text-white shadow-md ring-2 ring-white/10"
                  style={{ background: avatarGrad }}
                >
                  {getInitials(appointment.clientName)}
                </div>
                <div
                  className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border-2 bg-white dark:bg-slate-900"
                  style={{ borderColor: isDark ? "#0f172a" : "#ffffff" }}
                >
                  <div
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: st.dot }}
                  />
                </div>
              </div>

              {/* Text Content */}
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3
                    className={`text-lg font-bold leading-tight truncate max-w-[200px] sm:max-w-none ${
                      isDark ? "text-white" : "text-slate-900"
                    }`}
                  >
                    {appointment.clientName}
                  </h3>
                  
                  {/* Status Badge */}
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                      isDark
                        ? `${st.chipDark} ${st.textDark}`
                        : `${st.chipLight} ${st.textLight}`
                    }`}
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full animate-pulse"
                      style={{ backgroundColor: st.dot }}
                    />
                    {isNew ? "Ожидает" : st.label}
                  </span>
                </div>

                {/* Service Name */}
                <p
                  className={`text-sm font-medium truncate ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  {appointment.service}
                </p>

                {/* Meta Data Grid */}
                <div className="flex flex-wrap gap-3 pt-1">
                   <InfoPill
                    isDark={isDark}
                    icon={<CalendarDays size={14} className={isDark ? "text-sky-400" : "text-sky-600"} />}
                    label={fmtDT(appointment.rawDateTime)}
                    className={isDark ? "bg-sky-500/10 border-sky-500/20 text-sky-200" : "bg-sky-50 border-sky-100 text-sky-700"}
                  />
                  <InfoPill
                    isDark={isDark}
                    icon={<Timer size={14} className={isDark ? "text-violet-400" : "text-violet-600"} />}
                    label={`${appointment.duration} мин`}
                    className={isDark ? "bg-violet-500/10 border-violet-500/20 text-violet-200" : "bg-violet-50 border-violet-100 text-violet-700"}
                  />
                </div>

                {appointment.comment && (
                  <div
                    className={`mt-3 rounded-2xl border px-3 py-3 ${
                      isDark
                        ? "border-white/10 bg-white/[0.04]"
                        : "border-slate-100 bg-slate-50/80"
                    }`}
                  >
                    <div
                      className={`mb-1.5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] ${
                        isDark ? "text-slate-400" : "text-slate-500"
                      }`}
                    >
                      <MessageSquareText size={12} />
                      Комментарий
                    </div>
                    <p
                      className={`text-sm leading-6 ${
                        isDark ? "text-slate-200" : "text-slate-700"
                      }`}
                    >
                      {appointment.comment}
                    </p>
                  </div>
                )}
                
                {/* Secondary Info (Master & Phone) */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-xs font-medium">
                   <div className={`flex items-center gap-1.5 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                     <User2 size={12} />
                     <span>{appointment.master}</span>
                   </div>
                   {appointment.clientPhone && (
                     <div className={`flex items-center gap-1.5 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                       <Phone size={12} />
                       <span>{formatPhoneNumber(appointment.clientPhone)}</span>
                     </div>
                   )}
                </div>
              </div>
            </div>

            {/* Right Column: Price Block */}
            <div
              className={`flex flex-col items-end justify-between sm:min-w-[100px] ${
                 isDark ? "text-white" : "text-slate-900"
              }`}
            >
               <div className="text-right w-full sm:text-right sm:mt-0 mt-2">
                 <div className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${isDark ? "text-emerald-400/80" : "text-emerald-600"}`}>
                   Стоимость
                 </div>
                 <div className="text-2xl font-black tracking-tight leading-none">
                   {appointment.price}
                 </div>
               </div>
            </div>
          </div>

          {/* Action Area / Footer */}
          <div
            className={`mt-6 flex flex-col-reverse sm:flex-row items-center justify-between gap-4 border-t pt-4 ${
              isDark ? "border-white/10" : "border-slate-100"
            }`}
          >
             <div className={`text-xs text-center sm:text-left w-full sm:w-auto ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                {isNew 
                  ? "Проверьте детали и подтвердите запись." 
                  : "Запись подтверждена и готова к работе."}
             </div>

            {isNew && (onConfirmAction || onRejectAction) && (
              <div className="flex w-full sm:w-auto gap-3">
                {onRejectAction && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => onRejectAction(appointment.id)}
                    className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                      isDark
                        ? "bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 border border-rose-500/20"
                        : "bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-100"
                    }`}
                  >
                    <X size={16} />
                    <span className="hidden xs:inline">Отклонить</span>
                  </motion.button>
                )}
                {onConfirmAction && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => onConfirmAction(appointment.id)}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all"
                  >
                    <CheckCheck size={16} />
                    Подтвердить
                  </motion.button>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  // ---------------------------------------------------------
  // DEFAULT VIEW (Original logic preserved but cleaned up)
  // ---------------------------------------------------------
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`relative rounded-2xl transition-all duration-300 ${cardCls}`}
    >
      {/* Subtle top gradient line */}
      <div
        className="absolute top-0 left-0 right-0 h-[1.5px] opacity-60"
        style={{
          background: `linear-gradient(90deg, transparent, ${st.gradFrom}60, transparent)`,
        }}
      />
      
      {/* NEW badge pulse */}
      {isNew && (
        <div className="absolute top-4 right-4">
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${
              isDark
                ? "bg-amber-500/15 text-amber-300 border border-amber-400/20"
                : "bg-amber-50 text-amber-700 border border-amber-200"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            Ожидает
          </span>
        </div>
      )}

      <div className="p-5">
        {/* ── TOP ROW ── */}
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-lg font-black shadow-lg"
              style={{ background: avatarGrad }}
            >
              {getInitials(appointment.clientName)}
            </div>
            {/* Online dot */}
            <div
              className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center"
              style={{
                background: st.dot,
                borderColor: isDark ? "rgba(15,23,42,1)" : "white",
              }}
            />
          </div>

          {/* Client info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <h3
                className={`text-xl font-bold leading-tight ${
                  isDark ? "text-white/95" : "text-gray-900"
                }`}
              >
                {appointment.clientName}
              </h3>
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${
                  isDark
                    ? `${st.chipDark} ${st.textDark}`
                    : `${st.chipLight} ${st.textLight}`
                }`}
              >
                {st.label}
              </span>
            </div>

            {/* Time & duration */}
            <div className="flex flex-wrap items-center gap-4 mb-3">
              <div
                className={`flex items-center gap-1.5 text-sm font-medium ${
                  isDark ? "text-white/70" : "text-gray-600"
                } `}
              >
                <CalendarDays
                  size={14}
                  className={isDark ? "text-purple-400" : "text-blue-500"}
                />
                {fmtDT(appointment.rawDateTime)}
              </div>
              <div
                className={`flex items-center gap-1.5 text-sm ${
                  isDark ? "text-white/40" : "text-gray-400"
                }`}
              >
                <Timer size={13} />
                {appointment.duration} мин
              </div>
              {appointment.clientPhone && (
                <div
                  className={`flex items-center gap-1.5 text-sm ${
                    isDark ? "text-white/40" : "text-gray-400"
                  }`}
                >
                  <Phone size={13} />
                  {formatPhoneNumber(appointment.clientPhone)}
                </div>
              )}
            </div>
          </div>

          {/* Price */}
          <div className="flex-shrink-0 text-right ml-2">
            <div
              className={`text-2xl font-black leading-none ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              {appointment.price}
            </div>
            <div
              className={`text-xs mt-1 ${
                isDark ? "text-white/40" : "text-gray-400"
              }`}
            >
              стоимость
            </div>
          </div>
        </div>

        {/* ── INFO PILLS ROW ── */}
        <div className="flex flex-wrap gap-2 mt-4">
          <InfoPill
            isDark={isDark}
            icon={
              <Scissors
                size={13}
                className={isDark ? "text-purple-400" : "text-blue-500"}
              />
            }
            label={appointment.service}
            className={
              isDark
                ? "bg-purple-500/10 border-purple-400/15 text-white/75"
                : "bg-blue-50/80 border-blue-100 text-blue-800"
            }
          />
          <InfoPill
            isDark={isDark}
            icon={
              <User2
                size={13}
                className={isDark ? "text-indigo-400" : "text-purple-500"}
              />
            }
            label={appointment.master}
            className={
              isDark
                ? "bg-indigo-500/10 border-indigo-400/15 text-white/75"
                : "bg-purple-50/80 border-purple-100 text-purple-800"
            }
          />
          {appointment.comment && (
            <InfoPill
              isDark={isDark}
              icon={
                <MessageSquareText
                  size={13}
                  className={isDark ? "text-amber-300" : "text-amber-600"}
                />
              }
              label="Есть комментарий"
              className={
                isDark
                  ? "bg-amber-500/10 border-amber-400/15 text-white/75"
                  : "bg-amber-50/80 border-amber-100 text-amber-800"
              }
            />
          )}
        </div>

        {appointment.comment && (
          <div
            className={`mt-4 rounded-2xl border px-4 py-3 ${
              isDark
                ? "border-white/[0.08] bg-white/[0.04]"
                : "border-gray-100 bg-gray-50/80"
            }`}
          >
            <div
              className={`mb-1.5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] ${
                isDark ? "text-white/35" : "text-gray-400"
              }`}
            >
              <MessageSquareText size={12} />
              Комментарий клиента
            </div>
            <p
              className={`text-sm leading-6 ${
                isDark ? "text-white/75" : "text-gray-700"
              }`}
            >
              {appointment.comment}
            </p>
          </div>
        )}

        {/* ── FOOTER ── */}
        <div
          className={`flex items-center justify-between mt-4 pt-4 border-t ${
            isDark ? "border-white/[0.07]" : "border-gray-100"
          }`}
        >
          <div
            className={`flex items-center gap-4 text-xs ${
              isDark ? "text-white/30" : "text-gray-400"
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Zap size={12} className="opacity-60" />
              ID: {appointment.id}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock4 size={12} />
              {appointment.time}
            </span>
          </div>

          {/* Action buttons */}
          {!hideActions && (
            <div className="flex items-center gap-2">
              {isActive && (
                <>
                  <ActionBtn
                    onClick={handleComplete}
                    title="Завершить"
                    className={
                      isDark
                        ? "bg-emerald-500/10 border-emerald-400/15 text-emerald-400 hover:bg-emerald-500/20"
                        : "bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100"
                    }
                  >
                    <CheckCheck size={15} />
                  </ActionBtn>
                  <ActionBtn
                    onClick={handleCancel}
                    title="Отменить"
                    className={
                      isDark
                        ? "bg-rose-500/10 border-rose-400/15 text-rose-400 hover:bg-rose-500/20"
                        : "bg-rose-50 border-rose-200 text-rose-500 hover:bg-rose-100"
                    }
                  >
                    <Ban size={15} />
                  </ActionBtn>
                </>
              )}

              {onEdit && (
                <ActionBtn
                  onClick={() => onEdit(appointment)}
                  title="Редактировать"
                  className={
                    isDark
                      ? "bg-white/[0.07] border-white/10 text-white/60 hover:bg-white/[0.12] hover:text-white/80"
                      : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100"
                  }
                >
                  <Edit size={15} />
                </ActionBtn>
              )}

              {/* Context menu */}
              <div className="relative">
                <ActionBtn
                  onClick={handleDelete}
                  title="Удалить"
                  className={
                    isDark
                      ? "bg-rose-500/10 border-rose-400/15 text-rose-400 hover:bg-rose-500/20"
                      : "bg-rose-50 border-rose-200 text-rose-500 hover:bg-rose-100"
                  }
                >
                  <Trash2 color="red" size={15} />
                </ActionBtn>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function InfoPill({
  icon,
  label,
  className,
  isDark,
}: {
  icon: React.ReactNode;
  label: string;
  className: string;
  isDark: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border ${className}`}
    >
      {icon}
      {label}
    </span>
  );
}

function ActionBtn({
  children,
  onClick,
  title,
  className,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
  className: string;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.93 }}
      onClick={onClick}
      title={title}
      className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all duration-150 ${className}`}
    >
      {children}
    </motion.button>
  );
}
