import { NextRequest, NextResponse } from "next/server";

const ADMIN_COOKIE = "ds_admin_session";

function unauthorizedApi() {
  return NextResponse.json(
    { ok: false, error: "Unauthorized" },
    { status: 401 },
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isLoginPage = pathname === "/admin/login";
  const isLoginApi = pathname === "/api/admin/login";

  if (isLoginPage || isLoginApi) {
    return NextResponse.next();
  }

  const expectedSession =
    process.env.ADMIN_SESSION_SECRET;

  if (!expectedSession) {
    if (pathname.startsWith("/api/admin/")) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "ADMIN_SESSION_SECRET is not configured.",
        },
        { status: 503 },
      );
    }

    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    loginUrl.search = "";

    return NextResponse.redirect(loginUrl);
  }

  const currentSession =
    request.cookies.get(ADMIN_COOKIE)?.value;

  if (currentSession === expectedSession) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/admin/")) {
    return unauthorizedApi();
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/admin/login";
  loginUrl.search = "";

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
