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
  Power,
  X
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

type ProfileCardProps = {
  img: string;
  name: string;
  role: string;
  email?: string;
  showStatus?: boolean;
  status?: "online" | "offline" | "away";
  compact?: boolean;
  onMobileMenuOpen?: () => void; // Коллбэк для мобильного меню
};

export default function ProfileCard({
  img,
  name,
  role,
  email,
  showStatus = false,
  status = "online",
  compact = false,
  onMobileMenuOpen
}: ProfileCardProps) {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Определяем мобильное устройство
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
      y: -20,
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

  const mobileDropdownVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.95,
      transition: {
        duration: 0.3
      }
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.3,
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
  };

  // Мобильный dropdown с overlay
  const MobileDropdownOverlay = () => (
    <AnimatePresence>
      {isDropdownOpen && isMobile && (
        <>
          {/* Overlay для затемнения фона */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={() => setIsDropdownOpen(false)}
          >
            {/* Эффект размытия контента под overlay */}
            <div className="absolute inset-0 backdrop-blur-sm" />
          </motion.div>

          {/* Центрированный dropdown меню */}
          <motion.div
            variants={mobileDropdownVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-[320px] z-50 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
          >
            {/* Заголовок dropdown */}
            <div className="p-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-lg font-bold">Профиль</h3>
                  <p className="text-blue-100/80 text-sm">Управление аккаунтом</p>
                </div>
                <button
                  onClick={() => setIsDropdownOpen(false)}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Краткая информация о профиле */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden ring-2 ring-white">
                    <img
                      src={img}
                      alt={name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {showStatus && (
                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${statusColors[status]}`} />
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-semibold truncate">{name}</div>
                  <div className="text-blue-100/80 text-sm truncate">{role}</div>
                  {email && (
                    <div className="text-blue-100/60 text-xs truncate mt-1">{email}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Опции меню */}
            <div className="max-h-[60vh] overflow-y-auto p-2">
              <motion.button
                variants={itemVariants}
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.95 }}
                className="w-full flex items-center p-3 rounded-xl hover:bg-gray-50 transition-colors text-left"
                onClick={() => {
                  router.push("/profile");
                  setIsDropdownOpen(false);
                }}
              >
                <User className="w-5 h-5 mr-3 text-gray-500" />
                <span className="font-medium text-gray-700">Мой профиль</span>
              </motion.button>
              
              <motion.button
                variants={itemVariants}
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.95 }}
                className="w-full flex items-center p-3 rounded-xl hover:bg-gray-50 transition-colors text-left"
                onClick={() => {
                  router.push("/settings");
                  setIsDropdownOpen(false);
                }}
              >
                <Settings className="w-5 h-5 mr-3 text-gray-500" />
                <span className="font-medium text-gray-700">Настройки</span>
              </motion.button>
              
              {role === "Администратор" && (
                <motion.button
                  variants={itemVariants}
                  whileHover={{ x: 5 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full flex items-center p-3 rounded-xl hover:bg-gray-50 transition-colors text-left"
                  onClick={() => {
                    router.push("/admin/settings");
                    setIsDropdownOpen(false);
                  }}
                >
                  <Shield className="w-5 h-5 mr-3 text-blue-500" />
                  <span className="font-medium text-gray-700">Админ панель</span>
                </motion.button>
              )}
              
              <div className="h-px bg-gray-200 my-2" />
              
              <motion.button
                variants={itemVariants}
                whileHover={{ x: 5, backgroundColor: "#FEE2E2" }}
                whileTap={{ scale: 0.95 }}
                disabled={isLoggingOut}
                onClick={handleLogout}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
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
                      <Power className="w-5 h-5 mr-3 text-red-500" />
                    </motion.div>
                  ) : (
                    <LogOut className="w-5 h-5 mr-3 text-red-500" />
                  )}
                  <span className={`font-medium ${
                    isLoggingOut ? "text-red-600" : "text-red-700"
                  }`}>
                    {isLoggingOut ? "Выход..." : "Выйти из системы"}
                  </span>
                </div>
                
                {isLoggingOut && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="w-3 h-3 rounded-full bg-red-500 animate-pulse"
                  />
                )}
              </motion.button>
            </div>

            {/* Footer */}
            <div className="p-3 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-emerald-500 mr-2" />
                <span className="text-sm text-emerald-600 font-medium">Безопасное соединение</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  // Компактный режим
  if (compact) {
    return (
      <div className="relative" ref={dropdownRef}>
        {/* Компактная карточка */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
          className="relative overflow-hidden bg-gradient-to-br from-white to-gray-50 rounded-xl p-3 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 cursor-pointer group"
          onClick={() => {
            setIsDropdownOpen(!isDropdownOpen);
            // Если есть коллбэк для мобильного меню, вызываем его
            if (isMobile && onMobileMenuOpen && !isDropdownOpen) {
              onMobileMenuOpen();
            }
          }}
        >
          <div className="flex items-center space-x-3">
            {/* Аватар */}
            <div className="relative">
              <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-white shadow">
                <img
                  src={img}
                  alt={name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 opacity-20" />
              </div>
              
              {showStatus && (
                <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${statusColors[status]}`}>
                  <div className="absolute inset-0 rounded-full bg-white/20 animate-ping" />
                </div>
              )}
            </div>

            {/* Информация */}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-gray-800 truncate">
                {name}
              </h3>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 truncate max-w-[120px]">
                  {role === "Администратор" ? (
                    <Shield className="w-2.5 h-2.5 mr-1 flex-shrink-0" />
                  ) : (
                    <UserCog className="w-2.5 h-2.5 mr-1 flex-shrink-0" />
                  )}
                  <span className="truncate">{role}</span>
                </span>
              </div>
            </div>

            {/* Стрелка */}
            <motion.div
              animate={{ rotate: isDropdownOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className={`w-4 h-4 ${isDropdownOpen ? "text-blue-500" : "text-gray-400"} transition-colors`} />
            </motion.div>
          </div>

          {isLoggingOut && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"
            >
              <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse" />
            </motion.div>
          )}
        </motion.div>

        {/* На мобильных устройствах показываем модальное меню с overlay */}
        {isMobile ? (
          <MobileDropdownOverlay />
        ) : (
          /* На десктопе - обычный dropdown */
          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                variants={dropdownVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden min-w-[180px]"
              >
                <div className="p-2">
                  <motion.button
                    variants={itemVariants}
                    whileHover={{ x: 2 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center p-2 rounded-md hover:bg-gray-50 transition-colors text-left"
                    onClick={() => {
                      router.push("/profile");
                      setIsDropdownOpen(false);
                    }}
                  >
                    <User className="w-3.5 h-3.5 mr-2 text-gray-500" />
                    <span className="text-xs font-medium text-gray-700">Профиль</span>
                  </motion.button>
                  
                  <motion.button
                    variants={itemVariants}
                    whileHover={{ x: 2 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center p-2 rounded-md hover:bg-gray-50 transition-colors text-left"
                    onClick={() => {
                      router.push("/settings");
                      setIsDropdownOpen(false);
                    }}
                  >
                    <Settings className="w-3.5 h-3.5 mr-2 text-gray-500" />
                    <span className="text-xs font-medium text-gray-700">Настройки</span>
                  </motion.button>
                  
                  {role === "Администратор" && (
                    <motion.button
                      variants={itemVariants}
                      whileHover={{ x: 2 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full flex items-center p-2 rounded-md hover:bg-gray-50 transition-colors text-left"
                      onClick={() => {
                        router.push("/admin/settings");
                        setIsDropdownOpen(false);
                      }}
                    >
                      <Shield className="w-3.5 h-3.5 mr-2 text-blue-500" />
                      <span className="text-xs font-medium text-gray-700">Админ</span>
                    </motion.button>
                  )}
                  
                  <div className="h-px bg-gray-100 my-1" />
                  
                  <motion.button
                    variants={itemVariants}
                    whileHover={{ x: 2, backgroundColor: "#FEE2E2" }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isLoggingOut}
                    onClick={handleLogout}
                    className={`w-full flex items-center justify-between p-2 rounded-md transition-all ${
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
                          <Power className="w-3.5 h-3.5 mr-2 text-red-500" />
                        </motion.div>
                      ) : (
                        <LogOut className="w-3.5 h-3.5 mr-2 text-red-500" />
                      )}
                      <span className={`text-xs font-medium ${
                        isLoggingOut ? "text-red-600" : "text-red-700"
                      }`}>
                        {isLoggingOut ? "Выход..." : "Выйти"}
                      </span>
                    </div>
                  </motion.button>
                </div>
                
                <div className="p-1.5 bg-gray-50 border-t border-gray-100">
                  <div className="flex items-center justify-center">
                    <CheckCircle className="w-2.5 h-2.5 text-emerald-500 mr-1" />
                    <span className="text-[10px] text-emerald-600 font-medium">Соединение</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    );
  }

  // Полный режим
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
        <motion.div
          initial={false}
          animate={{
            opacity: isHovered ? 1 : 0,
            scale: isHovered ? 1 : 0.8
          }}
          className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5"
        />
        
        <div className="relative z-10 flex items-center space-x-3">
          <div className="relative">
            <div className="relative w-14 h-14 rounded-full overflow-hidden ring-4 ring-white shadow-lg">
              <img
                src={img}
                alt={name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 opacity-20" />
            </div>
            
            {showStatus && (
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${statusColors[status]}`}>
                <div className="absolute inset-0 rounded-full bg-white/30 animate-ping" />
              </div>
            )}
          </div>

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

      {/* Dropdown меню СНИЗУ */}
      <AnimatePresence>
        {isDropdownOpen && !isMobile && (
          <motion.div
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="absolute top-full left-0 right-0 mt-2 z-50 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden"
          >
            <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-100">
              <p className="text-xs font-medium text-gray-600">Управление профилем</p>
            </div>
            
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

      {/* Для полной версии на мобиле также показываем overlay */}
      {!compact && isMobile && <MobileDropdownOverlay />}

      {/* Подсказка */}
      {!isDropdownOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 0.7 : 0 }}
          className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-gray-800 text-white text-xs rounded-lg whitespace-nowrap"
        >
          Нажмите для настроек
        </motion.div>
      )}
    </div>
  );
}