"use client";

import { useRouter } from "next/navigation";

export default function ProfileCard({
  img,
  name,
  lastname,
}: {
  img: string;
  name: string;
  lastname: string;
}) {
  const router = useRouter();

  const handleLogout = () => {
    document.cookie =
      "admin-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

    router.push("/administration/login");
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 flex items-center space-x-3 border border-gray-200">
      <img
        src={img}
        alt={`${name} ${lastname}`}
        className="w-12 h-12 rounded-full object-cover border-2 border-green-500"
      />
      <div className="flex flex-col flex-1">
        <span className="font-semibold text-gray-800">
          {name} {lastname}
        </span>
        <span className="text-sm text-gray-500">Администратор</span>
      </div>
      <button
        onClick={handleLogout}
        className="px-3 py-1 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-300"
        title="Выйти из системы"
      >
        Выйти
      </button>
    </div>
  );
}