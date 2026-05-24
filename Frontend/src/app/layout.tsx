import type { Metadata, Viewport } from "next";
import { cormorant, inter } from "./fonts";
import "../styles/globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || process.env.FRONTEND_ORIGIN || "http://localhost:3000";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf6f0" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1a1a" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Салон красоты Эден | Пермь",
    template: "%s | Эден",
  },
  description:
    "«Эден» — салон красоты в Перми. Уютное пространство без пафоса: стрижки, окрашивание, маникюр, педикюр, уходовые процедуры. Онлайн-запись, мастера с опытом.",
  applicationName: "Эден",
  keywords: [
    "салон красоты Пермь",
    "парикмахерская Пермь",
    "маникюр Пермь",
    "педикюр Пермь",
    "окрашивание Пермь",
    "уход за волосами Пермь",
    "Эден",
    "салон красоты",
  ],
  authors: [{ name: "Эден" }],
  creator: "Эден",
  publisher: "Эден",
  formatDetection: {
    telephone: true,
    email: false,
    address: true,
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: "Эден",
    title: "Салон красоты Эден | Пермь",
    description:
      "Уютное пространство без пафоса: понятные услуги, удобная онлайн-запись и атмосфера, в которой приятно находиться.",
    url: SITE_URL,
    countryName: "Россия",
  },
  twitter: {
    card: "summary_large_image",
    title: "Салон красоты Эден | Пермь",
    description:
      "Уютное пространство без пафоса: понятные услуги, удобная онлайн-запись и атмосфера, в которой приятно находиться.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
  category: "beauty",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body
        className={`${inter.className} ${cormorant.variable} ${inter.variable} public-body bg-[rgba(177,141,97,0.14)] antialiased flex flex-col min-h-screen`}
      >
        <main>{children}</main>
      </body>
    </html>
  );
}