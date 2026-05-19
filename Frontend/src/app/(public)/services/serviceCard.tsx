"use client";

import { useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import Link from "next/link";
import { Clock3, MoveUpRight, X, CalendarCheck } from "lucide-react";
import { IService } from "@/types/services.types";
import { routes } from "@/app/providers/routes";
import { usePathname } from "next/navigation";

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut" },
  },
};

export default function ServiceCard({
  service,
  price,
}: {
  service: IService;
  price?: number;
}) {
  const pathname = usePathname();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const displayPrice =
    price !== undefined ? `${price.toLocaleString("ru-RU")} ₽` : "По запросу";

  return (
    <>
      <motion.div variants={itemVariants} layout className="h-full">
        <div
          onClick={() => setIsModalOpen(true)}
          className="group block h-full cursor-pointer outline-none"
        >
          <article className="public-panel h-full overflow-hidden rounded-[30px]">
            <div className="relative h-56 overflow-hidden bg-[rgba(232,223,212,0.52)]">
              {service.img ? (
                <img
                  src={service.img}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  alt={service.title}
                />
              ) : (
                <div
                  className="flex h-full w-full items-center justify-center text-6xl text-[color:var(--public-text-faint)]"
                  style={{ fontFamily: "var(--font-public-display), serif" }}
                >
                  {service.title[0]}
                </div>
              )}
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,251,245,0.02),rgba(94,71,53,0.22))]" />

              {service.category && (
                <span className="absolute left-4 top-4 rounded-full border border-[rgba(255,250,244,0.45)] bg-[rgba(251,246,239,0.82)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[color:var(--public-text-soft)]">
                  {service.category.title}
                </span>
              )}
            </div>

            <div className="flex h-[calc(100%-14rem)] flex-col p-6">
              <div className="flex items-start justify-between gap-4">
                <h3
                  className="text-2xl leading-tight text-[color:var(--public-text)]"
                  style={{ fontFamily: "var(--font-public-display), serif" }}
                >
                  {service.title}
                </h3>
                <div className="rounded-full bg-[rgba(255,250,244,0.78)] p-2 text-[color:var(--public-text-soft)] transition-colors group-hover:text-[color:var(--public-accent-strong)]">
                  <MoveUpRight className="h-4 w-4" />
                </div>
              </div>

              <p className="mt-3 text-sm leading-7 text-[color:var(--public-text-soft)]">
                {service.description ||
                  "Выверенная техника, спокойный сервис и результат, который ощущается естественно."}
              </p>

              <div className="mt-auto flex items-end justify-between border-t border-[color:var(--public-border)] pt-5">
                <div className="flex items-center gap-2 text-sm text-[color:var(--public-text-soft)]">
                  <Clock3 className="h-4 w-4 text-[color:var(--public-accent-strong)]" />
                  <span>{service.duration} мин</span>
                </div>
                <p className="text-base font-semibold text-[color:var(--public-text)]">
                  {displayPrice}
                </p>
              </div>
            </div>
          </article>
        </div>
      </motion.div>

      <AnimatePresence>
        {isModalOpen && pathname !== routes.APPOINTMENT && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-[rgba(83,64,46,0.34)] backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              className="relative w-full max-w-4xl overflow-hidden rounded-[34px] border border-[color:var(--public-border)] bg-[rgba(251,246,239,0.98)] shadow-[var(--public-shadow)]"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute right-5 top-5 z-30 rounded-full border border-[color:var(--public-border)] bg-[rgba(255,251,245,0.84)] p-2 text-[color:var(--public-text-soft)] hover:text-[color:var(--public-text)]"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="grid md:grid-cols-[1.05fr_0.95fr]">
                <div className="relative min-h-[320px] bg-[rgba(233,223,210,0.48)]">
                  {service.img ? (
                    <img src={service.img} className="h-full w-full object-cover" alt={service.title} />
                  ) : (
                    <div
                      className="flex h-full w-full items-center justify-center text-7xl text-[color:var(--public-text-faint)]"
                      style={{ fontFamily: "var(--font-public-display), serif" }}
                    >
                      {service.title[0]}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-4 p-8 md:p-10">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[color:var(--public-text-faint)]">
                    {service.category?.title || "Услуга"}
                  </span>
                  <h2
                    className="mt-4 text-4xl leading-none text-[color:var(--public-text)]"
                    style={{ fontFamily: "var(--font-public-display), serif" }}
                  >
                    {service.title}
                  </h2>
                  <p className="mt-5 text-sm leading-7 text-[color:var(--public-text-soft)]">
                    {service.description ||
                      "Индивидуальный темп, внимательная работа мастера и сервис, который помогает расслабиться и почувствовать результат уже в процессе."}
                  </p>

                  <div className="mt-8 space-y-4 rounded-[24px] border border-[color:var(--public-border)] bg-[rgba(255,252,247,0.72)] p-5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[color:var(--public-text-soft)]">Длительность</span>
                      <span className="text-[color:var(--public-text)]">{service.duration} минут</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[color:var(--public-text-soft)]">Стоимость</span>
                      <span className="font-semibold text-[color:var(--public-accent-strong)]">{displayPrice}</span>
                    </div>
                  </div>

                  <Link
                    href={`${routes.APPOINTMENT}?serviceId=${service.id}`}
                    className="mt-auto flex items-center justify-center gap-3 rounded-2xl bg-[color:var(--public-accent)] px-5 py-4 text-sm font-semibold text-[oklch(0.98_0.005_75)] shadow-[var(--public-shadow-soft)] hover:bg-[color:var(--public-accent-strong)]"
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
    </>
  );
}