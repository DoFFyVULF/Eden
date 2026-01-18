"use client";

import { useEffect, useMemo, useState } from "react";
import { servicePriceService } from "@/services/service-price/service-price.service";
import { categoryService } from "@/services/category/category.service";
import { masterService } from "@/services/master/master.service";
import { serviceService } from "@/services/service/service.service";

import { IServicePrice, UIServicePrice } from "@/types/service-price.types";
import { ICategory } from "@/types/category.types";
import { IMaster } from "@/types/masters.type";
import { IService } from "@/types/services.types";

export default function MasterService() {
  // ——— Данные ———
  const [rawPrices, setRawPrices] = useState<IServicePrice[]>([]);
  const [prices, setPrices] = useState<UIServicePrice[]>([]);

  const [categories, setCategories] = useState<ICategory[]>([]);
  const [masters, setMasters] = useState<IMaster[]>([]);
  const [services, setServices] = useState<IService[]>([]);

  // ——— UI State ———
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPrice, setEditingPrice] = useState<UIServicePrice | null>(null);

  // ——— Фильтрация и сортировка ———
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [masterFilter, setMasterFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortField, setSortField] = useState<
    "service" | "master" | "price" | "status"
  >("service");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // ——— Форма ———
  // ——— Форма ———
  const [formData, setFormData] = useState({
    serviceId: 0,
    masterId: 0,
    price: 0,
    isActive: true,
    durationOverride: null as number | null | undefined, // ← добавили | undefined
    _baseDuration: 30,
  });

  /* =========================
     ЗАГРУЗКА ДАННЫХ
  ========================== */
  const loadData = async () => {
    setIsLoading(true);
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
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  /* =========================
     ПРЕОБРАЗОВАНИЕ → UI
  ========================== */
  const categoryMap = useMemo(
    () => new Map(categories.map((c) => [c.id, c.title])),
    [categories]
  );

  useEffect(() => {
    // Фильтруем и преобразуем в безопасный UI-тип
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

          durationOverride: p.durationOverride ?? null,
        };
      });

    setPrices(mapped);
  }, [rawPrices, categoryMap]);

  /* =========================
     ФИЛЬТРАЦИЯ + СОРТИРОВКА
  ========================== */
  const filteredAndSortedPrices = useMemo(() => {
    let list = [...prices];

    // 🔍 Поиск
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.serviceTitle.toLowerCase().includes(q) ||
          p.categoryName.toLowerCase().includes(q) ||
          p.masterFullName.toLowerCase().includes(q) ||
          p.price.toString().includes(q)
      );
    }

    // 🧾 Фильтры — БЕЗ .service и .master!
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

    // 🔀 Сортировка
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

  /* =========================
     СТАТИСТИКА
  ========================== */
  const stats = useMemo(() => {
    const total = prices.length;
    const active = prices.filter((p) => p.isActive).length;
    const inactive = total - active;
    const avgPrice =
      total > 0
        ? Math.round(prices.reduce((sum, p) => sum + p.price, 0) / total)
        : 0;

    return { total, active, inactive, avgPrice };
  }, [prices]);

  /* =========================
     МОДАЛЬНЫЕ ОКНА
  ========================== */
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
    // Находим полную услугу для базовой длительности
    const service = services.find((s) => s.id === price.serviceId);
    const baseDuration = service?.duration || 30;

    setEditingPrice(price);
    setFormData({
      serviceId: price.serviceId,
      masterId: price.masterId,
      price: price.price,
      isActive: price.isActive,
      durationOverride: price.durationOverride,
      _baseDuration: baseDuration,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPrice(null);
  };

  /* =========================
     ОБРАБОТЧИКИ ФОРМЫ
  ========================== */
  const handleInputChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { name, value, type } = e.target;
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
        durationOverride, // ← null или число
      };

      if (editingPrice) {
        const updated = await servicePriceService.update(
          editingPrice.id,
          payload
        );
        setRawPrices((prev) =>
          prev.map((p) => (p.id === updated.id ? updated : p))
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
  /* =========================
     УДАЛЕНИЕ
  ========================== */
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

  /* =========================
     СОРТИРОВКА
  ========================== */
  const handleSortChange = (field: typeof sortField) => {
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

  /* =========================
     ВСПОМОГАТЕЛЬНЫЕ
  ========================== */
  const getCategoryOptions = () => {
    const usedCategories = new Set(
      services.filter((s) => s.isActive).map((s) => s.categoryId)
    );
    return categories.filter((c) => usedCategories.has(c.id));
  };

  const getServicesByCategory = (categoryId: number) => {
    return services.filter((s) => s.categoryId === categoryId && s.isActive);
  };

  /* =========================
     RENDER
  ========================== */
  return (
    <div className="min-h-screen text-black bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Управление ценами услуг мастеров
            </h1>
            <p className="text-gray-600">
              Привяжите услуги к мастерам и задайте цены
            </p>
          </div>
          <button
            onClick={openModalForAdd}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
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
            Назначить цену
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <svg
                  className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
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
                  placeholder="Поиск по услуге, мастеру, цене..."
                  className="w-full pl-10 pr-4 py-3 border text-black border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <select
              className="px-4 py-3 text-black border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
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

            <select
              className="px-4 py-3 text-black border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
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

            <select
              className="px-4 py-3 text-black border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Все статусы</option>
              <option value="active">Активные</option>
              <option value="inactive">Неактивные</option>
            </select>

            {(searchQuery ||
              categoryFilter ||
              masterFilter ||
              statusFilter) && (
              <button
                onClick={clearFilters}
                className="px-4 py-3 text-red-600 border border-red-300 rounded-xl hover:bg-red-50"
              >
                Сбросить
              </button>
            )}
          </div>

          {/* Sorting */}
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-sm text-gray-600 font-medium mr-2">
              Сортировка:
            </span>
            {(["service", "master", "price", "status"] as const).map(
              (field) => (
                <button
                  key={field}
                  onClick={() => handleSortChange(field)}
                  className={`px-3 py-1 text-sm rounded-lg border transition-colors ${
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
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white hover:-translate-y-1 transition">
          <div className="text-3xl font-bold mb-2">{stats.total}</div>
          <div className="text-blue-100">Всего цен</div>
          <div className="text-sm text-blue-200 mt-1">Назначено комбинаций</div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white hover:-translate-y-1 transition">
          <div className="text-3xl font-bold mb-2">{stats.active}</div>
          <div className="text-green-100">Активные</div>
          <div className="text-sm text-green-200 mt-1">Доступны клиентам</div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white hover:-translate-y-1 transition">
          <div className="text-3xl font-bold mb-2">{stats.inactive}</div>
          <div className="text-orange-100">Неактивные</div>
          <div className="text-sm text-orange-200 mt-1">Скрыты</div>
        </div>

        <div className="bg-gradient-to-br from-gray-500 to-gray-600 rounded-2xl p-6 text-white hover:-translate-y-1 transition">
          <div className="text-3xl font-bold mb-2">
            {stats.avgPrice.toLocaleString()} ₽
          </div>
          <div className="text-gray-100">Средняя цена</div>
          <div className="text-sm text-gray-200 mt-1">По всем записям</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 flex items-center justify-between border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Список назначенных цен
          </h2>
          <span className="text-sm text-gray-500">
            Показано: {filteredAndSortedPrices.length} из {prices.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                  Услуга
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                  Мастер
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                  Продолжительность
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                  Цена
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                  Статус
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase w-40">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
                    <p className="mt-2 text-gray-500">Загрузка...</p>
                  </td>
                </tr>
              ) : filteredAndSortedPrices.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    <svg
                      className="w-12 h-12 mx-auto text-gray-300 mb-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    <p className="text-lg mb-1">Цены не назначены</p>
                    <p className="text-sm mb-4">
                      Добавьте первую комбинацию «мастер + услуга»
                    </p>
                    <button
                      onClick={openModalForAdd}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium"
                    >
                      Назначить цену
                    </button>
                  </td>
                </tr>
              ) : (
                filteredAndSortedPrices.map((p) => {
                  // Определяем отображаемую длительность
                  const displayDuration =
                    p.durationOverride ??
                    services.find((s) => s.id === p.serviceId)?.duration ??
                    "—";

                  const isOverride = p.durationOverride != null;

                  return (
                    <tr key={p.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {p.serviceTitle}
                        </div>
                        <div className="text-sm text-gray-500">
                          {p.categoryName}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-900">
                        {p.masterFullName}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <span className="font-medium">
                            {displayDuration} мин.
                          </span>
                          {isOverride && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded whitespace-nowrap">
                              индив.
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        {p.price.toLocaleString()} ₽
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 text-xs rounded-full font-medium ${
                            p.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {p.isActive ? "Активна" : "Неактивна"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openModalForEdit(p)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            Изменить
                          </button>
                          <button
                            onClick={() => deletePrice(p.id)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Удалить
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingPrice ? "Редактировать цену" : "Назначить новую цену"}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                &times;
              </button>
            </div>

            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Выбор категории → услуги */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Категория и услуга *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select
                      value={
                        formData.serviceId
                          ? services.find((s) => s.id === formData.serviceId)
                              ?.categoryId || 0
                          : 0
                      }
                      onChange={(e) => {
                        const catId = Number(e.target.value);
                        const firstService = services.find(
                          (s) => s.categoryId === catId && s.isActive
                        );
                        const duration = firstService?.duration || 30;
                        setFormData((prev) => ({
                          ...prev,
                          serviceId: firstService?.id || 0,
                          durationOverride: null, // сбрасываем override при смене услуги
                          // сохраняем базовую длительность для отображения
                          _baseDuration: duration,
                        }));
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white text-black"
                      required
                    >
                      <option value={0}>Выберите категорию</option>
                      {getCategoryOptions().map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.title}
                        </option>
                      ))}
                    </select>

                    <select
                      value={formData.serviceId}
                      onChange={(e) => {
                        const serviceId = Number(e.target.value);
                        const service = services.find(
                          (s) => s.id === serviceId
                        );
                        const duration = service?.duration || 30;
                        setFormData((prev) => ({
                          ...prev,
                          serviceId,
                          durationOverride: null,
                          _baseDuration: duration,
                        }));
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white text-black"
                      required
                    >
                      <option value={0}>Выберите услугу</option>
                      {formData.serviceId
                        ? getServicesByCategory(
                            services.find((s) => s.id === formData.serviceId)
                              ?.categoryId || 0
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

                {/* Мастер */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Мастер *
                  </label>
                  <select
                    name="masterId"
                    value={formData.masterId}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white text-black"
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Продолжительность (минут)
                  </label>
                  <div className="space-y-3">
                    {/* Базовая длительность */}
                    {formData._baseDuration && (
                      <div className="text-sm text-gray-500">
                        Базовая длительность услуги:{" "}
                        <span className="font-medium">
                          {formData._baseDuration} мин.
                        </span>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <label className="flex items-center">
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
                          className="h-4 w-4 text-blue-600"
                        />
                        <span className="ml-2 text-gray-700">
                          Как у услуги
                          {formData._baseDuration
                            ? ` (${formData._baseDuration} мин.)`
                            : ""}
                        </span>
                      </label>

                      <label className="flex items-center">
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
                          className="h-4 w-4 text-blue-600"
                        />
                        <span className="ml-2 text-gray-700">
                          Своя длительность:
                        </span>
                      </label>

                      {formData.durationOverride !== null && (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={formData.durationOverride || ""}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                durationOverride: Math.max(
                                  5,
                                  parseInt(e.target.value) || 0
                                ),
                              }))
                            }
                            min="5"
                            step="5"
                            className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-gray-600">мин.</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Цена */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Цена (₽) *
                  </label>
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
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                {/* Статус */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label
                    htmlFor="isActive"
                    className="ml-2 text-sm text-gray-700"
                  >
                    Активная (видна клиентам)
                  </label>
                </div>

                {/* Кнопки */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
                  >
                    {isLoading
                      ? "Сохранение..."
                      : editingPrice
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
