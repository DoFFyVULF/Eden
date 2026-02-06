"use client";

import { ADMIN_ROUTES } from "@/app/lib/admin.routes";
import { adminService, AdminCounts } from "@/services/admin/admin.service";
import { usePathname } from "next/navigation";
import Link from "next/link";
import ProfileCard from "../profileCard/ProfileCard";
import { useEffect, useState, useMemo, useCallback } from "react";
import { userService } from "@/services/user/user.service";
import { IUser } from "@/types/user.types";
import { MASTER_ROUTES } from "@/app/lib/master.routes";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { 
  CalendarDays, 
  Users, 
  Calendar, 
  FolderTree, 
  Settings, 
  Clock, 
  UserCog,
  BarChart3,
  ChevronRight,
  Menu,
  X
} from "lucide-react";

type AsideMenuProps = {
  isAdmin: boolean;
};

type MenuItem = {
  id: number;
  label: string;
  count: string | number;
  href: string;
  icon: React.ReactNode;
  color: string;
  description: string;
};

export default function AsideMenu({ isAdmin }: AsideMenuProps) {
  const pathname = usePathname();
  const [counts, setCounts] = useState<AdminCounts | null>(null);
  const [user, setUser] = useState<IUser | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Определяем мобильное устройство
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Загрузка данных
  useEffect(() => {
    const loadData = async () => {
      try {
        const [countsData, userData] = await Promise.all([
          adminService.getCounts(),
          userService.getMe().then(res => res.data)
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
  const iconComponents = {
    appointments: <CalendarDays size={22} />,
    masters: <Users size={22} />,
    schedule: <Calendar size={22} />,
    category: <FolderTree size={22} />,
    services: <Settings size={22} />,
    history: <Clock size={22} />,
    users: <UserCog size={22} />,
    analytics: <BarChart3 size={22} />
  };

  // Конфигурация меню с useMemo
  const menuItems = useMemo<MenuItem[]>(() => {
    const baseItems = [
      {
        id: 1,
        label: "Записи",
        count: counts?.appointments ?? "-",
        href: ADMIN_ROUTES.APPOINTMENTS.LIST,
        icon: iconComponents.appointments,
        color: "from-blue-500 to-cyan-500",
        description: "Управление записями клиентов"
      },
      {
        id: 2,
        label: "Сотрудники",
        count: counts?.masters ?? "-",
        href: ADMIN_ROUTES.MASTERS.LIST,
        icon: iconComponents.masters,
        color: "from-purple-500 to-pink-500",
        description: "Управление персоналом"
      },
      {
        id: 3,
        label: "Расписание",
        count: counts?.schedule ?? "-",
        href: ADMIN_ROUTES.SCHEDULE.OVERVIEW,
        icon: iconComponents.schedule,
        color: "from-green-500 to-emerald-500",
        description: "Настройка рабочего графика"
      },
      {
        id: 4,
        label: "Категории",
        count: counts?.category ?? "-",
        href: ADMIN_ROUTES.CATEGORY.LIST,
        icon: iconComponents.category,
        color: "from-orange-500 to-red-500",
        description: "Категории услуг"
      },
      {
        id: 5,
        label: "Услуги",
        count: counts?.services ?? "-",
        href: ADMIN_ROUTES.SERVICES.LIST,
        icon: iconComponents.services,
        color: "from-indigo-500 to-blue-500",
        description: "Список предоставляемых услуг"
      },
      {
        id: 6,
        label: "Цены услуг",
        count: counts?.services ?? "-",
        href: ADMIN_ROUTES.PRICES.MASTER,
        icon: <Settings size={22} />,
        color: "from-teal-500 to-green-500",
        description: "Управление прайс-листом"
      },
      {
        id: 7,
        label: "История",
        count: counts?.history ?? "-",
        href: ADMIN_ROUTES.APPOINTMENTS.HISTORY,
        icon: iconComponents.history,
        color: "from-gray-600 to-gray-800",
        description: "Архив завершенных записей"
      },
      {
        id: 8,
        label: "Пользователи",
        count: counts?.users ?? "-",
        href: ADMIN_ROUTES.USERS,
        icon: iconComponents.users,
        color: "from-violet-500 to-purple-500",
        description: "Управление пользователями"
      },
      {
        id: 9,
        label: 'Аналитика',
        count: '',
        href: ADMIN_ROUTES.ANALYTICS.DASHBOARD,
        icon: iconComponents.analytics,
        color: "from-amber-500 to-orange-500",
        description: "Отчеты и статистика"
      }
    ];

    const masterItems = [
      {
        id: 1,
        label: "Записи",
        count: counts?.appointments ?? "-",
        href: MASTER_ROUTES.APPOINTMENTS,
        icon: iconComponents.appointments,
        color: "from-blue-500 to-cyan-500",
        description: "Мои записи"
      },
      {
        id: 2,
        label: "Расписание",
        count: counts?.schedule ?? "-",
        href: MASTER_ROUTES.SCHEDULE,
        icon: iconComponents.schedule,
        color: "from-green-500 to-emerald-500",
        description: "Мое расписание"
      },
    ];

    return isAdmin ? baseItems : masterItems;
  }, [isAdmin, counts]);

  // Проверка активного пункта меню
  const isActive = useCallback((href: string) => {
    return pathname === href || pathname.startsWith(`${href}/`);
  }, [pathname]);

  // Анимации
  const sidebarVariants: Variants = {
    closed: {
      x: "-100%",
      opacity: 0,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 40
      }
    },
    open: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.3
      }
    })
  };

  // Определяем состояние анимации
  const animationState = isMobile ? (isOpen ? "open" : "closed") : "open";

  return (
    <>
      {/* Мобильная кнопка меню */}
      {isMobile && (
        <motion.button
          onClick={() => setIsOpen(true)}
          className="md:hidden fixed top-4 left-4 z-50 p-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Menu size={24} />
        </motion.button>
      )}

      {/* Overlay */}
      <AnimatePresence>
        {isOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Основное меню */}
      <motion.aside
        variants={sidebarVariants}
        initial={isMobile ? "closed" : "open"}
        animate={animationState}
        className={`fixed md:static inset-y-0 left-0 z-50 w-full max-w-[320px] md:max-w-[280px] lg:max-w-[300px] ${
          !isMobile ? "translate-x-0" : ""
        }`}
        style={{ 
          position: isMobile ? 'fixed' : 'relative',
          zIndex: isMobile ? 50 : 'auto'
        }}
      >
        <div className="flex flex-col h-full bg-gradient-to-b from-gray-50 to-white border-r border-gray-100 shadow-xl md:shadow-none">
          {/* Заголовок */}
          <div className="p-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 relative">
            {isMobile && (
              <div className="absolute top-4 right-4">
                <motion.button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors"
                  whileHover={{ rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X size={20} />
                </motion.button>
              </div>
            )}
            
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <h2 className="text-2xl font-bold text-white mb-2">
                Панель управления
              </h2>
              <p className="text-blue-100/80 text-sm">
                {isAdmin ? "Административная панель" : "Панель мастера"}
              </p>
            </motion.div>
          </div>

          {/* Навигация */}
          <nav className="flex-1 p-4 overflow-y-auto">
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
                      custom={index}
                      initial="hidden"
                      animate="visible"
                      variants={itemVariants}
                    >
                      <Link
                        href={item.href}
                        onClick={() => isMobile && setIsOpen(false)}
                        className={`group relative w-full flex items-center p-3 rounded-xl 
                                   transition-all duration-300 overflow-hidden
                                   ${active 
                                     ? "bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-200/50 shadow-lg" 
                                     : "hover:bg-gray-50 hover:shadow-md"
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
                        <div className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center mr-3
                                      ${active 
                                        ? `bg-gradient-to-br ${item.color} shadow-lg` 
                                        : "bg-gray-100 group-hover:bg-gradient-to-br group-hover:from-blue-500 group-hover:to-purple-500"
                                      }`}>
                          <div className={`${active ? "text-white" : "text-gray-600 group-hover:text-white"}`}>
                            {item.icon}
                          </div>
                        </div>

                        {/* Контент */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className={`font-medium truncate ${active ? "text-gray-900" : "text-gray-700"}`}>
                              {item.label}
                            </span>
                            {item.count && item.count !== '-' && (
                              <span className={`text-xs font-bold px-2 py-1 rounded-full ml-2
                                              ${active 
                                                ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white" 
                                                : "bg-gray-100 text-gray-600 group-hover:bg-gradient-to-r group-hover:from-blue-500 group-hover:to-purple-500 group-hover:text-white"
                                              }`}>
                                {item.count}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 truncate mt-0.5">
                            {item.description}
                          </p>
                        </div>

                        {/* Стрелка */}
                        <ChevronRight className={`ml-2 flex-shrink-0 transition-transform duration-300 
                                                 ${active ? "text-blue-500 rotate-90" : "text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1"}`} 
                                      size={16} />
                      </Link>
                    </motion.li>
                  );
                })}
              </ul>
            </div>

            {/* Профиль */}
            {user && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-8 pt-6 border-t border-gray-100"
              >
                <ProfileCard
                  img={
                    user.profileImg ??
                    "https://cdn01.justjared.com/wp-content/uploads/headlines/2025/10/madison-beer-locket.jpg"
                  }
                  name={user.name || user.login || "Пользователь"}
                  role={user.role === "admin" ? "Администратор" : "Мастер"}
                />
              </motion.div>
            )}
          </nav>
        </div>
      </motion.aside>
    </>
  );
}