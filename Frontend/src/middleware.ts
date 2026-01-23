import { NextRequest, NextResponse } from "next/server";
import { EnumTokens } from "./services/auth/auth-token.service";
import { ADMIN_ROUTES } from "./app/lib/admin_routres";

export async function middleware(request: NextRequest) {
  const { url, cookies } = request;

  const refreshToken = cookies.get(EnumTokens.REFRESH_TOKEN)?.value;
  const isAuthPage = url.includes('/auth');

  // Если пользователь авторизован и пытается попасть на /auth
  if (isAuthPage && refreshToken) {
    return NextResponse.redirect(new URL(ADMIN_ROUTES.DASHBOARD, url));
  }

  // Если пользователь на странице авторизации
  if (isAuthPage) {
    return NextResponse.next();
  }

  // Если пользователь не авторизован и пытается попасть в админку
  if (!refreshToken) {
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/administration/:path*", "/auth/:path*"],
};
