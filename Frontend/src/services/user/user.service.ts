import { axiosWithAuth } from "@/api/interceptors";
import { IUser } from "@/types/user.types";

export const userService = {
  createMasterUser(data: {
    login: string;
    password: string;
    masterId: number;
  }) {
    return axiosWithAuth.post<IUser>("/user/master", {
      ...data,
      role: "master", // Добавляем роль, чтобы пройти валидацию @IsEnum(Role)
    });
  },

  getMe() {
    return axiosWithAuth.get<IUser>("/user/me");
  },

  getAllMastersUsers() {
    return axiosWithAuth.get<IUser[]>("/user/master");
  },

  deleteMasterUser(id: number) {
    return axiosWithAuth.delete(`/user/master/${id}`);
  },
};
