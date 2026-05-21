"use client";

export default function CategoryFilter({ categories, selectedId, onSelect }: any) {
  const all = [{ id: null, title: "Все услуги" }, ...categories];

  return (
    <div className="flex flex-wrap justify-center gap-3">
      {all.map((item) => {
        const active = item.id === selectedId;
        return (
          <button
            key={item.id ?? "all"}
            onClick={() => onSelect(item.id)}
            className={`relative rounded-full px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] transition-transform active:scale-[0.97] ${
              active
                ? "bg-[color:var(--public-accent)] text-[oklch(0.98_0.005_75)] shadow-[var(--public-shadow-soft)]"
                : "border border-[color:var(--public-border)] bg-[rgba(255,251,245,0.72)] text-[color:var(--public-text-soft)] hover:text-[color:var(--public-text)]"
            }`}
          >
            {item.title}
          </button>
        );
      })}
    </div>
  );
}
