import type { Metadata } from "next";
import { cormorant, inter } from "../fonts";
import Header from "../components/ui/public/header/Header";
import Footer from "../components/ui/public/footer/Footer";
import PageTransition from "./PageTransition";

export const metadata: Metadata = {
  title: {
    default: "Эден",
    template: "%s | Эден",
  },
  description: "Салон красоты Эден в Перми. Услуги, цены, мастера. Аккуратная работа и заметный результат.",
  openGraph: {
    title: "Эден — салон красоты",
    description: "Салон красоты Эден в Перми. Услуги, цены, мастера. Аккуратная работа и заметный результат.",
    locale: "ru_RU",
    type: "website",
    siteName: "Эден",
  },
  twitter: {
    card: "summary_large_image",
    title: "Эден — салон красоты",
    description: "Салон красоты Эден в Перми. Услуги, цены, мастера.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div
      className={`${cormorant.variable} ${inter.variable} public-shell flex min-h-screen flex-col antialiased`}
    >
      <Header hideOnScroll={false} />
      
      {/* ✨ Плавные переходы вынесены в отдельный клиентский компонент */}
      <PageTransition>{children}</PageTransition>
      
      <Footer />
    </div>
  );
}
