"use client";

import { useState, useEffect, useMemo, Suspense, lazy } from "react";
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

const BeautyCalendar = lazy(() => import("@/app/components/ui/Beautycalendar"));
import NotificationWindow from "@/app/components/ui/public/appointment/NotificationWindow";
import LimitExceededWindow from "@/app/components/ui/public/appointment/LimitExceededWindow";
import LegalDocumentModal from "@/app/components/ui/public/appointment/LegalDocumentModal";
import ConsentCheckbox from "@/app/components/ui/public/appointment/ConsentCheckbox";
import ServiceCard from "../services/serviceCard";
import { formatPhoneNumber } from "@/app/lib/formatPhoneNumber";
import { errorCatch } from "@/api/error";
import { privacyPolicySections, publicOfferSections } from "./legalDocuments";

import {
  Loader2,
  Edit2,
  ChevronLeft,
  CalendarCheck2,
  Sparkles,
  UserRound,
  Scissors,
  LayoutGrid,
} from "lucide-react";

const PERSON_NAME_REGEX = /^[A-Za-zА-Яа-яЁё]+(?:[ '-][A-Za-zА-Яа-яЁё]+)*$/u;
const sanitizePersonName = (value: string) => value.replace(/[^A-Za-zА-Яа-яЁё\s'-]/gu, "");

function SelectionSummary({
  label,
  value,
  onEdit,
}: {
  label: string;
  value: string;
  onEdit: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="public-panel mx-auto mb-5 flex w-full max-w-2xl items-center justify-between rounded-[26px] px-5 py-4"
    >
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[color:var(--public-text-faint)]">
          {label}
        </p>
        <p className="mt-1 text-sm text-[color:var(--public-text)]">{value}</p>
      </div>
      <button
        onClick={onEdit}
        className="rounded-full border border-[color:var(--public-border)] bg-[rgba(255,251,245,0.76)] p-2 text-[color:var(--public-text-soft)] hover:text-[color:var(--public-text)]"
      >
        <Edit2 className="h-4 w-4" />
      </button>
    </motion.div>
  );
}

function StepIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mx-auto mb-8 max-w-2xl text-center">
      <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[color:var(--public-text-faint)]">
        {eyebrow}
      </p>
      <h2
        className="mt-4 text-4xl leading-[0.96] text-[color:var(--public-text)] md:text-5xl"
        style={{ fontFamily: "var(--font-public-display), serif" }}
      >
        {title}
      </h2>
      <p className="mt-4 text-sm leading-7 text-[color:var(--public-text-soft)] md:text-base">
        {description}
      </p>
    </div>
  );
}

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
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);

  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null,
  );
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(
    null,
  );
  const [selectedMasterId, setSelectedMasterId] = useState<number | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    comment: "",
  });
  const [formErrors, setFormErrors] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    consent: "",
  });

  useEffect(() => {
    Promise.all([
      categoryService.getAll(),
      serviceService.getAll(),
      masterService.getAll(),
      servicePriceService.getAll(),
      masterScheduleService.getAll(),
    ])
      .then(([cats, servs, masts, priceList, scheds]) => {
        setCategories(cats.filter((category) => category.isActive !== false));
        setServices(servs.filter((service) => service.isActive));
        setMasters(masts.filter((master) => master.isActive));
        setPrices(priceList.filter((price) => price.isActive !== false));
        setSchedules(scheds);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (preselectedServiceId && services.length > 0) {
      const serviceIdNum = Number(preselectedServiceId);
      const service = services.find((item) => item.id === serviceIdNum);

      if (service) {
        setSelectedServiceId(serviceIdNum);
        setSelectedCategoryId(
          service.categoryId || service.category?.id || null,
        );
      }
    }
  }, [preselectedServiceId, services]);

  const currentCategory = categories.find(
    (category) => category.id === selectedCategoryId,
  );
  const currentService = services.find(
    (service) => service.id === selectedServiceId,
  );
  const currentMaster = masters.find(
    (master) => master.id === selectedMasterId,
  );

  const filteredServices = useMemo(
    () =>
      !selectedCategoryId
        ? []
        : services.filter(
            (service) => service.categoryId === selectedCategoryId,
          ),
    [services, selectedCategoryId],
  );

  const availableMasters = useMemo(() => {
    if (!selectedServiceId) return [];
    const targetId = Number(selectedServiceId);
    const masterIdsFromPrices = prices
      .filter(
        (price) =>
          (price.serviceId ?? price.service?.id) === targetId &&
          price.isActive !== false,
      )
      .map((price) => Number(price.masterId ?? price.master?.id));
    return masters.filter((master) =>
      masterIdsFromPrices.includes(Number(master.id)),
    );
  }, [masters, prices, selectedServiceId]);

  const currentPrice = useMemo(() => {
    if (!selectedServiceId || !selectedMasterId) return 0;
    const found = prices.find((price) => {
      const serviceId = price.serviceId ?? price.service?.id;
      const masterId = price.masterId ?? price.master?.id;
      return (
        Number(serviceId) === Number(selectedServiceId) &&
        Number(masterId) === Number(selectedMasterId)
      );
    });
    return found?.price ?? 0;
  }, [prices, selectedServiceId, selectedMasterId]);

  const masterScheduleData = useMemo(() => {
    if (!selectedMasterId) return null;
    const masterSchedules = schedules.filter(
      (schedule) =>
        (schedule.masterId ?? schedule.master?.id) === selectedMasterId,
    );
    const dayKeys = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;
    const schedule: any = {
      mon: null,
      tue: null,
      wed: null,
      thu: null,
      fri: null,
      sat: null,
      sun: null,
    };

    masterSchedules.forEach((item) => {
      if (item.dayOfWeek == null) return;
      const key = dayKeys[item.dayOfWeek];
      if (!key) return;

      const start = item.startTime.includes("T")
        ? item.startTime.split("T")[1].slice(0, 5)
        : item.startTime.slice(0, 5);
      const end = item.endTime.includes("T")
        ? item.endTime.split("T")[1].slice(0, 5)
        : item.endTime.slice(0, 5);
      schedule[key] = { workingHours: { start, end }, appointments: [] };
    });

    return { masterId: selectedMasterId, schedule };
  }, [selectedMasterId, schedules]);

  const handleInput = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    const nextValue =
      name === "phone"
        ? formatPhoneNumber(value)
        : name === "firstName" || name === "lastName"
          ? sanitizePersonName(value)
          : value;

    setFormData((previous) => ({
      ...previous,
      [name]: nextValue,
    }));

    if (name === "firstName" || name === "lastName") {
      setFormErrors((previous) => ({
        ...previous,
        [name]:
          nextValue.trim() && !PERSON_NAME_REGEX.test(nextValue.trim())
            ? "Допустимы только буквы, пробел, дефис и апостроф"
            : "",
      }));
      return;
    }

    if (name === "phone") {
      setFormErrors((previous) => ({
        ...previous,
        phone:
          nextValue.replace(/\D/g, "").length >= 11 || !nextValue
            ? ""
            : "Введите телефон полностью",
      }));
    }
  };

  const validateForm = () => {
    const nextErrors = {
      firstName: "",
      lastName: "",
      phone: "",
      consent: "",
    };

    const trimmedFirstName = formData.firstName.trim();
    const trimmedLastName = formData.lastName.trim();
    const phoneDigits = formData.phone.replace(/\D/g, "");

    if (!trimmedLastName || !PERSON_NAME_REGEX.test(trimmedLastName)) {
      nextErrors.lastName =
        "Фамилия должна содержать только буквы, пробел, дефис или апостроф";
    }

    if (!trimmedFirstName || !PERSON_NAME_REGEX.test(trimmedFirstName)) {
      nextErrors.firstName =
        "Имя должно содержать только буквы, пробел, дефис или апостроф";
    }

    if (phoneDigits.length < 11) {
      nextErrors.phone = "Введите телефон в формате +7 (___) ___-__-__";
    }

    if (!consentAccepted) {
      nextErrors.consent =
        "Подтвердите согласие на обработку персональных данных";
    }

    setFormErrors(nextErrors);
    return !Object.values(nextErrors).some(Boolean);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (
      !selectedAppointment ||
      !selectedServiceId ||
      !selectedMasterId ||
      !validateForm()
    ) {
      return;
    }

    setSubmitting(true);

    try {
      const appointmentDate = new Date(
        `${selectedAppointment.day}T${selectedAppointment.time}:00`,
      );

      const dto = {
        serviceId: Number(selectedServiceId),
        masterId: Number(selectedMasterId),
        appointmentTime: appointmentDate.toISOString(),
        clientName: formData.firstName.trim(),
        clientSurname: formData.lastName.trim(),
        clientPhone: formData.phone.replace(/\D/g, ""),
        price: Number(currentPrice),
        comment: formData.comment?.trim() || undefined,
        status: AppointmentStatus.Новый,
      };

      await appointmentService.createPublic(dto);
      setSuccess(true);
    } catch (error: any) {
      if (
        error?.response?.status === 429 &&
        error?.response?.data?.code === "PUBLIC_APPOINTMENT_LIMIT_EXCEEDED"
      ) {
        setLimitExceeded(true);
        return;
      }

      alert(`Ошибка: ${errorCatch(error) || "Проверьте введенные данные"}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-[color:var(--public-accent-strong)]" />
      </div>
    );
  }

  return (
    <div className="overflow-x-hidden px-4 pb-24 pt-28">
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute left-[12%] top-[5%] h-[20rem] w-[20rem] rounded-full bg-[rgba(177,141,97,0.12)] blur-[120px]" />
        <div className="absolute bottom-[8%] right-[8%] h-[22rem] w-[22rem] rounded-full bg-[rgba(145,114,88,0.12)] blur-[130px]" />
      </div>

      <div className="container mx-auto max-w-6xl">
        <section className="mb-12 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <div className="public-pill inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[color:var(--public-text-soft)]">
              <CalendarCheck2 className="h-3.5 w-3.5 text-[color:var(--public-accent-strong)]" />
              Онлайн-запись
            </div>
            <h1
              className="mt-6 max-w-3xl text-5xl leading-[0.94] text-[color:var(--public-text)] md:text-7xl"
              style={{ fontFamily: "var(--font-public-display), serif" }}
            >
              Выберите услугу, мастера и удобное время без перегруза
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-[color:var(--public-text-soft)]">
              Последовательный сценарий записи, где каждое решение понятно, а
              календарь помогает выбрать слот без напряжения.
            </p>
          </div>

          <div className="public-panel-strong rounded-[34px] p-6">
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { icon: LayoutGrid, label: "Шаг 1", value: "Направление" },
                { icon: Scissors, label: "Шаг 2", value: "Услуга и мастер" },
                { icon: UserRound, label: "Шаг 3", value: "Дата и данные" },
              ].map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="rounded-[24px] border border-[color:var(--public-border)] bg-[rgba(255,252,247,0.74)] p-4"
                >
                  <Icon className="h-4 w-4 text-[color:var(--public-accent-strong)]" />
                  <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-[color:var(--public-text-faint)]">
                    {label}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[color:var(--public-text)]">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="flex min-h-[2rem] justify-center">
          <AnimatePresence>
            {preselectedServiceId && !selectedAppointment && (
              <motion.button
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onClick={() => {
                  window.history.replaceState(null, "", "/appointment");
                  setSelectedServiceId(null);
                  setSelectedCategoryId(null);
                  setSelectedMasterId(null);
                }}
                className="mb-8 inline-flex items-center gap-2 rounded-full border border-[color:var(--public-border)] bg-[rgba(255,251,245,0.76)] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--public-text-soft)] hover:text-[color:var(--public-text)]"
              >
                <ChevronLeft className="h-4 w-4" />
                Выбрать другую услугу
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        <div className="relative">
          <AnimatePresence mode="wait">
            {!selectedCategoryId && (
              <motion.section
                key="step1"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -14 }}
              >
                <StepIntro
                  eyebrow="Шаг 1"
                  title="Сначала выберите направление"
                  description="Так список услуг будет чище, а переход к записи быстрее и понятнее."
                />
                <div className="flex flex-wrap justify-center gap-3">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategoryId(category.id)}
                      className="rounded-full border border-[color:var(--public-border)] bg-[rgba(255,251,245,0.78)] px-7 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--public-text)] shadow-[var(--public-shadow-soft)] hover:border-[color:var(--public-border-strong)] hover:bg-[rgba(255,248,239,0.98)]"
                    >
                      {category.title}
                    </button>
                  ))}
                </div>
              </motion.section>
            )}

            {selectedCategoryId && !selectedServiceId && (
              <motion.section
                key="step2"
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -18 }}
              >
                <SelectionSummary
                  label="Направление"
                  value={currentCategory?.title || ""}
                  onEdit={() => setSelectedCategoryId(null)}
                />
                <StepIntro
                  eyebrow="Шаг 2"
                  title="Выберите услугу"
                  description="Карточки стали спокойнее и легче читаются, чтобы внимание шло на содержание, а не на фон."
                />
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredServices.map((service) => (
                    <div
                      key={service.id}
                      className="cursor-pointer active:scale-[0.99]"
                    >
                      <ServiceCard
                        service={service}
                        disableModal
                        onClick={() => setSelectedServiceId(service.id)}
                      />
                    </div>
                  ))}
                </div>
              </motion.section>
            )}

            {selectedServiceId && !selectedMasterId && (
              <motion.section
                key="step3"
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -18 }}
              >
                <SelectionSummary
                  label="Услуга"
                  value={currentService?.title || ""}
                  onEdit={() => setSelectedServiceId(null)}
                />
                <StepIntro
                  eyebrow="Шаг 3"
                  title="Теперь выберите мастера"
                  description="У каждого мастера показана специализация и актуальная стоимость именно для этой услуги."
                />
                <div className="mx-auto grid max-w-4xl gap-4 md:grid-cols-2">
                  {availableMasters.map((master) => {
                    const priceObj = prices.find(
                      (price) =>
                        (price.serviceId ?? price.service?.id) ===
                          selectedServiceId &&
                        (price.masterId ?? price.master?.id) === master.id,
                    );

                    return (
                      <button
                        key={master.id}
                        onClick={() => setSelectedMasterId(master.id)}
                        className="public-panel flex items-center gap-4 rounded-[28px] p-5 text-left hover:border-[color:var(--public-border-strong)]"
                      >
                        <img
                          src={master.photo || "/avatar-placeholder.png"}
                          className="h-20 w-20 rounded-full object-cover"
                          alt=""
                        />
                        <div>
                          <p
                            className="text-3xl leading-none text-[color:var(--public-text)]"
                            style={{
                              fontFamily: "var(--font-public-display), serif",
                            }}
                          >
                            {master.surname} {master.name}
                          </p>
                          <p className="mt-2 text-sm leading-6 text-[color:var(--public-text-soft)]">
                            {master.specialization}
                          </p>
                          <p className="mt-3 text-sm font-semibold text-[color:var(--public-accent-strong)]">
                            {priceObj?.price.toLocaleString()} ₽
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.section>
            )}

            {selectedMasterId && !selectedAppointment && (
              <motion.section
                key="step4"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -18 }}
              >
                <SelectionSummary
                  label="Мастер"
                  value={`${currentMaster?.surname} ${currentMaster?.name}`}
                  onEdit={() => setSelectedMasterId(null)}
                />
                <div className="mx-auto max-w-4xl">
                  <BeautyCalendar
                    selectedMasterId={selectedMasterId}
                    selectedMasterSchedule={masterScheduleData}
                    selectedAppointment={selectedAppointment}
                    handleTimeClick={(masterId, day, time) =>
                      setSelectedAppointment({ masterId, day, time })
                    }
                  />
                </div>
              </motion.section>
            )}

            {selectedAppointment && (
              <motion.section
                key="step5"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                className="mx-auto max-w-xl"
              >
                <div className="public-panel-strong mb-8 rounded-[30px] p-6">
                  <div className="flex items-center justify-between gap-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--public-text-faint)]">
                    <span>{currentService?.title}</span>
                    <span>{currentPrice.toLocaleString()} ₽</span>
                  </div>
                  <div className="mt-4 flex flex-col gap-2 text-sm text-[color:var(--public-text)]">
                    <span>
                      {currentMaster?.surname} {currentMaster?.name}
                    </span>
                    <span className="text-[color:var(--public-text-soft)]">
                      {selectedAppointment.day}, {selectedAppointment.time}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedAppointment(null)}
                    className="mt-4 inline-flex items-center gap-1 text-sm text-[color:var(--public-accent-strong)]"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    Изменить время
                  </button>
                </div>

                <StepIntro
                  eyebrow="Последний шаг"
                  title="Оставьте данные для записи"
                  description="Минимум полей, спокойная форма и понятное подтверждение после отправки."
                />

                <form
                  onSubmit={handleSubmit}
                  className="public-panel rounded-[30px] p-6 md:p-7"
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <input
                        name="lastName"
                        placeholder="Фамилия"
                        value={formData.lastName}
                        onChange={handleInput}
                        required
                        className="w-full rounded-2xl border border-[color:var(--public-border)] bg-[rgba(255,252,247,0.82)] px-4 py-4 text-[color:var(--public-text)] outline-none placeholder:text-[color:var(--public-text-faint)] focus:border-[color:var(--public-border-strong)]"
                      />
                      {formErrors.lastName && (
                        <p className="mt-2 text-xs text-red-500">
                          {formErrors.lastName}
                        </p>
                      )}
                    </div>
                    <div>
                      <input
                        name="firstName"
                        placeholder="Имя"
                        value={formData.firstName}
                        onChange={handleInput}
                        required
                        className="w-full rounded-2xl border border-[color:var(--public-border)] bg-[rgba(255,252,247,0.82)] px-4 py-4 text-[color:var(--public-text)] outline-none placeholder:text-[color:var(--public-text-faint)] focus:border-[color:var(--public-border-strong)]"
                      />
                      {formErrors.firstName && (
                        <p className="mt-2 text-xs text-red-500">
                          {formErrors.firstName}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <input
                      name="phone"
                      placeholder="Телефон"
                      value={formData.phone}
                      onChange={handleInput}
                      required
                      className="mt-4 w-full rounded-2xl border border-[color:var(--public-border)] bg-[rgba(255,252,247,0.82)] px-4 py-4 text-[color:var(--public-text)] outline-none placeholder:text-[color:var(--public-text-faint)] focus:border-[color:var(--public-border-strong)]"
                    />
                    {formErrors.phone && (
                      <p className="mt-2 text-xs text-red-500">
                        {formErrors.phone}
                      </p>
                    )}
                  </div>

                  <textarea
                    name="comment"
                    value={formData.comment}
                    placeholder="Комментарий к записи"
                    onChange={handleInput}
                    rows={4}
                    className="mt-4 w-full resize-none rounded-2xl border border-[color:var(--public-border)] bg-[rgba(255,252,247,0.82)] px-4 py-4 text-[color:var(--public-text)] outline-none placeholder:text-[color:var(--public-text-faint)] focus:border-[color:var(--public-border-strong)]"
                  />

                  <div className="mt-4 rounded-[24px] border border-[color:var(--public-border)] bg-[rgba(255,248,239,0.76)] p-4 sm:p-5">
                    <div className="flex-1">
                      <ConsentCheckbox
                        checked={consentAccepted}
                        onChange={(checked) => {
                          setConsentAccepted(checked);
                          setFormErrors((previous) => ({
                            ...previous,
                            consent: checked ? "" : previous.consent,
                          }));
                        }}
                        title="Подтверждаю согласие на обработку персональных данных и ознакомление с условиями записи."
                        caption="Перед отправкой формы можно открыть и прочитать политику конфиденциальности и публичную оферту."
                      />
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <button
                          type="button"
                          onClick={() => setIsPrivacyModalOpen(true)}
                          className="min-w-0 rounded-2xl border border-[color:var(--public-border)] px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--public-text-soft)] transition hover:text-[color:var(--public-text)]"
                        >
                          Политика конфиденциальности
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsOfferModalOpen(true)}
                          className="min-w-0 rounded-2xl border border-[color:var(--public-border)] px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--public-text-soft)] transition hover:text-[color:var(--public-text)]"
                        >
                          Публичная оферта
                        </button>
                      </div>
                      {formErrors.consent && (
                        <p className="mt-3 text-xs text-red-500">
                          {formErrors.consent}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="mt-6 flex w-full items-center justify-center gap-3 rounded-2xl bg-[color:var(--public-accent)] px-5 py-4 text-base font-semibold text-[oklch(0.98_0.005_75)] shadow-[var(--public-shadow-soft)] hover:bg-[color:var(--public-accent-strong)]"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Бронируем...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5" />
                        Записаться
                      </>
                    )}
                  </button>
                </form>
              </motion.section>
            )}
          </AnimatePresence>
        </div>
      </div>

      {success && currentService && currentMaster && selectedAppointment && (
        <NotificationWindow
          onClose={() => {
            setSuccess(false);
            router.push("/");
          }}
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

      <LegalDocumentModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
        title="Политика конфиденциальности"
        subtitle="Документ описывает, какие персональные данные собираются при онлайн-записи, зачем они нужны и как пользователь может управлять своими правами."
        effectiveDate="14 мая 2026"
        sections={privacyPolicySections}
      />

      <LegalDocumentModal
        isOpen={isOfferModalOpen}
        onClose={() => setIsOfferModalOpen(false)}
        title="Публичная оферта"
        subtitle="Документ фиксирует условия онлайн-записи, общие правила оказания услуг и базовые обязанности исполнителя и клиента."
        effectiveDate="14 мая 2026"
        sections={publicOfferSections}
      />
    </div>
  );
}

export default function AppointmentPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-7 w-7 animate-spin text-[color:var(--public-accent-strong)]" />
        </div>
      }
    >
      <AppointmentContent />
    </Suspense>
  );
}
