"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, Variant, Variants } from "framer-motion";
import {
  Menu,
  X,
  ChevronRight,
  Home,
  Settings,
  User,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ProfileCard from "../profileCard/ProfileCard";

type NavigationProps = {
  isAdmin: boolean;
  menuItems: Array<{
    id: number;
    label: string;
    href: string;
    icon: React.ReactNode;
    description: string;
    count?: string | number;
  }>;
  user: {
    name: string;
    role: string;
    profileImg?: string;
    email?: string;
  };
};

export default function ResponsiveNavigation({
  isAdmin,
  menuItems,
  user,
}: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

  // Функция для блокировки скролла body
  const toggleBodyScroll = useCallback((shouldBlock: boolean) => {
    if (shouldBlock) {
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
      window.scrollTo(0, parseInt(scrollY || "0") * -1);
    }
  }, []);

  // Определяем тип устройства
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Управление скроллом при открытии/закрытии меню
  useEffect(() => {
    if (isMobile && isOpen) {
      toggleBodyScroll(true);
    } else {
      toggleBodyScroll(false);
    }

    return () => {
      toggleBodyScroll(false);
    };
  }, [isMobile, isOpen, toggleBodyScroll]);

  // Закрываем меню при изменении роута на мобиле
  useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
    }
  }, [pathname, isMobile]);

  // Проверка активного пункта меню
  const isActive = useCallback(
    (href: string) => {
      return pathname === href || pathname.startsWith(`${href}/`);
    },
    [pathname],
  );

  // Анимации для мобильного меню - исправлено для правильной типизации
  const mobileMenuVariants: Variants = {
    closed: {
      x: "-100%",
      transition: {
        type: "spring" as const,
        stiffness: 400,
        damping: 40,
      },
    },
    open: {
      x: 0,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 30,
      },
    },
  };

  // Desktop Sidebar
  const DesktopSidebar = () => (
    <aside className="hidden lg:flex flex-col w-64 xl:w-72 h-screen bg-white/80 backdrop-blur-sm border-r border-gray-200/50 sticky top-0 shadow-lg shadow-gray-200/20">
      {/* Заголовок */}
      <div className="p-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-8 -mt-8"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-8 -mb-8"></div>
        <div className="relative z-10 text-center">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold text-white mb-2"
          >
            Панель управления
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-blue-100/80 text-sm"
          >
            {isAdmin ? "Административная панель" : "Панель мастера"}
          </motion.p>
        </div>
      </div>

      {/* Навигация */}
      <nav className="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">
            Основное меню
          </h3>

          <ul className="space-y-2">
            {menuItems.map((item, index) => {
              const active = isActive(item.href);
              return (
                <motion.li
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    href={item.href}
                    className={`group relative w-full flex items-center p-3 rounded-xl 
                               transition-all duration-300 overflow-hidden
                               ${
                                 active
                                   ? "bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-200/50 shadow-lg shadow-blue-500/5"
                                   : "hover:bg-white hover:shadow-md hover:shadow-gray-200/50"
                               }`}
                  >
                    {/* Активный индикатор */}
                    {active && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-blue-500 to-purple-500 rounded-r-full"
                      />
                    )}

                    {/* Иконка */}
                    <div
                      className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center mr-3 transition-all duration-300
                                  ${
                                    active
                                      ? "bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/30"
                                      : "bg-gray-100 group-hover:bg-gradient-to-br group-hover:from-blue-500 group-hover:to-purple-500 group-hover:shadow-lg group-hover:shadow-blue-500/20"
                                  }`}
                    >
                      <div
                        className={`transition-colors duration-300 ${
                          active
                            ? "text-white"
                            : "text-gray-600 group-hover:text-white"
                        }`}
                      >
                        {item.icon}
                      </div>
                    </div>

                    {/* Контент */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span
                          className={`font-medium truncate ${
                            active ? "text-gray-900" : "text-gray-700"
                          }`}
                        >
                          {item.label}
                        </span>
                        {item.count && item.count !== "-" && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className={`text-xs font-bold px-2 py-1 rounded-full ml-2
                                          ${
                                            active
                                              ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                                              : "bg-gray-100 text-gray-600 group-hover:bg-gradient-to-r group-hover:from-blue-500 group-hover:to-purple-500 group-hover:text-white"
                                          }`}
                          >
                            {item.count}
                          </motion.span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 truncate mt-0.5 group-hover:text-gray-600">
                        {item.description}
                      </p>
                    </div>

                    {/* Стрелка */}
                    <motion.div
                      animate={{ x: active ? 5 : 0 }}
                      className={`ml-2 flex-shrink-0 transition-colors duration-300 
                                             ${
                                               active
                                                 ? "text-blue-500"
                                                 : "text-gray-400 group-hover:text-blue-500"
                                             }`}
                    >
                      <ChevronRight size={16} />
                    </motion.div>
                  </Link>
                </motion.li>
              );
            })}
          </ul>
        </div>

        {/* Профиль */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 pt-6 border-t border-gray-200/50"
        >
          <ProfileCard
            img={
              user.profileImg ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                user.name,
              )}&background=4f46e5&color=fff&bold=true`
            }
            name={user.name}
            role={user.role}
          />
        </motion.div>
      </nav>
    </aside>
  );

  // Mobile Header with Drawer
  const MobileHeader = () => (
    <>
      {/* Мобильный хедер */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-lg shadow-gray-200/20"
      >
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsOpen(true)}
              className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100/50 transition-colors"
              aria-label="Открыть меню"
            >
              <Menu size={24} />
            </motion.button>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {isAdmin ? "Админ-панель" : "Мастер"}
              </h1>
              <p className="text-xs text-gray-500">
                Добро пожаловать, {user.name.split(" ")[0]}
              </p>
            </div>
          </div>

          {/* Аватар в хедере */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg shadow-blue-500/30"
            onClick={() => setIsOpen(true)}
            aria-label="Открыть профиль"
          >
            {user.name.charAt(0).toUpperCase()}
          </motion.button>
        </div>
      </motion.header>

      {/* Мобильное меню (drawer) */}
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            key="mobile-drawer"
            className="fixed inset-0 z-50 lg:hidden"
            initial="closed"
            animate="open"
            exit="closed"
            variants={mobileMenuVariants}
          >
            {/* Overlay */}
            <motion.div
              className="absolute inset-0 bg-black/30 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsOpen(false)}
            />

            {/* Меню */}
            <motion.div
              className="absolute top-0 left-0 bottom-0 w-80 max-w-full bg-white/95 backdrop-blur-xl shadow-2xl overflow-y-auto"
              style={{
                overscrollBehavior: "contain",
                WebkitOverflowScrolling: "touch",
              }}
              variants={{
                closed: {
                  x: "-100%",
                },
                open: {
                  x: 0,
                }
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30
              }}
            >
              {/* Заголовок меню */}
              <div className="p-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-8 -mt-8"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-8 -mb-8"></div>

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold">Меню</h2>
                      <p className="text-blue-100/80 text-sm">
                        {isAdmin ? "Администратор" : "Мастер"}
                      </p>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setIsOpen(false)}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
                      aria-label="Закрыть меню"
                    >
                      <X size={24} />
                    </motion.button>
                  </div>

                  <div className="mb-4">
                    <ProfileCard
                      img={
                        user.profileImg ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          user.name,
                        )}&background=4f46e5&color=fff&bold=true`
                      }
                      name={user.name}
                      role={user.role}
                      compact={true}
                    />
                  </div>
                </div>
              </div>

              {/* Навигация */}
              <nav className="p-4">
                <ul className="space-y-2">
                  {menuItems.map((item) => {
                    const active = isActive(item.href);

                    return (
                      <motion.li
                        key={item.id}
                        whileHover={{ x: 5 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Link
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className={`flex items-center p-4 rounded-xl transition-all duration-200
                            ${
                              active
                                ? "bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-200/50"
                                : "hover:bg-gray-50/80"
                            }`}
                        >
                          <div
                            className={`mr-3 transition-colors duration-200 ${
                              active ? "text-blue-500" : "text-gray-500"
                            }`}
                          >
                            {item.icon}
                          </div>

                          <div className="flex-1">
                            <div
                              className={`font-medium ${
                                active ? "text-gray-900" : "text-gray-700"
                              }`}
                            >
                              {item.label}
                            </div>
                            <div className="text-sm text-gray-500">
                              {item.description}
                            </div>
                          </div>

                          {item.count && item.count !== "-" && (
                            <span
                              className={`ml-2 px-2 py-1 text-xs font-bold rounded-full
                                ${
                                  active
                                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                                    : "bg-gray-100 text-gray-600"
                                }`}
                            >
                              {item.count}
                            </span>
                          )}

                          <ChevronRight
                            className={`ml-2 transition-colors duration-200 ${
                              active ? "text-blue-500" : "text-gray-400"
                            }`}
                            size={16}
                          />
                        </Link>
                      </motion.li>
                    );
                  })}
                </ul>

                {/* Быстрый доступ */}
                <div className="mt-8 pt-6 border-t border-gray-200/50">
                  <div className="text-sm text-gray-600 px-2 mb-4 font-medium">
                    Быстрый доступ
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href="/"
                      onClick={() => setIsOpen(false)}
                      className="p-3 bg-gradient-to-br from-gray-50 to-white rounded-xl text-center hover:from-blue-50 hover:to-purple-50 transition-all duration-300 border border-gray-200/50 hover:border-blue-200/50 group"
                    >
                      <Home className="w-5 h-5 mx-auto mb-1 text-gray-600 group-hover:text-blue-500 transition-colors" />
                      <div className="text-xs font-medium text-gray-700 group-hover:text-gray-900">
                        Главная
                      </div>
                    </Link>

                    <Link
                      href="/profile"
                      onClick={() => setIsOpen(false)}
                      className="p-3 bg-gradient-to-br from-gray-50 to-white rounded-xl text-center hover:from-blue-50 hover:to-purple-50 transition-all duration-300 border border-gray-200/50 hover:border-blue-200/50 group"
                    >
                      <User className="w-5 h-5 mx-auto mb-1 text-gray-600 group-hover:text-blue-500 transition-colors" />
                      <div className="text-xs font-medium text-gray-700 group-hover:text-gray-900">
                        Профиль
                      </div>
                    </Link>
                  </div>
                </div>
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Отступ для фиксированного хедера */}
      <div className="lg:hidden h-16" />
    </>
  );

  return <>{isMobile ? <MobileHeader /> : <DesktopSidebar />}</>;
}