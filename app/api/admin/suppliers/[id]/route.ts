import { NextResponse } from "next/server";
import { adminErrorResponse, deleteSupplier, updateSupplier, type AdminSupplier } from "@/lib/adminDb";
import { adminWritesEnabled } from "@/lib/deploymentSafety";

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!adminWritesEnabled()) {
    return NextResponse.json({ ok: false, error: "ADMIN_WRITE_DISABLED", message: "Portfolio demo에서는 관리자 쓰기 기능이 비활성화되어 있습니다." }, { status: 403 });
  }
  try {
    const { id } = await context.params;
    const body = await request.json() as Omit<AdminSupplier, "id" | "updatedAt">;
    await updateSupplier(id, body);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const result = adminErrorResponse(error);
    return NextResponse.json({ ok: false, error: result.error, message: result.message }, { status: result.status });
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  if (!adminWritesEnabled()) {
    return NextResponse.json({ ok: false, error: "ADMIN_WRITE_DISABLED", message: "Portfolio demo에서는 관리자 쓰기 기능이 비활성화되어 있습니다." }, { status: 403 });
  }
  try {
    const { id } = await context.params;
    await deleteSupplier(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const result = adminErrorResponse(error);
    return NextResponse.json({ ok: false, error: result.error, message: result.message }, { status: result.status });
  }
}
