"use client";

import { ADMIN_ROUTES } from "@/app/lib/admin_routres";
import { authService } from "@/services/auth/auth.service";
import { IAuthForm } from "@/types/auth.types";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";

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
    onSuccess() {
      toast.success("Успешный вход");
      reset();
      push(ADMIN_ROUTES.DASHBOARD);
    },
  });

  const onSubmit: SubmitHandler<IAuthForm> = (data) => mutate(data);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="max-w-md w-full space-y-8 p-8">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Вход в админ панель
        </h2>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              Ошибка входа
            </div>
          )}

          <div>
            <input
              type="text"
              placeholder="Логин"
              {...register("login", { required: "Введите логин" })}
              className="relative block w-full border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md sm:text-sm"
            />
            {errors.login && (
              <p className="text-red-600 text-sm mt-1">{errors.login.message}</p>
            )}
          </div>

          <div>
            <input
              type="password"
              placeholder="Пароль"
              {...register("password", { required: "Введите пароль" })}
              className="relative block w-full border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md sm:text-sm"
            />
            {errors.password && (
              <p className="text-red-600 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
          >
            {isPending ? "Вход..." : "Войти"}
          </button>
        </form>
      </div>
    </div>
  );
}
