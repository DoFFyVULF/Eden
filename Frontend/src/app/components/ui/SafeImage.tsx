"use client";

import { useState } from "react";
import Image, { ImageProps } from "next/image";
import { ImageOff } from "lucide-react";

export function PhotoUnavailable({
  title,
  compact = false,
  className = "",
}: {
  title?: string;
  compact?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`flex h-full w-full flex-col items-center justify-center gap-3 bg-[linear-gradient(145deg,rgba(255,253,249,0.92),rgba(238,227,214,0.9))] text-center ${compact ? "p-4" : "p-6"} ${className}`}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[color:var(--public-border)] bg-white/85 shadow-sm">
        <ImageOff className="h-5 w-5 text-[color:var(--public-text-faint)]" />
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--public-text-faint)]">
          Фото недоступно
        </p>
        {title && !compact && (
          <p className="mx-auto mt-2 max-w-[16rem] line-clamp-2 text-sm leading-6 text-[color:var(--public-text-soft)]">
            {title}
          </p>
        )}
      </div>
    </div>
  );
}

type SafeImageProps = Omit<ImageProps, "src" | "onError"> & {
  src: string | null | undefined;
  alt: string;
  fallbackTitle?: string;
  fallbackCompact?: boolean;
};

export default function SafeImage({
  src,
  alt,
  fallbackTitle,
  fallbackCompact,
  ...props
}: SafeImageProps) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return <PhotoUnavailable title={fallbackTitle || alt} compact={fallbackCompact} />;
  }

  return (
    <Image
      {...props}
      src={src}
      alt={alt}
      onError={() => setHasError(true)}
    />
  );
}
