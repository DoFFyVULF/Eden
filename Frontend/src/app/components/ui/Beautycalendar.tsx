"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  addMonths,
  subMonths,
  isBefore,
  isToday,
  isSameDay,
  startOfDay,
  parseISO,
} from "date-fns";
import { ru } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { appointmentService } from "@/services/appointment/appointment.service";
import { IAppointment } from "@/types/appointment.types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DaySchedule {
  workingHours: { start: string; end: string };
  appointments?: { time: string }[];
}

interface MasterScheduleItem {
  masterId: number;
  schedule: {
    mon?: DaySchedule | null;
    tue?: DaySchedule | null;
    wed?: DaySchedule | null;
    thu?: DaySchedule | null;
    fri?: DaySchedule | null;
    sat?: DaySchedule | null;
    sun?: DaySchedule | null;
  };
}

interface SelectedAppointment {
  masterId: number;
  day: string; // 'yyyy-MM-dd'
  time: string;
}

interface BeautyCalendarProps {
  selectedMasterId: number;
  selectedMasterSchedule: MasterScheduleItem | null;
  selectedAppointment: SelectedAppointment | null;
  handleTimeClick: (masterId: number, day: string, time: string) => void;
  slotInterval?: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DOW_KEY = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;
const WEEK_HEADERS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

function generateSlots(start: string, end: string, interval: number): string[] {
  if (!start || !end) return [];
  
  const toMin = (t: string) => {
    const parts = t.split(":");
    if (parts.length < 2) return 0;
    const [h, m] = parts.map(Number);
    return h * 60 + m;
  };

  const toLabel = (min: number) =>
    `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;

  const slots: string[] = [];
  let cur = toMin(start);
  const endMin = toMin(end);

  while (cur + interval <= endMin) {
    slots.push(toLabel(cur));
    cur += interval;
  }
  return slots;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function BeautyCalendar({
  selectedMasterId,
  selectedMasterSchedule,
  selectedAppointment,
  handleTimeClick,
  slotInterval = 30,
}: BeautyCalendarProps) {
  const today = startOfDay(new Date());
  const [viewMonth, setViewMonth] = useState<Date>(today);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  // Состояния для загрузки занятых слотов
  const [bookedAppointments, setBookedAppointments] = useState<IAppointment[]>([]);
  const [isLoadingBooked, setIsLoadingBooked] = useState(false);

  // Загружаем занятые записи при смене даты или мастера
  useEffect(() => {
    const fetchBooked = async () => {
      if (!selectedDate || !selectedMasterId) return;
      
      setIsLoadingBooked(true);
      try {
        const dateStr = format(selectedDate, "yyyy-MM-dd");
        const data = await appointmentService.getByDate(dateStr, selectedMasterId);
        setBookedAppointments(data);
      } catch (e) {
        console.error("Ошибка загрузки занятых слотов:", e);
      } finally {
        setIsLoadingBooked(false);
      }
    };

    fetchBooked();
  }, [selectedDate, selectedMasterId]);

  const days = useMemo(
    () => eachDayOfInterval({ start: startOfMonth(viewMonth), end: endOfMonth(viewMonth) }),
    [viewMonth]
  );

  const gridOffset = useMemo(() => {
    const dow = getDay(startOfMonth(viewMonth));
    return dow === 0 ? 6 : dow - 1;
  }, [viewMonth]);

  const getSchedule = useCallback(
    (date: Date): DaySchedule | null => {
      if (!selectedMasterSchedule) return null;
      const key = DOW_KEY[getDay(date)];
      return selectedMasterSchedule.schedule[key] ?? null;
    },
    [selectedMasterSchedule]
  );

  // Основная логика фильтрации времени
  const timeSlots = useMemo(() => {
    if (!selectedDate) return [];
    const sch = getSchedule(selectedDate);
    if (!sch) return [];

    // 1. Генерируем все возможные слоты по расписанию
    const allSlots = generateSlots(sch.workingHours.start, sch.workingHours.end, slotInterval);

    // 2. Получаем список уже занятых времен в формате "HH:mm"
    const bookedTimes = bookedAppointments
      .filter(a => a.status !== "Отменен")
      .map(a => {
        const d = typeof a.appointmentTime === 'string' ? parseISO(a.appointmentTime) : new Date(a.appointmentTime);
        return format(d, "HH:mm");
      });

    const now = new Date();
    const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();

    // 3. Фильтруем слоты
    return allSlots.filter((slot) => {
      // Убираем, если слот уже занят в базе
      if (bookedTimes.includes(slot)) return false;

      // Если сегодня — убираем прошедшее время (+15 мин запас)
      if (isToday(selectedDate)) {
        const [h, m] = slot.split(":").map(Number);
        const slotTotalMinutes = h * 60 + m;
        return slotTotalMinutes > currentTotalMinutes + 15;
      }

      return true;
    });
  }, [selectedDate, getSchedule, slotInterval, bookedAppointments]);

  const selectedDateStr = selectedDate ? format(selectedDate, "yyyy-MM-dd") : "";

  return (
    <div className="w-full text-[#F0EBE3]" style={{ fontFamily: "serif" }}>
      {/* Навигация по месяцам */}
      <div className="flex items-center justify-between mb-8 px-1">
        <button
          type="button"
          onClick={() => { setViewMonth((m) => subMonths(m, 1)); setSelectedDate(null); }}
          className="w-8 h-8 rounded-full flex items-center justify-center border border-white/8 text-[#6B6560] hover:border-[#C8A97E]/50 hover:text-[#C8A97E] transition-all"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        <p className="text-xs font-semibold tracking-[0.2em] uppercase">
          {format(viewMonth, "LLLL yyyy", { locale: ru })}
        </p>
        <button
          type="button"
          onClick={() => { setViewMonth((m) => addMonths(m, 1)); setSelectedDate(null); }}
          className="w-8 h-8 rounded-full flex items-center justify-center border border-white/8 text-[#6B6560] hover:border-[#C8A97E]/50 hover:text-[#C8A97E] transition-all"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Заголовки дней недели */}
      <div className="grid grid-cols-7 mb-1">
        {WEEK_HEADERS.map((d) => (
          <div key={d} className="text-center text-[9px] font-bold tracking-[0.15em] uppercase text-[#3D3A38] py-2">{d}</div>
        ))}
      </div>

      {/* Сетка календаря */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: gridOffset }).map((_, i) => (
          <div key={`pad-${i}`} />
        ))}

        {days.map((day) => {
          const isPast = isBefore(day, today) && !isToday(day);
          const isTod = isToday(day);
          const sch = getSchedule(day);
          const isWorkDay = !!sch;
          
          const isTodayFinished = isTod && sch && (() => {
            const now = new Date();
            const [endH, endM] = sch.workingHours.end.split(":").map(Number);
            return (now.getHours() * 60 + now.getMinutes()) >= (endH * 60 + endM - slotInterval);
          })();

          const disabled = !!(isPast || !isWorkDay || isTodayFinished);
          const isSel = selectedDate ? isSameDay(day, selectedDate) : false;

          return (
            <button
              key={day.toISOString()}
              type="button"
              disabled={disabled}
              onClick={() => setSelectedDate(isSel ? null : day)}
              className={[
                "relative flex flex-col items-center justify-center aspect-square rounded-xl transition-all duration-200 select-none",
                isSel
                  ? "bg-[#C8A97E] shadow-[0_4px_20px_rgba(200,169,126,0.35)]"
                  : isWorkDay && !disabled
                  ? "border border-white/5 hover:border-[#C8A97E]/40 hover:bg-[#C8A97E]/8 cursor-pointer"
                  : "cursor-default",
                disabled ? "opacity-20" : "",
              ].filter(Boolean).join(" ")}
            >
              {isTod && !isSel && !disabled && (
                <span className="absolute inset-0 rounded-xl ring-1 ring-[#C8A97E]/60 pointer-events-none" />
              )}
              <span className={`text-[13px] font-medium ${isSel ? "text-[#1a1208]" : isWorkDay && !disabled ? "text-[#F0EBE3]" : "text-[#3D3A38]"}`}>
                {format(day, "d")}
              </span>
              {isWorkDay && sch && !disabled && (
                <span className={`text-[8px] mt-[3px] font-medium ${isSel ? "text-[#6b5530]" : "text-[#6B6560]"}`}>
                  {sch.workingHours.start.slice(0, 5)}–{sch.workingHours.end.slice(0, 5)}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Панель выбора времени */}
      {selectedDate && (
        <div className="mt-6 pt-6 border-t border-white/5 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-baseline justify-between mb-4">
            <p className="text-sm font-semibold text-[#F0EBE3] capitalize">
              {format(selectedDate, "d MMMM, eeee", { locale: ru })}
            </p>
          </div>

          {isLoadingBooked ? (
            <div className="py-8 text-center flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-[#C8A97E]" />
              <p className="text-[10px] text-[#6B6560] uppercase tracking-widest">Проверка времени...</p>
            </div>
          ) : timeSlots.length > 0 ? (
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
              {timeSlots.map((time) => {
                const isActive = selectedAppointment?.day === selectedDateStr && selectedAppointment?.time === time;
                return (
                  <button
                    key={time}
                    type="button"
                    onClick={() => handleTimeClick(selectedMasterId, selectedDateStr, time)}
                    className={`py-2.5 rounded-xl text-[12px] font-medium transition-all ${
                      isActive
                        ? "bg-[#C8A97E] text-[#1a1208] shadow-[0_2px_12px_rgba(200,169,126,0.4)]"
                        : "bg-[#111] border border-white/6 text-[#6B6560] hover:border-[#C8A97E]/50 hover:text-[#C8A97E]"
                    }`}
                  >
                    {time}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center bg-[#111] rounded-2xl border border-dashed border-white/5">
              <p className="text-sm text-[#6B6560]">На этот день нет доступных окон</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}