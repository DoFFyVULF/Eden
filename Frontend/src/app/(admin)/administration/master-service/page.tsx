"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  useSpring,
} from "framer-motion";
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
  Users,
  TrendingUp,
  Eye,
  EyeOff,
  X,
  Loader2,
  Package,
  SlidersHorizontal,
  RussianRuble,
  UserPlus,
  Sparkles,
  Zap,
  Image as ImageIcon, // Иконка для изображения
  Link as LinkIcon,   // Иконка для ссылки
} from "lucide-react";

import { servicePriceService } from "@/services/service-price/service-price.service";
import { categoryService } from "@/services/category/category.service";
import { masterService } from "@/services/master/master.service";
import { serviceService } from "@/services/service/service.service";

import { IServicePrice, UIServicePrice } from "@/types/service-price.types";
import { ICategory } from "@/types/category.types";
import { IMaster } from "@/types/masters.type";
import { IService } from "@/types/services.types";

type SortField = "service" | "price" | "status";
type SortOrder = "asc" | "desc";

const CAT_GRADS = [
  ["from-blue-500 to-indigo-600", "#6366f1"],
  ["from-emerald-500 to-teal-600", "#14b8a6"],
  ["from-purple-500 to-pink-600", "#ec4899"],
  ["from-amber-500 to-orange-500", "#f97316"],
  ["from-rose-500 to-red-600", "#ef4444"],
  ["from-indigo-500 to-blue-600", "#3b82f6"],
  ["from-violet-500 to-purple-600", "#a855f7"],
  ["from-cyan-500 to-blue-500", "#06b6d4"],
];

interface GroupedServicePrice {
  serviceId: number;
  serviceTitle: string;
  categoryId: number;
  categoryName: string;
  serviceImg?: string; // Добавили изображение услуги в группу
  masters: {
    masterId: number;
    masterFullName: string;
    masterSpecialization: string;
    price: number;
    isActive: boolean;
    durationOverride: number | null;
    priceId: number;
  }[];
  minPrice: number;
  maxPrice: number;
  avgPrice: number;
  activeCount: number;
}

// ── Static number display ─────────────────────────────────────
function StatNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  return <>{value.toLocaleString()}{suffix}</>;
}

// ── Tilt card wrapper ──────────────────────────────────────────────────────────
function TiltCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-0.5, 0.5], [4, -4]);
  const rotateY = useTransform(x, [-0.5, 0.5], [-4, 4]);
  const sRotateX = useSpring(rotateX, { stiffness: 300, damping: 30 });
  const sRotateY = useSpring(rotateY, { stiffness: 300, damping: 30 });

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      style={{
        rotateX: sRotateX,
        rotateY: sRotateY,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── Shimmer skeleton ───────────────────────────────────────────────────────────
function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-white/[0.05] ${className}`}
    >
      <motion.div
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.08] to-transparent"
        animate={{ translateX: ["-100%", "100%"] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}

export default function MasterServicePrices() {
  const [prices, setPrices] = useState<UIServicePrice[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [masters, setMasters] = useState<IMaster[]>([]);
  const [services, setServices] = useState<IService[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPrice, setEditingPrice] = useState<UIServicePrice | null>(null);
  const [selectedServiceForAdd, setSelectedServiceForAdd] = useState<
    number | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const [sortField, setSortField] = useState<SortField>("service");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [search, setSearch] = useState("");

  // ОБНОВЛЕНО: Добавлено поле img в форму
  const [form, setForm] = useState({
    serviceId: 0,
    masterId: 0,
    price: 0,
    isActive: true,
    durationOverride: null as number | null,
    img: "", // Ссылка на фото услуги
  });

  // ── Theme ──────────────────────────────────────────────────────────────────
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

  // ── Data ───────────────────────────────────────────────────────────────────
  const loadData = async (showLoader = true) => {
    showLoader ? setIsLoading(true) : setIsRefreshing(true);
    try {
      const [p, c, m, s] = await Promise.all([
        servicePriceService.getAll(),
        categoryService.getAll(),
        masterService.getAll(),
        serviceService.getAll(),
      ]);
      const mapped: UIServicePrice[] = p
        .filter(
          (pr): pr is IServicePrice & { service: IService; master: IMaster } =>
            !!pr.service && !!pr.master,
        )
        .map((pr) => ({
          id: pr.id,
          price: pr.price,
          isActive: pr.isActive,
          durationOverride: pr.durationOverride ?? null,
          serviceId: pr.service.id,
          serviceTitle: pr.service.title,
          categoryId: pr.service.categoryId,
          serviceImg: pr.service.img || "", // Получаем картинку
          categoryName:
            c.find((cat) => cat.id === pr.service.categoryId)?.title ??
            "Не указана",
          masterId: pr.master.id,
          masterFullName: `${pr.master.surname} ${pr.master.name}`,
          masterSpecialization: pr.master.specialization || "",
        }));
      setPrices(mapped);
      setCategories(c);
      setMasters(m);
      setServices(s);
    } catch {
      alert("Ошибка загрузки данных");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const catGrad = (id: number) => CAT_GRADS[id % CAT_GRADS.length][0];
  const catColor = (id: number) => CAT_GRADS[id % CAT_GRADS.length][1];

  // ── Grouping ──────────────────────────────────────────────────────────────
  const groupedPrices = useMemo(() => {
    const groups = new Map<number, GroupedServicePrice>();
    prices.forEach((price) => {
      if (!groups.has(price.serviceId)) {
        groups.set(price.serviceId, {
          serviceId: price.serviceId,
          serviceTitle: price.serviceTitle,
          categoryId: price.categoryId,
          categoryName: price.categoryName,
          // ИСПРАВЛЕНИЕ: Преобразуем null в undefined с помощью оператора ??
          serviceImg: price.serviceImg ?? undefined, 
          masters: [],
          minPrice: Infinity,
          maxPrice: -Infinity,
          avgPrice: 0,
          activeCount: 0,
        });
      }
      const group = groups.get(price.serviceId)!;
      group.masters.push({
        masterId: price.masterId,
        masterFullName: price.masterFullName,
        masterSpecialization: price.masterSpecialization,
        price: price.price,
        isActive: price.isActive,
        durationOverride: price.durationOverride ?? null,
        priceId: price.id,
      });
      if (price.isActive) {
        group.activeCount++;
        if (price.price < group.minPrice) group.minPrice = price.price;
        if (price.price > group.maxPrice) group.maxPrice = price.price;
      }
    });
    groups.forEach((group) => {
      const active = group.masters
        .filter((m) => m.isActive)
        .map((m) => m.price);
      group.avgPrice = active.length
        ? Math.round(active.reduce((a, b) => a + b, 0) / active.length)
        : 0;
      if (group.activeCount === 0) {
        group.minPrice = 0;
        group.maxPrice = 0;
      } else {
        group.minPrice = group.minPrice === Infinity ? 0 : group.minPrice;
        group.maxPrice = group.maxPrice === -Infinity ? 0 : group.maxPrice;
      }
    });
    return Array.from(groups.values());
  }, [prices]);

  // ── Filter + Sort ─────────────────────────────────────────────────────────
  const filteredGroups = useMemo(() => {
    let list = groupedPrices;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (g) =>
          g.serviceTitle.toLowerCase().includes(q) ||
          g.categoryName.toLowerCase().includes(q) ||
          g.masters.some((m) => m.masterFullName.toLowerCase().includes(q)) ||
          g.masters.some((m) => m.price.toString().includes(q)),
      );
    }
    if (statusFilter) {
      list = list.filter((g) =>
        statusFilter === "active" ? g.activeCount > 0 : g.activeCount === 0,
      );
    }
    if (categoryFilter) {
      list = list.filter((g) => g.categoryId === Number(categoryFilter));
    }
    return [...list].sort((a, b) => {
      let av: string | number = "";
      let bv: string | number = "";
      if (sortField === "service") {
        av = a.serviceTitle;
        bv = b.serviceTitle;
      } else if (sortField === "price") {
        av = a.avgPrice;
        bv = b.avgPrice;
      } else {
        av = a.activeCount;
        bv = b.activeCount;
      }
      if (typeof av === "string")
        return sortOrder === "asc"
          ? av.localeCompare(bv as string)
          : (bv as string).localeCompare(av);
      return sortOrder === "asc"
        ? (av as number) - (bv as number)
        : (bv as number) - (av as number);
    });
  }, [
    groupedPrices,
    search,
    statusFilter,
    categoryFilter,
    sortField,
    sortOrder,
  ]);

  const stats = useMemo(() => {
    const total = prices.length;
    const active = prices.filter((p) => p.isActive).length;
    const valid = prices.map((p) => p.price).filter((p) => !isNaN(p) && p > 0);
    const avg = valid.length
      ? Math.round(valid.reduce((a, b) => a + b, 0) / valid.length)
      : 0;
    const uniqueServices = groupedPrices.length;
    const uniqueMasters = new Set(prices.map((p) => p.masterId)).size;
    return { total, active, avg, uniqueServices, uniqueMasters };
  }, [prices, groupedPrices]);

  // ── Modal ─────────────────────────────────────────────────────────────────
  const openAddForService = (serviceId: number) => {
    const svc = services.find((s) => s.id === serviceId);
    setSelectedServiceForAdd(serviceId);
    setEditingPrice(null);
    setForm({
      serviceId,
      masterId: 0,
      price: 0,
      isActive: true,
      durationOverride: null,
      img: svc?.img || "", // Подхватываем картинку услуги
    });
    setIsModalOpen(true);
  };

  const openAddGeneral = () => {
    setSelectedServiceForAdd(null);
    setEditingPrice(null);
    setForm({
      serviceId: 0,
      masterId: 0,
      price: 0,
      isActive: true,
      durationOverride: null,
      img: "",
    });
    setIsModalOpen(true);
  };

  const openEdit = (p: UIServicePrice) => {
    setSelectedServiceForAdd(null);
    setEditingPrice(p);
    setForm({
      serviceId: p.serviceId,
      masterId: p.masterId,
      price: p.price,
      isActive: p.isActive,
      durationOverride: p.durationOverride ?? null,
      img: p.serviceImg || "",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPrice(null);
    setSelectedServiceForAdd(null);
  };

  const handleInput = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setForm((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else if (name === "durationOverride") {
      setForm((prev) => ({
        ...prev,
        durationOverride: value ? parseInt(value) : null,
      }));
    } else if (type === "number") {
      setForm((prev) => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.serviceId || !form.masterId || form.price <= 0) {
      alert("Выберите услугу, мастера и цену > 0");
      return;
    }
    setIsLoading(true);
    try {
      const payload = {
        serviceId: form.serviceId,
        masterId: form.masterId,
        price: form.price,
        isActive: form.isActive,
        durationOverride: form.durationOverride,
        // Если нужно обновлять и картинку услуги через этот эндпоинт, раскомментируйте:
        // img: form.img, 
      };
      
      if (editingPrice) {
        const updated = await servicePriceService.update(
          editingPrice.id,
          payload,
        );
        setPrices((prev) =>
          prev.map((p) =>
            p.id === updated.id
              ? {
                  ...p,
                  price: updated.price,
                  isActive: updated.isActive,
                  durationOverride: updated.durationOverride ?? null,
                }
              : p,
          ),
        );
      } else {
        const created = await servicePriceService.create(payload);
        const service = services.find((s) => s.id === created.serviceId);
        const master = masters.find((m) => m.id === created.masterId);
        if (service && master) {
          setPrices((prev) => [
            {
              id: created.id,
              price: created.price,
              isActive: created.isActive,
              durationOverride: created.durationOverride ?? null,
              serviceId: created.serviceId,
              serviceTitle: service.title,
              serviceImg: service.img || "",
              categoryId: service.categoryId,
              categoryName:
                categories.find((c) => c.id === service.categoryId)?.title ??
                "Не указана",
              masterId: created.masterId,
              masterFullName: `${master.surname} ${master.name}`,
              masterSpecialization: master.specialization || "",
            },
            ...prev,
          ]);
        }
      }
      closeModal();
    } catch {
      alert("Ошибка сохранения");
    } finally {
      setIsLoading(false);
    }
  };

  const deletePrice = async (id: number) => {
    if (!confirm("Удалить цену?")) return;
    try {
      await servicePriceService.delete(id);
      setPrices((prev) => prev.filter((p) => p.id !== id));
    } catch {
      alert("Ошибка удаления");
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

  const toggleExpand = (serviceId: number) => {
    setExpandedCards((prev) => {
      const s = new Set(prev);
      s.has(serviceId) ? s.delete(serviceId) : s.add(serviceId);
      return s;
    });
  };

  // ── Design tokens ─────────────────────────────────────────────────────────
  const glass = isDark
    ? "bg-white/[0.06] backdrop-blur-2xl border border-white/[0.09] shadow-xl"
    : "bg-white/80 backdrop-blur-xl border border-gray-200/80 shadow-sm";

  const inputCls = `w-full h-11 px-4 rounded-xl text-sm border outline-none transition-all duration-200 ${
    isDark
      ? "bg-white/[0.06] border-white/[0.09] text-white/90 placeholder-white/25 focus:border-indigo-400/60 focus:ring-2 focus:ring-indigo-400/10 focus:bg-white/[0.09]"
      : "bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 focus:bg-white"
  }`;

  const sectionCls = `rounded-2xl p-4 border ${
    isDark
      ? "bg-white/[0.04] border-white/[0.07]"
      : "bg-gray-50/60 border-gray-200/60"
  }`;

  const STAT_CARDS = [
    {
      num: stats.uniqueServices,
      label: "Услуг",
      sub: "с ценами",
      grad: "from-blue-500 to-indigo-600",
      icon: Package,
    },
    {
      num: stats.uniqueMasters,
      label: "Мастеров",
      sub: "участвуют",
      grad: "from-emerald-500 to-teal-600",
      icon: Users,
    },
    {
      num: stats.active,
      label: "Активных",
      sub: "комбинаций",
      grad: "from-amber-500 to-orange-500",
      icon: Zap,
    },
    {
      num: stats.avg,
      label: "Ср. цена",
      sub: "рублей",
      grad: "from-purple-500 to-pink-600",
      icon: TrendingUp,
    },
  ];

  const SORT_OPTS: { f: SortField; l: string }[] = [
    { f: "service", l: "Услуга" },
    { f: "price", l: "Ср. цена" },
    { f: "status", l: "Активные" },
  ];

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <div className="max-w-9xl mx-auto space-y-7">
        {/* ── HEADER ── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="flex items-center gap-2 mb-3"
              >
                <div
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border ${
                    isDark
                      ? "bg-white/[0.06] border-white/[0.09] text-white/40"
                      : "bg-gray-100 border-gray-200 text-gray-400"
                  }`}
                >
                  <RussianRuble size={11} />
                  Цены мастеров
                </div>
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.15,
                  duration: 0.5,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className={`text-4xl md:text-5xl font-black leading-none tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}
              >
                Цены услуг
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 }}
                className={`mt-2 text-sm ${isDark ? "text-white/35" : "text-gray-400"}`}
              >
                {stats.total} комбинаций · {stats.active} активных ·{" "}
                {stats.uniqueServices} услуг
                {filteredGroups.length !== groupedPrices.length &&
                  ` · показано ${filteredGroups.length}`}
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="flex gap-2.5 flex-wrap"
            >
              <motion.button
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => loadData(false)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-200 ${
                  isDark
                    ? "bg-white/[0.06] border-white/[0.09] text-white/60 hover:text-white/80 hover:bg-white/[0.1]"
                    : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50 shadow-sm"
                }`}
              >
                <motion.span
                  animate={isRefreshing ? { rotate: 360 } : { rotate: 0 }}
                  transition={{
                    duration: 1,
                    repeat: isRefreshing ? Infinity : 0,
                    ease: "linear",
                  }}
                >
                  <RefreshCw size={14} />
                </motion.span>
                Обновить
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={openAddGeneral}
                className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg overflow-hidden transition-all duration-200 ${
                  isDark
                    ? "bg-gradient-to-r from-indigo-500 to-purple-600 shadow-purple-500/30 hover:shadow-purple-500/50"
                    : "bg-gradient-to-r from-blue-500 to-purple-600 shadow-blue-500/25 hover:shadow-blue-500/40"
                }`}
              >
                <motion.span
                  className="absolute inset-0 bg-white/20"
                  initial={{ x: "-100%", skewX: -15 }}
                  whileHover={{ x: "200%" }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                />
                <Plus size={16} />
                Назначить цену
              </motion.button>
            </motion.div>
          </div>
        </motion.div>

        {/* ── STAT CARDS ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {STAT_CARDS.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ y: -3, scale: 1.02 }}
                className={`relative rounded-2xl p-5 overflow-hidden transition-all duration-300 ${
                  isDark
                    ? `bg-white/[0.06] backdrop-blur-xl border border-white/[0.09] shadow-lg hover:shadow-xl`
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
                    <Icon size={17} className="text-white" />
                  </div>
                  <div
                    className={`text-3xl font-black leading-none mb-1 tabular-nums ${isDark ? "text-white" : "text-gray-900"}`}
                  >
                    <StatNumber
                      value={s.num}
                      suffix={s.label === "Ср. цена" ? " ₽" : ""}
                    />
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
            );
          })}
        </div>

        {/* ── FILTER BAR ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
          className={`rounded-2xl p-4 ${glass}`}
        >
          <div className="flex gap-3 flex-wrap">
            <div className="flex-1 min-w-[180px] relative">
              <Search
                size={15}
                className={`absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? "text-white/25" : "text-gray-400"}`}
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Поиск по услуге, мастеру, цене..."
                className={`w-full h-11 pl-10 pr-9 rounded-xl text-sm border outline-none transition-all duration-200 ${
                  isDark
                    ? "bg-white/[0.06] border-white/[0.08] text-white/90 placeholder-white/25 focus:border-indigo-400/50 focus:bg-white/[0.08]"
                    : "bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400 focus:border-blue-300 focus:bg-white"
                }`}
              />
              <AnimatePresence>
                {search && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={() => setSearch("")}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDark ? "text-white/30 hover:text-white/60" : "text-gray-400 hover:text-gray-600"}`}
                  >
                    <X size={14} />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            <div className="relative">
              <Tag
                size={14}
                className={`absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? "text-white/25" : "text-gray-400"}`}
              />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className={`h-11 pl-9 pr-8 rounded-xl text-sm border outline-none appearance-none transition-all duration-200 ${
                  isDark
                    ? "bg-white/[0.06] border-white/[0.08] text-white/90 focus:border-indigo-400/50"
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

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setFilterOpen(!filterOpen)}
              className={`h-11 flex items-center gap-2 px-4 rounded-xl text-sm font-semibold border transition-all duration-200 ${
                filterOpen
                  ? isDark
                    ? "bg-indigo-500/20 border-indigo-400/30 text-indigo-300"
                    : "bg-blue-50 border-blue-300 text-blue-600"
                  : isDark
                    ? "bg-white/[0.06] border-white/[0.08] text-white/55 hover:bg-white/[0.09]"
                    : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-white shadow-sm"
              }`}
            >
              <SlidersHorizontal size={15} />
              Сортировка
              <motion.span
                animate={{ rotate: filterOpen ? 180 : 0 }}
                transition={{ duration: 0.25 }}
              >
                <ChevronDown size={13} />
              </motion.span>
            </motion.button>

            <AnimatePresence>
              {(search || statusFilter || categoryFilter) && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.85, x: 8 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.85, x: 8 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("");
                    setCategoryFilter("");
                  }}
                  className={`h-11 px-4 rounded-xl text-sm font-semibold border flex items-center gap-1.5 transition-all ${
                    isDark
                      ? "bg-rose-500/10 border-rose-400/20 text-rose-400"
                      : "bg-rose-50 border-rose-200 text-rose-500"
                  }`}
                >
                  <X size={14} />
                  Сброс
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence>
            {filterOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: "auto", marginTop: 12 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <div
                  className={`pt-3 border-t space-y-3 ${isDark ? "border-white/[0.07]" : "border-gray-100"}`}
                >
                  <div>
                    <p
                      className={`text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? "text-white/25" : "text-gray-400"}`}
                    >
                      Статус
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {[
                        { v: "", l: "Все" },
                        { v: "active", l: "Есть активные" },
                        { v: "inactive", l: "Нет активных" },
                      ].map((o) => (
                        <motion.button
                          key={o.v}
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.96 }}
                          onClick={() => setStatusFilter(o.v)}
                          className={`h-7 px-3 rounded-full text-xs font-semibold border transition-all duration-200 ${
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
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.96 }}
                          onClick={() => handleSort(o.f)}
                          className={`h-7 px-3 rounded-full text-xs font-semibold border flex items-center gap-1 transition-all duration-200 ${
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
                            <motion.span
                              initial={{ rotate: 0 }}
                              animate={{
                                rotate: sortOrder === "desc" ? 180 : 0,
                              }}
                              className="text-[10px]"
                            >
                              ↑
                            </motion.span>
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

        {/* ── COUNT LABEL ── */}
        {!isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`px-1 text-xs ${isDark ? "text-white/25" : "text-gray-400"}`}
          >
            {filteredGroups.length === groupedPrices.length
              ? `${filteredGroups.length} услуг`
              : `${filteredGroups.length} из ${groupedPrices.length} услуг`}
          </motion.div>
        )}

        {/* ── SERVICE GRID ── */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className={`rounded-2xl overflow-hidden border ${isDark ? "border-white/[0.07]" : "border-gray-200"}`}
              >
                <div className="h-1 bg-white/[0.05]" />
                <div className="p-5 space-y-4">
                  <div className="flex gap-3">
                    <Skeleton className="w-12 h-12 rounded-2xl" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-7 w-20 rounded-xl" />
                    <Skeleton className="h-7 w-24 rounded-xl" />
                  </div>
                  <Skeleton className="h-8 w-1/2" />
                  <div className="space-y-2">
                    <Skeleton className="h-12 rounded-xl" />
                    <Skeleton className="h-12 rounded-xl" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : filteredGroups.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`rounded-2xl p-16 text-center ${glass}`}
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className={`w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center ${isDark ? "bg-white/[0.06]" : "bg-gray-100"}`}
            >
              <RussianRuble
                size={26}
                className={isDark ? "text-white/20" : "text-gray-300"}
              />
            </motion.div>
            <p
              className={`text-lg font-bold mb-1 ${isDark ? "text-white/50" : "text-gray-500"}`}
            >
              {groupedPrices.length === 0 ? "Нет цен" : "Ничего не найдено"}
            </p>
            <p
              className={`text-sm mb-5 ${isDark ? "text-white/25" : "text-gray-400"}`}
            >
              {search || statusFilter || categoryFilter
                ? "Попробуйте изменить параметры поиска"
                : "Назначьте первую цену мастеру"}
            </p>
            {search || statusFilter || categoryFilter ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
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
                whileTap={{ scale: 0.98 }}
                onClick={openAddGeneral}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg bg-gradient-to-r from-blue-500 to-purple-600"
              >
                + Назначить цену
              </motion.button>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredGroups.map((group, i) => {
                const grad = catGrad(group.categoryId);
                const color = catColor(group.categoryId);
                const service = services.find((s) => s.id === group.serviceId);
                const isExpanded = expandedCards.has(group.serviceId);
                const displayedMasters = isExpanded
                  ? group.masters
                  : group.masters.slice(0, 3);
                const hasMore = group.masters.length > 3;
                const isHovered = hoveredCard === group.serviceId;
                const hasImg = group.serviceImg && group.serviceImg.trim() !== "";

                return (
                  <motion.div
                    key={group.serviceId}
                    layout
                    initial={{ opacity: 0, y: 24, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95, y: -8 }}
                    transition={{
                      delay: i * 0.04,
                      duration: 0.4,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    onHoverStart={() => setHoveredCard(group.serviceId)}
                    onHoverEnd={() => setHoveredCard(null)}
                    className={`group relative rounded-2xl overflow-hidden flex flex-col transition-all duration-300 cursor-default ${
                      isDark
                        ? "bg-white/[0.06] backdrop-blur-xl border border-white/[0.09] hover:border-white/[0.15] shadow-xl hover:shadow-2xl"
                        : "bg-white border border-gray-200/70 hover:border-gray-300 shadow-sm hover:shadow-xl"
                    }`}
                    style={{
                      boxShadow: isHovered
                        ? `0 20px 60px ${color}22, 0 4px 20px ${color}18`
                        : undefined,
                    }}
                  >
                    {/* Top accent bar */}
                    <div
                      className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${grad}`}
                    >
                      <motion.div
                        className={`absolute inset-0 bg-gradient-to-r ${grad} opacity-0`}
                        animate={{ opacity: isHovered ? 1 : 0 }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>

                    {/* Glow background blob */}
                    <motion.div
                      className={`absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl bg-gradient-to-br ${grad}`}
                      animate={{
                        opacity: isHovered ? 0.08 : 0.04,
                        scale: isHovered ? 1.1 : 1,
                      }}
                      transition={{ duration: 0.4 }}
                    />

                    {/* ── Card header ── */}
                    <div className="relative p-5 pb-3">
                      <div className="flex items-start gap-3 mb-3">
                        {/* IMAGE OR ICON */}
                        {hasImg ? (
                          <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-lg flex-shrink-0 border border-white/10">
                            <img 
                              src={group.serviceImg} 
                              alt={group.serviceTitle}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                                e.currentTarget.parentElement!.innerHTML = `<div class="w-full h-full bg-gradient-to-br ${grad} flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-package"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg></div>`;
                              }}
                            />
                          </div>
                        ) : (
                          <motion.div
                            whileHover={{
                              rotate: [0, -5, 5, -3, 0],
                              scale: 1.05,
                            }}
                            transition={{ duration: 0.4 }}
                            className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${grad} flex items-center justify-center shadow-lg flex-shrink-0`}
                            style={{ boxShadow: `0 8px 24px ${color}40` }}
                          >
                            <Package size={20} className="text-white" />
                          </motion.div>
                        )}

                        <div className="min-w-0 flex-1">
                          <h3
                            className={`font-bold text-lg leading-tight ${isDark ? "text-white/95" : "text-gray-900"}`}
                          >
                            {group.serviceTitle}
                          </h3>
                          <div className="flex items-center gap-1.5 mt-1">
                            <div
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ background: color }}
                            />
                            <p
                              className={`text-xs ${isDark ? "text-white/45" : "text-gray-500"}`}
                            >
                              {group.categoryName}
                            </p>
                          </div>
                        </div>

                        {/* Active indicator badge */}
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{
                            delay: i * 0.04 + 0.2,
                            type: "spring",
                            stiffness: 400,
                          }}
                          className={`flex-shrink-0 px-2 py-1 rounded-full text-[10px] font-bold border ${
                            group.activeCount > 0
                              ? isDark
                                ? "bg-emerald-500/10 border-emerald-400/20 text-emerald-400"
                                : "bg-emerald-50 border-emerald-200 text-emerald-700"
                              : isDark
                                ? "bg-rose-500/10 border-rose-400/20 text-rose-400"
                                : "bg-rose-50 border-rose-200 text-rose-600"
                          }`}
                        >
                          {group.activeCount > 0 ? "● Active" : "○ Inactive"}
                        </motion.div>
                      </div>

                      {/* Tags row */}
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border ${isDark ? "bg-white/[0.05] border-white/[0.07] text-white/55" : "bg-gray-50 border-gray-200 text-gray-600"}`}
                        >
                          <Users size={10} />
                          {group.masters.length}{" "}
                          {getMasterWord(group.masters.length)}
                        </span>
                        {group.minPrice > 0 && (
                          <span
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border"
                            style={{
                              background: `${color}12`,
                              borderColor: `${color}25`,
                              color: color,
                            }}
                          >
                            <RussianRuble size={9} />
                            {group.minPrice.toLocaleString()} —{" "}
                            {group.maxPrice.toLocaleString()}
                          </span>
                        )}
                        {service?.duration && (
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border ${isDark ? "bg-white/[0.05] border-white/[0.07] text-white/55" : "bg-gray-50 border-gray-200 text-gray-600"}`}
                          >
                            <Clock size={10} />
                            {service.duration} мин
                          </span>
                        )}
                      </div>

                      {/* Average price with animated underline */}
                      <div className="relative inline-block">
                        <div
                          className={`text-xs mb-0.5 ${isDark ? "text-white/35" : "text-gray-400"}`}
                        >
                          средняя цена
                        </div>
                        <div className="flex items-baseline gap-1">
                          <motion.span
                            className={`text-3xl font-black tabular-nums ${isDark ? "text-white" : "text-gray-900"}`}
                            style={{ fontVariantNumeric: "tabular-nums" }}
                          >
                            {group.avgPrice > 0
                              ? group.avgPrice.toLocaleString()
                              : "—"}
                          </motion.span>
                          {group.avgPrice > 0 && (
                            <span
                              className={`text-base font-bold ${isDark ? "text-white/60" : "text-gray-500"}`}
                            >
                              ₽
                            </span>
                          )}
                        </div>
                        <motion.div
                          className={`absolute bottom-0 left-0 h-[2px] rounded-full bg-gradient-to-r ${grad}`}
                          initial={{ width: 0 }}
                          animate={{ width: isHovered ? "100%" : "40%" }}
                          transition={{ duration: 0.4, ease: "easeOut" }}
                        />
                      </div>
                    </div>

                    {/* ── Masters section ── */}
                    <div className="relative px-5 pb-2">
                      <div className={`flex items-center gap-2 mb-2`}>
                        <div
                          className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? "text-white/25" : "text-gray-400"}`}
                        >
                          Мастера
                        </div>
                        <div
                          className={`flex-1 h-px ${isDark ? "bg-white/[0.06]" : "bg-gray-100"}`}
                        />
                      </div>

                      <motion.div
                        layout
                        className="space-y-1.5"
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 30,
                          mass: 0.8,
                        }}
                      >
                        <AnimatePresence mode="popLayout" initial={false}>
                          {displayedMasters.map((master, mi) => {
                            const masterDuration =
                              master.durationOverride ?? service?.duration;
                            return (
                              <motion.div
                                key={master.priceId}
                                layout
                                layoutId={`master-${master.priceId}`}
                                initial={{
                                  opacity: 0,
                                  x: -8,
                                  scale: 0.98,
                                }}
                                animate={{
                                  opacity: 1,
                                  x: 0,
                                  scale: 1,
                                }}
                                exit={{
                                  opacity: 0,
                                  x: -8,
                                  scale: 0.98,
                                }}
                                transition={{
                                  type: "spring",
                                  stiffness: 500,
                                  damping: 35,
                                  mass: 0.6,
                                  delay: mi * 0.03,
                                }}
                                className={`group/master flex items-center justify-between p-2.5 rounded-xl transition-all duration-200 ${
                                  isDark
                                    ? "hover:bg-white/[0.07]"
                                    : "hover:bg-gray-50"
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                  <div
                                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-black flex-shrink-0 shadow-md`}
                                    style={{
                                      background: `linear-gradient(135deg, ${color}, ${color}aa)`,
                                    }}
                                  >
                                    {master.masterFullName
                                      .slice(0, 2)
                                      .toUpperCase()}
                                  </div>

                                  <div className="min-w-0 flex-1">
                                    <div
                                      className={`font-semibold text-sm truncate leading-tight ${isDark ? "text-white/90" : "text-gray-900"}`}
                                    >
                                      {master.masterFullName}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {masterDuration && (
                                        <span
                                          className={`text-[10px] flex items-center gap-0.5 ${isDark ? "text-white/35" : "text-gray-400"}`}
                                        >
                                          <Clock size={9} />
                                          {masterDuration}
                                          {master.durationOverride
                                            ? "*"
                                            : ""}{" "}
                                          мин
                                        </span>
                                      )}
                                      <span
                                        className={`w-1.5 h-1.5 rounded-full ${master.isActive ? "bg-emerald-400" : "bg-gray-400"}`}
                                      />
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                  <div
                                    className={`text-sm font-bold tabular-nums mr-1 transition-opacity ${!master.isActive ? "opacity-35 line-through" : ""} ${isDark ? "text-white" : "text-gray-900"}`}
                                  >
                                    {master.price.toLocaleString()} ₽
                                  </div>

                                  <div className="flex gap-1 opacity-0 group-hover/master:opacity-100 transition-opacity duration-150">
                                    <motion.button
                                      whileHover={{ scale: 1.15 }}
                                      whileTap={{ scale: 0.9 }}
                                      onClick={() =>
                                        openEdit({
                                          id: master.priceId,
                                          price: master.price,
                                          isActive: master.isActive,
                                          durationOverride:
                                            master.durationOverride,
                                          serviceId: group.serviceId,
                                          serviceTitle: group.serviceTitle,
                                          serviceImg: group.serviceImg,
                                          categoryId: group.categoryId,
                                          categoryName: group.categoryName,
                                          masterId: master.masterId,
                                          masterFullName: master.masterFullName,
                                          masterSpecialization:
                                            master.masterSpecialization,
                                        })
                                      }
                                      className={`w-7 h-7 rounded-lg flex items-center justify-center border transition-all ${
                                        isDark
                                          ? "bg-blue-500/10 border-blue-400/15 text-blue-400 hover:bg-blue-500/25"
                                          : "bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100"
                                      }`}
                                    >
                                      <Edit size={11} />
                                    </motion.button>
                                    <motion.button
                                      whileHover={{ scale: 1.15 }}
                                      whileTap={{ scale: 0.9 }}
                                      onClick={() =>
                                        deletePrice(master.priceId)
                                      }
                                      className={`w-7 h-7 rounded-lg flex items-center justify-center border transition-all ${
                                        isDark
                                          ? "bg-rose-500/10 border-rose-400/15 text-rose-400 hover:bg-rose-500/25"
                                          : "bg-rose-50 border-rose-200 text-rose-500 hover:bg-rose-100"
                                      }`}
                                    >
                                      <Trash2 size={11} />
                                    </motion.button>
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })}
                        </AnimatePresence>
                      </motion.div>

                      {hasMore && (
                        <motion.button
                          layout
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => toggleExpand(group.serviceId)}
                          className={`w-full mt-2 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 flex items-center justify-center gap-1.5 overflow-hidden ${
                            isDark
                              ? "bg-white/[0.03] border-white/[0.07] text-white/45 hover:bg-white/[0.07] hover:text-white/70"
                              : "bg-gray-50/50 border-gray-200 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                          }`}
                        >
                          <motion.span
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{
                              type: "spring",
                              stiffness: 500,
                              damping: 30,
                              duration: 0.25,
                            }}
                          >
                            <ChevronDown size={12} />
                          </motion.span>
                          <motion.span
                            key={isExpanded ? "less" : "more"}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.15 }}
                          >
                            {isExpanded
                              ? "Показать меньше"
                              : `+${group.masters.length - 3} ${getMasterWord(group.masters.length - 3)}`}
                          </motion.span>
                        </motion.button>
                      )}
                    </div>

                    {/* ── Card footer ── */}
                    <div
                      className={`mt-auto p-4 pt-3 border-t ${isDark ? "border-white/[0.06]" : "border-gray-100/80"}`}
                    >
                      <motion.button
                        whileHover={{ scale: 1.01, y: -1 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => openAddForService(group.serviceId)}
                        className={`relative w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border overflow-hidden transition-all duration-200 ${
                          isDark
                            ? "bg-white/[0.04] border-white/[0.08] text-white/55 hover:text-white/80"
                            : "bg-gray-50/70 border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <motion.span
                          className={`absolute inset-0 bg-gradient-to-r ${grad} opacity-0`}
                          whileHover={{ opacity: 0.06 }}
                          transition={{ duration: 0.2 }}
                        />
                        <UserPlus size={14} />
                        Добавить мастера
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* ── FOOTER ── */}
        {!isLoading && groupedPrices.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className={`flex flex-wrap items-center justify-between gap-3 pt-5 border-t text-xs ${
              isDark
                ? "border-white/[0.06] text-white/20"
                : "border-gray-100 text-gray-400"
            }`}
          >
            <div className="flex flex-wrap gap-4">
              {[
                { c: "bg-emerald-400", l: "Активные цены" },
                { c: "bg-gray-400", l: "Неактивные" },
              ].map((x) => (
                <div key={x.l} className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${x.c}`} />
                  {x.l}
                </div>
              ))}
            </div>
            <span className="flex items-center gap-1.5">
              <Sparkles size={11} />
              {stats.active} из {stats.total} комбинаций активны
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
            transition={{ duration: 0.2 }}
            onClick={(e) => e.target === e.currentTarget && closeModal()}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
            style={{
              background: isDark ? "rgba(0,0,0,0.82)" : "rgba(15,23,42,0.48)",
              backdropFilter: "blur(20px)",
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 20 }}
              transition={{ type: "spring", damping: 26, stiffness: 320 }}
              onClick={(e) => e.stopPropagation()}
              className={`relative w-full max-w-lg rounded-3xl overflow-hidden my-4 flex flex-col max-h-[90vh] ${
                isDark
                  ? "bg-slate-900/90 backdrop-blur-3xl border border-white/[0.1] shadow-[0_32px_80px_rgba(0,0,0,0.7)]"
                  : "bg-white/97 backdrop-blur-xl border border-gray-200/70 shadow-2xl"
              }`}
            >
              {/* Modal header */}
              <div
                className={`relative px-7 py-6 overflow-hidden flex-shrink-0 ${
                  editingPrice
                    ? "bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500"
                    : "bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600"
                }`}
              >
                <motion.div
                  className="absolute -top-10 -right-10 w-36 h-36 bg-white/10 rounded-full"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 4, repeat: Infinity }}
                />
                <motion.div
                  className="absolute bottom-2 left-12 w-8 h-8 bg-white/10 rounded-full"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
                />
                <div className="absolute bottom-0 left-0 right-0 h-px bg-white/15" />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <motion.div
                      initial={{ rotate: -10, scale: 0.8 }}
                      animate={{ rotate: 0, scale: 1 }}
                      transition={{ type: "spring", stiffness: 400 }}
                      className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg"
                    >
                      {editingPrice ? (
                        <Edit size={20} className="text-white" />
                      ) : (
                        <UserPlus size={20} className="text-white" />
                      )}
                    </motion.div>
                    <div>
                      <h2 className="text-xl font-black text-white">
                        {editingPrice
                          ? "Редактировать цену"
                          : "Назначить цену мастеру"}
                      </h2>
                      <p className="text-white/65 text-xs mt-0.5">
                        {editingPrice
                          ? "Измените параметры"
                          : "Выберите мастера и укажите стоимость"}
                      </p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    onClick={closeModal}
                    className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-white hover:bg-white/25 transition-colors"
                  >
                    <X size={17} />
                  </motion.button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  
                  {/* IMAGE URL INPUT (NEW) */}
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 }}
                    className={sectionCls}
                  >
                    <label
                      className={`block text-xs font-bold uppercase tracking-wider mb-2.5 ${isDark ? "text-white/35" : "text-gray-400"}`}
                    >
                      Фото услуги{" "}
                      <span
                        className={`normal-case font-normal ${isDark ? "text-white/20" : "text-gray-300"}`}
                      >
                        (ссылка)
                      </span>
                    </label>
                    <div className="relative">
                      <LinkIcon
                        size={14}
                        className={`absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? "text-white/25" : "text-gray-400"}`}
                      />
                      <input
                        type="url"
                        name="img"
                        value={form.img}
                        onChange={handleInput}
                        placeholder="https://example.com/image.jpg"
                        className={`${inputCls} pl-10`}
                      />
                    </div>
                    
                    {/* Preview */}
                    {form.img && (
                      <div className="mt-3 relative group">
                        <div className={`w-full h-32 rounded-xl overflow-hidden border ${isDark ? "border-white/10 bg-white/5" : "border-gray-200 bg-gray-50"}`}>
                          <img 
                            src={form.img} 
                            alt="Preview" 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => setForm(p => ({ ...p, img: '' }))}
                          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-md hover:bg-rose-600 transition-colors"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    )}
                  </motion.div>

                  {[
                    {
                      label: "Услуга *",
                      icon: <Package size={14} />,
                      content: (
                        <select
                          name="serviceId"
                          value={form.serviceId}
                          onChange={handleInput}
                          required
                          className={`${inputCls} pl-10 pr-8 appearance-none`}
                        >
                          <option value={0}>Выберите услугу</option>
                          {services
                            .filter((s) => s.isActive)
                            .map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.title} ({s.duration} мин)
                              </option>
                            ))}
                        </select>
                      ),
                    },
                    {
                      label: "Мастер *",
                      icon: <Users size={14} />,
                      content: (
                        <select
                          name="masterId"
                          value={form.masterId}
                          onChange={handleInput}
                          required
                          className={`${inputCls} pl-10 pr-8 appearance-none`}
                        >
                          <option value={0}>Выберите мастера</option>
                          {masters
                            .filter((m) => m.isActive)
                            .map((m) => (
                              <option key={m.id} value={m.id}>
                                {m.surname} {m.name}
                              </option>
                            ))}
                        </select>
                      ),
                    },
                  ].map((field, fi) => (
                    <motion.div
                      key={fi}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (fi + 1) * 0.06 + 0.05 }}
                      className={sectionCls}
                    >
                      <label
                        className={`block text-xs font-bold uppercase tracking-wider mb-2.5 ${isDark ? "text-white/35" : "text-gray-400"}`}
                      >
                        {field.label}
                      </label>
                      <div className="relative">
                        <span
                          className={`absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? "text-white/25" : "text-gray-400"}`}
                        >
                          {field.icon}
                        </span>
                        {field.content}
                        <ChevronDown
                          size={13}
                          className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? "text-white/25" : "text-gray-400"}`}
                        />
                      </div>
                    </motion.div>
                  ))}

                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.18 }}
                    className="grid grid-cols-2 gap-3"
                  >
                    <div className={sectionCls}>
                      <label
                        className={`block text-xs font-bold uppercase tracking-wider mb-2.5 ${isDark ? "text-white/35" : "text-gray-400"}`}
                      >
                        Цена (₽) *
                      </label>
                      <div className="relative">
                        <RussianRuble
                          size={14}
                          className={`absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? "text-white/25" : "text-gray-400"}`}
                        />
                        <input
                          type="number"
                          name="price"
                          value={form.price}
                          onChange={handleInput}
                          min="100"
                          step="50"
                          required
                          className={`${inputCls} pl-10 pr-10`}
                        />
                        <span
                          className={`absolute right-3.5 top-1/2 -translate-y-1/2 text-xs ${isDark ? "text-white/30" : "text-gray-400"}`}
                        >
                          ₽
                        </span>
                      </div>
                    </div>
                    <div className={sectionCls}>
                      <label
                        className={`block text-xs font-bold uppercase tracking-wider mb-2.5 ${isDark ? "text-white/35" : "text-gray-400"}`}
                      >
                        Длительность
                      </label>
                      <div className="relative">
                        <Clock
                          size={14}
                          className={`absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? "text-white/25" : "text-gray-400"}`}
                        />
                        <input
                          type="number"
                          name="durationOverride"
                          value={form.durationOverride ?? ""}
                          onChange={handleInput}
                          placeholder="—"
                          className={`${inputCls} pl-10 pr-10`}
                        />
                        <span
                          className={`absolute right-3.5 top-1/2 -translate-y-1/2 text-xs ${isDark ? "text-white/30" : "text-gray-400"}`}
                        >
                          мин
                        </span>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.24 }}
                    className={sectionCls}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p
                          className={`text-sm font-bold ${isDark ? "text-white/85" : "text-gray-800"}`}
                        >
                          Статус цены
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
                          setForm((prev) => ({
                            ...prev,
                            isActive: !prev.isActive,
                          }))
                        }
                        whileTap={{ scale: 0.95 }}
                        className={`relative inline-flex h-7 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 focus:outline-none ${
                          form.isActive
                            ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                            : isDark
                              ? "bg-white/[0.1]"
                              : "bg-gray-200"
                        }`}
                        style={{ width: 52 }}
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
                    <motion.div
                      animate={{
                        color: form.isActive
                          ? isDark
                            ? "#34d399"
                            : "#059669"
                          : isDark
                            ? "#fbbf24"
                            : "#d97706",
                      }}
                      className="flex items-center gap-1.5 mt-2.5 text-xs font-semibold"
                    >
                      {form.isActive ? <Eye size={12} /> : <EyeOff size={12} />}
                      {form.isActive ? "Цена активна" : "Цена скрыта"}
                    </motion.div>
                  </motion.div>

                  {/* Summary card */}
                  <AnimatePresence>
                    {form.serviceId > 0 &&
                      form.masterId > 0 &&
                      form.price > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.97 }}
                          transition={{ duration: 0.25 }}
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
                              {
                                services.find((s) => s.id === form.serviceId)
                                  ?.title
                              }
                            </p>
                            <p
                              className={`text-xs mt-0.5 ${isDark ? "text-white/30" : "text-gray-400"}`}
                            >
                              {
                                masters.find((m) => m.id === form.masterId)
                                  ?.surname
                              }{" "}
                              {
                                masters.find((m) => m.id === form.masterId)
                                  ?.name
                              }{" "}
                              · {form.price.toLocaleString()} ₽
                            </p>
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
                          ? "bg-white/[0.05] border-white/[0.09] text-white/60 hover:bg-white/[0.08]"
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
                      className={`relative flex-1 h-12 rounded-2xl text-sm font-bold text-white shadow-lg overflow-hidden transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 ${
                        editingPrice
                          ? "bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500"
                          : "bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600"
                      }`}
                    >
                      <motion.span
                        className="absolute inset-0 bg-white/20"
                        initial={{ x: "-100%", skewX: -15 }}
                        whileHover={{ x: "200%" }}
                        transition={{ duration: 0.5 }}
                      />
                      {isLoading ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Сохранение...
                        </>
                      ) : editingPrice ? (
                        <>
                          <Edit size={16} />
                          Сохранить изменения
                        </>
                      ) : (
                        <>
                          <UserPlus size={16} />
                          Назначить цену
                        </>
                      )}
                    </motion.button>
                  </div>
                </form>
              </div>

              {/* Modal footer */}
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
                <span>ID: {editingPrice ? editingPrice.id : "Новый"}</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function getMasterWord(count: number): string {
  const l = count % 10;
  const ll = count % 100;
  if (ll >= 11 && ll <= 19) return "мастеров";
  if (l === 1) return "мастер";
  if (l >= 2 && l <= 4) return "мастера";
  return "мастеров";
}