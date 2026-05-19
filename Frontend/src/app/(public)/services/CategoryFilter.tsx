"use client";

import { motion } from "framer-motion";

export default function CategoryFilter({ categories, selectedId, onSelect }: any) {
  const all = [{ id: null, title: "Все услуги" }, ...categories];

  return (
    <div className="flex flex-wrap justify-center gap-3">
      {all.map((item) => {
        const active = item.id === selectedId;
        return (
          <motion.button
            key={item.id ?? "all"}
            onClick={() => onSelect(item.id)}
            whileTap={{ scale: 0.97 }}
            className={`relative rounded-full px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] ${
              active
                ? "text-[oklch(0.98_0.005_75)]"
                : "border border-[color:var(--public-border)] bg-[rgba(255,251,245,0.72)] text-[color:var(--public-text-soft)] hover:text-[color:var(--public-text)]"
            }`}
          >
            {active && (
              <motion.span
                layoutId="cat-pill"
                className="absolute inset-0 rounded-full bg-[color:var(--public-accent)] shadow-[var(--public-shadow-soft)]"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">{item.title}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
