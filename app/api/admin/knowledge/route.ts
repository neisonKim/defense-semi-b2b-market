import { NextResponse } from "next/server";
import { adminErrorResponse, createKnowledge, type AdminKnowledge } from "@/lib/adminDb";
import { adminWritesEnabled } from "@/lib/deploymentSafety";

export async function POST(request: Request) {
  if (!adminWritesEnabled()) {
    return NextResponse.json({ ok: false, error: "ADMIN_WRITE_DISABLED", message: "Portfolio demo에서는 관리자 쓰기 기능이 비활성화되어 있습니다." }, { status: 403 });
  }
  try {
    const body = await request.json() as Omit<AdminKnowledge, "id" | "updatedAt">;
    if (!body.title?.trim()) return NextResponse.json({ ok: false, message: "제목은 필수입니다." }, { status: 400 });
    await createKnowledge(body);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    const result = adminErrorResponse(error);
    return NextResponse.json({ ok: false, error: result.error, message: result.message }, { status: result.status });
  }
}
