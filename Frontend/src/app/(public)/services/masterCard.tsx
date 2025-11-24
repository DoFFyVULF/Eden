// MasterCard.tsx
import { Master } from "@/types/masters.type";

interface MasterCardProps extends Master {
  isSelected: boolean;
  onSelect: () => void;
}

export default function MasterCard({ name, specialty, photo, isSelected, onSelect }: MasterCardProps) {
  return (
    <div className="group relative w-full max-w-[400px] min-h-[150px] bg-white/5 backdrop-blur-sm text-white rounded-xl overflow-hidden border border-gray-700/50 flex items-center p-4 gap-4 transition-all duration-300 hover:bg-white/10 hover:shadow-lg hover:border-gray-600 max-[426px]:max-w-[300px]">
      <div className="relative">
        <img
          src={photo}
          alt={name}
          className="w-16 h-16 rounded-full object-cover ring-2 ring-gray-700/70 transition-transform duration-300 group-hover:scale-105"
        />
        {isSelected && (
          <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-lg tracking-tight truncate">{name}</h3>
        <p className="text-gray-300 text-sm mt-1 line-clamp-2">{specialty}</p>
      </div>

      <button
        onClick={onSelect}
        aria-pressed={isSelected}
        className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent ${
          isSelected
            ? "bg-emerald-500 text-white shadow-md hover:bg-emerald-600"
            : "bg-white/20 text-white backdrop-blur-sm hover:bg-white/30"
        }`}
      >
        {isSelected ? "Выбран" : "Выбрать"}
      </button>
    </div>
  );
}