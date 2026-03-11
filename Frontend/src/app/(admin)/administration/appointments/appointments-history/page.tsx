"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { appointmentService } from "@/services/appointment/appointment.service";
import { IAppointment, AppointmentStatus } from "@/types/appointment.types";
import {
  Search,
  Filter,
  Calendar,
  Clock,
  Users,
  TrendingUp,
  FileText,
  Download,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  X,
  History,
  CheckCircle,
  DollarSign,
  CalendarDays,
  Award,
  BarChart3,
  Sparkles,
  Eye,
  Loader2,
  Archive,
} from "lucide-react";

type SortField = "time" | "client" | "service" | "master" | "date" | "price";
type SortOrder = "asc" | "desc";

export default function AppointmentsHistoryPage() {
  const [appointments, setAppointments] = useState<IAppointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [sortField, setSortField] = useState<SortField>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [dateFilter, setDateFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [masterFilter, setMasterFilter] = useState("");

  const loadCompleted = async (showLoading = true) => {
  if (showLoading) {
    setIsLoading(true);
  } else {
    setIsRefreshing(true);
  }
  setError(null);
  try {
    const data = await appointmentService.getCompleted();
    
    // Валидация и очистка данных
    const validatedData = data.map(item => {
      // Безопасная обработка цены
      const priceStr = String(item.price || '0');
      const priceValue = parseFloat(priceStr.replace(/[^0-9.-]+/g, '')) || 0;
      
      return {
        ...item,
        price: Math.abs(priceValue) > 10000000 ? 0 : Math.abs(priceValue), // Защита от аномалий
        clientName: item.clientName || '',
        clientSurname: item.clientSurname || '',
        clientPhone: item.clientPhone || '',
        appointmentTime: item.appointmentTime || new Date().toISOString(),
        service: {
          ...item.service,
          title: item.service?.title || 'Неизвестная услуга',
          duration: Number(item.service?.duration) || 0,
        },
        master: {
          ...item.master,
          name: item.master?.name || 'Неизвестный',
          surname: item.master?.surname || 'мастер',
          id: Number(item.master?.id) || 0,
        }
      };
    });
    
    setAppointments(validatedData);
  } catch (e) {
    console.error('Ошибка загрузки записей:', e);
    setError("Не удалось загрузить историю записей");
  } finally {
    setIsLoading(false);
    setIsRefreshing(false);
  }
};

  useEffect(() => {
    loadCompleted();
  }, []);

  // Для отладки
  useEffect(() => {
    if (appointments.length > 0) {
      console.log('Загружено записей:', appointments.length);
      console.log('Пример записи:', appointments[0]);
      console.log('Цены:', appointments.map(a => a.price).slice(0, 5));
    }
  }, [appointments]);

  // Собираем уникальных мастеров для фильтра
  const masters = useMemo(() => {
    const uniqueMasters = new Map();
    appointments.forEach((a) => {
      const key = a.master.id;
      if (!uniqueMasters.has(key)) {
        uniqueMasters.set(key, {
          id: a.master.id,
          name: `${a.master.surname} ${a.master.name}`,
        });
      }
    });
    return Array.from(uniqueMasters.values());
  }, [appointments]);

  const filteredAndSorted = useMemo(() => {
    let filtered = appointments;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          `${a.clientSurname} ${a.clientName}`.toLowerCase().includes(q) ||
          a.service.title.toLowerCase().includes(q) ||
          `${a.master.surname} ${a.master.name}`.toLowerCase().includes(q) ||
          a.clientPhone.includes(q)
      );
    }

    if (dateFilter) {
      filtered = filtered.filter(
        (a) =>
          new Date(a.appointmentTime).toISOString().split("T")[0] === dateFilter
      );
    }

    if (masterFilter) {
      filtered = filtered.filter((a) => a.master.id === Number(masterFilter));
    }

    const sorted = [...filtered].sort((a, b) => {
      let av: number | string = "";
      let bv: number | string = "";

      switch (sortField) {
        case "time":
          av = new Date(a.appointmentTime).getTime();
          bv = new Date(b.appointmentTime).getTime();
          break;
        case "date":
          av = new Date(a.appointmentTime).setHours(0, 0, 0, 0);
          bv = new Date(b.appointmentTime).setHours(0, 0, 0, 0);
          break;
        case "client":
          av = `${a.clientSurname} ${a.clientName}`.toLowerCase();
          bv = `${b.clientSurname} ${b.clientName}`.toLowerCase();
          break;
        case "service":
          av = a.service.title;
          bv = b.service.title;
          break;
        case "master":
          av = `${a.master.surname} ${a.master.name}`.toLowerCase();
          bv = `${b.master.surname} ${b.master.name}`.toLowerCase();
          break;
        case "price":
          // Убеждаемся, что это числа
          av = Number(a.price) || 0;
          bv = Number(b.price) || 0;
          break;
      }

      if (typeof av === "string") {
        return sortOrder === "asc"
          ? av.localeCompare(bv as string)
          : (bv as string).localeCompare(av);
      }

      return sortOrder === "asc"
        ? (av as number) - (bv as number)
        : (bv as number) - (av as number);
    });

    return sorted;
  }, [appointments, sortField, sortOrder, dateFilter, searchQuery, masterFilter]);

  // Статистика
  const stats = useMemo(() => {
    const total = appointments.length;
    
    // Безопасное вычисление выручки
    const totalRevenue = appointments.reduce((sum, a) => {
      const price = Number(a.price) || 0;
      // Проверяем на аномальные значения
      if (price > 10000000) { // Если цена больше 10 млн, вероятно ошибка
        console.warn('Подозрительно высокая цена:', a);
        return sum; // Пропускаем эту запись
      }
      return sum + price;
    }, 0);
    
    const avgRevenue = total > 0 ? Math.round(totalRevenue / total) : 0;
    
    const today = new Date().toISOString().split("T")[0];
    const todayCount = appointments.filter(
      (a) => {
        try {
          return new Date(a.appointmentTime).toISOString().split("T")[0] === today;
        } catch {
          return false;
        }
      }
    ).length;
    
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekCount = appointments.filter(
      (a) => {
        try {
          const appointmentDate = new Date(a.appointmentTime);
          return appointmentDate >= weekAgo;
        } catch {
          return false;
        }
      }
    ).length;

    // Находим самый популярный сервис
    const serviceCounts: Record<string, number> = {};
    appointments.forEach(a => {
      const serviceTitle = a.service?.title || 'Неизвестная услуга';
      serviceCounts[serviceTitle] = (serviceCounts[serviceTitle] || 0) + 1;
    });
    
    const mostPopularService = Object.entries(serviceCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || "—";

    return {
      total,
      totalRevenue,
      avgRevenue,
      todayCount,
      weekCount,
      mostPopularService,
    };
  }, [appointments]);

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString("ru-RU", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    } catch {
      return "Некорректная дата";
    }
  };

  const formatTime = (iso: string) => {
    try {
      return new Date(iso).toLocaleTimeString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Некорректное время";
    }
  };

  const handleSortChange = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setDateFilter("");
    setMasterFilter("");
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortOrder === "asc" ? "↑" : "↓";
  };

  const exportToCSV = () => {
    const headers = ["Дата", "Время", "Клиент", "Телефон", "Услуга", "Мастер", "Цена", "Длительность"];
    const rows = filteredAndSorted.map(a => [
      formatDate(a.appointmentTime),
      formatTime(a.appointmentTime),
      `${a.clientSurname} ${a.clientName}`,
      a.clientPhone,
      a.service.title,
      `${a.master.surname} ${a.master.name}`,
      `${(Number(a.price) || 0).toLocaleString('ru-RU')} ₽`,
      `${a.service.duration} мин.`
    ]);
    
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `история_записей_${new Date().toISOString().split("T")[0]}.csv`);
    link.click();
  };

  // Проверяем данные на аномалии
  const hasDataIssues = useMemo(() => {
    if (stats.totalRevenue > 1000000000) { // Если выручка больше 1 млрд, вероятно ошибка
      return true;
    }
    
    // Проверяем отдельные записи на аномальные цены
    const suspiciousAppointments = appointments.filter(a => 
      Number(a.price) > 10000000 || Number(a.price) < 0
    );
    
    return suspiciousAppointments.length > 0;
  }, [appointments, stats.totalRevenue]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-8xl mx-auto">
        {/* Заголовок и управление */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
            <div>
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 mb-2"
              >
                <div className="p-2.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                  <History className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                  История записей
                </h1>
              </motion.div>
              <p className="text-gray-600">
                Всего завершённых записей:{" "}
                <span className="font-semibold text-gray-800">{stats.total}</span>
                {filteredAndSorted.length !== stats.total && (
                  <span className="ml-2">
                    (показано {filteredAndSorted.length})
                  </span>
                )}
                {hasDataIssues && (
                  <span className="ml-3 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                    Требуется проверка данных
                  </span>
                )}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-300/50 text-gray-700 rounded-xl font-medium hover:bg-gray-50/80 transition-all duration-300 shadow-sm"
              >
                <Filter className="w-4 h-4" />
                Фильтры
                {isFilterOpen ? <ChevronDown className="w-4 h-4 rotate-180" /> : <ChevronDown className="w-4 h-4" />}
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => loadCompleted(false)}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-300/50 text-gray-700 rounded-xl font-medium hover:bg-gray-50/80 transition-all duration-300 shadow-sm"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
                Обновить
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={exportToCSV}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:from-purple-700 hover:to-pink-700"
              >
                <Download className="w-5 h-5" />
                Экспорт
              </motion.button>
            </div>
          </div>

          {/* Расширенные фильтры */}
          <AnimatePresence>
            {isFilterOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50 mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Поиск */}
                    <div className="md:col-span-2">
                      <div className="relative">
                        <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Поиск по клиентам, услугам, мастерам..."
                          className="w-full pl-10 pr-4 py-3.5 bg-white/90 backdrop-blur-sm border border-gray-300/50 rounded-2xl focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 text-gray-900 placeholder-gray-500 transition-all duration-300"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Фильтр по дате */}
                    <div className="relative">
                      <Calendar className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="date"
                        className="w-full pl-10 pr-4 py-3.5 bg-white/90 backdrop-blur-sm border border-gray-300/50 rounded-2xl focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 text-gray-900 transition-all duration-300"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                      />
                    </div>

                    {/* Фильтр по мастеру */}
                    <select
                      className="w-full px-4 py-3.5 bg-white/90 backdrop-blur-sm border border-gray-300/50 rounded-2xl focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 text-gray-900 transition-all duration-300"
                      value={masterFilter}
                      onChange={(e) => setMasterFilter(e.target.value)}
                    >
                      <option value="">Все мастера</option>
                      {masters.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Сортировка */}
                  <div className="mt-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Сортировка:</h3>
                    <div className="flex flex-wrap gap-2">
                      {(
                        [
                          { field: "date" as SortField, label: "Дата", icon: Calendar },
                          { field: "time" as SortField, label: "Время", icon: Clock },
                          { field: "client" as SortField, label: "Клиент", icon: Users },
                          { field: "service" as SortField, label: "Услуга", icon: FileText },
                          { field: "master" as SortField, label: "Мастер", icon: Award },
                          { field: "price" as SortField, label: "Цена", icon: DollarSign },
                        ] as const
                      ).map(({ field, label, icon: Icon }) => (
                        <motion.button
                          key={field}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleSortChange(field)}
                          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-xl transition-all duration-300 border ${
                            sortField === field
                              ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md border-transparent"
                              : "bg-white/80 text-gray-700 border-gray-300/50 hover:bg-gray-50/80"
                          }`}
                        >
                          <Icon className="w-3 h-3" />
                          {label}
                          {getSortIcon(field)}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {(searchQuery || dateFilter || masterFilter) && (
                    <motion.button
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={clearFilters}
                      className="mt-4 flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 bg-red-50/50 hover:bg-red-50 rounded-xl border border-red-200/50 transition-all duration-300 text-sm font-medium"
                    >
                      <X className="w-4 h-4" />
                      Сбросить фильтры
                    </motion.button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-20">
              <Archive className="w-16 h-16" />
            </div>
            <div className="relative z-10">
              <div className="text-4xl font-bold mb-2">{stats.total}</div>
              <div className="text-purple-100 font-medium">Всего завершено</div>
              <div className="text-sm text-purple-200/80 mt-2">Исторических записей</div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-emerald-500 to-green-500 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-20">
              <DollarSign className="w-16 h-16" />
            </div>
            <div className="relative z-10">
              <div className="text-4xl font-bold mb-2">
                {hasDataIssues ? "Ошибка в данных" : stats.totalRevenue.toLocaleString('ru-RU')} ₽
              </div>
              <div className="text-emerald-100 font-medium">Общая выручка</div>
              <div className="text-sm text-emerald-200/80 mt-2">За все время</div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-20">
              <BarChart3 className="w-16 h-16" />
            </div>
            <div className="relative z-10">
              <div className="text-4xl font-bold mb-2">
                {hasDataIssues ? "Ошибка" : stats.avgRevenue.toLocaleString('ru-RU')} ₽
              </div>
              <div className="text-blue-100 font-medium">Средний чек</div>
              <div className="text-sm text-blue-200/80 mt-2">По всем записям</div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-20">
              <Award className="w-16 h-16" />
            </div>
            <div className="relative z-10">
              <div className="text-2xl font-bold mb-2 truncate">{stats.mostPopularService}</div>
              <div className="text-amber-100 font-medium">Популярная услуга</div>
              <div className="text-sm text-amber-200/80 mt-2">Самая частая в истории</div>
            </div>
          </motion.div>
        </div>

        {/* Карточки записей */}
        {isLoading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-500 font-medium">Загрузка истории...</p>
          </div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="col-span-full bg-white/80 backdrop-blur-sm rounded-2xl p-12 text-center border border-gray-200/50"
          >
            <div className="w-20 h-20 bg-gradient-to-r from-red-200 to-red-300 rounded-full flex items-center justify-center mx-auto mb-6">
              <X className="w-10 h-10 text-red-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Ошибка загрузки</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {error}
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => loadCompleted(true)}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 inline-flex items-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Попробовать снова
            </motion.button>
          </motion.div>
        ) : filteredAndSorted.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="col-span-full bg-white/80 backdrop-blur-sm rounded-2xl p-12 text-center border border-gray-200/50"
          >
            <div className="w-20 h-20 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
              <History className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">История пуста</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {searchQuery || dateFilter || masterFilter 
                ? "Попробуйте изменить параметры поиска" 
                : "Завершенных записей пока нет"}
            </p>
            {(searchQuery || dateFilter || masterFilter) && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={clearFilters}
                className="px-6 py-2.5 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300 inline-flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Сбросить фильтры
              </motion.button>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
            <AnimatePresence>
              {filteredAndSorted.map((appointment, index) => {
                const price = Number(appointment.price) || 0;
                const hasSuspiciousPrice = price > 10000000 || price < 0;
                
                return (
                  <motion.div
                    key={appointment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.01, y: -2 }}
                    className={`bg-gradient-to-br from-white to-gray-50/50 rounded-3xl border ${hasSuspiciousPrice ? 'border-red-300/50' : 'border-gray-200/50'} p-5 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm group relative`}
                  >
                    {hasSuspiciousPrice && (
                      <div className="absolute top-2 right-2 px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full z-10">
                        Ошибка в цене
                      </div>
                    )}
                    
                    {/* Верхняя часть с датой и статусом */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="text-sm text-gray-500 mb-1">Завершено</div>
                        <div className="text-xl font-bold text-gray-900">
                          {formatDate(appointment.appointmentTime)}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {formatTime(appointment.appointmentTime)}
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 text-xs font-bold rounded-full">
                        Завершена
                      </span>
                    </div>

                    {/* Разделитель */}
                    <div className="h-px bg-gradient-to-r from-transparent via-gray-300/50 to-transparent my-4" />

                    {/* Клиент */}
                    <div className="mb-4">
                      <div className="text-xs text-gray-600 mb-2">Клиент</div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                          {appointment.clientName[0]?.toUpperCase() || "К"}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-bold text-gray-900">
                            {appointment.clientSurname} {appointment.clientName}
                          </div>
                          <div className="text-xs text-gray-600">{appointment.clientPhone}</div>
                        </div>
                      </div>
                    </div>

                    {/* Услуга и мастер */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-gradient-to-br from-blue-50/50 to-cyan-50/50 rounded-xl p-3 border border-blue-200/30">
                        <div className="text-xs text-gray-600 mb-1">Услуга</div>
                        <div className="text-sm font-bold text-gray-900 truncate">{appointment.service.title}</div>
                        <div className="text-xs text-gray-500 mt-1">{appointment.service.duration} мин.</div>
                      </div>
                      <div className="bg-gradient-to-br from-purple-50/50 to-pink-50/50 rounded-xl p-3 border border-purple-200/30">
                        <div className="text-xs text-gray-600 mb-1">Мастер</div>
                        <div className="text-sm font-bold text-gray-900">{appointment.master.surname} {appointment.master.name}</div>
                      </div>
                    </div>

                    {/* Цена и информация */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200/50">
                      <div className={`rounded-xl p-3 border ${hasSuspiciousPrice ? 'bg-red-50/50 border-red-200/30' : 'bg-gradient-to-br from-emerald-50/50 to-green-50/50 border-emerald-200/30'}`}>
                        <div className="text-xs text-gray-600">Стоимость</div>
                        <div className={`text-lg font-bold ${hasSuspiciousPrice ? 'text-red-700' : 'text-emerald-700'}`}>
                          {hasSuspiciousPrice ? 'Ошибка' : price.toLocaleString('ru-RU')} ₽
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        ID: {appointment.id}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Информация внизу */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"></div>
              <span>Завершенные записи</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-500 to-green-500"></div>
              <span>
                Общая выручка: {hasDataIssues ? 'Ошибка в данных' : stats.totalRevenue.toLocaleString('ru-RU')} ₽
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <span>
              Показано: {filteredAndSorted.length} из {stats.total}
            </span>
            <span className="text-purple-600 font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Средний чек: {hasDataIssues ? 'Ошибка' : stats.avgRevenue.toLocaleString('ru-RU')} ₽
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}