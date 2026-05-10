"use client";

import { X, AlertCircle } from "lucide-react";

interface LimitExceededWindowProps {
  onClose: () => void;
}

export default function LimitExceededWindow({
  onClose
}: LimitExceededWindowProps) {
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

        {/* Error icon */}
        <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-light text-[#F0EBE3] mb-2" style={{ fontFamily: "serif" }}>
            Превышен лимит записей
          </h2>
          <p className="text-sm text-[#6B6560]">
            Нельзя записаться больше 2-х раз за полчаса. Пожалуйста, позвоните администратору для оформления записи.
          </p>
        </div>

        {/* Action button */}
        <button
          onClick={onClose}
          className="w-full py-5 rounded-2xl text-sm font-bold uppercase tracking-[0.2em] bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all duration-300 shadow-[0_10px_30px_-10px_rgba(200,169,126,0.4)] active:scale-[0.98] border border-red-500/30"
        >
          Понятно
        </button>
      </div>
    </div>
  );
}
