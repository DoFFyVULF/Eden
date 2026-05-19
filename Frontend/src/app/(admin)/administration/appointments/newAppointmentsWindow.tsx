"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  BadgeCheck,
  Shield,
  Zap,
  Sparkles,
  AlertTriangle,
  CalendarDays,
  Info,
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
import {
  ICreateAppointmentDto,
  AppointmentStatus,
  IUpdateAppointmentDto,
} from "@/types/appointment.types";
import type { IMasterSchedule, MasterStatusInfo } from "@/types/schedule.types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  mode?: "create" | "edit";
  initialData?: {
    id: number;
    clientSurname: string;
    clientName: string;
    clientPhone: string;
    comment?: string;
    masterId: number;
    serviceId: number;
    appointmentTime: string;
  };
}

const getWeekdayIndex = (ds: string) => (new Date(ds).getDay() + 6) % 7;
const fmtPrice = (p: number) =>
  new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    minimumFractionDigits: 0,
  }).format(p);

const TIME_OFF_LABELS: Record<string, string> = {
  vacation: "в отпуске",
  sick_leave: "на больничном",
  day_off: "на отгуле",
  other: "недоступен",
};

const TIME_OFF_NAMES: Record<string, string> = {
  vacation: "Отпуск",
  sick_leave: "Больничный",
  day_off: "Отгул",
  other: "Недоступен",
};

export default function NewAppointmentsWindow({
  isOpen,
  onClose,
  onSuccess,
  mode = "create",
  initialData,
}: Props) {
  const [masters, setMasters] = useState<IMaster[]>([]);
  const [servicePrices, setServicePrices] = useState<IServicePrice[]>([]);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [loadingTimes, setLoadingTimes] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSP, setSelectedSP] = useState<IServicePrice | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [masterStatus, setMasterStatus] = useState<MasterStatusInfo | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [showWarningConfirm, setShowWarningConfirm] = useState(false);

  const [form, setForm] = useState({
    clientSurname: "",
    clientName: "",
    clientPhone: "",
    comment: "",
    service: "",
    time: "",
    master: "",
    date: "",
  });

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
    if (mode !== "edit" || !initialData || !isOpen) return;
    try {
      const d = new Date(initialData.appointmentTime);
      if (isNaN(d.getTime())) {
        setError("Некорректная дата");
        return;
      }
      setForm({
        clientSurname: initialData.clientSurname || "",
        clientName: initialData.clientName || "",
        clientPhone: formatPhoneNumber(initialData.clientPhone || ""),
        comment: initialData.comment || "",
        master: String(initialData.masterId || ""),
        service: String(initialData.serviceId || ""),
        date: d.toISOString().split("T")[0],
        time: d.toTimeString().slice(0, 5),
      });
    } catch {
      setError("Не удалось загрузить данные");
    }
  }, [mode, initialData, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    setWarning(null);
    setShowWarningConfirm(false);
    setMasterStatus(null);
    Promise.all([masterService.getAll(), serviceService.getAll()])
      .then(([m]) => setMasters(m))
      .catch(() => setError("Не удалось загрузить мастеров"));
  }, [isOpen]);

  useEffect(() => {
    if (!form.master) {
      setServicePrices([]);
      setSelectedSP(null);
      setMasterStatus(null);
      setWarning(null);
      setShowWarningConfirm(false);
      return;
    }

    const masterId = Number(form.master);
    setLoadingStatus(true);
    Promise.all([
      servicePriceService.getByMaster(masterId),
      masterScheduleService.getMasterStatus(masterId),
    ])
      .then(([prices, status]) => {
        setServicePrices(prices);
        setSelectedSP(
          prices.find((sp) => sp.service?.id === Number(form.service)) || null,
        );
        setMasterStatus(status);
        
        // Если мастер недоступен, показываем предупреждение, но не блокируем выбор даты
        if (status?.isOnTimeOff && status.currentPeriod) {
          const start = new Date(status.currentPeriod.startDate);
          const end = new Date(status.currentPeriod.endDate);
          const typeName = TIME_OFF_NAMES[status.currentPeriod.type] || "Недоступен";
          const startStr = start.toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
          const endStr = end.toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
          
          setWarning(
            `${typeName} с ${startStr} по ${endStr}. Запись возможна только на даты вне этого периода.`
          );
        } else {
          setWarning(null);
          setShowWarningConfirm(false);
        }
      })
      .catch(() => setError("Не удалось загрузить данные мастера"))
      .finally(() => setLoadingStatus(false));
  }, [form.master]);

  useEffect(() => {
    if (!form.service || !servicePrices.length) return;
    setSelectedSP(
      servicePrices.find((sp) => sp.service?.id === Number(form.service)) || null,
    );
  }, [form.service, servicePrices]);

  // Проверка, попадает ли выбранная дата в период недоступности
  const isDateInTimeOff = (dateStr: string, status: MasterStatusInfo | null): boolean => {
    if (!status?.isOnTimeOff || !status.currentPeriod) return false;
    const checkDate = new Date(dateStr);
    const startDate = new Date(status.currentPeriod.startDate);
    const endDate = new Date(status.currentPeriod.endDate);
    
    // Обнуляем время для сравнения только дат
    checkDate.setHours(0, 0, 0, 0);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);
    
    return checkDate >= startDate && checkDate <= endDate;
  };

  // Исправлено: isDateUnavailable всегда boolean
  const isDateUnavailable: boolean = !!(masterStatus?.isOnTimeOff && form.date && isDateInTimeOff(form.date, masterStatus));

  useEffect(() => {
    const load = async () => {
      if (!form.master || !form.date) {
        setAvailableTimes([]);
        return;
      }

      // Проверяем, попадает ли выбранная дата в период недоступности
      if (isDateUnavailable) {
        setAvailableTimes([]);
        // Показываем предупреждение, что дата в периоде недоступности
        if (masterStatus?.currentPeriod) {
          const end = new Date(masterStatus.currentPeriod.endDate);
          const endStr = end.toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
          setWarning(`Выбранная дата попадает в период недоступности мастера (до ${endStr}). Пожалуйста, выберите другую дату.`);
        }
        return;
      } else {
        // Если дата вне периода недоступности, убираем предупреждение
        if (warning?.includes("попадает в период недоступности")) {
          setWarning(null);
        }
      }

      setLoadingTimes(true);
      try {
        const mid = Number(form.master);

        const schedules: IMasterSchedule[] = await masterScheduleService.getByMaster(mid);
        const sch = schedules.find(s => s.dayOfWeek === getWeekdayIndex(form.date));

        if (!sch) {
          setAvailableTimes([]);
          return;
        }

        const appts = await appointmentService.getByDate(form.date, mid);

        const s = new Date(sch.startTime);
        const e = new Date(sch.endTime);
        const sm = s.getHours() * 60 + s.getMinutes();
        const em = e.getHours() * 60 + e.getMinutes();

        const todayStr = new Date().toISOString().split("T")[0];
        const isToday = form.date === todayStr;

        let startLimit = sm;

        if (isToday) {
          const now = new Date();
          const currentMinutes = now.getHours() * 60 + now.getMinutes();
          if (currentMinutes > sm) {
            startLimit = Math.ceil((currentMinutes + 5) / 30) * 30;
          }
        }

        const slots: string[] = [];

        for (let m = startLimit; m + 30 <= em; m += 30) {
          const timeString = `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
          slots.push(timeString);
        }

        const booked = appts
          .filter(a => a.status !== AppointmentStatus.Отменен)
          .map(a => {
            const d = new Date(a.appointmentTime);
            return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
          });

        setAvailableTimes(slots.filter(t => !booked.includes(t)));
      } catch (err) {
        console.error(err);
        setError("Не удалось загрузить время");
        setAvailableTimes([]);
      } finally {
        setLoadingTimes(false);
      }
    };
    load();
  }, [form.master, form.date, masterStatus, isDateUnavailable, warning]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setForm((p) => ({
      ...p,
      [name]: name === "clientPhone" ? formatPhoneNumber(value) : value,
      ...(name === "master" ? { service: "", time: "" } : {}),
      ...(name === "date" ? { time: "" } : {}),
    }));
    
    // Если меняем дату, сбрасываем подтверждение предупреждения
    if (name === "date") {
      setShowWarningConfirm(false);
    }
    
    if (name === "service")
      setSelectedSP(
        servicePrices.find((sp) => sp.service?.id === Number(value)) || null,
      );
  };

   const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Проверяем, если дата в периоде недоступности
    if (isDateUnavailable) {
      setError("Невозможно создать запись на дату, когда мастер недоступен");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      if (!form.clientSurname.trim()) throw new Error("Укажите фамилию");
      if (!form.clientName.trim()) throw new Error("Укажите имя");
      if (form.clientPhone.replace(/\D/g, "").length < 10)
        throw new Error("Некорректный телефон");
      if (!form.master) throw new Error("Выберите мастера");
      if (!form.service) throw new Error("Выберите услугу");
      if (!form.date) throw new Error("Укажите дату");
      if (!form.time) throw new Error("Укажите время");

      const priceItem = servicePrices.find(
        (sp) => sp.service?.id === Number(form.service),
      );
      
      if (!priceItem) throw new Error("Не найдена цена услуги");

      // Ensure price is a number
      const finalPrice = Number(priceItem.price);
      
      const appointmentTime = `${form.date}T${form.time}:00`;

      if (mode === "edit" && initialData?.id) {
        await appointmentService.update(initialData.id, {
          clientSurname: form.clientSurname.trim(),
          clientName: form.clientName.trim(),
          clientPhone: form.clientPhone.replace(/\D/g, ""),
          comment: form.comment.trim() || undefined,
          masterId: Number(form.master),
          serviceId: Number(form.service),
          appointmentTime,
          price: finalPrice, // Pass as number
        } as Partial<IUpdateAppointmentDto>);
      } else {
        await appointmentService.createAdmin({
          clientSurname: form.clientSurname.trim(),
          clientName: form.clientName.trim(),
          clientPhone: form.clientPhone.replace(/\D/g, ""),
          comment: form.comment.trim() || undefined,
          masterId: Number(form.master),
          serviceId: Number(form.service),
          appointmentTime,
          price: finalPrice, // Pass as number (removed .toString())
          status: AppointmentStatus.Подтвержден,
        } as ICreateAppointmentDto);
      }
      
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message || "Ошибка сохранения");
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalCls = isDark
    ? "bg-slate-900/85 backdrop-blur-3xl border border-white/[0.12] shadow-[0_32px_80px_rgba(0,0,0,0.7)]"
    : "bg-white/95 backdrop-blur-xl border border-gray-200/70 shadow-2xl";

  const inputCls = (disabled = false) =>
    `w-full h-11 px-4 rounded-xl text-sm border outline-none transition-all ${
      disabled
        ? isDark
          ? "bg-white/[0.03] border-white/[0.06] text-white/25 cursor-not-allowed"
          : "bg-gray-100 border-gray-200 text-gray-300 cursor-not-allowed"
        : isDark
          ? "bg-white/[0.07] border-white/[0.1] text-white/90 placeholder-white/25 focus:border-indigo-400/50 focus:bg-white/[0.09] focus:ring-1 focus:ring-indigo-400/20"
          : "bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-500/10"
    }`;

  const selectCls = (disabled = false) =>
    `w-full h-11 pl-4 pr-10 rounded-xl text-sm border outline-none appearance-none transition-all ${
      disabled
        ? isDark
          ? "bg-white/[0.03] border-white/[0.06] text-white/25 cursor-not-allowed"
          : "bg-gray-100 border-gray-200 text-gray-300 cursor-not-allowed"
        : isDark
          ? "bg-white/[0.07] border-white/[0.1] text-white/90 focus:border-indigo-400/50 focus:bg-white/[0.09]"
          : "bg-gray-50 border-gray-200 text-gray-800 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-500/10"
    }`;

  const isComplete = !!(form.master && form.service && form.date && form.time);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            background: isDark ? "rgba(0,0,0,0.75)" : "rgba(15,23,42,0.4)",
            backdropFilter: "blur(16px)",
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 24 }}
            transition={{ type: "spring", damping: 28, stiffness: 340 }}
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-lg rounded-3xl overflow-hidden ${modalCls}`}
          >
            {/* Header gradient */}
            <div
              className={`relative px-7 py-6 overflow-hidden ${
                isDark
                  ? "bg-gradient-to-br from-indigo-900/60 via-purple-900/40 to-slate-900/60 border-b border-white/[0.08]"
                  : "bg-gradient-to-br from-blue-50 via-purple-50/50 to-white border-b border-gray-100"
              }`}
            >
              <div className="absolute top-0 right-0 w-32 h-32 opacity-30">
                <div
                  className={`w-full h-full rounded-full bg-gradient-to-br ${isDark ? "from-indigo-500 to-purple-600" : "from-blue-400 to-purple-500"} blur-2xl`}
                />
              </div>
              <div className="relative flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2.5 mb-2">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        isDark
                          ? "bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-purple-500/30"
                          : "bg-gradient-to-br from-blue-500 to-purple-600 shadow-md shadow-blue-500/20"
                      }`}
                    >
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <h2
                      className={`text-xl font-black ${isDark ? "text-white" : "text-gray-900"}`}
                    >
                      {mode === "edit"
                        ? "Редактировать запись"
                        : "Новая запись"}
                    </h2>
                  </div>
                  <p
                    className={`text-sm flex items-center gap-1.5 ${isDark ? "text-white/40" : "text-gray-400"}`}
                  >
                    {mode === "create" ? (
                      <>
                        <BadgeCheck size={14} />
                        Запись сразу подтверждается
                      </>
                    ) : (
                      <>
                        <Shield size={14} />
                        Редактирование существующей
                      </>
                    )}
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  onClick={onClose}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors mt-0.5 ${
                    isDark
                      ? "text-white/40 hover:bg-white/[0.08] hover:text-white/70"
                      : "text-gray-400 hover:bg-gray-100"
                  }`}
                >
                  <X size={18} />
                </motion.button>
              </div>
            </div>

            <div className="overflow-y-auto max-h-[68vh]">
              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`mx-6 mt-5 px-4 py-3 rounded-xl border flex items-center gap-3 text-sm font-medium ${
                      isDark
                        ? "bg-rose-500/10 border-rose-400/20 text-rose-400"
                        : "bg-rose-50 border-rose-200 text-rose-600"
                    }`}
                  >
                    <X size={15} className="flex-shrink-0" />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Warning about master unavailability */}
              <AnimatePresence>
                {warning && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className={`mx-6 mt-5 px-5 py-4 rounded-2xl border flex items-start gap-3 ${
                      isDark
                        ? "bg-amber-500/10 border-amber-400/20"
                        : "bg-amber-50/80 border-amber-200/70"
                    }`}
                  >
                    <AlertTriangle size={18} className={isDark ? "text-amber-400 mt-0.5 flex-shrink-0" : "text-amber-500 mt-0.5 flex-shrink-0"} />
                    <div>
                      <p className={`text-sm font-bold ${isDark ? "text-amber-400" : "text-amber-700"}`}>
                        Информация о мастере
                      </p>
                      <p className={`text-xs mt-0.5 ${isDark ? "text-amber-400/70" : "text-amber-600"}`}>
                        {warning}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Service price preview */}
              <AnimatePresence>
                {selectedSP && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className={`mx-6 mt-5 px-5 py-4 rounded-2xl border flex items-center justify-between ${
                      isDark
                        ? "bg-indigo-500/10 border-indigo-400/20"
                        : "bg-blue-50/80 border-blue-200/70"
                    }`}
                  >
                    <div>
                      <p
                        className={`text-xs font-semibold uppercase tracking-wider mb-1 ${isDark ? "text-indigo-400" : "text-blue-500"}`}
                      >
                        Выбранная услуга
                      </p>
                      <p
                        className={`font-bold text-base ${isDark ? "text-white/90" : "text-gray-900"}`}
                      >
                        {selectedSP.service?.title}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-xs ${isDark ? "text-white/30" : "text-gray-400"}`}
                      >
                        Стоимость
                      </p>
                      <p
                        className={`text-2xl font-black ${isDark ? "bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent" : "text-blue-600"}`}
                      >
                        {fmtPrice(selectedSP.price)}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="px-6 pt-5 pb-6">
                <div className="grid grid-cols-2 gap-4">
                  {/* Surname */}
                  <FormField
                    label="Фамилия"
                    icon={<User size={14} />}
                    isDark={isDark}
                  >
                    <input
                      name="clientSurname"
                      value={form.clientSurname}
                      onChange={handleChange}
                      placeholder="Иванов"
                      required
                      className={inputCls()}
                    />
                  </FormField>

                  {/* Name */}
                  <FormField
                    label="Имя"
                    icon={<User size={14} />}
                    isDark={isDark}
                  >
                    <input
                      name="clientName"
                      value={form.clientName}
                      onChange={handleChange}
                      placeholder="Иван"
                      required
                      className={inputCls()}
                    />
                  </FormField>

                  {/* Phone */}
                  <FormField
                    label="Телефон"
                    icon={<Phone size={14} />}
                    isDark={isDark}
                  >
                    <input
                      name="clientPhone"
                      value={form.clientPhone}
                      onChange={handleChange}
                      placeholder="+7 (___) ___-__-__"
                      required
                      className={inputCls()}
                    />
                  </FormField>

                  <div className="col-span-2">
                    <FormField
                      label="Комментарий"
                      icon={<Info size={14} />}
                      isDark={isDark}
                    >
                      <textarea
                        name="comment"
                        value={form.comment}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, comment: e.target.value }))
                        }
                        rows={4}
                        placeholder="Пожелания клиента, детали по записи, важная информация"
                        className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all resize-none ${
                          isDark
                            ? "bg-white/[0.07] border-white/[0.1] text-white/90 placeholder-white/25 focus:border-indigo-400/50 focus:bg-white/[0.09] focus:ring-1 focus:ring-indigo-400/20"
                            : "bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-500/10"
                        }`}
                      />
                    </FormField>
                  </div>

                  {/* Master */}
                  <FormField
                    label="Мастер"
                    icon={<Users size={14} />}
                    isDark={isDark}
                    select
                    extra={
                      loadingStatus && (
                        <Loader2
                          size={13}
                          className={`animate-spin ${isDark ? "text-indigo-400" : "text-blue-400"}`}
                        />
                      )
                    }
                  >
                    <select
                      name="master"
                      value={form.master}
                      onChange={handleChange}
                      required
                      className={selectCls()}
                    >
                      <option value="">Выберите мастера</option>
                      {masters
                        .filter((m) => m.isActive)
                        .map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.surname} {m.name}
                          </option>
                        ))}
                    </select>
                    {!loadingStatus && (
                      <ChevronDown
                        size={14}
                        className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? "text-white/30" : "text-gray-400"}`}
                      />
                    )}
                  </FormField>

                  {/* Service */}
                  <FormField
                    label="Услуга"
                    icon={<Scissors size={14} />}
                    isDark={isDark}
                    select
                  >
                    <select
                      name="service"
                      value={form.service}
                      onChange={handleChange}
                      disabled={!form.master}
                      required
                      className={selectCls(!form.master)}
                    >
                      <option value="">
                        {!form.master
                          ? "Сначала выберите мастера"
                          : "Выберите услугу"}
                      </option>
                      {servicePrices
                        .filter((sp) => sp.isActive && sp.service)
                        .map((sp) => (
                          <option key={sp.id} value={sp.service!.id}>
                            {sp.service!.title} · {fmtPrice(sp.price)}
                          </option>
                        ))}
                    </select>
                    <ChevronDown
                      size={14}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? "text-white/30" : "text-gray-400"}`}
                    />
                  </FormField>

                  {/* Date - with visual indicator if in unavailable period */}
                  <FormField
                    label="Дата"
                    icon={<Calendar size={14} />}
                    isDark={isDark}
                  >
                    <div className="relative">
                      <input
                        type="date"
                        name="date"
                        value={form.date}
                        onChange={handleChange}
                        min={new Date().toISOString().split("T")[0]}
                        required
                        className={`${inputCls()} ${isDateUnavailable ? (isDark ? "border-amber-500/50" : "border-amber-400") : ""}`}
                      />
                      {isDateUnavailable && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <AlertTriangle size={16} className={isDark ? "text-amber-400" : "text-amber-500"} />
                        </div>
                      )}
                    </div>
                    {isDateUnavailable && masterStatus?.currentPeriod && (
                      <p className={`text-xs mt-1.5 flex items-center gap-1 ${isDark ? "text-amber-400/70" : "text-amber-600"}`}>
                        <Info size={12} />
                        Мастер {TIME_OFF_LABELS[masterStatus.currentPeriod.type] || "недоступен"} до {new Date(masterStatus.currentPeriod.endDate).toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}
                      </p>
                    )}
                  </FormField>

                  {/* Time */}
                  <FormField
                    label="Время"
                    icon={<Clock size={14} />}
                    isDark={isDark}
                    select
                    extra={
                      loadingTimes && (
                        <Loader2
                          size={13}
                          className={`animate-spin ${isDark ? "text-indigo-400" : "text-blue-400"}`}
                        />
                      )
                    }
                  >
                    <select
                      name="time"
                      value={form.time}
                      onChange={handleChange}
                      disabled={loadingTimes || !form.date || isDateUnavailable}
                      required
                      className={selectCls(loadingTimes || !form.date || isDateUnavailable)}
                    >
                      <option value="">
                        {isDateUnavailable
                          ? "Дата недоступна"
                          : loadingTimes
                            ? "Загрузка..."
                            : !form.date
                              ? "Сначала выберите дату"
                              : availableTimes.length === 0
                                ? "Нет свободных слотов"
                                : "Выберите время"}
                      </option>
                      {!isDateUnavailable && availableTimes.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                    {!loadingTimes && (
                      <ChevronDown
                        size={14}
                        className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? "text-white/30" : "text-gray-400"}`}
                      />
                    )}
                  </FormField>
                </div>

                {/* Summary */}
                <AnimatePresence>
                  {isComplete && !isDateUnavailable && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className={`mt-4 px-4 py-3.5 rounded-2xl border flex items-center justify-between ${
                        isDark
                          ? "bg-white/[0.05] border-white/[0.07]"
                          : "bg-gray-50/80 border-gray-200/70"
                      }`}
                    >
                      <p
                        className={`text-sm ${isDark ? "text-white/50" : "text-gray-500"}`}
                      >
                        {form.clientSurname} {form.clientName} · {form.date} в{" "}
                        {form.time}
                      </p>
                      {selectedSP && (
                        <span
                          className={`text-base font-black ${isDark ? "text-white/80" : "text-gray-900"}`}
                        >
                          {fmtPrice(selectedSP.price)}
                        </span>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Buttons */}
                <div
                  className={`flex gap-3 mt-6 pt-5 border-t ${isDark ? "border-white/[0.07]" : "border-gray-100"}`}
                >
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onClose}
                    className={`flex-1 h-12 rounded-2xl text-sm font-semibold border transition-all ${
                      isDark
                        ? "bg-white/[0.06] border-white/[0.1] text-white/60 hover:bg-white/[0.09]"
                        : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 shadow-sm"
                    }`}
                  >
                    Отмена
                  </motion.button>

                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isSubmitting || loadingTimes || isDateUnavailable}
                    className={`flex-1 h-12 rounded-2xl text-sm font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed ${
                      isDark
                        ? "bg-gradient-to-r from-indigo-500 to-purple-600 shadow-purple-500/25 hover:shadow-purple-500/40"
                        : "bg-gradient-to-r from-blue-500 to-purple-600 shadow-blue-500/20 hover:shadow-blue-500/35"
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Сохранение...
                      </>
                    ) : mode === "edit" ? (
                      <>
                        <CheckCircle size={16} />
                        Сохранить изменения
                      </>
                    ) : (
                      <>
                        <Zap size={16} />
                        Создать запись
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </div>

            <div
              className={`px-7 py-3 border-t flex items-center justify-between text-xs ${
                isDark
                  ? "border-white/[0.06] text-white/20"
                  : "border-gray-100 text-gray-400"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Shield size={11} />
                Защищённое соединение
              </span>
              <span>ID: {initialData?.id || "—"}</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function FormField({
  label,
  icon,
  isDark,
  children,
  select,
  extra,
}: {
  label: string;
  icon: React.ReactNode;
  isDark: boolean;
  children: React.ReactNode;
  select?: boolean;
  extra?: React.ReactNode;
}) {
  return (
    <div>
      <label
        className={`flex items-center gap-1.5 text-xs font-semibold mb-2 uppercase tracking-wide ${isDark ? "text-white/35" : "text-gray-400"}`}
      >
        <span className={isDark ? "text-indigo-400" : "text-blue-500"}>
          {icon}
        </span>
        {label}
      </label>
      <div className={select ? "relative" : undefined}>
        {children}
        {extra && (
          <span className="absolute right-9 top-1/2 -translate-y-1/2">
            {extra}
          </span>
        )}
      </div>
    </div>
  );
}
