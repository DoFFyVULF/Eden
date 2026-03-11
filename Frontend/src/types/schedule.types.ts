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

export interface IMasterTimeOff {
  id: number;
  masterId: number;
  startDate: string; // ISO дата-время, начало периода
  endDate: string;   // ISO дата-время, конец периода
  type: "vacation" | "sick_leave" | "day_off" | "other";
  comment?: string;
  createdAt: string; // ISO дата-время
  master?: {
    id: number;
    surname: string;
    name: string;
    middlename: string;
    specialization: string;
    photo?: string;
  };
}

export type CreateTimeOffDto = {
  masterId: number;
  startDate: string; // ISO строка, например "2026-04-01T00:00:00.000Z"
  endDate: string;   // ISO строка
  type?: "vacation" | "sick_leave" | "day_off" | "other";
  comment?: string;
};

export type MasterStatusInfo = {
  isOnTimeOff: boolean;
  currentPeriod: {
    id: number;
    type: string;
    startDate: string;
    endDate: string;
    comment?: string;
  } | null;
};