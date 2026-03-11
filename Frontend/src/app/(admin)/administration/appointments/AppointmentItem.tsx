"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Clock, 
  User, 
  Scissors, 
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
  ChevronRight,
  Zap,
  CheckCheck,
  MapPin,
  Star,
  Ban,
  Eye,
  CalendarCheck
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
  onComplete?: (id: string) => void;
  onCancel?: (id: string) => void;
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
    "Новый": {
      bg: "bg-gradient-to-r from-amber-500/10 to-orange-500/10",
      text: "text-amber-700",
      border: "border-amber-200/50",
      icon: <AlertCircle className="w-4 h-4" />,
      gradient: "from-amber-500 to-orange-500",
      badge: "bg-gradient-to-r from-amber-500 to-orange-500"
    },
    "Подтвержден": {
      bg: "bg-gradient-to-r from-emerald-500/10 to-green-500/10",
      text: "text-emerald-700",
      border: "border-emerald-200/50",
      icon: <CheckCircle className="w-4 h-4" />,
      gradient: "from-emerald-500 to-green-500",
      badge: "bg-gradient-to-r from-emerald-500 to-green-500"
    },
    "Завершен": {
      bg: "bg-gradient-to-r from-blue-500/10 to-indigo-500/10",
      text: "text-blue-700",
      border: "border-blue-200/50",
      icon: <Clock4 className="w-4 h-4" />,
      gradient: "from-blue-500 to-indigo-500",
      badge: "bg-gradient-to-r from-blue-500 to-indigo-500"
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
  onComplete,
  onCancel,
}: AppointmentItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const statusConfig = getStatusConfig(appointment.status);

  const handleCompleteClick = () => {
    if (onComplete && window.confirm("Завершить запись?")) {
      onComplete(appointment.id);
    }
  };

  const handleCancelClick = () => {
    if (onCancel && window.confirm("Отменить запись?")) {
      onCancel(appointment.id);
    }
  };

  const isActiveStatus = appointment.status === "Подтвержден";

  // Определяем доступные действия в зависимости от статуса
  const getAvailableActions = () => {
    const actions = [];
    
    if (appointment.status === "Подтвержден") {
      actions.push({
        id: "complete",
        label: "Завершить",
        icon: <CheckCheck className="w-4 h-4" />,
        color: "text-emerald-600",
        bgColor: "bg-emerald-100",
        onClick: handleCompleteClick
      });
    }
    
    if (appointment.status === "Подтвержден") {
      actions.push({
        id: "cancel",
        label: "Отменить",
        icon: <Ban className="w-4 h-4" />,
        color: "text-rose-600",
        bgColor: "bg-rose-100",
        onClick: handleCancelClick
      });
    }
    
    actions.push({
      id: "view",
      label: "Подробнее",
      icon: <Eye className="w-4 h-4" />,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      onClick: () => console.log("Просмотр деталей")
    });
    
    if (onEdit) {
      actions.push({
        id: "edit",
        label: "Редактировать",
        icon: <Edit className="w-4 h-4" />,
        color: "text-purple-600",
        bgColor: "bg-purple-100",
        onClick: () => onEdit(appointment)
      });
    }
    
    if (onDelete) {
      actions.push({
        id: "delete",
        label: "Удалить",
        icon: <Trash2 className="w-4 h-4" />,
        color: "text-red-600",
        bgColor: "bg-red-100",
        onClick: () => {
          if (window.confirm("Удалить запись?")) {
            onDelete(appointment.id);
          }
        }
      });
    }
    
    return actions;
  };

  const actions = getAvailableActions();

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
      <div className="relative z-10">
        {/* Заголовок с аватаром и статусом */}
        <div className="flex items-start justify-between mb-6">
          {/* Левая часть - информация о клиенте */}
          <div className="flex items-start gap-4 flex-1">
            {/* Аватар клиента */}
            <div className="relative">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${statusConfig.gradient} flex items-center justify-center text-white font-bold text-xl shadow-lg`}>
                {getInitials(appointment.clientName)}
              </div>
            </div>
            
            {/* Информация о клиенте */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
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

                {/* Телефон */}
                {appointment.clientPhone && (
                  <div className="flex items-center gap-2 text-gray-500">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm">{appointment.clientPhone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Правая часть - цена и кнопки */}
          <div className="flex flex-col items-end gap-3">
            {/* Цена */}
            <div className={`text-3xl font-bold bg-gradient-to-r ${statusConfig.gradient} bg-clip-text text-transparent`}>
              {appointment.price}
            </div>
            
            {/* Кнопки действий */}
            {actions.length > 0 && (
              <div className="flex items-center gap-2">
                {/* Быстрые действия для подтвержденных записей */}
                {isActiveStatus && (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleCompleteClick}
                      className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                      title="Завершить запись"
                    >
                      <CheckCheck className="w-5 h-5" />
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleCancelClick}
                      className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gradient-to-r from-rose-500 to-red-500 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                      title="Отменить запись"
                    >
                      <Ban className="w-5 h-5" />
                    </motion.button>
                  </>
                )}

                {/* Кнопка редактирования */}
                {onEdit && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onEdit(appointment)}
                    className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    title="Редактировать"
                  >
                    <Edit className="w-5 h-5" />
                  </motion.button>
                )}

                {/* Выпадающее меню дополнительных действий */}
                {actions.length > 0 && (
                  <div className="relative">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setShowActions(!showActions)}
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                        showActions 
                          ? "bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow-lg" 
                          : "bg-white/80 backdrop-blur-sm text-gray-600 hover:text-gray-700 border border-gray-200/50 hover:border-gray-300/50 hover:shadow-md"
                      }`}
                      title="Дополнительные действия"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </motion.button>

                    {/* Выпадающее меню */}
                    <AnimatePresence>
                      {showActions && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9, y: -10 }}
                          className="absolute top-full right-0 mt-2 w-64 bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-200/50 overflow-hidden z-50"
                        >
                          <div className="p-2 space-y-1">
                            {actions.map((action) => (
                              <motion.button
                                key={action.id}
                                whileHover={{ x: 5 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                  action.onClick();
                                  setShowActions(false);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-all duration-200 text-gray-700"
                              >
                                <div className={`w-8 h-8 rounded-lg ${action.bgColor} flex items-center justify-center`}>
                                  <div className={action.color}>
                                    {action.icon}
                                  </div>
                                </div>
                                <div className="text-left flex-1">
                                  <p className="font-medium">{action.label}</p>
                                  {action.id === "complete" && (
                                    <p className="text-xs text-gray-500">Отметить как выполненную</p>
                                  )}
                                  {action.id === "cancel" && (
                                    <p className="text-xs text-gray-500">Отменить запись</p>
                                  )}
                                  {action.id === "edit" && (
                                    <p className="text-xs text-gray-500">Изменить данные записи</p>
                                  )}
                                  {action.id === "delete" && (
                                    <p className="text-xs text-gray-500">Удалить запись навсегда</p>
                                  )}
                                  {action.id === "view" && (
                                    <p className="text-xs text-gray-500">Просмотр деталей</p>
                                  )}
                                </div>
                              </motion.button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Детали услуги */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ml-20">
          {/* Услуга */}
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

          {/* Мастер */}
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

          {/* Дата */}
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

        {/* Футер с дополнительной информацией */}
        <div className="mt-6 pt-6 border-t border-gray-200/50">
          <div className="flex items-center justify-between text-sm text-gray-400">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Zap className="w-3 h-3 text-amber-500" />
                <span>ID: {appointment.id}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-3 h-3" />
                <span>1 клиент</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3 h-3" />
                <span>Основной зал</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="w-3 h-3 text-amber-400 fill-amber-400" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}