"use client";
import { useEffect } from "react";
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
}

interface AppointmentConfirmWindowProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  pendingAppointments?: Appointment[];
  onConfirm?: (appointmentId: string) => void;
  onCancel?: (appointmentId: string) => void;
  windowType: "new" | "confirmed"; // Новый пропс для определения типа окна
}

export default function AppointmentConfirmWindow({
  title,
  isOpen,
  onClose,
  pendingAppointments = [],
  onConfirm,
  onCancel,
  windowType = "new", // По умолчанию для новых записей
}: AppointmentConfirmWindowProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleConfirmAll = () => {
    if (!onConfirm || !pendingAppointments.length) return;
    
    if (window.confirm(`Подтвердить все ${pendingAppointments.length} записей?`)) {
      pendingAppointments.forEach(appointment => {
        onConfirm(appointment.id);
      });
    }
  };

  if (!isOpen) return null;

  const isNewAppointments = windowType === "new";
  const hasAppointments = pendingAppointments.length > 0;

  return (
    <div
      className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl transform transition-all max-h-[90vh] overflow-hidden border border-gray-200">
        {/* Заголовок */}
        <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-800">{title}</h2>
              <p className="text-sm text-gray-500 mt-1">
                {isNewAppointments 
                  ? "Записи, ожидающие подтверждения" 
                  : "Подтвержденные записи на сегодня"}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                isNewAppointments 
                  ? "bg-yellow-100 text-yellow-700" 
                  : "bg-green-100 text-green-700"
              }`}>
                {pendingAppointments.length} {pendingAppointments.length === 1 ? 'запись' : 'записей'}
              </span>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
                title="Закрыть"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Список записей */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="space-y-4">
            {hasAppointments ? (
              pendingAppointments.map((appointment) => (
                <div key={appointment.id} className="relative group">
                  <AppointmentItem 
                    appointment={appointment} 
                    hideActions={true}
                  />
                  {/* Кнопки действий поверх карточки */}
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {isNewAppointments && onConfirm && (
                      <button
                        onClick={() => onConfirm(appointment.id)}
                        className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl text-sm font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
                        title="Подтвердить запись"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Принять
                      </button>
                    )}
                    {onCancel && (
                      <button
                        onClick={() => onCancel(appointment.id)}
                        className="px-4 py-2 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl text-sm font-medium hover:from-red-600 hover:to-rose-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
                        title="Отменить запись"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Отменить
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <p className="text-gray-500 text-lg font-medium">
                  {isNewAppointments 
                    ? "Нет новых записей для подтверждения" 
                    : "Нет подтвержденных записей на сегодня"}
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  {isNewAppointments 
                    ? "Все записи уже подтверждены или отменены" 
                    : "Все записи на сегодня уже обработаны"}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Футер */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              {isNewAppointments 
                ? "Нажмите на кнопку 'Принять' для подтверждения записи" 
                : "Просмотр подтвержденных записей на сегодня"}
            </p>
            <div className="flex gap-3">
              {isNewAppointments && hasAppointments && (
                <button
                  onClick={handleConfirmAll}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Принять все
                </button>
              )}
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors text-sm font-medium"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}