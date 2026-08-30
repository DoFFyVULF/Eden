import { ICategory } from "@/types/category.types";
import { IServicePrice } from "@/types/service-price.types";
import { IMasterSchedule } from "@/types/schedule.types";
import { IPublicAppointmentPageData } from "@/types/public-data.types";
import { staticCategories, staticServices } from "../services/services.data";
import { masters } from "../services/masters.data";

// Категории в формате ICategory (для AppointmentClient)
export const staticAppointmentCategories: ICategory[] = staticCategories.map((c) => ({
  id: c.id,
  title: c.title,
  description: c.title,
  isActive: true,
}));

// Цены: каждому мастеру назначаем цены на его услуги (берём price из staticServices)
let priceId = 1;
const masterServiceMap: Record<number, number[]> = {
  1: [1, 2, 9, 10], // Иван — стрижки + загар
  2: [4, 5, 6, 7, 8, 11, 12, 13], // Анна — укладки, окрашивание, маникюр
  3: [1, 2, 3, 4], // Дмитрий — стрижки, укладка
  4: [6, 7, 8, 11, 12, 13], // Елена — окрашивание, маникюр
};

export const staticPrices: IServicePrice[] = Object.entries(masterServiceMap).flatMap(
  ([masterIdStr, serviceIds]) => {
    const masterId = Number(masterIdStr);
    return serviceIds.map((serviceId) => {
      const svc = staticServices.find((s) => s.id === serviceId)!;
      return {
        id: priceId++,
        serviceId,
        masterId,
        price: Number(svc.price) || 0,
        isActive: true,
        service: {
          id: svc.id,
          title: svc.title,
          duration: svc.duration,
          categoryId: svc.categoryId,
          img: svc.img,
        },
        master: {
          id: masterId,
          name: masters.find((m) => m.id === masterId)?.name || "",
          surname: masters.find((m) => m.id === masterId)?.surname || "",
          specialization: masters.find((m) => m.id === masterId)?.specialization,
        },
      } as IServicePrice;
    });
  }
);

// Расписания: статический график без БД
// Пн-Пт 09:00-20:00, Сб 10:00-16:00, Вс — выходной
function isoTime(hours: string) {
  return `2025-01-01T${hours}:00.000Z`;
}

export const staticSchedules: IMasterSchedule[] = masters.flatMap((master) => {
  const entries: IMasterSchedule[] = [];
  let id = master.id * 10;
  // dayOfWeek: 0=Вс,1=Пн,...,6=Сб? В проекте используется 0=Пн? Смотрим BeautyCalendar: getDay -> DOW_KEY, 0=Вс. Но в schedule.types комментарий 0=Пн. Унифицируем: используем getDay логику (0=Вс). Для статики задаём Пн=1 ... Сб=6, Вс=0 выходной.
  const week: Array<{ dow: number; start: string; end: string } | null> = [
    null, // 0 Вс — выходной
    { dow: 1, start: "09:00", end: "20:00" }, // Пн
    { dow: 2, start: "09:00", end: "20:00" }, // Вт
    { dow: 3, start: "09:00", end: "20:00" }, // Ср
    { dow: 4, start: "09:00", end: "20:00" }, // Чт
    { dow: 5, start: "09:00", end: "20:00" }, // Пт
    { dow: 6, start: "10:00", end: "16:00" }, // Сб
  ];
  week.forEach((day) => {
    if (!day) return;
    entries.push({
      id: id++,
      masterId: master.id,
      dayOfWeek: day.dow,
      startTime: isoTime(day.start),
      endTime: isoTime(day.end),
    });
  });
  return entries;
});

// Готовый статический объект для /appointment — полностью без БД
export const staticAppointmentPageData: IPublicAppointmentPageData = {
  categories: staticAppointmentCategories,
  services: staticServices,
  masters,
  prices: staticPrices,
  schedules: staticSchedules,
};
