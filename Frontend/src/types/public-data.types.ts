import { ICategory } from "@/types/category.types";
import { IMaster } from "@/types/masters.type";
import { IMasterSchedule } from "@/types/schedule.types";
import { IServicePrice } from "@/types/service-price.types";
import { IService } from "@/types/services.types";

export interface IPublicServicesPageData {
  services: IService[];
  activeMastersCount: number;
}

export interface IPublicAppointmentPageData {
  categories: ICategory[];
  services: IService[];
  masters: IMaster[];
  prices: IServicePrice[];
  schedules: IMasterSchedule[];
}
