"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Variants } from "framer-motion";
import { masterService } from "@/services/master/master.service";
import { masterScheduleService } from "@/services/schedule/schedule.service";
import type { IMaster } from "@/types/masters.type";
import { 
  X, 
  Calendar, 
  Clock, 
  Users, 
  CalendarDays, 
  CalendarRange,
  CalendarIcon,
  Loader2,
  CheckCircle,
  Sparkles,
  Shield
} from "lucide-react";

type Mode = "template" | "specific";

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const overlayAnimation: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 }
};

const modalAnimation: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: {
      type: "spring" as const,
      damping: 25,
      stiffness: 300
    }
  },
  exit: { opacity: 0, y: 30, scale: 0.95 }
};

export default function ScheduleModal({
  isOpen,
  onClose,
  onSuccess,
}: ScheduleModalProps) {
  const [mode, setMode] = useState<Mode>("template");
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
        const startISO = new Date(
          `${specificDate}T${startTime}:00`
        ).toISOString();
        const endISO = new Date(`${specificDate}T${endTime}:00`).toISOString();

        payload = {
          masterId: Number(selectedMaster),
          startTime: startISO,
          endTime: endISO,
          dayOfWeek: null,
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

  // Получаем цвет градиента в зависимости от режима
  const gradientColors = mode === "template" 
    ? "from-blue-600 via-indigo-600 to-purple-600" 
    : "from-emerald-600 via-teal-600 to-cyan-600";

  const buttonIcon = mode === "template" ? <CalendarDays className="w-4 h-4" /> : <CalendarRange className="w-4 h-4" />;
  const modalTitle = mode === "template" ? "Еженедельная смена" : "Индивидуальная смена";
  const modalDescription = mode === "template" 
    ? "Повторяется каждую неделю в выбранный день" 
    : "Работа в конкретный день";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            variants={overlayAnimation}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-3 md:p-4"
            onClick={onClose}
          >
            <motion.div
              variants={modalAnimation}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-[95vw] sm:max-w-[90vw] md:max-w-lg lg:max-w-xl xl:max-w-2xl bg-gradient-to-br from-white to-gray-50/50 rounded-3xl shadow-2xl border border-gray-200/50 backdrop-blur-xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              {/* Градиентный заголовок */}
              <div className={`relative px-4 sm:px-5 md:px-6 py-4 md:py-5 bg-gradient-to-r ${gradientColors} flex-shrink-0`}>
                <div className="absolute top-0 right-0 p-3 sm:p-4 opacity-20">
                  <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12" />
                </div>
                
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-1.5 sm:p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                      <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-white leading-tight">{modalTitle}</h2>
                      <p className="text-white/80 text-xs mt-0.5 sm:mt-1">
                        {modalDescription}
                      </p>
                    </div>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    className="p-1 sm:p-1.5 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-all duration-300 flex-shrink-0"
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                  </motion.button>
                </div>
              </div>

              {/* Основной контент с прокруткой */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 md:p-6">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-3 sm:p-4 bg-gradient-to-r from-red-50/80 to-rose-50/80 backdrop-blur-sm border border-red-200/50 text-red-700 text-sm rounded-2xl"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                        <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.768 0L4.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                      </div>
                      <span className="text-xs sm:text-sm">{error}</span>
                    </div>
                  </motion.div>
                )}

                {/* 🔁 Переключатель режимов */}
                <div className="mb-4 sm:mb-5 md:mb-6">
                  <div className="flex flex-col sm:flex-row bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-2xl p-1.5 border border-gray-200/50 backdrop-blur-sm">
                    <motion.button
                      type="button"
                      onClick={() => setMode("template")}
                      className={`flex-1 py-2.5 sm:py-3 px-3 sm:px-4 text-sm font-medium rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
                        mode === "template"
                          ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                          : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <CalendarDays className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span className="text-xs sm:text-sm">Еженедельно</span>
                    </motion.button>
                    <motion.button
                      type="button"
                      onClick={() => setMode("specific")}
                      className={`flex-1 py-2.5 sm:py-3 px-3 sm:px-4 text-sm font-medium rounded-xl transition-all duration-300 flex items-center justify-center gap-2 mt-1.5 sm:mt-0 sm:ml-1.5 ${
                        mode === "specific"
                          ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg"
                          : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <CalendarRange className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span className="text-xs sm:text-sm">Конкретная дата</span>
                    </motion.button>
                  </div>
                  <div className="text-xs text-gray-500 mt-2 px-2">
                    {mode === "template" 
                      ? "Смена будет повторяться каждую неделю в выбранный день" 
                      : "Смена запланирована только на одну конкретную дату"}
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 md:space-y-6">
                  {/* Выбор мастера */}
                  <div className="bg-gradient-to-br from-gray-50 to-white/50 rounded-2xl p-3 sm:p-4 border border-gray-200/50">
                    <div className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500" />
                      <span className="text-sm">Выбор сотрудника</span>
                    </div>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <select
                        value={selectedMaster}
                        onChange={(e) => setSelectedMaster(e.target.value as any)}
                        className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 md:py-3.5 bg-white/80 backdrop-blur-sm border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-gray-900 transition-all duration-300 appearance-none text-sm sm:text-base"
                        required
                      >
                        <option value="">Выберите сотрудника</option>
                        {masters.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.surname} {m.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                      <Shield className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      <span className="text-xs">Показаны только активные сотрудники</span>
                    </div>
                  </div>

                  {/* Режим "По дням недели" */}
                  {mode === "template" && (
                    <div className="bg-gradient-to-br from-blue-50/30 to-indigo-50/30 rounded-2xl p-3 sm:p-4 border border-blue-200/30">
                      <div className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <CalendarDays className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500" />
                        <span className="text-sm">День недели</span>
                      </div>
                      <div className="relative">
                        <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <select
                          value={dayOfWeek}
                          onChange={(e) => setDayOfWeek(Number(e.target.value))}
                          className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 md:py-3.5 bg-white/80 backdrop-blur-sm border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-gray-900 transition-all duration-300 text-sm sm:text-base"
                          required
                        >
                          {dayNames.map((name, i) => (
                            <option key={i} value={i}>
                              {name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="mt-3 p-3 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-xl border border-blue-200/30">
                        <div className="text-xs text-gray-700 font-medium mb-1">Выбранный день:</div>
                        <div className="text-sm font-bold text-blue-700">{dayNames[dayOfWeek]}</div>
                      </div>
                    </div>
                  )}

                  {/* Режим "Конкретная дата" */}
                  {mode === "specific" && (
                    <div className="bg-gradient-to-br from-emerald-50/30 to-teal-50/30 rounded-2xl p-3 sm:p-4 border border-emerald-200/30">
                      <div className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <CalendarRange className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" />
                        <span className="text-sm">Выбор даты</span>
                      </div>
                      <div className="relative">
                        <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <input
                          type="date"
                          value={specificDate}
                          onChange={(e) => setSpecificDate(e.target.value)}
                          className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 md:py-3.5 bg-white/80 backdrop-blur-sm border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-gray-900 transition-all duration-300 text-sm sm:text-base"
                          required
                          min={new Date().toISOString().split("T")[0]}
                        />
                      </div>
                      {specificDate && (
                        <div className="mt-3 p-3 bg-gradient-to-r from-emerald-50/50 to-teal-50/50 rounded-xl border border-emerald-200/30">
                          <div className="text-xs text-gray-700 font-medium mb-1">Выбранная дата:</div>
                          <div className="text-sm font-bold text-emerald-700">
                            {new Date(specificDate).toLocaleDateString('ru-RU', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Время работы */}
                  <div className="bg-gradient-to-br from-amber-50/30 to-orange-50/30 rounded-2xl p-3 sm:p-4 border border-amber-200/30">
                    <div className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" />
                      <span className="text-sm">Время работы</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <div className="text-xs font-medium text-gray-600 mb-2">Начало смены</div>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          <input
                            type="time"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 md:py-3.5 bg-white/80 backdrop-blur-sm border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-gray-900 transition-all duration-300 text-sm sm:text-base"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <div className="text-xs font-medium text-gray-600 mb-2">Окончание смены</div>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          <input
                            type="time"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 md:py-3.5 bg-white/80 backdrop-blur-sm border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-gray-900 transition-all duration-300 text-sm sm:text-base"
                            required
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Информация о времени */}
                    <div className="mt-4 p-3 bg-gradient-to-r from-amber-50/50 to-orange-50/50 rounded-xl border border-amber-200/30">
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-700 font-medium">Продолжительность:</div>
                        <div className="text-sm font-bold text-amber-700">
                          {(() => {
                            const start = new Date(`2000-01-01T${startTime}:00`);
                            const end = new Date(`2000-01-01T${endTime}:00`);
                            const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
                            return `${diff} часов`;
                          })()}
                        </div>
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {startTime} — {endTime}
                      </div>
                    </div>
                  </div>

                  {/* Сводная информация */}
                  {selectedMaster && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 sm:p-4 bg-gradient-to-r from-gray-50/50 to-white/30 border border-gray-200/30 rounded-2xl backdrop-blur-sm"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Сводная информация</p>
                          <p className="text-sm font-medium text-gray-900">
                            {masters.find(m => m.id === Number(selectedMaster))?.surname}{' '}
                            {masters.find(m => m.id === Number(selectedMaster))?.name}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            {mode === "template" 
                              ? `Каждый ${dayNames[dayOfWeek].toLowerCase()}`
                              : `Дата: ${new Date(specificDate).toLocaleDateString('ru-RU')}`
                            }
                          </p>
                        </div>
                        <div className="text-right mt-2 sm:mt-0">
                          <div className="inline-block px-3 py-1 bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 rounded-full text-xs font-bold">
                            Готово
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Кнопки */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200/50">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={onClose}
                      className="flex-1 px-4 py-3 sm:py-3.5 bg-white/80 backdrop-blur-sm border border-gray-300/50 text-gray-700 rounded-xl font-semibold hover:bg-gray-50/80 transition-all duration-300 shadow-sm text-sm sm:text-base"
                    >
                      Отмена
                    </motion.button>
                    
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={loading}
                      className={`flex-1 px-4 py-3 sm:py-3.5 bg-gradient-to-r ${gradientColors} text-white rounded-xl font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 text-sm sm:text-base`}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                          <span>Сохранение...</span>
                        </>
                      ) : (
                        <>
                          {buttonIcon}
                          <span>Сохранить смену</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                </form>

                {/* Информация внизу */}
                <div className="mt-4 sm:mt-6 pt-4 border-t border-gray-200/50">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-gray-500 gap-2 sm:gap-0">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-500" />
                      <span>Автоматическое обновление</span>
                    </div>
                    <span>ID: Новый</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}