import { NextRequest, NextResponse } from "next/server";

const ADMIN_COOKIE = "ds_admin_session";

type LoginBody = {
  email?: string;
  password?: string;
};

export async function POST(request: NextRequest) {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const sessionSecret = process.env.ADMIN_SESSION_SECRET;

  if (!adminEmail || !adminPassword || !sessionSecret) {
    return NextResponse.json(
      {
        ok: false,
        error: "Admin environment variables are not configured.",
      },
      { status: 503 }
    );
  }

  let body: LoginBody;

  try {
    body = (await request.json()) as LoginBody;
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: "잘못된 요청입니다.",
      },
      { status: 400 }
    );
  }

  const email = body.email?.trim().toLowerCase();
  const password = body.password ?? "";

  const emailMatched =
    email === adminEmail.trim().toLowerCase();

  const passwordMatched =
    password === adminPassword;

  if (!emailMatched || !passwordMatched) {
    return NextResponse.json(
      {
        ok: false,
        error: "이메일 또는 비밀번호가 올바르지 않습니다.",
      },
      { status: 401 }
    );
  }

  const response = NextResponse.json({
    ok: true,
  });

  response.cookies.set({
    name: ADMIN_COOKIE,
    value: sessionSecret,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  return response;
}