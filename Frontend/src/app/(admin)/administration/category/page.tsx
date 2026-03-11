"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  RefreshCw,
  TrendingUp,
  FolderTree,
  CheckCircle,
  XCircle,
  ChevronDown,
  Layers,
  BarChart3,
} from "lucide-react";
import { categoryService } from "@/services/category/category.service";
import { ICategory } from "@/types/category.types";
import CreateCategoryModal from "./CreateCategoryModal";

export default function CategoryPage() {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ICategory | null>(
    null,
  );

  // Убрали отдельный стейт servicesCount, так как данные теперь в объекте категории

  const loadCategories = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    else setIsRefreshing(true);

    try {
      const data = await categoryService.getAll();

      if (!Array.isArray(data)) throw new Error("Ожидался массив категорий");

      setCategories(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Ошибка загрузки");
      console.error(err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // 📊 Статистика (теперь считаем напрямую из данных)
  const stats = useMemo(() => {
    const totalServices = categories.reduce((sum, cat) => {
      return sum + (cat._count?.services || 0);
    }, 0);

    return {
      total: categories.length,
      active: categories.filter((cat) => cat.isActive).length,
      inactive: categories.filter((cat) => !cat.isActive).length,
      totalServices,
    };
  }, [categories]);

  const filteredCategories = useMemo(() => {
    return categories.filter((category) => {
      const matchesSearch =
        category.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "" ||
        (statusFilter === "active" && category.isActive) ||
        (statusFilter === "inactive" && !category.isActive);
      return matchesSearch && matchesStatus;
    });
  }, [categories, searchQuery, statusFilter]);

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("");
    setIsFilterOpen(false);
  };

  const toggleCategoryStatus = useCallback(
    async (categoryId: number) => {
      const category = categories.find((c) => c.id === categoryId);
      if (!category) return;

      try {
        const updated = await categoryService.update(categoryId, {
          title: category.title,
          description: category.description,
          isActive: !category.isActive,
        });

        setCategories((prev) =>
          prev.map((cat) => (cat.id === categoryId ? updated : cat)),
        );
      } catch (err: any) {
        alert("Не удалось обновить статус категории");
        console.error(err);
      }
    },
    [categories],
  );

  const deleteCategory = useCallback(async (categoryId: number) => {
    if (
      !confirm(
        "Вы уверены, что хотите удалить эту категорию? Это удалит все связанные услуги!",
      )
    )
      return;

    try {
      await categoryService.delete(categoryId);
      setCategories((prev) => prev.filter((cat) => cat.id !== categoryId));
      setSelectedCategory(null);
    } catch (err: any) {
      const msg =
        err.response?.data?.message || "Ошибка при удалении категории";
      alert(msg);
      console.error(err);
    }
  }, []);

  const handleCategoryCreated = useCallback(async () => {
    await loadCategories(false);
  }, []);

  // ✅ Функция получения количества (теперь просто читает из объекта)
  const getServicesCount = (category: ICategory) => {
    return category._count?.services || 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 font-medium">
            Загрузка категорий...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-gray-200/50 text-center max-w-md">
          <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Ошибка загрузки
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => loadCategories()}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300"
          >
            <RefreshCw className="w-4 h-4 inline mr-2" /> Повторить
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Заголовок */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
            <div>
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 mb-2"
              >
                <div className="p-2.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
                  <FolderTree className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                  Управление категориями
                </h1>
              </motion.div>
              <p className="text-gray-600">
                Всего категорий:{" "}
                <span className="font-semibold text-gray-800">
                  {categories.length}
                </span>
                {filteredCategories.length !== categories.length && (
                  <span className="ml-2">
                    (показано {filteredCategories.length})
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
                <Filter className="w-4 h-4" /> Фильтры
                {isFilterOpen ? (
                  <ChevronDown className="w-4 h-4 rotate-180" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => loadCategories(false)}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-300/50 text-gray-700 rounded-xl font-medium hover:bg-gray-50/80 transition-all duration-300 shadow-sm"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
                />{" "}
                Обновить
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsModalOpen(true)}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-purple-700"
              >
                <Plus className="w-5 h-5" /> Новая категория
              </motion.button>
            </div>
          </div>

          {/* Фильтры */}
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
                    <div className="relative">
                      <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Поиск по названию..."
                        className="w-full pl-10 pr-4 py-3.5 bg-white/90 backdrop-blur-sm border border-gray-300/50 rounded-2xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-gray-900 placeholder-gray-500 transition-all duration-300"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
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
                  {(statusFilter || searchQuery) && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-end mt-6 pt-4 border-t border-gray-200/50"
                    >
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={clearFilters}
                        className="flex items-center gap-2 px-4 py-2 text-red-600 border border-red-300/50 rounded-lg hover:bg-red-50/50 transition-all duration-300"
                      >
                        <XCircle className="w-4 h-4" /> Сбросить фильтры
                      </motion.button>
                    </motion.div>
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
              <Layers className="w-16 h-16" />
            </div>
            <div className="relative z-10">
              <div className="text-4xl font-bold mb-2">{stats.total}</div>
              <div className="text-blue-100 font-medium">Всего категорий</div>
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
              <CheckCircle className="w-16 h-16" />
            </div>
            <div className="relative z-10">
              <div className="text-4xl font-bold mb-2">{stats.active}</div>
              <div className="text-emerald-100 font-medium">Активные</div>
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
              <EyeOff className="w-16 h-16" />
            </div>
            <div className="relative z-10">
              <div className="text-4xl font-bold mb-2">{stats.inactive}</div>
              <div className="text-amber-100 font-medium">Неактивные</div>
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
              <BarChart3 className="w-16 h-16" />
            </div>
            <div className="relative z-10">
              <div className="text-4xl font-bold mb-2">
                {stats.totalServices}
              </div>
              <div className="text-purple-100 font-medium">Всего услуг</div>
            </div>
          </motion.div>
        </div>

        {/* Карточки */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <AnimatePresence>
            {filteredCategories.length > 0 ? (
              filteredCategories.map((category, index) => {
                const count = getServicesCount(category); // Получаем счетчик

                return (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.01, y: -2 }}
                    className="bg-gradient-to-br from-white to-gray-50/50 rounded-3xl border border-gray-200/50 p-6 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-xl ${category.isActive ? "bg-gradient-to-br from-emerald-500/10 to-green-500/10" : "bg-gradient-to-br from-amber-500/10 to-orange-500/10"}`}
                        >
                          <FolderTree
                            className={`w-5 h-5 ${category.isActive ? "text-emerald-600" : "text-amber-600"}`}
                          />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg">
                            {category.title}
                          </h3>
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full mt-1 ${category.isActive ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}
                          >
                            {category.isActive ? (
                              <CheckCircle className="w-3 h-3" />
                            ) : (
                              <EyeOff className="w-3 h-3" />
                            )}
                            {category.isActive ? "Активна" : "Скрыта"}
                          </span>
                        </div>
                      </div>

                      <div className="relative">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() =>
                            setSelectedCategory(
                              selectedCategory?.id === category.id
                                ? null
                                : category,
                            )
                          }
                          className={`p-1.5 rounded-lg transition-all ${selectedCategory?.id === category.id ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </motion.button>

                        <AnimatePresence>
                          {selectedCategory?.id === category.id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.9, y: -10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.9, y: -10 }}
                              className="absolute right-0 top-full mt-2 w-48 bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-200/50 overflow-hidden z-50"
                            >
                              <div className="p-2">
                                <motion.button
                                  whileHover={{ x: 5 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() =>
                                    toggleCategoryStatus(category.id)
                                  }
                                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-blue-50/50 transition-all duration-200 text-gray-700 hover:text-blue-600"
                                >
                                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                                    {category.isActive ? (
                                      <EyeOff className="w-4 h-4 text-blue-600" />
                                    ) : (
                                      <Eye className="w-4 h-4 text-blue-600" />
                                    )}
                                  </div>
                                  <div className="text-left">
                                    <p className="font-medium">
                                      {category.isActive
                                        ? "Скрыть"
                                        : "Показать"}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      Изменить статус
                                    </p>
                                  </div>
                                </motion.button>
                                <motion.button
                                  whileHover={{ x: 5 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => deleteCategory(category.id)}
                                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50/50 transition-all duration-200 text-gray-700 hover:text-red-600 mt-1"
                                >
                                  <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                                    <Trash2 className="w-4 h-4 text-red-600" />
                                  </div>
                                  <div className="text-left">
                                    <p className="font-medium">Удалить</p>
                                    <p className="text-xs text-gray-500">
                                      Удалить категорию
                                    </p>
                                  </div>
                                </motion.button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {category.description ? (
                      <div className="mb-6">
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {category.description}
                        </p>
                      </div>
                    ) : (
                      <div className="mb-6">
                        <p className="text-sm text-gray-500 line-clamp-2">
                          Без описания
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        <span>
                          {count}{" "}
                          {count === 1
                            ? "услуга"
                            : count >= 2 && count <= 4
                              ? "услуги"
                              : "услуг"}
                        </span>
                      </div>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                        ID: {category.id}
                      </span>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="col-span-full bg-white/80 backdrop-blur-sm rounded-2xl p-8 text-center border border-gray-200/50"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">
                  Категории не найдены
                </p>
                {searchQuery || statusFilter ? (
                  <button
                    onClick={clearFilters}
                    className="mt-4 px-4 py-2 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Сбросить фильтры
                  </button>
                ) : (
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="mt-4 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity"
                  >
                    Создать категорию
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Футер */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <span>Активные</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <span>Скрытые</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span>Загружено: {categories.length} категорий</span>
            <span className="text-blue-600 font-medium">
              {stats.totalServices} услуг всего
            </span>
          </div>
        </div>

        <CreateCategoryModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleCategoryCreated}
        />
      </div>
    </div>
  );
}
