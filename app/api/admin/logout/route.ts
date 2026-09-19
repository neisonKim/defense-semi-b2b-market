import { NextResponse } from "next/server";

const ADMIN_COOKIE = "ds_admin_session";

export async function POST() {
  const response = NextResponse.json({
    ok: true,
  });

  response.cookies.set({
    name: ADMIN_COOKIE,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}