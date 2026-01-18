// components/AppointmentConfirmWindow.tsx
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
}

interface AppointmentConfirmWindowProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  pendingAppointments?: Appointment[];
  onConfirm?: (appointmentId: string) => void;
  showAcceptButton?: boolean; // Новый пропс для управления видимостью кнопки "Принять"
}

export default function AppointmentConfirmWindow({
  title,
  isOpen,
  onClose,
  pendingAppointments = [],
  onConfirm,
  showAcceptButton = true, // Значение по умолчанию - true
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

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl transform transition-all max-h-[90vh] overflow-hidden">
        {/* Заголовок */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
            <span className="text-sm text-gray-500">
              {pendingAppointments.length} записей
            </span>
          </div>
        </div>

        {/* Список записей через AppointmentItem */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="space-y-4">
            {pendingAppointments.length > 0 ? (
              pendingAppointments.map((appointment) => (
                <div key={appointment.id} className="relative">
                  <AppointmentItem appointment={appointment} />
                  <div className="absolute top-4 right-4 flex gap-2">
                    {/* Кнопка "Принять" показывается только если showAcceptButton = true */}
                    {showAcceptButton && (
                      <button
                        onClick={() => onConfirm && onConfirm(appointment.id)}
                        className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors"
                      >
                        Принять
                      </button>
                    )}
                    <button className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors">
                      Отменить
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Нет записей</p>
              </div>
            )}
          </div>
        </div>

        {/* Кнопка закрытия */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}
