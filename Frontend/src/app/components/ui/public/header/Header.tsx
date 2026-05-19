"use client";

import Link from "next/link";
import { routes } from "@/app/providers/routes";
import { useEffect, useRef, useState } from "react";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { usePathname } from "next/navigation";
import {
  AnimatePresence,
  motion,
  type Variants,
  useScroll,
  useTransform,
  useMotionValueEvent,
} from "framer-motion";

const NAV_LINKS = [
  { href: routes.HOME, label: "Главная", description: "Начало знакомства" },
  { href: routes.SERVICES, label: "Услуги", description: "Весь спектр услуг" },
  { href: routes.APPOINTMENT, label: "Запись", description: "Онлайн-запись" },
];

// ─── Анимации ───────────────────────────────────────────────

const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] },
  },
};

const panelVariants: Variants = {
  hidden: { opacity: 0, x: "100%" },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.35,
      ease: [0.22, 1, 0.36, 1],
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    x: "100%",
    transition: { duration: 0.25, ease: [0.4, 0, 1, 1] },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  },
};

const dividerVariants: Variants = {
  hidden: { scaleX: 0, originX: 0 },
  visible: {
    scaleX: 1,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0.2 },
  },
};

// ─── Компонент ──────────────────────────────────────────────

interface HeaderProps {
  hideOnScroll?: boolean;
}

export default function Header({ hideOnScroll = false }: HeaderProps) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrollDirection, setScrollDirection] = useState<"up" | "down">("up");
  const [hidden, setHidden] = useState(false);
  const [scrollableHeight, setScrollableHeight] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { scrollY } = useScroll();

  const headerBgOpacity = useTransform(scrollY, [0, 80, 200], [0, 0.7, 0.95]);
  const headerBlur = useTransform(scrollY, [0, 100], [6, 20]);
  const headerBorderOpacity = useTransform(scrollY, [0, 100], [0, 0.22]);
  const headerShadow = useTransform(
    scrollY,
    [0, 100],
    ["0 0 0 0 rgba(99,75,52,0)", "0 18px 40px -28px rgba(99,75,52,0.18)"],
  );

  useMotionValueEvent(scrollY, "change", (latest) => {
    const direction = latest > lastScrollY.current ? "down" : "up";

    if (direction !== scrollDirection) {
      setScrollDirection(direction);
    }

    if (hideOnScroll && direction === "down" && latest > 200) {
      setHidden(true);
    } else {
      setHidden(false);
    }

    setScrolled(latest > 12);
    lastScrollY.current = latest;
  });

  useEffect(() => {
    const calculateScrollableHeight = () => {
      if (typeof document !== "undefined" && typeof window !== "undefined") {
        const height = document.body.scrollHeight - window.innerHeight;
        setScrollableHeight(height > 0 ? height : 0);
      }
    };

    calculateScrollableHeight();
    window.addEventListener("resize", calculateScrollableHeight);
    return () =>
      window.removeEventListener("resize", calculateScrollableHeight);
  }, []);

  // Блокировка скролла + закрытие по Escape
  useEffect(() => {
    if (!menuOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // Закрытие по клику вне меню
  useEffect(() => {
    if (!menuOpen) return;

    const handler = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  return (
    <>
      {/* ═══════════════════════════════════════════════════════════ */}
      {/* HEADER                                                    */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <motion.header
        className="fixed inset-x-0 top-0 z-50 px-4 pt-4 md:px-6"
        animate={{
          y: hidden ? -120 : 0,
          opacity: 1,
        }}
        transition={{
          duration: 0.35,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        <motion.div
          className="mx-auto flex max-w-7xl items-center justify-between rounded-full border px-5 py-3 md:px-7"
          style={{
            backgroundColor: useTransform(
              headerBgOpacity,
              (v) => `rgba(252, 248, 242, ${v})`,
            ),
            backdropFilter: useTransform(headerBlur, (v) => `blur(${v}px)`),
            WebkitBackdropFilter: useTransform(
              headerBlur,
              (v) => `blur(${v}px)`,
            ),
            borderColor: useTransform(
              headerBorderOpacity,
              (v) => `rgba(171, 145, 117, ${v})`,
            ),
            boxShadow: headerShadow,
          }}
          animate={{
            y: scrolled ? 0 : 2,
            scale: scrolled ? 0.995 : 1,
          }}
          transition={{ duration: 0.24, ease: "easeOut" }}
        >
          {/* Десктопная навигация */}
          <nav className="relative hidden items-center gap-7 md:flex">
            {NAV_LINKS.slice(0, 2).map((link, i) => {
              const active = pathname === link.href;
              const fromCenter = i === 0 ? -1 : 1;

              return (
                <motion.div
                  key={link.href}
                  className="relative"
                  initial={{ opacity: 0, x: fromCenter * 30, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{
                    delay: 0.15 + i * 0.1,
                    duration: 0.45,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <Link
                    href={link.href}
                    className={`relative text-[11px] font-semibold uppercase tracking-[0.22em] transition-colors duration-200 ${
                      active
                        ? "text-[color:var(--public-text)]"
                        : "text-[rgba(104,88,72,0.82)] hover:text-[color:var(--public-text)]"
                    }`}
                  >
                    {link.label}
                  </Link>

                  {active && isMounted && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute -bottom-2 left-1/2 h-px w-8 -translate-x-1/2"
                      initial={false}
                      transition={{
                        layout: {
                          duration: 0.4,
                          ease: [0.22, 1, 0.36, 1],
                        },
                      }}
                    >
                      <motion.span
                        className="absolute inset-0 rounded-full bg-[rgba(150,117,84,0.58)]"
                        initial={{ scaleX: 0.9, opacity: 0 }}
                        animate={{ scaleX: 1, opacity: 1 }}
                        transition={{
                          type: "spring",
                          stiffness: 420,
                          damping: 30,
                          mass: 0.7,
                        }}
                      />
                      <motion.span
                        className="absolute inset-0 rounded-full bg-[rgba(170,135,96,0.25)] blur-[3px]"
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1.3 }}
                        transition={{
                          delay: 0.03,
                          duration: 0.35,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                      />
                      <motion.span
                        className="absolute inset-0 rounded-full bg-[rgba(150,117,84,0.15)]"
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.5, 0, 0.5],
                        }}
                        transition={{
                          duration: 2.4,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </nav>

          {/* Логотип */}
          <motion.div
            className="md:absolute md:left-1/2 md:-translate-x-1/2"
            initial={{ opacity: 0, scale: 0.7, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{
              delay: 0.05,
              duration: 0.5,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <Link href={routes.HOME} className="group relative block">
              <motion.span
                className="block text-3xl leading-none tracking-[0.18em] text-[color:var(--public-text)] md:text-[2.15rem]"
                style={{ fontFamily: "var(--font-public-display), serif" }}
                whileHover={{ scale: 1.025 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.18 }}
              >
                ЭДЕН
              </motion.span>
              <motion.span
                className="absolute -bottom-1 left-1/2 h-px bg-[rgba(150,117,84,0.45)]"
                initial={{ width: 0, x: "-50%" }}
                whileHover={{ width: "60%", x: "-50%" }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              />
            </Link>
          </motion.div>

          {/* Кнопка записи (десктоп) */}
          <motion.div
            className="hidden md:block"
            initial={{ opacity: 0, x: 30, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{
              delay: 0.25,
              duration: 0.45,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <Link
              href={routes.APPOINTMENT}
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-[rgba(156,123,90,0.2)] bg-[rgba(255,251,246,0.76)] px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--public-text)] shadow-[0_12px_24px_-22px_rgba(99,75,52,0.2)] transition-all duration-200 hover:border-[rgba(156,123,90,0.34)] hover:bg-[rgba(248,238,228,0.92)]"
            >
              <motion.span
                className="absolute inset-0 bg-[rgba(170,135,96,0.08)]"
                initial={{ x: "-100%" }}
                whileHover={{ x: "100%" }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              />
              <span className="relative z-10">Записаться</span>
            </Link>
          </motion.div>

          {/* 📱 Кнопка мобильного меню */}
          <motion.button
            aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            whileTap={{ scale: 0.92 }}
            className="relative ml-auto flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(171,145,117,0.28)] bg-[rgba(255,250,244,0.78)] text-[color:var(--public-text)] shadow-[0_10px_22px_-18px_rgba(99,75,52,0.18)] md:hidden"
          >
            <AnimatePresence mode="wait">
              {menuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="h-4 w-4" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="h-4 w-4" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </motion.div>
      </motion.header>

      {/* Индикатор прогресса скролла */}
      <motion.div
        className="fixed left-0 top-0 z-[60] h-[2px] origin-left bg-[rgba(170,135,96,0.6)]"
        style={{
          scaleX: useTransform(scrollY, [0, scrollableHeight || 1000], [0, 1]),
        }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
      />

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* 📱 МОБИЛЬНОЕ МЕНЮ — ПОЛНЫЙ ЭКРАН                            */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Оверлей */}
            <motion.div
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed inset-0 z-40 bg-[rgba(45,35,24,0.35)] backdrop-blur-sm md:hidden"
              onClick={() => setMenuOpen(false)}
            />

            {/* Панель */}
            <motion.div
              ref={menuRef}
              variants={panelVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[360px] flex-col bg-[linear-gradient(165deg,rgba(252,248,242,0.98)_0%,rgba(245,236,225,0.98)_50%,rgba(238,228,216,0.97)_100%)] shadow-[-20px_0_60px_-20px_rgba(60,45,30,0.35)] md:hidden"
            >
              {/* Шапка меню */}
              <motion.div
                variants={itemVariants}
                className="flex items-center justify-between px-6 pt-6"
              >
                <div>
                  <p
                    className="text-2xl tracking-[0.18em] text-[color:var(--public-text)]"
                    style={{ fontFamily: "var(--font-public-display), serif" }}
                  >
                    ЭДЕН
                  </p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-[rgba(104,88,72,0.6)]">
                    Меню
                  </p>
                </div>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setMenuOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(171,145,117,0.25)] bg-[rgba(255,250,244,0.8)] text-[color:var(--public-text)]"
                >
                  <X className="h-4 w-4" />
                </motion.button>
              </motion.div>

              {/* Разделитель */}
              <motion.div
                variants={dividerVariants}
                className="mx-6 mt-6 h-px bg-[rgba(171,145,117,0.2)]"
              />

              {/* Навигация */}
              <nav className="mt-8 flex-1 px-6">
                <motion.p
                  variants={itemVariants}
                  className="mb-4 text-[10px] font-semibold uppercase tracking-[0.24em] text-[rgba(104,88,72,0.5)]"
                >
                  Навигация
                </motion.p>
                <div className="space-y-1">
                  {NAV_LINKS.map((link, i) => {
                    const active = pathname === link.href;
                    return (
                      <motion.div
                        key={link.href}
                        variants={itemVariants}
                        custom={i}
                      >
                        <Link
                          href={link.href}
                          onClick={() => setMenuOpen(false)}
                          className={`group flex items-center justify-between rounded-2xl px-4 py-4 transition-all duration-300 ${
                            active
                              ? "bg-[rgba(236,225,211,0.7)] text-[color:var(--public-text)] shadow-[inset_0_0_0_1px_rgba(165,132,98,0.12)]"
                              : "text-[rgba(104,88,72,0.85)] hover:bg-[rgba(239,230,219,0.5)] hover:text-[color:var(--public-text)]"
                          }`}
                        >
                          <div className="flex flex-col">
                            <span className="text-[15px] font-medium tracking-wide">
                              {link.label}
                            </span>
                            <span className="mt-0.5 text-[11px] text-[rgba(104,88,72,0.5)]">
                              {link.description}
                            </span>
                          </div>
                          <motion.div
                            className={`flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-300 ${
                              active
                                ? "border-[rgba(150,117,84,0.3)] bg-[rgba(150,117,84,0.1)] text-[rgba(104,88,72,0.8)]"
                                : "border-[rgba(171,145,117,0.15)] text-[rgba(104,88,72,0.4)] group-hover:border-[rgba(150,117,84,0.25)] group-hover:text-[rgba(104,88,72,0.7)]"
                            }`}
                            whileHover={{ x: 2, y: -2 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          </motion.div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              </nav>

              {/* Разделитель */}
              <motion.div
                variants={dividerVariants}
                className="mx-6 h-px bg-[rgba(171,145,117,0.2)]"
              />

              {/* Контакты в меню */}
              <motion.div variants={itemVariants} className="px-6 py-6">
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-[rgba(104,88,72,0.5)]">
                  Контакты
                </p>
                <a
                  href="tel:+73421234567"
                  className="block text-lg font-medium text-[color:var(--public-text)] transition-colors hover:text-[color:var(--public-accent-strong)]"
                >
                  +7 (342) 123-45-67
                </a>
                <p className="mt-1 text-xs text-[rgba(104,88,72,0.6)]">
                  Ежедневно 9:00 – 20:00
                </p>
              </motion.div>

              {/* Кнопка CTA */}
              <motion.div variants={itemVariants} className="px-6 pb-8">
                <Link
                  href={routes.APPOINTMENT}
                  onClick={() => setMenuOpen(false)}
                  className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-2xl border border-[rgba(156,123,90,0.2)] bg-[rgba(255,251,246,0.9)] px-6 py-4 text-center text-sm font-semibold tracking-wide text-[color:var(--public-text)] shadow-[0_12px_30px_-20px_rgba(99,75,52,0.25)] transition-all duration-300 hover:border-[rgba(156,123,90,0.35)] hover:bg-[rgba(248,238,228,0.95)]"
                >
                  <motion.span
                    className="absolute inset-0 bg-[rgba(170,135,96,0.06)]"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  />
                  <span className="relative z-10">Онлайн-запись</span>
                  <ArrowUpRight className="relative z-10 h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}