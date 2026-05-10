"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { categoryService } from "@/services/category/category.service";
import { serviceService } from "@/services/service/service.service";
import { masterService } from "@/services/master/master.service";
import { servicePriceService } from "@/services/service-price/service-price.service";
import { masterScheduleService } from "@/services/schedule/schedule.service";
import { appointmentService } from "@/services/appointment/appointment.service";

import { ICategory } from "@/types/category.types";
import { IService } from "@/types/services.types";
import { IMaster } from "@/types/masters.type";
import { IServicePrice } from "@/types/service-price.types";
import { IMasterSchedule } from "@/types/schedule.types";
import { AppointmentStatus } from "@/types/appointment.types";

import BeautyCalendar from "@/app/components/ui/Beautycalendar";
import NotificationWindow from "@/app/components/ui/public/appointment/NotificationWindow";
import LimitExceededWindow from "@/app/components/ui/public/appointment/LimitExceededWindow";
import ServiceCard from "../services/serviceCard";
import { formatPhoneNumber } from "@/app/lib/formatPhoneNumber";
import { errorCatch } from "@/api/error";

import { Loader2, CheckCircle2, Edit2, ChevronLeft, CalendarCheck } from "lucide-react";

// --- Вспомогательный компонент для компактных итогов ---
function SelectionSummary({ label, value, onEdit }: { label: string; value: string; onEdit: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between bg-[#111] border border-white/5 rounded-2xl px-6 py-3 mb-4 max-w-xl mx-auto"
    >
      <div>
        <p className="text-[10px] text-[#6B6560] uppercase tracking-widest">{label}</p>
        <p className="text-sm font-medium text-[#F0EBE3]">{value}</p>
      </div>
      <button onClick={onEdit} className="p-2 hover:bg-white/5 rounded-full transition-colors text-[#C8A97E]">
        <Edit2 className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

// Основной контент страницы
function AppointmentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const preselectedServiceId = searchParams.get("serviceId");

  const [categories, setCategories] = useState<ICategory[]>([]);
  const [services, setServices] = useState<IService[]>([]);
  const [masters, setMasters] = useState<IMaster[]>([]);
  const [prices, setPrices] = useState<IServicePrice[]>([]);
  const [schedules, setSchedules] = useState<IMasterSchedule[]>([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [limitExceeded, setLimitExceeded] = useState(false);

  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [selectedMasterId, setSelectedMasterId] = useState<number | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);

  const [formData, setFormData] = useState({ firstName: "", lastName: "", phone: "", comment: "" });

  // Загрузка данных
  useEffect(() => {
    Promise.all([
      categoryService.getAll(),
      serviceService.getAll(),
      masterService.getAll(),
      servicePriceService.getAll(),
      masterScheduleService.getAll(),
    ])
      .then(([cats, servs, masts, priceList, scheds]) => {
        setCategories(cats.filter((c) => c.isActive !== false));
        setServices(servs.filter((s) => s.isActive));
        setMasters(masts.filter((m) => m.isActive));
        setPrices(priceList.filter((p) => p.isActive !== false));
        setSchedules(scheds);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // АВТОВЫБОР УСЛУГИ ИЗ URL
  useEffect(() => {
    if (preselectedServiceId && services.length > 0) {
      const serviceIdNum = Number(preselectedServiceId);
      const service = services.find(s => s.id === serviceIdNum);

      if (service) {
        setSelectedServiceId(serviceIdNum);
        setSelectedCategoryId(service.categoryId || service.category?.id || null);
      }
    }
  }, [preselectedServiceId, services]);

  // Вычисляемые данные
  const currentCategory = categories.find(c => c.id === selectedCategoryId);
  const currentService = services.find(s => s.id === selectedServiceId);
  const currentMaster = masters.find(m => m.id === selectedMasterId);

  const filteredServices = useMemo(
    () => (!selectedCategoryId ? [] : services.filter((s) => s.categoryId === selectedCategoryId)),
    [services, selectedCategoryId]
  );

  const availableMasters = useMemo(() => {
    if (!selectedServiceId) return [];
    const targetId = Number(selectedServiceId);
    const masterIdsFromPrices = prices
      .filter((p) => (p.serviceId ?? p.service?.id) === targetId && p.isActive !== false)
      .map((p) => Number(p.masterId ?? p.master?.id));
    return masters.filter((m) => masterIdsFromPrices.includes(Number(m.id)));
  }, [masters, prices, selectedServiceId]);

  const currentPrice = useMemo(() => {
    if (!selectedServiceId || !selectedMasterId) return 0;
    const found = prices.find((p) => {
      const pSId = p.serviceId ?? p.service?.id;
      const pMId = p.masterId ?? p.master?.id;
      return Number(pSId) === Number(selectedServiceId) && Number(pMId) === Number(selectedMasterId);
    });
    return found?.price ?? 0;
  }, [prices, selectedServiceId, selectedMasterId]);

  const masterScheduleData = useMemo(() => {
    if (!selectedMasterId) return null;
    const masterSchedules = schedules.filter((s) => (s.masterId ?? s.master?.id) === selectedMasterId);
    const DOW_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;
    const schedule: any = { mon: null, tue: null, wed: null, thu: null, fri: null, sat: null, sun: null };
    masterSchedules.forEach((s) => {
      const key = DOW_KEYS[s.dayOfWeek];
      if (key) {
        const start = s.startTime.includes("T") ? s.startTime.split("T")[1].slice(0, 5) : s.startTime.slice(0, 5);
        const end = s.endTime.includes("T") ? s.endTime.split("T")[1].slice(0, 5) : s.endTime.slice(0, 5);
        schedule[key] = { workingHours: { start, end }, appointments: [] };
      }
    });
    return { masterId: selectedMasterId, schedule };
  }, [selectedMasterId, schedules]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: name === "phone" ? formatPhoneNumber(value) : value }));
  };

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Базовая проверка, что всё выбрано
  if (!selectedAppointment || !selectedServiceId || !selectedMasterId) {
    console.error("Не все данные выбраны");
    return;
  }

  setSubmitting(true);

  try {
    // 1. Формируем корректную дату ISO. 
    // Убедись, что selectedAppointment.day в формате 'YYYY-MM-DD'
    const appointmentDate = new Date(`${selectedAppointment.day}T${selectedAppointment.time}:00`);

    // 2. Подготавливаем объект, принудительно превращая строки в числа
    const dto = {
      serviceId: Number(selectedServiceId),
      masterId: Number(selectedMasterId),
      appointmentTime: appointmentDate.toISOString(), // NestJS/Prisma любят ISO
      clientName: formData.firstName.trim(),
      clientSurname: formData.lastName.trim(),
      clientPhone: formData.phone.replace(/\D/g, ''), // Отправляем только цифры (лучшая практика)
      price: Number(currentPrice), // Важно для Decimal в Prisma
      comment: formData.comment?.trim() || undefined,
      status: AppointmentStatus.Новый,
    };

    console.log("Отправка DTO:", dto); // Посмотри в консоль перед ошибкой

    await appointmentService.createPublic(dto);
    setSuccess(true);
  } catch (err: any) {
    console.error("Ошибка записи:", err?.response?.data);

    if (
      err?.response?.status === 429 &&
      err?.response?.data?.code === "PUBLIC_APPOINTMENT_LIMIT_EXCEEDED"
    ) {
      setLimitExceeded(true);
      return;
    }

    alert(`Ошибка: ${errorCatch(err) || "Проверьте введенные данные"}`);
  } finally {
    setSubmitting(false);
  }
};

  if (loading) return <div className="min-h-screen bg-[#080808] flex items-center justify-center"><Loader2 className="w-7 h-7 text-[#C8A97E] animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-[#080808] text-[#F0EBE3] pb-24 pt-32 px-4">
      <div className="container mx-auto max-w-5xl overflow-hidden">
        
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-light mb-4" style={{ fontFamily: "serif" }}>Онлайн запись</h1>
        </header>

        {/* КНОПКА СБРОСА (если пришли из каталога) */}
        <div className="flex justify-center h-12">
          <AnimatePresence>
            {preselectedServiceId && !selectedAppointment && (
              <motion.button
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onClick={() => {
                  window.history.replaceState(null, '', '/appointment');
                  setSelectedServiceId(null);
                  setSelectedCategoryId(null);
                  setSelectedMasterId(null);
                }}
                className="mb-8 text-[#6B6560] hover:text-[#C8A97E] flex items-center gap-2 text-xs uppercase tracking-widest transition-colors border border-white/5 px-4 py-2 rounded-full bg-white/5"
              >
                <ChevronLeft className="w-4 h-4" />
                Выбрать другую услугу
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        <div className="relative mt-4">
          <AnimatePresence mode="wait">
            
            {/* ШАГ 1: КАТЕГОРИИ */}
            {!selectedCategoryId && (
              <motion.section 
                key="step1"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, x: -20 }}
                className="text-center"
              >
                <p className="text-xs text-[#6B6560] uppercase tracking-widest mb-8">Выберите направление</p>
                <div className="flex flex-wrap justify-center gap-3">
                  {categories.map((cat) => (
                    <button key={cat.id} onClick={() => setSelectedCategoryId(cat.id)} className="px-8 py-4 rounded-2xl border border-white/10 bg-[#0e0e0e] hover:border-[#C8A97E] hover:text-[#C8A97E] transition-all text-sm uppercase tracking-widest">
                      {cat.title}
                    </button>
                  ))}
                </div>
              </motion.section>
            )}

            {/* ШАГ 2: УСЛУГИ */}
            {selectedCategoryId && !selectedServiceId && (
              <motion.section key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <SelectionSummary label="Направление" value={currentCategory?.title || ""} onEdit={() => setSelectedCategoryId(null)} />
                <p className="text-xs text-[#6B6560] uppercase tracking-widest text-center my-8">Выберите услугу</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredServices.map((s) => (
                    <div key={s.id} onClick={() => setSelectedServiceId(s.id)} className="cursor-pointer active:scale-95 transition-transform">
                      <ServiceCard service={s} />
                    </div>
                  ))}
                </div>
              </motion.section>
            )}

            {/* ШАГ 3: МАСТЕР */}
            {selectedServiceId && !selectedMasterId && (
              <motion.section key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <SelectionSummary label="Услуга" value={currentService?.title || ""} onEdit={() => setSelectedServiceId(null)} />
                <p className="text-xs text-[#6B6560] uppercase tracking-widest text-center my-8">Выберите мастера</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                  {availableMasters.map((m) => {
                     const priceObj = prices.find(p => (p.serviceId ?? p.service?.id) === selectedServiceId && (p.masterId ?? p.master?.id) === m.id);
                     return (
                      <button key={m.id} onClick={() => setSelectedMasterId(m.id)} className="flex items-center gap-4 p-5 rounded-3xl border border-white/5 bg-[#0e0e0e] hover:border-[#C8A97E] transition-all">
                        <img src={m.photo || "/avatar-placeholder.png"} className="w-16 h-16 rounded-full object-cover" alt="" />
                        <div className="text-left">
                          <p className="font-bold text-base">{m.surname} {m.name}</p>
                          <p className="text-xs text-[#6B6560]">{m.specialization}</p>
                          <p className="text-sm text-[#C8A97E] mt-1">{priceObj?.price.toLocaleString()} ₽</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.section>
            )}

            {/* ШАГ 4: КАЛЕНДАРЬ */}
            {selectedMasterId && !selectedAppointment && (
              <motion.section key="step4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, x: -20 }}>
                <SelectionSummary label="Мастер" value={`${currentMaster?.surname} ${currentMaster?.name}`} onEdit={() => setSelectedMasterId(null)} />
                <div className="max-w-xl mx-auto bg-[#0e0e0e] rounded-3xl p-6 border border-white/5 mt-8">
                  <BeautyCalendar
                    selectedMasterId={selectedMasterId}
                    selectedMasterSchedule={masterScheduleData}
                    selectedAppointment={selectedAppointment}
                    handleTimeClick={(masterId, day, time) => setSelectedAppointment({ masterId, day, time })}
                  />
                </div>
              </motion.section>
            )}

            {/* ШАГ 5: ФОРМА */}
            {selectedAppointment && (
              <motion.section key="step5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md mx-auto">
                <div className="bg-[#C8A97E]/5 border border-[#C8A97E]/20 p-6 rounded-3xl mb-8 space-y-3">
                   <div className="flex justify-between text-xs text-[#6B6560] uppercase tracking-tighter"><span>{currentService?.title}</span><span>{currentPrice.toLocaleString()} ₽</span></div>
                   <div className="flex justify-between text-sm font-medium"><span>{currentMaster?.surname} {currentMaster?.name}</span><span>{selectedAppointment.day}, {selectedAppointment.time}</span></div>
                   <button onClick={() => setSelectedAppointment(null)} className="text-[10px] text-[#C8A97E] underline flex items-center gap-1"><ChevronLeft className="w-3 h-3" /> Изменить время</button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <input name="lastName" placeholder="Фамилия" onChange={handleInput} required className="w-full bg-[#111] border border-white/5 p-4 rounded-2xl focus:border-[#C8A97E] outline-none transition-colors" />
                    <input name="firstName" placeholder="Имя" onChange={handleInput} required className="w-full bg-[#111] border border-white/5 p-4 rounded-2xl focus:border-[#C8A97E] outline-none transition-colors" />
                  </div>
                  <input name="phone" placeholder="Телефон" value={formData.phone} onChange={handleInput} required className="w-full bg-[#111] border border-white/5 p-4 rounded-2xl focus:border-[#C8A97E] outline-none transition-colors" />
                  <textarea name="comment" placeholder="Комментарий к записи" onChange={handleInput} rows={3} className="w-full bg-[#111] border border-white/5 p-4 rounded-2xl focus:border-[#C8A97E] outline-none transition-colors resize-none" />
                  
                  <button type="submit" disabled={submitting} className="w-full bg-[#C8A97E] text-[#1a1208] py-5 rounded-2xl font-bold text-lg hover:shadow-[0_10px_30px_rgba(200,169,126,0.25)] transition-all">
                    {submitting ? "Бронируем..." : "Записаться на сеанс"}
                  </button>
                </form>
              </motion.section>
            )}
          </AnimatePresence>
        </div>
      </div>

      {success && currentService && currentMaster && selectedAppointment && (
        <NotificationWindow
          onClose={() => { setSuccess(false); router.push('/'); }}
          serviceTitle={currentService.title}
          servicePrice={currentPrice}
          appointmentDate={new Date(selectedAppointment.day)}
          appointmentTime={selectedAppointment.time}
          appointmentMaster={`${currentMaster.surname} ${currentMaster.name}`}
        />
      )}

      {limitExceeded && (
        <LimitExceededWindow onClose={() => setLimitExceeded(false)} />
      )}
    </div>
  );
}

// Обязательная обертка для useSearchParams в Next.js
export default function AppointmentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#080808] flex items-center justify-center"><Loader2 className="w-7 h-7 text-[#C8A97E] animate-spin" /></div>}>
      <AppointmentContent />
    </Suspense>
  );
}
