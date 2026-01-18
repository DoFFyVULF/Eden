import { axiosWithAuth } from "@/api/interceptors";
import type { IMasterSchedule } from "@/types/schedule.types";

export const masterScheduleService = {
  async getAll(): Promise<IMasterSchedule[]> {
    const { data } = await axiosWithAuth.get<IMasterSchedule[]>(
      "/master-schedule"
    );
    return data;
  },

  async getByMaster(masterId: number): Promise<IMasterSchedule[]> {
    const { data } = await axiosWithAuth.get<IMasterSchedule[]>(
      `/master-schedule?masterId=${masterId}`
    );
    return data;
  },

  async getById(id: number): Promise<IMasterSchedule> {
    const { data } = await axiosWithAuth.get<IMasterSchedule>(
      `/master-schedule/${id}`
    );
    return data;
  },

  async create(dto: {
    masterId: number;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }): Promise<IMasterSchedule> {
    const { data } = await axiosWithAuth.post<IMasterSchedule>(
      "/master-schedule",
      dto
    );
    return data;
  },

  async update(
    id: number,
    dto: Partial<{
      masterId: number;
      dayOfWeek: number;
      startTime: string;
      endTime: string;
    }>
  ): Promise<IMasterSchedule> {
    const { data } = await axiosWithAuth.patch<IMasterSchedule>(
      `/master-schedule/${id}`,
      dto
    );
    return data;
  },

  async delete(id: number): Promise<void> {
    await axiosWithAuth.delete(`/master-schedule/${id}`);
  },
};
