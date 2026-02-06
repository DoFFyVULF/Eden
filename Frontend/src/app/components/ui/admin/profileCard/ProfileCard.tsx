"use client";

import { useRouter } from "next/navigation";
import { authService } from "@/services/auth/auth.service";
import { removeFromStorage } from "@/services/auth/auth-token.service";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LogOut, 
  User, 
  Settings, 
  ChevronDown,
  Shield,
  UserCog,
  CheckCircle,
  Power
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

type ProfileCardProps = {
  img: string;
  name: string;
  role: string;
  email?: string;
  showStatus?: boolean;
  status?: "online" | "offline" | "away";
};

export default function ProfileCard({
  img,
  name,
  role,
  email,
  showStatus = false,
  status = "online"
}: ProfileCardProps) {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Закрытие dropdown при клике вне его
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    
    try {
      await authService.logout();
      removeFromStorage();
      
      toast.success("Вы успешно вышли из системы", {
        duration: 2000,
        position: "top-center",
      });
      
      // Небольшая задержка для анимации
      setTimeout(() => {
        router.push("/auth");
        router.refresh();
      }, 800);
      
    } catch (error) {
      toast.error("Ошибка при выходе из системы", {
        description: "Попробуйте еще раз",
        duration: 3000,
      });
      setIsLoggingOut(false);
    }
  };

  const statusColors = {
    online: "bg-emerald-500",
    away: "bg-amber-500",
    offline: "bg-gray-400"
  };

  const statusText = {
    online: "В сети",
    away: "Отошел",
    offline: "Не в сети"
  };

  const dropdownVariants = {
    hidden: {
      opacity: 0,
      y: -10,
      scale: 0.95,
      transition: {
        duration: 0.2
      }
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.2,
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Основная карточка */}
      <motion.div
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className="relative overflow-hidden bg-gradient-to-br from-white to-gray-50 rounded-2xl p-4 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 cursor-pointer group"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      >
        {/* Анимированный фон при наведении */}
        <motion.div
          initial={false}
          animate={{
            opacity: isHovered ? 1 : 0,
            scale: isHovered ? 1 : 0.8
          }}
          className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5"
        />
        
        {/* Контент */}
        <div className="relative z-10 flex items-center space-x-3">
          {/* Аватар с градиентной обводкой и статусом */}
          <div className="relative">
            <div className="relative w-14 h-14 rounded-full overflow-hidden ring-4 ring-white shadow-lg">
              <img
                src={img}
                alt={name}
                className="w-full h-full object-cover"
              />
              {/* Градиентная обводка */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 opacity-20" />
            </div>
            
            {/* Статус (если включен) */}
            {showStatus && (
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${statusColors[status]}`}>
                <div className="absolute inset-0 rounded-full bg-white/30 animate-ping" />
              </div>
            )}
          </div>

          {/* Информация */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-800 truncate">
                  {name}
                </h3>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700">
                    {role === "Администратор" ? (
                      <Shield className="w-3 h-3 mr-1" />
                    ) : (
                      <UserCog className="w-3 h-3 mr-1" />
                    )}
                    {role}
                  </span>
                  
                  {showStatus && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[status]} text-white`}>
                      {statusText[status]}
                    </span>
                  )}
                </div>
                
                {email && (
                  <p className="text-xs text-gray-500 truncate mt-1">
                    {email}
                  </p>
                )}
              </div>
              
              {/* Кнопка с анимацией */}
              <motion.div
                animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                className="ml-2"
              >
                <ChevronDown className={`w-5 h-5 ${isDropdownOpen ? "text-blue-500" : "text-gray-400"} group-hover:text-blue-500 transition-colors`} />
              </motion.div>
            </div>
          </div>
        </div>

        {/* Прогресс бар при выходе */}
        {isLoggingOut && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
          >
            <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse" />
          </motion.div>
        )}
      </motion.div>

      {/* Dropdown меню */}
      <AnimatePresence>
        {isDropdownOpen && (
          <motion.div
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="absolute bottom-full left-0 right-0 mb-2 z-50 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden"
          >
            {/* Заголовок dropdown */}
            <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-100">
              <p className="text-xs font-medium text-gray-600">Управление профилем</p>
            </div>
            
            {/* Список опций */}
            <div className="p-2">
              <motion.button
                variants={itemVariants}
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.95 }}
                className="w-full flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                onClick={() => {
                  router.push("/profile");
                  setIsDropdownOpen(false);
                }}
              >
                <User className="w-4 h-4 mr-3 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Мой профиль</span>
              </motion.button>
              
              <motion.button
                variants={itemVariants}
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.95 }}
                className="w-full flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                onClick={() => {
                  router.push("/settings");
                  setIsDropdownOpen(false);
                }}
              >
                <Settings className="w-4 h-4 mr-3 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Настройки</span>
              </motion.button>
              
              {role === "Администратор" && (
                <motion.button
                  variants={itemVariants}
                  whileHover={{ x: 5 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                  onClick={() => {
                    router.push("/admin/settings");
                    setIsDropdownOpen(false);
                  }}
                >
                  <Shield className="w-4 h-4 mr-3 text-blue-500" />
                  <span className="text-sm font-medium text-gray-700">Админ панель</span>
                </motion.button>
              )}
              
              <div className="h-px bg-gray-100 my-1" />
              
              {/* Кнопка выхода с анимацией */}
              <motion.button
                variants={itemVariants}
                whileHover={{ x: 5, backgroundColor: "#FEE2E2" }}
                whileTap={{ scale: 0.95 }}
                disabled={isLoggingOut}
                onClick={handleLogout}
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                  isLoggingOut 
                    ? "bg-gradient-to-r from-red-100 to-red-50" 
                    : "hover:bg-red-50"
                }`}
              >
                <div className="flex items-center">
                  {isLoggingOut ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Power className="w-4 h-4 mr-3 text-red-500" />
                    </motion.div>
                  ) : (
                    <LogOut className="w-4 h-4 mr-3 text-red-500" />
                  )}
                  <span className={`text-sm font-medium ${
                    isLoggingOut ? "text-red-600" : "text-red-700"
                  }`}>
                    {isLoggingOut ? "Выход..." : "Выйти из системы"}
                  </span>
                </div>
                
                {isLoggingOut ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="w-2 h-2 rounded-full bg-red-500 animate-pulse"
                  />
                ) : (
                  <ChevronDown className="w-4 h-4 text-red-400 rotate-90" />
                )}
              </motion.button>
            </div>
            
            {/* Footer dropdown */}
            <div className="p-2 bg-gray-50 border-t border-gray-100">
              <p className="text-xs text-gray-500 text-center">
                Сессия активна
              </p>
              <div className="flex items-center justify-center mt-1">
                <CheckCircle className="w-3 h-3 text-emerald-500 mr-1" />
                <span className="text-xs text-emerald-600 font-medium">Безопасное соединение</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Подсказка */}
      {!isDropdownOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 0.7 : 0 }}
          className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-gray-800 text-white text-xs rounded-lg whitespace-nowrap"
        >
          Нажмите для настроек
        </motion.div>
      )}
    </div>
  );
}