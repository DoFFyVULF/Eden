"use client";

import { ADMIN_ROUTES } from "@/app/lib/admin.routes";
import { authService } from "@/services/auth/auth.service";
import { IAuthForm } from "@/types/auth.types";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  User,
  KeyRound,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Loader2,
} from "lucide-react";

export function Auth() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<IAuthForm>({
    mode: "onChange",
  });

  const { push } = useRouter();

  const { mutate, isPending, error } = useMutation({
    mutationKey: ["auth"],
    mutationFn: (data: IAuthForm) => authService.main("login", data),
    onSuccess: async () => {
      toast.success("Успешный вход ✨");
      reset();

      try {
        const user = await authService.getMe();
        const role = user.role;

        Cookies.set("user-role", role, { expires: 7 });
        const redirectPath = role === "admin" ? "/administration" : "/master";
        push(redirectPath);
        window.dispatchEvent(new Event("auth-changed"));
      } catch (err) {
        toast.error("Ошибка при определении роли");
      }
    },
  });

  const onSubmit: SubmitHandler<IAuthForm> = (data) => mutate(data);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4 relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative w-full max-w-md"
      >
        {/* Карточка авторизации */}
        <div className="bg-white rounded-3xl shadow-[0_24px_80px_rgba(15,23,42,0.12)] border border-gray-200 p-8 md:p-10">
          {/* Логотип / Заголовок */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg mb-4">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Добро пожаловать
            </h2>
            <p className="text-gray-500 text-sm">
              Войдите в панель управления
            </p>
          </motion.div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Ошибка авторизации */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>Неверный логин или пароль</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Поле логина */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Логин
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Введите ваш логин"
                  {...register("login", { required: "Введите логин" })}
                  className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-400 outline-none transition-all duration-300"
                />
              </div>
              {errors.login && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-500 text-xs mt-1.5 flex items-center gap-1"
                >
                  <AlertCircle className="w-3 h-3" />
                  {errors.login.message}
                </motion.p>
              )}
            </motion.div>

            {/* Поле пароля */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Пароль
              </label>
              <div className="relative">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  placeholder="Введите ваш пароль"
                  {...register("password", { required: "Введите пароль" })}
                  className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-400 outline-none transition-all duration-300"
                />
              </div>
              {errors.password && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-500 text-xs mt-1.5 flex items-center gap-1"
                >
                  <AlertCircle className="w-3 h-3" />
                  {errors.password.message}
                </motion.p>
              )}
            </motion.div>

            {/* Кнопка входа */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="pt-2"
            >
              <motion.button
                type="submit"
                disabled={isPending}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group relative w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed overflow-hidden"
              >
                {/* Блик при наведении */}
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                
                {isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Входим...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    <span>Войти в систему</span>
                    <Sparkles className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </>
                )}
              </motion.button>
            </motion.div>
          </form>

          {/* Футер */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 pt-6 border-t border-gray-100 text-center"
          >
            <p className="text-gray-400 text-xs">
              © {new Date().getFullYear()} Панель управления. Все права защищены.
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
