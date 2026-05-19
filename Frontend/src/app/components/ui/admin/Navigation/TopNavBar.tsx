"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
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
  HomeIcon,
  Scissors,
  Sparkles,
  Zap,
  House,
  SlidersHorizontal,
  Sun,
  Moon,
  Monitor,
  Maximize2,
  Minimize2,
  RussianRuble,
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

const THEME_STORAGE_KEY = "app-theme";
const ROUNDED_STORAGE_KEY = "app-rounded";
const THEME_SETTINGS_EVENT = "theme-settings-changed";

export default function TopNavBar({ isAdmin }: { isAdmin: boolean }) {
  const [counts, setCounts] = useState<any>(null);
  const [user, setUser] = useState<IUser | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [isRounded, setIsRounded] = useState(true);
  const [visibleItemsCount, setVisibleItemsCount] = useState<number | null>(
    null,
  );
  const pathname = usePathname();
  const router = useRouter();
  const desktopNavRef = useRef<HTMLElement | null>(null);
  const moreButtonMeasureRef = useRef<HTMLButtonElement | null>(null);
  const itemMeasureRefs = useRef<Record<number, HTMLAnchorElement | null>>({});

  useEffect(() => {
    const checkIsDark = () => {
      const dark = document.documentElement.classList.contains("dark");
      setIsDark(dark);
    };

    const checkIsRounded = () => {
      const rounded =
        document.documentElement.classList.contains("roundedCustom");
      setIsRounded(rounded);
    };

    checkIsDark();
    checkIsRounded();

    const obs = new MutationObserver(() => {
      checkIsDark();
      checkIsRounded();
    });

    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const [c, u] = await Promise.all([
          adminService.getCounts(),
          userService.getMe().then((r) => r.data),
        ]);
        setCounts(c);
        setUser(u);
      } catch {}
    })();
  }, []);

  const icons = useMemo(
    () => ({
      appointments: <CalendarDays size={16} />,
      masters: <Users size={16} />,
      schedule: <Calendar size={16} />,
      category: <FolderTree size={16} />,
      services: <Settings size={16} />,
      history: <Clock size={16} />,
      users: <UserCog size={16} />,
      analytics: <BarChart3 size={16} />,
      prices: <RussianRuble size={16} />,
    }),
    [],
  );

  const menuItems = useMemo((): MenuItem[] => {
    const base: MenuItem[] = [
      {
        id: 1,
        label: "Записи",
        count: counts?.activeAppointments ?? "-",
        href: ADMIN_ROUTES.APPOINTMENTS.LIST,
        icon: icons.appointments,
        description: "Управление записями",
      },
      {
        id: 2,
        label: "Сотрудники",
        count: counts?.masters ?? "-",
        href: ADMIN_ROUTES.MASTERS.LIST,
        icon: icons.masters,
        description: "Управление персоналом",
      },
      {
        id: 3,
        label: "Расписание",
        count: counts?.schedule ?? "-",
        href: ADMIN_ROUTES.SCHEDULE.OVERVIEW,
        icon: icons.schedule,
        description: "График работы",
      },
      {
        id: 4,
        label: "Категории",
        count: counts?.category ?? "-",
        href: ADMIN_ROUTES.CATEGORY.LIST,
        icon: icons.category,
        description: "Категории услуг",
      },
      {
        id: 5,
        label: "Услуги",
        count: counts?.services ?? "-",
        href: ADMIN_ROUTES.SERVICES.LIST,
        icon: icons.services,
        description: "Список услуг",
      },
      {
        id: 6,
        label: "Цены",
        count: counts?.services ?? "-",
        href: ADMIN_ROUTES.PRICES.MASTER,
        icon: icons.prices,
        description: "Прайс-лист",
      },
      {
        id: 7,
        label: "История",
        count: counts?.history ?? "-",
        href: ADMIN_ROUTES.APPOINTMENTS.HISTORY,
        icon: icons.history,
        description: "Архив записей",
      },
      {
        id: 8,
        label: "Пользователи",
        count: counts?.users ?? "-",
        href: ADMIN_ROUTES.USERS,
        icon: icons.users,
        description: "Управление аккаунтами",
      },
      {
        id: 9,
        label: "Аналитика",
        href: ADMIN_ROUTES.ANALYTICS.DASHBOARD,
        icon: icons.analytics,
        description: "Отчёты и статистика",
      },
    ];
    const master: MenuItem[] = [
      {
        id: 1,
        label: "Записи",
       
        href: MASTER_ROUTES.APPOINTMENTS,
        icon: icons.appointments,
        description: "Мои записи",
      },
      {
        id: 2,
        label: "Расписание",
        href: MASTER_ROUTES.SCHEDULE,
        icon: icons.schedule,
        description: "Мой график",
      },
         {
        id: 3,
        label: "История",
        href: MASTER_ROUTES.APPOINTMENTS_HISTORY,
        icon: icons.history,
        description: "Архив записей",
      }
    ];
    return isAdmin ? base : master;
  }, [isAdmin, counts, icons]);

  const isActive = useCallback((href: string) => pathname === href, [pathname]);

  const handleLogout = async () => {
    await authService.logout();
    Cookies.remove("user-role");
    window.dispatchEvent(new Event("auth-changed"));
    router.push("/auth");
  };

  const handleThemeChange = (theme: "light" | "dark" | "system") => {
    if (theme === "light") {
      document.documentElement.classList.remove("dark");
      setIsDark(false);
      localStorage.setItem(THEME_STORAGE_KEY, "light");
    } else if (theme === "dark") {
      document.documentElement.classList.add("dark");
      setIsDark(true);
      localStorage.setItem(THEME_STORAGE_KEY, "dark");
    } else if (theme === "system") {
      const systemDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      if (systemDark) {
        document.documentElement.classList.add("dark");
        setIsDark(true);
        localStorage.setItem(THEME_STORAGE_KEY, "dark");
      } else {
        document.documentElement.classList.remove("dark");
        setIsDark(false);
        localStorage.setItem(THEME_STORAGE_KEY, "light");
      }
    }

    window.dispatchEvent(new Event(THEME_SETTINGS_EVENT));
  };

  const handleNavbarSizeChange = (
    size: "compact" | "default" | "comfortable",
  ) => {
    if (size === "compact") {
      document.documentElement.classList.add("roundedCustom");
      setIsRounded(true);
      localStorage.setItem(ROUNDED_STORAGE_KEY, "true");
    } else if (size === "default" || size === "comfortable") {
      document.documentElement.classList.remove("roundedCustom");
      setIsRounded(false);
      localStorage.setItem(ROUNDED_STORAGE_KEY, "false");
    }

    window.dispatchEvent(new Event(THEME_SETTINGS_EVENT));
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isSettingsModalOpen) {
        setIsSettingsModalOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isSettingsModalOpen]);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (!t.closest(".pd") && !t.closest(".pt")) setIsProfileOpen(false);
      if (!t.closest(".md") && !t.closest(".mt")) setIsMobileMenuOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const glassCls = isDark
    ? "bg-white/[0.07] backdrop-blur-2xl border-white/[0.12] shadow-[0_1px_0_rgba(255,255,255,0.08),0_8px_32px_rgba(0,0,0,0.3)]"
    : "bg-white/90 backdrop-blur-xl border-gray-200/60 shadow-sm";

  const dropGlass = isDark
    ? "bg-white/[0.08] backdrop-blur-3xl border border-white/[0.12] shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
    : "bg-white border border-gray-200/70 shadow-xl";

  const modalOverlay = isDark
    ? "bg-black/60 backdrop-blur-sm"
    : "bg-black/50 backdrop-blur-sm";

  const modalContent = isDark
    ? "bg-slate-900/95 backdrop-blur-2xl border border-white/[0.12] shadow-[0_30px_70px_rgba(0,0,0,0.6)]"
    : "bg-white border border-gray-200/70 shadow-2xl";

  const CountPill = ({ count }: { count?: string | number }) =>
    count && count !== "-" ? (
      <span
        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none tabular-nums ${
          isDark
            ? "bg-purple-400/20 text-purple-300"
            : "bg-blue-100 text-blue-600"
        }`}
      >
        {count}
      </span>
    ) : null;

  const primaryDesktopItems = isAdmin ? menuItems.slice(0, 6) : menuItems;
  const defaultOverflowItems = isAdmin ? menuItems.slice(6) : [];
  const visibleMenuItems =
    visibleItemsCount === null
      ? primaryDesktopItems
      : primaryDesktopItems.slice(0, visibleItemsCount);
  const overflowMenuItems =
    visibleItemsCount === null
      ? defaultOverflowItems
      : [
          ...primaryDesktopItems.slice(visibleItemsCount),
          ...defaultOverflowItems,
        ];

  useEffect(() => {
    if (overflowMenuItems.length === 0 && isMenuOpen) {
      setIsMenuOpen(false);
    }
  }, [overflowMenuItems.length, isMenuOpen]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const recalculateVisibleItems = () => {
      if (window.innerWidth < 1024) {
        setVisibleItemsCount(primaryDesktopItems.length);
        return;
      }

      const navWidth = desktopNavRef.current?.clientWidth ?? 0;
      const moreButtonWidth = moreButtonMeasureRef.current?.offsetWidth ?? 0;
      const itemWidths = primaryDesktopItems.map(
        (item) => itemMeasureRefs.current[item.id]?.offsetWidth ?? 0,
      );

      if (!navWidth || itemWidths.some((width) => width === 0)) {
        return;
      }

      const totalWidth = itemWidths.reduce((sum, width) => sum + width, 0);
      if (totalWidth <= navWidth) {
        setVisibleItemsCount(primaryDesktopItems.length);
        return;
      }

      let usedWidth = 0;
      let nextVisibleCount = 0;

      for (let i = 0; i < itemWidths.length; i += 1) {
        const remainingItems = itemWidths.length - (i + 1);
        const reservedWidth = remainingItems > 0 ? moreButtonWidth : 0;
        const nextWidth = usedWidth + itemWidths[i];

        if (nextWidth + reservedWidth > navWidth) {
          break;
        }

        usedWidth = nextWidth;
        nextVisibleCount = i + 1;
      }

      setVisibleItemsCount(nextVisibleCount);
    };

    recalculateVisibleItems();

    const resizeObserver = new ResizeObserver(() => {
      recalculateVisibleItems();
    });

    if (desktopNavRef.current) {
      resizeObserver.observe(desktopNavRef.current);
    }

    window.addEventListener("resize", recalculateVisibleItems);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", recalculateVisibleItems);
    };
  }, [primaryDesktopItems, isRounded]);

  if (!user)
    return (
      <header
        className={`fixed top-0 left-0 right-0 z-50 h-16 border-b ${glassCls}`}
      >
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <div
            className={`w-32 h-5 rounded-lg animate-pulse ${isDark ? "bg-white/10" : "bg-gray-200"}`}
          />
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`h-8 w-20 rounded-xl animate-pulse ${isDark ? "bg-white/10" : "bg-gray-200"}`}
              />
            ))}
          </div>
          <div
            className={`w-9 h-9 rounded-full animate-pulse ${isDark ? "bg-white/10" : "bg-gray-200"}`}
          />
        </div>
      </header>
    );

  return (
    <>
      {/* ── DESKTOP ─────────────────────────────────────────── */}
      <header
        className={`${isRounded ? "max-w-min mx-auto rounded-3xl top-4 " : ""} hidden lg:flex fixed top-0 left-0 right-0 z-50 h-16 border-b transition-all duration-300 ${glassCls}`}
      >
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between w-full gap-8д">
          {/* Logo */}
          <Link
            href={ADMIN_ROUTES.DASHBOARD}
            className="flex items-center gap-3 shrink-0 group"
          >
            <motion.div
              whileHover={{ scale: 1.08, rotate: 8 }}
              transition={{ type: "spring", stiffness: 400, damping: 12 }}
              className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-lg ${
                isDark
                  ? "bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-purple-500/30"
                  : "bg-gradient-to-br from-blue-500 to-purple-600 shadow-blue-500/20"
              }`}
            >
              <Scissors className="w-5 h-5 text-white fill-white" />
            </motion.div>
            <span
              className={`text-lg font-black tracking-[3px] uppercase ${
                isDark
                  ? "bg-gradient-to-r from-white via-purple-200 to-indigo-300 bg-clip-text text-transparent"
                  : "bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent"
              }`}
            >
              ЭДЭН
            </span>
          </Link>

          {/* Nav links */}
          <nav
            ref={desktopNavRef}
            className="flex items-center gap-0.5 flex-1 justify-center min-w-0"
          >
            {visibleMenuItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`relative px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                    active
                      ? isDark
                        ? "text-white bg-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]"
                        : "text-blue-700 bg-blue-50/80"
                      : isDark
                        ? "text-white/50 hover:text-white/80 hover:bg-white/[0.06]"
                        : "text-gray-500 hover:text-gray-800 hover:bg-gray-100/70"
                  }`}
                >
                  <span
                    className={
                      active
                        ? isDark
                          ? "text-purple-300"
                          : "text-blue-500"
                        : ""
                    }
                  >
                    {item.icon}
                  </span>
                  {item.label}
                  <CountPill count={item.count} />
                  {active && (
                    <motion.div
                      // layoutId="navIndicator"  <-- УБРАТЬ (это вызывает баг)
                      initial={{ opacity: 0, width: 0, scale: 0.5 }}
                      animate={{ opacity: 1, width: 24, scale: 1 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className={`absolute bottom-1.5 left-1/2 -translate-x-1/2 h-0.5 rounded-full ${
                        isDark
                          ? "bg-gradient-to-r from-indigo-400 to-purple-400"
                          : "bg-blue-500"
                      }`}
                    />
                  )}
                </Link>
              );
            })}

            {/* More */}
            {overflowMenuItems.length > 0 && (
              <div
                className="relative"
                onMouseEnter={() => setIsMenuOpen(true)}
                onMouseLeave={() => setIsMenuOpen(false)}
              >
                <button
                  className={`px-3.5 py-2 rounded-xl text-sm font-medium flex items-center gap-1.5 transition-all duration-200 ${
                    isMenuOpen
                      ? isDark
                        ? "text-white bg-white/10"
                        : "text-blue-700 bg-blue-50/80"
                      : isDark
                        ? "text-white/50 hover:text-white/80 hover:bg-white/[0.06]"
                        : "text-gray-500 hover:text-gray-800 hover:bg-gray-100/70"
                  }`}
                >
                  Ещё
                  <motion.span
                    animate={{ rotate: isMenuOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown size={13} />
                  </motion.span>
                </button>

                <AnimatePresence>
                  {isMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className={`absolute top-full right-0 mt-5 w-72 rounded-2xl overflow-hidden z-50 origin-top-right ${dropGlass}`}
                    >
                      <div className="p-2">
                        {overflowMenuItems.map((item) => {
                          const active = isActive(item.href);
                          return (
                            <Link
                              key={item.id}
                              href={item.href}
                              className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-150 ${
                                active
                                  ? isDark
                                    ? "bg-white/10"
                                    : "bg-blue-50"
                                  : isDark
                                    ? "hover:bg-white/[0.07]"
                                    : "hover:bg-gray-50"
                              }`}
                            >
                              <div
                                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                                  active
                                    ? isDark
                                      ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white"
                                      : "bg-blue-500 text-white"
                                    : isDark
                                      ? "bg-white/10 text-white/60"
                                      : "bg-gray-100 text-gray-500"
                                }`}
                              >
                                {item.icon}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <span
                                    className={`font-semibold text-sm ${
                                      active
                                        ? isDark
                                          ? "text-white"
                                          : "text-blue-700"
                                        : isDark
                                          ? "text-white/80"
                                          : "text-gray-700"
                                    }`}
                                  >
                                    {item.label}
                                  </span>
                                  <CountPill count={item.count} />
                                </div>
                                <p
                                  className={`text-xs mt-0.5 ${isDark ? "text-white/40" : "text-gray-400"}`}
                                >
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

          {/* Profile */}
          <div className="relative pd shrink-0">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className={`pt flex items-center gap-2.5 px-2 py-1.5 rounded-xl transition-all duration-200 ${
                isDark ? "hover:bg-white/[0.07]" : "hover:bg-gray-100/70"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-md ${
                  isDark
                    ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-purple-500/30"
                    : "bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-blue-500/20"
                }`}
              >
                {(user.name || "?").charAt(0).toUpperCase()}
              </div>
              <div className={`${isRounded ? "hidden" : "hidden xl:block"} text-left`}>
                <p
                  className={`text-sm font-semibold leading-tight ${isDark ? "text-white/90" : "text-gray-800"}`}
                >
                  {user.name?.split(" ")[0] || "Пользователь"}
                </p>
                <p
                  className={`text-xs leading-tight ${isDark ? "text-white/40" : "text-gray-400"}`}
                >
                  {user.role === "admin" ? "Администратор" : "Мастер"}
                </p>
              </div>
              <motion.span
                animate={{ rotate: isProfileOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown
                  size={13}
                  className={isDark ? "text-white/30" : "text-gray-400"}
                />
              </motion.span>
            </button>

            <AnimatePresence>
              {isProfileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className={`absolute top-full right-0 mt-4 ${isRounded ? "w-56" : "w-64"} rounded-2xl overflow-hidden z-50 ${dropGlass}`}
                >
                  {/* Header */}
                  <div
                    className={`px-4 py-4 border-b ${isDark ? "border-white/10" : "border-gray-100"}`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center text-base font-bold ${
                          isDark
                            ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white"
                            : "bg-gradient-to-br from-blue-500 to-purple-600 text-white"
                        }`}
                      >
                        {(user.name || "?").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p
                          className={`font-bold text-sm ${isDark ? "text-white/90" : "text-gray-900"}`}
                        >
                          {user.name}
                        </p>
                        <p
                          className={`text-xs mt-0.5 ${isDark ? "text-white/40" : "text-gray-400"}`}
                        >
                          {user.role === "admin" ? "Администратор" : "Мастер"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        setIsSettingsModalOpen(true);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left ${
                        isDark
                          ? "hover:bg-white/[0.07] text-white/70"
                          : "hover:bg-gray-50 text-gray-600"
                      }`}
                    >
                      <SlidersHorizontal size={16} />
                      <span className="text-sm font-medium">Настройки</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left ${
                        isDark
                          ? "hover:bg-red-500/10 text-red-400"
                          : "hover:bg-red-50 text-red-500"
                      }`}
                    >
                      <LogOut size={16} />
                      <span className="text-sm font-medium">Выйти</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      <div className="pointer-events-none absolute -left-[9999px] top-0 invisible hidden lg:block">
        <div className="flex items-center gap-0.5">
          {primaryDesktopItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={`measure-${item.id}`}
                href={item.href}
                ref={(node) => {
                  itemMeasureRefs.current[item.id] = node;
                }}
                className={`relative px-3.5 py-2 rounded-xl text-sm font-medium flex items-center gap-2 whitespace-nowrap ${
                  active
                    ? isDark
                      ? "text-white bg-white/10"
                      : "text-blue-700 bg-blue-50/80"
                    : isDark
                      ? "text-white/50"
                      : "text-gray-500"
                }`}
              >
                <span
                  className={
                    active
                      ? isDark
                        ? "text-purple-300"
                        : "text-blue-500"
                      : ""
                  }
                >
                  {item.icon}
                </span>
                {item.label}
                <CountPill count={item.count} />
              </Link>
            );
          })}
          <button
            ref={moreButtonMeasureRef}
            className={`px-3.5 py-2 rounded-xl text-sm font-medium flex items-center gap-1.5 whitespace-nowrap ${
              isDark ? "text-white/50" : "text-gray-500"
            }`}
            type="button"
          >
            Ещё
            <ChevronDown size={13} />
          </button>
        </div>
      </div>

      {/* ── MOBILE HEADER ───────────────────────────────────── */}
      <header
        className={`lg:hidden fixed top-0 left-0 right-0 z-50 h-16 border-b transition-all duration-300 ${glassCls}`}
      >
        <div className="px-4 h-full flex items-center justify-between">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className={`mt p-2 -ml-1 rounded-xl transition-colors ${
              isDark
                ? "text-white/60 hover:bg-white/[0.07]"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Menu size={20} />
          </button>

          <Link
            href={ADMIN_ROUTES.DASHBOARD}
            className="flex items-center gap-2.5"
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                isDark
                  ? "bg-gradient-to-br from-indigo-500 to-purple-600"
                  : "bg-gradient-to-br from-blue-500 to-purple-600"
              }`}
            >
              <Scissors className="w-4 h-4 text-white fill-white" />
            </div>
            <span
              className={`font-black tracking-[3px] text-sm uppercase ${
                isDark
                  ? "bg-gradient-to-r from-white to-purple-300 bg-clip-text text-transparent"
                  : "text-gray-900"
              }`}
            >
              ЭДЭН
            </span>
          </Link>

          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              isDark
                ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white"
                : "bg-gradient-to-br from-blue-500 to-purple-600 text-white"
            }`}
          >
            {(user.name || "?").charAt(0).toUpperCase()}
          </div>
        </div>
      </header>

      {/* ── MOBILE DRAWER ───────────────────────────────────── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden fixed inset-0 z-50"
              style={{
                background: isDark ? "rgba(0,0,0,0.6)" : "rgba(0,0,0,0.3)",
                backdropFilter: "blur(4px)",
              }}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className={`md lg:hidden fixed top-0 left-0 bottom-0 w-80 z-50 overflow-y-auto ${
                isDark
                  ? "bg-slate-900/95 backdrop-blur-2xl border-r border-white/10"
                  : "bg-white border-r border-gray-200/70"
              }`}
            >
              {/* Drawer top */}
              <div
                className={`relative px-5 pt-6 pb-5 ${
                  isDark
                    ? "bg-gradient-to-br from-indigo-900/60 via-purple-900/60 to-slate-900/60 border-b border-white/10"
                    : "bg-gradient-to-br from-blue-50 to-purple-50/50 border-b border-gray-100"
                }`}
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isDark
                          ? "bg-gradient-to-br from-indigo-500 to-purple-600"
                          : "bg-gradient-to-br from-blue-500 to-purple-600"
                      }`}
                    >
                      <Zap className="w-5 h-5 text-white fill-white" />
                    </div>
                    <div>
                      <h2
                        className={`font-black tracking-widest text-sm uppercase ${isDark ? "text-white" : "text-gray-900"}`}
                      >
                        ЭДЭН
                      </h2>
                      <p
                        className={`text-xs ${isDark ? "text-white/40" : "text-gray-400"}`}
                      >
                        {isAdmin ? "Администратор" : "Мастер"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`p-1.5 rounded-lg transition-colors ${isDark ? "text-white/50 hover:bg-white/10" : "text-gray-500 hover:bg-gray-100"}`}
                  >
                    <X size={18} />
                  </button>
                </div>

                <div
                  className={`flex items-center gap-3 p-3 rounded-2xl ${
                    isDark
                      ? "bg-white/[0.07] border border-white/[0.1]"
                      : "bg-white/80 border border-gray-200/60 shadow-sm"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-base font-bold flex-shrink-0 ${
                      isDark
                        ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white"
                        : "bg-gradient-to-br from-blue-500 to-purple-600 text-white"
                    }`}
                  >
                    {(user.name || "?").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p
                      className={`font-semibold text-sm ${isDark ? "text-white/90" : "text-gray-800"}`}
                    >
                      {user.name || "Пользователь"}
                    </p>
                    <p
                      className={`text-xs ${isDark ? "text-white/40" : "text-gray-400"}`}
                    >
                      {user.role === "admin" ? "Администратор" : "Мастер"}
                    </p>
                  </div>
                </div>
              </div>

              <nav className="p-3 space-y-0.5">
                {menuItems.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-150 ${
                        active
                          ? isDark
                            ? "bg-white/[0.1] border border-white/[0.1] shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
                            : "bg-blue-50 border border-blue-100"
                          : isDark
                            ? "hover:bg-white/[0.06]"
                            : "hover:bg-gray-50"
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          active
                            ? isDark
                              ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white"
                              : "bg-blue-500 text-white"
                            : isDark
                              ? "bg-white/[0.08] text-white/50"
                              : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {item.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span
                            className={`font-semibold text-sm ${
                              active
                                ? isDark
                                  ? "text-white"
                                  : "text-blue-700"
                                : isDark
                                  ? "text-white/75"
                                  : "text-gray-700"
                            }`}
                          >
                            {item.label}
                          </span>
                          <CountPill count={item.count} />
                        </div>
                        <p
                          className={`text-xs truncate mt-0.5 ${isDark ? "text-white/35" : "text-gray-400"}`}
                        >
                          {item.description}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </nav>

              <div
                className={`p-3 border-t mt-2 ${isDark ? "border-white/10" : "border-gray-100"}`}
              >
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsSettingsModalOpen(true);
                  }}
                  className={`w-full flex items-center justify-center gap-2 p-3 rounded-xl text-sm font-semibold transition-colors mb-2 ${
                    isDark
                      ? "bg-white/[0.07] text-white/70 hover:bg-white/[0.1]"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <SlidersHorizontal size={16} />
                  Настройки
                </button>
                <button
                  onClick={handleLogout}
                  className={`w-full flex items-center justify-center gap-2 p-3 rounded-xl text-sm font-semibold transition-colors ${
                    isDark
                      ? "bg-red-500/10 text-red-400 hover:bg-red-500/15"
                      : "bg-red-50 text-red-500 hover:bg-red-100"
                  }`}
                >
                  <LogOut size={16} />
                  Выйти из аккаунта
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── MODAL WINDOW (SETTINGS) ─────────────────────────── */}
      <AnimatePresence>
        {isSettingsModalOpen && (
          <>
            {/* Overlay with blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSettingsModalOpen(false)}
              className={`fixed inset-0 z-[100] ${modalOverlay}`}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl ${modalContent}`}
            >
              {/* Modal header */}
              <div
                className={`flex items-center justify-between p-6 border-b ${isDark ? "border-white/10" : "border-gray-100"}`}
              >
                <h2
                  className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}
                >
                  Настройки
                </h2>
                <button
                  onClick={() => setIsSettingsModalOpen(false)}
                  className={`p-2 rounded-lg transition-colors ${
                    isDark
                      ? "hover:bg-white/10 text-white/60"
                      : "hover:bg-gray-100 text-gray-500"
                  }`}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal body - Settings content */}
              <div className="p-6 space-y-8">
                {/* Theme Setting Card */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3
                        className={`text-base font-semibold ${isDark ? "text-white" : "text-gray-900"}`}
                      >
                        Тема оформления
                      </h3>
                      <p
                        className={`text-sm mt-1 ${isDark ? "text-white/40" : "text-gray-400"}`}
                      >
                        Выберите цветовую схему интерфейса
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {/* Light Theme Option */}
                    <button
                      onClick={() => handleThemeChange("light")}
                      className={`group relative p-4 rounded-xl transition-all duration-200 ${
                        !isDark
                          ? "ring-2 ring-blue-500 bg-blue-50/80"
                          : isDark
                            ? "bg-white/5 hover:bg-white/10 border border-white/10"
                            : "bg-gray-50 hover:bg-gray-100 border border-gray-200"
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div
                          className={`p-2 rounded-lg ${!isDark ? "bg-blue-500 text-white" : isDark ? "bg-white/10 text-white/60" : "bg-gray-200 text-gray-500"}`}
                        >
                          <Sun size={20} />
                        </div>
                        <span
                          className={`text-sm font-medium ${!isDark ? "text-blue-600" : isDark ? "text-white/80" : "text-gray-700"}`}
                        >
                          Светлая
                        </span>
                      </div>
                      {!isDark && (
                        <motion.div
                          layoutId="themeIndicator"
                          className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-blue-500"
                        />
                      )}
                    </button>

                    {/* Dark Theme Option */}
                    <button
                      onClick={() => handleThemeChange("dark")}
                      className={`group relative p-4 rounded-xl transition-all duration-200 ${
                        isDark &&
                        !document.documentElement.classList.contains("dark") ===
                          false
                          ? "ring-2 ring-purple-500 bg-purple-500/10"
                          : isDark
                            ? "bg-white/5 hover:bg-white/10 border border-white/10"
                            : "bg-gray-50 hover:bg-gray-100 border border-gray-200"
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div
                          className={`p-2 rounded-lg ${isDark ? "bg-purple-500 text-white" : "bg-gray-200 text-gray-500"}`}
                        >
                          <Moon size={20} />
                        </div>
                        <span
                          className={`text-sm font-medium ${isDark ? "text-purple-400" : "text-gray-700"}`}
                        >
                          Тёмная
                        </span>
                      </div>
                      {isDark && (
                        <motion.div
                          layoutId="themeIndicator"
                          className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-purple-500"
                        />
                      )}
                    </button>

                    {/* System Theme Option */}
                    <button
                      onClick={() => handleThemeChange("system")}
                      className={`group relative p-4 rounded-xl transition-all duration-200 ${
                        isDark
                          ? "bg-white/5 hover:bg-white/10 border border-white/10"
                          : "bg-gray-50 hover:bg-gray-100 border border-gray-200"
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div
                          className={`p-2 rounded-lg ${isDark ? "bg-white/10 text-white/60" : "bg-gray-200 text-gray-500"}`}
                        >
                          <Monitor size={20} />
                        </div>
                        <span
                          className={`text-sm font-medium ${isDark ? "text-white/80" : "text-gray-700"}`}
                        >
                          Системная
                        </span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Navbar Size Setting Card */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3
                        className={`text-base font-semibold ${isDark ? "text-white" : "text-gray-900"}`}
                      >
                        Размер навбара
                      </h3>
                      <p
                        className={`text-sm mt-1 ${isDark ? "text-white/40" : "text-gray-400"}`}
                      >
                        Настройте ширину и отображение панели навигации
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Compact Size Option */}
                    <button
                      onClick={() => handleNavbarSizeChange("compact")}
                      className={`group relative p-4 rounded-xl transition-all duration-200 ${
                        isRounded
                          ? "ring-2 ring-purple-500 bg-purple-500/10"
                          : isDark
                            ? "bg-white/5 hover:bg-white/10 border border-white/10"
                            : "bg-gray-50 hover:bg-gray-100 border border-gray-200"
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div
                          className={`p-2 rounded-lg ${isRounded ? "bg-purple-500 text-white" : isDark ? "bg-white/10 text-white/60" : "bg-gray-200 text-gray-500"}`}
                        >
                          <Minimize2 size={20} />
                        </div>
                        <span
                          className={`text-sm font-medium ${isRounded ? "text-purple-400" : isDark ? "text-white/80" : "text-gray-700"}`}
                        >
                          Компактный
                        </span>
                        <p
                          className={`text-xs text-center mt-1 ${isDark ? "text-white/30" : "text-gray-400"}`}
                        >
                          Суженный, плавающий
                        </p>
                      </div>
                      {isRounded && (
                        <motion.div
                          layoutId="navbarIndicator"
                          className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-purple-500"
                        />
                      )}
                    </button>

                    {/* Default Size Option */}
                    <button
                      onClick={() => handleNavbarSizeChange("default")}
                      className={`group relative p-4 rounded-xl transition-all duration-200 ${
                        !isRounded
                          ? "ring-2 ring-blue-500 bg-blue-500/50"
                          : isDark
                            ? "bg-white/5 hover:bg-white/10 border border-white/10"
                            : "bg-gray-50 hover:bg-gray-100 border border-gray-200"
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div
                          className={`p-2 rounded-lg ${!isRounded ? "bg-blue-500 text-white" : isDark ? "bg-white/10 text-white/60" : "bg-gray-200 text-gray-500"}`}
                        >
                          <Maximize2 size={20} className="rotate-90" />
                        </div>
                        <span
                          className={`text-sm font-medium ${!isRounded ? "text-white" : isDark ? "text-white/80" : "text-gray-700"}`}
                        >
                          Стандартный
                        </span>
                        <p
                          className={`text-xs text-center mt-1 ${isDark ? "text-white/30" : "text-gray-400"}`}
                        >
                          Полная ширина
                        </p>
                      </div>
                      {!isRounded && (
                        <motion.div
                          layoutId="navbarIndicator"
                          className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-blue-500"
                        />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Modal footer */}
              <div
                className={`flex justify-end gap-3 p-6 border-t ${isDark ? "border-white/10" : "border-gray-100"}`}
              >
                <button
                  onClick={() => setIsSettingsModalOpen(false)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    isDark
                      ? "bg-white/10 text-white/70 hover:bg-white/15"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Закрыть
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="h-16" />
    </>
  );
}
