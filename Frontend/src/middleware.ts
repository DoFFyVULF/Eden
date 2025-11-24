import { NextRequest, NextResponse } from "next/server";
import { EnumTokens } from "./services/auth/auth-token.service";
import { ADMIN_ROUTES } from "./app/lib/admin_routres";

export async function middleware(request: NextRequest, response: NextResponse) {
  const { url, cookies } = request;

  const refreshToken = cookies.get(EnumTokens.REFRESH_TOKEN)?.value
  
  const isAuthPage = url.includes('/auth')

  if (isAuthPage && refreshToken) {
    return NextResponse.redirect(new URL(ADMIN_ROUTES.DASHBOARD, url))
  }

  if (isAuthPage) {
    return NextResponse.next()
  }

  if (!refreshToken) {
    return NextResponse.redirect(new URL('/administration/auth', request.url))
  }
}

export const config = {
  matcher: ["/administration/:path*", "/administration/auth/:path*"],
};
