import Link from "next/link";
import { routes } from "@/app/lib/routes";

export default function Footer() {
  return (
    <footer className=" text-white py-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h2 className="ink-free text-4xl font-bold mb-4">Эден</h2>
            <p className="text-gray-400 text-sm">
              Салон красоты в Перми с 2018 года
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Контакты</h3>
            <address className="not-italic text-gray-400 space-y-2">
              <p>г. Пермь, ул. Коронита, 15</p>
              <p className="text-sm text-gray-500">Вход со двора</p>
              <p>
                <a
                  href="tel:+73421234567"
                  className="hover:text-amber-400 transition-colors"
                >
                  +7 (342) 123-45-67
                </a>
              </p>
            </address>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Режим работы</h3>
            <p className="text-gray-400">Ежедневно с 9:00 до 20:00</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Навигация</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link
                  href={routes.HOME}
                  className="hover:text-amber-400 transition-colors"
                >
                  Главная
                </Link>
              </li>
              <li>
                <Link
                  href={routes.SERVICES}
                  className="hover:text-amber-400 transition-colors"
                >
                  Услуги
                </Link>
              </li>
              <li>
                <Link
                  href={routes.APPOINTMENT}
                  className="hover:text-amber-400 transition-colors"
                >
                  Записаться
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-800 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} Салон красоты «Эден». Все права защищены.
        </div>
      </div>
    </footer>
  );
}