"use client";
import React, { useState, useMemo, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import {
  format,
  isBefore,
  isAfter,
  startOfDay,
  startOfMonth,
  endOfMonth,
  isToday,
  parseISO
} from "date-fns";
import { ru } from "date-fns/locale";
import "react-day-picker/style.css";
import { IAppointment } from "@/types/appointment.types";
import { appointmentService } from "@/services/appointment/appointment.service";

interface AppointmentSlot {
  time: string;
}

interface DaySchedule {
  workingHours: { start: string; end: string };
  appointments: AppointmentSlot[];
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

interface CalendarTimeSelectorProps {
  selectedMasterId: number;
  selectedMasterSchedule: MasterScheduleItem | null;
  selectedAppointment: SelectedAppointment | null;
  onDateSelect?: (date: Date | null) => void;
  handleTimeClick: (masterId: number, day: string, time: string) => void;
}

const dayOfWeekMap: Record<string, keyof MasterScheduleItem["schedule"]> = {
  Mon: "mon", Tue: "tue", Wed: "wed", Thu: "thu", Fri: "fri", Sat: "sat", Sun: "sun",
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
  const [bookedAppointments, setBookedAppointments] = useState<IAppointment[]>([]);
  const [isLoadingBooked, setIsLoadingBooked] = useState(false);

  // 1. Загрузка занятых слотов с сервера
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

  const handleDateChange = (date: Date | undefined) => {
    setSelectedDate(date);
    onDateSelect?.(date || null);
  };

  // 2. Фильтрация доступных слотов
  const availableSlots = useMemo(() => {
    if (!selectedDate || !selectedMasterSchedule) return [];

    const dayKey = format(selectedDate, "EEE"); 
    const scheduleKey = dayOfWeekMap[dayKey];
    const daySchedule = selectedMasterSchedule.schedule[scheduleKey];

    if (!daySchedule || !daySchedule.appointments) return [];

    // Извлекаем время HH:mm из занятых записей, переводя их в ЛОКАЛЬНОЕ время браузера
    const bookedTimes = bookedAppointments
      .filter(a => a.status !== "Отменен") // Отмененные записи не блокируют время
      .map(a => {
        const dateObj = typeof a.appointmentTime === 'string' ? parseISO(a.appointmentTime) : new Date(a.appointmentTime);
        return format(dateObj, "HH:mm");
      });

    const now = new Date();
    const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();

    return daySchedule.appointments.filter(slot => {
      // Проверка 1: Не занято ли время в БД
      if (bookedTimes.includes(slot.time)) return false;

      // Проверка 2: Если сегодня, убираем время, которое уже прошло (+20 мин запас)
      if (isToday(selectedDate)) {
        const [h, m] = slot.time.split(":").map(Number);
        if (h * 60 + m <= currentTotalMinutes + 20) return false;
      }

      return true;
    });
  }, [selectedDate, selectedMasterSchedule, bookedAppointments]);

  const daySchedule = useMemo(() => {
    if (!selectedDate || !selectedMasterSchedule) return null;
    const dayKey = format(selectedDate, "EEE");
    return selectedMasterSchedule.schedule[dayOfWeekMap[dayKey]] || null;
  }, [selectedDate, selectedMasterSchedule]);

  const dateStr = selectedDate ? format(selectedDate, "yyyy-MM-dd") : "";

  return (
    <div className="mt-8 select-none">
      <h2 className="text-center text-lg font-bold text-white mb-4">
        Выберите дату и время
      </h2>

      <div className="flex justify-center">
        <DayPicker
          mode="single"
          selected={selectedDate}
          onSelect={handleDateChange}
          disabled={(date) => isBefore(date, today) || isAfter(date, monthEnd)}
          locale={ru}
          classNames={{
            root: "p-4 bg-gray-900/50 border border-white/5 rounded-2xl shadow-xl",
            caption: "flex justify-center items-center pb-4 text-white font-bold",
            nav: "hidden", // скрываем навигацию, если работаем только в рамках одного месяца
            head_cell: "text-gray-500 font-medium text-xs w-9 pb-2",
            cell: "p-0.5",
            day: "w-9 h-9 text-sm text-gray-300 rounded-xl hover:bg-white/10 transition-colors",
            day_selected: "bg-indigo-600 text-white font-bold hover:bg-indigo-500",
            day_today: "text-indigo-400 border border-indigo-500/30",
            day_disabled: "text-gray-700 opacity-30 cursor-not-allowed",
            day_outside: "opacity-0 pointer-events-none",
          }}
        />
      </div>

      {selectedDate && (
        <div className={`mt-6 p-5 rounded-2xl border transition-all ${
          isDark ? "bg-gray-900/80 border-white/5" : "bg-white border-gray-100"
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white">
              {format(selectedDate, "d MMMM", { locale: ru })}
            </h3>
            {daySchedule && (
              <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded-lg">
                {daySchedule.workingHours.start} – {daySchedule.workingHours.end}
              </span>
            )}
          </div>

          {isLoadingBooked ? (
            <div className="py-10 text-center space-y-3">
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-gray-500 animate-pulse font-medium">Проверяем свободные окна...</p>
            </div>
          ) : !daySchedule ? (
            <div className="py-10 text-center">
              <p className="text-gray-500 text-sm">У мастера выходной</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
              {availableSlots.length > 0 ? (
                availableSlots.map((slot, idx) => {
                  const isSelected = selectedAppointment?.day === dateStr && 
                                   selectedAppointment?.time === slot.time;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleTimeClick(selectedMasterId, dateStr, slot.time)}
                      className={`py-2.5 text-sm font-bold rounded-xl transition-all border ${
                        isSelected
                          ? "bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-500/30 scale-95"
                          : "bg-gray-800/50 border-white/5 text-gray-300 hover:border-indigo-500/50 hover:bg-gray-800"
                      }`}
                    >
                      {slot.time}
                    </button>
                  );
                })
              ) : (
                <div className="col-span-full py-6 text-center bg-white/[0.02] border border-dashed border-white/5 rounded-xl">
                  <p className="text-gray-500 text-xs">Нет свободного времени</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Хелпер для определения темы (если не прокинут через пропсы)
const isDark = true;