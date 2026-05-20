"use client";

import Link from "next/link";
import { routes } from "./providers/routes";
import Header from "./components/ui/public/header/Header";
import Footer from "./components/ui/public/footer/Footer";
import { MapPin, Clock3, Phone, MoveRight, Sparkles } from "lucide-react";
import dynamic from 'next/dynamic';

// 1. Ленивая загрузка тяжелой анимации Masonry.
// ssr: false отключает рендеринг на сервере, что ускоряет отдачу HTML.
const Masonry = dynamic(() => import('./animations/Masonry/Masonry'), {
  loading: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-[600px] animate-pulse bg-gray-100/5 rounded-xl">
      <div className="h-full bg-gray-200/5 rounded-xl"></div>
      <div className="h-full bg-gray-200/5 rounded-xl hidden md:block"></div>
      <div className="h-full bg-gray-200/5 rounded-xl hidden lg:block"></div>
    </div>
  ),
  ssr: false 
});

// 2. Ленивая загрузка Карты.
// Карта загрузится только в браузере, не блокируя серверный рендеринг.
const YandexMap = dynamic(() => import('./components/ui/public/yandexMap/YandexMap'), {
  loading: () => (
    <div className="w-full h-[380px] bg-gray-200/5 rounded-[30px] animate-pulse flex items-center justify-center text-xs text-gray-400">
      Загрузка карты...
    </div>
  ),
  ssr: false 
});

const items = [
  {
    id: "1",
    img: "/pic.jpg", // Убедитесь, что файл лежит в папке public
    width: 300,
    height: 600,
  },
];

export default function Home() {
  return (
    <div className="public-shell min-h-screen overflow-x-hidden">
      <Header />

      {/* Фоновые декоративные элементы */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute left-[8%] top-0 h-[32rem] w-[32rem] rounded-full bg-[rgba(177,141,97,0.14)] blur-[140px]" />
        <div className="absolute right-[10%] top-[18%] h-[24rem] w-[24rem] rounded-full bg-[rgba(145,114,88,0.12)] blur-[120px]" />
        <div className="absolute bottom-[8%] left-[32%] h-[20rem] w-[20rem] rounded-full bg-[rgba(210,191,165,0.22)] blur-[120px]" />
      </div>

      <main>
        {/* Hero Section */}
        <section className="container mx-auto max-w-7xl px-4 pb-24 pt-32 md:pt-36">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <div className="public-pill inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[color:var(--public-text-soft)]">
                <Sparkles className="h-3.5 w-3.5 text-[color:var(--public-accent-strong)]" />
                Внимание к деталям
              </div>

              <h1 className="mt-8 max-w-4xl text-[3.4rem] leading-[0.9] text-[color:var(--public-text)] md:text-[6.4rem] font-display">
                Красота, которая чувствуется и вдохновляет
              </h1>

              <p className="mt-7 max-w-2xl text-base leading-8 text-[color:var(--public-text-soft)] md:text-lg">
                «Эден» помогает найти свой образ без спешки: понятные услуги,
                удобная запись и атмосфера, в которой приятно находиться.
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Link
                  href={routes.APPOINTMENT}
                  className="rounded-full bg-[color:var(--public-accent)] px-7 py-4 text-center text-sm font-semibold uppercase tracking-[0.18em] text-[oklch(0.98_0.005_75)] shadow-[var(--public-shadow-soft)] hover:bg-[color:var(--public-accent-strong)] transition-colors"
                >
                  Записаться онлайн
                </Link>
                <Link
                  href={routes.SERVICES}
                  className="rounded-full border border-[color:var(--public-border-strong)] bg-[rgba(255,251,245,0.68)] px-7 py-4 text-center text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--public-text)] hover:bg-[rgba(255,248,239,0.95)] transition-colors"
                >
                  Смотреть услуги
                </Link>
              </div>
            </div>

            <div className="public-panel-strong rounded-[38px] p-6 md:p-8">
              <div className="rounded-[30px] bg-[linear-gradient(145deg,rgba(255,253,249,0.82),rgba(238,227,214,0.94))] p-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[color:var(--public-text-faint)]">
                      Наша философия
                    </p>
                    <p className="mt-4 text-3xl leading-none text-[color:var(--public-text)]">
                      Тёплая эстетика
                    </p>
                    <p className="mt-4 text-sm leading-7 text-[color:var(--public-text-soft)]">
                      Естественные материалы, чёткая типографика и спокойная
                      подача — чтобы фокус оставался на вас, а не на декоре.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {[
                      ["Сервис", "Запись онлайн, без звонков"],
                      ["Подход", "Работа с мастером один на один"],
                      ["Атмосфера", "Спокойствие, тепло, уверенность"],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="rounded-[22px] border border-[color:var(--public-border)] bg-[rgba(255,252,247,0.78)] p-4"
                      >
                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[color:var(--public-text-faint)]">
                          {label}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-[color:var(--public-text)]">
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="container mx-auto max-w-7xl px-4 pb-24">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[color:var(--public-text-faint)]">
                О пространстве
              </p>
              <h2 className="mt-5 text-4xl leading-[0.95] text-[color:var(--public-text)] md:text-6xl">
                Уютное место без пафоса
              </h2>
              <p className="mt-6 text-base leading-8 text-[color:var(--public-text-soft)]">
                Мы убрали всё лишнее: мягкий свет, приятные на ощупь материалы
                и сервис, который помогает расслабиться и почувствовать себя
                уверенно.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {[
                  ["40+", "постоянных клиентов"],
                  ["10", "мастеров разных направлений"],
                  ["24 года", "работы с образами"],
                ].map(([value, label]) => (
                  <div
                    key={label}
                    className="rounded-[24px] border border-[color:var(--public-border)] bg-[rgba(255,251,245,0.68)] p-5"
                  >
                    <p className="text-3xl text-[color:var(--public-text)]">
                      {value}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[color:var(--public-text-soft)]">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="public-panel overflow-hidden rounded-[38px] p-3">
              <div className="relative h-[520px] overflow-hidden rounded-[30px] bg-gray-100">
                {/* Если есть фото интерьера, раскомментируйте Image ниже */}
                {/* <Image src="/interior.jpg" alt="Интерьер" fill className="object-cover" priority /> */}
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,250,244,0.1),rgba(70,52,37,0.44))]" />
                <div className="absolute bottom-0 left-0 right-0 p-7 text-[oklch(0.95_0.01_75)]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] opacity-80">
                    Атмосфера
                  </p>
                  <p className="mt-3 text-3xl">
                    Красота без перегруза
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Gallery Section */}
        <section className="container mx-auto max-w-7xl px-4 pb-24">
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[color:var(--public-text-faint)]">
                Наши работы
              </p>
              <h2 className="mt-4 text-4xl text-[color:var(--public-text)] md:text-5xl">
                Галерея преображений
              </h2>
            </div>
            <p className="max-w-md text-sm leading-7 text-[color:var(--public-text-soft)]">
              Аккуратная работа и заметный результат. Без громких обещаний — только честный труд мастеров.
            </p>
          </div>

          {/* Masonry загружается лениво */}
          <Masonry
            items={items}
            ease="sine.out"
            duration={0.6}
            stagger={0.05}
            animateFrom="top"
            scaleOnHover
            hoverScale={0.98}
            blurToFocus
            colorShiftOnHover
          />
        </section>

        {/* Links Section */}
        <section className="container mx-auto max-w-7xl px-4 pb-24">
          <div className="grid gap-5 md:grid-cols-2">
            {[
              {
                href: routes.SERVICES,
                label: "Каталог услуг",
                desc: "Изучите направления, длительность и формат процедур — всё просто и понятно.",
                cta: "Посмотреть каталог",
              },
              {
                href: routes.APPOINTMENT,
                label: "Онлайн-запись",
                desc: "Выберите услугу, мастера и время в интерфейсе, где всё на своих местах.",
                cta: "Перейти к записи",
              },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="public-panel group rounded-[34px] p-8 hover:border-[color:var(--public-border-strong)] transition-colors"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[color:var(--public-text-faint)]">
                  Что дальше
                </p>
                <h3 className="mt-5 text-4xl text-[color:var(--public-text)]">
                  {item.label}
                </h3>
                <p className="mt-4 max-w-md text-sm leading-7 text-[color:var(--public-text-soft)]">
                  {item.desc}
                </p>
                <div className="mt-8 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--public-accent-strong)]">
                  {item.cta}
                  <MoveRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Contacts Section */}
        <section id="contacts" className="container mx-auto max-w-7xl px-4 pb-32">
          <div className="public-panel-strong rounded-[40px] p-8 md:p-12">
            <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[color:var(--public-text-faint)]">
                  Контакты
                </p>
                <h2 className="mt-5 text-4xl text-[color:var(--public-text)] md:text-5xl">
                  Место, куда хочется возвращаться
                </h2>

                <div className="mt-10 space-y-7">
                  {[
                    {
                      icon: MapPin,
                      label: "Адрес",
                      value: "г. Пермь, ул. Коронита, 15",
                      sub: "Вход со двора, этаж 1",
                    },
                    {
                      icon: Clock3,
                      label: "Режим работы",
                      value: "Ежедневно с 9:00 до 20:00",
                      sub: "Без выходных",
                    },
                    {
                      icon: Phone,
                      label: "Телефон",
                      value: "+7 (342) 123-45-67",
                      sub: "Для вопросов и уточнений",
                      href: "tel:+73421234567",
                    },
                  ].map(({ icon: Icon, label, value, sub, href }) => (
                    <div key={label} className="flex gap-4">
                      <div className="mt-1 flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(170,135,96,0.12)] text-[color:var(--public-accent-strong)]">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--public-text-faint)]">
                          {label}
                        </p>
                        {href ? (
                          <a href={href} className="mt-2 block text-[color:var(--public-text)] hover:text-[color:var(--public-accent-strong)] transition-colors">
                            {value}
                          </a>
                        ) : (
                          <p className="mt-2 text-[color:var(--public-text)]">{value}</p>
                        )}
                        <p className="mt-1 text-sm text-[color:var(--public-text-soft)]">{sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="overflow-hidden rounded-[30px] border border-[color:var(--public-border)] h-[380px] md:h-[450px]">
                {/* Карта загружается лениво через dynamic import */}
                <YandexMap />
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}