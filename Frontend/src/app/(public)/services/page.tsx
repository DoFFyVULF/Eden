"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { serviceService } from "@/services/service/service.service";
import { masterService } from "@/services/master/master.service";
import { IService } from "@/types/services.types";
import { IMaster } from "@/types/masters.type";
import ServiceCard from "./serviceCard";
import CategoryFilter from "./CategoryFilter";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

function ServicesPageFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-7 w-7 animate-spin text-[color:var(--public-accent-strong)]" />
    </div>
  );
}

function ServicesPageContent() {
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
      const service = services.find((item) => item.id === serviceIdNum);

      if (service) {
        setSelectedServiceId(serviceIdNum);
        setSelectedCategoryId(service.categoryId || service.category?.id || null);

        setTimeout(() => {
          window.scrollTo({ top: 360, behavior: "smooth" });
        }, 100);
      }
    }
  }, [preselectedServiceId, services]);

  useEffect(() => {
    Promise.all([serviceService.getAll(), masterService.getAll()])
      .then(([servicesData, mastersData]) => {
        setServices(servicesData.filter((service) => service.isActive));
        setMasters(mastersData.filter((master) => master.isActive));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const map = new Map<number, { id: number; title: string }>();
    services.forEach((service) => {
      const category = service.category || (service as any).Category;
      if (category && !map.has(category.id)) {
        map.set(category.id, { id: category.id, title: category.title });
      }
    });
    return Array.from(map.values());
  }, [services]);

  const filteredServices = useMemo(() => {
    if (!selectedCategoryId) {
      return services;
    }

    return services.filter((service) => {
      const categoryId = service.category?.id || service.categoryId;
      return categoryId === selectedCategoryId;
    });
  }, [services, selectedCategoryId]);

  if (loading) {
    return <ServicesPageFallback />;
  }

  return (
    <div className="overflow-x-hidden pb-24 pt-28 text-[color:var(--public-text)]">
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute left-[8%] top-0 h-[24rem] w-[24rem] rounded-full bg-[rgba(177,141,97,0.12)] blur-[120px]" />
        <div className="absolute bottom-[10%] right-[6%] h-[22rem] w-[22rem] rounded-full bg-[rgba(148,119,92,0.11)] blur-[120px]" />
      </div>

      <section className="container mx-auto max-w-7xl px-4">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[color:var(--public-text-faint)]">
              Каталог услуг
            </p>
            <h1
              className="mt-5 max-w-3xl text-5xl leading-[0.96] text-[color:var(--public-text)] md:text-7xl"
              style={{ fontFamily: "var(--font-public-display), serif" }}
            >
              Услуги, в которых важны и результат, и ощущение процесса
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-[color:var(--public-text-soft)]">
              Спокойный luxury-подход: без визуального шума, с понятным каталогом,
              живыми описаниями и удобным переходом в запись.
            </p>
          </div>

          <div className="public-panel-strong rounded-[32px] p-6">
            <div className="grid gap-5 sm:grid-cols-3">
              {[
                { value: services.length, label: "Услуг" },
                { value: masters.length, label: "Мастеров" },
                { value: categories.length, label: "Направлений" },
              ].map((item) => (
                <div key={item.label}>
                  <p
                    className="text-4xl text-[color:var(--public-text)]"
                    style={{ fontFamily: "var(--font-public-display), serif" }}
                  >
                    {item.value}
                  </p>
                  <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[color:var(--public-text-faint)]">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 rounded-[34px] border border-[color:var(--public-border)] bg-[rgba(255,250,244,0.62)] p-4 md:p-5">
          <CategoryFilter
            categories={categories}
            selectedId={selectedCategoryId}
            onSelect={setSelectedCategoryId}
          />
        </div>

        {selectedServiceId && (
          <div className="mt-6 rounded-[28px] border border-[color:var(--public-border)] bg-[rgba(255,252,247,0.68)] px-5 py-4 text-sm leading-7 text-[color:var(--public-text-soft)]">
            Вы выбрали услугу из другой страницы, каталог уже сфокусирован на нужной категории.
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={selectedCategoryId || "all"}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, transition: { duration: 0.18 } }}
            className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3"
          >
            {filteredServices.length > 0 ? (
              filteredServices.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))
            ) : (
              <div className="public-panel col-span-full rounded-[30px] px-6 py-16 text-center">
                <p
                  className="text-3xl text-[color:var(--public-text)]"
                  style={{ fontFamily: "var(--font-public-display), serif" }}
                >
                  В этой категории пока нет услуг
                </p>
                <p className="mt-3 text-sm text-[color:var(--public-text-soft)]">
                  Выберите другое направление, чтобы посмотреть доступные предложения.
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </section>
    </div>
  );
}

export default function ServicesPage() {
  return (
    <Suspense fallback={<ServicesPageFallback />}>
      <ServicesPageContent />
    </Suspense>
  );
}
