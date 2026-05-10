import { IServicePrice, UIServicePrice } from "@/types/service-price.types";

const mapServicePriceToUI = (
  price: IServicePrice,
  categoryMap: Map<number, string>
): UIServicePrice => {
  const service = price.service;
  const master = price.master;

  if (!service || !master) {
    throw new Error(`Missing service or master data for price id=${price.id}. Ensure 'include: { service: true, master: true }' in API.`);
  }

  return {
    id: price.id,
    price: price.price,
    isActive: price.isActive,
    durationOverride: price.durationOverride ?? null,

    serviceId: service.id,
    serviceTitle: service.title,
    categoryId: service.categoryId,
    categoryName: categoryMap.get(service.categoryId) ?? "Не указана",
    serviceImg: service.img ?? null,

    masterId: master.id,
    masterFullName: `${master.surname} ${master.name}`,
    masterSpecialization: master.specialization ?? "",
  };
};

export default mapServicePriceToUI;
