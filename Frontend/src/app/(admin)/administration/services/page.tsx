"use client";
import { useState, useEffect, useMemo } from "react";
import { serviceService } from "@/services/service/service.service";
import { IService } from "@/types/services.types";
import { ICategory } from "@/types/category.types";
import { categoryService } from "@/services/category/category.service";

type SortField = "title" | "duration" | "category" | "status";
type SortOrder = "asc" | "desc";

interface UIService extends IService {

}

export default function Services() {
  const [services, setServices] = useState<IService[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<IService | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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

  const loadServices = async () => {
    setIsLoading(true);
    try {
      const data = await serviceService.getAll();
      setServices(data);
    } finally {
      setIsLoading(false);
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

  // Сортировка
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

  // Фильтрация и сортировка
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

  // Модалки
  const openModalForAdd = () => {
    setEditingService(null);
    setFormData({
      title: "",
      description: "",
      duration: 0,
      categoryId: 0,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const openModalForEdit = (service: UIService) => {
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

  // Изменение формы
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

  // Отправка формы
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
        // Обновление
        const updatedService = await serviceService.update(editingService.id, {
          title: formData.title,
          description: formData.description,
          duration: formData.duration,
          isActive: formData.isActive,
        });

        // Обновляем локальный список
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
        // Создание
        const newService = await serviceService.create({
          title: formData.title,
          description: formData.description,
          duration: formData.duration,
          isActive: formData.isActive,
          categoryId: formData.categoryId,
        });

        // Добавляем в список
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

  // Удаление
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

  // Сортировка UI
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

  // Статистика
  const activeServicesCount = useMemo(
    () => services.filter((s) => s.isActive).length,
    [services]
  );
  const inactiveServicesCount = useMemo(
    () => services.filter((s) => !s.isActive).length,
    [services]
  );

  return (
    <div className="min-h-screen text-black bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Управление услугами
            </h1>
            <p className="text-gray-600">
              Всего услуг:{" "}
              <span className="font-semibold">
                {filteredAndSortedServices.length}
              </span>
              {filteredAndSortedServices.length !== services.length &&
                ` (из ${services.length})`}
            </p>
          </div>
          <button
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
            onClick={openModalForAdd}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Добавить услугу
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <svg
                  className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Поиск по названию, описанию, категории..."
                  className="w-full pl-10 pr-4 py-3 border text-black border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <select
              className="px-4 py-3 text-black border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Все статусы</option>
              <option value="active">Активные</option>
              <option value="inactive">Неактивные</option>
            </select>
            <select
              className="px-4 py-3 text-black border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
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
            {(statusFilter || categoryFilter || searchQuery) && (
              <button
                onClick={clearFilters}
                className="px-4 py-3 text-red-600 border border-red-300 rounded-xl hover:bg-red-50 transition-colors duration-200"
              >
                Сбросить
              </button>
            )}
          </div>

          {/* Sort */}
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-sm text-gray-600 font-medium mr-2">
              Сортировка:
            </span>
            {(["title", "duration", "category", "status"] as SortField[]).map(
              (field) => (
                <button
                  key={field}
                  onClick={() => handleSortChange(field)}
                  className={`px-3 py-1 text-sm rounded-lg border transition-colors duration-200 ${
                    sortField === field
                      ? "bg-blue-100 text-blue-700 border-blue-300"
                      : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                  }`}
                >
                  {field === "title" && "Название"}
                  {field === "duration" && "Продолжительность"}
                  {field === "category" && "Категория"}
                  {field === "status" && "Статус"}
                  {sortField === field && (
                    <span className="ml-1">
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white hover:-translate-y-2 transition-all duration-200">
          <div className="text-3xl font-bold mb-2">{services.length}</div>
          <div className="text-blue-100">Всего услуг</div>
          <div className="text-sm text-blue-200 mt-1">
            Зарегистрировано в системе
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white hover:-translate-y-2 transition-all duration-200">
          <div className="text-3xl font-bold mb-2">{activeServicesCount}</div>
          <div className="text-green-100">Активные</div>
          <div className="text-sm text-green-200 mt-1">Доступны для записи</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white hover:-translate-y-2 transition-all duration-200">
          <div className="text-3xl font-bold mb-2">{categories.length}</div>
          <div className="text-purple-100">Категорий</div>
          <div className="text-sm text-purple-200 mt-1">Активных категорий</div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white hover:-translate-y-2 transition-all duration-200">
          <div className="text-3xl font-bold mb-2">
            {filteredAndSortedServices.length}
          </div>
          <div className="text-orange-100">Показано</div>
          <div className="text-sm text-orange-200 mt-1">После фильтрации</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Название
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Описание
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Продолжительность
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Категория
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Статус
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </td>
              </tr>
            ) : filteredAndSortedServices.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  Услуги не найдены. Попробуйте изменить параметры фильтрации.
                </td>
              </tr>
            ) : (
              filteredAndSortedServices.map((service) => (
                <tr
                  key={service.id}
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">
                      {service.title}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                    <div className="line-clamp-2">
                      {service.description || "Не указано"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {service.duration} мин.
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getCategoryName(service.categoryId) || "Не указана"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                        service.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {service.isActive ? "Активна" : "Неактивна"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-3">
                      <button
                        onClick={() => openModalForEdit(service)}
                        className="text-blue-600 hover:text-blue-900 font-medium transition-colors duration-200"
                      >
                        Редактировать
                      </button>
                      <button
                        onClick={() => deleteService(service.id)}
                        className="text-red-600 hover:text-red-900 font-medium transition-colors duration-200"
                      >
                        Удалить
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination stub */}
      <div className="flex justify-center items-center gap-2 mt-8">
        <span className="text-gray-500 text-sm">
          Показано {filteredAndSortedServices.length} из {services.length}
        </span>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingService ? "Редактировать услугу" : "Добавить услугу"}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                &times;
              </button>
            </div>

            <div className="p-6">
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="serviceTitle"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Название услуги *
                    </label>
                    <input
                      type="text"
                      id="serviceTitle"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Например: Стрижка мужская"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="serviceDescription"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Описание
                    </label>
                    <textarea
                      id="serviceDescription"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Краткое описание услуги"
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="serviceDuration"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Продолжительность (минут) *
                    </label>
                    <input
                      type="number"
                      id="serviceDuration"
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      min="5"
                      step="5"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="serviceCategory"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Категория *
                    </label>
                    <select
                      id="serviceCategory"
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 text-black border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
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

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="serviceIsActive"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label
                      htmlFor="serviceIsActive"
                      className="ml-2 text-sm text-gray-700"
                    >
                      Активная услуга
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition"
                  >
                    {isLoading
                      ? "Сохранение..."
                      : editingService
                      ? "Сохранить"
                      : "Добавить"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
