import { IService } from "@/types/services.types";
import { IPublicServicesPageData } from "@/types/public-data.types";

// Статические категории — не берутся из БД
export const staticCategories = [
  { id: 1, title: "Стрижка" },
  { id: 2, title: "Укладка" },
  { id: 3, title: "Окрашивание" },
  { id: 4, title: "Загар" },
  { id: 5, title: "Маникюр" },
] as const;

// Статические услуги — локальные изображения из /public/images/services/
// Запусти node scripts/download-static-images.js чтобы скачать фото
export const staticServices: IService[] = [
  // Стрижка (categoryId: 1)
  {
    id: 1,
    title: "Модельная стрижка",
    description: "Классическая модельная стрижка с учётом формы лица и структуры волос.",
    duration: 40,
    price: 600,
    img: "/images/services/service-01.jpg",
    categoryId: 1,
    category: { id: 1, title: "Стрижка" },
    isActive: true,
  },
  {
    id: 2,
    title: "Стрижка бороды",
    description: "Моделирование и чёткий контур бороды с финишной укладкой.",
    duration: 20,
    price: 350,
    img: "/images/services/service-02.jpg",
    categoryId: 1,
    category: { id: 1, title: "Стрижка" },
    isActive: true,
  },
  {
    id: 3,
    title: "Детская стрижка",
    description: "Аккуратная и быстрая стрижка для детей в комфортной атмосфере.",
    duration: 30,
    price: 400,
    img: "/images/services/service-03.jpg",
    categoryId: 1,
    category: { id: 1, title: "Стрижка" },
    isActive: true,
  },

  // Укладка (categoryId: 2)
  {
    id: 4,
    title: "Укладка феном",
    description: "Объёмная укладка феном с фиксацией и лёгким стайлингом.",
    duration: 30,
    price: 500,
    img: "/images/services/service-04.jpg",
    categoryId: 2,
    category: { id: 2, title: "Укладка" },
    isActive: true,
  },
  {
    id: 5,
    title: "Укладка плойкой",
    description: "Локоны и волны плойкой — от лёгких до упругих, с термозащитой.",
    duration: 45,
    price: 700,
    img: "/images/services/service-05.jpg",
    categoryId: 2,
    category: { id: 2, title: "Укладка" },
    isActive: true,
  },

  // Окрашивание (categoryId: 3)
  {
    id: 6,
    title: "Окрашивание в один тон",
    description: "Равномерное окрашивание в один тон с уходом и блеском.",
    duration: 90,
    price: 1800,
    img: "/images/services/service-06.jpg",
    categoryId: 3,
    category: { id: 3, title: "Окрашивание" },
    isActive: true,
  },
  {
    id: 7,
    title: "Мелирование",
    description: "Классическое мелирование для объёма и игры цвета.",
    duration: 120,
    price: 2500,
    img: "/images/services/service-07.jpg",
    categoryId: 3,
    category: { id: 3, title: "Окрашивание" },
    isActive: true,
  },
  {
    id: 8,
    title: "Тонирование",
    description: "Мягкое тонирование для освежения оттенка и блеска.",
    duration: 40,
    price: 600,
    img: "/images/services/service-08.jpg",
    categoryId: 3,
    category: { id: 3, title: "Окрашивание" },
    isActive: true,
  },

  // Загар (categoryId: 4)
  {
    id: 9,
    title: "Сеанс в солярии (10 мин)",
    description: "Контролируемый сеанс загара с подбором времени под тип кожи.",
    duration: 10,
    price: 300,
    img: "/images/services/service-09.jpg",
    categoryId: 4,
    category: { id: 4, title: "Загар" },
    isActive: true,
  },
  {
    id: 10,
    title: "Автозагар",
    description: "Ровный оттенок моментального загара без пятен и разводов.",
    duration: 20,
    price: 800,
    img: "/images/services/service-10.jpg",
    categoryId: 4,
    category: { id: 4, title: "Загар" },
    isActive: true,
  },

  // Маникюр (categoryId: 5)
  {
    id: 11,
    title: "Классический маникюр",
    description: "Гигиенический маникюр с формой и уходом за кутикулой.",
    duration: 45,
    price: 600,
    img: "/images/services/service-11.jpg",
    categoryId: 5,
    category: { id: 5, title: "Маникюр" },
    isActive: true,
  },
  {
    id: 12,
    title: "Гель-лак",
    description: "Покрытие гель-лаком с выравниванием и долгой ноской.",
    duration: 60,
    price: 1200,
    img: "/images/services/service-12.jpg",
    categoryId: 5,
    category: { id: 5, title: "Маникюр" },
    isActive: true,
  },
  {
    id: 13,
    title: "SPA-маникюр",
    description: "Комплексный уход: скраб, маска, массаж и идеальный маникюр.",
    duration: 75,
    price: 1500,
    img: "/images/services/service-13.jpg",
    categoryId: 5,
    category: { id: 5, title: "Маникюр" },
    isActive: true,
  },
];

// Готовый объект для страницы — полностью статический
export const staticServicesPageData: IPublicServicesPageData = {
  services: staticServices,
  activeMastersCount: 4,
};

// Обратная совместимость со старыми импортами
export const category = [...staticCategories];
export const services = staticServices;
