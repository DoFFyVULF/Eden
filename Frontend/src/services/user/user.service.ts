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
      role: "master",
    });
  },

  getMe() {
    return axiosWithAuth.get<IUser>("/user/me");
  },

  getAllMastersUsers() {
    return axiosWithAuth.get<IUser[]>("/user/master");
  },

  getAllAdminsUsers() {
    return axiosWithAuth.get<IUser[]>("/user/admin");
  },

  deleteMasterUser(id: number) {
    return axiosWithAuth.delete(`/user/master/${id}`);
  },

  // Изменение пароля текущего пользователя
  changeMyPassword(password: string) {
    return axiosWithAuth.put("/user/me/password", { password });
  },

  // Сброс пароля другого пользователя (только админ)
  resetUserPassword(userId: number, password: string) {
    return axiosWithAuth.put(`/user/master/${userId}/password`, { password });
  },

  // Альтернативный вариант через основной контроллер
  resetPassword(userId: number, password: string) {
    return axiosWithAuth.put(`/user/${userId}/password`, { password });
  }
};