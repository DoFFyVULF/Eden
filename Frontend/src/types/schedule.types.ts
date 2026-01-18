export interface IMasterSchedule {
  id: number;
  masterId: number;
  dayOfWeek: number; // 0 = Пн, 1 = Вт, ..., 6 = Вс
  startTime: string; // ISO-строка, например: "2025-01-01T09:00:00.000Z"
  endTime: string;   // аналогично
  createdAt?: string;
  updatedAt?: string;
  interval?: number; // интервал между записями в минутах

  // Опционально — если бэкенд возвращает master при include
  master?: {
    id: number;
    surname: string;
    name: string;
    patronymic?: string | null;
    isActive: boolean;
  };
}