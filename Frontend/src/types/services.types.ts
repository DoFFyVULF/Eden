// types/services.types.ts
export interface IService {
  id: number;
  title: string;
  description?: string | null;
  img?: string | null; // Картинка с бэкенда
  duration: number;
  isActive: boolean;
  price?: number | null; 
  categoryId: number;
  category?: { // Обычно категория приходит вложенной, если нет - фильтр сработает по ID
    id: number;
    title: string;
  };
  // Если цена придет с бэкенда, раскомментируйте:
  // price?: number; 
}

export type tServices = {
  id: number;
  title: string;
  duration: number;
  price: number | string; // Разрешаем строку для заглушек
  img: string;
  categoryId?: number;
  isAppointment?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
};