import { axiosWithAuth } from "@/api/interceptors";
import { ICategory } from "@/types/category.types";

export const categoryService = {
  async getAll(): Promise<ICategory[]> {
    const { data } = await axiosWithAuth.get<ICategory[]>("/category");
    return data;
  },

  async getById(id: number): Promise<ICategory> {
    const { data } = await axiosWithAuth.get<ICategory>(`/category/${id}`);
    return data;
  },

  async create(dto: { title: string; description: string; isActive?: boolean }): Promise<ICategory> {
    const { data } = await axiosWithAuth.post<ICategory>("/category", {
      title: dto.title,
      description: dto.description,
      isActive: dto.isActive ?? true
    });
    return data;
  },

  async update(
    id: number,
    dto: { title: string; description: string; isActive?: boolean}
  ): Promise<ICategory> {
    const { data } = await axiosWithAuth.patch<ICategory>(`/category/${id}`, dto);
    return data;
  },

  async delete(id: number): Promise<{ message: string }> {
    const { data } = await axiosWithAuth.delete<{ message: string }>(
      `/category/${id}`
    );
    return data;
  },
};