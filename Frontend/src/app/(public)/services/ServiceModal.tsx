"use client";

import { useEffect } from "react";
import { LazyMotion, domAnimation, m, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { X, CalendarCheck } from "lucide-react";
import { IService } from "@/types/services.types";
import { routes } from "@/app/providers/routes";
import { usePathname } from "next/navigation";
import SafeImage from "@/app/components/ui/SafeImage";

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: IService;
  price: string;
}

export default function ServiceModal({ isOpen, onClose, service, price }: ServiceModalProps) {
  const pathname = usePathname();

  useEffect(() => {
    if (!isOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [isOpen]);

  return (
    <LazyMotion features={domAnimation}>
      <AnimatePresence>
        {isOpen && pathname !== routes.APPOINTMENT && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-[rgba(83,64,46,0.4)] backdrop-blur-sm"
            />

            <m.div
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
                <div className="relative h-64 md:h-auto min-h-[320px] overflow-hidden bg-[rgba(233,223,210,0.48)]">
                  <SafeImage
                    src={service.img || null}
                    alt={service.title}
                    fallbackTitle={service.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
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
            </m.div>
          </div>
        )}
      </AnimatePresence>
    </LazyMotion>
  );
}
