"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { servicePriceService } from "@/services/service-price/service-price.service";
import { categoryService } from "@/services/category/category.service";
import { masterService } from "@/services/master/master.service";
import { serviceService } from "@/services/service/service.service";
import { IServicePrice, UIServicePrice } from "@/types/service-price.types";
import { ICategory } from "@/types/category.types";
import { IMaster } from "@/types/masters.type";
import { IService } from "@/types/services.types";
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
  Users,
  DollarSign,
  Award,
  Package,
  TrendingDown,
  CheckCircle,
  X,
  Loader2,
  Star,
  BarChart3,
  Eye,
  EyeOff,
  Calendar,
  Target,
  Percent,
  Crown,
} from "lucide-react";

type SortField = "service" | "master" | "price" | "status";

export default function MasterService() {
  const [rawPrices, setRawPrices] = useState<IServicePrice[]>([]);
  const [prices, setPrices] = useState<UIServicePrice[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [masters, setMasters] = useState<IMaster[]>([]);
  const [services, setServices] = useState<IService[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPrice, setEditingPrice] = useState<UIServicePrice | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [masterFilter, setMasterFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortField, setSortField] = useState<SortField>("service");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const [formData, setFormData] = useState({
    serviceId: 0,
    masterId: 0,
    price: 0,
    isActive: true,
    durationOverride: null as number | null,
    _baseDuration: 30,
  });

  const loadData = async (showLoading = true) => {
    if (showLoading) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }
    try {
      const [priceData, categoryData, masterData, serviceData] =
        await Promise.all([
          servicePriceService.getAll(),
          categoryService.getAll(),
          masterService.getAll(),
          serviceService.getAll(),
        ]);

      setRawPrices(priceData);
      setCategories(categoryData);
      setMasters(masterData);
      setServices(serviceData);
    } catch (error) {
      console.error("Ошибка загрузки:", error);
      alert("Не удалось загрузить данные. Проверьте соединение.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const categoryMap = useMemo(
    () => new Map(categories.map((c) => [c.id, c.title])),
    [categories],
  );

  useEffect(() => {
    const mapped: UIServicePrice[] = rawPrices
      .filter((p) => p.service != null && p.master != null)
      .map((p) => {
        const service = p.service!;
        const master = p.master!;
        return {
          id: p.id,
          price: p.price,
          isActive: p.isActive,
          serviceId: service.id,
          serviceTitle: service.title,
          categoryId: service.categoryId,
          categoryName: categoryMap.get(service.categoryId) ?? "Не указана",
          masterId: master.id,
          masterFullName: `${master.surname} ${master.name}`,
          masterSpecialization: master.specialization || "",
          durationOverride: p.durationOverride ?? null,
        };
      });

    setPrices(mapped);
  }, [rawPrices, categoryMap]);

  const filteredAndSortedPrices = useMemo(() => {
    let list = [...prices];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.serviceTitle.toLowerCase().includes(q) ||
          p.categoryName.toLowerCase().includes(q) ||
          p.masterFullName.toLowerCase().includes(q) ||
          p.masterSpecialization.toLowerCase().includes(q) ||
          p.price.toString().includes(q),
      );
    }

    if (categoryFilter) {
      list = list.filter((p) => p.categoryId === Number(categoryFilter));
    }
    if (masterFilter) {
      list = list.filter((p) => p.masterId === Number(masterFilter));
    }
    if (statusFilter) {
      const isActive = statusFilter === "active";
      list = list.filter((p) => p.isActive === isActive);
    }

    list.sort((a, b) => {
      let aVal: string | number = "";
      let bVal: string | number = "";

      switch (sortField) {
        case "service":
          aVal = a.serviceTitle;
          bVal = b.serviceTitle;
          break;
        case "master":
          aVal = a.masterFullName;
          bVal = b.masterFullName;
          break;
        case "price":
          aVal = a.price;
          bVal = b.price;
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

    return list;
  }, [
    prices,
    searchQuery,
    categoryFilter,
    masterFilter,
    statusFilter,
    sortField,
    sortOrder,
  ]);

  const stats = useMemo(() => {
    const total = prices.length;
    const active = prices.filter((p) => p.isActive).length;
    const inactive = total - active;
    
    // Исправленный расчет средней цены
    const totalSum = prices.reduce((sum, p) => {
      // Убедимся, что price это число
      const price = Number(p.price);
      return sum + (isNaN(price) ? 0 : price);
    }, 0);
    
    const avgPrice = total > 0 ? Math.round(totalSum / total) : 0;
    
    // Исправленный расчет мин/макс цен
    const validPrices = prices
      .map(p => Number(p.price))
      .filter(price => !isNaN(price) && price > 0);
    
    const maxPrice = validPrices.length > 0 ? Math.max(...validPrices) : 0;
    const minPrice = validPrices.length > 0 ? Math.min(...validPrices) : 0;

    return { 
      total, 
      active, 
      inactive, 
      avgPrice, 
      maxPrice, 
      minPrice,
      totalSum // Для отладки, можно убрать
    };
  }, [prices]);

  const openModalForAdd = () => {
    setEditingPrice(null);
    setFormData({
      serviceId: 0,
      masterId: 0,
      price: 0,
      isActive: true,
      durationOverride: null,
      _baseDuration: 30,
    });
    setIsModalOpen(true);
  };

  const openModalForEdit = (price: UIServicePrice) => {
    const service = services.find((s) => s.id === price.serviceId);
    const baseDuration = service?.duration || 30;

    setEditingPrice(price);
    setFormData({
      serviceId: price.serviceId,
      masterId: price.masterId,
      price: price.price,
      isActive: price.isActive,
      durationOverride: price.durationOverride ?? null,
      _baseDuration: baseDuration,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPrice(null);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>,
  ) => {
    const { name, value, type } = e.target;

    if (name === "durationOverride") {
      const numValue =
        value === "" || value === "null" ? null : parseInt(value) || 0;
      setFormData((prev) => ({ ...prev, [name]: numValue }));
      return;
    }

    const val =
      type === "checkbox"
        ? (e.target as HTMLInputElement).checked
        : type === "number"
          ? Math.max(0, parseInt(value) || 0)
          : value;

    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { serviceId, masterId, price, durationOverride } = formData;
    if (serviceId === 0 || masterId === 0 || price <= 0) {
      alert("Пожалуйста, выберите услугу, мастера и укажите цену > 0 ₽");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        serviceId,
        masterId,
        price,
        isActive: formData.isActive,
        durationOverride,
      };

      if (editingPrice) {
        const updated = await servicePriceService.update(
          editingPrice.id,
          payload,
        );
        setRawPrices((prev) =>
          prev.map((p) => (p.id === updated.id ? updated : p)),
        );
      } else {
        const created = await servicePriceService.create(payload);
        setRawPrices((prev) => [created, ...prev]);
      }

      closeModal();
    } catch (error) {
      console.error("Ошибка сохранения цены:", error);
      alert("Не удалось сохранить запись. Повторите попытку.");
    } finally {
      setIsLoading(false);
    }
  };

  const deletePrice = async (id: number) => {
    if (!confirm("Вы уверены? Эта цена будет удалена безвозвратно.")) return;

    try {
      await servicePriceService.delete(id);
      setRawPrices((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      console.error("Ошибка удаления:", error);
      alert("Не удалось удалить запись");
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
    setCategoryFilter("");
    setMasterFilter("");
    setStatusFilter("");
  };

  const getCategoryOptions = () => {
    const usedCategories = new Set(
      services.filter((s) => s.isActive).map((s) => s.categoryId),
    );
    return categories.filter((c) => usedCategories.has(c.id));
  };

  const getServicesByCategory = (categoryId: number) => {
    return services.filter((s) => s.categoryId === categoryId && s.isActive);
  };

  const getCategoryColor = (categoryId: number) => {
    const colors = [
      "from-blue-500 to-cyan-500",
      "from-emerald-500 to-green-500",
      "from-purple-500 to-pink-500",
      "from-amber-500 to-orange-500",
      "from-rose-500 to-red-500",
      "from-indigo-500 to-blue-500",
    ];
    const index = categoryId % colors.length;
    return colors[index];
  };

  const getMasterInitial = (master: IMaster) => {
    return `${master.surname[0]?.toUpperCase() || "М"}${master.name[0]?.toUpperCase() || "М"}`;
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortOrder === "asc" ? "↑" : "↓";
  };

  // Для отладки - добавим проверку цен
  useEffect(() => {
    if (prices.length > 0) {
      console.log("Все цены:", prices.map(p => ({id: p.id, price: p.price, type: typeof p.price})));
      console.log("Статистика:", stats);
    }
  }, [prices, stats]);

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
                <div className="p-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                  Управление ценами мастеров
                </h1>
              </motion.div>
              <p className="text-gray-600">
                Всего цен:{" "}
                <span className="font-semibold text-gray-800">
                  {stats.total}
                </span>
                {filteredAndSortedPrices.length !== stats.total && (
                  <span className="ml-2">
                    (показано {filteredAndSortedPrices.length})
                  </span>
                )}
                {/* Для отладки: сумма цен и средняя */}
                <span className="ml-4 text-sm text-gray-500">
                  Сумма: {stats.totalSum?.toLocaleString()} ₽
                </span>
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
                {isFilterOpen ? (
                  <ChevronDown className="w-4 h-4 rotate-180" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => loadData(false)}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-300/50 text-gray-700 rounded-xl font-medium hover:bg-gray-50/80 transition-all duration-300 shadow-sm"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
                Обновить
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={openModalForAdd}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:from-indigo-700 hover:to-purple-700"
              >
                <Plus className="w-5 h-5" />
                Назначить цену
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
                          placeholder="Поиск по услуге, мастеру, цене..."
                          className="w-full pl-10 pr-4 py-3.5 bg-white/90 backdrop-blur-sm border border-gray-300/50 rounded-2xl focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-gray-900 placeholder-gray-500 transition-all duration-300"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Фильтр по категории */}
                    <select
                      className="w-full px-4 py-3.5 bg-white/90 backdrop-blur-sm border border-gray-300/50 rounded-2xl focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-gray-900 transition-all duration-300"
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                      <option value="">Все категории</option>
                      {getCategoryOptions().map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.title}
                        </option>
                      ))}
                    </select>

                    {/* Фильтр по статусу */}
                    <select
                      className="w-full px-4 py-3.5 bg-white/90 backdrop-blur-sm border border-gray-300/50 rounded-2xl focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-gray-900 transition-all duration-300"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="">Все статусы</option>
                      <option value="active">Активные</option>
                      <option value="inactive">Неактивные</option>
                    </select>
                  </div>

                  {/* Мастер и сортировка */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <select
                      className="w-full px-4 py-3.5 bg-white/90 backdrop-blur-sm border border-gray-300/50 rounded-2xl focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-gray-900 transition-all duration-300"
                      value={masterFilter}
                      onChange={(e) => setMasterFilter(e.target.value)}
                    >
                      <option value="">Все мастера</option>
                      {masters
                        .filter((m) => m.isActive)
                        .map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.surname} {m.name}
                          </option>
                        ))}
                    </select>

                    {/* Сортировка */}
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className="text-sm font-medium text-gray-700">
                        Сортировка:
                      </span>
                      {(
                        ["service", "master", "price", "status"] as SortField[]
                      ).map((field) => (
                        <motion.button
                          key={field}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleSortChange(field)}
                          className={`px-3 py-1.5 text-xs font-medium rounded-xl transition-all duration-300 border ${
                            sortField === field
                              ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md border-transparent"
                              : "bg-white/80 text-gray-700 border-gray-300/50 hover:bg-gray-50/80"
                          }`}
                        >
                          {field === "service" && "Услуга"}
                          {field === "master" && "Мастер"}
                          {field === "price" && "Цена"}
                          {field === "status" && "Статус"}
                          {getSortIcon(field)}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {(searchQuery ||
                    categoryFilter ||
                    masterFilter ||
                    statusFilter) && (
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
              <DollarSign className="w-16 h-16" />
            </div>
            <div className="relative z-10">
              <div className="text-4xl font-bold mb-2">{stats.total}</div>
              <div className="text-blue-100 font-medium">Всего цен</div>
              <div className="text-sm text-blue-200/80 mt-2">
                Назначено комбинаций
              </div>
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
              <div className="text-4xl font-bold mb-2">{stats.active}</div>
              <div className="text-emerald-100 font-medium">Активные</div>
              <div className="text-sm text-emerald-200/80 mt-2">
                Доступны клиентам
              </div>
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
              <BarChart3 className="w-16 h-16" />
            </div>
            <div className="relative z-10">
              <div className="text-4xl font-bold mb-2">
                {stats.avgPrice.toLocaleString()} ₽
              </div>
              <div className="text-amber-100 font-medium">Средняя цена</div>
              <div className="text-sm text-amber-200/80 mt-2">
                По всем записям
              </div>
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
              <Crown className="w-16 h-16" />
            </div>
            <div className="relative z-10">
              <div className="text-4xl font-bold mb-2">
                {stats.maxPrice.toLocaleString()} ₽
              </div>
              <div className="text-purple-100 font-medium">Максимум</div>
              <div className="text-sm text-purple-200/80 mt-2">
                Самая высокая цена
              </div>
            </div>
          </motion.div>
        </div>

        {/* Карточки цен */}
        {isLoading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-500 font-medium">Загрузка цен...</p>
          </div>
        ) : filteredAndSortedPrices.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="col-span-full bg-white/80 backdrop-blur-sm rounded-2xl p-12 text-center border border-gray-200/50"
          >
            <div className="w-20 h-20 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
              <DollarSign className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Цены не назначены
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {searchQuery || categoryFilter || masterFilter || statusFilter
                ? "Попробуйте изменить параметры поиска"
                : "Создайте первую комбинацию «мастер + услуга»"}
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={openModalForAdd}
              className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Назначить цену
            </motion.button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
            <AnimatePresence>
              {filteredAndSortedPrices.map((price, index) => {
                const displayDuration =
                  price.durationOverride ??
                  services.find((s) => s.id === price.serviceId)?.duration ??
                  "—";
                const isOverride = price.durationOverride != null;
                const master = masters.find((m) => m.id === price.masterId);
                const service = services.find((s) => s.id === price.serviceId);
                const serviceDuration = service?.duration || 30;

                return (
                  <motion.div
                    key={price.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.01 }}
                  >
                    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow transition-all duration-200">
                      {/* Заголовок */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className={`text-xs font-medium px-2 py-1 rounded ${price.isActive ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-600"}`}
                          >
                            {price.isActive ? "Активна" : "Неактивна"}
                          </span>
                          <span className="text-xs text-gray-400">
                            #{price.id}
                          </span>
                        </div>
                        <h3 className="font-semibold text-gray-900 text-base mb-1">
                          {price.serviceTitle}
                        </h3>
                        <div className="text-sm text-gray-600">
                          {price.categoryName}
                        </div>
                      </div>

                      {/* Мастер */}
                      <div className="flex items-center gap-2 mb-4 p-2 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 rounded-lg bg-blue-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                          {master ? getMasterInitial(master) : "М"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {price.masterFullName}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {price.masterSpecialization || "Без специализации"}
                          </div>
                        </div>
                      </div>

                      {/* Цена и длительность */}
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <div className="text-2xl font-bold text-gray-900">
                            {Number(price.price).toLocaleString()} ₽
                          </div>
                          <div className="text-xs text-gray-500">Цена</div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 justify-end">
                            <div className="text-lg font-bold text-gray-900">
                              {displayDuration} мин.
                            </div>
                            {isOverride && (
                              <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">
                                инд.
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            {isOverride && serviceDuration
                              ? `Стандарт: ${serviceDuration} мин.`
                              : "Длительность"}
                          </div>
                        </div>
                      </div>

                      {/* Действия */}
                      <div className="flex gap-2 pt-3 border-t border-gray-100">
                        <button
                          onClick={() => openModalForEdit(price)}
                          className="flex-1 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-200 flex items-center justify-center gap-1"
                        >
                          <Edit className="w-4 h-4" />
                          Изменить
                        </button>
                        <button
                          onClick={() => deletePrice(price.id)}
                          className="flex-1 py-2 text-sm font-medium text-gray-600 hover:text-rose-600 hover:bg-gray-50 rounded-lg transition-colors duration-200 flex items-center justify-center gap-1"
                        >
                          <Trash2 className="w-4 h-4" />
                          Удалить
                        </button>
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
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-500 to-green-500"></div>
              <span>Активные</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-rose-500 to-red-500"></div>
              <span>Неактивные</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"></div>
              <span>Индивидуальная длительность</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span>Загружено: {stats.total} цен</span>
            <span className="text-indigo-600 font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              {stats.active} сейчас доступно
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
                <div className="relative px-6 py-5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
                  <div className="absolute top-0 right-0 p-4 opacity-20">
                    <Sparkles className="w-12 h-12" />
                  </div>

                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                        <DollarSign className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">
                          {editingPrice
                            ? "Редактирование цены"
                            : "Назначение цены"}
                        </h2>
                        <p className="text-white/80 text-xs mt-1">
                          {editingPrice
                            ? "Измените параметры цены"
                            : "Создайте новую цену для мастера"}
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
                    {/* Категория и услуга */}
                    <div className="bg-gradient-to-br from-indigo-50/30 to-purple-50/30 rounded-2xl p-4 border border-indigo-200/30">
                      <div className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Package className="w-4 h-4 text-indigo-500" />
                        Категория и услуга *
                      </div>
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <div className="text-xs text-gray-600 mb-2">
                            Категория
                          </div>
                          <select
                            value={
                              formData.serviceId
                                ? services.find(
                                    (s) => s.id === formData.serviceId,
                                  )?.categoryId || 0
                                : 0
                            }
                            onChange={(e) => {
                              const catId = Number(e.target.value);
                              const firstService = services.find(
                                (s) => s.categoryId === catId && s.isActive,
                              );
                              const duration = firstService?.duration || 30;
                              setFormData((prev) => ({
                                ...prev,
                                serviceId: firstService?.id || 0,
                                durationOverride: null,
                                _baseDuration: duration,
                              }));
                            }}
                            className="w-full px-4 py-3.5 bg-white/80 backdrop-blur-sm border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-gray-900 transition-all duration-300"
                            required
                          >
                            <option value={0}>Выберите категорию</option>
                            {getCategoryOptions().map((cat) => (
                              <option key={cat.id} value={cat.id}>
                                {cat.title}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <div className="text-xs text-gray-600 mb-2">
                            Услуга
                          </div>
                          <select
                            value={formData.serviceId}
                            onChange={(e) => {
                              const serviceId = Number(e.target.value);
                              const service = services.find(
                                (s) => s.id === serviceId,
                              );
                              const duration = service?.duration || 30;
                              setFormData((prev) => ({
                                ...prev,
                                serviceId,
                                durationOverride: null,
                                _baseDuration: duration,
                              }));
                            }}
                            className="w-full px-4 py-3.5 bg-white/80 backdrop-blur-sm border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-gray-900 transition-all duration-300"
                            required
                          >
                            <option value={0}>Выберите услугу</option>
                            {formData.serviceId
                              ? getServicesByCategory(
                                  services.find(
                                    (s) => s.id === formData.serviceId,
                                  )?.categoryId || 0,
                                ).map((s) => (
                                  <option key={s.id} value={s.id}>
                                    {s.title} ({s.duration} мин.)
                                  </option>
                                ))
                              : services
                                  .filter((s) => s.isActive)
                                  .map((s) => (
                                    <option key={s.id} value={s.id}>
                                      {s.title} ({s.duration} мин.)
                                    </option>
                                  ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Мастер */}
                    <div className="bg-gradient-to-br from-blue-50/30 to-cyan-50/30 rounded-2xl p-4 border border-blue-200/30">
                      <div className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-500" />
                        Мастер *
                      </div>
                      <select
                        name="masterId"
                        value={formData.masterId}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3.5 bg-white/80 backdrop-blur-sm border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-gray-900 transition-all duration-300"
                        required
                      >
                        <option value={0}>Выберите мастера</option>
                        {masters
                          .filter((m) => m.isActive)
                          .map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.surname} {m.name} — {m.specialization}
                            </option>
                          ))}
                      </select>
                    </div>

                    {/* Продолжительность */}
                    <div className="bg-gradient-to-br from-amber-50/30 to-orange-50/30 rounded-2xl p-4 border border-amber-200/30">
                      <div className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-500" />
                        Продолжительность
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-amber-50/50 to-orange-50/50 rounded-xl border border-amber-200/30">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              Базовая длительность
                            </div>
                            <div className="text-xs text-gray-600">
                              {formData._baseDuration} минут
                            </div>
                          </div>
                          <div className="text-lg font-bold text-amber-700">
                            {formData._baseDuration} мин.
                          </div>
                        </div>

                        <div className="space-y-3">
                          <label className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50/50 to-white/30 rounded-xl border border-gray-200/30 cursor-pointer hover:bg-white/50 transition-all duration-300">
                            <input
                              type="radio"
                              name="durationMode"
                              checked={formData.durationOverride === null}
                              onChange={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  durationOverride: null,
                                }))
                              }
                              className="h-4 w-4 text-indigo-600"
                            />
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-900">
                                Использовать базовую
                              </div>
                              <div className="text-xs text-gray-600">
                                {formData._baseDuration} минут
                              </div>
                            </div>
                          </label>

                          <label className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50/50 to-white/30 rounded-xl border border-gray-200/30 cursor-pointer hover:bg-white/50 transition-all duration-300">
                            <input
                              type="radio"
                              name="durationMode"
                              checked={formData.durationOverride !== null}
                              onChange={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  durationOverride: prev._baseDuration || 30,
                                }))
                              }
                              className="h-4 w-4 text-indigo-600"
                            />
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-900">
                                Указать свою
                              </div>
                              <div className="text-xs text-gray-600">
                                Индивидуальная длительность
                              </div>
                            </div>
                          </label>
                        </div>

                        {formData.durationOverride !== null && (
                          <div className="p-3 bg-gradient-to-r from-emerald-50/50 to-green-50/50 rounded-xl border border-emerald-200/30">
                            <div className="text-xs text-gray-600 mb-2">
                              Своя длительность
                            </div>
                            <div className="flex items-center gap-3">
                              <input
                                type="number"
                                value={formData.durationOverride || ""}
                                onChange={(e) =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    durationOverride: Math.max(
                                      5,
                                      parseInt(e.target.value) || 0,
                                    ),
                                  }))
                                }
                                min="5"
                                step="5"
                                className="flex-1 px-4 py-2.5 bg-white/80 backdrop-blur-sm border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-gray-900 transition-all duration-300"
                              />
                              <span className="text-gray-600 whitespace-nowrap">
                                минут
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Цена */}
                    <div className="bg-gradient-to-br from-emerald-50/30 to-green-50/30 rounded-2xl p-4 border border-emerald-200/30">
                      <div className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-emerald-500" />
                        Цена (₽) *
                      </div>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                          ₽
                        </span>
                        <input
                          type="number"
                          name="price"
                          value={formData.price || ""}
                          onChange={handleInputChange}
                          min="0"
                          step="50"
                          placeholder="Например: 1500"
                          className="w-full pl-10 pr-4 py-3.5 bg-white/80 backdrop-blur-sm border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-gray-900 placeholder-gray-500 transition-all duration-300"
                          required
                        />
                      </div>
                    </div>

                    {/* Статус */}
                    <div className="bg-gradient-to-br from-gray-50/30 to-white/30 rounded-2xl p-4 border border-gray-200/30">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-xl ${formData.isActive ? "bg-gradient-to-r from-emerald-500 to-green-500" : "bg-gradient-to-r from-rose-500 to-red-500"}`}
                          >
                            {formData.isActive ? (
                              <Eye className="w-4 h-4 text-white" />
                            ) : (
                              <EyeOff className="w-4 h-4 text-white" />
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">
                              Статус цены
                            </div>
                            <div className="text-xs text-gray-600">
                              {formData.isActive
                                ? "Видна клиентам"
                                : "Скрыта от клиентов"}
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
                          <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r from-emerald-500 to-green-500"></div>
                        </label>
                      </div>
                    </div>

                    {/* Сводная информация */}
                    {formData.serviceId > 0 && formData.masterId > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-gradient-to-r from-gray-50/50 to-white/30 border border-gray-200/30 rounded-2xl backdrop-blur-sm"
                      >
                        <div className="text-xs text-gray-600 mb-2">
                          Сводная информация
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">
                              Услуга:
                            </span>
                            <span className="text-sm font-medium text-gray-900">
                              {
                                services.find(
                                  (s) => s.id === formData.serviceId,
                                )?.title
                              }
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">
                              Мастер:
                            </span>
                            <span className="text-sm font-medium text-gray-900">
                              {
                                masters.find((m) => m.id === formData.masterId)
                                  ?.surname
                              }{" "}
                              {
                                masters.find((m) => m.id === formData.masterId)
                                  ?.name
                              }
                            </span>
                          </div>
                          {formData.price > 0 && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-700">
                                Цена:
                              </span>
                              <span className="text-sm font-bold text-emerald-700">
                                {formData.price.toLocaleString()} ₽
                              </span>
                            </div>
                          )}
                        </div>
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
                        className="flex-1 px-4 py-3.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 text-sm"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Сохранение...
                          </>
                        ) : (
                          <>
                            {editingPrice ? (
                              <Edit className="w-4 h-4" />
                            ) : (
                              <Plus className="w-4 h-4" />
                            )}
                            {editingPrice
                              ? "Сохранить изменения"
                              : "Создать цену"}
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
                    <span>ID: {editingPrice ? editingPrice.id : "Новый"}</span>
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