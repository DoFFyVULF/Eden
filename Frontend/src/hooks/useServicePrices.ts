"use client";

import { useState, useEffect, useMemo } from "react";
import { IService } from "@/types/services.types";
import { IServicePrice } from "@/types/service-price.types";
import { IMaster } from "@/types/masters.type";
import { ICategory } from "@/types/category.types";

import { serviceService } from "@/services/service/service.service";
import { servicePriceService } from "@/services/service-price/service-price.service";
import { masterService } from "@/services/master/master.service";
import { categoryService } from "@/services/category/category.service";

export interface UIServicePrice extends IServicePrice {
  serviceName?: string;
  categoryName?: string;
  masterName?: string;
}

export function useServicePrices() {
  const [services, setServices] = useState<IService[]>([]);
  const [masters, setMasters] = useState<IMaster[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [servicePrices, setServicePrices] = useState<UIServicePrice[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadBase = async () => {
    const [s, c, m] = await Promise.all([
      serviceService.getAll(),
      categoryService.getAll(),
      masterService.getAll(),
    ]);

    setServices(s);
    setCategories(c);
    setMasters(m);
  };

  const loadServicePrices = async () => {
    setIsLoading(true);
    try {
      const data = await servicePriceService.getAll();

      const enriched = data.map((p) => {
        const service = services.find((s) => s.id === p.serviceId);
        const master = masters.find((m) => m.id === p.masterId);
        const category = categories.find(
          (c) => c.id === service?.categoryId
        );

        return {
          ...p,
          serviceName: service?.title ?? "—",
          masterName: master?.name ?? "—",
          categoryName: category?.title ?? "—",
        };
      });

      setServicePrices(enriched);
    } finally {
      setIsLoading(false);
    }
  };


  useEffect(() => {
    loadBase();
  }, []);


  useEffect(() => {
    if (services.length && masters.length) {
      loadServicePrices();
    }
  }, [services, masters]);


  const createPrice = async (dto: {
    serviceId: number;
    masterId: number;
    price: number;
    isActive: boolean;
  }) => {
    const newPrice = await servicePriceService.create(dto);
    await loadServicePrices();
    return newPrice;
  };

  const updatePrice = async (id: number, dto: Partial<IServicePrice>) => {
    const updated = await servicePriceService.update(id, dto);
    await loadServicePrices();
    return updated;
  };

  const deletePrice = async (id: number) => {
    await servicePriceService.delete(id);
    setServicePrices((prev) => prev.filter((p) => p.id !== id));
  };

  return {
    services,
    masters,
    categories,
    servicePrices,
    isLoading,

    loadServicePrices,
    createPrice,
    updatePrice,
    deletePrice,
  };
}
