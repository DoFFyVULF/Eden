import { axiosClassic } from "@/api/interceptors";
import { IService } from "@/types/services.types";

export const serviceService = {
  async getAll(): Promise<IService[]> {
    const { data } = await axiosClassic.get<IService[]>("/service");
    return data;
  },

  async getById(id: number): Promise<IService> {
    const { data } = await axiosClassic.get<IService>(`/service/${id}`);
    return data;
  },

  async create(dto: {
    title: string;
    description: string;
    duration: number;
    isActive: boolean;
    categoryId: number;
  }): Promise<IService> {
    const { data } = await axiosClassic.post<IService>("/service", {
      title: dto.title,
      description: dto.description,
      duration: dto.duration,
      isActive: dto.isActive ?? true,
      categoryId: dto.categoryId
    });

    return data;
  },

  async update(
    id: number,
    dto: {
      title: string;
      description: string;
      duration: number;
      isActive: boolean;
    }
  ): Promise<IService> {
    const { data } = await axiosClassic.patch<IService>(`/service/${id}`, dto);
    return data;
  },

  async delete(id: number): Promise<{ message: string }> {
    const { data } = await axiosClassic.delete<{ message: string }>(
      `/service/${id}`
    );
    return data;
  },
};
