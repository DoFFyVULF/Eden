"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { userService } from "@/services/user/user.service";
import { appointmentService } from "@/services/appointment/appointment.service";
import { IUser } from "@/types/user.types";
import { 
  Calendar, 
  Clock, 
  TrendingUp,
  ChevronRight,
  Sparkles,
  Bell,
  Target,
  Zap,
  CheckCircle2,
  CalendarDays,
  ArrowUpRight,
  Users,
  BarChart3,
  Settings
} from "lucide-react";
import { MASTER_ROUTES } from "@/app/lib/master.routes";

export default function MasterPage() {
  const [user, setUser] = useState<IUser | null>(null);
  const [appointmentsCount, setAppointmentsCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await userService.getMe();
        const userData = userRes.data;
        setUser(userData);

        if (userData.masterId) {
          const today = new Date().toISOString().split("T")[0];
          const appointments = await appointmentService.getByDate(today, userData.masterId);
          setAppointmentsCount(appointments.length);
        }
      } catch (err) {
        console.error("Ошибка при загрузке данных:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Обновление времени каждую минуту
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const hour = currentTime.getHours();
    let newGreeting = "Добрый день";
    if (hour < 6) newGreeting = "Доброй ночи";
    if (hour < 12) newGreeting = "Доброе утро";
    if (hour >= 18) newGreeting = "Добрый вечер";
    setGreeting(newGreeting);
  }, [currentTime]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100/50 flex items-center justify-center p-4">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-3 border-gray-900 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-gray-600 font-medium">Загрузка панели...</p>
        </div>
      </div>
    );
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ru-RU', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100/50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Верхняя панель - только приветствие */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="text-sm font-medium text-gray-600 uppercase tracking-wider">
                  {formatDate(currentTime)}
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
                {greeting}, {user?.login} 👋
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl">
                Вот обзор вашего рабочего дня. У вас {appointmentsCount} {appointmentsCount === 1 ? 'запись' : appointmentsCount < 5 ? 'записи' : 'записей'} на сегодня.
              </p>
            </div>

            {/* Время */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-gray-200/50 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{formatTime(currentTime)}</div>
                  <div className="text-sm text-gray-500">Текущее время</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Основной контент - только статистика и сегодняшний план */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Левая колонка - Ключевые показатели */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Карточка записей */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                whileHover={{ y: -4 }}
                className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl p-6 border border-blue-100/50"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-sm text-blue-600 font-medium">Сегодня</div>
                </div>
                <div className="text-5xl font-bold text-gray-900 mb-2">{appointmentsCount}</div>
                <div className="text-lg font-semibold text-gray-800 mb-3">Записей</div>
                <div className="text-sm text-gray-600">
                  {appointmentsCount === 0 
                    ? "Свободный график — можно планировать дела"
                    : "Подготовьте рабочее место"}
                </div>
                <div className="mt-6 h-1.5 w-full bg-blue-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(appointmentsCount * 20, 100)}%` }}
                    transition={{ duration: 1, delay: 0.3 }}
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                  />
                </div>
              </motion.div>

              {/* Карточка эффективности */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                whileHover={{ y: -4 }}
                className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-3xl p-6 border border-emerald-100/50"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="p-3 bg-gradient-to-br from-emerald-500 to-green-500 rounded-2xl">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-sm text-emerald-600 font-medium">Рейтинг</div>
                </div>
                <div className="text-5xl font-bold text-gray-900 mb-2">4.9</div>
                <div className="text-lg font-semibold text-gray-800 mb-3">Средний балл</div>
                <div className="text-sm text-gray-600">
                  Ваша эффективность выше среднего на 15%
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <div className="flex-1 h-2 bg-emerald-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-green-500 w-4/5" />
                  </div>
                  <span className="text-sm font-medium text-emerald-700">85%</span>
                </div>
              </motion.div>
            </div>

            {/* Сегодняшние задачи */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-8 bg-white/80 backdrop-blur-sm rounded-3xl p-6 border border-gray-200/50 shadow-sm"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Сегодняшние задачи</h3>
                </div>
                <span className="text-sm text-gray-500">
                  {appointmentsCount > 0 ? "Выполните вовремя" : "Планируйте день"}
                </span>
              </div>

              <div className="space-y-4">
                {appointmentsCount > 0 ? (
                  <>
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50/50 rounded-2xl border border-blue-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white">
                          <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">Подготовить рабочее место</div>
                          <div className="text-sm text-gray-600">Перед первой записью</div>
                        </div>
                      </div>
                      <div className="text-sm text-blue-600 font-medium">Приоритет</div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-green-50/50 rounded-2xl border border-emerald-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center text-white">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">Подтвердить записи</div>
                          <div className="text-sm text-gray-600">Связаться с клиентами</div>
                        </div>
                      </div>
                      <div className="text-sm text-emerald-600 font-medium">Важно</div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-orange-50/50 rounded-2xl border border-amber-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white">
                          <Bell className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">Напоминания</div>
                          <div className="text-sm text-gray-600">Проверить материалы</div>
                        </div>
                      </div>
                      <div className="text-sm text-amber-600 font-medium">Напомнить</div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Zap className="w-8 h-8 text-gray-400" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Свободный день</h4>
                    <p className="text-gray-600 max-w-md mx-auto">
                      У вас нет запланированных записей на сегодня. Можете заняться планированием или профессиональным развитием.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Правая колонка - Быстрый обзор */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="sticky top-8"
            >
              {/* Карточка быстрых действий */}
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 text-white mb-6">
                <h3 className="text-xl font-bold mb-6">Быстрый доступ</h3>
                <div className="space-y-3">
                  <motion.a
                    whileHover={{ x: 4 }}
                    href={MASTER_ROUTES.SCHEDULE}
                    className="flex items-center justify-between p-3 bg-white/10 rounded-xl hover:bg-white/15 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <CalendarDays className="w-4 h-4" />
                      </div>
                      <span>Расписание</span>
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-50" />
                  </motion.a>

                  <motion.a
                    whileHover={{ x: 4 }}
                    href={MASTER_ROUTES.APPOINTMENTS}
                    className="flex items-center justify-between p-3 bg-white/10 rounded-xl hover:bg-white/15 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <Users className="w-4 h-4" />
                      </div>
                      <span>Мои записи</span>
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-50" />
                  </motion.a>

                  <motion.a
                    whileHover={{ x: 4 }}
                    href="#"
                    className="flex items-center justify-between p-3 bg-white/10 rounded-xl hover:bg-white/15 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <BarChart3 className="w-4 h-4" />
                      </div>
                      <span>Статистика</span>
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-50" />
                  </motion.a>

                  <motion.a
                    whileHover={{ x: 4 }}
                    href="#"
                    className="flex items-center justify-between p-3 bg-white/10 rounded-xl hover:bg-white/15 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <Settings className="w-4 h-4" />
                      </div>
                      <span>Настройки</span>
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-50" />
                  </motion.a>
                </div>
              </div>

              {/* Карточка времени */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-gray-200/50 shadow-sm">
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-900 mb-2">{formatTime(currentTime)}</div>
                  <div className="text-sm text-gray-600 mb-4">Текущее время</div>
                  <div className="text-xs text-gray-500">
                    {formatDate(currentTime)}
                  </div>
                </div>
                
                <motion.a
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  href={MASTER_ROUTES.SCHEDULE}
                  className="w-full mt-6 px-4 py-3 bg-gradient-to-r from-gray-900 to-gray-800 text-white font-medium rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <CalendarDays className="w-5 h-5" />
                  Открыть расписание
                  <ArrowUpRight className="w-4 h-4" />
                </motion.a>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Минималистичный футер */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 pt-8 border-t border-gray-200/50"
        >
          <div className="text-center text-sm text-gray-500">
            <div className="flex items-center justify-center gap-6 mb-2">
              <span>Записей сегодня: {appointmentsCount}</span>
              <span>•</span>
              <span>Время: {formatTime(currentTime)}</span>
            </div>
            <div>
              {user?.login && `Ваш логин: ${user.login}`} • {formatDate(currentTime)}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}