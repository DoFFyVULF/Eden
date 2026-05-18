import { Cormorant_Garamond, Inter } from "next/font/google";

export const cormorant = Cormorant_Garamond({
  weight: ["400", "500", "600"],
  subsets: ["latin", "cyrillic"],
  variable: "--font-public-display",
});

export const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-public-body",
});
