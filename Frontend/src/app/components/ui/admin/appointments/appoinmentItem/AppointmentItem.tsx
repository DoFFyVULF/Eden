// AppointmentItem.tsx
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

interface AppointmentItemProps {
  appointment: Appointment;
}

export default function AppointmentItem({ appointment }: AppointmentItemProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-semibold text-lg text-black">Запись #{appointment.id}</h3>
            <span className={`px-2 py-1 text-sm rounded-full ${
              appointment.status === "Новая" 
                ? "bg-blue-100 text-blue-700" 
                : "bg-green-100 text-green-700"
            }`}>
              {appointment.status}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div>Клиент: {appointment.clientName}</div>
            <div>Услуга: {appointment.service}</div>
            <div>Время: {appointment.time}</div>
            <div>Стоимость: {appointment.price}</div>
            <div>Мастер: {appointment.master}</div>
          </div>
        </div>
 
      </div>
    </div>
  );
}