import { axiosClassic } from "@/api/interceptors";
import { ICategory } from "@/types/category.types";

export const categoryService = {
  async getAll(): Promise<ICategory[]> {
    const { data } = await axiosClassic.get<ICategory[]>("/category");
    return data;
  },

  async getById(id: number): Promise<ICategory> {
    const { data } = await axiosClassic.get<ICategory>(`/category/${id}`);
    return data;
  },

  async create(dto: { title: string; isActive?: boolean }): Promise<ICategory> {
    const { data } = await axiosClassic.post<ICategory>("/category", {
      title: dto.title,
      isActive: dto.isActive ?? true
    });
    return data;
  },

  async update(
    id: number,
    dto: { title?: string; isActive?: boolean }
  ): Promise<ICategory> {
    const { data } = await axiosClassic.patch<ICategory>(`/category/${id}`, dto);
    return data;
  },

  async delete(id: number): Promise<{ message: string }> {
    const { data } = await axiosClassic.delete<{ message: string }>(
      `/category/${id}`
    );
    return data;
  },
};