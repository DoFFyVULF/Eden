"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { m, useReducedMotion } from "framer-motion";
import { Clock3, MoveUpRight } from "lucide-react";
import { IService } from "@/types/services.types";

const ServiceModal = dynamic(() => import("./ServiceModal"));

interface ServiceCardProps {
  service: IService;
  disableModal?: boolean;
  onClick?: () => void;
}

export default function ServiceCard({
  service,
  disableModal = false,
  onClick,
}: ServiceCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const reduceMotion = useReducedMotion();

  // Безопасное получение цены
  const displayPrice = service.price
    ? `${service.price.toLocaleString("ru-RU")} ₽`
    : "По запросу";

  const handleCardClick = () => {
    if (disableModal) {
      onClick?.();
      return;
    }

    setIsModalOpen(true);
  };

  return (
    <>
      <m.div
        className="h-full"
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0.12 : 0.22, ease: "easeOut" }}
      >
        <div
          onClick={handleCardClick}
          className="group block h-full cursor-pointer outline-none"
        >
          <article className="public-panel h-full overflow-hidden rounded-[30px] bg-white border border-[color:var(--public-border)] hover:shadow-lg transition-shadow duration-300">
            <div className="relative h-56 overflow-hidden bg-[rgba(232,223,212,0.52)]">
              {service.img ? (
                <img
                  src={service.img}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  alt={service.title}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-6xl text-[color:var(--public-text-faint)] font-display">
                  {service.title[0]}
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[rgba(94,71,53,0.22)]" />

              {service.category && (
                <span className="absolute left-4 top-4 rounded-full border border-[rgba(255,250,244,0.45)] bg-[rgba(251,246,239,0.9)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[color:var(--public-text-soft)] backdrop-blur-sm">
                  {service.category.title}
                </span>
              )}
            </div>

            <div className="flex h-[calc(100%-14rem)] flex-col p-6">
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-2xl leading-tight text-[color:var(--public-text)] font-display">
                  {service.title}
                </h3>
                <div className="rounded-full bg-[rgba(255,250,244,0.78)] p-2 text-[color:var(--public-text-soft)] transition-colors group-hover:text-[color:var(--public-accent-strong)] group-hover:bg-white">
                  <MoveUpRight className="h-4 w-4" />
                </div>
              </div>

              <p className="mt-3 text-sm leading-7 text-[color:var(--public-text-soft)] line-clamp-3">
                {service.description || "Выверенная техника и спокойный сервис."}
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
      </m.div>

      {!disableModal && (
        <ServiceModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          service={service}
          price={displayPrice}
        />
      )}
    </>
  );
}
