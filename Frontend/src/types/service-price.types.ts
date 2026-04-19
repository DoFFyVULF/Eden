export interface IServicePrice {
  id: number;
  serviceId: number;
  masterId: number;
  price: number;
  isActive: boolean;
  durationOverride?: number | null;
  notes?: string;

  service?: {
    id: number;
    title: string;
    duration: number;
    categoryId: number;
    img?: string | null; // Убедитесь, что картинка есть и во вложенном объекте service
  };
  master?: {
    id: number;
    name: string;
    surname: string;
    specialization?: string;
  };
}

export interface UIServicePrice {
  id: number;
  price: number;
  isActive: boolean;

  // Услуга
  serviceId: number;
  serviceTitle: string;
  categoryId: number;
  categoryName: string;
  serviceImg?: string | null; // <--- ДОБАВЛЕНО: Это поле отсутствовало

  // Мастер
  masterId: number;
  masterFullName: string;
  masterSpecialization: string;

  // Кастомизация
  durationOverride?: number | null;
}