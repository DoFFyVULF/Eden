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
            whileTap={{ scale: 0.95 }}
            className={`relative px-6 py-3 rounded-full text-[11px] font-bold uppercase tracking-[0.15em] transition-colors duration-300 ${
              active ? "text-[#1a1208]" : "text-[#6B6560] hover:text-[#F0EBE3]"
            }`}
          >
            {active && (
              <motion.span
                layoutId="cat-pill"
                className="absolute inset-0 rounded-full bg-[#C8A97E]"
                style={{ boxShadow: "0 10px 25px -5px rgba(200,169,126,0.4)" }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">{item.title}</span>
            {!active && (
               <span className="absolute inset-0 rounded-full border border-white/5 bg-white/[0.02]" />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}