"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Clock, 
  User, 
  Scissors, 
  DollarSign, 
  Calendar, 
  Users, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Clock4,
  Edit,
  Trash2,
  MoreVertical,
  Phone,
  Mail,
  MapPin,
  Star,
  ChevronRight,
  Zap
} from "lucide-react";

interface Appointment {
  id: string;
  clientName: string;
  service: string;
  time: string;
  price: string;
  master: string;
  status: string;
  date: string;
  duration: number;
  rawDateTime: string;
  clientPhone?: string;
}

interface AppointmentItemProps {
  appointment: Appointment;
  onEdit?: (appointment: Appointment) => void;
  onDelete?: (id: string) => void;
  hideActions?: boolean;
}

const formatDateTime = (rawDateTime: string) => {
  const d = new Date(rawDateTime);
  if (isNaN(d.getTime())) {
    return "Дата не определена";
  }
  return d.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusConfig = (status: string) => {
  const configs: Record<string, {
    bg: string;
    text: string;
    border: string;
    icon: React.ReactNode;
    gradient: string;
    badge: string;
  }> = {
    "Новая": {
      bg: "bg-gradient-to-r from-amber-500/10 to-orange-500/10",
      text: "text-amber-700",
      border: "border-amber-200/50",
      icon: <AlertCircle className="w-4 h-4" />,
      gradient: "from-amber-500 to-orange-500",
      badge: "bg-gradient-to-r from-amber-500 to-orange-500"
    },
    "Подтверждена": {
      bg: "bg-gradient-to-r from-emerald-500/10 to-green-500/10",
      text: "text-emerald-700",
      border: "border-emerald-200/50",
      icon: <CheckCircle className="w-4 h-4" />,
      gradient: "from-emerald-500 to-green-500",
      badge: "bg-gradient-to-r from-emerald-500 to-green-500"
    },
    "Подтвержден": {
      bg: "bg-gradient-to-r from-emerald-500/10 to-green-500/10",
      text: "text-emerald-700",
      border: "border-emerald-200/50",
      icon: <CheckCircle className="w-4 h-4" />,
      gradient: "from-emerald-500 to-green-500",
      badge: "bg-gradient-to-r from-emerald-500 to-green-500"
    },
    "Завершена": {
      bg: "bg-gradient-to-r from-blue-500/10 to-indigo-500/10",
      text: "text-blue-700",
      border: "border-blue-200/50",
      icon: <Clock4 className="w-4 h-4" />,
      gradient: "from-blue-500 to-indigo-500",
      badge: "bg-gradient-to-r from-blue-500 to-indigo-500"
    },
    "Завершен": {
      bg: "bg-gradient-to-r from-blue-500/10 to-indigo-500/10",
      text: "text-blue-700",
      border: "border-blue-200/50",
      icon: <Clock4 className="w-4 h-4" />,
      gradient: "from-blue-500 to-indigo-500",
      badge: "bg-gradient-to-r from-blue-500 to-indigo-500"
    },
    "Отменена": {
      bg: "bg-gradient-to-r from-rose-500/10 to-red-500/10",
      text: "text-rose-700",
      border: "border-rose-200/50",
      icon: <XCircle className="w-4 h-4" />,
      gradient: "from-rose-500 to-red-500",
      badge: "bg-gradient-to-r from-rose-500 to-red-500"
    },
    "Отменен": {
      bg: "bg-gradient-to-r from-rose-500/10 to-red-500/10",
      text: "text-rose-700",
      border: "border-rose-200/50",
      icon: <XCircle className="w-4 h-4" />,
      gradient: "from-rose-500 to-red-500",
      badge: "bg-gradient-to-r from-rose-500 to-red-500"
    },
  };

  return configs[status] || {
    bg: "bg-gradient-to-r from-gray-500/10 to-gray-600/10",
    text: "text-gray-700",
    border: "border-gray-200/50",
    icon: <Clock className="w-4 h-4" />,
    gradient: "from-gray-500 to-gray-600",
    badge: "bg-gradient-to-r from-gray-500 to-gray-600"
  };
};

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export default function AppointmentItem({
  appointment,
  onEdit,
  onDelete,
  hideActions,
}: AppointmentItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const statusConfig = getStatusConfig(appointment.status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.005 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group relative bg-gradient-to-br from-white to-gray-50/50 rounded-3xl border border-gray-200/50 p-6 hover:border-blue-300/50 hover:shadow-2xl transition-all duration-300 backdrop-blur-sm overflow-hidden"
    >
      {/* Анимированный градиентный фон при наведении */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 0.3 : 0 }}
        className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5"
      />

      {/* Основной контент */}
      <div className="relative z-10 flex justify-between items-start gap-6">
        {/* Левая часть - основная информация */}
        <div className="flex-1">
          {/* Заголовок с аватаром и статусом */}
          <div className="flex items-center gap-4 mb-6">
            {/* Аватар клиента с градиентом */}
            <div className="relative">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${statusConfig.gradient} flex items-center justify-center text-white font-bold text-xl shadow-lg`}>
                {getInitials(appointment.clientName)}
              </div>
              
              {/* Статус индикатор */}
              <div className={`absolute -bottom-2 -right-2 w-7 h-7 rounded-full ${statusConfig.bg} border-4 border-white shadow-lg flex items-center justify-center`}>
                <div className="w-2 h-2 rounded-full bg-white" />
              </div>
            </div>
            
            {/* Информация о клиенте */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <h3 className="font-bold text-gray-900 text-2xl">
                    {appointment.clientName}
                  </h3>
                  <motion.span
                    whileHover={{ scale: 1.05 }}
                    className={`px-4 py-1.5 text-sm font-semibold rounded-xl ${statusConfig.bg} ${statusConfig.text} border ${statusConfig.border} backdrop-blur-sm flex items-center gap-2`}
                  >
                    {statusConfig.icon}
                    {appointment.status}
                  </motion.span>
                </div>
                
                {/* Цена с градиентом */}
                <div className={`text-2xl font-bold bg-gradient-to-r ${statusConfig.gradient} bg-clip-text text-transparent`}>
                  {appointment.price}
                </div>
              </div>
              
              {/* Время записи */}
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-5 h-5 text-blue-500" />
                  <span className="font-medium">{formatDateTime(appointment.rawDateTime)}</span>
                </div>
                
                {/* Длительность */}
                <div className="flex items-center gap-2 text-gray-500">
                  <Clock4 className="w-4 h-4" />
                  <span>{appointment.duration} мин</span>
                </div>
              </div>
            </div>
          </div>

          {/* Детали услуги в виде карточек */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-20">
            {/* Карточка услуги */}
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-xl ${statusConfig.bg}`}>
                  <Scissors className="w-5 h-5 text-gray-700" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">
                    Услуга
                  </p>
                  <p className="font-bold text-gray-900 text-lg">{appointment.service}</p>
                </div>
              </div>
            </motion.div>

            {/* Карточка мастера */}
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500/10 to-green-500/10">
                  <User className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">
                    Мастер
                  </p>
                  <p className="font-bold text-gray-900 text-lg">{appointment.master}</p>
                </div>
              </div>
            </motion.div>

            {/* Карточка даты */}
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10">
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">
                    Дата записи
                  </p>
                  <p className="font-bold text-gray-900 text-lg">{appointment.date}</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Дополнительная информация */}
          <div className="mt-6 pl-20 pt-6 border-t border-gray-200/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                {/* Контактная информация, если есть */}
                {appointment.clientPhone && (
                  <div className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors cursor-pointer">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm font-medium">{appointment.clientPhone}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2 text-gray-500">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">1 клиент</span>
                </div>
                
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
              </div>
              
              {/* Quick actions */}
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                  Подробнее <ChevronRight className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </div>
        </div>

        {/* Правая часть - действия */}
        {!hideActions && (
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowActions(!showActions)}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                showActions 
                  ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg" 
                  : "bg-white/80 backdrop-blur-sm text-gray-600 hover:text-blue-600 border border-gray-200/50 hover:border-blue-300/50 hover:shadow-md"
              }`}
            >
              <MoreVertical className="w-5 h-5" />
            </motion.button>

            {/* Выпадающее меню действий */}
            <AnimatePresence>
              {showActions && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -10 }}
                  className="absolute top-full right-0 mt-2 w-48 bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-200/50 overflow-hidden z-50"
                >
                  <div className="p-2">
                    <motion.button
                      whileHover={{ x: 5 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        onEdit?.(appointment);
                        setShowActions(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-blue-50/50 transition-all duration-200 text-gray-700 hover:text-blue-600"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Edit className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">Редактировать</p>
                        <p className="text-xs text-gray-500">Изменить детали записи</p>
                      </div>
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ x: 5 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        onDelete?.(appointment.id);
                        setShowActions(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50/50 transition-all duration-200 text-gray-700 hover:text-red-600 mt-1"
                    >
                      <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">Удалить</p>
                        <p className="text-xs text-gray-500">Удалить запись</p>
                      </div>
                    </motion.button>
                  </div>
                  
                  {/* Быстрые действия внизу */}
                  <div className="p-2 border-t border-gray-200/50">
                    <div className="grid grid-cols-2 gap-2">
                      <button className="px-3 py-2 text-xs font-medium bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-lg hover:opacity-90 transition-opacity">
                        Подтвердить
                      </button>
                      <button className="px-3 py-2 text-xs font-medium bg-gradient-to-r from-rose-500 to-red-500 text-white rounded-lg hover:opacity-90 transition-opacity">
                        Отменить
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Прогресс-бар времени (только для активных записей) */}
      {(appointment.status === "Новая" || appointment.status === "Подтвержден") && (
        <div className="mt-6 pt-4 border-t border-gray-200/50">
          <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
            <span>До начала записи</span>
            <span className="font-medium">{appointment.time}</span>
          </div>
          <div className="h-2 bg-gray-200/50 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "60%" }}
              transition={{ duration: 2, ease: "easeInOut" }}
              className={`h-full rounded-full bg-gradient-to-r ${statusConfig.gradient}`}
            />
          </div>
        </div>
      )}

      {/* Футер с дополнительной информацией */}
      <div className="mt-4 pt-4 border-t border-gray-200/30">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <Zap className="w-3 h-3 text-amber-500" />
            <span>ID: {appointment.id}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-3 h-3" />
            <span>Основной зал</span>
          </div>
          <span>Создано сегодня</span>
        </div>
      </div>
    </motion.div>
  );
}