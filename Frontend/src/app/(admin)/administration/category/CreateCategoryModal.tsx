"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, FolderTree, Sparkles, Shield, AlertCircle, Loader2,
  CheckCircle, Eye, EyeOff, FileText,
} from "lucide-react";
import { categoryService } from "@/services/category/category.service";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (category: { id: number; title: string; description: string; isActive?: boolean }) => void;
}

export default function CreateCategoryModal({ isOpen, onClose, onSuccess }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains("dark"));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setDescription("");
      setIsActive(true);
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) { setError("Название категории обязательно"); return; }

    setLoading(true);
    setError(null);
    try {
      const newCat = await categoryService.create({ title: trimmed, description, isActive });
      onSuccess?.(newCat);
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Не удалось создать категорию";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  }, [title, description, isActive, onClose, onSuccess]);

  const modalCls = isDark
    ? "bg-slate-900/88 backdrop-blur-3xl border border-white/[0.1] shadow-[0_32px_80px_rgba(0,0,0,0.7)]"
    : "bg-white/96 backdrop-blur-xl border border-gray-200/70 shadow-2xl";

  const inputCls = `w-full rounded-xl text-sm border outline-none transition-all ${
    isDark
      ? "bg-white/[0.07] border-white/[0.09] text-white/90 placeholder-white/25 focus:border-indigo-400/50 focus:ring-1 focus:ring-indigo-400/20"
      : "bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 focus:bg-white"
  }`;

  const sectionCls = `rounded-2xl p-4 border ${
    isDark ? "bg-white/[0.04] border-white/[0.07]" : "bg-gray-50/60 border-gray-200/60"
  }`;

  const isReady = title.trim().length > 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={e => e.target === e.currentTarget && onClose()}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
          style={{ background: isDark ? "rgba(0,0,0,0.78)" : "rgba(15,23,42,0.42)", backdropFilter: "blur(16px)" }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 24 }}
            transition={{ type: "spring", damping: 28, stiffness: 340 }}
            onClick={e => e.stopPropagation()}
            className={`relative w-full max-w-md rounded-3xl overflow-hidden my-4 flex flex-col ${modalCls}`}
          >
            {/* ── HEADER ── */}
            <div className="relative px-7 py-6 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 overflow-hidden flex-shrink-0">
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full" />
              <div className="absolute bottom-0 left-0 right-0 h-px bg-white/15" />
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                    <FolderTree size={20} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white">Новая категория</h2>
                    <p className="text-white/65 text-xs mt-0.5">Создание категории услуг</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }}
                  transition={{ duration: 0.18 }}
                  onClick={onClose}
                  className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-white hover:bg-white/25 transition-colors"
                >
                  <X size={17} />
                </motion.button>
              </div>
            </div>

            {/* ── BODY ── */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border text-sm ${
                      isDark ? "bg-rose-500/10 border-rose-400/20 text-rose-400" : "bg-rose-50 border-rose-200 text-rose-600"
                    }`}
                  >
                    <AlertCircle size={14} className="flex-shrink-0" />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Title */}
              <div className={sectionCls}>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-2.5 ${
                  isDark ? "text-white/35" : "text-gray-400"
                }`}>
                  Название *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Например: Парикмахерские услуги"
                  required
                  autoFocus
                  className={`${inputCls} h-11 px-4`}
                />
                {title.trim() && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                    className={`flex items-center gap-1.5 mt-2 text-xs ${
                      isDark ? "text-emerald-400" : "text-emerald-600"
                    }`}
                  >
                    <CheckCircle size={11} />
                    Название заполнено
                  </motion.div>
                )}
              </div>

              {/* Status toggle */}
              <div className={sectionCls}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-bold ${isDark ? "text-white/85" : "text-gray-800"}`}>
                      Статус категории
                    </p>
                    <p className={`text-xs mt-0.5 ${isDark ? "text-white/35" : "text-gray-400"}`}>
                      {isActive ? "Видна клиентам и мастерам" : "Скрыта — недоступна для записи"}
                    </p>
                  </div>

                  {/* Toggle */}
                  <motion.button
                    type="button"
                    onClick={() => setIsActive(!isActive)}
                    whileTap={{ scale: 0.95 }}
                    className={`relative inline-flex h-7 w-13 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                      isActive
                        ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                        : isDark ? "bg-white/[0.1]" : "bg-gray-200"
                    }`}
                    style={{ width: 52 }}
                    aria-pressed={isActive}
                  >
                    <motion.span
                      layout
                      className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg mt-0.5"
                      animate={{ x: isActive ? 26 : 2 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  </motion.button>
                </div>

                {/* Status badge */}
                <div className={`mt-3 flex items-center gap-2 text-xs font-semibold ${
                  isActive
                    ? isDark ? "text-emerald-400" : "text-emerald-700"
                    : isDark ? "text-amber-400" : "text-amber-700"
                }`}>
                  {isActive ? <Eye size={12} /> : <EyeOff size={12} />}
                  {isActive ? "Категория активна" : "Категория скрыта"}
                </div>
              </div>

              {/* Description */}
              <div className={sectionCls}>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-2.5 ${
                  isDark ? "text-white/35" : "text-gray-400"
                }`}>
                  Описание <span className={`normal-case font-normal ${isDark ? "text-white/20" : "text-gray-300"}`}>(необязательно)</span>
                </label>
                <div className="relative">
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Краткое описание категории..."
                    rows={3}
                    className={`${inputCls} px-4 py-3 resize-none`}
                  />
                </div>
              </div>

              {/* Summary strip */}
              <AnimatePresence>
                {isReady && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border ${
                      isDark ? "bg-white/[0.05] border-white/[0.07]" : "bg-gray-50/80 border-gray-200/60"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className={`text-xs mb-0.5 ${isDark ? "text-white/30" : "text-gray-400"}`}>Сводка</p>
                      <p className={`text-sm font-bold truncate ${isDark ? "text-white/85" : "text-gray-800"}`}>{title.trim()}</p>
                      {description && (
                        <p className={`text-xs mt-0.5 truncate ${isDark ? "text-white/30" : "text-gray-400"}`}>{description}</p>
                      )}
                    </div>
                    <div className={`ml-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border flex-shrink-0 ${
                      isActive
                        ? isDark ? "bg-emerald-500/10 border-emerald-400/15 text-emerald-400" : "bg-emerald-50 border-emerald-200 text-emerald-700"
                        : isDark ? "bg-amber-500/10 border-amber-400/15 text-amber-400" : "bg-amber-50 border-amber-200 text-amber-700"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-emerald-400" : "bg-amber-400"}`} />
                      {isActive ? "Активна" : "Скрыта"}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Buttons */}
              <div className={`flex flex-col sm:flex-row gap-3 pt-5 border-t ${isDark ? "border-white/[0.07]" : "border-gray-100"}`}>
                <motion.button
                  type="button" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                  onClick={onClose} disabled={loading}
                  className={`flex-1 h-12 rounded-2xl text-sm font-semibold border transition-all ${
                    isDark ? "bg-white/[0.06] border-white/[0.1] text-white/60 hover:bg-white/[0.09]" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 shadow-sm"
                  }`}
                >
                  Отмена
                </motion.button>

                <motion.button
                  type="submit" whileHover={{ scale: isReady ? 1.01 : 1 }} whileTap={{ scale: 0.98 }}
                  disabled={loading || !isReady}
                  className={`flex-1 h-12 rounded-2xl text-sm font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500`}
                >
                  {loading ? (
                    <><Loader2 size={16} className="animate-spin" />Создание...</>
                  ) : (
                    <><FolderTree size={16} />Создать категорию</>
                  )}
                </motion.button>
              </div>
            </form>

            {/* ── FOOTER ── */}
            <div className={`px-7 py-3 border-t flex items-center justify-between text-xs flex-shrink-0 ${
              isDark ? "border-white/[0.06] text-white/20 bg-white/[0.02]" : "border-gray-100 text-gray-400 bg-gray-50/50"
            }`}>
              <span className="flex items-center gap-1.5">
                <Shield size={11} />
                Данные защищены
              </span>
              <span>ID: Новый</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}