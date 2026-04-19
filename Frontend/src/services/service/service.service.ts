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
  description?: string;
  duration: number;
  isActive: boolean;
  img: string;
  categoryId: number;
}): Promise<IService> {
  // Валидация
  if (!dto.title?.trim()) throw new Error("Название обязательно");
  if (dto.duration <= 0) throw new Error("Продолжительность должна быть > 0");
  if (dto.categoryId <= 0) throw new Error("Категория обязательна");

  // ИЗМЕНЕНИЕ ЗДЕСЬ:
  // Если описание пустое, лучше вообще не передавать ключ или передать null,
  // чтобы сработала дефолтная wartość в БД, а не валидатор "не пусто".
  const descriptionValue = dto.description?.trim();
  
  const { data } = await axiosWithAuth.post<IService>("/service", {
    title: dto.title.trim(),
    // Если descriptionValue пуст, передаем null. 
    // Если ваш DTO на бэкенде позволяет undefined/null, это решит проблему.
    description: descriptionValue || null, 
    duration: dto.duration,
    isActive: dto.isActive,
    img: dto.img,
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
      img: string;
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
