"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  CalendarDays,
  Users,
  Package,
  DollarSign,
  Clock,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Shield,
} from "lucide-react";
import { masterService } from "@/services/master/master.service";
import { appointmentService } from "@/services/appointment/appointment.service";
import { serviceService } from "@/services/service/service.service";
import { IAppointment } from "@/types/appointment.types";
import { ADMIN_ROUTES } from "@/app/lib/admin.routes";

// Простые функции форматирования
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })
    .format(value)
    .replace('₽', '₽')
    .trim();
};

const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('ru-RU').format(value);
};

export default function AdminPage() {
  const [quickStats, setQuickStats] = useState({
    todayAppointments: 0,
    activeMasters: 0,
    totalServices: 0,
    todayRevenue: 0,
  });
  const [upcomingAppointments, setUpcomingAppointments] = useState<IAppointment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingAppointments, setLoadingAppointments] = useState(false);

  // Функция для расчета выручки за сегодня
  const calculateTodayRevenue = async (): Promise<number> => {
    try {
      const today = new Date();
      const todayString = today.toISOString().split('T')[0];
      
      // Получаем записи на сегодня
      const todayAppointments = await appointmentService.getByDate(todayString);
      
      // Суммируем выручку только из завершенных записей
      const revenue = todayAppointments.reduce((sum, app) => {
        // Только завершенные записи
        if (app.status === 'Завершен' && app.price) {
          return sum + Number(app.price);
        }
        return sum;
      }, 0);
      
      return revenue;
    } catch (error) {
      console.error("Error calculating today revenue:", error);
      return 0;
    }
  };

  // Функция для подсчета записей на сегодня
  const countTodayAppointments = async (): Promise<number> => {
    try {
      const today = new Date();
      const todayString = today.toISOString().split('T')[0];
      
      // Получаем все записи на сегодня
      const appointments = await appointmentService.getByDate(todayString);
      return appointments.length;
    } catch (error) {
      console.error("Error counting today appointments:", error);
      return 0;
    }
  };

  // Функция для получения количества активных услуг
  const getActiveServicesCount = async (): Promise<number> => {
    try {
      const services = await serviceService.getAll();
      // Фильтруем активные услуги
      const activeServices = services.filter(service => service.isActive !== false);
      return activeServices.length;
    } catch (error) {
      console.error("Error getting active services count:", error);
      return 0;
    }
  };

  // Загрузка быстрой статистики
  const loadQuickStats = async () => {
    setIsLoading(true);
    try {
      // Получаем данные параллельно для оптимизации
      const [
        todayAppointmentsCount,
        activeMastersCount,
        activeServicesCount,
        todayRevenueValue
      ] = await Promise.all([
        countTodayAppointments(),
        masterService.getActiveMastersCount(),
        getActiveServicesCount(),
        calculateTodayRevenue()
      ]);
      
      setQuickStats({
        todayAppointments: todayAppointmentsCount,
        activeMasters: activeMastersCount,
        totalServices: activeServicesCount,
        todayRevenue: todayRevenueValue,
      });
    } catch (error) {
      console.error("Error loading quick stats:", error);
      // Если ошибка, используем дефолтные значения
      setQuickStats({
        todayAppointments: 0,
        activeMasters: 0,
        totalServices: 0,
        todayRevenue: 0,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Загрузка ближайших записей
  const loadUpcomingAppointments = async () => {
    setLoadingAppointments(true);
    try {
      const today = new Date();
      const todayString = today.toISOString().split('T')[0];
      
      // Получаем записи на сегодня
      const appointments = await appointmentService.getByDate(todayString);
      
      // Фильтруем только предстоящие записи
      const now = new Date();
      const upcoming = appointments
        .filter(app => {
          const appointmentTime = new Date(app.appointmentTime);
          // Показываем записи, которые сегодня и еще не прошли
          return appointmentTime >= now;
        })
        .sort((a, b) => 
          new Date(a.appointmentTime).getTime() - new Date(b.appointmentTime).getTime()
        )
        .slice(0, 5); // Ограничиваем 5 записями
      
      setUpcomingAppointments(upcoming);
    } catch (error) {
      console.error("Error loading upcoming appointments:", error);
      setUpcomingAppointments([]);
    } finally {
      setLoadingAppointments(false);
    }
  };

  // Загрузка данных при монтировании
  useEffect(() => {
    loadQuickStats();
    loadUpcomingAppointments();
    
    // Обновляем данные каждые 5 минут
    const interval = setInterval(() => {
      loadQuickStats();
      loadUpcomingAppointments();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    loadQuickStats();
    loadUpcomingAppointments();
  };

  // Функция для форматирования времени
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Функция для получения статуса записи
  const getAppointmentStatus = (status: string) => {
    switch (status) {
      case 'Завершен':
        return { label: 'Завершено', color: 'text-emerald-600', icon: <CheckCircle className="w-4 h-4" /> };
      case 'Подтвержден':
        return { label: 'Подтверждено', color: 'text-blue-600', icon: <CheckCircle className="w-4 h-4" /> };
      case 'Отменен':
        return { label: 'Отменено', color: 'text-red-600', icon: <AlertCircle className="w-4 h-4" /> };
      default:
        return { label: 'Новая', color: 'text-amber-600', icon: <AlertCircle className="w-4 h-4" /> };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100/50 p-4 md:p-8">
      <div className="max-w-9xl mx-auto">
        {/* Основной заголовок и приветствие */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                Добро пожаловать в панель управления
              </h1>
              <p className="text-gray-600 text-lg mt-2">
                Управляйте вашим бизнесом с помощью современных инструментов аналитики
              </p>
            </div>
          </div>
        </motion.div>

        {/* Обзор системы */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Обзор системы
              </h2>
              <p className="text-gray-500">
                Ключевые показатели за сегодня
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Обновить
            </motion.button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Записи на сегодня */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-sm hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                  <CalendarDays className="w-6 h-6" />
                </div>
                <div className="text-sm font-medium text-blue-600 flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {isLoading ? "..." : formatNumber(quickStats.todayAppointments)}
              </div>
              <div className="text-sm font-medium text-gray-700">
                Записи на сегодня
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Актуальные данные
              </div>
            </motion.div>

            {/* Активные мастера */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-sm hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                  <Users className="w-6 h-6" />
                </div>
                <div className="text-sm font-medium text-emerald-600 flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {isLoading ? "..." : formatNumber(quickStats.activeMasters)}
              </div>
              <div className="text-sm font-medium text-gray-700">
                Активных мастеров
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Всего в системе
              </div>
            </motion.div>

            {/* Доступные услуги */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-sm hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                  <Package className="w-6 h-6" />
                </div>
                <div className="text-sm font-medium text-amber-600 flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {isLoading ? "..." : formatNumber(quickStats.totalServices)}
              </div>
              <div className="text-sm font-medium text-gray-700">
                Доступных услуг
              </div>
              <div className="text-xs text-gray-500 mt-1">
                В каталоге
              </div>
            </motion.div>

            {/* Выручка за сегодня */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-sm hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div className="text-sm font-medium text-purple-600 flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {isLoading ? "..." : formatCurrency(quickStats.todayRevenue)}
              </div>
              <div className="text-sm font-medium text-gray-700">
                Выручка за сегодня
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Актуальные данные
              </div>
            </motion.div>
          </div>
        </div>

        {/* Ближайшие записи */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-12"
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Ближайшие записи
                  </h3>
                  <p className="text-sm text-gray-500">
                    На сегодня
                  </p>
                </div>
              </div>
              {loadingAppointments && (
                <div className="text-sm text-gray-500 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Загрузка...
                </div>
              )}
            </div>

            <div className="space-y-4">
              {loadingAppointments ? (
                // Скелетоны загрузки
                Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="h-16 bg-gray-200 rounded-xl"></div>
                  </div>
                ))
              ) : upcomingAppointments.length > 0 ? (
                upcomingAppointments.map((appointment) => {
                  const status = getAppointmentStatus(appointment.status);
                  return (
                    <div
                      key={appointment.id}
                      className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-lg font-bold text-gray-900">
                          {formatTime(appointment.appointmentTime)}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {appointment.clientName || "Без имени"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {appointment.service?.title || "Услуга не указана"}
                          </div>
                        </div>
                      </div>
                      <div className={`flex items-center gap-2 text-sm ${status.color}`}>
                        {status.icon}
                        {status.label}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <CalendarDays className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium mb-2">Нет предстоящих записей</p>
                  <p className="text-sm">Все записи на сегодня завершены</p>
                </div>
              )}
            </div>

            {/* Кнопка "Все записи" */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <a
                href={ADMIN_ROUTES.APPOINTMENTS.LIST}
                className="block w-full text-center py-3 bg-gray-50 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors"
              >
                Все записи
              </a>
            </div>
          </div>
        </motion.div>

        {/* Футер с информацией */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="pt-8 border-t border-gray-200/50"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="text-sm text-gray-500">
              <div className="flex flex-wrap items-center gap-4 mb-2">
                <span>Текущее время: {new Date().toLocaleTimeString('ru-RU')}</span>
                <span>•</span>
                <span>Обновлено: {new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="text-gray-400">
                Используйте боковое меню для навигации по всем разделам системы
              </div>
            </div>

            <div className="text-xs text-gray-400">
              {new Date().toLocaleDateString('ru-RU', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}