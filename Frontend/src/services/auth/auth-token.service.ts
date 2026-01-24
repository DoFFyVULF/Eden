import Cookies from "js-cookie";

export enum EnumTokens {
  ACCESS_TOKEN = "accessToken",
  REFRESH_TOKEN = "refreshToken",
}

export const getAccessToken = () => {
  return Cookies.get(EnumTokens.ACCESS_TOKEN) || null;
};

export const saveTokenStorage = (accessToken: string) => {
  Cookies.set(EnumTokens.ACCESS_TOKEN, accessToken, {
    sameSite: "strict",
    expires: 1,
    path: "/", // ⬅️ важно
  });

  // 🔔 уведомляем layout
  window.dispatchEvent(new Event("auth-changed"));
};

export const removeFromStorage = () => {
  Cookies.remove(EnumTokens.ACCESS_TOKEN, {
    path: "/", // ⬅️ ОБЯЗАТЕЛЬНО
  });

  // 🔔 уведомляем layout
  window.dispatchEvent(new Event("auth-changed"));
};

export const getRoleFromCookie = () => {
  return Cookies.get("role") || null;
};
