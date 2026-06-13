import type { Metadata } from "next";
import AppointmentClient from "./AppointmentClient";
import { publicDataService } from "@/services/public/public-data.service";
import { IPublicAppointmentPageData } from "@/types/public-data.types";

export const revalidate = 300;
export const dynamic = "force-dynamic";

export async function generateMetadata() {
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

export default async function AppointmentPage() {
  let initialData: IPublicAppointmentPageData | null = null;
  try {
    initialData = await publicDataService.getAppointmentPageData();
  } catch (error) {
    console.error("Failed to preload appointment page data", error);
  }
  if (!initialData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-[color:var(--public-text-soft)]">
          Не удалось загрузить данные. Обновите страницу.
        </p>
      </div>
    );
  }
  return <AppointmentClient initialData={initialData} />;
}