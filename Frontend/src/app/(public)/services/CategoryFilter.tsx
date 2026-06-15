"use client";

import { motion } from "framer-motion";

interface CategoryFilterProps {
  categories: { id: number; title: string }[];
  selectedId: number | null;
  onSelect: (id: number | null) => void;
}

export default function CategoryFilter({ categories, selectedId, onSelect }: CategoryFilterProps) {
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
                ? "text-[oklch(0.98_0.005_75)]"
                : "border border-[color:var(--public-border)] bg-[rgba(255,251,245,0.72)] text-[color:var(--public-text-soft)] hover:text-[color:var(--public-text)]"
            }`}
          >
            {active && (
              <motion.div
                layoutId="active-category"
                className="absolute inset-0 rounded-full bg-[color:var(--public-accent)] shadow-[var(--public-shadow-soft)]"
                transition={{
                  type: "spring",
                  stiffness: 380,
                  damping: 30,
                  mass: 1,
                }}
                style={{ zIndex: -1 }}
              />
            )}
            <span className="relative z-10">{item.title}</span>
          </button>
        );
      })}
    </div>
  );
}