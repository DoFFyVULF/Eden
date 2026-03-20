"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock4,
  CheckCheck,
  Ban,
  Edit,
  Trash2,
  MoreVertical,
  Phone,
  Scissors,
  User2,
  CalendarDays,
  Zap,
  MapPin,
  Timer,
  Eye,
} from "lucide-react";

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
}

interface AppointmentItemProps {
  appointment: Appointment;
  onEdit?: (a: Appointment) => void;
  onDelete?: (id: string) => void;
  onComplete?: (id: string) => void;
  onCancel?: (id: string) => void;
  hideActions?: boolean;
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

const fmtTime = (s: string) => {
  const d = new Date(s);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
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
}: AppointmentItemProps) {
  const [isDark, setIsDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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

  // Card styles
  const cardCls = isDark
    ? `bg-white/[0.06] border border-white/[0.1] backdrop-blur-xl hover:bg-white/[0.09] hover:border-white/[0.15] shadow-[0_4px_24px_rgba(0,0,0,0.2)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)] ${st.glowDark}`
    : "bg-white border border-gray-200/70 hover:border-gray-300/80 shadow-sm hover:shadow-md";

  const avatarGrad = `linear-gradient(135deg, ${st.gradFrom}, ${st.gradTo})`;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`relative rounded-2xl transition-all duration-300  ${cardCls}`}
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
                className={`text-xl font-bold leading-tight ${isDark ? "text-white/95" : "text-gray-900"}`}
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
                className={`flex items-center gap-1.5 text-sm font-medium ${isDark ? "text-white/70" : "text-gray-600"}`}
              >
                <CalendarDays
                  size={14}
                  className={isDark ? "text-purple-400" : "text-blue-500"}
                />
                {fmtDT(appointment.rawDateTime)}
              </div>
              <div
                className={`flex items-center gap-1.5 text-sm ${isDark ? "text-white/40" : "text-gray-400"}`}
              >
                <Timer size={13} />
                {appointment.duration} мин
              </div>
              {appointment.clientPhone && (
                <div
                  className={`flex items-center gap-1.5 text-sm ${isDark ? "text-white/40" : "text-gray-400"}`}
                >
                  <Phone size={13} />
                  {appointment.clientPhone}
                </div>
              )}
            </div>
          </div>

          {/* Price */}
          <div className="flex-shrink-0 text-right ml-2">
            <div
              className={`text-2xl font-black leading-none ${isDark ? "text-white" : "text-gray-900"}`}
            >
              {appointment.price}
            </div>
            <div
              className={`text-xs mt-1 ${isDark ? "text-white/40" : "text-gray-400"}`}
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
          <InfoPill
            isDark={isDark}
            icon={
              <MapPin
                size={13}
                className={isDark ? "text-cyan-400" : "text-cyan-600"}
              />
            }
            label="Основной зал"
            className={
              isDark
                ? "bg-cyan-500/10 border-cyan-400/15 text-white/75"
                : "bg-cyan-50/80 border-cyan-100 text-cyan-800"
            }
          />
        </div>

        {/* ── FOOTER ── */}
        <div
          className={`flex items-center justify-between mt-4 pt-4 border-t ${isDark ? "border-white/[0.07]" : "border-gray-100"}`}
        >
          <div
            className={`flex items-center gap-4 text-xs ${isDark ? "text-white/30" : "text-gray-400"}`}
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
