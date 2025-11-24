import { axiosClassic } from "@/api/interceptors";
import { IMaster } from "@/types/masters.type";

export const masterService = {
  async getAll(): Promise<IMaster[]> {
    const { data } = await axiosClassic.get<IMaster[]>("/master");
    return data;
  },

  async getById(id: number): Promise<IMaster> {
    const { data } = await axiosClassic.get<IMaster>(`/master/${id}`);
    return data;
  },

  async create(dto: {
    name: string;
    surname: string;
    middlename: string;
    specialization: string;
    photo: string;
    phone?: string;
    isActive?: boolean;
  }): Promise<IMaster> {
    const { data } = await axiosClassic.post<IMaster>(`/master`, {
      name: dto.name,
      surname: dto.surname,
      middlename: dto.middlename,
      specialization: dto.specialization,
      photo: dto.photo || null,
      phone: dto.phone,
      isActive: dto.isActive ?? true,
    });

    return data;
  },

  async update(
    id: number,
    dto: {
      name?: string;
      surname?: string;
      middlename?: string;
      specialization?: string;
      photo?: string;
      phone?: string;
      isActive?: boolean;
    }
  ): Promise<IMaster> {
    const { data } = await axiosClassic.patch<IMaster>(`/master/${id}`, dto);
    return data;
  },

  async delete(id: number): Promise<void> {
    await axiosClassic.delete(`/master/${id}`);
  },
};
