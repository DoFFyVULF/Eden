"use client";
import React, { useState, useMemo } from "react";
import { DayPicker } from "react-day-picker";
import {
  format,
  isBefore,
  isAfter,
  startOfDay,
  startOfMonth,
  endOfMonth,
} from "date-fns";
import "react-day-picker/style.css";

interface Appointment {
  time: string;
}

interface DaySchedule {
  workingHours: { start: string; end: string };
  appointments: Appointment[];
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
  day: string; // 'YYYY-MM-dd'
  time: string;
}

interface CalendarTimeSelectorProps {
  selectedMasterId: number;
  selectedMasterSchedule: MasterScheduleItem | null;
  selectedAppointment: SelectedAppointment | null;
  onDateSelect?: (date: Date | null) => void;
  handleTimeClick: (masterId: number, day: string, time: string) => void;
}

const ruLocale = {
  localize: {
    day: (value: number) => ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"][value],
    month: (value: number) =>
      [
        "Январь",
        "Февраль",
        "Март",
        "Апрель",
        "Май",
        "Июнь",
        "Июль",
        "Август",
        "Сентябрь",
        "Октябрь",
        "Ноябрь",
        "Декабрь",
      ][value],
  },
  formatLong: {
    date: () => "d MMMM yyyy",
  },
};

const dayOfWeekMap: Record<string, keyof MasterScheduleItem["schedule"]> = {
  Mon: "mon",
  Tue: "tue",
  Wed: "wed",
  Thu: "thu",
  Fri: "fri",
  Sat: "sat",
  Sun: "sun",
};

export const CalendarTimeSelector: React.FC<CalendarTimeSelectorProps> = ({
  selectedMasterId,
  selectedMasterSchedule,
  handleTimeClick,
  selectedAppointment,
  onDateSelect
}) => {
  const today = startOfDay(new Date());
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(today);

    const handleDateChange = (date: Date | undefined) => {
    setSelectedDate(date);
    onDateSelect?.(date || null);
  };

  const daySchedule = useMemo(() => {
    if (!selectedDate || !selectedMasterSchedule) return null;

    const dayKey = format(selectedDate, "EEE"); // e.g. "Thu"
    const scheduleKey = dayOfWeekMap[dayKey];

    return selectedMasterSchedule.schedule[scheduleKey] || null;
  }, [selectedDate, selectedMasterSchedule]);

  const dateStr = selectedDate ? format(selectedDate, "yyyy-MM-dd") : "";

  return (
    <div className="mt-8">
      <h2 className="text-center text-lg font-semibold text-white/90">
        Выберите день и время
      </h2>

      {/* Календарь: только текущий месяц, без навигации */}
      <div className="mt-4">
        <DayPicker
          mode="single"
          month={today}
          selected={selectedDate}
          onSelect={handleDateChange}
          disabled={(date) => {
            const d = startOfDay(date);
            return isBefore(d, monthStart) || isAfter(d, monthEnd);
          }}
          locale={ruLocale as any}
          showOutsideDays={true}
          classNames={{
            root: "p-3 bg-gray-800 flex border border-gray-700 rounded-lg",
            months: "mx-auto",
            month: "mx-auto",
            caption: "flex justify-center items-center py-2 mb-2",
            caption_label: "text-white font-medium text-lg",
            nav: "hidden",
            table: "w-full",
            head_row: "flex justify-between",
            row: "flex justify-between mt-1",
            head_cell: "text-gray-400  text-sm font-medium w-8 text-center",
            cell: "w-8 h-8 text-center",
            day: "w-8 h-8 rounded-full  mx-auto text-gray-200 ",
            day_selected: "bg-blue-600 text-white",
            day_today: "border border-blue-400",
            day_disabled: "text-gray-600 opacity-50",
            day_outside: "text-gray-600 opacity-30",
          }}
        />
      </div>

      {/* Временные слоты */}
      {selectedDate && (
        <div className="mt-6 p-4 bg-gray-800 rounded-lg">
          <h3 className="text-md font-medium text-white text-center">
            {format(selectedDate, "EEEE, d MMMM yyyy", {
              locale: ruLocale as any,
            })}
          </h3>

          {!daySchedule ? (
            <p className="text-center text-gray-400 mt-2">Выходной</p>
          ) : (
            <>
              <p className="text-sm text-gray-300 text-center">
                Рабочие часы: {daySchedule.workingHours.start} –{" "}
                {daySchedule.workingHours.end}
              </p>
              <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                {daySchedule.appointments.length > 0 ? (
                  daySchedule.appointments.map((appt, idx) => (
                    <button
                      key={idx}
                      onClick={() =>
                        handleTimeClick(selectedMasterId, dateStr, appt.time)
                      }
                      className={`px-2.5 py-1.5 text-sm rounded transition text-center ${
                        selectedAppointment?.masterId === selectedMasterId &&
                        selectedAppointment?.day === dateStr &&
                        selectedAppointment?.time === appt.time
                          ? "bg-emerald-500 text-white"
                          : "bg-blue-600 text-white hover:bg-blue-500"
                      }`}
                    >
                      {appt.time}
                    </button>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm col-span-full text-center">
                    Нет доступных записей
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
