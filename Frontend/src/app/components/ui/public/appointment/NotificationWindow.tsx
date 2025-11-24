import { format } from "date-fns";
import { ru } from "date-fns/locale";

interface NotificationWindowProps {
  serviceTitle: string | null;
  servicePrice: number | null;
  appointmentDate: Date;
  appointmentTime: string;
  appointmentMaster: any;
  onClose: () => void;
}

export default function NotificationWindow({
  serviceTitle,
  servicePrice,
  appointmentDate,
  appointmentTime,
  appointmentMaster,
  onClose,
}: NotificationWindowProps) {
  const formattedDate = format(appointmentDate, "d MMMM yyyy", { locale: ru });

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-10">
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl transform transition-all duration-300 scale-95 animate-fade-in-up">
        <div className="text-center">
          <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-emerald-400 text-2xl">✅</span>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            Запись подтверждена!
          </h3>
          <p className="text-gray-300 text-sm mb-5">
            Вы успешно записаны на услугу "{serviceTitle}", стоимостью{" "}
            {servicePrice}₽ к мастеру "{appointmentMaster}" на {formattedDate} в{" "}
            {appointmentTime}. Ожидайте звонка для подтверждения.
          </p>
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition"
          >
            Понятно
          </button>
        </div>
      </div>
    </div>
  );
}
