"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import {
  CalendarDays,
  Users,
  Package,
  DollarSign,
  Clock,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ArrowUpRight,
  Activity,
  ChevronRight,
  Flame,
} from "lucide-react";
import { masterService } from "@/services/master/master.service";
import { appointmentService } from "@/services/appointment/appointment.service";
import { serviceService } from "@/services/service/service.service";
import { IAppointment } from "@/types/appointment.types";
import { ADMIN_ROUTES } from "@/app/lib/admin.routes";
import Link from "next/link";

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(v)
    .trim();

const formatNumber = (v: number) => new Intl.NumberFormat("ru-RU").format(v);

// ── Animated counter ────────────────────────────────────────────────────────
function AnimatedNumber({
  value,
  formatter = (v: number) => String(Math.round(v)),
}: {
  value: number;
  formatter?: (v: number) => string;
}) {
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { stiffness: 80, damping: 20 });
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    mv.set(value);
  }, [value]);
  useEffect(
    () => spring.on("change", (v) => setDisplay(formatter(v))),
    [spring],
  );

  return <span>{display}</span>;
}

// ── Stat card ───────────────────────────────────────────────────────────────
type ColorKey = "blue" | "emerald" | "amber" | "purple";

const COLOR_MAP: Record<
  ColorKey,
  {
    grad: string;
    glow: string;
    iconBg: string;
    badge: string;
    badgeText: string;
    textDark: string;
    textLight: string;
  }
> = {
  blue: {
    grad: "from-blue-500 to-indigo-600",
    glow: "shadow-blue-500/20",
    iconBg: "bg-blue-500/15",
    badge: "bg-blue-500/10 border-blue-400/20",
    badgeText: "text-blue-400",
    textDark: "text-blue-300",
    textLight: "text-blue-600",
  },
  emerald: {
    grad: "from-emerald-500 to-teal-600",
    glow: "shadow-emerald-500/20",
    iconBg: "bg-emerald-500/15",
    badge: "bg-emerald-500/10 border-emerald-400/20",
    badgeText: "text-emerald-400",
    textDark: "text-emerald-300",
    textLight: "text-emerald-600",
  },
  amber: {
    grad: "from-amber-500 to-orange-500",
    glow: "shadow-amber-500/20",
    iconBg: "bg-amber-500/15",
    badge: "bg-amber-500/10 border-amber-400/20",
    badgeText: "text-amber-400",
    textDark: "text-amber-300",
    textLight: "text-amber-600",
  },
  purple: {
    grad: "from-purple-500 to-pink-600",
    glow: "shadow-purple-500/20",
    iconBg: "bg-purple-500/15",
    badge: "bg-purple-500/10 border-purple-400/20",
    badgeText: "text-purple-400",
    textDark: "text-purple-300",
    textLight: "text-purple-600",
  },
};

function StatCard({
  isDark,
  icon,
  value,
  numericValue,
  label,
  sublabel,
  color,
  delay,
  trend,
}: {
  isDark: boolean;
  icon: React.ReactNode;
  value: string;
  numericValue?: number;
  label: string;
  sublabel: string;
  color: ColorKey;
  delay: number;
  trend?: number;
}) {
  const c = COLOR_MAP[color];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.4, ease: "easeOut" }}
      whileHover={{ y: -4, scale: 1.02 }}
      className={`relative rounded-2xl p-6 overflow-hidden transition-all duration-300 cursor-default group ${
        isDark
          ? `bg-white/[0.07] backdrop-blur-2xl border border-white/[0.1] shadow-lg hover:shadow-xl hover:bg-white/[0.09] ${c.glow}`
          : `bg-white border border-gray-200/70 shadow-sm hover:shadow-lg ${c.glow}`
      }`}
    >
      {/* Corner slash decoration — Red Bull style */}
      <div
        className={`absolute -top-6 -right-6 w-20 h-20 bg-gradient-to-br ${c.grad} opacity-[0.12] rotate-12 rounded-2xl group-hover:opacity-[0.18] transition-opacity duration-300`}
      />
      <div
        className={`absolute -bottom-4 -left-4 w-14 h-14 bg-gradient-to-br ${c.grad} opacity-[0.07] -rotate-12 rounded-xl`}
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-5">
          {/* Icon */}
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
              isDark ? c.iconBg : `bg-gradient-to-br ${c.grad}`
            } ${isDark ? c.badgeText : "text-white"} shadow-md`}
          >
            {icon}
          </div>

          {/* Trend badge */}
          {trend !== undefined && (
            <div
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${
                isDark
                  ? `${c.badge} ${c.badgeText}`
                  : `bg-gradient-to-r ${c.grad} text-white border-transparent shadow-sm`
              }`}
            >
              <TrendingUp size={11} />
              {trend > 0 ? `+${trend}%` : `${trend}%`}
            </div>
          )}
        </div>

        {/* Value */}
        <div
          className={`text-3xl font-black leading-none mb-2 tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}
        >
          {value}
        </div>

        <div
          className={`text-sm font-semibold mb-0.5 ${isDark ? "text-white/80" : "text-gray-700"}`}
        >
          {label}
        </div>
        <div
          className={`text-xs ${isDark ? "text-white/30" : "text-gray-400"}`}
        >
          {sublabel}
        </div>
      </div>
    </motion.div>
  );
}

// ── Status row ───────────────────────────────────────────────────────────────
function AppointmentRow({
  appointment,
  isDark,
}: {
  appointment: IAppointment;
  isDark: boolean;
}) {
  const formatTime = (s: string) =>
    new Date(s).toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const STATUS: Record<
    string,
    { dot: string; label: string; textDark: string; textLight: string }
  > = {
    Завершен: {
      dot: "bg-emerald-400",
      label: "Завершено",
      textDark: "text-emerald-400",
      textLight: "text-emerald-600",
    },
    Подтвержден: {
      dot: "bg-blue-400",
      label: "Подтверждено",
      textDark: "text-blue-400",
      textLight: "text-blue-600",
    },
    Отменен: {
      dot: "bg-rose-400",
      label: "Отменено",
      textDark: "text-rose-400",
      textLight: "text-rose-600",
    },
  };
  const st = STATUS[appointment.status] ?? {
    dot: "bg-amber-400",
    label: "Новая",
    textDark: "text-amber-400",
    textLight: "text-amber-600",
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ x: 4 }}
      className={`flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-200 group cursor-default ${
        isDark ? "hover:bg-white/[0.06]" : "hover:bg-gray-50/80"
      }`}
    >
      <div className="flex items-center gap-4">
        {/* Time block */}
        <div
          className={`w-16 text-center py-2 rounded-xl font-black text-sm leading-none ${
            isDark
              ? "bg-white/[0.07] text-white/90"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {formatTime(appointment.appointmentTime)}
        </div>

        <div>
          <div
            className={`font-semibold text-sm ${isDark ? "text-white/90" : "text-gray-800"}`}
          >
            {`${appointment.clientSurname ?? ""} ${appointment.clientName ?? ""}`.trim() ||
              "Без имени"}
          </div>
          <div
            className={`text-xs mt-0.5 ${isDark ? "text-white/35" : "text-gray-400"}`}
          >
            {appointment.service?.title ?? "Услуга не указана"}
          </div>
        </div>
      </div>

      <div
        className={`flex items-center gap-2 text-xs font-semibold ${isDark ? st.textDark : st.textLight}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
        {st.label}
        <ChevronRight
          size={12}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        />
      </div>
    </motion.div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [quickStats, setQuickStats] = useState({
    todayAppointments: 0,
    activeMasters: 0,
    totalServices: 0,
    todayRevenue: 0,
  });
  const [upcomingAppointments, setUpcomingAppointments] = useState<
    IAppointment[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [time, setTime] = useState(new Date());

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

  // Live clock
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const calculateTodayRevenue = async (): Promise<number> => {
    try {
      const s = new Date().toISOString().split("T")[0];
      const appts = await appointmentService.getByDate(s);
      return appts.reduce(
        (sum, a) =>
          a.status === "Завершен" && a.price ? sum + Number(a.price) : sum,
        0,
      );
    } catch {
      return 0;
    }
  };

  const loadQuickStats = async () => {
    setIsLoading(true);
    try {
      const s = new Date().toISOString().split("T")[0];
      const [todayC, mastersC, servicesData, revenue] = await Promise.all([
        appointmentService
          .getByDate(s)
          .then((a) => a.length)
          .catch(() => 0),
        masterService.getActiveMastersCount().catch(() => 0),
        serviceService
          .getAll()
          .then((s) => s.filter((x) => x.isActive !== false).length)
          .catch(() => 0),
        calculateTodayRevenue(),
      ]);
      setQuickStats({
        todayAppointments: todayC,
        activeMasters: mastersC,
        totalServices: servicesData,
        todayRevenue: revenue,
      });
    } catch {
      setQuickStats({
        todayAppointments: 0,
        activeMasters: 0,
        totalServices: 0,
        todayRevenue: 0,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadUpcoming = async () => {
    setLoadingAppointments(true);
    try {
      const s = new Date().toISOString().split("T")[0];
      const appts = await appointmentService.getByDate(s);
      const now = new Date();
      setUpcomingAppointments(
        appts
          .filter((a) => new Date(a.appointmentTime) >= now)
          .sort(
            (a, b) =>
              new Date(a.appointmentTime).getTime() -
              new Date(b.appointmentTime).getTime(),
          )
          .slice(0, 5),
      );
    } catch {
      setUpcomingAppointments([]);
    } finally {
      setLoadingAppointments(false);
    }
  };

  useEffect(() => {
    loadQuickStats();
    loadUpcoming();
    const id = setInterval(
      () => {
        loadQuickStats();
        loadUpcoming();
      },
      5 * 60 * 1000,
    );
    return () => clearInterval(id);
  }, []);

  const glassCls = isDark
    ? "bg-white/[0.07] backdrop-blur-2xl border border-white/[0.1] shadow-lg"
    : "bg-white border border-gray-200/70 shadow-sm";

  const dayName = time.toLocaleDateString("ru-RU", { weekday: "long" });
  const dateStr = time.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const timeStr = time.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      {/* Ambient orbs — dark only */}
      {isDark && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden -z-0">
          <div className="absolute -top-48 -right-48 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-48 -left-48 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-indigo-500/8 rounded-full blur-3xl" />
        </div>
      )}

      <div className="max-w-9xl mx-auto relative z-10 space-y-8">
        {/* ── HEADER ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            {/* Left — greeting */}
            <div>
              {/* Red Bull style: overline label */}
              <div className="flex items-center gap-2 mb-3">
                <div
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border ${
                    isDark
                      ? "bg-white/[0.07] border-white/[0.1] text-white/50"
                      : "bg-gray-100 border-gray-200 text-gray-400"
                  }`}
                >
                  <Activity size={11} />
                  Панель управления
                </div>
              </div>

              <h1
                className={`flex gap-3 flex-wrap text-4xl md:text-5xl lg:text-6xl font-black leading-none tracking-tight mb-3 ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                Добро
                <span
                  className={`${
                    isDark
                      ? "bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
                      : "bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                  }`}
                >
                  пожаловать
                </span>
              </h1>
              <p
                className={`text-base ${isDark ? "text-white/40" : "text-gray-400"}`}
              >
                Управляйте бизнесом — всё под контролем
              </p>
            </div>

            {/* Right — live clock card (Red Bull energy widget) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className={`rounded-2xl px-6 py-4 flex items-center gap-5 shrink-0 ${glassCls}`}
            >
              {/* Flame icon — energy vibe */}
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md ${
                  isDark
                    ? "bg-gradient-to-br from-orange-500 to-red-600 shadow-orange-500/30"
                    : "bg-gradient-to-br from-orange-400 to-red-500 shadow-orange-500/20"
                }`}
              >
                <Flame className="w-5 h-5 text-white" />
              </div>
              <div>
                <div
                  className={`text-2xl font-black leading-none tabular-nums ${isDark ? "text-white" : "text-gray-900"}`}
                >
                  {timeStr}
                </div>
                <div
                  className={`text-xs mt-1 capitalize ${isDark ? "text-white/35" : "text-gray-400"}`}
                >
                  {dayName}, {dateStr}
                </div>
              </div>

              {/* Refresh */}
              <motion.button
                whileHover={{ scale: 1.1, rotate: 180 }}
                whileTap={{ scale: 0.9 }}
                transition={{ rotate: { duration: 0.4 } }}
                onClick={() => {
                  loadQuickStats();
                  loadUpcoming();
                }}
                disabled={isLoading}
                className={`ml-2 w-9 h-9 rounded-xl flex items-center justify-center transition-colors disabled:opacity-40 ${
                  isDark
                    ? "bg-white/[0.07] text-white/50 hover:bg-white/[0.12] hover:text-white/80"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                <RefreshCw
                  size={15}
                  className={isLoading ? "animate-spin" : ""}
                />
              </motion.button>
            </motion.div>
          </div>
        </motion.div>

        {/* ── STAT CARDS ──────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2
                className={`text-lg font-black tracking-tight ${isDark ? "text-white/90" : "text-gray-900"}`}
              >
                Сегодня
              </h2>
              <p
                className={`text-xs ${isDark ? "text-white/30" : "text-gray-400"}`}
              >
                Ключевые показатели
              </p>
            </div>
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                isDark
                  ? "border-white/[0.08] text-white/30"
                  : "border-gray-200 text-gray-400"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              isDark={isDark}
              icon={<CalendarDays className="w-5 h-5" />}
              value={
                isLoading ? "—" : formatNumber(quickStats.todayAppointments)
              }
              numericValue={quickStats.todayAppointments}
              label="Записей сегодня"
              sublabel="Все статусы"
              color="blue"
              delay={0.1}
              trend={12}
            />
            <StatCard
              isDark={isDark}
              icon={<Users className="w-5 h-5" />}
              value={isLoading ? "—" : formatNumber(quickStats.activeMasters)}
              label="Активных мастеров"
              sublabel="В системе"
              color="emerald"
              delay={0.15}
              trend={0}
            />
            <StatCard
              isDark={isDark}
              icon={<Package className="w-5 h-5" />}
              value={isLoading ? "—" : formatNumber(quickStats.totalServices)}
              label="Услуг в каталоге"
              sublabel="Доступных"
              color="amber"
              delay={0.2}
              trend={5}
            />
            <StatCard
              isDark={isDark}
              icon={<DollarSign className="w-5 h-5" />}
              value={isLoading ? "—" : formatCurrency(quickStats.todayRevenue)}
              label="Выручка сегодня"
              sublabel="Завершённые записи"
              color="purple"
              delay={0.25}
              trend={8}
            />
          </div>
        </div>

        {/* ── UPCOMING + QUICK LINKS ─────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Upcoming appointments — 2/3 */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className={`lg:col-span-2 rounded-2xl overflow-hidden ${glassCls}`}
          >
            {/* Card header */}
            <div
              className={`px-6 py-4 flex items-center justify-between border-b ${
                isDark ? "border-white/[0.07]" : "border-gray-100"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-md ${
                    isDark
                      ? "bg-gradient-to-br from-indigo-500 to-purple-600 shadow-indigo-500/30"
                      : "bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-500/20"
                  }`}
                >
                  <Clock className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3
                    className={`font-black text-base ${isDark ? "text-white" : "text-gray-900"}`}
                  >
                    Ближайшие записи
                  </h3>
                  <p
                    className={`text-xs ${isDark ? "text-white/30" : "text-gray-400"}`}
                  >
                    На сегодня
                  </p>
                </div>
              </div>

              {loadingAppointments && (
                <div
                  className={`flex items-center gap-1.5 text-xs ${isDark ? "text-white/30" : "text-gray-400"}`}
                >
                  <RefreshCw size={12} className="animate-spin" />
                  Загрузка
                </div>
              )}
            </div>

            {/* List */}
            <div className="p-3">
              {loadingAppointments ? (
                <div className="space-y-2 p-1">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`h-14 rounded-xl animate-pulse ${isDark ? "bg-white/[0.05]" : "bg-gray-100"}`}
                    />
                  ))}
                </div>
              ) : upcomingAppointments.length > 0 ? (
                <div className="space-y-1">
                  {upcomingAppointments.map((a) => (
                    <AppointmentRow
                      key={a.id}
                      appointment={a}
                      isDark={isDark}
                    />
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <div
                    className={`w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center ${
                      isDark ? "bg-white/[0.05]" : "bg-gray-100"
                    }`}
                  >
                    <CalendarDays
                      size={24}
                      className={isDark ? "text-white/20" : "text-gray-300"}
                    />
                  </div>
                  <p
                    className={`font-semibold text-sm ${isDark ? "text-white/40" : "text-gray-400"}`}
                  >
                    Нет предстоящих записей
                  </p>
                  <p
                    className={`text-xs mt-1 ${isDark ? "text-white/20" : "text-gray-300"}`}
                  >
                    Все записи на сегодня завершены
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className={`px-4 pb-4`}>
              <Link
                href={ADMIN_ROUTES.APPOINTMENTS.LIST}
                className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold transition-all duration-200 group ${
                  isDark
                    ? "bg-white/[0.06] text-white/60 hover:bg-white/[0.1] hover:text-white/90 border border-white/[0.08]"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200/60"
                }`}
              >
                Все записи
                <ArrowUpRight
                  size={15}
                  className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                />
              </Link>
            </div>
          </motion.div>

          {/* Quick nav — 1/3 */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.42 }}
            className="space-y-3"
          >
            <p
              className={`text-xs font-bold uppercase tracking-widest px-1 ${isDark ? "text-white/25" : "text-gray-400"}`}
            >
              Быстрый переход
            </p>

            {[
              {
                label: "Новые записи",
                sub: "Требуют подтверждения",
                href: ADMIN_ROUTES.APPOINTMENTS.LIST,
                grad: "from-amber-500 to-orange-500",
                glow: "shadow-amber-500/20",
              },
              {
                label: "Сотрудники",
                sub: "Управление мастерами",
                href: ADMIN_ROUTES.MASTERS.LIST,
                grad: "from-emerald-500 to-teal-500",
                glow: "shadow-emerald-500/20",
              },
              {
                label: "Аналитика",
                sub: "Отчёты и статистика",
                href: ADMIN_ROUTES.ANALYTICS.DASHBOARD,
                grad: "from-purple-500 to-indigo-500",
                glow: "shadow-purple-500/20",
              },
              {
                label: "Расписание",
                sub: "График работы",
                href: ADMIN_ROUTES.SCHEDULE.OVERVIEW,
                grad: "from-blue-500 to-cyan-500",
                glow: "shadow-blue-500/20",
              },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.45 + i * 0.06 }}
              >
                <Link
                  href={item.href}
                  className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 group ${
                    isDark
                      ? `bg-white/[0.06] border border-white/[0.08] hover:bg-white/[0.1] hover:border-white/[0.14] shadow-md hover:shadow-lg ${item.glow}`
                      : `bg-white border border-gray-200/70 hover:border-gray-300 shadow-sm hover:shadow-md ${item.glow}`
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.grad} flex items-center justify-center shadow-md flex-shrink-0`}
                  >
                    <ArrowUpRight size={16} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div
                      className={`font-bold text-sm ${isDark ? "text-white/90" : "text-gray-800"}`}
                    >
                      {item.label}
                    </div>
                    <div
                      className={`text-xs mt-0.5 ${isDark ? "text-white/30" : "text-gray-400"}`}
                    >
                      {item.sub}
                    </div>
                  </div>
                  <ChevronRight
                    size={15}
                    className={`flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0.5 ${isDark ? "text-white/40" : "text-gray-400"}`}
                  />
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* ── FOOTER ──────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-6 border-t text-xs ${
            isDark
              ? "border-white/[0.06] text-white/20"
              : "border-gray-100 text-gray-300"
          }`}
        >
          <div className="flex flex-wrap items-center gap-4">
            <span>Обновлено: {timeStr}</span>
            <span>·</span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Система работает
            </span>
          </div>
          <span className="capitalize">
            {dayName}, {dateStr}
          </span>
        </motion.div>
      </div>
    </div>
  );
}
