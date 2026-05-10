import { axiosClassic, axiosWithAuth } from "@/api/interceptors";
import {
  IAppointment,
  ICreateAppointmentDto,
  IUpdateAppointmentDto,
} from "@/types/appointment.types";

const PUBLIC_APPOINTMENT_FINGERPRINT_KEY = "public-appointment-device-id";

function getPublicAppointmentFingerprint() {
  if (typeof window === "undefined") return undefined;

  const existingFingerprint = window.localStorage.getItem(
    PUBLIC_APPOINTMENT_FINGERPRINT_KEY
  );

  if (existingFingerprint) return existingFingerprint;

  const fingerprint =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  window.localStorage.setItem(
    PUBLIC_APPOINTMENT_FINGERPRINT_KEY,
    fingerprint
  );

  return fingerprint;
}

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

  async createPublic(dto: ICreateAppointmentDto): Promise<IAppointment> {
    const fingerprint = getPublicAppointmentFingerprint();

    const { data } = await axiosClassic.post<IAppointment>(
      "/appointment/public",
      dto,
      {
        headers: fingerprint
          ? { "X-Client-Fingerprint": fingerprint }
          : undefined,
      }
    );
    return data;
  },

  async createAdmin(dto: ICreateAppointmentDto): Promise<IAppointment> {
    const { data } = await axiosWithAuth.post<IAppointment>(
      "/appointment/admin",
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

    const { data } = await axiosClassic.get<IAppointment[]>("/appointment", {
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
