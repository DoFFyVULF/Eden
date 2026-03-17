"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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
  LogOut,
  ChevronDown,
  Menu,
  X,
  Shield,
  HomeIcon,
  Scissors,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { adminService } from "@/services/admin/admin.service";
import { userService } from "@/services/user/user.service";
import { IUser } from "@/types/user.types";
import { ADMIN_ROUTES } from "@/app/lib/admin.routes";
import { MASTER_ROUTES } from "@/app/lib/master.routes";
import { authService } from "@/services/auth/auth.service";
import Cookies from "js-cookie";

type MenuItem = {
  id: number;
  label: string;
  href: string;
  icon: React.ReactNode;
  description: string;
  count?: string | number;
};

export default function TopNavBar({ isAdmin }: { isAdmin: boolean }) {
  const [counts, setCounts] = useState<any>(null);
  const [user, setUser] = useState<IUser | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

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

  // Иконки
  const iconComponents = useMemo(
    () => ({
      appointments: <CalendarDays size={18} />,
      masters: <Users size={18} />,
      schedule: <Calendar size={18} />,
      category: <FolderTree size={18} />,
      services: <Settings size={18} />,
      history: <Clock size={18} />,
      users: <UserCog size={18} />,
      analytics: <BarChart3 size={18} />,
      prices: <DollarSign size={18} />,
    }),
    [],
  );

  // Меню
  const menuItems = useMemo((): MenuItem[] => {
    const baseItems: MenuItem[] = [
      {
        id: 1,
        label: "Записи",
        count: counts?.appointments ?? "-",
        href: ADMIN_ROUTES.APPOINTMENTS.LIST,
        icon: iconComponents.appointments,
        description: "Управление записями",
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
        description: "График работы",
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
        description: "Список услуг",
      },
      {
        id: 6,
        label: "Цены",
        count: counts?.services ?? "-",
        href: ADMIN_ROUTES.PRICES.MASTER,
        icon: iconComponents.prices,
        description: "Прайс-лист",
      },
      {
        id: 7,
        label: "История",
        count: counts?.history ?? "-",
        href: ADMIN_ROUTES.APPOINTMENTS.HISTORY,
        icon: iconComponents.history,
        description: "Архив записей",
      },
      {
        id: 8,
        label: "Пользователи",
        count: counts?.users ?? "-",
        href: ADMIN_ROUTES.USERS,
        icon: iconComponents.users,
        description: "Управление аккаунтами",
      },
      {
        id: 9,
        label: "Аналитика",
        href: ADMIN_ROUTES.ANALYTICS.DASHBOARD,
        icon: iconComponents.analytics,
        description: "Отчёты и статистика",
      },
    ];
    const masterItems: MenuItem[] = [
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
        description: "Мой график",
      },
    ];
    return isAdmin ? baseItems : masterItems;
  }, [isAdmin, counts, iconComponents]);

  const isActive = useCallback(
    (href: string) => pathname === href,
    [pathname, menuItems],
  );

  const handleLogout = async () => {
    await authService.logout();
    Cookies.remove("user-role");
    window.dispatchEvent(new Event("auth-changed"));
    router.push("/auth");
  };

  // Закрытие меню при клике вне
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        !target.closest(".profile-dropdown") &&
        !target.closest(".profile-trigger")
      ) {
        setIsProfileOpen(false);
      }
      if (
        !target.closest(".mobile-menu") &&
        !target.closest(".mobile-trigger")
      ) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl animate-pulse" />
            <div className="h-5 w-32 bg-gray-200 rounded-lg animate-pulse" />
          </div>
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-9 w-24 bg-gray-200 rounded-xl animate-pulse"
              />
            ))}
          </div>
        </div>
      </header>
    );
  }

  return (
    <>
      {/* === DESKTOP TOP BAR === */}
      <header className="hidden lg:flex fixed top-0 left-0 right-0 z-50 h-16 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between w-full">
          {/* Логотип */}
          <Link
            href={ADMIN_ROUTES.DASHBOARD}
            className="flex items-center gap-3 group"
          >
            <motion.div
              whileHover={{ rotate: 10, scale: 1.05 }}
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center shadow-lg shadow-blue-500/20"
            >
              <HomeIcon className="w-5 h-5 text-white" />
            </motion.div>
            <div>
              <h1 className="text-lg tracking-[2.5] font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ЭДЭН
              </h1>
            </div>
          </Link>

          {/* Навигация */}
          <nav className="flex items-center gap-1">
            {menuItems.slice(0, 6).map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`relative px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 group
                    ${
                      active
                        ? "text-blue-600 bg-blue-50"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/50"
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`transition-colors ${active ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"}`}
                    >
                      {item.icon}
                    </span>
                    {item.label}
                  </div>
                  {active && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                    />
                  )}
                </Link>
              );
            })}

            {/* Dropdown "Ещё" */}
            {user.role == "admin" && (
              <div
                className="relative"
                onMouseEnter={() => setIsMenuOpen(true)}
                onMouseLeave={() => setIsMenuOpen(false)}
              >
                <button
                  className={`px-3 py-2 rounded-xl text-sm font-medium flex items-center gap-1.5 transition-all
                ${isMenuOpen ? "text-blue-600 bg-blue-50" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/50"}`}
                >
                  Ещё{" "}
                  <ChevronDown
                    size={14}
                    className={`transition-transform ${isMenuOpen ? "rotate-180" : ""}`}
                  />
                </button>

                <AnimatePresence>
                  {isMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute top-full right-0 mt-2 w-72 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 overflow-hidden z-50"
                    >
                      <div className="p-2">
                        {menuItems.slice(6).map((item) => {
                          const active = isActive(item.href);
                          return (
                            <Link
                              key={item.id}
                              href={item.href}
                              className={`flex items-center gap-3 p-3 rounded-xl transition-all
                              ${
                                active
                                  ? "bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-200/50"
                                  : "hover:bg-gray-50"
                              }`}
                            >
                              <div
                                className={`w-9 h-9 rounded-xl flex items-center justify-center
                              ${active ? "bg-gradient-to-br from-blue-500 to-purple-500 text-white" : "bg-gray-100 text-gray-600"}`}
                              >
                                {item.icon}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <span
                                    className={`font-medium text-sm ${active ? "text-gray-900" : "text-gray-700"}`}
                                  >
                                    {item.label}
                                  </span>
                                  {item.count && item.count !== "-" && (
                                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                                      {item.count}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500 truncate">
                                  {item.description}
                                </p>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </nav>

          {/* Профиль */}
          <div className="relative profile-dropdown">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="profile-trigger flex items-center gap-3 p-1.5 pr-3 rounded-xl hover:bg-gray-100/50 transition-all"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm shadow-lg shadow-blue-500/30">
                {(user.name || "?").charAt(0).toUpperCase()}
              </div>
              <div className="text-left hidden xl:block">
                <p className="text-sm font-medium text-gray-900">
                  {user.name ? user.name.split(" ")[0] : "Пользователь"}
                </p>
                <p className="text-xs text-gray-500">
                  {user.role === "admin" ? "Админ" : "Мастер"}
                </p>
              </div>
              <ChevronDown
                size={14}
                className={`text-gray-400 transition-transform ${isProfileOpen ? "rotate-180" : ""}`}
              />
            </button>

            <AnimatePresence>
              {isProfileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-full right-0 mt-2 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 overflow-hidden z-50"
                >
                  <div className="p-4 border-b border-gray-100">
                    <p className="font-semibold text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-500">
                      {user.role === "admin"
                        ? "Администратор системы"
                        : "Мастер"}
                    </p>
                  </div>
                  <div className="p-2">
                    <Link
                      href="/profile"
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      <UserCog size={18} className="text-gray-500" />
                      <span className="text-sm text-gray-700">
                        Настройки профиля
                      </span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 transition-colors text-red-600"
                    >
                      <LogOut size={18} />
                      <span className="text-sm font-medium">Выйти</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* === MOBILE HEADER === */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 h-16 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
        <div className="px-4 h-full flex items-center justify-between">
          {/* Кнопка меню */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="mobile-trigger p-2 -ml-2 rounded-xl hover:bg-gray-100/50 transition-colors"
          >
            <Menu size={22} className="text-gray-700" />
          </button>

          {/* Логотип */}
          <Link
            href={ADMIN_ROUTES.DASHBOARD}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
              <Scissors className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold tracking-[2.5] bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ЭДЭН
            </span>
          </Link>

          {/* Аватар */}
          <button className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm shadow-lg">
            {(user.name || "?").charAt(0).toUpperCase()}
          </button>
        </div>
      </header>

      {/* === MOBILE DRAWER === */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="lg:hidden fixed top-0 left-0 bottom-0 w-80 max-w-full bg-white/95 backdrop-blur-xl z-50 mobile-menu overflow-y-auto"
            >
              {/* Header drawer */}
              <div className="p-5 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="font-bold text-lg">Меню</h2>
                      <p className="text-blue-100/80 text-sm">
                        {isAdmin ? "Администратор" : "Мастер"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Профиль в мобильном меню */}
                <div className="flex items-center gap-3 p-3 bg-white/10 rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center text-white font-semibold">
                    {(user.name || '?').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium">{user.name || 'Пользователь'}</p>
                    <p className="text-sm text-blue-100/80">
                      {user.role === "admin" ? "Админ" : "Мастер"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Навигация */}
              <nav className="p-4 space-y-1">
                {menuItems.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 p-3.5 rounded-xl transition-all
                        ${
                          active
                            ? "bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-200/50"
                            : "hover:bg-gray-50"
                        }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center
                        ${active ? "bg-gradient-to-br from-blue-500 to-purple-500 text-white" : "bg-gray-100 text-gray-600"}`}
                      >
                        {item.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span
                            className={`font-medium text-sm ${active ? "text-gray-900" : "text-gray-700"}`}
                          >
                            {item.label}
                          </span>
                          {item.count && item.count !== "-" && (
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                              {item.count}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 truncate">
                          {item.description}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </nav>

              {/* Кнопка выхода */}
              <div className="p-4 mt-2 border-t border-gray-100">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-red-50 text-red-600 font-medium hover:bg-red-100 transition-colors"
                >
                  <LogOut size={18} />
                  Выйти из аккаунта
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Отступ для фиксированного хедера */}
      <div className="h-16 lg:h-16" />
    </>
  );
}
