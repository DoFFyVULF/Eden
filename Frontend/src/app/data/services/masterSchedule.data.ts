// types/schedule.type.ts
export interface WorkingHours {
  start: string;
  end: string;
}

export interface DaySchedule {
  workingHours: WorkingHours;
  appointments: { time: string }[];
}

export interface WeekSchedule {
  mon: DaySchedule | null;
  tue: DaySchedule | null;
  wed: DaySchedule | null;
  thu: DaySchedule | null;
  fri: DaySchedule | null;
  sat: DaySchedule | null;
  sun: DaySchedule | null;
}

export interface MasterSchedule {
  masterId: number;
  schedule: WeekSchedule;
}

// Генерация 30-минутных слотов с 08:00 до 16:30
const generateFullDaySlots = (): { time: string }[] => {
  const slots: { time: string }[] = [];
  for (let hour = 8; hour < 17; hour++) {
    slots.push({ time: `${hour.toString().padStart(2, '0')}:00` });
    slots.push({ time: `${hour.toString().padStart(2, '0')}:30` });
  }
  return slots;
};

const fullDaySlots = generateFullDaySlots(); // 18 записей

export const masterSchedule: MasterSchedule[] = [
  {
    masterId: 1,
    schedule: {
      mon: { workingHours: { start: "08:00", end: "17:00" }, appointments: fullDaySlots },
      tue: { workingHours: { start: "08:00", end: "17:00" }, appointments: fullDaySlots },
      wed: { workingHours: { start: "08:00", end: "17:00" }, appointments: fullDaySlots },
      thu: { workingHours: { start: "08:00", end: "17:00" }, appointments: fullDaySlots },
      fri: { workingHours: { start: "08:00", end: "17:00" }, appointments: fullDaySlots },
      sat: null,
      sun: null,
    },
  },
  {
    masterId: 2,
    schedule: {
      mon: { workingHours: { start: "08:00", end: "17:00" }, appointments: fullDaySlots },
      tue: { workingHours: { start: "08:00", end: "17:00" }, appointments: fullDaySlots },
      wed: { workingHours: { start: "08:00", end: "17:00" }, appointments: fullDaySlots },
      thu: { workingHours: { start: "08:00", end: "17:00" }, appointments: fullDaySlots },
      fri: { workingHours: { start: "08:00", end: "17:00" }, appointments: fullDaySlots },
      sat: null,
      sun: null,
    },
  },
  {
    masterId: 3,
    schedule: {
      mon: { workingHours: { start: "08:00", end: "17:00" }, appointments: fullDaySlots },
      tue: { workingHours: { start: "08:00", end: "17:00" }, appointments: fullDaySlots },
      wed: { workingHours: { start: "08:00", end: "17:00" }, appointments: fullDaySlots },
      thu: { workingHours: { start: "08:00", end: "17:00" }, appointments: fullDaySlots },
      fri: { workingHours: { start: "08:00", end: "17:00" }, appointments: fullDaySlots },
      sat: null,
      sun: null,
    },
  },
  {
    masterId: 4,
    schedule: {
      mon: { workingHours: { start: "08:00", end: "17:00" }, appointments: fullDaySlots },
      tue: { workingHours: { start: "08:00", end: "17:00" }, appointments: fullDaySlots },
      wed: { workingHours: { start: "08:00", end: "17:00" }, appointments: fullDaySlots },
      thu: { workingHours: { start: "08:00", end: "17:00" }, appointments: fullDaySlots },
      fri: { workingHours: { start: "08:00", end: "17:00" }, appointments: fullDaySlots },
      sat: null,
      sun: null,
    },
  },
];