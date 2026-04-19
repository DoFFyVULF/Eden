"use client";
import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { gsap } from "gsap";
import { X, Maximize2, ChevronLeft, ChevronRight } from "lucide-react";

const useMedia = (
  queries: string[],
  values: number[],
  defaultValue: number,
): number => {
  const get = () => {
    if (typeof window === "undefined") return defaultValue;
    const index = queries.findIndex((q) => window.matchMedia(q).matches);
    return values[index] ?? defaultValue;
  };

  const [value, setValue] = useState<number>(get);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = () => setValue(get());
    queries.forEach((q) => window.matchMedia(q).addEventListener("change", handler));
    return () => {
      queries.forEach((q) => window.matchMedia(q).removeEventListener("change", handler));
    };
  }, [queries]);

  return value;
};

const useMeasure = <T extends HTMLElement>() => {
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);

  return [ref, size] as const;
};

const preloadImages = async (urls: string[]): Promise<void> => {
  if (typeof window === "undefined") return;
  await Promise.all(
    urls.map(
      (src) =>
        new Promise<void>((resolve) => {
          const img = new Image();
          img.src = src;
          img.onload = img.onerror = () => resolve();
        }),
    ),
  );
};

// Добавили width в интерфейс Item (опционально)
interface Item {
  id: string;
  img: string;
  height: number;
  width?: number; // Реальная ширина изображения для расчета пропорций
  title?: string;
  description?: string;
}

interface GridItem extends Item {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface MasonryProps {
  items: Item[];
  ease?: string;
  duration?: number;
  stagger?: number;
  animateFrom?: "bottom" | "top" | "left" | "right" | "center" | "random";
  scaleOnHover?: boolean;
  hoverScale?: number;
  blurToFocus?: boolean;
  colorShiftOnHover?: boolean;
  // Коэффициент масштабирования высоты относительно исходных данных (по умолчанию 0.5 как было)
  sizeMultiplier?: number; 
}

const Masonry: React.FC<MasonryProps> = ({
  items,
  ease = "power3.out",
  duration = 0.6,
  stagger = 0.05,
  animateFrom = "bottom",
  scaleOnHover = true,
  hoverScale = 0.95,
  blurToFocus = true,
  colorShiftOnHover = false,
  sizeMultiplier = 0.5, // Уменьшаем высоту картинок в 2 раза по умолчанию
}) => {
  const columns = useMedia(
    [
      "(min-width:1500px)",
      "(min-width:1000px)",
      "(min-width:600px)",
      "(min-width:400px)",
    ],
    [5, 4, 3, 2],
    1,
  );

  const [containerRef, { width }] = useMeasure<HTMLDivElement>();
  const [imagesReady, setImagesReady] = useState(false);
  const [selectedImage, setSelectedImage] = useState<Item | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const modalRef = useRef<HTMLDivElement>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);
  const modalImageRef = useRef<HTMLDivElement>(null);

  const getInitialPosition = (item: GridItem) => {
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect || typeof window === "undefined") {
       return { x: item.x, y: item.y + 100 }; 
    }

    let direction = animateFrom;
    if (animateFrom === "random") {
      const dirs = ["top", "bottom", "left", "right"];
      direction = dirs[Math.floor(Math.random() * dirs.length)] as typeof animateFrom;
    }

    switch (direction) {
      case "top": return { x: item.x, y: -200 };
      case "bottom": return { x: item.x, y: window.innerHeight + 200 };
      case "left": return { x: -200, y: item.y };
      case "right": return { x: window.innerWidth + 200, y: item.y };
      case "center": return { x: containerRect.width / 2 - item.w / 2, y: containerRect.height / 2 - item.h / 2 };
      default: return { x: item.x, y: item.y + 100 };
    }
  };

  useEffect(() => {
    preloadImages(items.map((i) => i.img)).then(() => setImagesReady(true));
  }, [items]);

  // Вычисляем сетку с учетом реальных пропорций (width/height)
  const { grid, totalHeight } = useMemo<{ grid: GridItem[], totalHeight: number }>(() => {
    if (!width) return { grid: [], totalHeight: 0 };
    
    const colHeights = new Array(columns).fill(0);
    const gap = 16;
    const totalGaps = (columns - 1) * gap;
    const columnWidth = (width - totalGaps) / columns;

    const computedGrid = items.map((child) => {
      const col = colHeights.indexOf(Math.min(...colHeights));
      
      // Базовая ширина элемента равна ширине колонки
      const itemW = columnWidth;
      
      // Расчет высоты с сохранением пропорций
      let itemH = child.height * sizeMultiplier;

      // Если задана реальная ширина картинки, используем её для точного расчета аспекта
      if (child.width && child.width > 0) {
        const aspectRatio = child.height / child.width;
        // Высота = Ширина колонки * (Реальная высота / Реальная ширина) * Множитель
        itemH = itemW * aspectRatio;
      }

      const x = col * (columnWidth + gap);
      const y = colHeights[col];

      colHeights[col] += itemH + gap;
      
      return { 
        ...child, 
        x, 
        y, 
        w: itemW, 
        h: itemH 
      };
    });

    const maxH = Math.max(...colHeights);

    return { grid: computedGrid, totalHeight: maxH };
  }, [columns, items, width, sizeMultiplier]);

  const hasMounted = useRef(false);

  useLayoutEffect(() => {
    if (!imagesReady || !width) return;

    grid.forEach((item, index) => {
      const selector = `[data-key="${item.id}"]`;
      const animProps = { x: item.x, y: item.y, width: item.w, height: item.h };

      if (!hasMounted.current) {
        const start = getInitialPosition(item);
        gsap.fromTo(
          selector,
          {
            opacity: 0,
            x: start.x,
            y: start.y,
            width: item.w,
            height: item.h,
            ...(blurToFocus && { filter: "blur(10px)" }),
          },
          {
            opacity: 1,
            ...animProps,
            ...(blurToFocus && { filter: "blur(0px)" }),
            duration: 0.8,
            ease: "power3.out",
            delay: index * stagger,
          },
        );
      } else {
        gsap.to(selector, {
          ...animProps,
          duration,
          ease,
          overwrite: "auto",
        });
      }
    });

    hasMounted.current = true;
  }, [grid, imagesReady, stagger, animateFrom, blurToFocus, duration, ease, width]);

  const handleMouseEnter = (id: string, element: HTMLElement) => {
    if (scaleOnHover) {
      gsap.to(`[data-key="${id}"]`, { scale: hoverScale, duration: 0.3, ease: "power2.out" });
    }
    if (colorShiftOnHover) {
      const overlay = element.querySelector(".color-overlay") as HTMLElement;
      if (overlay) gsap.to(overlay, { opacity: 0.3, duration: 0.3 });
    }
  };

  const handleMouseLeave = (id: string, element: HTMLElement) => {
    if (scaleOnHover) {
      gsap.to(`[data-key="${id}"]`, { scale: 1, duration: 0.3, ease: "power2.out" });
    }
    if (colorShiftOnHover) {
      const overlay = element.querySelector(".color-overlay") as HTMLElement;
      if (overlay) gsap.to(overlay, { opacity: 0, duration: 0.3 });
    }
  };

  const openModal = (item: Item, index: number) => {
    setSelectedImage(item);
    setCurrentIndex(index);
    setIsModalOpen(true);
    if (typeof document !== "undefined") document.body.style.overflow = "hidden";
    
    setTimeout(() => {
      if (modalRef.current) {
        gsap.fromTo(modalRef.current,
          { opacity: 0, backdropFilter: "blur(0px)" },
          { opacity: 1, backdropFilter: "blur(12px)", duration: 0.5, ease: "power2.out" }
        );
      }
      if (modalContentRef.current) {
        gsap.fromTo(modalContentRef.current,
          { scale: 0.85, opacity: 0, y: 30 },
          { scale: 1, opacity: 1, y: 0, duration: 0.6, ease: "back.out(0.4)" }
        );
      }
      if (modalImageRef.current) {
        gsap.fromTo(modalImageRef.current,
          { scale: 0.9, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.5, delay: 0.1, ease: "power2.out" }
        );
      }
    }, 0);
  };

  const closeModal = () => {
    if (modalRef.current) {
      gsap.to(modalRef.current, {
        opacity: 0,
        backdropFilter: "blur(0px)",
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => {
          setIsModalOpen(false);
          setSelectedImage(null);
          if (typeof document !== "undefined") document.body.style.overflow = "";
        }
      });
    }
    if (modalContentRef.current) {
      gsap.to(modalContentRef.current, { scale: 0.95, opacity: 0, y: 20, duration: 0.3, ease: "power2.in" });
    }
  };

  const navigateImage = (direction: "prev" | "next") => {
    let newIndex = currentIndex;
    if (direction === "prev") {
      newIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1;
    } else {
      newIndex = currentIndex === items.length - 1 ? 0 : currentIndex + 1;
    }
    
    const newImage = items[newIndex];
    
    if (modalImageRef.current) {
      gsap.to(modalImageRef.current, {
        opacity: 0,
        scale: 0.95,
        duration: 0.2,
        ease: "power2.in",
        onComplete: () => {
          setCurrentIndex(newIndex);
          setSelectedImage(newImage);
          gsap.fromTo(modalImageRef.current,
            { opacity: 0, scale: 0.95, x: direction === "prev" ? -20 : 20 },
            { opacity: 1, scale: 1, x: 0, duration: 0.4, ease: "back.out(0.3)" }
          );
        }
      });
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isModalOpen) closeModal();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isModalOpen]);

  return (
    <>
      <div 
        ref={containerRef} 
        className="relative w-full"
        style={{ height: totalHeight > 0 ? totalHeight : 'auto' }}
      >
        {grid.map((item, index) => (
          <div
            key={item.id}
            data-key={item.id}
            className="absolute box-content cursor-pointer group"
            style={{ willChange: "transform, width, height, opacity" }}
            onClick={() => openModal(item, index)}
            onMouseEnter={(e) => handleMouseEnter(item.id, e.currentTarget)}
            onMouseLeave={(e) => handleMouseLeave(item.id, e.currentTarget)}
          >
            <div
              className="relative w-full h-full bg-cover bg-center rounded-[10px] shadow-[0px_10px_50px_-10px_rgba(0,0,0,0.2)] overflow-hidden"
              style={{ backgroundImage: `url(${item.img})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-4 left-4 right-4">
                  {item.title && (
                    <p className="text-white text-sm font-medium mb-1">{item.title}</p>
                  )}
                  <div className="flex items-center gap-2 text-white/80 text-xs">
                    <Maximize2 className="w-3 h-3" />
                    <span>Увеличить</span>
                  </div>
                </div>
              </div>
              
              {colorShiftOnHover && (
                <div className="color-overlay absolute inset-0 rounded-[10px] bg-gradient-to-tr from-pink-500/50 to-sky-500/50 opacity-0 pointer-events-none" />
              )}
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && selectedImage && (
        <div
          ref={modalRef}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.85)", backdropFilter: "blur(0px)", opacity: 0 }}
          onClick={closeModal}
        >
          <button
            onClick={closeModal}
            className="absolute top-6 right-6 z-10 w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all duration-200 group opacity-0"
            style={{ animation: "fadeIn 0.4s ease forwards", animationDelay: "0.3s" }}
          >
            <X className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
          </button>

          {items.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); navigateImage("prev"); }}
                className="absolute left-6 z-10 w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all duration-200 group opacity-0"
                style={{ animation: "fadeIn 0.4s ease forwards", animationDelay: "0.35s" }}
              >
                <ChevronLeft className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); navigateImage("next"); }}
                className="absolute right-6 z-10 w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all duration-200 group opacity-0"
                style={{ animation: "fadeIn 0.4s ease forwards", animationDelay: "0.35s" }}
              >
                <ChevronRight className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
              </button>
            </>
          )}

          <div
            ref={modalContentRef}
            className="relative max-w-[90vw] max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl opacity-0"
            style={{ transform: "scale(0.85)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div ref={modalImageRef} className="relative">
              <img
                src={selectedImage.img}
                alt={selectedImage.title || "Gallery image"}
                className="w-full h-full object-contain max-h-[85vh]"
              />
            </div>
            
            {(selectedImage.title || selectedImage.description) && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 opacity-0"
                style={{ animation: "fadeInUp 0.5s ease forwards", animationDelay: "0.4s" }}>
                {selectedImage.title && (
                  <h3 className="text-white text-xl font-light mb-2" style={{ fontFamily: "var(--font-display, Georgia, serif)" }}>
                    {selectedImage.title}
                  </h3>
                )}
                {selectedImage.description && (
                  <p className="text-white/70 text-sm">{selectedImage.description}</p>
                )}
              </div>
            )}
            
            {items.length > 1 && (
              <div className="absolute top-6 left-6 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full text-white/80 text-xs font-mono opacity-0"
                style={{ animation: "fadeIn 0.4s ease forwards", animationDelay: "0.2s" }}>
                {currentIndex + 1} / {items.length}
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </>
  );
};

export default Masonry;