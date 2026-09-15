import { NextResponse } from "next/server";
import { suppliers as mockSuppliers } from "@/data/mock";
import { getDatabasePublicData } from "@/lib/dbPublic";
import { databaseModeEnabled } from "@/lib/dataMode";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!databaseModeEnabled()) return NextResponse.json(mockSuppliers);
  try {
    const data = await getDatabasePublicData();
    return NextResponse.json(data.suppliers);
  } catch (error) {
    console.error("GET /api/suppliers failed", error);
    return NextResponse.json({ error: "DATABASE_UNAVAILABLE" }, { status: 503 });
  }
}
