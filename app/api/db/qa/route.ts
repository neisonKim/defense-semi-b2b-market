import { NextResponse } from "next/server";
import { runDbQa } from "@/lib/dbQa";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = await runDbQa();
    return NextResponse.json(result, { status: result.ok ? 200 : 500 });
  } catch (error) {
    console.error("Database QA failed", error);
    return NextResponse.json(
      {
        ok: false,
        checkedAt: new Date().toISOString(),
        error: "DATABASE_QA_FAILED",
        message: "PostgreSQL/Prisma QA를 실행하지 못했습니다.",
      },
      { status: 503 }
    );
  }
}
