"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  CalendarDays,
  Clock,
  TrendingUp,
  RefreshCw,
  ArrowUpRight,
  Activity,
  ChevronRight,
  Flame,
  CheckCircle2,
  DollarSign,
  BarChart3,
} from "lucide-react";
import { userService } from "@/services/user/user.service";
import { appointmentService } from "@/services/appointment/appointment.service";
import { masterScheduleService } from "@/services/schedule/schedule.service";
import { IUser } from "@/types/user.types";
import { AppointmentStatus } from "@/types/appointment.types";
import { MASTER_ROUTES } from "@/app/lib/master.routes";
import Link from "next/link";

const formatNumber = (v: number) => new Intl.NumberFormat("ru-RU").format(v);
const formatCurrency = (v: number) =>
  new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(v)
    .trim();

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
  }
> = {
  blue: {
    grad: "from-blue-500 to-indigo-600",
    glow: "shadow-blue-500/20",
    iconBg: "bg-blue-500/15",
    badge: "bg-blue-500/10 border-blue-400/20",
    badgeText: "text-blue-400",
  },
  emerald: {
    grad: "from-emerald-500 to-teal-600",
    glow: "shadow-emerald-500/20",
    iconBg: "bg-emerald-500/15",
    badge: "bg-emerald-500/10 border-emerald-400/20",
    badgeText: "text-emerald-400",
  },
  amber: {
    grad: "from-amber-500 to-orange-500",
    glow: "shadow-amber-500/20",
    iconBg: "bg-amber-500/15",
    badge: "bg-amber-500/10 border-amber-400/20",
    badgeText: "text-amber-400",
  },
  purple: {
    grad: "from-purple-500 to-pink-600",
    glow: "shadow-purple-500/20",
    iconBg: "bg-purple-500/15",
    badge: "bg-purple-500/10 border-purple-400/20",
    badgeText: "text-purple-400",
  },
};

function StatCard({
  isDark,
  icon,
  value,
  label,
  sublabel,
  color,
  delay,
  trend,
}: {
  isDark: boolean;
  icon: React.ReactNode;
  value: string;
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
      <div
        className={`absolute -top-6 -right-6 w-20 h-20 bg-gradient-to-br ${c.grad} opacity-[0.12] rotate-12 rounded-2xl group-hover:opacity-[0.18] transition-opacity duration-300`}
      />
      <div
        className={`absolute -bottom-4 -left-4 w-14 h-14 bg-gradient-to-br ${c.grad} opacity-[0.07] -rotate-12 rounded-xl`}
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-5">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
              isDark ? c.iconBg : `bg-gradient-to-br ${c.grad}`
            } ${isDark ? c.badgeText : "text-white"} shadow-md`}
          >
            {icon}
          </div>

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

// ── Appointment row ─────────────────────────────────────────────────────────
function AppointmentRow({
  appointment,
  isDark,
}: {
  appointment: any;
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

// ── Main page ────────────────────────────────────────────────────────────────
export default function MasterPage() {
  const [user, setUser] = useState<IUser | null>(null);
  const [todayAppointmentsList, setTodayAppointmentsList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [time, setTime] = useState(new Date());

  // Real data
  const [todayCount, setTodayCount] = useState(0);
  const [weekCount, setWeekCount] = useState(0);
  const [monthCount, setMonthCount] = useState(0);
  const [prevMonthCount, setPrevMonthCount] = useState(0);
  const [todayRevenue, setTodayRevenue] = useState(0);
  const [weekSlots, setWeekSlots] = useState(0); // total schedule slots this week
  const [weekBooked, setWeekBooked] = useState(0); // booked slots this week

  // Theme detection
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

  // Helpers
  const getWeekRange = () => {
    const now = new Date();
    const day = now.getDay();
    const mondayOffset = ((day + 6) % 7); // Monday = 0
    const monday = new Date(now);
    monday.setDate(now.getDate() - mondayOffset);
    monday.setHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    return { start: monday, end: sunday };
  };

  const getMonthRange = (date: Date) => {
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
    return { start, end };
  };

  const loadData = async () => {
    setIsLoading(true);
    setLoadingAppointments(true);
    try {
      const userRes = await userService.getMe();
      const userData = userRes.data;
      setUser(userData);

      if (userData.masterId) {
        const masterId = userData.masterId;
        const today = new Date().toISOString().split("T")[0];

        // Today appointments (all statuses via classic endpoint)
        const todayAppts = await appointmentService.getByDate(today, masterId);
        setTodayCount(todayAppts.length);
        setTodayAppointmentsList(
          todayAppts
            .sort(
              (a, b) =>
                new Date(a.appointmentTime).getTime() -
                new Date(b.appointmentTime).getTime(),
            )
            .slice(0, 5),
        );

        // Today revenue (completed only)
        const todayRev = todayAppts
          .filter((a) => a.status === AppointmentStatus.Завершен)
          .reduce((sum, a) => sum + (a.price || 0), 0);
        setTodayRevenue(todayRev);

        // Week data
        const { start: weekStart, end: weekEnd } = getWeekRange();
        const allAppts = await appointmentService.getAll();
        const masterAppts = allAppts.filter(
          (a) => a.master.id === masterId
        );
        const weekAppts = masterAppts.filter((a) => {
          const d = new Date(a.appointmentTime);
          return d >= weekStart && d <= weekEnd;
        });
        setWeekCount(weekAppts.length);

        // Current month
        const { start: monthStart, end: monthEnd } = getMonthRange(new Date());
        const monthAppts = masterAppts.filter((a) => {
          const d = new Date(a.appointmentTime);
          return d >= monthStart && d <= monthEnd;
        });
        setMonthCount(monthAppts.length);

        // Previous month
        const prevMonthDate = new Date();
        prevMonthDate.setMonth(prevMonthDate.getMonth() - 1);
        const { start: prevStart, end: prevEnd } = getMonthRange(prevMonthDate);
        const prevMonthAppts = masterAppts.filter((a) => {
          const d = new Date(a.appointmentTime);
          return d >= prevStart && d <= prevEnd;
        });
        setPrevMonthCount(prevMonthAppts.length);

        // Schedule: get weekly schedule slots
        try {
          const allSchedules = await masterScheduleService.getAll();
          const masterSchedules = allSchedules.filter(
            (s) => (s.masterId || s.master?.id) === masterId
          );
          // Count active weekly schedule days
          const activeDays = masterSchedules.filter(
            (s) => s.dayOfWeek !== null && s.dayOfWeek !== undefined
          );
          setWeekSlots(activeDays.length);

          // Booked = how many of those days have at least 1 appointment this week
          const bookedDays = new Set(
            weekAppts
              .filter((a) => {
                const dayIdx = (new Date(a.appointmentTime).getDay() + 6) % 7;
                return activeDays.some((s) => s.dayOfWeek === dayIdx);
              })
              .map((a) => new Date(a.appointmentTime).toDateString())
          );
          setWeekBooked(bookedDays.size);
        } catch {
          setWeekSlots(0);
          setWeekBooked(0);
        }
      }
    } catch (err) {
      console.error("Ошибка при загрузке данных:", err);
    } finally {
      setIsLoading(false);
      setLoadingAppointments(false);
    }
  };

  useEffect(() => {
    loadData();
    const id = setInterval(loadData, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  // Computed metrics
  const workload = useMemo(() => {
    if (weekSlots === 0) return 0;
    // Count unique days with appointments this week
    const uniqueDays = new Set(
      todayAppointmentsList.length > 0
        ? [new Date().toDateString()]
        : []
    );
    // Use weekBooked / weekSlots as ratio
    return Math.round((weekBooked / Math.max(weekSlots, 1)) * 100);
  }, [weekBooked, weekSlots, todayAppointmentsList]);

  const growth = useMemo(() => {
    if (prevMonthCount === 0) return 0;
    return Math.round(
      ((monthCount - prevMonthCount) / prevMonthCount) * 100
    );
  }, [monthCount, prevMonthCount]);

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
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border ${
                    isDark
                      ? "bg-white/[0.07] border-white/[0.1] text-white/50"
                      : "bg-gray-100 border-gray-200 text-gray-400"
                  }`}
                >
                  <Activity size={11} />
                  Панель мастера
                </div>
              </div>

              <h1
                className={`text-4xl md:text-5xl lg:text-6xl font-black leading-none tracking-tight mb-3 ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                Добро{" "}
                <span
                  className={`${
                    isDark
                      ? "bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
                      : "bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                  }`}
                >
                  пожаловать
                </span>
                {user?.login ? `, ${user.login}` : ""}
              </h1>
              <p
                className={`text-base ${isDark ? "text-white/40" : "text-gray-400"}`}
              >
                Вот обзор вашего рабочего дня — всё под контролем
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className={`rounded-2xl px-6 py-4 flex items-center gap-5 shrink-0 ${glassCls}`}
            >
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

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={loadData}
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
              value={isLoading ? "—" : formatNumber(todayCount)}
              label="Записей сегодня"
              sublabel="Все статусы"
              color="blue"
              delay={0.1}
            />
            <StatCard
              isDark={isDark}
              icon={<DollarSign className="w-5 h-5" />}
              value={isLoading ? "—" : formatCurrency(todayRevenue)}
              label="Выручка сегодня"
              sublabel="Завершённые записи"
              color="emerald"
              delay={0.15}
            />
            <StatCard
              isDark={isDark}
              icon={<BarChart3 className="w-5 h-5" />}
              value={isLoading ? "—" : `${workload}%`}
              label="Загруженность"
              sublabel="На этой неделе"
              color="amber"
              delay={0.2}
              trend={weekSlots > 0 ? Math.round((weekBooked / Math.max(weekSlots, 1)) * 10) : 0}
            />
            <StatCard
              isDark={isDark}
              icon={<TrendingUp className="w-5 h-5" />}
              value={isLoading ? "—" : `${growth > 0 ? "+" : ""}${growth}%`}
              label="Рост записей"
              sublabel="К прошлому месяцу"
              color="purple"
              delay={0.25}
              trend={growth}
            />
          </div>
        </div>

        {/* ── APPOINTMENTS + QUICK LINKS ─────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Today's appointments — 2/3 */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className={`lg:col-span-2 rounded-2xl overflow-hidden ${glassCls}`}
          >
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
                    Записи на сегодня
                  </h3>
                  <p
                    className={`text-xs ${isDark ? "text-white/30" : "text-gray-400"}`}
                  >
                    {todayCount > 0
                      ? `${todayCount} ${todayCount === 1 ? "запись" : todayCount < 5 ? "записи" : "записей"}`
                      : "Нет записей"}
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
              ) : todayAppointmentsList.length > 0 ? (
                <div className="space-y-1">
                  {todayAppointmentsList.map((a) => (
                    <AppointmentRow key={a.id} appointment={a} isDark={isDark} />
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
                    Свободный день — можно планировать дела
                  </p>
                </div>
              )}
            </div>

            <div className="px-4 pb-4">
              <Link
                href={MASTER_ROUTES.APPOINTMENTS}
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
                label: "Расписание",
                sub: "График работы",
                href: MASTER_ROUTES.SCHEDULE,
                grad: "from-blue-500 to-cyan-500",
                glow: "shadow-blue-500/20",
              },
              {
                label: "Мои записи",
                sub: "Управление записями",
                href: MASTER_ROUTES.APPOINTMENTS,
                grad: "from-emerald-500 to-teal-500",
                glow: "shadow-emerald-500/20",
              },
              {
                label: "Статистика",
                sub: "Отчёты и аналитика",
                href: MASTER_ROUTES.DASHBOARD,
                grad: "from-purple-500 to-indigo-500",
                glow: "shadow-purple-500/20",
              },
              {
                label: "Настройки",
                sub: "Профиль и параметры",
                href: MASTER_ROUTES.DASHBOARD,
                grad: "from-amber-500 to-orange-500",
                glow: "shadow-amber-500/20",
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
