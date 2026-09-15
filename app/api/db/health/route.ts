import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    const [products, suppliers, knowledge, rfqs] = await Promise.all([
      prisma.product.count(),
      prisma.supplier.count(),
      prisma.knowledgeArticle.count(),
      prisma.rfq.count(),
    ]);
    return NextResponse.json({ ok: true, database: "connected", counts: { products, suppliers, knowledge, rfqs } });
  } catch (error) {
    console.error("Database health check failed", error);
    return NextResponse.json({ ok: false, database: "disconnected" }, { status: 503 });
  }
}
