"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, ChevronRight, Eye, UserRound } from "lucide-react";
import { useAppointmentStream } from "@/hooks/useAppointmentStream";
import { AppointmentStatus, IAppointment } from "@/types/appointment.types";
import { appointmentService } from "@/services/appointment/appointment.service";
import AppointmentConfirmWindow from "@/app/(admin)/administration/appointments/appointmentsConfirWnd";
import { useNotificationSound } from "@/hooks/useNotificationSound";

type NotificationItem = {
  toastId: number;
  appointment: IAppointment;
};

type ModalAppointment = {
  id: string;
  clientName: string;
  service: string;
  time: string;
  price: string;
  master: string;
  status: string;
  date: string;
  duration: number;
  rawDateTime: string;
  clientPhone?: string;
};

type AdminAppointmentNotificationsContextValue = {
  latestAppointment: IAppointment | null;
  latestEventKey: string | null;
};

const AdminAppointmentNotificationsContext =
  createContext<AdminAppointmentNotificationsContextValue | null>(null);

function useIsDarkTheme() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const syncTheme = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };

    syncTheme();

    const observer = new MutationObserver(syncTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  return isDark;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function toWindowItem(appointment: IAppointment): ModalAppointment {
  return {
    id: appointment.id.toString(),
    clientName: `${appointment.clientSurname} ${appointment.clientName}`,
    service: appointment.service.title,
    time: formatTime(appointment.appointmentTime),
    price: `${Number(appointment.price).toLocaleString("ru-RU")} ₽`,
    master: `${appointment.master.surname} ${appointment.master.name}`,
    status: appointment.status,
    date: formatDate(appointment.appointmentTime),
    duration: appointment.service.duration,
    rawDateTime: appointment.appointmentTime,
    clientPhone: appointment.clientPhone,
  };
}

function CompactNotification({
  count,
  onOpen,
}: {
  count: number;
  onOpen: () => void;
}) {
  const isDark = useIsDarkTheme();

  const shellClassName = isDark
    ? "border-white/[0.1] bg-white/[0.07] text-white shadow-[0_4px_24px_rgba(0,0,0,0.2)]"
    : "border-gray-200/80 bg-white text-gray-900 shadow-sm";
  const hoverShellClassName = isDark
    ? "group-hover:bg-white/[0.1] group-hover:border-white/[0.16]"
    : "group-hover:bg-gray-50 group-hover:border-gray-300/80";
  const avatarClassName = isDark
    ? "bg-white/[0.08] text-white ring-1 ring-white/10"
    : "bg-gray-100 text-gray-700 ring-1 ring-gray-200";
  const iconClassName = isDark ? "text-emerald-300" : "text-emerald-600";
  const primaryTextClassName = isDark ? "text-white" : "text-gray-900";
  const secondaryTextClassName = isDark ? "text-white/45" : "text-gray-500";
  const badgeClassName = isDark
    ? "bg-emerald-500 text-white shadow-emerald-500/25"
    : "bg-emerald-600 text-white shadow-emerald-500/20";

  return (
    <motion.button
      type="button"
      onClick={onOpen}
      initial={{ opacity: 0, y: -16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.96 }}
      whileTap={{ scale: 0.985 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className={`group pointer-events-auto flex h-12 items-center gap-2 overflow-hidden rounded-full border px-2.5 pr-3 text-left transition-all duration-300 ${shellClassName} ${hoverShellClassName}`}
    >
      <div className="relative shrink-0">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full ${avatarClassName}`}
        >
          <UserRound size={14} />
        </div>
        <div
          className={`absolute -right-1 -top-1 flex min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-bold leading-none shadow-lg ${badgeClassName}`}
        >
          {count}
        </div>
      </div>

      <div className="min-w-0">
        <div className="relative h-[18px] min-w-[164px] overflow-hidden sm:min-w-[186px]">
          <span
            className={`absolute left-0 top-0 flex items-center gap-1.5 text-sm font-semibold transition-all duration-300 group-hover:-translate-y-6 group-hover:opacity-0 ${primaryTextClassName}`}
          >
            <Bell size={14} className={iconClassName} />
            Новая запись
          </span>

          <span
            className={`absolute left-0 top-0 flex items-center gap-1.5 text-sm font-semibold opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 ${primaryTextClassName} translate-y-6`}
          >
            <Eye size={14} className={iconClassName} />
            Посмотреть подробнее
          </span>
        </div>

        <div
          className={`mt-0.5 max-w-[188px] truncate text-[11px] ${secondaryTextClassName}`}
        >
          Требует внимания администратора
        </div>
      </div>

      <ChevronRight
        size={16}
        className={`shrink-0 transition-all duration-300 group-hover:translate-x-0.5 ${secondaryTextClassName}`}
      />
    </motion.button>
  );
}

function NotificationRail({
  pendingAppointments,
  onOpen,
}: {
  pendingAppointments: IAppointment[];
  onOpen: () => void;
}) {
  const isDark = useIsDarkTheme();

  if (!pendingAppointments.length) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed right-4 top-20 z-[140] flex w-auto flex-col gap-3 sm:right-6 sm:top-20 lg:top-24">
      <div
        className={`pointer-events-none absolute inset-0 -z-10 rounded-full blur-2xl ${
          isDark ? "bg-emerald-400/10" : "bg-emerald-500/10"
        }`}
      />

      <AnimatePresence initial={false}>
        <CompactNotification
          key="new-appointments-pill"
          count={pendingAppointments.length}
          onOpen={onOpen}
        />
      </AnimatePresence>
    </div>
  );
}

export function AdminAppointmentNotificationsProvider({
  children,
  enabled,
}: {
  children: React.ReactNode;
  enabled: boolean;
}) {
  const [pendingAppointments, setPendingAppointments] = useState<
    IAppointment[]
  >([]);
  const [latestAppointment, setLatestAppointment] =
    useState<IAppointment | null>(null);
  const [latestEventKey, setLatestEventKey] = useState<string | null>(null);
  const [isNewAppointmentsOpen, setIsNewAppointmentsOpen] = useState(false);

  const {playSound} = useNotificationSound(enabled);

  const removePendingAppointment = (appointmentId: number) => {
    setPendingAppointments((prev) =>
      prev.filter((appointment) => appointment.id !== appointmentId),
    );
  };

  const handleConfirm = async (id: string) => {
    await appointmentService.update(Number(id), {
      status: AppointmentStatus.Подтвержден,
    });
    removePendingAppointment(Number(id));
  };

  const handleCancel = async (id: string) => {
    await appointmentService.update(Number(id), {
      status: AppointmentStatus.Отменен,
    });
    removePendingAppointment(Number(id));
  };

  useAppointmentStream((appointment) => {
    const eventKey = `${appointment.id}-${appointment.createdAt ?? appointment.appointmentTime}`;
    setLatestAppointment(appointment);
    setLatestEventKey(eventKey);

    setPendingAppointments((prev) => {
      const withoutDuplicates = prev.filter(
        (item) => item.id !== appointment.id,
      );
      return [appointment, ...withoutDuplicates].slice(0, 12);
    });
    playSound();
  }, enabled);

  const value = useMemo(
    () => ({
      latestAppointment,
      latestEventKey,
    }),
    [latestAppointment, latestEventKey],
  );

  return (
    <AdminAppointmentNotificationsContext.Provider value={value}>
      {children}

      <NotificationRail
        pendingAppointments={pendingAppointments}
        onOpen={() => setIsNewAppointmentsOpen(true)}
      />

      <AppointmentConfirmWindow
        title="Новые записи"
        isOpen={isNewAppointmentsOpen}
        onClose={() => setIsNewAppointmentsOpen(false)}
        pendingAppointments={pendingAppointments.map(toWindowItem)}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        windowType="new"
      />
    </AdminAppointmentNotificationsContext.Provider>
  );
}

export function useAdminAppointmentNotifications() {
  const context = useContext(AdminAppointmentNotificationsContext);

  if (!context) {
    throw new Error(
      "useAdminAppointmentNotifications must be used within AdminAppointmentNotificationsProvider",
    );
  }

  return context;
}
