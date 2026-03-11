import { axiosWithAuth } from "@/api/interceptors";
import { IMaster } from "@/types/masters.type";

export const masterService = {
  async getAll(): Promise<IMaster[]> {
    const { data } = await axiosWithAuth.get<IMaster[]>("/master");
    return data;
  },

  async getById(id: number): Promise<IMaster> {
    const { data } = await axiosWithAuth.get<IMaster>(`/master/${id}`);
    return data;
  },

  // В master.service.ts
  async getActiveMastersCount(): Promise<number> {
    try {
      // Получаем всех мастеров с сервера
      const { data } = await axiosWithAuth.get<IMaster[]>("/master");

      // Фильтруем активных на клиенте
      const activeMasters = data.filter((master) => master.isActive === true);

      // Возвращаем количество
      return activeMasters.length;
    } catch (error) {
      return 0; // Возвращаем 0 в случае ошибки
    }
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
    const { data } = await axiosWithAuth.post<IMaster>(`/master`, {
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
    },
  ): Promise<IMaster> {
    const { data } = await axiosWithAuth.patch<IMaster>(`/master/${id}`, dto);
    return data;
  },

  async delete(id: number): Promise<void> {
    await axiosWithAuth.delete(`/master/${id}`);
  },
};
