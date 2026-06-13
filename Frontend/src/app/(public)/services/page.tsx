import type { Metadata } from "next";
import ServicesClient from "./ServicesClient";
import { publicDataService } from "@/services/public/public-data.service";
import { IPublicServicesPageData } from "@/types/public-data.types";

export const revalidate = 300; // 5 minutes ISR
export const dynamic = "force-dynamic";

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

export default async function ServicesPage() {
  let initialData: IPublicServicesPageData | null = null;
  try {
    initialData = await publicDataService.getServicesPageData();
  } catch (error) {
    console.error("Failed to preload services page data", error);
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
  return <ServicesClient initialData={initialData} />;
}