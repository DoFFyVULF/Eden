import { axiosWithAuth } from "@/api/interceptors";
import type { IMasterSchedule, IMasterTimeOff, MasterStatusInfo } from "@/types/schedule.types";

// Тип для создания периода недоступности
export type CreateTimeOffDto = {
  masterId: number;
  startDate: string; // ISO строка: "2026-04-01T00:00:00.000Z"
  endDate: string; // ISO строка
  type?: "vacation" | "sick_leave" | "day_off" | "other";
  comment?: string;
};

export const masterScheduleService = {
  // === Методы для рабочего расписания ===

  async getAll(): Promise<IMasterSchedule[]> {
    const { data } =
      await axiosWithAuth.get<IMasterSchedule[]>("/master-schedule");
    return data;
  },

  async getByMaster(masterId: number): Promise<IMasterSchedule[]> {
    const { data } = await axiosWithAuth.get<IMasterSchedule[]>(
      `/master-schedule?masterId=${masterId}`,
    );
    return data;
  },

  async getById(id: number): Promise<IMasterSchedule> {
    const { data } = await axiosWithAuth.get<IMasterSchedule>(
      `/master-schedule/${id}`,
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
      dto,
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
    }>,
  ): Promise<IMasterSchedule> {
    const { data } = await axiosWithAuth.patch<IMasterSchedule>(
      `/master-schedule/${id}`,
      dto,
    );
    return data;
  },

  async delete(id: number): Promise<void> {
    await axiosWithAuth.delete(`/master-schedule/${id}`);
  },

  async getTimeOffByMaster(masterId: number): Promise<IMasterTimeOff[]> {
    const { data } = await axiosWithAuth.get<IMasterTimeOff[]>(
      `/master-schedule/${masterId}/time-off`,
    );
    return data;
  },

  async getMasterStatus(masterId: number): Promise<MasterStatusInfo> {
    const { data } = await axiosWithAuth.get<MasterStatusInfo>(
      `/master-schedule/${masterId}/status`,
    );
    return data;
  },

  async createTimeOff(dto: CreateTimeOffDto): Promise<IMasterTimeOff> {
    const { data } = await axiosWithAuth.post<IMasterTimeOff>(
      `/master-schedule/${dto.masterId}/time-off`,
      {
        startDate: dto.startDate,
        endDate: dto.endDate,
        type: dto.type,
        comment: dto.comment,
      },
    );
    return data;
  },

  async deleteTimeOff(id: number): Promise<void> {
    await axiosWithAuth.delete(`/master-schedule/time-off/${id}`);
  },
};
