"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCheck, CalendarDays, Clock, ShieldCheck, AlertCircle } from "lucide-react";
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
    const check = () => setIsDark(document.documentElement.classList.contains("dark"));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
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

  const handleConfirmAll = () => {
    if (!onConfirm || !pendingAppointments.length) return;
    if (window.confirm(`Подтвердить все записи (${pendingAppointments.length} шт.)?`)) {
      pendingAppointments.forEach((a) => onConfirm(a.id));
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
          style={{ background: isDark ? "rgba(0,0,0,0.75)" : "rgba(15,23,42,0.4)", backdropFilter: "blur(8px)" }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            className={`w-full max-w-2xl max-h-[90vh] flex flex-col rounded-[2.5rem] overflow-hidden shadow-2xl border ${
              isDark ? "bg-slate-900 border-white/10" : "bg-white border-gray-200"
            }`}
          >
            {/* Header */}
            <div className={`px-8 py-6 flex items-center justify-between border-b ${isDark ? "border-white/5 bg-white/[0.02]" : "border-gray-100 bg-gray-50/50"}`}>
              <div className="flex items-center gap-5">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${
                  isNew 
                    ? "bg-amber-500 text-white" 
                    : "bg-emerald-500 text-white"
                }`}>
                  {isNew ? <Clock size={24} /> : <ShieldCheck size={24} />}
                </div>
                <div>
                  <h2 className={`text-xl font-black tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}>{title}</h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`w-2 h-2 rounded-full animate-pulse ${isNew ? "bg-amber-400" : "bg-emerald-400"}`} />
                    <p className={`text-xs font-bold uppercase tracking-widest opacity-50 ${isDark ? "text-white" : "text-gray-500"}`}>
                      {isNew ? "Требуют внимания" : "Актуально на сегодня"}
                    </p>
                  </div>
                </div>
              </div>
              <button 
                onClick={onClose}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  isDark ? "hover:bg-white/10 text-white/40" : "hover:bg-gray-100 text-gray-400"
                }`}
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className={`flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar ${isDark ? "bg-black/20" : "bg-gray-50/30"}`}>
              {hasItems ? (
                pendingAppointments.map((a) => (
                  <div key={a.id} className="group relative">
                    <AppointmentItem 
                      appointment={a} 
                      hideActions={true} // Прячем дефолтные кнопки
                    />
                    
                    {/* Overlay Actions for "New" mode */}
                    {isNew && (
                      <div className="flex gap-2 mt-3 justify-end px-2">
                        {onCancel && (
                          <button
                            onClick={() => onCancel(a.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                              isDark 
                                ? "border-rose-500/30 text-rose-400 hover:bg-rose-500/10" 
                                : "border-rose-200 text-rose-500 hover:bg-rose-50"
                            }`}
                          >
                            <X size={14} /> Отклонить
                          </button>
                        )}
                        {onConfirm && (
                          <button
                            onClick={() => onConfirm(a.id)}
                            className="flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-all"
                          >
                            <CheckCheck size={14} /> Подтвердить
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="py-20 flex flex-col items-center text-center">
                  <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-6 ${isDark ? "bg-white/5" : "bg-gray-100"}`}>
                    <AlertCircle size={40} className="opacity-20" />
                  </div>
                  <h3 className={`text-lg font-bold ${isDark ? "text-white/40" : "text-gray-400"}`}>Список пуст</h3>
                  <p className={`text-sm max-w-[240px] mx-auto mt-2 opacity-50 ${isDark ? "text-white" : "text-gray-500"}`}>
                    {isNew ? "Новых уведомлений о записях пока не поступало" : "На выбранную дату нет подтвержденных визитов"}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className={`px-8 py-5 flex items-center justify-between border-t ${isDark ? "border-white/5 bg-white/[0.02]" : "border-gray-100 bg-white"}`}>
              <div className={`text-xs font-medium ${isDark ? "text-white/30" : "text-gray-400"}`}>
                Всего объектов: <span className={isDark ? "text-white/60" : "text-gray-900"}>{pendingAppointments.length}</span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className={`px-6 py-2.5 rounded-2xl text-sm font-bold transition-all ${
                    isDark ? "bg-white/5 text-white/70 hover:bg-white/10" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Закрыть
                </button>
                {isNew && hasItems && onConfirm && (
                  <button
                    onClick={handleConfirmAll}
                    className="px-6 py-2.5 rounded-2xl text-sm font-black bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-xl shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
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