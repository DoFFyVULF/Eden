import { axiosClassic } from "@/api/interceptors";
import { IServicePrice } from "@/types/service-price.types";

export const servicePriceService = {
  async getAll(): Promise<IServicePrice[]> {
    const { data } = await axiosClassic.get<IServicePrice[]>("/service-price");
    return data;
  },

  async getById(id: number): Promise<IServicePrice> {
    const { data } = await axiosClassic.get<IServicePrice>(
      `/service-price/${id}`
    );
    return data;
  },

  async create(dto: {
    serviceId: number;
    masterId: number;
    price: number;
    isActive: boolean;
  }): Promise<IServicePrice> {
    const { data } = await axiosClassic.post<IServicePrice>("/service-price", {
      serviceId: dto.serviceId,
      masterId: dto.masterId,
      price: dto.price,
      isActive: dto.isActive ?? true,
    });

    return data;
  },

  async update(
    id: number,
    dto: {
      serviceId: number;
      masterId: number;
      price: number;
      isActive: boolean;
    }
  ): Promise<IServicePrice> {
    const { data } = await axiosClassic.patch<IServicePrice>(
      `/service-price/${id}`,
      dto
    );
    return data;
  },

  async delete(id: number): Promise<{ message: string }> {
    const { data } = await axiosClassic.delete<{ message: string }>(
      `/service/${id}`
    );
    return data;
  },
};
