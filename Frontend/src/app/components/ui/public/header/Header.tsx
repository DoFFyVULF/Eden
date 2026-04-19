"use client";

import Link from "next/link";
import { routes } from "@/app/lib/routes";
import { useState, useEffect, useRef } from "react";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { href: routes.HOME, label: "Главная" },
  { href: routes.SERVICES, label: "Услуги" },
  { href: routes.APPOINTMENT, label: "Запись" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  return (
    <>
      <header
        className={`
          fixed top-0 inset-x-0 z-50
          transition-all duration-500
          ${
            scrolled
              ? "py-3 bg-[#080808]/90 backdrop-blur-xl border-b border-white/4"
              : "py-6 bg-transparent"
          }
        `}
      >
        <div className="container mx-auto px-6 max-w-7xl flex items-center justify-between">
          {/* ── Left nav (desktop) ── */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href={routes.SERVICES}
              className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#6B6560] hover:text-[#F0EBE3] transition-colors duration-200"
            >
              Услуги
            </Link>
          </nav>

          {/* ── Logo / Wordmark ── */}
          <Link
            href={routes.HOME}
            className="group absolute left-1/2 -translate-x-1/2"
          >
            <div className="relative">
              {/* Glow on hover */}
              <div className="absolute inset-0 bg-[#C8A97E]/15 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

              {/* Text logo instead of video */}
              <div className="relative overflow-hidden">
                <h1
                  className="text-2xl font-light tracking-[-0.02em] text-transparent transition-transform duration-500 group-hover:scale-105"
                  style={{
                    fontFamily: "var(--font-body, 'DM Sans', sans-serif)",
                    WebkitTextStroke: "1px rgba(240,235,227,0.9)",
                  }}
                >
                  ЭДЕН
                </h1>
                {/* Elegant underline on hover */}
                <div className="absolute bottom-0 left-0 w-0 h-px bg-[#C8A97E] group-hover:w-full transition-all duration-500 ease-out" />
              </div>
            </div>
          </Link>

          {/* ── Right nav (desktop) ── */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href={routes.APPOINTMENT}
              className="
                text-[11px] font-semibold tracking-[0.18em] uppercase
                px-4 py-2 rounded-full
                border border-[#C8A97E]/40 text-[#C8A97E]
                hover:bg-[#C8A97E] hover:text-[#1a1208] hover:border-[#C8A97E]
                transition-all duration-200
              "
            >
              Записаться
            </Link>
          </nav>

          {/* ── Burger (mobile) ── */}
          <button
            aria-label="Toggle menu"
            onClick={() => setMenuOpen((v) => !v)}
            className="md:hidden ml-auto text-[#6B6560] hover:text-[#F0EBE3] transition-colors p-1"
          >
            {menuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </header>

      {/* ── Mobile overlay menu ── */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#080808]/95 backdrop-blur-xl flex flex-col items-center justify-center gap-10"
          ref={menuRef}
        >
          {/* Mobile menu brand mark */}
          <div className="absolute top-8 left-1/2 -translate-x-1/2">
            <h2
              className="text-3xl font-light text-transparent"
              style={{
                fontFamily: "var(--font-display, Georgia, serif)",
                WebkitTextStroke: "1px rgba(240,235,227,0.6)",
              }}
            >
              ЭДЕН
            </h2>
          </div>

          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="text-3xl font-light tracking-[0.1em] text-[#F0EBE3] hover:text-[#C8A97E] transition-colors duration-200"
              style={{ fontFamily: "var(--font-display, Georgia, serif)" }}
            >
              {link.label}
            </Link>
          ))}

          {/* Close hint */}
          <button
            onClick={() => setMenuOpen(false)}
            className="absolute bottom-12 left-1/2 -translate-x-1/2 text-[10px] text-[#6B6560] uppercase tracking-[0.2em] hover:text-[#C8A97E] transition-colors"
          >
            Закрыть
          </button>
        </div>
      )}
    </>
  );
}
