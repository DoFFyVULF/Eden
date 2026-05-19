"use client";

import { motion } from "framer-motion";
import {
  X,
  CheckCircle2,
  Calendar,
  User,
  Scissors,
  Phone,
  Sparkles,
} from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { formatPhoneNumber } from "@/app/lib/formatPhoneNumber";

interface NotificationWindowProps {
  onClose: () => void;
  serviceTitle: string;
  servicePrice: number;
  appointmentDate: Date;
  appointmentTime: string;
  appointmentMaster: string;
  clientPhone?: string; // Добавил опционально, если захотите выводить
}

export default function NotificationWindow({
  onClose,
  serviceTitle,
  servicePrice,
  appointmentDate,
  appointmentTime,
  appointmentMaster,
  clientPhone
}: NotificationWindowProps) {
  
  // Форматируем дату красиво на русском, как в календаре
  const formattedDate = format(appointmentDate, "EEEE, d MMMM yyyy", {
    locale: ru,
  });

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-[rgba(38,23,12,0.42)] p-4 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 18, scale: 0.98 }}
        transition={{ duration: 0.22 }}
        className="relative w-full max-w-lg overflow-hidden rounded-[34px] border border-[color:var(--public-border)] bg-[rgba(255,252,247,0.98)] p-8 shadow-[0_32px_80px_rgba(56,35,15,0.22)]"
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[8%] top-[8%] h-32 w-32 rounded-full bg-[rgba(177,141,97,0.12)] blur-[70px]" />
          <div className="absolute bottom-[8%] right-[10%] h-36 w-36 rounded-full bg-[rgba(145,114,88,0.14)] blur-[85px]" />
        </div>

        <button
          onClick={onClose}
          className="absolute right-6 top-6 z-10 rounded-full border border-[color:var(--public-border)] bg-[rgba(255,251,245,0.76)] p-2 text-[color:var(--public-text-soft)] transition hover:text-[color:var(--public-text)]"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="relative z-10 mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-[rgba(177,141,97,0.24)] bg-[rgba(177,141,97,0.12)]">
          <CheckCircle2 className="h-10 w-10 text-[color:var(--public-accent-strong)]" />
        </div>

        <div className="relative z-10 text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-[color:var(--public-border)] bg-[rgba(255,251,245,0.72)] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[color:var(--public-text-soft)]">
            <Sparkles className="h-3.5 w-3.5 text-[color:var(--public-accent-strong)]" />
            Онлайн-запись оформлена
          </p>
          <h2
            className="mt-5 text-4xl leading-[0.96] text-[color:var(--public-text)]"
            style={{ fontFamily: "var(--font-public-display), serif" }}
          >
            Запись подтверждена
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-[color:var(--public-text-soft)]">
            Все детали сохранены. Если планы изменятся, администратор сможет быстро
            помочь с переносом времени.
          </p>
        </div>

        <div className="relative z-10 mt-8 rounded-[30px] border border-[color:var(--public-border)] bg-[rgba(255,251,245,0.78)] p-6">
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--public-border)] bg-[rgba(255,255,255,0.72)]">
                <Scissors className="h-4 w-4 text-[color:var(--public-accent-strong)]" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--public-text-faint)]">
                  Услуга
                </p>
                <p className="mt-1 text-sm text-[color:var(--public-text)]">{serviceTitle}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--public-border)] bg-[rgba(255,255,255,0.72)]">
                <User className="h-4 w-4 text-[color:var(--public-accent-strong)]" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--public-text-faint)]">
                  Мастер
                </p>
                <p className="mt-1 text-sm text-[color:var(--public-text)]">{appointmentMaster}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--public-border)] bg-[rgba(255,255,255,0.72)]">
                <Calendar className="h-4 w-4 text-[color:var(--public-accent-strong)]" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--public-text-faint)]">
                  Дата и время
                </p>
                <p className="mt-1 text-sm capitalize text-[color:var(--public-text)]">
                  {formattedDate} в {appointmentTime}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--public-border)] bg-[rgba(255,255,255,0.72)]">
                <Phone className="h-4 w-4 text-[color:var(--public-accent-strong)]" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--public-text-faint)]">
                  Контакт
                </p>
                <div>
                  <p className="mt-1 text-sm text-[color:var(--public-text)]">
                    {clientPhone ? formatPhoneNumber(clientPhone) : "Номер сохранён в записи"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="my-5 h-px bg-[color:var(--public-border)]" />

          <div className="flex items-center justify-between gap-4">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--public-text-faint)]">
              К оплате
            </span>
            <span className="text-2xl font-semibold text-[color:var(--public-accent-strong)]">
              {servicePrice.toLocaleString("ru-RU")} ₽
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="relative z-10 mt-8 flex w-full items-center justify-center gap-3 rounded-2xl bg-[color:var(--public-accent)] px-5 py-4 text-base font-semibold text-[oklch(0.98_0.005_75)] shadow-[var(--public-shadow-soft)] transition hover:bg-[color:var(--public-accent-strong)]"
        >
          Готово
        </button>
      </motion.div>
    </div>
  );
}
