import { routes } from "@/app/lib/routes"; 
import { tServices } from "@/types/services.types";

export default function ServiceCard({
  title,
  img,
  duration,
  price,
  isAppointment,
  isSelected,
  onSelect,
}: tServices) {
  return (
    <article className="w-[350px] min-h-[420px] bg-white/10 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col">
      <div className="h-48 w-full overflow-hidden">
        <img
          src={img}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>
      <div className="p-5 flex flex-col flex-grow justify-between">
        <div>
          <h3 className="text-xl font-semibold mb-2">{title}</h3>
          <p className="text-sm mb-3">{`Продолжительность ~ ${duration} минут`}</p>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-lg font-bold">{`${price}₽`}</span>
          {isAppointment ? (
            <a
              href={routes.APPOINTMENT}
              className="px-4 py-2 bg-white text-black text-sm font-medium rounded-full hover:opacity-65 transition-all"
            >
              Записаться
            </a>
          ) : (
            <button
              className="px-4 py-2 bg-white text-black text-sm font-medium rounded-full hover:opacity-65 transition-all"
              onClick={onSelect}
            >
              {isSelected ? "Выбрано" : "Выбрать"}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
