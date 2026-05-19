"use client";

import Link from "next/link";
import { routes } from "@/app/providers/routes";
import LegalDocumentModal from "@/app/components/ui/public/appointment/LegalDocumentModal";
import {
  privacyPolicySections,
  publicOfferSections,
} from "@/app/(public)/appointment/legalDocuments";
import { ArrowUp, Instagram, Phone, Send } from "lucide-react";
import { useEffect, useState } from "react";

export default function Footer() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 500);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
     <footer className="relative overflow-hidden border-t border-[color:var(--public-border)]">

       <div className="container mx-auto max-w-7xl px-4 pb-10 pt-20">
        <div className="grid gap-14 lg:grid-cols-[1.3fr_0.8fr_1fr]">
          <div>
            <p
              className="text-5xl leading-none tracking-[0.14em] text-[color:var(--public-text)] md:text-7xl"
              style={{ fontFamily: "var(--font-public-display), serif" }}
            >
              ЭДЕН
            </p>
            <p className="mt-5 max-w-md text-sm leading-7 text-[color:var(--public-text-soft)]">
              Пространство тихой роскоши, в котором красота ощущается как забота.
              Без перегруза, без суеты, с вниманием к человеку и времени.
            </p>

            <div className="mt-7 flex gap-3">
              {[
                { href: "#", label: "Instagram", icon: Instagram },
                { href: "tel:+73421234567", label: "Телефон", icon: Phone },
                { href: "#", label: "Telegram", icon: Send },
              ].map(({ href, label, icon: Icon }) => (
                <Link
                  key={label}
                  href={href}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--public-border)] bg-[rgba(255,252,247,0.72)] text-[color:var(--public-text-soft)] hover:border-[color:var(--public-border-strong)] hover:text-[color:var(--public-text)]"
                  aria-label={label}
                >
                  <Icon className="h-4 w-4" />
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[color:var(--public-text-faint)]">
              Навигация
            </h3>
            <div className="mt-6 space-y-3">
              {[
                { href: routes.HOME, label: "Главная" },
                { href: routes.SERVICES, label: "Услуги" },
                { href: routes.APPOINTMENT, label: "Онлайн-запись" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block text-sm text-[color:var(--public-text-soft)] hover:text-[color:var(--public-text)]"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[color:var(--public-text-faint)]">
              Контакты
            </h3>
            <div className="mt-6 space-y-5 text-sm leading-7 text-[color:var(--public-text-soft)]">
              <div>
                <p className="text-[color:var(--public-text)]">г. Пермь, ул. Коронита, 15</p>
                <p>Вход со двора, этаж 1</p>
              </div>
              <div>
                <a href="tel:+73421234567" className="text-lg text-[color:var(--public-text)] hover:text-[color:var(--public-accent-strong)]">
                  +7 (342) 123-45-67
                </a>
                <p>Ежедневно с 9:00 до 20:00</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-[color:var(--public-border)] pt-6 text-xs text-[color:var(--public-text-faint)] md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Салон красоты «Эден».</p>
          <div className="flex gap-6">
            <button
              type="button"
              onClick={() => setIsPrivacyModalOpen(true)}
              className="hover:text-[color:var(--public-text-soft)]"
            >
              Политика конфиденциальности
            </button>
            <button
              type="button"
              onClick={() => setIsOfferModalOpen(true)}
              className="hover:text-[color:var(--public-text-soft)]"
            >
              Публичная оферта
            </button>
          </div>
        </div>
      </div>

      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={`fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-[color:var(--public-border-strong)] bg-[rgba(253,249,243,0.9)] text-[color:var(--public-text)] shadow-[var(--public-shadow-soft)] ${
          showScrollTop ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"
        }`}
        aria-label="Наверх"
      >
        <ArrowUp className="h-4 w-4" />
      </button>

      <LegalDocumentModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
        title="Политика конфиденциальности"
        subtitle="Документ описывает, какие персональные данные собираются при онлайн-записи, зачем они нужны и как пользователь может управлять своими правами."
        effectiveDate="14 мая 2026"
        sections={privacyPolicySections}
      />

      <LegalDocumentModal
        isOpen={isOfferModalOpen}
        onClose={() => setIsOfferModalOpen(false)}
        title="Публичная оферта"
        subtitle="Документ фиксирует условия онлайн-записи, общие правила оказания услуг и базовые обязанности исполнителя и клиента."
        effectiveDate="14 мая 2026"
        sections={publicOfferSections}
      />
    </footer>
  );
}
