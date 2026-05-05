"use client";

import { useState } from "react";
import { motion, Variants, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Clock, MoveUpRight, X, CalendarCheck } from "lucide-react";
import { IService } from "@/types/services.types";
import { routes } from "@/app/providers/routes";
import { usePathname } from "next/navigation";

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.5, ease: "easeOut" } 
  }
};

export default function ServiceCard({ service, price }: { service: IService; price?: number }) {
  const pathname = usePathname();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const displayPrice = price !== undefined ? `${price.toLocaleString("ru-RU")} ₽` : "По запросу";

  return (
    <>
      <motion.div variants={itemVariants} layout className="h-full">
        {/* Вместо Link теперь используем div с обработчиком клика */}
        <div 
          onClick={() => setIsModalOpen(true)}
          className="group block h-full cursor-pointer outline-none"
        >
          <article className="relative h-full flex flex-col overflow-hidden rounded-3xl bg-[#0e0e0e] border border-white/5 hover:border-[#C8A97E]/30 transition-all duration-500 hover:shadow-[0_20px_40px_-20px_rgba(200,169,126,0.25)]">
            
            {/* Image Section */}
            <div className="relative h-56 overflow-hidden bg-[#111]">
              <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e0e] via-transparent to-transparent z-10" />
              {service.img ? (
                <img 
                  src={service.img} 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                  alt={service.title} 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl font-serif text-[#1a1a1a] uppercase">
                  {service.title[0]}
                </div>
              )}
              
              {service.category && (
                <div className="absolute top-4 left-4 z-20">
                  <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-bold uppercase tracking-widest text-[#C8A97E]">
                    {service.category.title}
                  </span>
                </div>
              )}
            </div>

            {/* Content Section */}
            <div className="p-6 flex flex-col flex-grow">
              <h3 className="text-lg font-medium text-[#F0EBE3] mb-3 group-hover:text-[#C8A97E] transition-colors line-clamp-1">
                {service.title}
              </h3>
              <p className="text-sm text-[#6B6560] line-clamp-2 mb-6 leading-relaxed">
                {service.description || "Премиальный уход и внимание к каждой детали вашего образа."}
              </p>

              <div className="mt-auto pt-5 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#6B6560]">
                  <Clock className="w-4 h-4 text-[#C8A97E]/50" />
                  <span className="text-xs">{service.duration} мин</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold text-[#F0EBE3]">{displayPrice}</span>
                  <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-[#C8A97E] group-hover:text-[#1a1208] transition-all">
                    <MoveUpRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          </article>
        </div>
      </motion.div>

      {/* MODAL WINDOW */}
      <AnimatePresence>
        {isModalOpen && pathname != routes.APPOINTMENT  &&(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            {/* Modal Content */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-[#0e0e0e] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl"
            >
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 z-30 p-2 bg-black/50 hover:bg-black text-white/70 hover:text-white rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col md:flex-row">
                {/* Modal Image */}
                <div className="w-full md:w-1/2 h-64 md:h-auto bg-[#111] relative">
                  {service.img ? (
                    <img src={service.img} className="w-full h-full object-cover" alt={service.title} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl font-serif text-[#1a1a1a] uppercase">
                      {service.title[0]}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0e0e0e]/50 md:from-transparent to-transparent" />
                </div>

                {/* Modal Text */}
                <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C8A97E] mb-4">
                    {service.category?.title || "Услуга"}
                  </span>
                  <h2 className="text-2xl md:text-3xl font-light text-[#F0EBE3] mb-4 leading-tight" style={{ fontFamily: "serif" }}>
                    {service.title}
                  </h2>
                  <p className="text-sm text-[#6B6560] leading-relaxed mb-8">
                    {service.description || "Индивидуальный подход и премиальные материалы. Мы заботимся о том, чтобы каждый визит в наш салон приносил вам не только результат, но и удовольствие от процесса."}
                  </p>

                  <div className="space-y-4 mb-8">
                    <div className="flex items-center justify-between text-sm border-b border-white/5 pb-2">
                      <span className="text-[#3D3A38]">Длительность</span>
                      <span className="text-[#F0EBE3]">{service.duration} минут</span>
                    </div>
                    <div className="flex items-center justify-between text-sm border-b border-white/5 pb-2">
                      <span className="text-[#3D3A38]">Стоимость</span>
                      <span className="text-[#C8A97E] font-bold">{displayPrice}</span>
                    </div>
                  </div>

                  <Link 
                    href={`${routes.APPOINTMENT}?serviceId=${service.id}`}
                    className="mt-auto flex items-center justify-center gap-3 w-full bg-[#C8A97E] text-[#1a1208] py-4 rounded-2xl font-bold hover:shadow-[0_10px_25px_-5px_rgba(200,169,126,0.4)] transition-all active:scale-95"
                  >
                    <CalendarCheck className="w-5 h-5" />
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