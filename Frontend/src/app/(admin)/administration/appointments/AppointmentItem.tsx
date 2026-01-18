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
  rawDateTime: string; // ← добавлено!
}

interface AppointmentItemProps {
  appointment: Appointment;
  onEdit?: (appointment: Appointment) => void;
  onDelete?: (id: string) => void;
  hideActions?: boolean;
}

const formatDateTime = (rawDateTime: string) => {
  const d = new Date(rawDateTime);
  if (isNaN(d.getTime())) {
    return "Дата не определена";
  }
  return d.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function AppointmentItem({
  appointment,
  onEdit,
  onDelete,
  hideActions,
}: AppointmentItemProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md transition">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-semibold text-black text-lg">
              {appointment.clientName}
            </h3>
            <span
              className={`px-2 py-0.5 text-xs rounded-full ${
                appointment.status === "Новая"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {appointment.status}
            </span>
          </div>

          <div className="text-sm text-gray-600 space-y-1">
            <div>
              <span className="font-medium">Дата:</span>{" "}
              {formatDateTime(appointment.rawDateTime)}
            </div>
            <div>
              <span className="font-medium">Услуга:</span> {appointment.service}
            </div>
            <div>
              <span className="font-medium">Мастер:</span> {appointment.master}
            </div>
            <div>
              <span className="font-medium">Стоимость:</span>{" "}
              {appointment.price}
            </div>
          </div>
        </div>

        {!hideActions && (
          <div className="flex gap-2">
            <button
              onClick={() => onEdit?.(appointment)}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
              title="Редактировать"
            >
              ✏️
            </button>
            <button
              onClick={() => onDelete?.(appointment.id)}
              className="p-2 rounded-lg hover:bg-red-100 text-red-600"
              title="Удалить"
            >
              🗑
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
