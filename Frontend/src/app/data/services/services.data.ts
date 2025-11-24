// data/services.data.ts (или как у тебя назван файл)

import { tServices } from "@/types/services.types";

const category = [
  { id: 1, title: "Стрижка" },
  { id: 2, title: "Укладка" },
  { id: 3, title: "Окрашивание" },
  { id: 4, title: "Загар" },
  { id: 5, title: "Маникюр" },
];

const services: tServices[] = [
  // Стрижка (categoryId: 1)
  {
    id: 1,
    title: "Модельная стрижка",
    duration: 40,
    price: 600,
    img: "https://seashell-beauty.ru/wp-content/uploads/2019/09/strizh-muzh-sport.jpeg",
    categoryId: 1,
  },
  {
    id: 2,
    title: "Стрижка бороды",
    duration: 20,
    price: 350,
    img: "https://seashell-beauty.ru/wp-content/uploads/2019/09/strizh-muzh-sport.jpeg",
    categoryId: 1,
  },
  {
    id: 3,
    title: "Детская стрижка",
    duration: 30,
    price: 400,
    img: "https://seashell-beauty.ru/wp-content/uploads/2019/09/strizh-muzh-sport.jpeg",
    categoryId: 1,
  },

  // Укладка (categoryId: 2)
  {
    id: 4,
    title: "Укладка феном",
    duration: 30,
    price: 500,
    img: "https://seashell-beauty.ru/wp-content/uploads/2019/09/strizh-muzh-sport.jpeg",
    categoryId: 2,
  },
  {
    id: 5,
    title: "Укладка плойкой",
    duration: 45,
    price: 700,
    img: "https://seashell-beauty.ru/wp-content/uploads/2019/09/strizh-muzh-sport.jpeg",
    categoryId: 2,
  },

  // Окрашивание (categoryId: 3)
  {
    id: 6,
    title: "Окрашивание в один тон",
    duration: 90,
    price: 1800,
    img: "https://seashell-beauty.ru/wp-content/uploads/2019/09/strizh-muzh-sport.jpeg",
    categoryId: 3,
  },
  {
    id: 7,
    title: "Мелирование",
    duration: 120,
    price: 2500,
    img: "https://seashell-beauty.ru/wp-content/uploads/2019/09/strizh-muzh-sport.jpeg",
    categoryId: 3,
  },
  {
    id: 8,
    title: "Тонирование",
    duration: 40,
    price: 600,
    img: "https://seashell-beauty.ru/wp-content/uploads/2019/09/strizh-muzh-sport.jpeg",
    categoryId: 3,
  },

  // Загар (categoryId: 4)
  {
    id: 9,
    title: "Сеанс в солярии (10 мин)",
    duration: 10,
    price: 300,
    img: "https://seashell-beauty.ru/wp-content/uploads/2019/09/strizh-muzh-sport.jpeg",
    categoryId: 4,
  },
  {
    id: 10,
    title: "Автозагар",
    duration: 20,
    price: 800,
    img: "https://seashell-beauty.ru/wp-content/uploads/2019/09/strizh-muzh-sport.jpeg",
    categoryId: 4,
  },

  // Маникюр (categoryId: 5)
  {
    id: 11,
    title: "Классический маникюр",
    duration: 45,
    price: 600,
    img: "https://seashell-beauty.ru/wp-content/uploads/2019/09/strizh-muzh-sport.jpeg",
    categoryId: 5,
  },
  {
    id: 12,
    title: "Гель-лак",
    duration: 60,
    price: 1200,
    img: "https://seashell-beauty.ru/wp-content/uploads/2019/09/strizh-muzh-sport.jpeg",
    categoryId: 5,
  },
  {
    id: 13,
    title: "SPA-маникюр",
    duration: 75,
    price: 1500,
    img: "https://seashell-beauty.ru/wp-content/uploads/2019/09/strizh-muzh-sport.jpeg",
    categoryId: 5,
  },
];

export { category, services };
