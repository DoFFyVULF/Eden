// Базовые типы из Prisma (частично)
export enum AppointmentStatus {
  Новый = "Новый",
  Подтвержден = "Подтвержден",
  Завершен = "Завершен",
  Отменен = "Отменен"
}



export interface IMasterLite {
  id: number;
  surname: string;
  name: string;
  middlename: string;
  specialization: string;
}

export interface IServiceLite {
  id: number;
  title: string;
  duration: number;
}

export interface IAppointment {
  id: number;
  clientSurname: string;
  clientName: string;
  clientPhone: string;
  appointmentTime: string; 
  price: number; 
  status: AppointmentStatus;

  master: IMasterLite;
  service: IServiceLite;

  createdAt: string;
  updatedAt: string;
}

// DTO для создания/обновления
export interface ICreateAppointmentDto {
  serviceId: number;
  masterId: number;
  appointmentTime: string;  // ISO строка
  price: number;
  clientSurname: string;
  clientName: string;
  clientPhone: string;
  comment?: string;
  status: AppointmentStatus;
}

export interface IUpdateAppointmentDto {
  clientSurname?: string;
  clientName?: string;
  clientPhone?: string;
  masterId?: number;
  serviceId?: number;
  appointmentTime?: string;
  price?: number;
  status?: AppointmentStatus;
}