import { NextResponse } from "next/server";
import { products as mockProducts } from "@/data/mock";
import { getDatabasePublicData } from "@/lib/dbPublic";
import { databaseModeEnabled } from "@/lib/dataMode";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!databaseModeEnabled()) return NextResponse.json(mockProducts);
  try {
    const data = await getDatabasePublicData();
    return NextResponse.json(data.products);
  } catch (error) {
    console.error("GET /api/products failed", error);
    return NextResponse.json({ error: "DATABASE_UNAVAILABLE" }, { status: 503 });
  }
}
