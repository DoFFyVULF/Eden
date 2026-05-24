import type { Metadata } from "next";
import AppointmentClient from "./AppointmentClient";

export const metadata: Metadata = {
  title: "Онлайн-запись",
  description:
    "Запишитесь онлайн в салон красоты Эден в Перми. Выберите услугу, мастера и удобное время без звонков — быстро и понятно.",
  openGraph: {
    title: "Онлайн-запись — салон красоты Эден",
    description:
      "Запишитесь онлайн в салон красоты Эден. Выберите услугу, мастера и удобное время без звонков.",
  },
};

export default function AppointmentPage() {
  return <AppointmentClient />;
}