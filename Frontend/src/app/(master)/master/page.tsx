"use client";

import { useEffect, useState } from "react";
import { userService } from "@/services/user/user.service";
import { appointmentService } from "@/services/appointment/appointment.service";
import { IUser } from "@/types/user.types";
import { Calendar, CheckCircle2, Clock, UserCircle } from "lucide-react";

export default function MasterPage() {
  const [user, setUser] = useState<IUser | null>(null);
  const [appointmentsCount, setAppointmentsCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Получаем данные профиля
        const userRes = await userService.getMe();
        const userData = userRes.data;
        setUser(userData);

        // 2. Получаем записи на сегодня
        const today = new Date().toISOString().split("T")[0]; // Формат YYYY-MM-DD
        
        // Передаем дату и ID мастера (если он есть в объекте пользователя)
        const appointments = await appointmentService.getByDate(today, userData.masterId);
        setAppointmentsCount(appointments.length);
      } catch (err) {
        console.error("Ошибка при загрузке данных:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="animate-pulse text-blue-600 font-medium">Загрузка панели...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        
        {/* Приветственный блок */}
        <header className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 text-blue-600 rounded-full mb-6">
            <UserCircle size={48} />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            С возвращением, {user?.login}!
          </h1>
          <p className="text-lg text-slate-500 mt-3">
            Рады видеть вас. Вот что происходит в вашем графике сегодня:
          </p>
        </header>

        {/* Главная информационная карточка */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Статистика записей */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
            <div className="p-3 bg-orange-50 text-orange-500 rounded-2xl mb-4">
              <Calendar size={32} />
            </div>
            <span className="text-slate-500 font-medium">Записей на сегодня</span>
            <span className="text-6xl font-black text-slate-900 my-2">
              {appointmentsCount}
            </span>
            <p className="text-sm text-slate-400">
              {appointmentsCount === 0 
                ? "У вас пока нет записей на этот день" 
                : "Не забудьте проверить время начала"}
            </p>
          </div>

          {/* Статус и быстрые ссылки */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Clock size={20} className="text-blue-500" /> Статус работы
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                <span className="text-slate-600">Роль профиля</span>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full uppercase">
                  {user?.role}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                <span className="text-slate-600">Система</span>
                <div className="flex items-center gap-2 text-green-600 font-medium">
                  <CheckCircle2 size={18} />
                  <span>Онлайн</span>
                </div>
              </div>
            </div>

            <button className="w-full mt-8 bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-2xl font-semibold transition-all active:scale-[0.98]">
              Перейти к расписанию
            </button>
          </div>

        </div>

        {/* Футер-подсказка */}
        <footer className="mt-12 text-center text-slate-400 text-sm">
          Сегодня: {new Date().toLocaleDateString('ru-RU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </footer>
      </div>
    </div>
  );
}