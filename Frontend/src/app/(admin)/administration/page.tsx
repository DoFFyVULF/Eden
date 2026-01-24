import { ADMIN_ROUTES } from "@/app/lib/admin.routes";

export default function AdminPage() {
const cards = [
  {
    href: ADMIN_ROUTES.CATEGORY.LIST,
    icon: "📂",
    title: "Категории",
    description: "Управление категориями услуг, добавление новых категорий и редактирование существующих.",
    gradient: "bg-gradient-to-br from-[#ff9a9e] to-[#fad0c4]"
  },
  {
    href: ADMIN_ROUTES.SERVICES.LIST,
    icon: "⚙️",
    title: "Услуги",
    description: "Просмотр и редактирование списка предоставляемых услуг, их описаний и характеристик.",
    gradient: "bg-gradient-to-br from-[#a1c4fd] to-[#c2e9fb]"
  },
  {
    href: ADMIN_ROUTES.SCHEDULE.OVERVIEW, 
    icon: "💰",
    title: "Рассписание",
    description: "Управление прайс-листом, установка и изменение стоимости услуг.",
    gradient: "bg-gradient-to-br from-[#ffecd2] to-[#fcb69f]"
  },
  {
    href: ADMIN_ROUTES.MASTERS.LIST,
    icon: "👨‍💼",
    title: "Мастера",
    description: "Информация о сотрудниках, их специализация и контактные данные.",
    gradient: "bg-gradient-to-br from-[#84fab0] to-[#8fd3f4]"
  },
  {
    href: ADMIN_ROUTES.MASTERS.SERVICES,
    icon: "🔧",
    title: "Услуги мастеров",
    description: "Распределение услуг между мастерами, управление их специализациями.",
    gradient: "bg-gradient-to-br from-[#d4fc79] to-[#96e6a1]"
  },
  {
    href: ADMIN_ROUTES.APPOINTMENTS.LIST,
    icon: "📅",
    title: "Записи",
    description: "График записей клиентов, управление расписанием и статусами записей.",
    gradient: "bg-gradient-to-br from-[#a6c0fe] to-[#f68084]"
  }
];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Панель управления
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
            Выберите таблицу для просмотра и редактирования данных.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card, index) => (
            <a
              key={index}
              href={card.href}
              className="block bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden group no-underline"
            >
              <div className={`h-32 ${card.gradient} flex items-center justify-center relative overflow-hidden`}>
                <div className="text-5xl z-10">{card.icon}</div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  {card.title}
                </h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  {card.description}
                </p>
                <div className="inline-flex items-center px-6 py-3 bg-blue-500 text-white rounded-full font-medium transition-all duration-300 group-hover:bg-blue-600 group-hover:-translate-y-0.5 group-hover:shadow-lg">
                  Открыть таблицу
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}