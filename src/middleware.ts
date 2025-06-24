import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get("codes-auth-session-cookie");
  const { pathname } = request.nextUrl;

  // Các route không cần xác thực
  const publicRoutes = ["/login", "/register"];
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Nếu đã đăng nhập và đang truy cập route công khai (login/register)
  if (authCookie && isPublicRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Nếu chưa đăng nhập và đang truy cập route cần xác thực
  if (!authCookie && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

// Chỉ áp dụng middleware cho các route cần thiết
export const config = {
  matcher: ["/", "/login", "/register", "/form-codes/:path*"],
};
