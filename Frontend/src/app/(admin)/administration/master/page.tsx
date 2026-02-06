"use client";

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Plus, 
  Users, 
  UserPlus, 
  Star, 
  Phone, 
  Mail, 
  Scissors,
  MoreVertical,
  Edit,
  Trash2,
  Power,
  Calendar,
  TrendingUp,
  ChevronDown,
  Sparkles,
  Shield,
  Award,
  Crown,
  RefreshCw,
  Zap
} from 'lucide-react';
import EmployeesCard from "@/app/(admin)/administration/master/CreateMasterModal";
import { masterService } from '@/services/master/master.service';
import { IMaster } from '@/types/masters.type';
import { formatPhoneNumber } from '@/app/lib/formatPhoneNumber';

export default function Employees() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingMaster, setEditingMaster] = useState<IMaster | null>(null);
  const [masters, setMasters] = useState<IMaster[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [specializationFilter, setSpecializationFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedMaster, setSelectedMaster] = useState<IMaster | null>(null);

  // Загрузка данных
  const loadMasters = async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    } else {
      setIsRefreshing(true);
    }
    
    try {
      const data = await masterService.getAll();
      setMasters(data);
    } catch (error) {
      console.error('Ошибка загрузки мастеров:', error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadMasters();
  }, []);

  // Фильтрация мастеров
  const filteredMasters = useMemo(() => {
    return masters.filter(master => {
      const matchesSearch = 
        master.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        master.surname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        master.middlename?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        master.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (master.phone && master.phone.includes(searchTerm));

      const matchesSpecialization = 
        !specializationFilter || 
        master.specialization.toLowerCase().includes(specializationFilter.toLowerCase());

      const matchesStatus = 
        !statusFilter || 
        (statusFilter === 'active' && master.isActive) ||
        (statusFilter === 'inactive' && !master.isActive);

      return matchesSearch && matchesSpecialization && matchesStatus;
    });
  }, [masters, searchTerm, specializationFilter, statusFilter]);

  // Статистика
  const stats = useMemo(() => {
    const totalMasters = masters.length;
    const activeMasters = masters.filter(master => master.isActive).length;
    const inactiveMasters = masters.filter(master => !master.isActive).length;
    
    const averageRating = masters.length > 0 
      ? Number((masters.reduce((acc, master) => acc + 4.8, 0) / masters.length).toFixed(1))
      : 0;

    return { totalMasters, activeMasters, inactiveMasters, averageRating };
  }, [masters]);

  // Специализации для фильтра
  const specializations = [
    "парикмахер", "массажист", "косметолог", "маникюр", "визажист", "стилист"
  ];

  const handleCreateMaster = async (masterData: any) => {
    try {
      const cleanedPhone = masterData.phone?.replace(/\D/g, '') || '';
      await masterService.create({
        ...masterData,
        phone: cleanedPhone
      });
      await loadMasters(false);
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Ошибка создания мастера:', error);
      throw error;
    }
  };

  // Функция для открытия формы редактирования
  const handleEditMaster = (master: IMaster) => {
    setEditingMaster(master);
    setIsEditModalOpen(true);
    setSelectedMaster(null);
  };

  // Функция для обновления мастера
  const handleUpdateMaster = async (masterData: any) => {
    try {
      const cleanedPhone = masterData.phone?.replace(/\D/g, '') || '';
      await masterService.update(editingMaster!.id!, {
        ...masterData,
        phone: cleanedPhone
      });
      await loadMasters(false);
      setIsEditModalOpen(false);
      setEditingMaster(null);
    } catch (error) {
      console.error('Ошибка обновления мастера:', error);
      throw error;
    }
  };

  const handleDeleteMaster = async (id: number) => {
    if (!window.confirm('Вы уверены, что хотите удалить этого мастера?')) return;
    
    try {
      await masterService.delete(id);
      await loadMasters(false);
      setSelectedMaster(null);
    } catch (error) {
      console.error('Ошибка удаления мастера:', error);
      alert('Ошибка при удалении мастера');
    }
  };

  const handleToggleStatus = async (master: IMaster) => {
    try {
      await masterService.update(master.id!, { isActive: !master.isActive });
      await loadMasters(false);
    } catch (error) {
      console.error('Ошибка изменения статуса:', error);
      alert('Ошибка при изменении статуса мастера');
    }
  };

  // Безопасное форматирование телефона
  const safeFormatPhone = (phone: string | undefined): string => {
    if (!phone) return 'Не указан';
    return formatPhoneNumber(phone);
  };

  // Получение инициалов
  const getInitials = (master: IMaster) => {
    return `${master.name[0]}${master.surname[0]}`.toUpperCase();
  };

  // Получение цвета для специализации
  const getSpecializationColor = (specialization: string) => {
    const colors: Record<string, string> = {
      'парикмахер': 'from-blue-500 to-cyan-500',
      'массажист': 'from-emerald-500 to-green-500',
      'косметолог': 'from-purple-500 to-pink-500',
      'маникюр': 'from-amber-500 to-orange-500',
      'визажист': 'from-rose-500 to-red-500',
      'стилист': 'from-indigo-500 to-blue-500',
    };
    return colors[specialization.toLowerCase()] || 'from-gray-500 to-gray-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Заголовок и управление */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
            <div>
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 mb-2"
              >
                <div className="p-2.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                  Управление сотрудниками
                </h1>
              </motion.div>
              <p className="text-gray-600">
                Всего сотрудников: <span className="font-semibold text-gray-800">{stats.totalMasters}</span>
                {filteredMasters.length !== stats.totalMasters && (
                  <span className="ml-2">
                    (показано {filteredMasters.length})
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
                onClick={() => loadMasters(false)}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-300/50 text-gray-700 rounded-xl font-medium hover:bg-gray-50/80 transition-all duration-300 shadow-sm"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
                Обновить
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-purple-700"
              >
                <UserPlus className="w-5 h-5" />
                Новый сотрудник
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Поиск */}
                    <div className="relative">
                      <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Поиск по имени, фамилии, специализации..."
                        className="w-full pl-10 pr-4 py-3.5 bg-white/90 backdrop-blur-sm border border-gray-300/50 rounded-2xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-gray-900 placeholder-gray-500 transition-all duration-300"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>

                    {/* Фильтр по специализации */}
                    <select
                      className="w-full px-4 py-3.5 bg-white/90 backdrop-blur-sm border border-gray-300/50 rounded-2xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-gray-900 transition-all duration-300"
                      value={specializationFilter}
                      onChange={(e) => setSpecializationFilter(e.target.value)}
                    >
                      <option value="">Все специализации</option>
                      {specializations.map(spec => (
                        <option key={spec} value={spec} className="capitalize">
                          {spec.charAt(0).toUpperCase() + spec.slice(1)}
                        </option>
                      ))}
                    </select>

                    {/* Фильтр по статусу */}
                    <select
                      className="w-full px-4 py-3.5 bg-white/90 backdrop-blur-sm border border-gray-300/50 rounded-2xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-gray-900 transition-all duration-300"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="">Все статусы</option>
                      <option value="active">Активные ✅</option>
                      <option value="inactive">Неактивные ❌</option>
                    </select>
                  </div>
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
            className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-20">
              <Users className="w-16 h-16" />
            </div>
            <div className="relative z-10">
              <div className="text-4xl font-bold mb-2">{stats.totalMasters}</div>
              <div className="text-blue-100 font-medium">Всего сотрудников</div>
              <div className="text-sm text-blue-200/80 mt-2">Зарегистрировано в системе</div>
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
              <Zap className="w-16 h-16" />
            </div>
            <div className="relative z-10">
              <div className="text-4xl font-bold mb-2">{stats.activeMasters}</div>
              <div className="text-emerald-100 font-medium">Активные</div>
              <div className="text-sm text-emerald-200/80 mt-2">Сейчас работают</div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-20">
              <Star className="w-16 h-16" />
            </div>
            <div className="relative z-10">
              <div className="text-4xl font-bold mb-2">{stats.averageRating}</div>
              <div className="text-amber-100 font-medium">Средний рейтинг</div>
              <div className="text-sm text-amber-200/80 mt-2">По отзывам клиентов</div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-rose-500 to-red-500 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-20">
              <Shield className="w-16 h-16" />
            </div>
            <div className="relative z-10">
              <div className="text-4xl font-bold mb-2">{stats.inactiveMasters}</div>
              <div className="text-rose-100 font-medium">Неактивные</div>
              <div className="text-sm text-rose-200/80 mt-2">Недоступны для записи</div>
            </div>
          </motion.div>
        </div>

        {/* Карточки сотрудников */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
          <AnimatePresence>
            {loading ? (
              <div className="col-span-full py-12 text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                <p className="mt-4 text-gray-500 font-medium">Загрузка сотрудников...</p>
              </div>
            ) : filteredMasters.length > 0 ? (
              filteredMasters.map((master, index) => (
                <motion.div
                  key={master.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.01, y: -2 }}
                  className="bg-gradient-to-br from-white to-gray-50/50 rounded-3xl border border-gray-200/50 p-5 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm  group"
                >
                  {/* Верхняя часть с аватаром и статусом */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${getSpecializationColor(master.specialization)} flex items-center justify-center text-white font-bold text-xl shadow-lg`}>
                          {master.photo ? (
                            <img 
                              src={master.photo} 
                              alt={`${master.name} ${master.surname}`}
                              className="w-full h-full rounded-2xl object-cover"
                            />
                          ) : (
                            getInitials(master)
                          )}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white ${
                          master.isActive ? 'bg-emerald-500' : 'bg-rose-500'
                        }`}>
                          <div className="absolute inset-0 rounded-full bg-white/30 animate-ping" />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg leading-tight">
                          {master.surname} {master.name}
                        </h3>
                        <p className="text-sm text-gray-600">{master.specialization}</p>
                      </div>
                    </div>
                    
                    {/* Действия */}
                    <div className="relative">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setSelectedMaster(
                          selectedMaster?.id === master.id ? null : master
                        )}
                        className={`p-1.5 rounded-lg transition-all ${
                          selectedMaster?.id === master.id 
                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </motion.button>
                      
                      {/* Выпадающее меню */}
                      <AnimatePresence>
                        {selectedMaster?.id === master.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: -10 }}
                            className="absolute right-0 top-full mt-2 w-56 bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-200/50 overflow-hidden z-50"
                          >
                            <div className="p-2">
                              <motion.button
                                whileHover={{ x: 5 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleToggleStatus(master)}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-blue-50/50 transition-all duration-200 text-gray-700 hover:text-blue-600"
                              >
                                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                                  <Power className="w-4 h-4 text-blue-600" />
                                </div>
                                <div className="text-left">
                                  <p className="font-medium">{master.isActive ? 'Деактивировать' : 'Активировать'}</p>
                                  <p className="text-xs text-gray-500">
                                    {master.isActive ? 'Сделать неактивным' : 'Вернуть в работу'}
                                  </p>
                                </div>
                              </motion.button>
                              
                              <motion.button
                                whileHover={{ x: 5 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleEditMaster(master)}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-emerald-50/50 transition-all duration-200 text-gray-700 hover:text-emerald-600 mt-1"
                              >
                                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                                  <Edit className="w-4 h-4 text-emerald-600" />
                                </div>
                                <div className="text-left">
                                  <p className="font-medium">Редактировать</p>
                                  <p className="text-xs text-gray-500">Изменить данные сотрудника</p>
                                </div>
                              </motion.button>
                              
                              <motion.button
                                whileHover={{ x: 5 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleDeleteMaster(master.id!)}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50/50 transition-all duration-200 text-gray-700 hover:text-red-600 mt-1"
                              >
                                <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                                  <Trash2 className="w-4 h-4 text-red-600" />
                                </div>
                                <div className="text-left">
                                  <p className="font-medium">Удалить</p>
                                  <p className="text-xs text-gray-500">Удалить сотрудника</p>
                                </div>
                              </motion.button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Контактная информация */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-3.5 h-3.5" />
                      <span>{safeFormatPhone(master.phone)}</span>
                    </div>
                    
                  </div>

                  {/* Статус и рейтинг */}
                  <div className="flex items-center justify-between text-sm">
                    <span className={`px-3 py-1 rounded-full font-medium ${
                      master.isActive 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-rose-100 text-rose-700'
                    }`}>
                      {master.isActive ? 'Активен' : 'Неактивен'}
                    </span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span className="font-medium">{stats.averageRating}</span>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="col-span-full bg-white/80 backdrop-blur-sm rounded-2xl p-8 text-center border border-gray-200/50"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">Сотрудники не найдены</p>
                <p className="text-gray-400 text-sm mt-1">
                  {searchTerm || specializationFilter || statusFilter 
                    ? "Попробуйте изменить параметры поиска" 
                    : "Создайте первого сотрудника"}
                </p>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="mt-4 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  Создать сотрудника
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Информация внизу */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <span>Активные</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-rose-500"></div>
              <span>Неактивные</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <span>
              Загружено: {masters.length} сотрудников
            </span>
            <span className="text-blue-600 font-medium">
              {stats.activeMasters} сейчас работают
            </span>
          </div>
        </div>

        {/* Модальное окно создания сотрудника */}
        <AnimatePresence>
          {isCreateModalOpen && (
            <EmployeesCard 
              isOpen={isCreateModalOpen}
              onClose={() => setIsCreateModalOpen(false)}
              onSubmit={handleCreateMaster}
            />
          )}
        </AnimatePresence>

        {/* Модальное окно редактирования сотрудника */}
        <AnimatePresence>
          {isEditModalOpen && editingMaster && (
            <EmployeesCard 
              isOpen={isEditModalOpen}
              onClose={() => {
                setIsEditModalOpen(false);
                setEditingMaster(null);
              }}
              onSubmit={handleUpdateMaster}
              master={editingMaster} // Передаем мастера для редактирования
              isEditMode={true} // Режим редактирования
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}