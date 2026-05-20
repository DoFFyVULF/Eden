"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { X, CalendarCheck } from "lucide-react";
import { IService } from "@/types/services.types";
import { routes } from "@/app/providers/routes";
import { usePathname } from "next/navigation";

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: IService;
  price: string;
}

export default function ServiceModal({ isOpen, onClose, service, price }: ServiceModalProps) {
  const pathname = usePathname();

  // Блокируем скролл body, когда модалка открыта
  if (typeof document !== 'undefined') {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
  }

  return (
    <AnimatePresence>
      {isOpen && pathname !== routes.APPOINTMENT && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[rgba(83,64,46,0.4)] backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-4xl overflow-hidden rounded-[34px] border border-[color:var(--public-border)] bg-[#FDFBF7] shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 z-30 rounded-full border border-[color:var(--public-border)] bg-white/80 p-2 text-[color:var(--public-text-soft)] hover:text-[color:var(--public-text)] backdrop-blur-md transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="grid md:grid-cols-[1.05fr_0.95fr]">
              <div className="relative h-64 md:h-auto min-h-[320px] bg-[rgba(233,223,210,0.48)]">
                {service.img ? (
                  <img src={service.img} className="h-full w-full object-cover" alt={service.title} />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-7xl text-[color:var(--public-text-faint)] font-display">
                    {service.title[0]}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-4 p-8 md:p-10">
                <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[color:var(--public-text-faint)]">
                  {service.category?.title || "Услуга"}
                </span>
                <h2 className="mt-2 text-3xl md:text-4xl leading-none text-[color:var(--public-text)] font-display">
                  {service.title}
                </h2>
                <p className="mt-4 text-sm leading-7 text-[color:var(--public-text-soft)]">
                  {service.description || "Индивидуальный темп и внимательная работа мастера."}
                </p>

                <div className="mt-6 space-y-3 rounded-[24px] border border-[color:var(--public-border)] bg-white/60 p-5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[color:var(--public-text-soft)]">Длительность</span>
                    <span className="font-medium text-[color:var(--public-text)]">{service.duration} минут</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[color:var(--public-text-soft)]">Стоимость</span>
                    <span className="font-bold text-lg text-[color:var(--public-accent-strong)]">{price}</span>
                  </div>
                </div>

                <Link
                  href={`${routes.APPOINTMENT}?serviceId=${service.id}`}
                  onClick={onClose}
                  className="mt-auto flex items-center justify-center gap-3 rounded-2xl bg-[color:var(--public-accent)] px-5 py-4 text-sm font-semibold text-white shadow-lg hover:bg-[color:var(--public-accent-strong)] transition-colors"
                >
                  <CalendarCheck className="h-5 w-5" />
                  Записаться онлайн
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}