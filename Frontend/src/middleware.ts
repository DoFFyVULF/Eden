// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { EnumTokens } from "./services/auth/auth-token.service";

export async function middleware(request: NextRequest) {
  const { url, cookies } = request;
  const refreshToken = cookies.get(EnumTokens.REFRESH_TOKEN)?.value;
  const role = cookies.get("user-role")?.value; // Получаем роль из кук

  const isAuthPage = url.includes('/auth');
  const isAdminPath = url.includes('/administration');
  const isMasterPath = url.includes('/master');

  // 1. Если залогинен и лезет на /auth
  if (isAuthPage && refreshToken) {
    const dashboard = role === 'admin' ? '/administration' : '/master';
    return NextResponse.redirect(new URL(dashboard, url));
  }

  // 2. Если НЕ залогинен и лезет в защищенную зону
  if (!isAuthPage && !refreshToken) {
    return NextResponse.redirect(new URL('/auth', url));
  }

  // 3. Защита от "чужих" страниц (RBAC)
  if (refreshToken && role) {
    if (isAdminPath && role !== 'admin') {
      return NextResponse.redirect(new URL('/master', url));
    }
    if (isMasterPath && role !== 'master') {
      return NextResponse.redirect(new URL('/administration', url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/administration/:path*", "/master/:path*", "/auth/:path*"],
};