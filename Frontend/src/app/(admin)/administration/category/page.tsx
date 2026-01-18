"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { categoryService } from '@/services/category/category.service';
import { ICategory } from '@/types/category.types';
import CreateCategoryModal from './CreateCategoryModal';

export default function Category() {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);

useEffect(() => {
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryService.getAll();
      
      if (!Array.isArray(data)) {
        throw new Error('Ожидался массив категорий');
      }

      setCategories(data);
    } catch (err: any) {
      setError(err.message || 'Ошибка загрузки');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  fetchCategories();
}, []);

  // 📊 Статистика
  const stats = useMemo(() => {
    // Подсчитываем услуги по категориям — пока заглушка (0), т.к. нет связи с сервисами
    // Когда добавишь `/category/:id/services` — можно будет уточнить
    return {
      total: categories.length,
      active: categories.filter(cat => cat.isActive).length,
      inactive: categories.filter(cat => !cat.isActive).length,
      totalServices: 0, // ← замени позже на реальный подсчёт
    };
  }, [categories]);

  // 🔍 Фильтрация
  const filteredCategories = useMemo(() => {
    return categories.filter(category => {
      const matchesSearch = category.title.toLowerCase().includes(searchQuery.toLowerCase());
      // Добавь description, если будет в ICategory
      const matchesStatus = statusFilter === "" || 
                          (statusFilter === "active" && category.isActive) ||
                          (statusFilter === "inactive" && !category.isActive);
      return matchesSearch && matchesStatus;
    });
  }, [categories, searchQuery, statusFilter]);

  // 🧹 Сброс фильтров
  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("");
  };

  // 🔄 Переключение статуса (активность)
  const toggleCategoryStatus = useCallback(async (categoryId: number) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;

    try {
      // Инвертируем isActive и обновляем на бэкенде
      const updated = await categoryService.update(categoryId, {
        title: category.title,
        isActive: !category.isActive,
      });

      setCategories(prev => 
        prev.map(cat => cat.id === categoryId ? updated : cat)
      );
    } catch (err: any) {
      alert('Не удалось обновить статус категории');
      console.error(err);
    }
  }, [categories]);

  // 🗑️ Удаление
  const deleteCategory = useCallback(async (categoryId: number) => {
    if (!confirm('Вы уверены, что хотите удалить эту категорию?')) return;

    try {
      await categoryService.delete(categoryId);
      setCategories(prev => prev.filter(cat => cat.id !== categoryId));
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Ошибка при удалении категории';
      alert(msg);
      console.error(err);
    }
  }, []);

  // ✅ После создания — обновляем список
  const handleCategoryCreated = useCallback(async () => {
    try {
      const updated = await categoryService.getAll();
      setCategories(updated);
      alert('Категория успешно создана!');
    } catch (err) {
      alert('Категория создана, но список не обновлён. Обновите страницу.');
    }
  }, []);

  // 🖼️ Рендер
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Загрузка категорий...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Ошибка загрузки</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition"
          >
            Повторить
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-8xl mx-auto">
        {/* Заголовок и управление */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Управление категориями
              </h1>
              <p className="text-gray-600 mt-1">
                Всего: <span className="font-semibold">{stats.total}</span>
              </p>
            </div>
            <button
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2 whitespace-nowrap"
              onClick={() => setIsModalOpen(true)}
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Новая категория
            </button>
          </div>

          {/* Фильтры */}
          <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-sm border border-gray-200">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <div className="relative">
                  <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Поиск по названию..."
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 border text-black border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <select 
                className="px-4 py-2.5 sm:py-3 text-black border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">Все статусы</option>
                <option value="active">Активные</option>
                <option value="inactive">Неактивные</option>
              </select>
              {(searchQuery || statusFilter) && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2.5 sm:py-3 text-red-600 border border-red-300 rounded-xl hover:bg-red-50 transition-colors whitespace-nowrap"
                >
                  Сбросить
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {[
            { label: 'Всего', value: stats.total, color: 'blue', desc: 'категорий' },
            { label: 'Активные', value: stats.active, color: 'green', desc: 'доступны' },
            { label: 'Скрыты', value: stats.inactive, color: 'red', desc: 'неактивны' },
            { label: 'Услуг', value: stats.totalServices, color: 'purple', desc: 'в категории' },
          ].map((stat, i) => (
            <div 
              key={i}
              className={`bg-gradient-to-br from-${stat.color}-500 to-${stat.color}-600 rounded-2xl p-4 sm:p-6 text-white hover:-translate-y-1 transition-all duration-200`}
            >
              <div className="text-2xl sm:text-3xl font-bold">{stat.value}</div>
              <div className="text-${stat.color}-100 text-sm mt-1">{stat.label}</div>
              <div className="text-xs text-${stat.color}-200 mt-0.5">{stat.desc}</div>
            </div>
          ))}
        </div>

        {/* Таблица */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Название</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Статус</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCategories.length > 0 ? (
                  filteredCategories.map((category) => (
                    <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{category.title}</div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${
                          category.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {category.isActive ? 'Активна' : 'Скрыта'}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => toggleCategoryStatus(category.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                              category.isActive
                                ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            {category.isActive ? 'Скрыть' : 'Показать'}
                          </button>
                          <button
                            onClick={() => deleteCategory(category.id)}
                            className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-medium hover:bg-red-200 transition-colors"
                          >
                            Удалить
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-4 sm:px-6 py-8 text-center text-gray-500">
                      {searchQuery || statusFilter 
                        ? 'Категории не найдены по заданным фильтрам.' 
                        : 'Пока нет категорий. Создайте первую!'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Модальное окно */}
        <CreateCategoryModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleCategoryCreated}
        />
      </div>
    </div>
  );
}