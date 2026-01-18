"use client";

import { useEffect, useState } from "react";
import { masterService } from "@/services/master/master.service";
import { serviceService } from "@/services/service/service.service";
import { servicePriceService } from "@/services/service-price/service-price.service";
import { appointmentService } from "@/services/appointment/appointment.service";
import { masterScheduleService } from "@/services/schedule/schedule.service";
import { formatPhoneNumber } from "@/app/lib/formatPhoneNumber";

import { IMaster } from "@/types/masters.type";
import { IService } from "@/types/services.types";
import { IServicePrice } from "@/types/service-price.types";
import { ICreateAppointmentDto, AppointmentStatus, IUpdateAppointmentDto } from "@/types/appointment.types";
import type { IMasterSchedule } from "@/types/schedule.types";

interface NewAppointmentsWindowProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  mode?: "create" | "edit";
  initialData?: {
    id: number;
    clientSurname: string;
    clientName: string;
    clientPhone: string;
    masterId: number;
    serviceId: number;
    appointmentTime: string;
  };
}

const getWeekdayIndex = (dateStr: string): number => {
  const date = new Date(dateStr);
  return (date.getDay() + 6) % 7; // 0 = Пн ... 6 = Вс
};

export default function NewAppointmentsWindow({
  isOpen,
  onClose,
  onSuccess,
  mode = "create",
  initialData,
}: NewAppointmentsWindowProps) {
  const [masters, setMasters] = useState<IMaster[]>([]);
  const [services, setServices] = useState<IService[]>([]);
  const [servicePrices, setServicePrices] = useState<IServicePrice[]>([]);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [loadingTimes, setLoadingTimes] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    clientSurname: "",
    clientName: "",
    clientPhone: "",
    service: "",
    time: "",
    master: "",
    date: "",
  });

  // Заполнение формы при редактировании
  useEffect(() => {
    if (mode !== "edit" || !initialData || !isOpen) return;

    try {
      const dateObj = new Date(initialData.appointmentTime);
      if (isNaN(dateObj.getTime())) {
        console.error("Невалидная дата в initialData:", initialData.appointmentTime);
        setError("Ошибка: некорректная дата записи");
        return;
      }

      const dateStr = dateObj.toISOString().split("T")[0];
      const timeStr = dateObj.toTimeString().slice(0, 5);

      setFormData({
        clientSurname: initialData.clientSurname || "",
        clientName: initialData.clientName || "",
        clientPhone: formatPhoneNumber(initialData.clientPhone || ""),
        master: String(initialData.masterId || ""),
        service: String(initialData.serviceId || ""),
        date: dateStr,
        time: timeStr,
      });
    } catch (err) {
      console.error("Ошибка при заполнении формы для редактирования:", err);
      setError("Не удалось загрузить данные для редактирования");
    }
  }, [mode, initialData, isOpen]);

  // Загрузка мастеров и услуг
  useEffect(() => {
    if (!isOpen) return;

    setError(null);
    Promise.all([masterService.getAll(), serviceService.getAll()])
      .then(([mastersData, servicesData]) => {
        setMasters(mastersData);
        setServices(servicesData);
      })
      .catch((err) => {
        console.error("Ошибка загрузки базовых данных:", err);
        setError("Не удалось загрузить мастеров и услуги");
      });
  }, [isOpen]);

  // Загрузка цен по мастеру
  useEffect(() => {
    if (!formData.master) {
      setServicePrices([]);
      return;
    }

    servicePriceService
      .getByMaster(Number(formData.master))
      .then(setServicePrices)
      .catch((err) => {
        console.error("Ошибка загрузки цен:", err);
        setError("Не удалось загрузить услуги мастера");
      });
  }, [formData.master]);

  // Загрузка свободного времени
  useEffect(() => {
    const loadAvailableTimes = async () => {
      if (!formData.master || !formData.date) {
        setAvailableTimes([]);
        return;
      }

      setLoadingTimes(true);
      setError(null);

      try {
        const masterId = Number(formData.master);
        const weekdayIndex = getWeekdayIndex(formData.date);

        const schedules: IMasterSchedule[] = await masterScheduleService.getByMaster(masterId);
        const schedule = schedules.find((s) => s.dayOfWeek === weekdayIndex);

        if (!schedule) {
          setAvailableTimes([]);
          return;
        }

        const appointments = await appointmentService.getByDate(formData.date, masterId);

        const start = new Date(schedule.startTime);
        const end = new Date(schedule.endTime);
        const startMins = start.getHours() * 60 + start.getMinutes();
        const endMins = end.getHours() * 60 + end.getMinutes();

        const slots: string[] = [];
        for (let m = startMins; m + 30 <= endMins; m += 30) {
          const h = Math.floor(m / 60);
          const min = m % 60;
          slots.push(`${h.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`);
        }

        const booked = appointments
          .filter((a) => a.status !== AppointmentStatus.Отменен)
          .map((a) => {
            const d = new Date(a.appointmentTime);
            return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
          });

        setAvailableTimes(slots.filter((t) => !booked.includes(t)));
      } catch (err) {
        console.error("Ошибка загрузки времени:", err);
        setError("Не удалось загрузить доступное время");
        setAvailableTimes([]);
      } finally {
        setLoadingTimes(false);
      }
    };

    loadAvailableTimes();
  }, [formData.master, formData.date]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "clientPhone" ? formatPhoneNumber(value) : value,
      ...(name === "master" ? { service: "", time: "" } : {}),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Валидация
      if (!formData.clientSurname.trim()) throw new Error("Укажите фамилию");
      if (!formData.clientName.trim()) throw new Error("Укажите имя");
      if (formData.clientPhone.replace(/\D/g, "").length < 10)
        throw new Error("Некорректный телефон");
      if (!formData.master) throw new Error("Выберите мастера");
      if (!formData.service) throw new Error("Выберите услугу");
      if (!formData.date) throw new Error("Укажите дату");
      if (!formData.time) throw new Error("Укажите время");

      const priceItem = servicePrices.find((sp) => sp.service?.id === Number(formData.service));
      if (!priceItem) throw new Error("Не найдена цена услуги");

      const appointmentTime = `${formData.date}T${formData.time}:00`;

      if (mode === "edit" && initialData?.id) {
        const updateDto: Partial<IUpdateAppointmentDto> = {
          clientSurname: formData.clientSurname.trim(),
          clientName: formData.clientName.trim(),
          clientPhone: formData.clientPhone.replace(/\D/g, ""),
          masterId: Number(formData.master),
          serviceId: Number(formData.service),
          appointmentTime,
          price: priceItem.price, // ← ЧИСЛО!
        };

        await appointmentService.update(initialData.id, updateDto);
      } else {
        const createDto: ICreateAppointmentDto = {
          clientSurname: formData.clientSurname.trim(),
          clientName: formData.clientName.trim(),
          clientPhone: formData.clientPhone.replace(/\D/g, ""),
          masterId: Number(formData.master),
          serviceId: Number(formData.service),
          appointmentTime,
          price: priceItem.price.toString(),
          status: AppointmentStatus.Новый,
        };

        await appointmentService.create(createDto);
      }

      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message || "Ошибка сохранения записи");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 text-black bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
          <h2 className="text-xl font-bold">
            {mode === "edit" ? "Редактирование записи" : "Новая запись"}
          </h2>
        </div>

        {error && (
          <div className="m-6 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Фамилия */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Фамилия *</label>
            <input
              name="clientSurname"
              value={formData.clientSurname}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Имя */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Имя *</label>
            <input
              name="clientName"
              value={formData.clientName}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Телефон */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Телефон *</label>
            <input
              name="clientPhone"
              value={formData.clientPhone}
              onChange={handleInputChange}
              placeholder="+7 (___) ___-__-__"
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Мастер */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Мастер *</label>
            <select
              name="master"
              value={formData.master}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
              required
            >
              <option value="">Выберите мастера</option>
              {masters.filter(m => m.isActive).map(m => (
                <option key={m.id} value={m.id}>
                  {m.surname} {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* Услуга */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Услуга *</label>
            <select
              name="service"
              value={formData.service}
              onChange={handleInputChange}
              disabled={!formData.master}
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-gray-100"
              required
            >
              <option value="">
                {formData.master ? "Выберите услугу" : "Сначала выберите мастера"}
              </option>
              {servicePrices
                .filter(sp => sp.isActive && sp.service)
                .map(sp => (
                  <option key={sp.id} value={sp.service!.id}>
                    {sp.service!.title} • {sp.price.toLocaleString()} ₽
                  </option>
                ))}
            </select>
          </div>

          {/* Дата */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Дата *</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              min={new Date().toISOString().split("T")[0]}
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Время */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Время *</label>
            <select
              name="time"
              value={formData.time}
              onChange={handleInputChange}
              disabled={loadingTimes || !formData.date}
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              required
            >
              <option value="">
                {loadingTimes
                  ? "Загрузка..."
                  : !formData.date
                  ? "Выберите дату"
                  : availableTimes.length === 0
                  ? "Нет свободных слотов"
                  : "Выберите время"}
              </option>
              {availableTimes.map(t => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-4 flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 rounded-xl font-medium"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isSubmitting || loadingTimes}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium disabled:opacity-60"
            >
              {isSubmitting
                ? "Сохранение..."
                : mode === "edit"
                ? "Сохранить изменения"
                : "Создать запись"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}