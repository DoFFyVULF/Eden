import { axiosWithAuth } from "@/api/interceptors";

export interface AdminCounts {
  appointments: number;
  activeAppointments: number;
  category: number;
  services: number;
  masters: number;
  schedule: number;
  history: number;
  users: number;
}

export const adminService = {
  async getCounts(): Promise<AdminCounts> {
    const { data } = await axiosWithAuth.get<AdminCounts>("/stats/counts");
    return data;
  },
};
