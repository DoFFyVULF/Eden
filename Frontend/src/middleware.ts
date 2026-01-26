// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { EnumTokens } from "./services/auth/auth-token.service";

export async function middleware(request: NextRequest) {
  const { nextUrl, cookies } = request; // Используем nextUrl
  const pathname = nextUrl.pathname;
  
  const refreshToken = cookies.get(EnumTokens.REFRESH_TOKEN)?.value;
  const role = cookies.get("user-role")?.value;

  const isAuthPage = pathname.startsWith('/auth');
  const isAdminPath = pathname.startsWith('/administration');
  const isMasterPath = pathname.startsWith('/master');

  // 1. Если залогинен и лезет на /auth
  if (isAuthPage && refreshToken) {
    const dashboard = role === 'admin' ? '/administration' : '/master';
    return NextResponse.redirect(new URL(dashboard, request.url));
  }

  // 2. Если НЕ залогинен и лезет в защищенную зону
  if (!isAuthPage && !refreshToken) {
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  // 3. Защита от "чужих" зон (RBAC)
  if (refreshToken && role) {
    // Если путь начинается с /administration, а ты не админ
    if (isAdminPath && role !== 'admin') {
      return NextResponse.redirect(new URL('/master', request.url));
    }
    // Если путь начинается с /master (и это НЕ админская панель), а ты не мастер
    // Добавляем проверку !isAdminPath, чтобы админ мог ходить по своим вложенным путям
    if (isMasterPath && !isAdminPath && role !== 'master') {
      return NextResponse.redirect(new URL('/administration', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/administration/:path*", "/master/:path*", "/auth/:path*"],
};