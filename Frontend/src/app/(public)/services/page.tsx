import type { Metadata } from "next";
import ServicesClient from "./ServicesClient";

export const metadata: Metadata = {
  title: "Услуги",
  description:
    "Каталог услуг салона красоты Эден в Перми. Стрижки, окрашивание, маникюр, педикюр, уходовые процедуры — всё с прозрачными ценами и онлайн-записью.",
  openGraph: {
    title: "Услуги — салон красоты Эден",
    description:
      "Каталог услуг салона красоты Эден в Перми. Стрижки, окрашивание, маникюр, педикюр, уходовые процедуры.",
  },
};

export default function ServicesPage() {
  return <ServicesClient />;
}