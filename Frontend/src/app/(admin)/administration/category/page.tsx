"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Plus, MoreVertical, Edit, Trash2, Eye, EyeOff,
  RefreshCw, FolderTree, CheckCircle, XCircle, ChevronDown,
  ChevronUp, Layers, BarChart3, Activity, SlidersHorizontal, X,
} from "lucide-react";
import { categoryService } from "@/services/category/category.service";
import { ICategory } from "@/types/category.types";
import CreateCategoryModal from "./CreateCategoryModal";

const GRAD_POOL = [
  "from-blue-500 to-indigo-600",
  "from-emerald-500 to-teal-600",
  "from-purple-500 to-pink-600",
  "from-amber-500 to-orange-500",
  "from-rose-500 to-red-600",
  "from-indigo-500 to-blue-600",
  "from-violet-500 to-purple-600",
  "from-cyan-500 to-blue-500",
];
const pickGrad = (id: number) => GRAD_POOL[id % GRAD_POOL.length];

function pluralServices(n: number) {
  if (n === 1) return "услуга";
  if (n >= 2 && n <= 4) return "услуги";
  return "услуг";
}

export default function CategoryPage() {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isDark, setIsDark] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains("dark"));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  const loadCategories = async (showLoader = true) => {
    showLoader ? setLoading(true) : setRefreshing(true);
    try {
      const data = await categoryService.getAll();
      if (!Array.isArray(data)) throw new Error("Ожидался массив категорий");
      setCategories(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Ошибка загрузки");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadCategories(); }, []);

  const stats = useMemo(() => ({
    total:    categories.length,
    active:   categories.filter(c => c.isActive).length,
    inactive: categories.filter(c => !c.isActive).length,
    services: categories.reduce((s, c) => s + (c._count?.services || 0), 0),
  }), [categories]);

  const filtered = useMemo(() => categories.filter(c => {
    const q = search.toLowerCase();
    const mQ = !q || c.title.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q);
    const mS = !statusFilter || (statusFilter === "active" && c.isActive) || (statusFilter === "inactive" && !c.isActive);
    return mQ && mS;
  }), [categories, search, statusFilter]);

  const toggleStatus = useCallback(async (id: number) => {
    const cat = categories.find(c => c.id === id);
    if (!cat) return;
    try {
      const updated = await categoryService.update(id, {
        title: cat.title, description: cat.description, isActive: !cat.isActive,
      });
      setCategories(prev => prev.map(c => c.id === id ? updated : c));
      setSelectedId(null);
    } catch { alert("Не удалось обновить статус"); }
  }, [categories]);

  const deleteCategory = useCallback(async (id: number) => {
    if (!confirm("Удалить категорию? Все связанные услуги также будут удалены!")) return;
    try {
      await categoryService.delete(id);
      setCategories(prev => prev.filter(c => c.id !== id));
      setSelectedId(null);
    } catch (err: any) {
      alert(err.response?.data?.message || "Ошибка при удалении");
    }
  }, []);

  // ── design tokens ────────────────────────────────────────────────────────────
  const glassCls = isDark
    ? "bg-white/[0.07] backdrop-blur-2xl border border-white/[0.1] shadow-lg"
    : "bg-white border border-gray-200/70 shadow-sm";

  const cardBase = isDark
    ? "bg-white/[0.07] backdrop-blur-2xl border border-white/[0.1] hover:bg-white/[0.1] hover:border-white/[0.15] shadow-lg hover:shadow-xl"
    : "bg-white border border-gray-200/70 hover:border-gray-300/80 shadow-sm hover:shadow-lg";

  const menuCls = isDark
    ? "bg-slate-900/95 backdrop-blur-2xl border border-white/[0.1] shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
    : "bg-white border border-gray-200/70 shadow-2xl";

  const inputCls = `w-full h-11 rounded-xl text-sm border outline-none transition-all ${
    isDark
      ? "bg-white/[0.07] border-white/[0.09] text-white/90 placeholder-white/25 focus:border-indigo-400/40"
      : "bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400 focus:border-blue-300 focus:bg-white"
  }`;

  const STAT_CARDS = [
    { num: stats.total,    label: "Категорий",  sub: "всего",           grad: "from-blue-500 to-indigo-600",   glow: "shadow-blue-500/15"    },
    { num: stats.active,   label: "Активных",   sub: "видны клиентам",  grad: "from-emerald-500 to-teal-600",  glow: "shadow-emerald-500/15" },
    { num: stats.inactive, label: "Скрытых",    sub: "недоступны",      grad: "from-amber-500 to-orange-500",  glow: "shadow-amber-500/15"   },
    { num: stats.services, label: "Услуг",      sub: "во всех катег.",  grad: "from-purple-500 to-pink-600",   glow: "shadow-purple-500/15"  },
  ];

  // ── Loading / Error states ────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className={`w-10 h-10 rounded-full border-t-transparent animate-spin mx-auto mb-4 ${isDark ? "border-indigo-400" : "border-blue-400"}`} style={{ borderWidth: 3, borderStyle: "solid" }} />
        <p className={`text-sm ${isDark ? "text-white/35" : "text-gray-400"}`}>Загрузка категорий...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className={`rounded-3xl p-8 text-center max-w-md w-full ${glassCls}`}>
        <div className="w-14 h-14 bg-gradient-to-br from-rose-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <XCircle size={26} className="text-white" />
        </div>
        <h2 className={`text-xl font-black mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>Ошибка загрузки</h2>
        <p className={`text-sm mb-6 ${isDark ? "text-white/50" : "text-gray-500"}`}>{error}</p>
        <motion.button whileHover={{ scale: 1.02 }} onClick={() => loadCategories()}
          className={`flex items-center gap-2 mx-auto px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r ${isDark ? "from-indigo-500 to-purple-600" : "from-blue-500 to-purple-600"}`}>
          <RefreshCw size={14} />Повторить
        </motion.button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <div className="max-w-9xl mx-auto space-y-6">

        {/* ── HEADER ── */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border ${
                  isDark ? "bg-white/[0.06] border-white/[0.09] text-white/40" : "bg-gray-100 border-gray-200 text-gray-400"
                }`}>
                  <Activity size={11} />
                  Каталог
                </div>
              </div>
              <h1 className={`text-4xl md:text-5xl font-black leading-none tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}>
                Категории
              </h1>
              <p className={`mt-2 text-sm ${isDark ? "text-white/35" : "text-gray-400"}`}>
                {stats.total} категорий · {stats.services} услуг
                {filtered.length !== categories.length && ` · показано ${filtered.length}`}
              </p>
            </div>

            <div className="flex gap-2.5 flex-wrap">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={() => loadCategories(false)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                  isDark ? "bg-white/[0.07] border-white/[0.1] text-white/60 hover:text-white/80 hover:bg-white/[0.1]" : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50 shadow-sm"
                }`}>
                <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
                Обновить
              </motion.button>

              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={() => setIsModalOpen(true)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg transition-all ${
                  isDark ? "bg-gradient-to-r from-indigo-500 to-purple-600 shadow-purple-500/25 hover:shadow-purple-500/40" : "bg-gradient-to-r from-blue-500 to-purple-600 shadow-blue-500/20 hover:shadow-blue-500/35"
                }`}>
                <Plus size={16} />
                Новая категория
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* ── STAT CARDS ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {STAT_CARDS.map((s, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ y: -3, scale: 1.02 }}
              className={`relative rounded-2xl p-5 overflow-hidden transition-all duration-300 ${
                isDark ? `bg-white/[0.07] backdrop-blur-xl border border-white/[0.1] shadow-lg hover:shadow-xl ${s.glow}` : `bg-white border border-gray-200/70 shadow-sm hover:shadow-md`
              }`}
            >
              <div className={`absolute -top-5 -right-5 w-16 h-16 bg-gradient-to-br ${s.grad} opacity-[0.12] rounded-xl rotate-12 blur-sm`} />
              <div className="relative">
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${s.grad} flex items-center justify-center shadow-md mb-3`}>
                  <FolderTree size={17} className="text-white" />
                </div>
                <div className={`text-3xl font-black leading-none mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>{s.num}</div>
                <div className={`text-sm font-semibold ${isDark ? "text-white/70" : "text-gray-700"}`}>{s.label}</div>
                <div className={`text-xs mt-0.5 ${isDark ? "text-white/30" : "text-gray-400"}`}>{s.sub}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── SEARCH + FILTER ── */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className={`rounded-2xl p-4 ${glassCls}`}>
          <div className="flex gap-3 flex-wrap">
            {/* Search */}
            <div className="flex-1 min-w-[180px] relative">
              <Search size={15} className={`absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? "text-white/25" : "text-gray-400"}`} />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Поиск по названию или описанию..."
                className={`${inputCls} pl-10 pr-9`} />
              {search && (
                <button onClick={() => setSearch("")}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDark ? "text-white/30 hover:text-white/60" : "text-gray-400 hover:text-gray-600"}`}>
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Filter toggle */}
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={() => setFilterOpen(!filterOpen)}
              className={`h-11 flex items-center gap-2 px-4 rounded-xl text-sm font-semibold border transition-all ${
                filterOpen
                  ? isDark ? "bg-indigo-500/20 border-indigo-400/30 text-indigo-300" : "bg-blue-50 border-blue-300 text-blue-600"
                  : isDark ? "bg-white/[0.07] border-white/[0.09] text-white/55 hover:bg-white/[0.1]" : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-white shadow-sm"
              }`}>
              <SlidersHorizontal size={15} />
              Фильтры
              {filterOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </motion.button>

            {/* Clear */}
            {(search || statusFilter) && (
              <motion.button initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => { setSearch(""); setStatusFilter(""); }}
                className={`h-11 px-4 rounded-xl text-sm font-semibold border transition-all ${
                  isDark ? "bg-rose-500/10 border-rose-400/20 text-rose-400" : "bg-rose-50 border-rose-200 text-rose-500"
                }`}>
                <X size={15} />
              </motion.button>
            )}
          </div>

          {/* Status filter pills */}
          <AnimatePresence>
            {filterOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: "auto", marginTop: 12 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                className="overflow-hidden"
              >
                <div className={`pt-3 border-t ${isDark ? "border-white/[0.07]" : "border-gray-100"}`}>
                  <p className={`text-xs font-bold uppercase tracking-wider mb-2.5 ${isDark ? "text-white/25" : "text-gray-400"}`}>Статус</p>
                  <div className="flex gap-2 flex-wrap">
                    {[{ v: "", l: "Все" }, { v: "active", l: "Активные" }, { v: "inactive", l: "Скрытые" }].map(o => (
                      <motion.button key={o.v} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                        onClick={() => setStatusFilter(o.v)}
                        className={`h-7 px-3 rounded-full text-xs font-semibold border transition-all ${
                          statusFilter === o.v
                            ? isDark ? "bg-indigo-500/20 border-indigo-400/30 text-indigo-300" : "bg-blue-100 border-blue-300 text-blue-700"
                            : isDark ? "bg-white/[0.05] border-white/[0.07] text-white/45" : "bg-gray-50 border-gray-200 text-gray-500"
                        }`}>{o.l}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── RESULT LABEL ── */}
        {!loading && (
          <div className={`px-1 text-xs ${isDark ? "text-white/25" : "text-gray-400"}`}>
            {filtered.length === categories.length ? `${filtered.length} категорий` : `${filtered.length} из ${categories.length}`}
          </div>
        )}

        {/* ── CATEGORY GRID ── */}
        {filtered.length === 0 ? (
          <div className={`rounded-2xl p-16 text-center ${glassCls}`}>
            <div className={`w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center ${isDark ? "bg-white/[0.06]" : "bg-gray-100"}`}>
              <Search size={26} className={isDark ? "text-white/20" : "text-gray-300"} />
            </div>
            <p className={`text-lg font-bold mb-1 ${isDark ? "text-white/50" : "text-gray-500"}`}>
              {categories.length === 0 ? "Нет категорий" : "Ничего не найдено"}
            </p>
            <p className={`text-sm mb-5 ${isDark ? "text-white/25" : "text-gray-400"}`}>
              {search || statusFilter ? "Попробуйте изменить параметры поиска" : "Создайте первую категорию услуг"}
            </p>
            {search || statusFilter ? (
              <motion.button whileHover={{ scale: 1.02 }} onClick={() => { setSearch(""); setStatusFilter(""); }}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                  isDark ? "border-white/[0.1] text-white/50 hover:bg-white/[0.07]" : "border-gray-200 text-gray-500 hover:bg-gray-50"
                }`}>
                Сбросить фильтры
              </motion.button>
            ) : (
              <motion.button whileHover={{ scale: 1.02 }} onClick={() => setIsModalOpen(true)}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg ${
                  isDark ? "bg-gradient-to-r from-indigo-500 to-purple-600" : "bg-gradient-to-r from-blue-500 to-purple-600"
                }`}>
                + Создать категорию
              </motion.button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {filtered.map((cat, i) => {
                const grad = pickGrad(cat.id);
                const count = cat._count?.services || 0;
                const isMenuOpen = selectedId === cat.id;

                return (
                  <motion.div key={cat.id}
                    layout
                    initial={{ opacity: 0, y: 16, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ delay: i * 0.04, duration: 0.25 }}
                    whileHover={{ y: -3 }}
                    className={`relative rounded-2xl p-5 transition-all duration-300 overflow-hidden ${cardBase}`}
                  >
                    {/* Accent top line */}
                    <div className={`absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r ${grad} opacity-60`} />

                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        {/* Icon */}
                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${grad} flex items-center justify-center shadow-lg flex-shrink-0`}>
                          <FolderTree size={20} className="text-white" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className={`font-bold text-base leading-tight truncate ${isDark ? "text-white/95" : "text-gray-900"}`}>
                            {cat.title}
                          </h3>
                          {/* Status badge */}
                          <span className={`inline-flex items-center gap-1.5 mt-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                            cat.isActive
                              ? isDark ? "bg-emerald-500/10 border-emerald-400/15 text-emerald-400" : "bg-emerald-50 border-emerald-200 text-emerald-700"
                              : isDark ? "bg-amber-500/10 border-amber-400/15 text-amber-400" : "bg-amber-50 border-amber-200 text-amber-700"
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${cat.isActive ? "bg-emerald-400" : "bg-amber-400"}`} />
                            {cat.isActive ? "Активна" : "Скрыта"}
                          </span>
                        </div>
                      </div>

                      {/* Context menu */}
                      <div className="relative flex-shrink-0 ml-2">
                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                          onClick={() => setSelectedId(isMenuOpen ? null : cat.id)}
                          className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                            isMenuOpen
                              ? isDark ? "bg-white/[0.12] text-white/90" : "bg-gray-100 text-gray-700"
                              : isDark ? "bg-white/[0.06] text-white/40 hover:bg-white/[0.1] hover:text-white/70" : "text-gray-400 hover:bg-gray-100"
                          }`}>
                          <MoreVertical size={15} />
                        </motion.button>

                        <AnimatePresence>
                          {isMenuOpen && (
                            <>
                              <div className="fixed inset-0 z-40" onClick={() => setSelectedId(null)} />
                              <motion.div
                                initial={{ opacity: 0, scale: 0.93, y: -6 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.93, y: -6 }}
                                transition={{ duration: 0.12 }}
                                className={`absolute right-0 top-full mt-1.5 w-52 rounded-2xl overflow-hidden z-50 ${menuCls}`}
                              >
                                <div className="p-1.5 space-y-0.5">
                                  <motion.button whileHover={{ x: 3 }}
                                    onClick={() => toggleStatus(cat.id)}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left ${
                                      isDark ? "text-blue-400 hover:bg-blue-500/10" : "text-blue-600 hover:bg-blue-50"
                                    }`}>
                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${isDark ? "bg-blue-500/15" : "bg-blue-100"}`}>
                                      {cat.isActive ? <EyeOff size={13} /> : <Eye size={13} />}
                                    </div>
                                    <div>
                                      <div className="text-sm font-semibold">{cat.isActive ? "Скрыть" : "Показать"}</div>
                                      <div className={`text-xs ${isDark ? "text-white/30" : "text-gray-400"}`}>Изменить статус</div>
                                    </div>
                                  </motion.button>

                                  <motion.button whileHover={{ x: 3 }}
                                    onClick={() => deleteCategory(cat.id)}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left ${
                                      isDark ? "text-rose-400 hover:bg-rose-500/10" : "text-rose-500 hover:bg-rose-50"
                                    }`}>
                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${isDark ? "bg-rose-500/15" : "bg-rose-100"}`}>
                                      <Trash2 size={13} />
                                    </div>
                                    <div>
                                      <div className="text-sm font-semibold">Удалить</div>
                                      <div className={`text-xs ${isDark ? "text-white/30" : "text-gray-400"}`}>Удалить категорию</div>
                                    </div>
                                  </motion.button>
                                </div>
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* Description */}
                    <p className={`text-sm leading-relaxed mb-4 min-h-[2.5rem] line-clamp-2 ${
                      cat.description
                        ? isDark ? "text-white/50" : "text-gray-500"
                        : isDark ? "text-white/20" : "text-gray-300"
                    }`}>
                      {cat.description || "Без описания"}
                    </p>

                    {/* Footer */}
                    <div className={`flex items-center justify-between pt-4 border-t ${isDark ? "border-white/[0.07]" : "border-gray-100"}`}>
                      {/* Services count */}
                      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${
                        isDark ? "bg-white/[0.04] border-white/[0.07]" : "bg-gray-50 border-gray-200/60"
                      }`}>
                        <BarChart3 size={13} className={isDark ? "text-white/30" : "text-gray-400"} />
                        <span className={`text-xs font-semibold ${isDark ? "text-white/60" : "text-gray-600"}`}>
                          {count} {pluralServices(count)}
                        </span>
                      </div>

                      {/* ID */}
                      <span className={`text-xs font-mono ${isDark ? "text-white/20" : "text-gray-300"}`}>
                        #{cat.id}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* ── FOOTER ── */}
        {!loading && categories.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className={`flex flex-wrap items-center justify-between gap-3 pt-5 border-t text-xs ${
              isDark ? "border-white/[0.06] text-white/20" : "border-gray-100 text-gray-400"
            }`}
          >
            <div className="flex flex-wrap gap-4">
              {[
                { c: "bg-emerald-400", l: "Активные" },
                { c: "bg-amber-400",   l: "Скрытые"  },
              ].map(x => (
                <div key={x.l} className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${x.c}`} />
                  {x.l}
                </div>
              ))}
            </div>
            <span>{categories.length} категорий · {stats.services} услуг</span>
          </motion.div>
        )}
      </div>

      <CreateCategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={async () => { await loadCategories(false); }}
      />
    </div>
  );
}