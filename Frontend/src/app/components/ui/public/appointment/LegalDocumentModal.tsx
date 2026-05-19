"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface LegalSection {
  title: string;
  paragraphs: string[];
}

interface LegalDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  effectiveDate: string;
  sections: LegalSection[];
}

export default function LegalDocumentModal({
  isOpen,
  onClose,
  title,
  subtitle,
  effectiveDate,
  sections,
}: LegalDocumentModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.22 }}
            onClick={(event) => event.stopPropagation()}
            className="relative max-h-[88vh] w-full max-w-3xl overflow-hidden rounded-[32px] border border-[color:var(--public-border)] bg-[rgba(255,252,247,0.98)] shadow-[0_30px_80px_rgba(56,35,15,0.22)]"
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-5 top-5 rounded-full border border-[color:var(--public-border)] bg-white/80 p-2 text-[color:var(--public-text-soft)] transition hover:text-[color:var(--public-text)]"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="border-b border-[color:var(--public-border)] px-6 pb-5 pt-6 md:px-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[color:var(--public-text-faint)]">
                Действует с {effectiveDate}
              </p>
              <h3
                className="mt-3 pr-10 text-3xl leading-tight text-[color:var(--public-text)] md:text-4xl"
                style={{ fontFamily: "var(--font-public-display), serif" }}
              >
                {title}
              </h3>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[color:var(--public-text-soft)]">
                {subtitle}
              </p>
            </div>

            <div className="max-h-[calc(88vh-10rem)] overflow-y-auto px-6 py-6 md:px-8">
              <div className="space-y-6 pb-20">
                {sections.map((section, index) => (
                  <section
                    key={section.title}
                    className={`
          rounded-[24px] border border-[color:var(--public-border)] bg-[rgba(255,251,245,0.72)] p-5
          ${index === sections.length - 1 ? "mb-6" : ""} 
        `}
                  >
                    <h4 className="text-base font-semibold text-[color:var(--public-text)]">
                      {section.title}
                    </h4>
                    <div className="mt-3 space-y-3 text-sm leading-7 text-[color:var(--public-text-soft)]">
                      {section.paragraphs.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
