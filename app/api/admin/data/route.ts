import { NextResponse } from "next/server";
import { getAdminState, adminErrorResponse } from "@/lib/adminDb";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json({ ok: true, data: await getAdminState() });
  } catch (error) {
    const result = adminErrorResponse(error);
    return NextResponse.json({ ok: false, error: result.error, message: result.message }, { status: result.status });
  }
}
