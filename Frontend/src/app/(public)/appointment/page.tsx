import type { Metadata } from "next";
import AppointmentClient from "./AppointmentClient";
import { staticAppointmentPageData } from "@/app/data/appointment/staticAppointmentData";

// Полностью статическая страница — без запросов к БД/API
export const dynamic = "force-static";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Онлайн-запись",
    description:
      "Запишитесь онлайн в салон красоты Эден в Перми. Выберите услугу, мастера и удобное время без звонков — быстро и понятно.",
    openGraph: {
      title: "Онлайн-запись — салон красоты Эден",
      description:
        "Запишитесь онлайн в салон красоты Эден. Выберите услугу, мастера и удобное время без звонков.",
    },
  };
}

export default function AppointmentPage() {
  return <AppointmentClient initialData={staticAppointmentPageData} />;
}
