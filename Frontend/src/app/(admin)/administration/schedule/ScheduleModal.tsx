"use client";

import { useState, useEffect, useMemo } from "react";
import { masterService } from "@/services/master/master.service";
import { masterScheduleService } from "@/services/schedule/schedule.service";
import type { IMaster } from "@/types/masters.type";

type Mode = "template" | "specific";

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ScheduleModal({
  isOpen,
  onClose,
  onSuccess,
}: ScheduleModalProps) {
  const [mode, setMode] = useState<Mode>("template"); // ← вот ключ!
  const [masters, setMasters] = useState<IMaster[]>([]);
  const [selectedMaster, setSelectedMaster] = useState<number | "">("");
  const [dayOfWeek, setDayOfWeek] = useState<number>(0);
  const [specificDate, setSpecificDate] = useState<string>(() => {
    const d = new Date();
    return d.toISOString().split("T")[0];
  });
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:00");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Загрузка мастеров
  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    masterService
      .getAll()
      .then((data) => {
        setMasters(data.filter((m) => m.isActive));
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Не удалось загрузить мастеров");
        setLoading(false);
      });
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMaster) return setError("Выберите мастера");
    if (mode === "specific" && !specificDate) return setError("Укажите дату");
    if (startTime >= endTime)
      return setError("Время окончания должно быть позже начала");

    setLoading(true);
    setError(null);

    try {
      // ОБЪЯВЛЯЕМ payload здесь, чтобы он был доступен во всей функции
      let payload: any;

      if (mode === "template") {
        const now = new Date();
        let date = new Date(now);
        const currentWeekday = (now.getDay() + 6) % 7;
        const diff = dayOfWeek - currentWeekday;
        date.setDate(now.getDate() + diff + (diff < 0 ? 7 : 0));

        const isoDatePart = date.toISOString().split("T")[0];
        const startISO = `${isoDatePart}T${startTime}:00`;
        const endISO = `${isoDatePart}T${endTime}:00`;

        payload = {
          masterId: Number(selectedMaster),
          dayOfWeek: dayOfWeek,
          startTime: startISO,
          endTime: endISO,
        };
      } else {
        // Для конкретной даты dayOfWeek должен быть null
        const startISO = new Date(
          `${specificDate}T${startTime}:00`
        ).toISOString();
        const endISO = new Date(`${specificDate}T${endTime}:00`).toISOString();

        payload = {
          masterId: Number(selectedMaster),
          startTime: startISO,
          endTime: endISO,
          dayOfWeek: null, // Важно для корректной фильтрации на фронте
        };
      }

      await masterScheduleService.create(payload);
      onSuccess?.();
      onClose();

      // Сброс
      setSelectedMaster("");
      setDayOfWeek(0);
      setSpecificDate(new Date().toISOString().split("T")[0]);
      setStartTime("09:00");
      setEndTime("18:00");
    } catch (err: any) {
      console.error("Ошибка:", err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Неизвестная ошибка";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  // Названия дней для подсказки
  const dayNames = useMemo(
    () => [
      "Понедельник",
      "Вторник",
      "Среда",
      "Четверг",
      "Пятница",
      "Суббота",
      "Воскресенье",
    ],
    []
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 text-black bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <svg
              className="w-5 h-5 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Расписание
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {/* 🔁 Переключатель режимов */}
        <div className="flex bg-gray-100 rounded-xl p-1 mb-5">
          <button
            type="button"
            onClick={() => setMode("template")}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-lg transition ${
              mode === "template"
                ? "bg-white text-blue-700 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            🔄 По дням недели
          </button>
          <button
            type="button"
            onClick={() => setMode("specific")}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-lg transition ${
              mode === "specific"
                ? "bg-white text-purple-700 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            📅 Конкретная дата
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Выбор мастера */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Мастер *
            </label>
            <select
              value={selectedMaster}
              onChange={(e) => setSelectedMaster(e.target.value as any)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
              required
            >
              <option value="">Выберите мастера</option>
              {masters.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.surname} {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* 🔄 Режим "По дням недели" */}
          {mode === "template" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                День недели *
              </label>
              <select
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(Number(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
                required
              >
                {dayNames.map((name, i) => (
                  <option key={i} value={i}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 📅 Режим "Конкретная дата" */}
          {mode === "specific" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Дата *
              </label>
              <input
                type="date"
                value={specificDate}
                onChange={(e) => setSpecificDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                required
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
          )}

          {/* Время — общее для обоих режимов */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Начало *
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Окончание *
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium shadow hover:shadow-lg disabled:opacity-50"
            >
              {loading ? "Сохранение..." : "Сохранить"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
