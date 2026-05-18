import {
  getAccessToken,
  removeFromStorage,
} from "@/services/auth/auth-token.service";
import axios, { CreateAxiosDefaults } from "axios";
import { authService } from "@/services/auth/auth.service";

const browserApiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL?.trim() || "http://localhost:4200/api";

const serverApiBaseUrl =
  process.env.INTERNAL_API_URL?.trim() ||
  process.env.NEXT_PUBLIC_API_URL?.trim() ||
  "http://backend:4200/api";

const apiBaseUrl =
  typeof window === "undefined" ? serverApiBaseUrl : browserApiBaseUrl;

const options: CreateAxiosDefaults = {
  baseURL: apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
};

const axiosClassic = axios.create(options);

const axiosWithAuth = axios.create(options);

axiosWithAuth.interceptors.request.use((config) => {
  const accessToken = getAccessToken();

  if (config?.headers && accessToken)
    config.headers.Authorization = `Bearer ${accessToken}`;

  return config;
});

axiosWithAuth.interceptors.response.use(
  (config) => config,
  async (error) => {
    const originalRequest = error.config;

    if (
      error?.response?.status === 401 &&
      originalRequest &&
      !originalRequest._isRetry
    ) {
      originalRequest._isRetry = true;

      try {
        await authService.getNewToken();
        return axiosWithAuth.request(originalRequest);
      } catch (e) {
        removeFromStorage();
      }
    }

    throw error;
  }
);

export { axiosClassic, axiosWithAuth };
