"use client";

import { useEffect, useState, useMemo } from "react";
import { usePathname } from "next/navigation";
import { ADMIN_ROUTES } from "@/app/lib/admin.routes";
import { adminService } from "@/services/admin/admin.service";
import { userService } from "@/services/user/user.service";
import { IUser } from "@/types/user.types";
import { MASTER_ROUTES } from "@/app/lib/master.routes";
import ResponsiveNavigation from "./ResponsiveNavigation";
import {
  CalendarDays,
  Users,
  Calendar,
  FolderTree,
  Settings,
  Clock,
  UserCog,
  BarChart3,
  DollarSign,
  FileText,
} from "lucide-react";

type AsideMenuProps = {
  isAdmin: boolean;
};

export default function AsideMenu({ isAdmin }: AsideMenuProps) {
  const [counts, setCounts] = useState<any>(null);
  const [user, setUser] = useState<IUser | null>(null);

  // Загрузка данных
  useEffect(() => {
    const loadData = async () => {
      try {
        const [countsData, userData] = await Promise.all([
          adminService.getCounts(),
          userService.getMe().then((res) => res.data),
        ]);

        setCounts(countsData);
        setUser(userData);
      } catch (error) {
        console.error("Ошибка загрузки данных:", error);
      }
    };

    loadData();
  }, []);

  // Иконки для пунктов меню
  const iconComponents = useMemo(
    () => ({
      appointments: <CalendarDays size={22} />,
      masters: <Users size={22} />,
      schedule: <Calendar size={22} />,
      category: <FolderTree size={22} />,
      services: <Settings size={22} />,
      history: <Clock size={22} />,
      users: <UserCog size={22} />,
      analytics: <BarChart3 size={22} />,
      prices: <DollarSign size={22} />,
    }),
    [],
  );

  // Конфигурация меню
  const menuItems = useMemo(() => {
    const baseItems = [
      {
        id: 1,
        label: "Записи",
        count: counts?.appointments ?? "-",
        href: ADMIN_ROUTES.APPOINTMENTS.LIST,
        icon: iconComponents.appointments,
        description: "Управление записями клиентов",
      },
      {
        id: 2,
        label: "Сотрудники",
        count: counts?.masters ?? "-",
        href: ADMIN_ROUTES.MASTERS.LIST,
        icon: iconComponents.masters,
        description: "Управление персоналом",
      },
      {
        id: 3,
        label: "Расписание",
        count: counts?.schedule ?? "-",
        href: ADMIN_ROUTES.SCHEDULE.OVERVIEW,
        icon: iconComponents.schedule,
        description: "Настройка рабочего графика",
      },
      {
        id: 4,
        label: "Категории",
        count: counts?.category ?? "-",
        href: ADMIN_ROUTES.CATEGORY.LIST,
        icon: iconComponents.category,
        description: "Категории услуг",
      },
      {
        id: 5,
        label: "Услуги",
        count: counts?.services ?? "-",
        href: ADMIN_ROUTES.SERVICES.LIST,
        icon: iconComponents.services,
        description: "Список предоставляемых услуг",
      },
      {
        id: 6,
        label: "Цены услуг",
        count: counts?.services ?? "-",
        href: ADMIN_ROUTES.PRICES.MASTER,
        icon: iconComponents.prices,
        description: "Управление прайс-листом",
      },
      {
        id: 7,
        label: "История",
        count: counts?.history ?? "-",
        href: ADMIN_ROUTES.APPOINTMENTS.HISTORY,
        icon: iconComponents.history,
        description: "Архив завершенных записей",
      },
      {
        id: 8,
        label: "Пользователи",
        count: counts?.users ?? "-",
        href: ADMIN_ROUTES.USERS,
        icon: iconComponents.users,
        description: "Управление пользователями",
      },
      {
        id: 9,
        label: "Аналитика",
        count: "",
        href: ADMIN_ROUTES.ANALYTICS.DASHBOARD,
        icon: iconComponents.analytics,
        description: "Отчеты и статистика",
      },
    ];

    const masterItems = [
      {
        id: 1,
        label: "Записи",
        count: counts?.appointments ?? "-",
        href: MASTER_ROUTES.APPOINTMENTS,
        icon: iconComponents.appointments,
        description: "Мои записи",
      },
      {
        id: 2,
        label: "Расписание",
        count: counts?.schedule ?? "-",
        href: MASTER_ROUTES.SCHEDULE,
        icon: iconComponents.schedule,
        description: "Мое расписание",
      },
    ];

    return isAdmin ? baseItems : masterItems;
  }, [isAdmin, counts, iconComponents]);

  if (!user) {
    return (
      <div className="hidden lg:flex flex-col w-64 xl:w-72 h-screen bg-white/80 backdrop-blur-sm border-r border-gray-200/50 sticky top-0">
        {/* Заголовок-скелетон */}
        <div className="p-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 animate-pulse">
          <div className="h-7 w-32 bg-white/30 rounded-lg mx-auto mb-2"></div>
          <div className="h-4 w-24 bg-white/30 rounded-lg mx-auto"></div>
        </div>

        {/* Навигация-скелетон */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="h-16 bg-gray-100/80 rounded-xl animate-pulse"
              />
            ))}
          </div>

          {/* Профиль-скелетон */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="h-20 bg-gray-100/80 rounded-xl animate-pulse" />
          </div>
        </nav>
      </div>
    );
  }

  return (
    <ResponsiveNavigation
      isAdmin={isAdmin}
      menuItems={menuItems}
      user={{
        name: user.name || user.login || "Пользователь",
        role: user.role === "admin" ? "Администратор" : "Мастер",
        profileImg: user.profileImg,
      }}
    />
  );
}