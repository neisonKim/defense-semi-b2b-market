import { NextResponse } from "next/server";
import { getDatabasePublicData } from "@/lib/dbPublic";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getDatabasePublicData();
    return NextResponse.json({ ok: true, source: "database", ...data });
  } catch (error) {
    console.error("GET /api/public-data failed", error);
    return NextResponse.json(
      { ok: false, error: "DATABASE_UNAVAILABLE", message: "PostgreSQL 공개 데이터를 불러오지 못했습니다." },
      { status: 503 }
    );
  }
}
