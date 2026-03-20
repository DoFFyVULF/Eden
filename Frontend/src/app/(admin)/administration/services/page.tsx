"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { serviceService } from "@/services/service/service.service";
import { IService } from "@/types/services.types";
import { ICategory } from "@/types/category.types";
import { categoryService } from "@/services/category/category.service";
import {
  Search,
  Plus,
  Tag,
  Clock,
  Edit,
  Trash2,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Shield,
  TrendingUp,
  Eye,
  EyeOff,
  X,
  Loader2,
  Package,
  Activity,
  SlidersHorizontal,
  AlertCircle,
} from "lucide-react";

type SortField = "title" | "duration" | "category" | "status";
type SortOrder = "asc" | "desc";

const CAT_GRADS = [
  "from-blue-500 to-indigo-600",
  "from-emerald-500 to-teal-600",
  "from-purple-500 to-pink-600",
  "from-amber-500 to-orange-500",
  "from-rose-500 to-red-600",
  "from-indigo-500 to-blue-600",
  "from-violet-500 to-purple-600",
  "from-cyan-500 to-blue-500",
];

export default function Services() {
  const [services, setServices] = useState<IService[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<IService | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  const [sortField, setSortField] = useState<SortField>("title");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    duration: 0,
    categoryId: 0,
    isActive: true,
  });

  useEffect(() => {
    const check = () =>
      setIsDark(document.documentElement.classList.contains("dark"));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => obs.disconnect();
  }, []);

  const loadServices = async (showLoader = true) => {
    showLoader ? setIsLoading(true) : setIsRefreshing(true);
    try {
      setServices(await serviceService.getAll());
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    categoryService.getAll().then(setCategories);
    loadServices();
  }, []);

  const catMap = useMemo(
    () => new Map(categories.map((c) => [c.id, c.title])),
    [categories],
  );
  const catName = (id: number) => catMap.get(id) ?? "Не указана";
  const catGrad = (id: number) => CAT_GRADS[id % CAT_GRADS.length];

  const sortList = (list: IService[]) =>
    [...list].sort((a, b) => {
      let av: string | number = "",
        bv: string | number = "";
      switch (sortField) {
        case "title":
          av = a.title;
          bv = b.title;
          break;
        case "duration":
          av = a.duration;
          bv = b.duration;
          break;
        case "category":
          av = catName(a.categoryId);
          bv = catName(b.categoryId);
          break;
        case "status":
          av = a.isActive ? 1 : 0;
          bv = b.isActive ? 1 : 0;
          break;
      }
      if (typeof av === "string")
        return sortOrder === "asc"
          ? av.localeCompare(bv as string)
          : (bv as string).localeCompare(av);
      return sortOrder === "asc"
        ? (av as number) - (bv as number)
        : (bv as number) - (av as number);
    });

  const filtered = useMemo(() => {
    let list = services;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.description?.toLowerCase().includes(q) ||
          catName(s.categoryId).toLowerCase().includes(q),
      );
    }
    if (statusFilter)
      list = list.filter((s) =>
        statusFilter === "active" ? s.isActive : !s.isActive,
      );
    if (categoryFilter)
      list = list.filter((s) => s.categoryId === Number(categoryFilter));
    return sortList(list);
  }, [
    services,
    search,
    statusFilter,
    categoryFilter,
    sortField,
    sortOrder,
    catMap,
  ]);

  const stats = useMemo(
    () => ({
      total: services.length,
      active: services.filter((s) => s.isActive).length,
      inactive: services.filter((s) => !s.isActive).length,
      avg:
        services.length > 0
          ? Math.round(
              services.reduce((a, s) => a + s.duration, 0) / services.length,
            )
          : 0,
      cats: categories.length,
    }),
    [services, categories],
  );

  const openAdd = () => {
    setEditingService(null);
    setForm({
      title: "",
      description: "",
      duration: 0,
      categoryId: categories[0]?.id ?? 0,
      isActive: true,
    });
    setIsModalOpen(true);
  };
  const openEdit = (s: IService) => {
    setEditingService(s);
    setForm({
      title: s.title,
      description: s.description || "",
      duration: s.duration,
      categoryId: s.categoryId,
      isActive: s.isActive,
    });
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingService(null);
  };

  const handleInput = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox")
      setForm((p) => ({
        ...p,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    else if (type === "number")
      setForm((p) => ({ ...p, [name]: parseInt(value) || 0 }));
    else setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || form.duration <= 0 || form.categoryId === 0) {
      alert("Заполните название, продолжительность и выберите категорию");
      return;
    }
    setIsLoading(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description?.trim() || "",
        duration: form.duration,
        isActive: form.isActive,
        categoryId: form.categoryId,
      };
      if (editingService)
        await serviceService.update(editingService.id, payload);
      else await serviceService.create(payload);
      await loadServices(false);
      closeModal();
    } catch {
      alert("Не удалось сохранить услугу");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteService = async (id: number) => {
    if (!confirm("Удалить эту услугу?")) return;
    try {
      await serviceService.delete(id);
      setServices((p) => p.filter((s) => s.id !== id));
    } catch {
      alert("Не удалось удалить услугу");
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field)
      setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // ── design tokens ─────────────────────────────────────────────────────────
  const glassCls = isDark
    ? "bg-white/[0.07] backdrop-blur-2xl border border-white/[0.1] shadow-lg"
    : "bg-white border border-gray-200/70 shadow-sm";

  const cardCls = isDark
    ? "bg-white/[0.07] backdrop-blur-2xl border border-white/[0.1] hover:bg-white/[0.1] hover:border-white/[0.15] shadow-lg hover:shadow-xl"
    : "bg-white border border-gray-200/70 hover:border-gray-300/80 shadow-sm hover:shadow-lg";

  const modalCls = isDark
    ? "bg-slate-900/88 backdrop-blur-3xl border border-white/[0.1] shadow-[0_32px_80px_rgba(0,0,0,0.7)]"
    : "bg-white/96 backdrop-blur-xl border border-gray-200/70 shadow-2xl";

  const inputCls = `w-full h-11 px-4 rounded-xl text-sm border outline-none transition-all ${
    isDark
      ? "bg-white/[0.07] border-white/[0.09] text-white/90 placeholder-white/25 focus:border-indigo-400/50 focus:ring-1 focus:ring-indigo-400/20"
      : "bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 focus:bg-white"
  }`;

  const sectionCls = `rounded-2xl p-4 border ${
    isDark
      ? "bg-white/[0.04] border-white/[0.07]"
      : "bg-gray-50/60 border-gray-200/60"
  }`;

  const SORT_OPTS: { f: SortField; l: string }[] = [
    { f: "title", l: "Название" },
    { f: "duration", l: "Длительность" },
    { f: "category", l: "Категория" },
    { f: "status", l: "Статус" },
  ];

  const STAT_CARDS = [
    {
      num: stats.total,
      label: "Всего услуг",
      sub: "в системе",
      grad: "from-blue-500 to-indigo-600",
      glow: "shadow-blue-500/15",
    },
    {
      num: stats.active,
      label: "Активных",
      sub: "доступны клиентам",
      grad: "from-emerald-500 to-teal-600",
      glow: "shadow-emerald-500/15",
    },
    {
      num: stats.avg,
      label: "Среднее время",
      sub: "минут на услугу",
      grad: "from-amber-500 to-orange-500",
      glow: "shadow-amber-500/15",
    },
    {
      num: stats.cats,
      label: "Категорий",
      sub: "доступно",
      grad: "from-purple-500 to-pink-600",
      glow: "shadow-purple-500/15",
    },
  ];

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <div className="max-w-9xl mx-auto space-y-6">
        {/* ── HEADER ── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <div
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border ${
                    isDark
                      ? "bg-white/[0.06] border-white/[0.09] text-white/40"
                      : "bg-gray-100 border-gray-200 text-gray-400"
                  }`}
                >
                  <Activity size={11} />
                  Каталог
                </div>
              </div>
              <h1
                className={`text-4xl md:text-5xl font-black leading-none tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}
              >
                Услуги
              </h1>
              <p
                className={`mt-2 text-sm ${isDark ? "text-white/35" : "text-gray-400"}`}
              >
                {stats.total} услуг · {stats.active} активных
                {filtered.length !== services.length &&
                  ` · показано ${filtered.length}`}
              </p>
            </div>

            <div className="flex gap-2.5 flex-wrap">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => loadServices(false)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                  isDark
                    ? "bg-white/[0.07] border-white/[0.1] text-white/60 hover:text-white/80 hover:bg-white/[0.1]"
                    : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50 shadow-sm"
                }`}
              >
                <RefreshCw
                  size={14}
                  className={isRefreshing ? "animate-spin" : ""}
                />
                Обновить
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={openAdd}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg transition-all ${
                  isDark
                    ? "bg-gradient-to-r from-indigo-500 to-purple-600 shadow-purple-500/25 hover:shadow-purple-500/40"
                    : "bg-gradient-to-r from-blue-500 to-purple-600 shadow-blue-500/20 hover:shadow-blue-500/35"
                }`}
              >
                <Plus size={16} />
                Добавить услугу
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* ── STAT CARDS ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {STAT_CARDS.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ y: -3, scale: 1.02 }}
              className={`relative rounded-2xl p-5 overflow-hidden transition-all duration-300 ${
                isDark
                  ? `bg-white/[0.07] backdrop-blur-xl border border-white/[0.1] shadow-lg hover:shadow-xl ${s.glow}`
                  : `bg-white border border-gray-200/70 shadow-sm hover:shadow-md`
              }`}
            >
              <div
                className={`absolute -top-5 -right-5 w-16 h-16 bg-gradient-to-br ${s.grad} opacity-[0.12] rounded-xl rotate-12 blur-sm`}
              />
              <div className="relative">
                <div
                  className={`w-9 h-9 rounded-xl bg-gradient-to-br ${s.grad} flex items-center justify-center shadow-md mb-3`}
                >
                  <Package size={17} className="text-white" />
                </div>
                <div
                  className={`text-3xl font-black leading-none mb-1 ${isDark ? "text-white" : "text-gray-900"}`}
                >
                  {s.num}
                </div>
                <div
                  className={`text-sm font-semibold ${isDark ? "text-white/70" : "text-gray-700"}`}
                >
                  {s.label}
                </div>
                <div
                  className={`text-xs mt-0.5 ${isDark ? "text-white/30" : "text-gray-400"}`}
                >
                  {s.sub}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── FILTER BAR ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className={`rounded-2xl p-4 ${glassCls}`}
        >
          <div className="flex gap-3 flex-wrap">
            {/* Search */}
            <div className="flex-1 min-w-[180px] relative">
              <Search
                size={15}
                className={`absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? "text-white/25" : "text-gray-400"}`}
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Поиск по названию, описанию, категории..."
                className={`w-full h-11 pl-10 pr-9 rounded-xl text-sm border outline-none transition-all ${
                  isDark
                    ? "bg-white/[0.07] border-white/[0.08] text-white/90 placeholder-white/25 focus:border-indigo-400/40"
                    : "bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400 focus:border-blue-300 focus:bg-white"
                }`}
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDark ? "text-white/30 hover:text-white/60" : "text-gray-400"}`}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Category select */}
            <div className="relative">
              <Tag
                size={14}
                className={`absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? "text-white/25" : "text-gray-400"}`}
              />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className={`h-11 pl-9 pr-8 rounded-xl text-sm border outline-none appearance-none transition-all ${
                  isDark
                    ? "bg-white/[0.07] border-white/[0.09] text-white/90 focus:border-indigo-400/40"
                    : "bg-gray-50 border-gray-200 text-gray-800 focus:border-blue-300"
                }`}
              >
                <option value="">Все категории</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={13}
                className={`absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? "text-white/25" : "text-gray-400"}`}
              />
            </div>

            {/* Filter toggle */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setFilterOpen(!filterOpen)}
              className={`h-11 flex items-center gap-2 px-4 rounded-xl text-sm font-semibold border transition-all ${
                filterOpen
                  ? isDark
                    ? "bg-indigo-500/20 border-indigo-400/30 text-indigo-300"
                    : "bg-blue-50 border-blue-300 text-blue-600"
                  : isDark
                    ? "bg-white/[0.07] border-white/[0.09] text-white/55 hover:bg-white/[0.1]"
                    : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-white shadow-sm"
              }`}
            >
              <SlidersHorizontal size={15} />
              Сортировка
              {filterOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </motion.button>

            {/* Clear */}
            {(search || statusFilter || categoryFilter) && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSearch("");
                  setStatusFilter("");
                  setCategoryFilter("");
                }}
                className={`h-11 px-4 rounded-xl text-sm font-semibold border transition-all ${
                  isDark
                    ? "bg-rose-500/10 border-rose-400/20 text-rose-400"
                    : "bg-rose-50 border-rose-200 text-rose-500"
                }`}
              >
                <X size={15} />
              </motion.button>
            )}
          </div>

          {/* Sort + status pills */}
          <AnimatePresence>
            {filterOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: "auto", marginTop: 12 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                className="overflow-hidden"
              >
                <div
                  className={`pt-3 border-t space-y-3 ${isDark ? "border-white/[0.07]" : "border-gray-100"}`}
                >
                  {/* Status */}
                  <div>
                    <p
                      className={`text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? "text-white/25" : "text-gray-400"}`}
                    >
                      Статус
                    </p>
                    <div className="flex gap-2">
                      {[
                        { v: "", l: "Все" },
                        { v: "active", l: "Активные" },
                        { v: "inactive", l: "Неактивные" },
                      ].map((o) => (
                        <motion.button
                          key={o.v}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => setStatusFilter(o.v)}
                          className={`h-7 px-3 rounded-full text-xs font-semibold border transition-all ${
                            statusFilter === o.v
                              ? isDark
                                ? "bg-indigo-500/20 border-indigo-400/30 text-indigo-300"
                                : "bg-blue-100 border-blue-300 text-blue-700"
                              : isDark
                                ? "bg-white/[0.05] border-white/[0.07] text-white/45"
                                : "bg-gray-50 border-gray-200 text-gray-500"
                          }`}
                        >
                          {o.l}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                  {/* Sort */}
                  <div>
                    <p
                      className={`text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? "text-white/25" : "text-gray-400"}`}
                    >
                      Сортировка
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {SORT_OPTS.map((o) => (
                        <motion.button
                          key={o.f}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => handleSort(o.f)}
                          className={`h-7 px-3 rounded-full text-xs font-semibold border transition-all flex items-center gap-1 ${
                            sortField === o.f
                              ? isDark
                                ? "bg-indigo-500/20 border-indigo-400/30 text-indigo-300"
                                : "bg-blue-100 border-blue-300 text-blue-700"
                              : isDark
                                ? "bg-white/[0.05] border-white/[0.07] text-white/45"
                                : "bg-gray-50 border-gray-200 text-gray-500"
                          }`}
                        >
                          {o.l}
                          {sortField === o.f && (
                            <span className="text-[10px]">
                              {sortOrder === "asc" ? "↑" : "↓"}
                            </span>
                          )}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── RESULT LABEL ── */}
        {!isLoading && (
          <div
            className={`px-1 text-xs ${isDark ? "text-white/25" : "text-gray-400"}`}
          >
            {filtered.length === services.length
              ? `${filtered.length} услуг`
              : `${filtered.length} из ${services.length}`}
          </div>
        )}

        {/* ── SERVICE GRID ── */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div
              className={`w-10 h-10 rounded-full border-t-transparent animate-spin mb-4 ${isDark ? "border-purple-400" : "border-blue-400"}`}
              style={{ borderWidth: 3, borderStyle: "solid" }}
            />
            <p
              className={`text-sm ${isDark ? "text-white/35" : "text-gray-400"}`}
            >
              Загрузка услуг...
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className={`rounded-2xl p-16 text-center ${glassCls}`}>
            <div
              className={`w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center ${isDark ? "bg-white/[0.06]" : "bg-gray-100"}`}
            >
              <Package
                size={26}
                className={isDark ? "text-white/20" : "text-gray-300"}
              />
            </div>
            <p
              className={`text-lg font-bold mb-1 ${isDark ? "text-white/50" : "text-gray-500"}`}
            >
              {services.length === 0 ? "Нет услуг" : "Ничего не найдено"}
            </p>
            <p
              className={`text-sm mb-5 ${isDark ? "text-white/25" : "text-gray-400"}`}
            >
              {search || statusFilter || categoryFilter
                ? "Попробуйте изменить параметры поиска"
                : "Создайте первую услугу"}
            </p>
            {search || statusFilter || categoryFilter ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={() => {
                  setSearch("");
                  setStatusFilter("");
                  setCategoryFilter("");
                }}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all ${isDark ? "border-white/[0.1] text-white/50 hover:bg-white/[0.07]" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}
              >
                Сбросить фильтры
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={openAdd}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg ${isDark ? "bg-gradient-to-r from-indigo-500 to-purple-600" : "bg-gradient-to-r from-blue-500 to-purple-600"}`}
              >
                + Создать услугу
              </motion.button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <AnimatePresence mode="popLayout">
              {filtered.map((svc, i) => {
                const grad = catGrad(svc.categoryId);
                return (
                  <motion.div
                    key={svc.id}
                    layout
                    initial={{ opacity: 0, y: 16, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ delay: i * 0.03, duration: 0.25 }}
                    whileHover={{ y: -3 }}
                    className={`relative rounded-2xl p-5 transition-all duration-300 overflow-hidden flex flex-col ${cardCls}`}
                  >
                    {/* Accent top line */}
                    <div
                      className={`absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r ${grad} opacity-60`}
                    />

                    {/* Status badge top-right */}
                    <div className="absolute top-4 right-4">
                      <span
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                          svc.isActive
                            ? isDark
                              ? "bg-emerald-500/10 border-emerald-400/15 text-emerald-400"
                              : "bg-emerald-50 border-emerald-200 text-emerald-700"
                            : isDark
                              ? "bg-rose-500/10 border-rose-400/15 text-rose-400"
                              : "bg-rose-50 border-rose-200 text-rose-600"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${svc.isActive ? "bg-emerald-400" : "bg-rose-400"}`}
                        />
                        {svc.isActive ? "Активна" : "Скрыта"}
                      </span>
                    </div>

                    {/* Service icon + title */}
                    <div className="flex items-start gap-3 mb-3 pr-20">
                      <div
                        className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${grad} flex items-center justify-center shadow-lg flex-shrink-0`}
                      >
                        <Package size={20} className="text-white" />
                      </div>
                      <div className="min-w-0 flex-1 pt-0.5">
                        <h3
                          className={`font-bold text-base leading-tight ${isDark ? "text-white/95" : "text-gray-900"}`}
                        >
                          {svc.title}
                        </h3>
                      </div>
                    </div>

                    {/* Description */}
                    <p
                      className={`text-xs leading-relaxed mb-4 line-clamp-2 flex-shrink-0 ${
                        svc.description
                          ? isDark
                            ? "text-white/45"
                            : "text-gray-500"
                          : isDark
                            ? "text-white/20"
                            : "text-gray-300"
                      }`}
                    >
                      {svc.description || "Без описания"}
                    </p>

                    {/* Info pills */}
                    <div className="flex flex-wrap gap-2 flex-1">
                      {/* Category */}
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border ${
                          isDark
                            ? "bg-white/[0.06] border-white/[0.08] text-white/60"
                            : "bg-gray-50 border-gray-200 text-gray-600"
                        }`}
                      >
                        <div
                          className={`w-3.5 h-3.5 rounded-md bg-gradient-to-br ${grad}`}
                        />
                        {catName(svc.categoryId)}
                      </span>
                      {/* Duration */}
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border ${
                          isDark
                            ? "bg-amber-500/8 border-amber-400/15 text-amber-400"
                            : "bg-amber-50 border-amber-200 text-amber-700"
                        }`}
                      >
                        <Clock size={11} />
                        {svc.duration} мин
                      </span>
                    </div>

                    {/* Footer */}
                    <div
                      className={`flex items-center justify-between mt-4 pt-4 border-t ${isDark ? "border-white/[0.07]" : "border-gray-100"}`}
                    >
                      <div className="flex gap-1.5">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => openEdit(svc)}
                          className={`w-8 h-8 rounded-xl flex items-center justify-center border transition-all ${
                            isDark
                              ? "bg-blue-500/10 border-blue-400/15 text-blue-400 hover:bg-blue-500/20"
                              : "bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100"
                          }`}
                        >
                          <Edit size={14} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => deleteService(svc.id)}
                          className={`w-8 h-8 rounded-xl flex items-center justify-center border transition-all ${
                            isDark
                              ? "bg-rose-500/10 border-rose-400/15 text-rose-400 hover:bg-rose-500/20"
                              : "bg-rose-50 border-rose-200 text-rose-500 hover:bg-rose-100"
                          }`}
                        >
                          <Trash2 size={14} />
                        </motion.button>
                      </div>
                      <span
                        className={`text-xs font-mono ${isDark ? "text-white/20" : "text-gray-300"}`}
                      >
                        #{svc.id}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* ── FOOTER ── */}
        {!isLoading && services.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className={`flex flex-wrap items-center justify-between gap-3 pt-5 border-t text-xs ${
              isDark
                ? "border-white/[0.06] text-white/20"
                : "border-gray-100 text-gray-400"
            }`}
          >
            <div className="flex flex-wrap gap-4">
              {[
                { c: "bg-emerald-400", l: "Активные" },
                { c: "bg-rose-400", l: "Неактивные" },
              ].map((x) => (
                <div key={x.l} className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${x.c}`} />
                  {x.l}
                </div>
              ))}
            </div>
            <span className="flex items-center gap-1.5">
              <TrendingUp size={12} />
              {stats.active} из {stats.total} доступно
            </span>
          </motion.div>
        )}
      </div>

      {/* ── MODAL ── */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => e.target === e.currentTarget && closeModal()}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
            style={{
              background: isDark ? "rgba(0,0,0,0.78)" : "rgba(15,23,42,0.42)",
              backdropFilter: "blur(16px)",
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 24 }}
              transition={{ type: "spring", damping: 28, stiffness: 340 }}
              onClick={(e) => e.stopPropagation()}
              className={`relative w-full max-w-lg rounded-3xl overflow-hidden my-4 flex flex-col max-h-[90vh] ${modalCls}`}
            >
              {/* Header */}
              <div
                className={`relative px-7 py-6 overflow-hidden flex-shrink-0 ${
                  editingService
                    ? "bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500"
                    : "bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"
                }`}
              >
                <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full" />
                <div className="absolute bottom-0 left-0 right-0 h-px bg-white/15" />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                      {editingService ? (
                        <Edit size={20} className="text-white" />
                      ) : (
                        <Package size={20} className="text-white" />
                      )}
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-white">
                        {editingService
                          ? "Редактировать услугу"
                          : "Новая услуга"}
                      </h2>
                      <p className="text-white/65 text-xs mt-0.5">
                        {editingService
                          ? "Измените параметры"
                          : "Создайте новую услугу"}
                      </p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ duration: 0.18 }}
                    onClick={closeModal}
                    className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-white hover:bg-white/25 transition-colors"
                  >
                    <X size={17} />
                  </motion.button>
                </div>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto">
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  {/* Title */}
                  <div className={sectionCls}>
                    <label
                      className={`block text-xs font-bold uppercase tracking-wider mb-2.5 ${isDark ? "text-white/35" : "text-gray-400"}`}
                    >
                      Название *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={form.title}
                      onChange={handleInput}
                      placeholder="Например: Стрижка мужская"
                      required
                      className={inputCls}
                    />
                  </div>

                  {/* Description */}
                  <div className={sectionCls}>
                    <label
                      className={`block text-xs font-bold uppercase tracking-wider mb-2.5 ${isDark ? "text-white/35" : "text-gray-400"}`}
                    >
                      Описание{" "}
                      <span
                        className={`normal-case font-normal ${isDark ? "text-white/20" : "text-gray-300"}`}
                      >
                        (необязательно)
                      </span>
                    </label>
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleInput}
                      placeholder="Краткое описание услуги..."
                      rows={3}
                      className={`${inputCls} h-auto py-3 resize-none`}
                    />
                  </div>

                  {/* Duration + Category */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className={sectionCls}>
                      <label
                        className={`block text-xs font-bold uppercase tracking-wider mb-2.5 ${isDark ? "text-white/35" : "text-gray-400"}`}
                      >
                        Длительность *
                      </label>
                      <div className="relative">
                        <Clock
                          size={14}
                          className={`absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? "text-white/25" : "text-gray-400"}`}
                        />
                        <input
                          type="number"
                          name="duration"
                          value={form.duration}
                          onChange={handleInput}
                          min="5"
                          step="5"
                          required
                          placeholder="0"
                          className={`${inputCls} pl-10 pr-10`}
                        />
                        <span
                          className={`absolute right-3.5 top-1/2 -translate-y-1/2 text-xs ${isDark ? "text-white/30" : "text-gray-400"}`}
                        >
                          мин
                        </span>
                      </div>
                    </div>

                    <div className={sectionCls}>
                      <label
                        className={`block text-xs font-bold uppercase tracking-wider mb-2.5 ${isDark ? "text-white/35" : "text-gray-400"}`}
                      >
                        Категория *
                      </label>
                      <div className="relative">
                        <Tag
                          size={14}
                          className={`absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? "text-white/25" : "text-gray-400"}`}
                        />
                        <select
                          name="categoryId"
                          value={form.categoryId}
                          onChange={handleInput}
                          required
                          className={`${inputCls} pl-10 pr-8 appearance-none`}
                        >
                          <option value={0}>Выберите</option>
                          {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.title}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          size={13}
                          className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? "text-white/25" : "text-gray-400"}`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Status toggle */}
                  <div className={sectionCls}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p
                          className={`text-sm font-bold ${isDark ? "text-white/85" : "text-gray-800"}`}
                        >
                          Статус услуги
                        </p>
                        <p
                          className={`text-xs mt-0.5 ${isDark ? "text-white/35" : "text-gray-400"}`}
                        >
                          {form.isActive
                            ? "Видна клиентам"
                            : "Скрыта от клиентов"}
                        </p>
                      </div>
                      <motion.button
                        type="button"
                        onClick={() =>
                          setForm((p) => ({ ...p, isActive: !p.isActive }))
                        }
                        whileTap={{ scale: 0.95 }}
                        className={`relative inline-flex h-7 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                          form.isActive
                            ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                            : isDark
                              ? "bg-white/[0.1]"
                              : "bg-gray-200"
                        }`}
                        style={{ width: 52 }}
                        aria-pressed={form.isActive}
                      >
                        <motion.span
                          layout
                          className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg mt-0.5"
                          animate={{ x: form.isActive ? 26 : 2 }}
                          transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 30,
                          }}
                        />
                      </motion.button>
                    </div>
                    <div
                      className={`flex items-center gap-1.5 mt-2.5 text-xs font-semibold ${
                        form.isActive
                          ? isDark
                            ? "text-emerald-400"
                            : "text-emerald-700"
                          : isDark
                            ? "text-amber-400"
                            : "text-amber-700"
                      }`}
                    >
                      {form.isActive ? <Eye size={12} /> : <EyeOff size={12} />}
                      {form.isActive ? "Услуга активна" : "Услуга скрыта"}
                    </div>
                  </div>

                  {/* Summary */}
                  <AnimatePresence>
                    {form.title && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className={`flex items-start justify-between p-3.5 rounded-2xl border ${
                          isDark
                            ? "bg-white/[0.05] border-white/[0.07]"
                            : "bg-gray-50/80 border-gray-200/60"
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <p
                            className={`text-xs mb-0.5 ${isDark ? "text-white/30" : "text-gray-400"}`}
                          >
                            Сводка
                          </p>
                          <p
                            className={`text-sm font-bold truncate ${isDark ? "text-white/85" : "text-gray-800"}`}
                          >
                            {form.title}
                          </p>
                          {form.categoryId > 0 && (
                            <p
                              className={`text-xs mt-0.5 ${isDark ? "text-white/30" : "text-gray-400"}`}
                            >
                              {catName(form.categoryId)} ·{" "}
                              {form.duration > 0 ? `${form.duration} мин` : "—"}
                            </p>
                          )}
                        </div>
                        <div
                          className={`ml-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border flex-shrink-0 ${
                            form.isActive
                              ? isDark
                                ? "bg-emerald-500/10 border-emerald-400/15 text-emerald-400"
                                : "bg-emerald-50 border-emerald-200 text-emerald-700"
                              : isDark
                                ? "bg-rose-500/10 border-rose-400/15 text-rose-400"
                                : "bg-rose-50 border-rose-200 text-rose-600"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${form.isActive ? "bg-emerald-400" : "bg-rose-400"}`}
                          />
                          {form.isActive ? "Активна" : "Скрыта"}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Buttons */}
                  <div
                    className={`flex flex-col sm:flex-row gap-3 pt-5 border-t ${isDark ? "border-white/[0.07]" : "border-gray-100"}`}
                  >
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={closeModal}
                      disabled={isLoading}
                      className={`flex-1 h-12 rounded-2xl text-sm font-semibold border transition-all ${
                        isDark
                          ? "bg-white/[0.06] border-white/[0.1] text-white/60 hover:bg-white/[0.09]"
                          : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 shadow-sm"
                      }`}
                    >
                      Отмена
                    </motion.button>
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={isLoading}
                      className={`flex-1 h-12 rounded-2xl text-sm font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 ${
                        editingService
                          ? "bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500"
                          : "bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"
                      }`}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Сохранение...
                        </>
                      ) : editingService ? (
                        <>
                          <Edit size={16} />
                          Сохранить изменения
                        </>
                      ) : (
                        <>
                          <Package size={16} />
                          Создать услугу
                        </>
                      )}
                    </motion.button>
                  </div>
                </form>
              </div>

              {/* Footer */}
              <div
                className={`px-7 py-3 border-t flex items-center justify-between text-xs flex-shrink-0 ${
                  isDark
                    ? "border-white/[0.06] text-white/20 bg-white/[0.02]"
                    : "border-gray-100 text-gray-400 bg-gray-50/50"
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Shield size={11} />
                  Данные защищены
                </span>
                <span>ID: {editingService ? editingService.id : "Новый"}</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
