"use client";

import { useRouter } from "next/navigation";
import { authService } from "@/services/auth/auth.service";
import { removeFromStorage } from "@/services/auth/auth-token.service";
import { toast } from "sonner";

export default function ProfileCard({
  img,
  name,
  role,
}: {
  img: string;
  name: string;
  role: string;
}) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // 1️⃣ сообщаем backend
      await authService.logout();

      // 2️⃣ удаляем accessToken
      removeFromStorage();

      // 3️⃣ редирект
      router.push("/administration/auth");
      router.refresh(); // ⬅️ важно для layout
    } catch {
      toast.error("Ошибка при выходе");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 flex items-center space-x-3 border border-gray-200">
      <img
        src={img}
        alt={`${name}`}
        className="w-12 h-12 rounded-full object-cover border-2 border-green-500"
      />

      <div className="flex flex-col flex-1">
        <span className="font-semibold text-gray-800">{name}</span>
        <span className="text-sm text-gray-500">{role}</span>
      </div>

      <button
        onClick={handleLogout}
        className="px-3 py-1 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-300"
      >
        Выйти
      </button>
    </div>
  );
}
