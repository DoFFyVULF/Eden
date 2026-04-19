"use client";

import { X, CheckCircle2, Calendar, Clock, User, Scissors, Phone } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { formatPhoneNumber } from "@/app/lib/formatPhoneNumber"; // Используем ваш путь

interface NotificationWindowProps {
  onClose: () => void;
  serviceTitle: string;
  servicePrice: number;
  appointmentDate: Date;
  appointmentTime: string;
  appointmentMaster: string;
  clientPhone?: string; // Добавил опционально, если захотите выводить
}

export default function NotificationWindow({
  onClose,
  serviceTitle,
  servicePrice,
  appointmentDate,
  appointmentTime,
  appointmentMaster,
  clientPhone
}: NotificationWindowProps) {
  
  // Форматируем дату красиво на русском, как в календаре
  const formattedDate = format(appointmentDate, "EEEE, d MMMM yyyy", {
    locale: ru,
  });

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-[#0e0e0e] border border-[#C8A97E]/20 rounded-[2.5rem] p-8 shadow-[0_0_60px_-15px_rgba(200,169,126,0.3)] animate-in fade-in zoom-in-95 duration-300">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-10 h-10 rounded-full border border-white/5 flex items-center justify-center text-[#6B6560] hover:text-[#C8A97E] hover:border-[#C8A97E]/30 transition-all duration-300 bg-white/5"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Success icon */}
        <div className="w-20 h-20 rounded-full bg-[#C8A97E]/10 border border-[#C8A97E]/20 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-[#C8A97E]" />
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-light text-[#F0EBE3] mb-2" style={{ fontFamily: "serif" }}>
            Запись подтверждена
          </h2>
          <p className="text-xs uppercase tracking-[0.2em] text-[#6B6560]">
            Ждём вас в Edén
          </p>
        </div>

        {/* Details card */}
        <div className="bg-white/5 border border-white/5 rounded-3xl p-6 space-y-4 mb-8">
          <div className="flex items-start gap-4">
            <div className="mt-1 w-8 h-8 rounded-full bg-black flex items-center justify-center border border-white/5">
                <Scissors className="w-4 h-4 text-[#C8A97E]" />
            </div>
            <div>
                <p className="text-[10px] text-[#6B6560] uppercase tracking-widest mb-0.5">Услуга</p>
                <p className="text-sm text-[#F0EBE3] font-medium">{serviceTitle}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="mt-1 w-8 h-8 rounded-full bg-black flex items-center justify-center border border-white/5">
                <User className="w-4 h-4 text-[#C8A97E]" />
            </div>
            <div>
                <p className="text-[10px] text-[#6B6560] uppercase tracking-widest mb-0.5">Мастер</p>
                <p className="text-sm text-[#F0EBE3] font-medium">{appointmentMaster}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="mt-1 w-8 h-8 rounded-full bg-black flex items-center justify-center border border-white/5">
                <Calendar className="w-4 h-4 text-[#C8A97E]" />
            </div>
            <div>
                <p className="text-[10px] text-[#6B6560] uppercase tracking-widest mb-0.5">Дата и время</p>
                <p className="text-sm text-[#F0EBE3] font-medium capitalize">
                    {formattedDate} в {appointmentTime}
                </p>
            </div>
          </div>

          {clientPhone && (
            <div className="flex items-start gap-4">
                <div className="mt-1 w-8 h-8 rounded-full bg-black flex items-center justify-center border border-white/5">
                    <Phone className="w-4 h-4 text-[#C8A97E]" />
                </div>
                <div>
                    <p className="text-[10px] text-[#6B6560] uppercase tracking-widest mb-0.5">Ваш телефон</p>
                    <p className="text-sm text-[#F0EBE3] font-medium">{formatPhoneNumber(clientPhone)}</p>
                </div>
            </div>
          )}

          <div className="h-px bg-white/5 my-2" />
          
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-[#6B6560] uppercase tracking-widest">К оплате</span>
            <span className="text-xl font-bold text-[#C8A97E]">
              {servicePrice.toLocaleString("ru-RU")} ₽
            </span>
          </div>
        </div>

        {/* Action button */}
        <button
          onClick={onClose}
          className="w-full py-5 rounded-2xl text-sm font-bold uppercase tracking-[0.2em] bg-[#C8A97E] text-[#1a1208] hover:bg-[#d4b88e] transition-all duration-300 shadow-[0_10px_30px_-10px_rgba(200,169,126,0.4)] active:scale-[0.98]"
        >
          Готово
        </button>
      </div>
    </div>
  );
}