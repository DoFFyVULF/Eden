import type { Metadata } from "next";
import { cormorant, inter } from "../layout";
import Header from "../components/ui/public/header/Header";
import Footer from "../components/ui/public/footer/Footer";
import PageTransition from "./PageTransition";

export const metadata: Metadata = {
  title: "Эден",
  description: "Салон красоты",
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