"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { serviceService } from "@/services/service/service.service";
import { masterService } from "@/services/master/master.service";
import { IService } from "@/types/services.types";
import { IMaster } from "@/types/masters.type";
import ServiceCard from "./serviceCard";
import CategoryFilter from "./CategoryFilter";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";

// Конфигурация анимации для сетки
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08, // Каждая карточка появляется с задержкой
    },
  },
};

export default function ServicesPage() {
  const searchParams = useSearchParams();
  const preselectedServiceId = searchParams.get("serviceId");


  const [services, setServices] = useState<IService[]>([]);
  const [masters, setMasters] = useState<IMaster[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);


  useEffect(() => {
    if (preselectedServiceId && services.length > 0) {
      const serviceIdNum = Number(preselectedServiceId);
      const service = services.find(s => s.id === serviceIdNum);

      if (service) {
        setSelectedServiceId(serviceIdNum);
        setSelectedCategoryId(service.categoryId || service.category?.id || null);

        setTimeout(() => {
          window.scrollTo({top: 400, behavior: 'smooth'})
        }, 100);
      }
    }
  }, [preselectedServiceId, services]);


  useEffect(() => {
    Promise.all([serviceService.getAll(), masterService.getAll()])
      .then(([servicesData, mastersData]) => {
        setServices(servicesData.filter((s) => s.isActive));
        setMasters(mastersData.filter((m) => m.isActive));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const map = new Map<number, { id: number; title: string }>();
    services.forEach((s) => {
      const cat = s.category || (s as any).Category; // На случай разных имен в DTO
      if (cat && !map.has(cat.id)) {
        map.set(cat.id, { id: cat.id, title: cat.title });
      }
    });
    return Array.from(map.values());
  }, [services]);

  const filteredServices = useMemo(() => {
    if (!selectedCategoryId) return services;
    return services.filter((s) => {
      const catId = s.category?.id || s.categoryId;
      return catId === selectedCategoryId;
    });
  }, [services, selectedCategoryId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <Loader2 className="w-7 h-7 text-[#C8A97E] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080808] text-[#F0EBE3] pb-24 relative overflow-x-hidden">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#C8A97E]/5 rounded-full blur-[180px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#C8A97E]/3 rounded-full blur-[150px]" />
      </div>

      <div className="container mx-auto px-4 max-w-7xl pt-32">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-14 text-center"
        >
          <p className="text-[10px] text-[#6B6560] uppercase tracking-[0.25em] mb-4">Салон красоты Эден</p>
          <h1 className="text-5xl md:text-7xl font-light text-[#F0EBE3] tracking-tight mb-5" style={{ fontFamily: "serif" }}>
            Наши Услуги
          </h1>
          <div className="flex items-center justify-center gap-4">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#C8A97E]/40" />
            <span className="text-[11px] text-[#6B6560] uppercase tracking-widest">
              {masters.length} мастеров · {services.length} услуг
            </span>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#C8A97E]/40" />
          </div>
        </motion.div>

        {/* Filter */}
        <div className="mb-16">
          <CategoryFilter
            categories={categories}
            selectedId={selectedCategoryId}
            onSelect={setSelectedCategoryId}
          />
        </div>

        {/* Services grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedCategoryId || "all"}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredServices.length > 0 ? (
              filteredServices.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))
            ) : (
              <motion.div className="col-span-full py-24 text-center">
                <p className="text-sm text-[#6B6560]">В этой категории пока нет услуг</p>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        
      </div>
    </div>
  );
}