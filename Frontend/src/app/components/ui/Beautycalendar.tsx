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
import { ChevronLeft, ChevronRight, Loader2, CalendarDays, Clock3 } from "lucide-react";
import { appointmentService } from "@/services/appointment/appointment.service";
import { IAppointment } from "@/types/appointment.types";

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
  day: string;
  time: string;
}

interface BeautyCalendarProps {
  selectedMasterId: number;
  selectedMasterSchedule: MasterScheduleItem | null;
  selectedAppointment: SelectedAppointment | null;
  handleTimeClick: (masterId: number, day: string, time: string) => void;
  slotInterval?: number;
}

const DOW_KEY = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;
const WEEK_HEADERS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

function formatDayLabel(date: Date) {
  return format(date, "EEE", { locale: ru }).replace(".", "");
}

function generateSlots(start: string, end: string, interval: number): string[] {
  if (!start || !end) return [];

  const toMin = (time: string) => {
    const parts = time.split(":");
    if (parts.length < 2) return 0;
    const [hours, minutes] = parts.map(Number);
    return hours * 60 + minutes;
  };

  const toLabel = (minutes: number) =>
    `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;

  const slots: string[] = [];
  let current = toMin(start);
  const endMin = toMin(end);

  while (current + interval <= endMin) {
    slots.push(toLabel(current));
    current += interval;
  }

  return slots;
}

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
  const [bookedAppointments, setBookedAppointments] = useState<IAppointment[]>([]);
  const [isLoadingBooked, setIsLoadingBooked] = useState(false);

  useEffect(() => {
    const fetchBooked = async () => {
      if (!selectedDate || !selectedMasterId) return;

      setIsLoadingBooked(true);
      try {
        const dateStr = format(selectedDate, "yyyy-MM-dd");
        const data = await appointmentService.getByDate(dateStr, selectedMasterId);
        setBookedAppointments(data);
      } catch (error) {
        console.error("Ошибка загрузки занятых слотов:", error);
      } finally {
        setIsLoadingBooked(false);
      }
    };

    void fetchBooked();
  }, [selectedDate, selectedMasterId]);

  const days = useMemo(
    () =>
      eachDayOfInterval({
        start: startOfMonth(viewMonth),
        end: endOfMonth(viewMonth),
      }),
    [viewMonth],
  );

  const gridOffset = useMemo(() => {
    const dayOfWeek = getDay(startOfMonth(viewMonth));
    return dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  }, [viewMonth]);

  const getSchedule = useCallback(
    (date: Date): DaySchedule | null => {
      if (!selectedMasterSchedule) return null;
      const key = DOW_KEY[getDay(date)];
      return selectedMasterSchedule.schedule[key] ?? null;
    },
    [selectedMasterSchedule],
  );

  const timeSlots = useMemo(() => {
    if (!selectedDate) return [];
    const schedule = getSchedule(selectedDate);
    if (!schedule) return [];

    const allSlots = generateSlots(
      schedule.workingHours.start,
      schedule.workingHours.end,
      slotInterval,
    );

    const bookedTimes = bookedAppointments
      .filter((appointment) => appointment.status !== "Отменен")
      .map((appointment) => {
        const date =
          typeof appointment.appointmentTime === "string"
            ? parseISO(appointment.appointmentTime)
            : new Date(appointment.appointmentTime);
        return format(date, "HH:mm");
      });

    const now = new Date();
    const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();

    return allSlots.filter((slot) => {
      if (bookedTimes.includes(slot)) return false;

      if (isToday(selectedDate)) {
        const [hours, minutes] = slot.split(":").map(Number);
        const slotTotalMinutes = hours * 60 + minutes;
        return slotTotalMinutes > currentTotalMinutes + 15;
      }

      return true;
    });
  }, [selectedDate, getSchedule, slotInterval, bookedAppointments]);

  const selectedDateStr = selectedDate ? format(selectedDate, "yyyy-MM-dd") : "";
  const selectedSchedule = selectedDate ? getSchedule(selectedDate) : null;

  return (
    <div className="w-full text-[color:var(--public-text)]">
      <div className="flex flex-col gap-4 rounded-[28px] border border-[color:var(--public-border)] bg-[rgba(255,252,247,0.76)] p-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[color:var(--public-text-faint)]">
            Календарь записи
          </p>
          <h3
            className="mt-2 text-3xl text-[color:var(--public-text)]"
            style={{ fontFamily: "var(--font-public-display), serif" }}
          >
            Выберите удобный день
          </h3>
          <p className="mt-2 text-sm leading-7 text-[color:var(--public-text-soft)]">
            Доступные даты и время показаны только для выбранного мастера.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-[20px] bg-[rgba(245,236,224,0.72)] px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--public-text-faint)]">
              Формат
            </p>
            <p className="mt-2 text-sm text-[color:var(--public-text)]">Спокойный выбор даты и слота</p>
          </div>
          <div className="rounded-[20px] bg-[rgba(245,236,224,0.72)] px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--public-text-faint)]">
              Интервал
            </p>
            <p className="mt-2 text-sm text-[color:var(--public-text)]">{slotInterval} минут</p>
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-[32px] border border-[color:var(--public-border)] bg-[rgba(255,250,244,0.74)] p-4 shadow-[var(--public-shadow-soft)] sm:p-5 md:p-6">
        <div className="mb-5 flex items-center justify-between gap-3 md:mb-6">
          <button
            type="button"
            onClick={() => {
              setViewMonth((month) => subMonths(month, 1));
              setSelectedDate(null);
            }}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[color:var(--public-border)] bg-[rgba(255,252,247,0.84)] text-[color:var(--public-text-soft)] hover:text-[color:var(--public-text)] md:h-11 md:w-11"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="min-w-0 flex-1 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[color:var(--public-text-faint)]">
              Месяц
            </p>
            <p
              className="mt-2 text-2xl capitalize text-[color:var(--public-text)] md:text-3xl"
              style={{ fontFamily: "var(--font-public-display), serif" }}
            >
              {format(viewMonth, "LLLL yyyy", { locale: ru })}
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setViewMonth((month) => addMonths(month, 1));
              setSelectedDate(null);
            }}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[color:var(--public-border)] bg-[rgba(255,252,247,0.84)] text-[color:var(--public-text-soft)] hover:text-[color:var(--public-text)] md:h-11 md:w-11"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-3 flex items-center justify-between md:hidden">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[color:var(--public-text-faint)]">
            Доступные дни месяца
          </p>
          <p className="text-[10px] text-[color:var(--public-text-faint)]">
            Листайте вправо
          </p>
        </div>

        <div className="-mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-2 md:hidden">
          {days.map((day) => {
            const isPast = isBefore(day, today) && !isToday(day);
            const isCurrent = isToday(day);
            const schedule = getSchedule(day);
            const isWorkDay = Boolean(schedule);
            const isTodayFinished =
              isCurrent &&
              schedule &&
              (() => {
                const now = new Date();
                const [endHours, endMinutes] = schedule.workingHours.end.split(":").map(Number);
                return now.getHours() * 60 + now.getMinutes() >= endHours * 60 + endMinutes - slotInterval;
              })();
            const disabled = Boolean(isPast || !isWorkDay || isTodayFinished);
            const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;

            return (
              <button
                key={`mobile-${day.toISOString()}`}
                type="button"
                disabled={disabled}
                onClick={() => setSelectedDate(isSelected ? null : day)}
                className={`relative min-w-[92px] snap-start rounded-[24px] border px-3 py-4 text-left transition ${
                  isSelected
                    ? "border-[color:var(--public-border-strong)] bg-[linear-gradient(180deg,rgba(181,148,110,0.92),rgba(153,117,82,0.95))] text-[oklch(0.98_0.005_75)] shadow-[var(--public-shadow-soft)]"
                    : isWorkDay && !disabled
                      ? "border-[color:var(--public-border)] bg-[rgba(255,252,247,0.92)]"
                      : "border-transparent bg-[rgba(232,225,217,0.38)] text-[color:var(--public-text-faint)]"
                } ${disabled ? "opacity-45" : ""}`}
              >
                {isCurrent && !isSelected && !disabled && (
                  <span className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-[color:var(--public-accent-strong)]" />
                )}
                <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] opacity-75">
                  {formatDayLabel(day)}
                </span>
                <span className="mt-2 block text-3xl leading-none font-semibold">
                  {format(day, "d")}
                </span>
                <span className="mt-2 block text-xs capitalize opacity-80">
                  {format(day, "LLLL", { locale: ru })}
                </span>
                {isWorkDay && schedule && !disabled && (
                  <span className={`mt-3 block text-[10px] leading-4 ${isSelected ? "text-[rgba(255,248,240,0.82)]" : "text-[color:var(--public-text-soft)]"}`}>
                    {schedule.workingHours.start.slice(0, 5)} - {schedule.workingHours.end.slice(0, 5)}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="hidden md:grid md:grid-cols-7 md:gap-2">
          {WEEK_HEADERS.map((day) => (
            <div
              key={day}
              className="pb-2 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-[color:var(--public-text-faint)]"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="hidden md:grid md:grid-cols-7 md:gap-2">
          {Array.from({ length: gridOffset }).map((_, index) => (
            <div key={`pad-${index}`} />
          ))}

          {days.map((day) => {
            const isPast = isBefore(day, today) && !isToday(day);
            const isCurrent = isToday(day);
            const schedule = getSchedule(day);
            const isWorkDay = Boolean(schedule);

            const isTodayFinished =
              isCurrent &&
              schedule &&
              (() => {
                const now = new Date();
                const [endHours, endMinutes] = schedule.workingHours.end.split(":").map(Number);
                return now.getHours() * 60 + now.getMinutes() >= endHours * 60 + endMinutes - slotInterval;
              })();

            const disabled = Boolean(isPast || !isWorkDay || isTodayFinished);
            const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;

            return (
              <button
                key={day.toISOString()}
                type="button"
                disabled={disabled}
                onClick={() => setSelectedDate(isSelected ? null : day)}
                className={`relative aspect-square rounded-[22px] border p-2 text-left ${
                  isSelected
                    ? "border-[color:var(--public-border-strong)] bg-[linear-gradient(180deg,rgba(181,148,110,0.92),rgba(153,117,82,0.95))] text-[oklch(0.98_0.005_75)] shadow-[var(--public-shadow-soft)]"
                    : isWorkDay && !disabled
                      ? "border-[color:var(--public-border)] bg-[rgba(255,252,247,0.86)] hover:border-[color:var(--public-border-strong)] hover:bg-[rgba(252,247,241,0.98)]"
                      : "border-transparent bg-[rgba(232,225,217,0.38)] text-[color:var(--public-text-faint)]"
                } ${disabled ? "opacity-45" : ""}`}
              >
                {isCurrent && !isSelected && !disabled && (
                  <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-[color:var(--public-accent-strong)]" />
                )}

                <span className="block text-sm font-semibold">{format(day, "d")}</span>
                {isWorkDay && schedule && !disabled && (
                  <span className={`mt-2 block text-[10px] leading-4 ${isSelected ? "text-[rgba(255,248,240,0.82)]" : "text-[color:var(--public-text-soft)]"}`}>
                    {schedule.workingHours.start.slice(0, 5)} - {schedule.workingHours.end.slice(0, 5)}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {selectedDate && (
        <div className="mt-6 rounded-[30px] border border-[color:var(--public-border)] bg-[rgba(255,252,247,0.78)] p-5 shadow-[var(--public-shadow-soft)] md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[rgba(241,232,220,0.74)] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--public-text-faint)]">
                <CalendarDays className="h-3.5 w-3.5" />
                Выбранная дата
              </div>
              <p
                className="mt-3 text-2xl capitalize text-[color:var(--public-text)] md:text-3xl"
                style={{ fontFamily: "var(--font-public-display), serif" }}
              >
                {format(selectedDate, "d MMMM, eeee", { locale: ru })}
              </p>
            </div>

            {selectedSchedule && (
              <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--public-border)] bg-[rgba(255,248,239,0.84)] px-4 py-2 text-sm text-[color:var(--public-text-soft)]">
                <Clock3 className="h-4 w-4 text-[color:var(--public-accent-strong)]" />
                {selectedSchedule.workingHours.start.slice(0, 5)} - {selectedSchedule.workingHours.end.slice(0, 5)}
              </div>
            )}
          </div>

          {isLoadingBooked ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12">
              <Loader2 className="h-5 w-5 animate-spin text-[color:var(--public-accent-strong)]" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--public-text-faint)]">
                Проверяем доступное время
              </p>
            </div>
          ) : timeSlots.length > 0 ? (
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {timeSlots.map((time) => {
                const isActive =
                  selectedAppointment?.day === selectedDateStr &&
                  selectedAppointment?.time === time;

                return (
                  <button
                    key={time}
                    type="button"
                    onClick={() => handleTimeClick(selectedMasterId, selectedDateStr, time)}
                    className={`min-h-[52px] rounded-2xl border px-3 py-3 text-sm font-semibold ${
                      isActive
                        ? "border-[color:var(--public-border-strong)] bg-[color:var(--public-accent)] text-[oklch(0.98_0.005_75)] shadow-[var(--public-shadow-soft)]"
                        : "border-[color:var(--public-border)] bg-[rgba(255,252,247,0.86)] text-[color:var(--public-text)] hover:border-[color:var(--public-border-strong)] hover:bg-[rgba(252,247,241,0.98)]"
                    }`}
                  >
                    {time}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="mt-6 rounded-[24px] border border-dashed border-[color:var(--public-border)] bg-[rgba(247,239,230,0.58)] px-5 py-10 text-center">
              <p
                className="text-2xl text-[color:var(--public-text)]"
                style={{ fontFamily: "var(--font-public-display), serif" }}
              >
                На этот день нет свободных окон
              </p>
              <p className="mt-3 text-sm leading-7 text-[color:var(--public-text-soft)]">
                Попробуйте выбрать другую дату, чтобы увидеть доступные интервалы.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
