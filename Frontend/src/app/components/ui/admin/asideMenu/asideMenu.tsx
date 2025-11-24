"use client";

import { ADMIN_ROUTES } from "@/app/lib/admin_routres";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ProfileCard from "../profileCard/ProfileCard";

export default function AsideMenu() {
  const pathname = usePathname();

  const menuItems = [
    {
      id: 1,
      label: "Записи",
      count: 12,
      href: ADMIN_ROUTES.APPOINTMENTS.LIST,
      icon: "📅",
    },
    {
      id: 2,
      label: "Сотрудники",
      count: 8,
      href: ADMIN_ROUTES.EMPLOYEES.LIST,
      icon: "👨‍💼",
    },
    {
      id: 3,
      label: "Расписание",
      count: 5,
      href: ADMIN_ROUTES.SCHEDULE.OVERVIEW,
      icon: "🗓️",
    },
    {
      id: 4,
      label: 'Категории услуг',
      count: '6',
      href: ADMIN_ROUTES.CATEGORY.LIST,
      icon: '📂',
    },
    {
      id: 5,
      label: "Услуги",
      count: 15,
      href: ADMIN_ROUTES.SERVICES.LIST,
      icon: "⚙️",
    },
     {
      id: 6,
      label: "Услуги мастеров",
      count: 15,
      href: ADMIN_ROUTES.SERVICES.EDIT,
      icon: "🔧",
    },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <div className="flex flex-col h-full">
      {/* Заголовок */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
        <h2 className="text-xl font-bold text-white text-center mb-2">
          Панель управления
        </h2>
        <p className="text-blue-100 text-sm text-center">Меню навигации</p>
      </div>

      {/* Список меню */}
      <nav className="flex-1 p-4">
        <ul className="space-y-3">
          {menuItems.map((item) => {
            const active = isActive(item.href);
            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className={`group relative w-full flex items-center p-4 rounded-2xl 
                             transition-all duration-300 overflow-hidden
                             ${
                               active
                                 ? "bg-white shadow-xl ring-2 ring-blue-500 ring-opacity-20 transform scale-[1.02]"
                                 : "bg-white shadow-md hover:shadow-xl hover:scale-[1.02]"
                             }`}
                >
                  {/* Активный индикатор */}
                  {active && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-purple-500 rounded-l-2xl"></div>
                  )}

                  {/* Иконка */}
                  <div
                    className={`flex items-center justify-center w-12 h-12 rounded-xl mr-4 transition-all duration-300
                                  ${
                                    active
                                      ? "bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg"
                                      : "bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-blue-500 group-hover:to-purple-500 group-hover:shadow-lg"
                                  }`}
                  >
                    <span
                      className={`text-lg transition-all duration-300
                                    ${
                                      active
                                        ? "text-white scale-110"
                                        : "text-gray-600 group-hover:text-white group-hover:scale-110"
                                    }`}
                    >
                      {item.icon}
                    </span>
                  </div>

                  {/* Текст и счетчик */}
                  <div className="flex-1 flex items-center justify-between">
                    <div>
                      <span
                        className={`block font-semibold transition-colors duration-300
                                      ${
                                        active
                                          ? "text-gray-800"
                                          : "text-gray-700 group-hover:text-gray-800"
                                      }`}
                      >
                        {item.label}
                      </span>
                      <span
                        className={`text-xs transition-colors duration-300
                                      ${
                                        active
                                          ? "text-blue-600"
                                          : "text-gray-500 group-hover:text-blue-600"
                                      }`}
                      >
                        {active ? "Активный раздел" : "Перейти"}
                      </span>
                    </div>

                    <span
                      className={`text-sm font-bold px-3 py-1.5 rounded-full transition-all duration-300 shadow-sm
                                    ${
                                      active
                                        ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md"
                                        : "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 group-hover:bg-gradient-to-r group-hover:from-blue-500 group-hover:to-purple-500 group-hover:text-white group-hover:shadow-md"
                                    }`}
                    >
                      {item.count}
                    </span>
                  </div>

                  {/* Hover эффект */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                </Link>
              </li>
            );
          })}
        </ul>
              {/* ProfileCard */}
      <div className="p-2 mt-4 border-t border-gray-200">
        <ProfileCard
          img="https://cdn01.justjared.com/wp-content/uploads/headlines/2025/10/madison-beer-locket.jpg"
          name="Бро"
          lastname="Надо тренироваться"
        />
      </div>
      </nav>


    </div>
  );
}
