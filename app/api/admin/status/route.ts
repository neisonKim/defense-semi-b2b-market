import { NextResponse } from "next/server";
import { adminErrorResponse, updateEntityStatus, type AdminStatus } from "@/lib/adminDb";
import { adminWritesEnabled } from "@/lib/deploymentSafety";

type Entity = "Product" | "Supplier" | "Knowledge";

export async function PATCH(request: Request) {
  if (!adminWritesEnabled()) {
    return NextResponse.json({ ok: false, error: "ADMIN_WRITE_DISABLED", message: "Portfolio demo에서는 관리자 쓰기 기능이 비활성화되어 있습니다." }, { status: 403 });
  }
  try {
    const body = await request.json() as { entity: Entity; id: string; status: AdminStatus };
    if (!body.entity || !body.id || !body.status) {
      return NextResponse.json({ ok: false, message: "entity, id, status가 필요합니다." }, { status: 400 });
    }
    await updateEntityStatus(body.entity, body.id, body.status);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const result = adminErrorResponse(error);
    return NextResponse.json({ ok: false, error: result.error, message: result.message }, { status: result.status });
  }
}
