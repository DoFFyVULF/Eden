import { IUser } from "./user.types";

export interface IAuthForm {
  login: string;
  password: string;
}

export interface IAuthResponse {
  accessToken: string;
  user: IUser;
}
