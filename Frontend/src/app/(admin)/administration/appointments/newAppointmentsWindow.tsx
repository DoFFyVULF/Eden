"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { 
  X, 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Scissors, 
  Users, 
  CheckCircle,
  Loader2,
  ChevronDown,
  Sparkles,
  Shield,
  BadgeCheck,
  Zap
} from "lucide-react";
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
  return (date.getDay() + 6) % 7;
};

const slideIn: Variants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: {
      type: "spring",
      damping: 25,
      stiffness: 300
    }
  },
  exit: { opacity: 0, y: 50, scale: 0.95 }
};

const overlayAnimation: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 }
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
  const [selectedServicePrice, setSelectedServicePrice] = useState<IServicePrice | null>(null);

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
      setSelectedServicePrice(null);
      return;
    }

    servicePriceService
      .getByMaster(Number(formData.master))
      .then(prices => {
        setServicePrices(prices);
        const selected = prices.find(sp => sp.service?.id === Number(formData.service));
        setSelectedServicePrice(selected || null);
      })
      .catch((err) => {
        console.error("Ошибка загрузки цен:", err);
        setError("Не удалось загрузить услуги мастера");
      });
  }, [formData.master, formData.service]);

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

    if (name === "service") {
      const selected = servicePrices.find(sp => sp.service?.id === Number(value));
      setSelectedServicePrice(selected || null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
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
          price: priceItem.price,
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
          status: AppointmentStatus.Подтвержден,
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Функция для получения текста placeholder для времени
  const getTimePlaceholder = () => {
    if (loadingTimes) return "Загрузка...";
    if (!formData.date) return "Выберите дату";
    if (availableTimes.length === 0) return "Нет свободных слотов";
    return "Выберите время";
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            variants={overlayAnimation}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            <motion.div
              variants={slideIn}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl bg-gradient-to-br from-white to-gray-50/50 rounded-3xl shadow-2xl border border-gray-200/50 backdrop-blur-xl overflow-hidden"
            >
              {/* Градиентный заголовок */}
              <div className="relative px-8 py-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
                <div className="absolute top-0 right-0 p-4 opacity-20">
                  <Sparkles className="w-16 h-16" />
                </div>
                
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {mode === "edit" ? "✏️ Редактирование записи" : "✨ Новая запись"}
                    </h2>
                    <p className="text-blue-100/80 mt-1 flex items-center gap-2">
                      {mode === "create" ? (
                        <>
                          <BadgeCheck className="w-4 h-4" />
                          Созданные записи сразу подтверждаются
                        </>
                      ) : (
                        <>
                          <Shield className="w-4 h-4" />
                          Редактирование существующей записи
                        </>
                      )}
                    </p>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    className="p-2 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-all duration-300"
                  >
                    <X className="w-6 h-6" />
                  </motion.button>
                </div>
              </div>

              {/* Блок с ошибкой */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mx-8 mt-6 p-4 bg-gradient-to-r from-red-500/10 to-rose-500/10 border border-red-200/50 text-red-700 rounded-2xl backdrop-blur-sm"
                >
                  <div className="flex items-center gap-2">
                    <X className="w-5 h-5" />
                    {error}
                  </div>
                </motion.div>
              )}

              {/* Информация о выбранной услуге */}
              {selectedServicePrice && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mx-8 mt-6 p-4 bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-200/50 rounded-2xl backdrop-blur-sm"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-emerald-600 font-medium">Выбранная услуга</p>
                      <p className="font-bold text-gray-900 text-lg">{selectedServicePrice.service?.title}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Стоимость</p>
                      <p className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                        {formatPrice(selectedServicePrice.price)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Фамилия */}
                  <div>
                    <div className="text-sm font-semibold text-gray-700 mb-2.5 flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-500" />
                      Фамилия *
                    </div>
                    <div className="relative">
                      <input
                        name="clientSurname"
                        value={formData.clientSurname}
                        onChange={handleInputChange}
                        className="w-full pl-11 pr-4 py-3.5 bg-white/80 backdrop-blur-sm border border-gray-300/50 rounded-2xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-gray-900 placeholder-gray-500 transition-all duration-300"
                        placeholder="Введите фамилию"
                        required
                      />
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    </div>
                  </div>

                  {/* Имя */}
                  <div>
                    <div className="text-sm font-semibold text-gray-700 mb-2.5 flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-500" />
                      Имя *
                    </div>
                    <div className="relative">
                      <input
                        name="clientName"
                        value={formData.clientName}
                        onChange={handleInputChange}
                        className="w-full pl-11 pr-4 py-3.5 bg-white/80 backdrop-blur-sm border border-gray-300/50 rounded-2xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-gray-900 placeholder-gray-500 transition-all duration-300"
                        placeholder="Введите имя"
                        required
                      />
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    </div>
                  </div>

                  {/* Телефон */}
                  <div>
                    <div className="text-sm font-semibold text-gray-700 mb-2.5 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-blue-500" />
                      Телефон *
                    </div>
                    <div className="relative">
                      <input
                        name="clientPhone"
                        value={formData.clientPhone}
                        onChange={handleInputChange}
                        placeholder="+7 (___) ___-__-__"
                        className="w-full pl-11 pr-4 py-3.5 bg-white/80 backdrop-blur-sm border border-gray-300/50 rounded-2xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-gray-900 placeholder-gray-500 transition-all duration-300"
                        required
                      />
                      <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    </div>
                  </div>

                  {/* Мастер */}
                  <div>
                    <div className="text-sm font-semibold text-gray-700 mb-2.5 flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-500" />
                      Мастер *
                    </div>
                    <div className="relative">
                      <select
                        name="master"
                        value={formData.master}
                        onChange={handleInputChange}
                        className="w-full pl-11 pr-10 py-3.5 bg-white/80 backdrop-blur-sm border border-gray-300/50 rounded-2xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-gray-900 appearance-none transition-all duration-300"
                        required
                      >
                        <option value="">Выберите мастера</option>
                        {masters.filter(m => m.isActive).map(m => (
                          <option key={m.id} value={m.id}>
                            {m.surname} {m.name}
                          </option>
                        ))}
                      </select>
                      <Users className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    </div>
                  </div>

                  {/* Услуга */}
                  <div>
                    <div className="text-sm font-semibold text-gray-700 mb-2.5 flex items-center gap-2">
                      <Scissors className="w-4 h-4 text-blue-500" />
                      Услуга *
                    </div>
                    <div className="relative">
                      <select
                        name="service"
                        value={formData.service}
                        onChange={handleInputChange}
                        disabled={!formData.master}
                        className="w-full pl-11 pr-10 py-3.5 bg-white/80 backdrop-blur-sm border border-gray-300/50 rounded-2xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-gray-900 disabled:bg-gray-100/50 disabled:text-gray-500 appearance-none transition-all duration-300"
                        required
                      >
                        <option value="">
                          {formData.master ? "Выберите услугу" : "Сначала выберите мастера"}
                        </option>
                        {servicePrices
                          .filter(sp => sp.isActive && sp.service)
                          .map(sp => (
                            <option key={sp.id} value={sp.service!.id}>
                              {sp.service!.title} • {formatPrice(sp.price)}
                            </option>
                          ))}
                      </select>
                      <Scissors className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    </div>
                  </div>

                  {/* Дата */}
                  <div>
                    <div className="text-sm font-semibold text-gray-700 mb-2.5 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-500" />
                      Дата *
                    </div>
                    <div className="relative">
                      <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        min={new Date().toISOString().split("T")[0]}
                        className="w-full pl-11 pr-4 py-3.5 bg-white/80 backdrop-blur-sm border border-gray-300/50 rounded-2xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-gray-900 transition-all duration-300"
                        required
                      />
                      <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    </div>
                  </div>

                  {/* Время */}
                  <div>
                    <div className="text-sm font-semibold text-gray-700 mb-2.5 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-500" />
                      Время *
                    </div>
                    <div className="relative">
                      <div className="relative">
                        <select
                          name="time"
                          value={formData.time}
                          onChange={handleInputChange}
                          disabled={loadingTimes || !formData.date}
                          className="w-full pl-11 pr-10 py-3.5 bg-white/80 backdrop-blur-sm border border-gray-300/50 rounded-2xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-gray-900 disabled:bg-gray-100/50 disabled:text-gray-500 appearance-none transition-all duration-300"
                          required
                        >
                          <option value="">
                            {getTimePlaceholder()}
                          </option>
                          {availableTimes.map(t => (
                            <option key={t} value={t} className="text-gray-900">
                              {t}
                            </option>
                          ))}
                        </select>
                        <Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      </div>
                      {/* Индикатор загрузки рядом с селектом */}
                      {loadingTimes && (
                        <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
                          <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Сводная информация */}
                {formData.master && formData.service && formData.date && formData.time && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 border border-blue-200/30 rounded-2xl backdrop-blur-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Сводная информация</p>
                        <p className="font-medium text-gray-900">
                          {formData.clientSurname} {formData.clientName} • {formData.date} в {formData.time}
                        </p>
                      </div>
                      {selectedServicePrice && (
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Общая стоимость</p>
                          <p className="text-xl font-bold text-blue-600">
                            {formatPrice(selectedServicePrice.price)}
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Кнопки */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200/50">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onClose}
                    className="flex-1 px-6 py-3.5 bg-white/80 backdrop-blur-sm border border-gray-300/50 text-gray-700 rounded-2xl font-semibold hover:bg-gray-50/80 transition-all duration-300 shadow-sm"
                  >
                    Отмена
                  </motion.button>
                  
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isSubmitting || loadingTimes}
                    className="flex-1 px-6 py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-2xl font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Сохранение...
                      </>
                    ) : mode === "edit" ? (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Сохранить изменения
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5" />
                        Создать запись
                      </>
                    )}
                  </motion.button>
                </div>
              </form>

              {/* Футер */}
              <div className="px-8 py-4 border-t border-gray-200/50 bg-gradient-to-r from-gray-50/50 to-white/30">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <Shield className="w-3 h-3" />
                    <span>Защищенное соединение</span>
                  </div>
                  <span>ID: {initialData?.id || "Новая"}</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}