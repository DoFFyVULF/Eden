"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCheck, CalendarDays, Clock } from "lucide-react";
import AppointmentItem from "./AppointmentItem";

interface Appointment { id: string; clientName: string; service: string; time: string; price: string; master: string; status: string; date: string; duration: number; rawDateTime: string; }
interface Props { title: string; isOpen: boolean; onClose: () => void; pendingAppointments?: Appointment[]; onConfirm?: (id: string) => void; onCancel?: (id: string) => void; windowType: "new" | "confirmed"; }

export default function AppointmentConfirmWindow({ title, isOpen, onClose, pendingAppointments = [], onConfirm, onCancel, windowType = "new" }: Props) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains("dark"));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (isOpen) { document.addEventListener("keydown", onEsc); document.body.style.overflow = "hidden"; }
    return () => { document.removeEventListener("keydown", onEsc); document.body.style.overflow = ""; };
  }, [isOpen, onClose]);

  const handleConfirmAll = () => {
    if (!onConfirm || !pendingAppointments.length) return;
    if (window.confirm(`Подтвердить все ${pendingAppointments.length} записей?`))
      pendingAppointments.forEach(a => onConfirm(a.id));
  };

  const isNew = windowType === "new";
  const has = pendingAppointments.length > 0;

  const modalCls = isDark
    ? "bg-slate-900/80 backdrop-blur-3xl border border-white/[0.12] shadow-[0_32px_80px_rgba(0,0,0,0.7)]"
    : "bg-white/95 backdrop-blur-xl border border-gray-200/70 shadow-2xl";

  const headerCls = isDark
    ? "bg-white/[0.04] border-b border-white/[0.07]"
    : "bg-gray-50/80 border-b border-gray-100";

  const bodyBg = isDark ? "bg-black/20" : "bg-gray-50/60";
  const footerCls = isDark ? "bg-white/[0.03] border-t border-white/[0.07]" : "bg-white border-t border-gray-100";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={e => e.target === e.currentTarget && onClose()}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: isDark ? "rgba(0,0,0,0.7)" : "rgba(15,23,42,0.4)", backdropFilter: "blur(12px)" }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ type: "spring", damping: 30, stiffness: 350 }}
            className={`w-full max-w-3xl max-h-[88vh] flex flex-col rounded-3xl overflow-hidden ${modalCls}`}
          >
            {/* Header */}
            <div className={`px-6 py-5 flex items-center justify-between flex-shrink-0 ${headerCls}`}>
              <div className="flex items-center gap-4">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg ${
                  isNew
                    ? isDark ? "bg-gradient-to-br from-amber-500 to-orange-500 shadow-amber-500/30" : "bg-gradient-to-br from-amber-400 to-orange-500 shadow-amber-500/20"
                    : isDark ? "bg-gradient-to-br from-emerald-500 to-teal-500 shadow-emerald-500/30" : "bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/20"
                }`}>
                  {isNew ? <Clock className="w-5 h-5 text-white" /> : <CalendarDays className="w-5 h-5 text-white" />}
                </div>
                <div>
                  <h2 className={`text-xl font-black ${isDark ? "text-white" : "text-gray-900"}`}>{title}</h2>
                  <p className={`text-sm mt-0.5 ${isDark ? "text-white/40" : "text-gray-400"}`}>
                    {isNew ? "Ожидают подтверждения" : "Подтверждённые на сегодня"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-sm font-bold px-3 py-1 rounded-full border ${
                  isNew
                    ? isDark ? "bg-amber-500/15 border-amber-400/20 text-amber-300" : "bg-amber-50 border-amber-200 text-amber-700"
                    : isDark ? "bg-emerald-500/15 border-emerald-400/20 text-emerald-300" : "bg-emerald-50 border-emerald-200 text-emerald-700"
                }`}>
                  {pendingAppointments.length} {pendingAppointments.length === 1 ? "запись" : "записей"}
                </span>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }}
                  transition={{ duration: 0.2 }} onClick={onClose}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                    isDark ? "text-white/40 hover:bg-white/[0.08] hover:text-white/70" : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  }`}
                >
                  <X size={18} />
                </motion.button>
              </div>
            </div>

            {/* Body */}
            <div className={`flex-1 overflow-y-auto p-4 space-y-3 ${bodyBg}`}>
              {has ? pendingAppointments.map(a => (
                <div key={a.id}>
                  <AppointmentItem appointment={a} hideActions={true} />
                  <div className="flex gap-2 mt-2 justify-end">
                    {isNew && onConfirm && (
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                        onClick={() => onConfirm(a.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white shadow-md transition-all ${
                          isDark
                            ? "bg-gradient-to-r from-emerald-500 to-teal-500 shadow-emerald-500/25 hover:shadow-emerald-500/40"
                            : "bg-gradient-to-r from-emerald-500 to-teal-600 shadow-emerald-500/20 hover:shadow-emerald-500/35"
                        }`}>
                        <CheckCheck size={14} /> Принять
                      </motion.button>
                    )}
                    {onCancel && (
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                        onClick={() => onCancel(a.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                          isDark
                            ? "bg-rose-500/10 border-rose-400/20 text-rose-400 hover:bg-rose-500/15"
                            : "bg-rose-50 border-rose-200 text-rose-500 hover:bg-rose-100"
                        }`}>
                        <X size={14} /> Отменить
                      </motion.button>
                    )}
                  </div>
                </div>
              )) : (
                <div className="py-20 text-center">
                  <div className={`w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center ${isDark ? "bg-white/[0.06]" : "bg-gray-100"}`}>
                    <CalendarDays size={28} className={isDark ? "text-white/20" : "text-gray-300"} />
                  </div>
                  <p className={`text-lg font-bold ${isDark ? "text-white/50" : "text-gray-500"}`}>
                    {isNew ? "Нет новых записей" : "Нет записей на сегодня"}
                  </p>
                  <p className={`text-sm mt-1 ${isDark ? "text-white/25" : "text-gray-400"}`}>
                    {isNew ? "Все записи уже обработаны" : "На сегодня нет подтверждённых записей"}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className={`px-6 py-4 flex items-center justify-between flex-shrink-0 ${footerCls}`}>
              <p className={`text-xs ${isDark ? "text-white/25" : "text-gray-400"}`}>
                {isNew ? "Примите или отклоните каждую запись" : "Просмотр подтверждённых записей"}
              </p>
              <div className="flex gap-2.5">
                {isNew && has && onConfirm && (
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    onClick={handleConfirmAll}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg transition-all ${
                      isDark
                        ? "bg-gradient-to-r from-indigo-500 to-purple-600 shadow-purple-500/25 hover:shadow-purple-500/40"
                        : "bg-gradient-to-r from-blue-500 to-purple-600 shadow-blue-500/20 hover:shadow-blue-500/35"
                    }`}>
                    <CheckCheck size={15} /> Принять все
                  </motion.button>
                )}
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={onClose}
                  className={`px-5 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
                    isDark
                      ? "bg-white/[0.06] border-white/[0.1] text-white/60 hover:bg-white/[0.09]"
                      : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 shadow-sm"
                  }`}>
                  Закрыть
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}