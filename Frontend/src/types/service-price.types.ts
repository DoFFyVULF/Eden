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
  };
  master?: {
    id: number;
    name: string;
    surname: string;
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

  // Мастер
  masterId: number;
  masterFullName: string;

  // Кастомизация
  durationOverride?: number | null;
}
