"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Loader2, Trash2, X } from "lucide-react";

interface AdminConfirmModalProps {
  isOpen: boolean;
  isDark: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  itemLabel?: string | null;
  isLoading?: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
}

export default function AdminConfirmModal({
  isOpen,
  isDark,
  title,
  description,
  confirmText = "Удалить",
  cancelText = "Отмена",
  itemLabel,
  isLoading = false,
  onClose,
  onConfirm,
}: AdminConfirmModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isLoading) onClose();
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isLoading, isOpen, onClose]);

  const modalCls = isDark
    ? "bg-slate-900/88 backdrop-blur-3xl border border-white/[0.1] shadow-[0_32px_80px_rgba(0,0,0,0.7)]"
    : "bg-white/96 backdrop-blur-xl border border-gray-200/70 shadow-2xl";

  const sectionCls = isDark
    ? "bg-white/[0.04] border-white/[0.07]"
    : "bg-gray-50/70 border-gray-200/70";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(event) =>
            event.target === event.currentTarget && !isLoading && onClose()
          }
          className="fixed inset-0 z-[120] flex items-center justify-center p-4 overflow-y-auto"
          style={{
            background: isDark ? "rgba(0,0,0,0.78)" : "rgba(15,23,42,0.42)",
            backdropFilter: "blur(16px)",
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 24 }}
            transition={{ type: "spring", damping: 28, stiffness: 340 }}
            onClick={(event) => event.stopPropagation()}
            className={`relative w-full max-w-md overflow-hidden rounded-3xl ${modalCls}`}
          >
            <div className="relative overflow-hidden bg-gradient-to-r from-rose-500 via-red-500 to-orange-500 px-7 py-6">
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
              <div className="absolute bottom-0 left-0 right-0 h-px bg-white/15" />

              <div className="relative flex items-center justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20 shadow-lg backdrop-blur-sm">
                    <AlertTriangle size={20} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white">{title}</h2>
                    <p className="mt-0.5 text-xs text-white/70">
                      Это действие нельзя отменить
                    </p>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ duration: 0.18 }}
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 text-white transition-colors hover:bg-white/25 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <X size={17} />
                </motion.button>
              </div>
            </div>

            <div className="p-6">
              <div className={`rounded-2xl border p-4 ${sectionCls}`}>
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl ${
                      isDark
                        ? "bg-rose-500/12 text-rose-400"
                        : "bg-rose-50 text-rose-500"
                    }`}
                  >
                    <Trash2 size={18} />
                  </div>

                  <div className="min-w-0">
                    <p
                      className={`text-sm leading-relaxed ${
                        isDark ? "text-white/70" : "text-gray-600"
                      }`}
                    >
                      {description}
                    </p>

                    {itemLabel && (
                      <div
                        className={`mt-3 rounded-2xl border px-3.5 py-3 text-sm font-semibold ${
                          isDark
                            ? "border-white/[0.08] bg-white/[0.05] text-white/90"
                            : "border-gray-200 bg-white text-gray-900"
                        }`}
                      >
                        {itemLabel}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-5 flex gap-3">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={onClose}
                  disabled={isLoading}
                  className={`flex-1 rounded-2xl border px-4 py-3 text-sm font-semibold transition-all ${
                    isDark
                      ? "bg-white/[0.06] border-white/[0.1] text-white/60 hover:bg-white/[0.09]"
                      : "bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200"
                  } disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  {cancelText}
                </motion.button>

                <motion.button
                  type="button"
                  whileHover={{ scale: isLoading ? 1 : 1.01 }}
                  whileTap={{ scale: isLoading ? 1 : 0.97 }}
                  onClick={() => void onConfirm()}
                  disabled={isLoading}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 via-red-500 to-orange-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-rose-500/20 transition-all disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Удаление...
                    </>
                  ) : (
                    <>
                      <Trash2 size={15} />
                      {confirmText}
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
