'use client'
import Link from "next/link";
import { routes } from "@/app/providers/routes";
import { Instagram, Facebook, Twitter, ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";

export default function Footer() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative bg-gradient-to-b from-[#080808] to-[#030303]">
      {/* Decorative top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C8A97E]/30 to-transparent" />
      
      {/* Main footer content */}
      <div className="container mx-auto px-4 max-w-7xl pt-24 pb-12">
        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 gap-y-16 mb-20">
          
          {/* Brand Section */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <h2 
                className="text-7xl lg:text-8xl font-light tracking-tighter text-transparent"
                style={{
                  fontFamily: "var(--font-display, Georgia, serif)",
                  WebkitTextStroke: "1px rgba(240,235,227,0.8)",
                }}
              >
                ЭДЕН
              </h2>
              <p className="text-[#6B6560] text-sm leading-relaxed max-w-sm">
                Пространство красоты нового поколения. С 2018 года создаём образы, 
                которые вдохновляют и преображают.
              </p>
            </div>
            
            {/* Social Links */}
            <div className="flex gap-3">
              {[
                { icon: Instagram, href: "#", label: "Instagram" },
                { icon: Facebook, href: "#", label: "Facebook" },
                { icon: Twitter, href: "#", label: "Twitter" },
              ].map(({ icon: Icon, href, label }) => (
                <Link
                  key={label}
                  href={href}
                  className="group w-11 h-11 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:border-[#C8A97E]/40 hover:bg-[#C8A97E]/10 transition-all duration-300"
                  aria-label={label}
                >
                  <Icon className="w-4 h-4 text-[#6B6560] group-hover:text-[#C8A97E] transition-colors" />
                </Link>
              ))}
            </div>
          </div>

          {/* Navigation Links */}
          <div className="lg:col-span-3">
            <h3 className="text-[10px] text-[#6B6560] uppercase tracking-[0.25em] mb-6 font-semibold">
              Навигация
            </h3>
            <ul className="space-y-4">
              {[
                { name: "Главная", href: routes.HOME },
                { name: "Услуги", href: routes.SERVICES },
                { name: "Мастера", href: routes.APPOINTMENT },
                { name: "Блог", href: "#" },
                { name: "Контакты", href: "#contacts" },
              ].map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-[#6B6560] text-sm hover:text-[#C8A97E] transition-colors duration-200 group inline-flex items-center gap-2"
                  >
                    <span className="w-0 group-hover:w-4 h-px bg-[#C8A97E] transition-all duration-300" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="lg:col-span-4">
            <h3 className="text-[10px] text-[#6B6560] uppercase tracking-[0.25em] mb-6 font-semibold">
              Контакты
            </h3>
            <address className="not-italic space-y-6">
              <div className="space-y-1">
                <p className="text-[#6B6560] text-sm">Адрес</p>
                <p className="text-[#F0EBE3] text-base leading-relaxed">
                  г. Пермь, ул. Коронита, 15
                  <br />
                  <span className="text-[#6B6560] text-xs">Вход со двора, этаж 1</span>
                </p>
              </div>
              
              <div className="space-y-1">
                <p className="text-[#6B6560] text-sm">Телефон</p>
                <a
                  href="tel:+73421234567"
                  className="text-[#F0EBE3] text-xl font-light hover:text-[#C8A97E] transition-colors block"
                  style={{ fontFamily: "var(--font-display, Georgia, serif)" }}
                >
                  +7 (342) 123-45-67
                </a>
                <p className="text-[#6B6560] text-xs">WhatsApp / Telegram</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-[#6B6560] text-sm">Email</p>
                <a
                  href="mailto:info@eden-salon.ru"
                  className="text-[#F0EBE3] text-sm hover:text-[#C8A97E] transition-colors"
                >
                  info@eden-salon.ru
                </a>
              </div>
            </address>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-12 border-t border-white/5 gap-6">
          <p className="text-[#3D3A38] text-xs">
            © {new Date().getFullYear()} Салон красоты «Эден». Все права защищены.
          </p>
          
          <div className="flex gap-8">
            <Link
              href="#"
              className="text-[#3D3A38] text-xs hover:text-[#6B6560] transition-colors"
            >
              Политика конфиденциальности
            </Link>
            <Link
              href="#"
              className="text-[#3D3A38] text-xs hover:text-[#6B6560] transition-colors"
            >
              Публичная оферта
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll to top button */}
      <button
        onClick={scrollToTop}
        className={`
          fixed bottom-8 right-8 z-50
          w-12 h-12 rounded-full
          bg-[#C8A97E]/10 backdrop-blur-sm
          border border-[#C8A97E]/30
          flex items-center justify-center
          hover:bg-[#C8A97E]/20
          transition-all duration-300
          hover:scale-110
          ${showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}
        `}
        aria-label="Наверх"
      >
        <ArrowUp className="w-4 h-4 text-[#C8A97E]" />
      </button>

      {/* Decorative gradient blur */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-px bg-gradient-to-r from-transparent via-[#C8A97E]/20 to-transparent" />
    </footer>
  );
}