import { axiosWithAuth } from "@/api/interceptors";
import type {
  CreateScheduleSuggestionDto,
  IMasterSchedule,
  IScheduleSuggestion,
  IMasterTimeOff,
  MasterStatusInfo,
} from "@/types/schedule.types";

export type CreateTimeOffDto = {
  masterId: number;
  startDate: string;
  endDate: string;
  type?: "vacation" | "sick_leave" | "day_off" | "other";
  comment?: string;
};

export type UpdateTimeOffDto = {
  startDate?: string;
  endDate?: string;
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
    const { data } =
      await axiosWithAuth.get<IMasterSchedule[]>("/master-schedule");
    return data.filter(
      (s) => s.masterId === masterId || s.master?.id === masterId,
    );
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

  async getSuggestions(): Promise<IScheduleSuggestion[]> {
    const { data } = await axiosWithAuth.get<IScheduleSuggestion[]>(
      "/master-schedule/suggestions",
    );
    return data;
  },

  async createSuggestion(
    dto: CreateScheduleSuggestionDto,
  ): Promise<IScheduleSuggestion> {
    const { data } = await axiosWithAuth.post<IScheduleSuggestion>(
      "/master-schedule/suggestions",
      dto,
    );
    return data;
  },

  async acceptSuggestion(id: number): Promise<IScheduleSuggestion> {
    const { data } = await axiosWithAuth.patch<IScheduleSuggestion>(
      `/master-schedule/suggestions/${id}/accept`,
    );
    return data;
  },

  async rejectSuggestion(id: number): Promise<IScheduleSuggestion> {
    const { data } = await axiosWithAuth.patch<IScheduleSuggestion>(
      `/master-schedule/suggestions/${id}/reject`,
    );
    return data;
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
    // Ensure dates are in proper ISO format
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new Error("Invalid date format");
    }

    console.log("📤 [TimeOff] Sending to backend:", {
      masterId: dto.masterId,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      type: dto.type,
      comment: dto.comment,
    });

    const { data } = await axiosWithAuth.post<IMasterTimeOff>(
      `/master-schedule/${dto.masterId}/time-off`,
      {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        type: dto.type,
        comment: dto.comment,
      },
    );
    return data;
  },

  async deleteTimeOff(id: number): Promise<void> {
    await axiosWithAuth.delete(`/master-schedule/time-off/${id}`);
  },

  async updateTimeOff(
    id: number,
    dto: UpdateTimeOffDto,
  ): Promise<IMasterTimeOff> {
    // Ensure dates are in proper ISO format if provided
    const formattedDto: any = {};

    if (dto.startDate) {
      const startDate = new Date(dto.startDate);
      if (isNaN(startDate.getTime())) {
        throw new Error("Invalid start date format");
      }
      formattedDto.startDate = startDate.toISOString();
    }

    if (dto.endDate) {
      const endDate = new Date(dto.endDate);
      if (isNaN(endDate.getTime())) {
        throw new Error("Invalid end date format");
      }
      formattedDto.endDate = endDate.toISOString();
    }

    if (dto.type) formattedDto.type = dto.type;
    if (dto.comment !== undefined) formattedDto.comment = dto.comment;

    console.log("📤 [TimeOff] Updating:", { id, dto: formattedDto });

    const { data } = await axiosWithAuth.patch<IMasterTimeOff>(
      `/master-schedule/time-off/${id}`,
      formattedDto,
    );
    return data;
  },
};
