"use client";
import { useState, useEffect, useMemo } from "react";
import { servicePriceService } from "@/services/service-price/service-price.service";
import { IServicePrice } from "@/types/service-price.types";
import { IService } from "@/types/services.types";
import { ICategory } from "@/types/category.types";
import { serviceService } from "@/services/service/service.service";
import { categoryService } from "@/services/category/category.service";
import { IMaster } from "@/types/masters.type";
import { masterService } from "@/services/master/master.service";

interface UIServicePrice extends IServicePrice {
  serviceName?: string;
  categoryName?: string;
  masterName?: string;
}

type SortField = "service" | "master" | "price" | "status";
type SortOrder = "asc" | "desc";

export default function ServicePrice() {
  const [servicePrices, setServicePrices] = useState<UIServicePrice[]>([]);
  const [services, setServices] = useState<IService[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [masters, setMasters] = useState<IMaster[]>([]); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingServicePrice, setEditingServicePrice] = useState<UIServicePrice | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sortField, setSortField] = useState<SortField>("service");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [serviceFilter, setServiceFilter] = useState<string>("");
  const [masterFilter, setMasterFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [formData, setFormData] = useState({
    serviceId: 0,
    masterId: 0,
    price: 0,
    isActive: true,
  });

  // Загрузка данных
  const loadServicePrices = async () => {
    setIsLoading(true);
    try {
      const pricesData = await servicePriceService.getAll();
      const enrichedPrices: UIServicePrice[] = pricesData.map((price) => {
        const service = services.find(s => s.id === price.serviceId);
        const category = categories.find(c => c.id === service?.categoryId);
        const master = masters.find(m => m.id === price.masterId);

        return {
          ...price,
          serviceName: service?.title || "Неизвестная услуга",
          categoryName: category?.title || "Без категории",
          masterName: master?.name || `Мастер #${price.masterId}`,
        };
      });
      setServicePrices(enrichedPrices);
    } catch (error) {
      console.error("Ошибка загрузки цен услуг:", error);
      alert("Не удалось загрузить список цен");
    } finally {
      setIsLoading(false);
    }
  };

  const loadServices = async () => {
    try {
      const servicesData = await serviceService.getAll();
      setServices(servicesData);
    } catch (error) {
      console.error("Ошибка загрузки услуг:", error);
    }
  };

  const loadCategories = async () => {
    try {
      const categoriesData = await categoryService.getAll();
      setCategories(categoriesData);
    } catch (error) {
      console.error("Ошибка загрузки категорий:", error);
    }
  };

  const loadMasters = async () => {
    try {
     
      const mastersData = await masterService.getAll();
      setMasters(mastersData);
    } catch (error) {
      console.error("Ошибка загрузки мастеров:", error);
    }
  };

  // Сортировка
  const sortServicePrices = (pricesToSort: UIServicePrice[]): UIServicePrice[] => {
    const sorted = [...pricesToSort].sort((a, b) => {
      let aValue: string | number = "";
      let bValue: string | number = "";

      switch (sortField) {
        case "service":
          aValue = a.serviceName || "";
          bValue = b.serviceName || "";
          break;
        case "master":
          aValue = a.masterName || "";
          bValue = b.masterName || "";
          break;
        case "price":
          aValue = a.price;
          bValue = b.price;
          break;
        case "status":
          aValue = a.isActive ? 1 : 0;
          bValue = b.isActive ? 1 : 0;
          break;
        default:
          return 0;
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortOrder === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else {
        return sortOrder === "asc"
          ? (aValue as number) - (bValue as number)
          : (bValue as number) - (aValue as number);
      }
    });

    return sorted;
  };

  // Фильтрация и сортировка
  const filteredAndSortedServicePrices = useMemo(() => {
    let filtered = servicePrices;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (price) =>
          price.serviceName?.toLowerCase().includes(query) ||
          price.masterName?.toLowerCase().includes(query) ||
          price.categoryName?.toLowerCase().includes(query)
      );
    }

    if (statusFilter) {
      filtered = filtered.filter((price) =>
        statusFilter === "active" ? price.isActive : !price.isActive
      );
    }

    if (categoryFilter) {
      filtered = filtered.filter(
        (price) => price.categoryName === categoryFilter
      );
    }

    if (serviceFilter) {
      filtered = filtered.filter(
        (price) => price.serviceId === parseInt(serviceFilter)
      );
    }

    if (masterFilter) {
      filtered = filtered.filter(
        (price) => price.masterId === parseInt(masterFilter)
      );
    }

    return sortServicePrices(filtered);
  }, [servicePrices, sortField, sortOrder, statusFilter, categoryFilter, serviceFilter, masterFilter, searchQuery]);

  // Инициализация
  useEffect(() => {
    const initializeData = async () => {
      await Promise.all([loadServices(), loadCategories(), loadMasters()]);
      await loadServicePrices();
    };
    initializeData();
  }, []);

  // Обновление цен при изменении услуг/мастеров
  useEffect(() => {
    if (services.length > 0 && masters.length > 0) {
      loadServicePrices();
    }
  }, [services, masters]);

  // Модалки
  const openModalForAdd = () => {
    setEditingServicePrice(null);
    setFormData({
      serviceId: 0,
      masterId: 0,
      price: 0,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const openModalForEdit = (servicePrice: UIServicePrice) => {
    setEditingServicePrice(servicePrice);
    setFormData({
      serviceId: servicePrice.serviceId,
      masterId: servicePrice.masterId,
      price: servicePrice.price,
      isActive: servicePrice.isActive,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingServicePrice(null);
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
      setFormData((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Отправка формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.serviceId || !formData.masterId || formData.price <= 0) {
      alert("Пожалуйста, заполните все обязательные поля");
      return;
    }

    // Проверка на дубликат
    const duplicate = servicePrices.find(
      price => 
        price.serviceId === formData.serviceId && 
        price.masterId === formData.masterId &&
        (!editingServicePrice || price.id !== editingServicePrice.id)
    );

    if (duplicate) {
      alert("Цена для этой услуги и мастера уже существует");
      return;
    }

    setIsLoading(true);

    try {
      if (editingServicePrice) {
        // Обновление
        const updatedPrice = await servicePriceService.update(editingServicePrice.id, {
          serviceId: formData.serviceId,
          masterId: formData.masterId,
          price: formData.price,
          isActive: formData.isActive,
        });

        // Обновляем локальный список
        setServicePrices((prev) =>
          prev.map((p) =>
            p.id === editingServicePrice.id
              ? {
                  ...updatedPrice,
                  serviceName: services.find(s => s.id === updatedPrice.serviceId)?.title,
                  masterName: masters.find(m => m.id === updatedPrice.masterId)?.name,
                  categoryName: categories.find(c => c.id === services.find(s => s.id === updatedPrice.serviceId)?.categoryId)?.title,
                }
              : p
          )
        );
      } else {
        // Создание
        const newPrice = await servicePriceService.create({
          serviceId: formData.serviceId,
          masterId: formData.masterId,
          price: formData.price,
          isActive: formData.isActive,
        });

        // Добавляем в список
        const service = services.find(s => s.id === newPrice.serviceId);
        const master = masters.find(m => m.id === newPrice.masterId);
        const category = categories.find(c => c.id === service?.categoryId);

        setServicePrices((prev) => [
          ...prev,
          {
            ...newPrice,
            serviceName: service?.title,
            masterName: master?.name,
            categoryName: category?.title,
          },
        ]);
      }

      closeModal();
    } catch (error) {
      console.error("Ошибка сохранения:", error);
      alert("Не удалось сохранить цену. Проверьте ввод и попробуйте снова.");
    } finally {
      setIsLoading(false);
    }
  };

  // Удаление
  const deleteServicePrice = async (priceId: number) => {
    if (!confirm("Вы уверены, что хотите удалить эту цену?")) return;

    try {
      await servicePriceService.delete(priceId);
      setServicePrices((prev) => prev.filter((p) => p.id !== priceId));
    } catch (error) {
      console.error("Ошибка удаления:", error);
      alert("Не удалось удалить цену");
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
    setServiceFilter("");
    setMasterFilter("");
    setSearchQuery("");
  };

  // Статистика
  const activePricesCount = useMemo(
    () => servicePrices.filter((p) => p.isActive).length,
    [servicePrices]
  );
  const inactivePricesCount = useMemo(
    () => servicePrices.filter((p) => !p.isActive).length,
    [servicePrices]
  );

  const averagePrice = useMemo(() => {
    if (servicePrices.length === 0) return 0;
    const total = servicePrices.reduce((sum, price) => sum + price.price, 0);
    return Math.round(total / servicePrices.length);
  }, [servicePrices]);

  return (
    <div className="min-h-screen text-black bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Управление ценами услуг
            </h1>
            <p className="text-gray-600">
              Всего цен:{" "}
              <span className="font-semibold">
                {filteredAndSortedServicePrices.length}
              </span>
              {filteredAndSortedServicePrices.length !== servicePrices.length &&
                ` (из ${servicePrices.length})`}
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
            Добавить цену
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
            <div className="lg:col-span-2">
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
                  placeholder="Поиск по услуге, мастеру, категории..."
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
                <option key={category.id} value={category.title}>
                  {category.title}
                </option>
              ))}
            </select>
            <select
              className="px-4 py-3 text-black border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
            >
              <option value="">Все услуги</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.title}
                </option>
              ))}
            </select>
            <select
              className="px-4 py-3 text-black border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              value={masterFilter}
              onChange={(e) => setMasterFilter(e.target.value)}
            >
              <option value="">Все мастера</option>
              {masters.map((master) => (
                <option key={master.id} value={master.id}>
                  {master.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort and Clear */}
          <div className="mt-4 flex flex-wrap gap-2 items-center">
            <span className="text-sm text-gray-600 font-medium mr-2">
              Сортировка:
            </span>
            {(["service", "master", "price", "status"] as SortField[]).map(
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
                  {field === "service" && "Услуга"}
                  {field === "master" && "Мастер"}
                  {field === "price" && "Цена"}
                  {field === "status" && "Статус"}
                  {sortField === field && (
                    <span className="ml-1">
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </button>
              )
            )}
            
            {(statusFilter || categoryFilter || serviceFilter || masterFilter || searchQuery) && (
              <button
                onClick={clearFilters}
                className="ml-auto px-4 py-2 text-red-600 border border-red-300 rounded-xl hover:bg-red-50 transition-colors duration-200"
              >
                Сбросить фильтры
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white hover:-translate-y-2 transition-all duration-200">
          <div className="text-3xl font-bold mb-2">{servicePrices.length}</div>
          <div className="text-blue-100">Всего цен</div>
          <div className="text-sm text-blue-200 mt-1">
            Зарегистрировано в системе
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white hover:-translate-y-2 transition-all duration-200">
          <div className="text-3xl font-bold mb-2">
            {activePricesCount}
          </div>
          <div className="text-green-100">Активные</div>
          <div className="text-sm text-green-200 mt-1">
            Доступны для записи
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white hover:-translate-y-2 transition-all duration-200">
          <div className="text-3xl font-bold mb-2">{averagePrice} ₽</div>
          <div className="text-purple-100">Средняя цена</div>
          <div className="text-sm text-purple-200 mt-1">
            По всем услугам
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white hover:-translate-y-2 transition-all duration-200">
          <div className="text-3xl font-bold mb-2">
            {filteredAndSortedServicePrices.length}
          </div>
          <div className="text-orange-100">Показано</div>
          <div className="text-sm text-orange-200 mt-1">
            После фильтрации
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Услуга
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Категория
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Мастер
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Цена
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
            ) : filteredAndSortedServicePrices.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  Цены не найдены. Попробуйте изменить параметры фильтрации.
                </td>
              </tr>
            ) : (
              filteredAndSortedServicePrices.map((price) => (
                <tr
                  key={price.id}
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">
                      {price.serviceName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {price.categoryName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {price.masterName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    {price.price.toLocaleString()} ₽
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                        price.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {price.isActive ? "Активна" : "Неактивна"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-3">
                      <button
                        onClick={() => openModalForEdit(price)}
                        className="text-blue-600 hover:text-blue-900 font-medium transition-colors duration-200"
                      >
                        Редактировать
                      </button>
                      <button
                        onClick={() => deleteServicePrice(price.id)}
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingServicePrice ? "Редактировать цену" : "Добавить цену"}
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
                      htmlFor="serviceSelect"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Услуга *
                    </label>
                    <select
                      id="serviceSelect"
                      name="serviceId"
                      value={formData.serviceId}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 text-black border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      required
                    >
                      <option value={0}>Выберите услугу</option>
                      {services.map((service) => (
                        <option key={service.id} value={service.id}>
                          {service.title} ({service.duration} мин.)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="masterSelect"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Мастер *
                    </label>
                    <select
                      id="masterSelect"
                      name="masterId"
                      value={formData.masterId}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 text-black border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      required
                    >
                      <option value={0}>Выберите мастера</option>
                      {masters.map((master) => (
                        <option key={master.id} value={master.id}>
                          {master.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="priceInput"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Цена (руб.) *
                    </label>
                    <input
                      type="number"
                      id="priceInput"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      min="0"
                      step="100"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="priceIsActive"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label
                      htmlFor="priceIsActive"
                      className="ml-2 text-sm text-gray-700"
                    >
                      Активная цена
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
                      : editingServicePrice
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