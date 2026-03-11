import { axiosWithAuth } from "@/api/interceptors";
import {
  IAppointment,
  ICreateAppointmentDto,
  IUpdateAppointmentDto,
} from "@/types/appointment.types";

export const appointmentService = {
  async getAll(): Promise<IAppointment[]> {
    const { data } = await axiosWithAuth.get<IAppointment[]>("/appointment");
    return data;
  },

  async getById(id: number): Promise<IAppointment> {
    const { data } = await axiosWithAuth.get<IAppointment>(
      `/appointment/${id}`
    );
    return data;
  },

  async create(dto: ICreateAppointmentDto): Promise<IAppointment> {
    const { data } = await axiosWithAuth.post<IAppointment>(
      "/appointment",
      dto
    );
    return data;
  },

  async update(id: number, dto: IUpdateAppointmentDto): Promise<IAppointment> {
    const { data } = await axiosWithAuth.patch<IAppointment>(
      `/appointment/${id}`,
      dto
    );
    return data;
  },

  async complete(id: number): Promise<IAppointment> {
    const { data } = await axiosWithAuth.patch<IAppointment>(
      `/appointment/${id}`,
      { status: "Завершен" }
    );
    return data;
  },

  async delete(id: number): Promise<{ message: string }> {
    const { data } = await axiosWithAuth.delete<{ message: string }>(
      `/appointment/${id}`
    );
    return data;
  },

  async getByDate(date: string, masterId?: number): Promise<IAppointment[]> {
    const params: any = { date };
    if (masterId !== undefined) params.masterId = masterId;

    const { data } = await axiosWithAuth.get<IAppointment[]>("/appointment", {
      params,
    });

    return data;
  },

  async getCompleted(): Promise<IAppointment[]> {
    const { data } = await axiosWithAuth.get<IAppointment[]>("/appointment", {
      params: { status: "Завершен" },
    });
    return data;
  },
};