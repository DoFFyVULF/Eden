"use client";

import { useState, useEffect } from "react";
import { formatPhoneNumber } from "@/app/lib/formatPhoneNumber";
import { motion, AnimatePresence } from "framer-motion";
import { AppointmentStatus } from "@/types/appointment.types";
import {
  Clock4,
  UserCheck,
  Phone,
  CalendarDays,
  Tag,
  X,
  Star,
} from "lucide-react";

interface AppointmentCardProps {
  appointment: {
    clientSurname: string;
    clientName: string;
    clientPhone: string;
    service: string;
    appointmentTime: string;
    price: string;
    status: AppointmentStatus;
  };
  index: number;
  isDark: boolean;
  formatTime: (isoString: string) => string;
  formatDate: (isoString: string) => string;
}

const getStatusConfig = (status: AppointmentStatus) => {
  const configs: Record<AppointmentStatus, { label: string; dot: string; borderGlow: string; gradient: string }> = {
    [AppointmentStatus.Подтвержден]: {
      label: "Подтверждено",
      dot: "bg-emerald-500",
      borderGlow: "group-hover:border-emerald-400/30 group-hover:shadow-[0_0_18px_rgba(52,211,153,0.15)]",
      gradient: "from-emerald-500 to-teal-600",
    },
    [AppointmentStatus.Новый]: {
      label: "Новый",
      dot: "bg-blue-500",
      borderGlow: "group-hover:border-blue-400/30 group-hover:shadow-[0_0_18px_rgba(96,165,250,0.15)]",
      gradient: "from-blue-500 to-indigo-600",
    },
    [AppointmentStatus.Завершен]: {
      label: "Завершено",
      dot: "bg-gray-400",
      borderGlow: "group-hover:border-gray-400/20 group-hover:shadow-[0_0_18px_rgba(156,163,175,0.1)]",
      gradient: "from-gray-400 to-gray-500",
    },
    [AppointmentStatus.Отменен]: {
      label: "Отменено",
      dot: "bg-red-400",
      borderGlow: "group-hover:border-red-400/20 group-hover:shadow-[0_0_18px_rgba(248,113,113,0.1)]",
      gradient: "from-red-400 to-rose-500",
    },
  };
  return configs[status] || configs[AppointmentStatus.Подтвержден];
};

export default function AppointmentCard({
  appointment,
  index,
  isDark,
  formatTime,
  formatDate,
}: AppointmentCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isModalOpen]);

  const statusConfig = getStatusConfig(appointment.status);

  const formatAppointmentDate = () => {
    const date = new Date(appointment.appointmentTime);
    const options: Intl.DateTimeFormatOptions = { day: "numeric", month: "long" };
    const dayMonth = date.toLocaleDateString("ru-RU", options);
    const weekDay = date.toLocaleDateString("ru-RU", { weekday: "short" });
    return `${dayMonth}, ${weekDay}`;
  };

  const fullDate = () => {
    const date = new Date(appointment.appointmentTime);
    return date.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
      weekday: "long",
    });
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          duration: 0.4,
          delay: Math.min(index * 0.04, 0.3),
          ease: [0.25, 0.46, 0.45, 0.94],
        }}
        whileHover={{ y: -2 }}
        className="group relative"
      >
        <div className={`relative rounded-2xl p-5 border transition-all duration-300 ${statusConfig.borderGlow} ${
          isDark
            ? "bg-white/[0.07] backdrop-blur-2xl border-white/[0.1] shadow-lg"
            : "bg-white border-gray-200/70 shadow-sm"
        }`}>
          {/* Top Row: Status & Time */}
          <div className="flex items-start justify-between mb-4">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${
              isDark
                ? "bg-white/[0.04] border-white/[0.08]"
                : "bg-gray-50 border-gray-100"
            }`}>
              <div className={`w-2 h-2 rounded-full ${statusConfig.dot}`} />
              <span className={`text-[10px] font-bold uppercase tracking-widest ${
                isDark ? "text-white/60" : "text-gray-500"
              }`}>
                {statusConfig.label}
              </span>
            </div>

            <div className="text-right">
              <div className={`flex items-center justify-end gap-1.5 text-2xl font-black tracking-tighter leading-none ${
                isDark ? "text-white" : "text-gray-900"
              }`}>
                <Clock4 size={16} className={isDark ? "text-white/30" : "text-gray-300"} />
                {formatTime(appointment.appointmentTime)}
              </div>
              <div className={`text-[10px] font-semibold uppercase tracking-wider mt-1 ${
                isDark ? "text-white/30" : "text-gray-400"
              }`}>
                {formatAppointmentDate()}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className={`h-px mb-4 ${isDark ? "bg-white/[0.06]" : "bg-gray-100"}`} />

          {/* Client */}
          <div className="flex items-center gap-3 mb-4">
            <div className={`inline-flex p-2 rounded-xl bg-gradient-to-br ${statusConfig.gradient} shadow-lg`}>
              <UserCheck size={16} className="text-white" />
            </div>
            <div className="min-w-0">
              <label className={`text-[9px] font-bold uppercase tracking-widest block mb-0.5 ${
                isDark ? "text-white/35" : "text-gray-400"
              }`}>
                Клиент
              </label>
              <div className={`text-base font-semibold tracking-tight truncate ${
                isDark ? "text-white" : "text-gray-800"
              }`}>
                {appointment.clientSurname} {appointment.clientName}
              </div>
            </div>
          </div>

          {/* Service */}
          <div className="mb-4">
            <label className={`text-[9px] font-bold uppercase tracking-widest block mb-1 ${
              isDark ? "text-white/35" : "text-gray-400"
            }`}>
              Услуга
            </label>
            <div className={`text-sm font-medium tracking-tight leading-snug ${
              isDark ? "text-white/70" : "text-gray-600"
            }`}>
              {appointment.service}
            </div>
          </div>

          {/* Bottom Row: Price & Action */}
          <div className={`pt-4 border-t flex items-center justify-between ${
            isDark ? "border-white/[0.06]" : "border-gray-100"
          }`}>
            <div className="flex flex-col">
              <span className={`text-[9px] font-bold uppercase tracking-widest mb-0.5 ${
                isDark ? "text-white/35" : "text-gray-400"
              }`}>
                Итог
              </span>
              <span className={`text-xl font-black tracking-tight ${
                isDark
                  ? `bg-gradient-to-r ${statusConfig.gradient} bg-clip-text text-transparent`
                  : "text-gray-900"
              }`}>
                {appointment.price}
              </span>
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setIsModalOpen(true)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all duration-200 ${
                isDark
                  ? "bg-white/[0.07] border-white/[0.1] text-white/70 hover:bg-white/[0.12] hover:text-white"
                  : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 shadow-sm"
              }`}
            >
              Подробнее
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* ── MODAL ───────────────────────────────── */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setIsModalOpen(false)}
          >
            {/* Backdrop */}
            <div className={`absolute inset-0 ${isDark ? "bg-black/60 backdrop-blur-sm" : "bg-black/40 backdrop-blur-sm"}`} />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
              onClick={(e) => e.stopPropagation()}
              className={`relative w-full max-w-md rounded-2xl border overflow-hidden ${
                isDark
                  ? "bg-gray-900/95 backdrop-blur-2xl border-white/[0.1] shadow-2xl"
                  : "bg-white border-gray-200 shadow-2xl"
              }`}
            >
              {/* Header glow */}
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${statusConfig.gradient}`} />

              {/* Close button */}
              <button
                onClick={() => setIsModalOpen(false)}
                className={`absolute top-4 right-4 p-2 rounded-xl transition-colors ${
                  isDark
                    ? "text-white/40 hover:text-white hover:bg-white/[0.08]"
                    : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                }`}
              >
                <X size={18} />
              </button>

              <div className="p-6 pt-8">
                {/* Status badge */}
                <div className="flex items-center justify-between mb-6">
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${
                    isDark
                      ? "bg-white/[0.04] border-white/[0.08]"
                      : "bg-gray-50 border-gray-100"
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${statusConfig.dot}`} />
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${
                      isDark ? "text-white/60" : "text-gray-500"
                    }`}>
                      {statusConfig.label}
                    </span>
                  </div>
                
                </div>

                {/* Client section */}
                <div className={`mb-6 p-4 rounded-xl ${
                  isDark ? "bg-white/[0.04]" : "bg-gray-50"
                }`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`inline-flex p-2 rounded-xl bg-gradient-to-br ${statusConfig.gradient}`}>
                      <UserCheck size={18} className="text-white" />
                    </div>
                    <div>
                      <div className={`text-sm font-semibold ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}>
                        {appointment.clientSurname} {appointment.clientName}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`inline-flex p-2 rounded-xl ${
                      isDark ? "bg-white/[0.06]" : "bg-white"
                    }`}>
                      <Phone size={16} className={isDark ? "text-white/50" : "text-gray-400"} />
                    </div>
                    <a
                      href={`tel:${formatPhoneNumber(appointment.clientPhone)}`}
                      className={`text-sm font-medium transition-colors ${
                        isDark
                          ? "text-blue-400 hover:text-blue-300"
                          : "text-blue-600 hover:text-blue-500"
                      }`}
                    >
                      {formatPhoneNumber(appointment.clientPhone)}
                    </a>
                  </div>
                </div>

                {/* Details grid */}
                <div className="space-y-3 mb-6">
                  <div className={`flex items-center gap-3 p-3 rounded-xl ${
                    isDark ? "bg-white/[0.04]" : "bg-gray-50"
                  }`}>
                    <div className={`inline-flex p-2 rounded-xl ${
                      isDark ? "bg-white/[0.06]" : "bg-white"
                    }`}>
                      <Tag size={16} className={isDark ? "text-white/50" : "text-gray-400"} />
                    </div>
                    <div>
                      <div className={`text-[9px] font-bold uppercase tracking-widest mb-0.5 ${
                        isDark ? "text-white/35" : "text-gray-400"
                      }`}>
                        Услуга
                      </div>
                      <div className={`text-sm font-medium ${
                        isDark ? "text-white/80" : "text-gray-700"
                      }`}>
                        {appointment.service}
                      </div>
                    </div>
                  </div>

                  <div className={`flex items-center gap-3 p-3 rounded-xl ${
                    isDark ? "bg-white/[0.04]" : "bg-gray-50"
                  }`}>
                    <div className={`inline-flex p-2 rounded-xl ${
                      isDark ? "bg-white/[0.06]" : "bg-white"
                    }`}>
                      <CalendarDays size={16} className={isDark ? "text-white/50" : "text-gray-400"} />
                    </div>
                    <div>
                      <div className={`text-[9px] font-bold uppercase tracking-widest mb-0.5 ${
                        isDark ? "text-white/35" : "text-gray-400"
                      }`}>
                        Дата и время
                      </div>
                      <div className={`text-sm font-medium ${
                        isDark ? "text-white/80" : "text-gray-700"
                      }`}>
                        {fullDate()}, {formatTime(appointment.appointmentTime)}
                      </div>
                    </div>
                  </div>

                  <div className={`flex items-center gap-3 p-3 rounded-xl ${
                    isDark ? "bg-white/[0.04]" : "bg-gray-50"
                  }`}>
                    <div className={`inline-flex p-2 rounded-xl ${
                      isDark ? "bg-white/[0.06]" : "bg-white"
                    }`}>
                      <Clock4 size={16} className={isDark ? "text-white/50" : "text-gray-400"} />
                    </div>
                    <div>
                      <div className={`text-[9px] font-bold uppercase tracking-widest mb-0.5 ${
                        isDark ? "text-white/35" : "text-gray-400"
                      }`}>
                        Стоимость
                      </div>
                      <div className={`text-sm font-bold ${
                        isDark
                          ? `bg-gradient-to-r ${statusConfig.gradient} bg-clip-text text-transparent`
                          : "text-gray-900"
                      }`}>
                        {appointment.price}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <button
                  onClick={() => setIsModalOpen(false)}
                  className={`w-full py-3 rounded-xl text-sm font-bold uppercase tracking-wider border transition-all duration-200 ${
                    isDark
                      ? "bg-white/[0.07] border-white/[0.1] text-white/70 hover:bg-white/[0.12] hover:text-white"
                      : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  Закрыть
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}