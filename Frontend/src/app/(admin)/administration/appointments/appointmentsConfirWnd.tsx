"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCheck, Clock, ShieldCheck, AlertCircle } from "lucide-react";
import AppointmentItem from "./AppointmentItem";

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

interface Props {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  pendingAppointments?: Appointment[];
  onConfirm?: (id: string) => void;
  onCancel?: (id: string) => void;
  windowType: "new" | "confirmed";
}

export default function AppointmentConfirmWindow({
  title,
  isOpen,
  onClose,
  pendingAppointments = [],
  onConfirm,
  onCancel,
  windowType = "new",
}: Props) {
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

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (isOpen) {
      document.addEventListener("keydown", onEsc);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", onEsc);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  const isNew = windowType === "new";
  const hasItems = pendingAppointments.length > 0;
  
  const totalRevenue = pendingAppointments.reduce((sum, appointment) => {
    const numericPrice = Number(
      String(appointment.price).replace(/[^\d.,]/g, "").replace(",", ".")
    );
    return sum + (Number.isFinite(numericPrice) ? numericPrice : 0);
  }, 0);

  const handleConfirmAll = () => {
    if (!onConfirm || !pendingAppointments.length) return;
    if (window.confirm(`Подтвердить все записи (${pendingAppointments.length} шт.)?`)) {
      pendingAppointments.forEach((a) => onConfirm(a.id));
    }
  };

  const handleRejectAll = () => {
    if (!onCancel || !pendingAppointments.length) return;
    if (window.confirm(`Отклонить все записи (${pendingAppointments.length} шт.)?`)) {
      pendingAppointments.forEach((a) => onCancel(a.id));
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
          style={{
            background: isDark ? "rgba(0,0,0,0.75)" : "rgba(15,23,42,0.4)",
            backdropFilter: "blur(8px)",
          }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={`w-full max-w-full sm:max-w-2xl max-h-[90vh] flex flex-col rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden shadow-2xl border ${
              isDark
                ? "bg-slate-900 border-white/10"
                : "bg-white border-gray-200"
            }`}
          >
            {/* Header */}
            <div
              className={`px-5 py-5 sm:px-8 sm:py-6 flex items-start sm:items-center justify-between border-b gap-4 ${
                isDark
                  ? "border-white/5 bg-white/[0.02]"
                  : "border-gray-100 bg-gray-50/50"
              }`}
            >
              <div className="flex items-center gap-4 sm:gap-5">
                <div
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-inner shrink-0 ${
                    isNew
                      ? "bg-amber-500 text-white"
                      : "bg-emerald-500 text-white"
                  }`}
                >
                  {isNew ? <Clock size={20} /> : <ShieldCheck size={24} />}
                </div>
                <div>
                  <h2
                    className={`text-lg sm:text-xl font-black tracking-tight leading-tight ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {title}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`w-2 h-2 rounded-full animate-pulse ${
                        isNew ? "bg-amber-400" : "bg-emerald-400"
                      }`}
                    />
                    <p
                      className={`text-[10px] sm:text-xs font-bold uppercase tracking-widest opacity-60 ${
                        isDark ? "text-white" : "text-gray-500"
                      }`}
                    >
                      {isNew ? "Требуют внимания" : "Актуально на сегодня"}
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all shrink-0 ${
                  isDark
                    ? "hover:bg-white/10 text-white/40"
                    : "hover:bg-gray-100 text-gray-400"
                }`}
              >
                <X size={18} />
              </button>
            </div>

            {/* Stats Bar */}
            {hasItems && (
              <div
                className={`grid gap-3 border-b px-5 sm:px-6 py-4 grid-cols-2 ${
                  isDark
                    ? "border-white/5 bg-white/[0.02]"
                    : "border-gray-100 bg-white/80"
                }`}
              >
                <div
                  className={`rounded-xl sm:rounded-2xl px-3 sm:px-4 py-3 ${
                    isDark ? "bg-white/[0.04]" : "bg-gray-50"
                  }`}
                >
                  <div
                    className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.1em] sm:tracking-[0.18em] ${
                      isDark ? "text-white/35" : "text-gray-400"
                    }`}
                  >
                    Всего записей
                  </div>
                  <div
                    className={`mt-1 text-xl sm:text-2xl font-black ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {pendingAppointments.length}
                  </div>
                </div>
                <div
                  className={`rounded-xl sm:rounded-2xl px-3 sm:px-4 py-3 ${
                    isDark ? "bg-white/[0.04]" : "bg-gray-50"
                  }`}
                >
                  <div
                    className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.1em] sm:tracking-[0.18em] ${
                      isDark ? "text-white/35" : "text-gray-400"
                    }`}
                  >
                    Сумма
                  </div>
                  <div
                    className={`mt-1 text-xl sm:text-2xl font-black ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {totalRevenue.toLocaleString("ru-RU")} ₽
                  </div>
                </div>
              </div>
            )}

            {/* Scrollable Body */}
            <div
              className={`flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 sm:space-y-4 custom-scrollbar ${
                isDark ? "bg-black/20" : "bg-gray-50/30"
              }`}
            >
              {hasItems ? (
                pendingAppointments.map((a) => (
                  <div key={a.id} className="group relative">
                    <AppointmentItem
                      appointment={a}
                      hideActions={true}
                      variant="confirmWindow"
                      onConfirmAction={isNew ? onConfirm : undefined}
                      onRejectAction={isNew ? onCancel : undefined}
                    />
                  </div>
                ))
              ) : (
                <div className="py-20 flex flex-col items-center text-center px-4">
                  <div
                    className={`w-16 h-16 sm:w-20 sm:h-20 rounded-3xl flex items-center justify-center mb-6 ${
                      isDark ? "bg-white/5" : "bg-gray-100"
                    }`}
                  >
                    <AlertCircle size={32} className="opacity-20" />
                  </div>
                  <h3
                    className={`text-lg font-bold ${
                      isDark ? "text-white/40" : "text-gray-400"
                    }`}
                  >
                    Список пуст
                  </h3>
                  <p
                    className={`text-sm max-w-[240px] mx-auto mt-2 opacity-50 ${
                      isDark ? "text-white" : "text-gray-500"
                    }`}
                  >
                    {isNew
                      ? "Новых уведомлений о записях пока не поступало"
                      : "На выбранную дату нет подтвержденных визитов"}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div
              className={`px-5 py-4 sm:px-8 sm:py-5 flex flex-col-reverse sm:flex-row items-center justify-between gap-4 border-t ${
                isDark
                  ? "border-white/5 bg-white/[0.02]"
                  : "border-gray-100 bg-white"
              }`}
            >
              <div
                className={`text-xs font-medium w-full sm:w-auto text-center sm:text-left ${
                  isDark ? "text-white/30" : "text-gray-400"
                }`}
              >
                Всего объектов:{" "}
                <span
                  className={isDark ? "text-white/60" : "text-gray-900"}
                >
                  {pendingAppointments.length}
                </span>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <button
                  onClick={onClose}
                  className={`w-full sm:w-auto px-6 py-3 sm:py-2.5 rounded-xl sm:rounded-2xl text-sm font-bold transition-all ${
                    isDark
                      ? "bg-white/5 text-white/70 hover:bg-white/10"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Закрыть
                </button>
                
                {isNew && hasItems && onCancel && (
                  <button
                    onClick={handleRejectAll}
                    className="w-full sm:w-auto px-6 py-3 sm:py-2.5 rounded-xl sm:rounded-2xl text-sm font-black bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-xl shadow-red-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    Отклонить все
                  </button>
                )}
                
                {isNew && hasItems && onConfirm && (
                  <button
                    onClick={handleConfirmAll}
                    className="w-full sm:w-auto px-6 py-3 sm:py-2.5 rounded-xl sm:rounded-2xl text-sm font-black bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-xl shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    Принять все
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}