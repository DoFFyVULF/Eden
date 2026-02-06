"use client";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { serviceService } from "@/services/service/service.service";
import { IService } from "@/types/services.types";
import { ICategory } from "@/types/category.types";
import { categoryService } from "@/services/category/category.service";
import {
  Search,
  Filter,
  Plus,
  Tag,
  Clock,
  Edit,
  Trash2,
  RefreshCw,
  ChevronDown,
  Shield,
  Zap,
  Sparkles,
  TrendingUp,
  Calendar,
  Award,
  Users,
  Eye,
  EyeOff,
  CheckCircle,
  X,
  Loader2,
  Star,
  BarChart3,
  Package,
  TrendingDown,
  AlertCircle
} from "lucide-react";

type SortField = "title" | "duration" | "category" | "status";
type SortOrder = "asc" | "desc";

export default function Services() {
  const [services, setServices] = useState<IService[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<IService | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [sortField, setSortField] = useState<SortField>("title");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration: 0,
    categoryId: 0,
    isActive: true,
  });

  const loadServices = async (showLoading = true) => {
    if (showLoading) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }
    try {
      const data = await serviceService.getAll();
      setServices(data);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const loadCategories = async () => {
    const data = await categoryService.getAll();
    setCategories(data);
  };

  useEffect(() => {
    loadCategories();
    loadServices();
  }, []);

  const categoryMap = useMemo(() => {
    return new Map<number, string>(categories.map((c) => [c.id, c.title]));
  }, [categories]);

  const getCategoryName = (categoryId: number) =>
    categoryMap.get(categoryId) ?? "Не указана";

  const getCategoryColor = (categoryId: number) => {
    const colors = [
      'from-blue-500 to-cyan-500',
      'from-emerald-500 to-green-500',
      'from-purple-500 to-pink-500',
      'from-amber-500 to-orange-500',
      'from-rose-500 to-red-500',
      'from-indigo-500 to-blue-500',
      'from-violet-500 to-purple-500',
      'from-teal-500 to-cyan-500',
    ];
    const index = categoryId % colors.length;
    return colors[index];
  };

  const sortServices = (list: IService[]) => {
    return [...list].sort((a, b) => {
      let aVal: string | number = "";
      let bVal: string | number = "";

      switch (sortField) {
        case "title":
          aVal = a.title;
          bVal = b.title;
          break;
        case "duration":
          aVal = a.duration;
          bVal = b.duration;
          break;
        case "category":
          aVal = getCategoryName(a.categoryId);
          bVal = getCategoryName(b.categoryId);
          break;
        case "status":
          aVal = a.isActive ? 1 : 0;
          bVal = b.isActive ? 1 : 0;
          break;
      }

      if (typeof aVal === "string") {
        return sortOrder === "asc"
          ? aVal.localeCompare(bVal as string)
          : (bVal as string).localeCompare(aVal);
      }

      return sortOrder === "asc"
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    });
  };

  const filteredAndSortedServices = useMemo(() => {
    let filtered = services;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          getCategoryName(s.categoryId).toLowerCase().includes(q)
      );
    }

    if (statusFilter) {
      filtered = filtered.filter((s) =>
        statusFilter === "active" ? s.isActive : !s.isActive
      );
    }

    if (categoryFilter) {
      filtered = filtered.filter(
        (s) => s.categoryId === Number(categoryFilter)
      );
    }

    return sortServices(filtered);
  }, [
    services,
    searchQuery,
    statusFilter,
    categoryFilter,
    sortField,
    sortOrder,
    categoryMap,
  ]);

  const openModalForAdd = () => {
    setEditingService(null);
    setFormData({
      title: "",
      description: "",
      duration: 0,
      categoryId: categories.length > 0 ? categories[0].id : 0,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const openModalForEdit = (service: IService) => {
    setEditingService(service);
    setFormData({
      title: service.title,
      description: service.description,
      duration: service.duration,
      categoryId: service.categoryId,
      isActive: service.isActive,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingService(null);
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (type === "number") {
      setFormData((prev) => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.title.trim() ||
      formData.duration <= 0 ||
      formData.categoryId === 0
    ) {
      alert("Пожалуйста, заполните все обязательные поля");
      return;
    }

    setIsLoading(true);

    try {
      if (editingService) {
        const updatedService = await serviceService.update(editingService.id, {
          title: formData.title,
          description: formData.description,
          duration: formData.duration,
          isActive: formData.isActive,
        });

        setServices((prev) =>
          prev.map((s) =>
            s.id === editingService.id
              ? {
                  ...updatedService,
                  categoryName:
                    categories.find(
                      (cat) => cat.id === updatedService.categoryId
                    )?.title || "Не указана",
                }
              : s
          )
        );
      } else {
        const newService = await serviceService.create({
          title: formData.title,
          description: formData.description,
          duration: formData.duration,
          isActive: formData.isActive,
          categoryId: formData.categoryId,
        });

        setServices((prev) => [
          ...prev,
          {
            ...newService,
            categoryName:
              categories.find((cat) => cat.id === newService.categoryId)
                ?.title || "Не указана",
          },
        ]);
      }

      closeModal();
    } catch (error) {
      console.error("Ошибка сохранения:", error);
      alert("Не удалось сохранить услугу. Проверьте ввод и попробуйте снова.");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteService = async (serviceId: number) => {
    if (!confirm("Вы уверены, что хотите удалить эту услугу?")) return;

    try {
      await serviceService.delete(serviceId);
      setServices((prev) => prev.filter((s) => s.id !== serviceId));
    } catch (error) {
      console.error("Ошибка удаления:", error);
      alert("Не удалось удалить услугу");
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
    setStatusFilter("");
    setCategoryFilter("");
    setSearchQuery("");
  };

  const activeServicesCount = useMemo(
    () => services.filter((s) => s.isActive).length,
    [services]
  );
  const inactiveServicesCount = useMemo(
    () => services.filter((s) => !s.isActive).length,
    [services]
  );
  const totalDuration = useMemo(
    () => services.reduce((acc, s) => acc + s.duration, 0),
    [services]
  );
  const avgDuration = useMemo(
    () => (services.length > 0 ? Math.round(totalDuration / services.length) : 0),
    [services, totalDuration]
  );

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortOrder === "asc" ? "↑" : "↓";
  };

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
                  <Package className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                  Управление услугами
                </h1>
              </motion.div>
              <p className="text-gray-600">
                Всего услуг: <span className="font-semibold text-gray-800">{services.length}</span>
                {filteredAndSortedServices.length !== services.length && (
                  <span className="ml-2">
                    (показано {filteredAndSortedServices.length})
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
                onClick={() => loadServices(false)}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-300/50 text-gray-700 rounded-xl font-medium hover:bg-gray-50/80 transition-all duration-300 shadow-sm"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
                Обновить
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={openModalForAdd}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:from-purple-700 hover:to-pink-700"
              >
                <Plus className="w-5 h-5" />
                Добавить услугу
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
                          placeholder="Поиск по названию, описанию..."
                          className="w-full pl-10 pr-4 py-3.5 bg-white/90 backdrop-blur-sm border border-gray-300/50 rounded-2xl focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 text-gray-900 placeholder-gray-500 transition-all duration-300"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Фильтр по статусу */}
                    <select
                      className="w-full px-4 py-3.5 bg-white/90 backdrop-blur-sm border border-gray-300/50 rounded-2xl focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 text-gray-900 transition-all duration-300"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="">Все статусы</option>
                      <option value="active">Активные</option>
                      <option value="inactive">Неактивные</option>
                    </select>

                    {/* Фильтр по категории */}
                    <select
                      className="w-full px-4 py-3.5 bg-white/90 backdrop-blur-sm border border-gray-300/50 rounded-2xl focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 text-gray-900 transition-all duration-300"
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                      <option value="">Все категории</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Сортировка */}
                  <div className="mt-4 pt-4 border-t border-gray-200/50">
                    <div className="text-sm font-medium text-gray-700 mb-2">Сортировка:</div>
                    <div className="flex flex-wrap gap-2">
                      {(["title", "duration", "category", "status"] as SortField[]).map(
                        (field) => (
                          <motion.button
                            key={field}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleSortChange(field)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-xl transition-all duration-300 border ${
                              sortField === field
                                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md border-transparent"
                                : "bg-white/80 text-gray-700 border-gray-300/50 hover:bg-gray-50/80"
                            }`}
                          >
                            {field === "title" && "Название"}
                            {field === "duration" && "Продолжительность"}
                            {field === "category" && "Категория"}
                            {field === "status" && "Статус"}
                            {getSortIcon(field)}
                          </motion.button>
                        )
                      )}
                    </div>
                  </div>

                  {(statusFilter || categoryFilter || searchQuery) && (
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
            className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-20">
              <Package className="w-16 h-16" />
            </div>
            <div className="relative z-10">
              <div className="text-4xl font-bold mb-2">{services.length}</div>
              <div className="text-blue-100 font-medium">Всего услуг</div>
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
              <div className="text-4xl font-bold mb-2">{activeServicesCount}</div>
              <div className="text-emerald-100 font-medium">Активные</div>
              <div className="text-sm text-emerald-200/80 mt-2">Доступны для записи</div>
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
              <Clock className="w-16 h-16" />
            </div>
            <div className="relative z-10">
              <div className="text-4xl font-bold mb-2">{avgDuration}</div>
              <div className="text-amber-100 font-medium">Среднее время</div>
              <div className="text-sm text-amber-200/80 mt-2">Минут на услугу</div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-20">
              <Tag className="w-16 h-16" />
            </div>
            <div className="relative z-10">
              <div className="text-4xl font-bold mb-2">{categories.length}</div>
              <div className="text-purple-100 font-medium">Категорий</div>
              <div className="text-sm text-purple-200/80 mt-2">Активных категорий</div>
            </div>
          </motion.div>
        </div>

        {/* Карточки услуг */}
        {isLoading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-500 font-medium">Загрузка услуг...</p>
          </div>
        ) : filteredAndSortedServices.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="col-span-full bg-white/80 backdrop-blur-sm rounded-2xl p-12 text-center border border-gray-200/50"
          >
            <div className="w-20 h-20 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Услуги не найдены</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {searchQuery || statusFilter || categoryFilter 
                ? "Попробуйте изменить параметры поиска" 
                : "Создайте первую услугу для вашего бизнеса"}
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={openModalForAdd}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Создать услугу
            </motion.button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
            <AnimatePresence>
              {filteredAndSortedServices.map((service, index) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.01, y: -2 }}
                  className="bg-gradient-to-br from-white to-gray-50/50 rounded-3xl border border-gray-200/50 p-5 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm group"
                >
                  {/* Верхняя часть с заголовком и статусом */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1">
                        {service.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {service.description || "Описание отсутствует"}
                      </p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                      service.isActive
                        ? 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700'
                        : 'bg-gradient-to-r from-rose-100 to-red-100 text-rose-700'
                    }`}>
                      {service.isActive ? 'Активна' : 'Неактивна'}
                    </span>
                  </div>

                  {/* Категория */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${getCategoryColor(service.categoryId)} flex items-center justify-center`}>
                      <Tag className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {getCategoryName(service.categoryId)}
                    </span>
                  </div>

                  {/* Длительность */}
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                      <Clock className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-900">{service.duration} мин.</div>
                      <div className="text-xs text-gray-600">Продолжительность</div>
                    </div>
                  </div>

                  {/* Действия */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200/50">
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => openModalForEdit(service)}
                        className="p-2 bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-600 hover:text-blue-700 rounded-xl border border-blue-200/50 transition-all duration-300"
                      >
                        <Edit className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => deleteService(service.id)}
                        className="p-2 bg-gradient-to-r from-rose-50 to-red-50 text-rose-600 hover:text-rose-700 rounded-xl border border-rose-200/50 transition-all duration-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                    <div className="text-xs text-gray-500">
                      ID: {service.id}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Информация внизу */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-500 to-green-500"></div>
              <span>Активные</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-rose-500 to-red-500"></div>
              <span>Неактивные</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <span>
              Загружено: {services.length} услуг
            </span>
            <span className="text-purple-600 font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              {activeServicesCount} сейчас доступно
            </span>
          </div>
        </div>

        {/* Модальное окно */}
        <AnimatePresence>
          {isModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
              onClick={closeModal}
            >
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 30, scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-md bg-gradient-to-br from-white to-gray-50/50 rounded-3xl shadow-2xl border border-gray-200/50 backdrop-blur-xl overflow-hidden max-h-[90vh] flex flex-col"
              >
                {/* Градиентный заголовок */}
                <div className="relative px-6 py-5 bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600">
                  <div className="absolute top-0 right-0 p-4 opacity-20">
                    <Sparkles className="w-12 h-12" />
                  </div>
                  
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                        <Package className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">
                          {editingService ? 'Редактирование услуги' : 'Новая услуга'}
                        </h2>
                        <p className="text-white/80 text-xs mt-1">
                          {editingService ? 'Измените параметры услуги' : 'Создайте новую услугу'}
                        </p>
                      </div>
                    </div>
                    
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={closeModal}
                      className="p-1.5 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-all duration-300"
                    >
                      <X className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>

                {/* Основной контент */}
                <div className="flex-1 overflow-y-auto p-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Название */}
                    <div className="bg-gradient-to-br from-purple-50/30 to-pink-50/30 rounded-2xl p-4 border border-purple-200/30">
                      <div className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Tag className="w-4 h-4 text-purple-500" />
                        Название услуги *
                      </div>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="Например: Стрижка мужская"
                        className="w-full px-4 py-3.5 bg-white/80 backdrop-blur-sm border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 text-gray-900 placeholder-gray-500 transition-all duration-300"
                        required
                      />
                    </div>

                    {/* Описание */}
                    <div className="bg-gradient-to-br from-blue-50/30 to-cyan-50/30 rounded-2xl p-4 border border-blue-200/30">
                      <div className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Edit className="w-4 h-4 text-blue-500" />
                        Описание услуги
                      </div>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Краткое описание услуги..."
                        rows={3}
                        className="w-full px-4 py-3.5 bg-white/80 backdrop-blur-sm border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-gray-900 placeholder-gray-500 transition-all duration-300 resize-none"
                      />
                    </div>

                    {/* Продолжительность и категория */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gradient-to-br from-amber-50/30 to-orange-50/30 rounded-2xl p-4 border border-amber-200/30">
                        <div className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <Clock className="w-4 h-4 text-amber-500" />
                          Продолжительность *
                        </div>
                        <div className="relative">
                          <input
                            type="number"
                            name="duration"
                            value={formData.duration}
                            onChange={handleInputChange}
                            min="5"
                            step="5"
                            className="w-full pl-10 pr-4 py-3.5 bg-white/80 backdrop-blur-sm border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-gray-900 transition-all duration-300"
                            required
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">мин.</span>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-emerald-50/30 to-green-50/30 rounded-2xl p-4 border border-emerald-200/30">
                        <div className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <Tag className="w-4 h-4 text-emerald-500" />
                          Категория *
                        </div>
                        <select
                          name="categoryId"
                          value={formData.categoryId}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3.5 bg-white/80 backdrop-blur-sm border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-gray-900 transition-all duration-300"
                          required
                        >
                          <option value={0}>Выберите категорию</option>
                          {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.title}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Статус */}
                    <div className="bg-gradient-to-br from-gray-50/30 to-white/30 rounded-2xl p-4 border border-gray-200/30">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl ${formData.isActive ? 'bg-gradient-to-r from-emerald-500 to-green-500' : 'bg-gradient-to-r from-rose-500 to-red-500'}`}>
                            {formData.isActive ? (
                              <Eye className="w-4 h-4 text-white" />
                            ) : (
                              <EyeOff className="w-4 h-4 text-white" />
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">Статус услуги</div>
                            <div className="text-xs text-gray-600">
                              {formData.isActive ? 'Видна клиентам' : 'Скрыта от клиентов'}
                            </div>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            name="isActive"
                            checked={formData.isActive}
                            onChange={handleInputChange}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r from-emerald-500 to-green-500"></div>
                        </label>
                      </div>
                    </div>

                    {/* Сводная информация */}
                    {formData.title && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-gradient-to-r from-gray-50/50 to-white/30 border border-gray-200/30 rounded-2xl backdrop-blur-sm"
                      >
                        <div className="text-xs text-gray-600 mb-2">Сводная информация</div>
                        <div className="text-sm font-medium text-gray-900 mb-1">{formData.title}</div>
                        {formData.categoryId > 0 && (
                          <div className="text-xs text-gray-600">
                            Категория: {categories.find(c => c.id === formData.categoryId)?.title}
                          </div>
                        )}
                        {formData.duration > 0 && (
                          <div className="text-xs text-gray-600">
                            Продолжительность: {formData.duration} минут
                          </div>
                        )}
                      </motion.div>
                    )}

                    {/* Кнопки */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200/50">
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={closeModal}
                        className="flex-1 px-4 py-3.5 bg-white/80 backdrop-blur-sm border border-gray-300/50 text-gray-700 rounded-xl font-semibold hover:bg-gray-50/80 transition-all duration-300 shadow-sm text-sm"
                      >
                        Отмена
                      </motion.button>
                      
                      <motion.button
                        type="submit"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={isLoading}
                        className="flex-1 px-4 py-3.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 text-sm"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Сохранение...
                          </>
                        ) : (
                          <>
                            {editingService ? <Edit className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                            {editingService ? 'Сохранить изменения' : 'Создать услугу'}
                          </>
                        )}
                      </motion.button>
                    </div>
                  </form>
                </div>

                {/* Футер */}
                <div className="px-6 py-3 border-t border-gray-200/50 bg-gradient-to-r from-gray-50/50 to-white/30">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                      <Shield className="w-2.5 h-2.5" />
                      <span>Данные защищены</span>
                    </div>
                    <span>ID: {editingService ? editingService.id : 'Новый'}</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}