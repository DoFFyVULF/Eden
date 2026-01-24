"use client";

import { ADMIN_ROUTES } from "@/app/lib/admin.routes";
import { adminService, AdminCounts } from "@/services/admin/admin.service";
import { usePathname } from "next/navigation";
import Link from "next/link";
import ProfileCard from "../profileCard/ProfileCard";
import { useEffect, useState } from "react";
import { userService } from "@/services/user/user.service";
import { IUser } from "@/types/user.types";

export default function AsideMenu() {
  const pathname = usePathname();

  const [counts, setCounts] = useState<AdminCounts | null>(null);
  const [user, setUser] = useState<IUser | null>(null);

  useEffect(() => {
    adminService
      .getCounts()
      .then((res) => setCounts(res))
      .catch(console.error);

    userService
      .getMe()
      .then((res) => setUser(res.data))
      .catch(console.error);
  }, []);

  const menuItems = [
    {
      id: 1,
      label: "Записи",
      count: counts?.appointments ?? "-",
      href: ADMIN_ROUTES.APPOINTMENTS.LIST,
      icon: "📅",
    },
    {
      id: 2,
      label: "Сотрудники",
      count: counts?.masters ?? "-",
      href: ADMIN_ROUTES.MASTERS.LIST,
      icon: "👨‍💼",
    },
    {
      id: 3,
      label: "Расписание",
      count: counts?.schedule ?? "-",
      href: ADMIN_ROUTES.SCHEDULE.OVERVIEW,
      icon: "🗓️",
    },
    {
      id: 4,
      label: "Категории услуг",
      count: counts?.category ?? "-",
      href: ADMIN_ROUTES.CATEGORY.LIST,
      icon: "📂",
    },
    {
      id: 5,
      label: "Услуги",
      count: counts?.services ?? "-",
      href: ADMIN_ROUTES.SERVICES.LIST,
      icon: "⚙️",
    },
    {
      id: 6,
      label: "Цены услуг",
      count: counts?.services ?? "-",
      href: ADMIN_ROUTES.PRICES.MASTER,
      icon: "⚙️",
    },
    {
      id: 7,
      label: "История записей",
      count: counts?.history ?? "-",
      href: ADMIN_ROUTES.APPOINTMENTS.HISTORY,
      icon: "⚙️",
    },
    {
      id: 8,
      label: "Пользователи",
      count: counts?.users ?? "-",
      href: ADMIN_ROUTES.USERS,
      icon: "🧑‍🤝‍🧑",
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
        {user && (
          <div className="mt-6 pt-4 border-t">
            <ProfileCard
              img={
                user.profileImg ??
                "https://cdn01.justjared.com/wp-content/uploads/headlines/2025/10/madison-beer-locket.jpg"
              }
              name={user.name || user.login}
              role={user.role === "admin" ? "Администратор" : "Мастер"}
            />
          </div>
        )}
      </nav>
    </div>
  );
}
