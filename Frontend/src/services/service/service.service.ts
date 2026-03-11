import { axiosWithAuth } from "@/api/interceptors";
import { IService } from "@/types/services.types";

export const serviceService = {
  async getAll(): Promise<IService[]> {
    const { data } = await axiosWithAuth.get<IService[]>("/service");
    return data;
  },

  async getById(id: number): Promise<IService> {
    const { data } = await axiosWithAuth.get<IService>(`/service/${id}`);
    return data;
  },

  async getCount(): Promise<number> {
    const { data } = await axiosWithAuth.get<IService[]>("/service");
    
    const serviceCount = data.filter(service => service.isActive === true)

    return serviceCount.length;
  },

  async create(dto: {
    title: string;
    description: string;
    duration: number;
    isActive: boolean;
    categoryId: number;
  }): Promise<IService> {
    // ✅ Валидация на фронтенде (защита от 400)
    if (!dto.title?.trim()) {
      throw new Error("Название услуги обязательно");
    }
    if (!dto.description) dto.description = "";
    if (dto.duration <= 0) {
      throw new Error("Продолжительность должна быть положительной");
    }
    if (dto.categoryId <= 0) {
      throw new Error("Выберите категорию");
    }

    const { data } = await axiosWithAuth.post<IService>("/service", {
      title: dto.title.trim(),
      description: dto.description.trim(),
      duration: dto.duration,
      isActive: dto.isActive, 
      categoryId: dto.categoryId, 
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
    const { data } = await axiosWithAuth.patch<IService>(`/service/${id}`, dto);
    return data;
  },

  async delete(id: number): Promise<{ message: string }> {
    const { data } = await axiosWithAuth.delete<{ message: string }>(
      `/service/${id}`
    );
    return data;
  },
};
