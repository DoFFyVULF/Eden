"use client";

import Link from "next/link";
import { routes } from "./providers/routes";
import Header from "./components/ui/public/header/Header";
import Footer from "./components/ui/public/footer/Footer";
import Masonry from "./animations/Masonry/Masonry";
import { MapPin, Clock, Phone, MoveRight } from "lucide-react";

const items = [
  {
    id: "1",
    img: "https://i.pinimg.com/1200x/0a/04/80/0a04807bed07b00f68234d274807f2a5.jpg",
    width: 300,
    height: 400,
    title: "RedBull",
    description: "WW",
  },
  {
    id: "2",
    img: "https://i.pinimg.com/avif/736x/68/65/bc/6865bc1440bcf686458928bea8c05029.avf",
    width: 400,
    height: 400,
  },
  {
    id: "3",
    img: "https://i.pinimg.com/736x/05/93/19/059319aca81c993deb5401473545f30f.jpg",
    height: 600,
  },
  {
    id: "4",
    img: "https://i.pinimg.com/736x/33/98/da/3398daa2dcfa867477698c0d22138db1.jpg",
    height: 500,
  },
  {
    id: "5",
    img: "https://i.pinimg.com/736x/b0/07/df/b007df8f83f7f0cd1cac5ace06d1bd2e.jpg",
    height: 400,
  },
  {
    id: "6",
    img: "https://i.pinimg.com/736x/33/a0/30/33a030bc2fc586b14fa8eac78f97f3d4.jpg",
    height: 500,
  },
  {
    id: "7",
    img: "https://i.pinimg.com/736x/34/57/c3/3457c353f17301ca167f440bdf4026d7.jpg",
    height: 600,
  },
  {
    id: "8",
    img: "https://i.pinimg.com/736x/f4/a5/12/f4a5124d7a327b7d8f6453483a1ca613.jpg",
    height: 400,
  },
  {
    id: "9",
    img: "https://i.pinimg.com/1200x/1e/b1/cb/1eb1cb6eff2b3b99f716d6a63f39ea57.jpg",
    height: 700,
  },
];

export default function Home() {
  return (
    <div
      className="min-h-screen bg-[#080808] text-[#F0EBE3] overflow-x-hidden selection:bg-[#C8A97E]/30"
      style={{ fontFamily: "var(--font-body, 'DM Sans', sans-serif)" }}
    >
      {/* ── Ambient background ── */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[80vw] h-[80vw] max-w-[900px] max-h-[900px] bg-[#C8A97E]/4 rounded-full blur-[200px]" />
      </div>

      <Header />

      {/* HERO */}
      <section className="relative flex flex-col items-center justify-center min-h-screen px-4 text-center pt-20">
        <p className="text-[10px] text-[#6B6560] uppercase tracking-[0.3em] mb-8 animate-fade-in">
          Салон красоты · Пермь
        </p>

        <h1
          className="text-[22vw] sm:text-[18vw] lg:text-[14vw] font-light leading-[0.88] tracking-[-0.02em] text-transparent"
          style={{
            fontFamily: "var(--font-body, 'DM Sans', sans-serif)",
            WebkitTextStroke: "1px rgba(240,235,227,0.9)",
          }}
        >
          ЭДЕН
        </h1>

        <div className="mt-10 flex items-center gap-6 sm:gap-10 text-[#6B6560]">
          {["Красота", "Ухоженность", "Преображение"].map((word, i) => (
            <span
              key={word}
              className="text-[11px] uppercase tracking-[0.2em] font-medium"
              style={{ animationDelay: `${i * 120}ms` }}
            >
              {word}
            </span>
          ))}
        </div>

        <div className="mt-12 flex flex-col sm:flex-row items-center gap-4">
          <Link
            href={routes.APPOINTMENT}
            className="px-8 py-3.5 rounded-full text-sm font-semibold tracking-wide bg-[#C8A97E] text-[#1a1208] hover:bg-[#d4b88e] transition-all duration-200 shadow-[0_4px_30px_rgba(200,169,126,0.35)]"
          >
            Записаться онлайн
          </Link>
          <Link
            href={routes.SERVICES}
            className="px-8 py-3.5 rounded-full text-sm font-semibold tracking-wide border border-white/10 text-[#6B6560] hover:border-white/20 hover:text-[#F0EBE3] transition-all duration-200"
          >
            Наши услуги
          </Link>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[#3D3A38]">
          <div className="w-px h-16 bg-gradient-to-b from-transparent to-[#C8A97E]/40" />
        </div>
      </section>

      {/* ABOUT */}
      <section className="py-28 px-4 relative z-10">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <p className="text-[10px] text-[#6B6560] uppercase tracking-[0.25em] mb-5">
                О нас
              </p>
              <h2
                className="text-4xl md:text-5xl font-light leading-tight tracking-tight mb-8 text-[#F0EBE3]"
                style={{ fontFamily: "var(--font-display, Georgia, serif)" }}
              >
                Искусство быть <br />
                <span className="text-[#C8A97E]">собой</span>
              </h2>
              <p className="text-[15px] text-[#6B6560] leading-relaxed mb-5">
                Салон «Эден» — это не просто место для стрижек. Это
                пространство, где технологии встречаются с эстетикой, а время
                замедляется. С 2018 года мы создаём образы, которые вдохновляют.
              </p>
              <p className="text-[15px] text-[#6B6560] leading-relaxed mb-10">
                Наши мастера — визионеры бьюти-индустрии. Мы используем
                премиальную косметику и авторские техники, чтобы каждый ваш
                выход в свет был событием.
              </p>

              <div className="flex gap-10 pt-8 border-t border-white/6">
                {[
                  ["500+", "Клиентов"],
                  ["15+", "Мастеров"],
                  ["7 лет", "Опыта"],
                ].map(([num, label]) => (
                  <div key={label}>
                    <p
                      className="text-3xl font-light text-[#C8A97E]"
                      style={{
                        fontFamily: "var(--font-display, Georgia, serif)",
                      }}
                    >
                      {num}
                    </p>
                    <p className="text-[10px] text-[#6B6560] uppercase tracking-[0.15em] mt-1">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative group">
              <div className="absolute inset-[-1px] rounded-3xl bg-gradient-to-tr from-[#C8A97E]/20 to-transparent blur-sm group-hover:blur-md transition-all duration-500" />
              <div className="relative h-[500px] rounded-3xl overflow-hidden border border-white/6">
                <video
                  src="./Toxis.mp4"
                  autoPlay
                  loop
                  muted
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute bottom-6 left-6 right-6 transform translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                  <p className="text-white text-sm uppercase tracking-widest">
                    Общий вайбик
                  </p>
                  <p className="text-[#C8A97E] text-xs mt-1">
                    Ловим зазу вместе
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Gallery - АДАПТИВНЫЙ MASONRY */}
          <div className="mt-24">
            <div className="mb-12 text-center">
              <p className="text-[10px] text-[#6B6560] uppercase tracking-[0.25em] mb-3">
                Наши работы
              </p>
              <h2
                className="text-3xl md:text-4xl font-light text-[#F0EBE3]"
                style={{ fontFamily: "var(--font-display, Georgia, serif)" }}
              >
                Галерея преображений
              </h2>
            </div>

            {/* 
               FIX: Убрали фиксированную высоту (min-h). 
               Теперь высота определяется динамически внутри компонента Masonry.
            */}
            <div className="w-full">
              <Masonry
                items={items}
                ease="sine.out"
                duration={0.6}
                stagger={0.05}
                animateFrom="top"
                scaleOnHover
                hoverScale={0.95}
                blurToFocus
                colorShiftOnHover
              />
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES CTA */}
      <section className="py-5 px-4 relative z-10">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-14">
            <p className="text-[10px] text-[#6B6560] uppercase tracking-[0.25em] mb-3">
              Что мы предлагаем
            </p>
            <h2
              className="text-4xl md:text-5xl font-light text-[#F0EBE3] tracking-tight"
              style={{ fontFamily: "var(--font-display, Georgia, serif)" }}
            >
              Выберите свой путь
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              {
                href: routes.SERVICES,
                label: "Наши услуги",
                desc: "Полный спектр бьюти-услуг: от архитектурных стрижек до сложного окрашивания и ухода за кожей.",
                cta: "Посмотреть прайс",
              },
              {
                href: routes.APPOINTMENT,
                label: "Онлайн запись",
                desc: "Выберите мастера и удобное время за пару кликов. Без звонков и ожидания на линии.",
                cta: "Записаться",
              },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group block bg-[#0e0e0e] border border-white/6 rounded-3xl p-8 hover:border-[#C8A97E]/30 hover:shadow-[0_0_60px_-20px_rgba(200,169,126,0.2)] transition-all duration-400"
              >
                <h3
                  className="text-xl font-light text-[#F0EBE3] mb-3 tracking-tight group-hover:text-[#C8A97E] transition-colors"
                  style={{ fontFamily: "var(--font-display, Georgia, serif)" }}
                >
                  {item.label}
                </h3>
                <p className="text-[14px] text-[#6B6560] leading-relaxed mb-8">
                  {item.desc}
                </p>
                <div className="flex items-center gap-2 text-[12px] font-semibold tracking-[0.12em] uppercase text-[#C8A97E] group-hover:gap-3 transition-all duration-200">
                  {item.cta}
                  <MoveRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACTS */}
      <section className="py-20 px-4 pb-32 relative z-10">
        <div className="container mx-auto max-w-7xl">
          <div className="border border-white/5 rounded-[40px] bg-[#0a0a0a] p-8 md:p-14">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              <div>
                <p className="text-[10px] text-[#6B6560] uppercase tracking-[0.25em] mb-5">
                  Контакты
                </p>
                <h2
                  className="text-3xl md:text-4xl font-light text-[#F0EBE3] mb-12 tracking-tight"
                  style={{ fontFamily: "var(--font-display, Georgia, serif)" }}
                >
                  Где нас найти?
                </h2>

                <div className="space-y-8">
                  {[
                    {
                      icon: MapPin,
                      label: "Адрес",
                      value: "г. Пермь, ул. Коронита, 15",
                      sub: "Вход со двора, этаж 1",
                    },
                    {
                      icon: Clock,
                      label: "Режим работы",
                      value: "Ежедневно с 9:00 до 20:00",
                      sub: "Без перерывов и выходных",
                    },
                    {
                      icon: Phone,
                      label: "Телефон",
                      value: "+7 (342) 123-45-67",
                      sub: "WhatsApp / Telegram",
                      href: "tel:+73421234567",
                    },
                  ].map(({ icon: Icon, label, value, sub, href }) => (
                    <div key={label} className="flex items-start gap-5">
                      <div className="w-10 h-10 rounded-xl bg-[#C8A97E]/8 border border-[#C8A97E]/15 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-[#C8A97E]" />
                      </div>
                      <div>
                        <p className="text-[10px] text-[#6B6560] uppercase tracking-[0.15em] mb-1">
                          {label}
                        </p>
                        {href ? (
                          <a
                            href={href}
                            className="text-[15px] text-[#F0EBE3] hover:text-[#C8A97E] transition-colors"
                          >
                            {value}
                          </a>
                        ) : (
                          <p className="text-[15px] text-[#F0EBE3]">{value}</p>
                        )}
                        <p className="text-[12px] text-[#3D3A38] mt-0.5">
                          {sub}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative rounded-2xl overflow-hidden border border-white/6 h-[380px] lg:h-auto">
                <iframe
                  src="https://yandex.ru/map-widget/v1/?ll=56.380499%2C58.108191&mode=poi&poi%5Bpoint%5D=56.380339%2C58.108049&poi%5Buri%5D=ymapsbm1%3A%2F%2Forg%3Foid%3D1074988062&utm_campaign=desktop&utm_medium=search&utm_source=maps&z=19.92"
                  width="100%"
                  height="100%"
                  allowFullScreen
                  style={{
                    filter:
                      "grayscale(100%) invert(90%) contrast(78%) brightness(0.92)",
                  }}
                />
                <div className="absolute inset-0 pointer-events-none rounded-2xl ring-1 ring-inset ring-white/5" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
