import { NextResponse } from "next/server";

import { databaseModeEnabled } from "@/lib/dataMode";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!databaseModeEnabled()) {
    return NextResponse.json({
      ok: true,
      source: "local",
      data: [],
    });
  }

  try {
    const rfqs = await prisma.rfq.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 200,
      include: {
        items: {
          select: {
            id: true,
            productId: true,
            productName: true,
            quantity: true,
            unit: true,
          },
        },
        matches: {
          orderBy: {
            score: "desc",
          },
          select: {
            id: true,
            supplierId: true,
            score: true,
            status: true,
            supplier: {
              select: {
                id: true,
                slug: true,
                name: true,
                companyVerified: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      ok: true,
      source: "database",
      data: rfqs.map((rfq) => ({
        id: rfq.id,
        referenceNo: rfq.referenceNo,
        status: rfq.status,
        companyName: rfq.companyName,
        contactName: rfq.contactName,
        email: rfq.email,
        phone: rfq.phone,
        targetDate: rfq.targetDate?.toISOString() ?? null,
        application: rfq.application,
        requirements: rfq.requirements,
        certification: rfq.certification,
        shippingCountry: rfq.shippingCountry,
        ndaRequired: rfq.ndaRequired,
        items: rfq.items,
        matches: rfq.matches,
        createdAt: rfq.createdAt.toISOString(),
        updatedAt: rfq.updatedAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("GET /api/admin/rfqs failed", error);

    return NextResponse.json(
      {
        ok: false,
        error: "RFQ_READ_FAILED",
        message:
          "PostgreSQL에서 RFQ 데이터를 불러오지 못했습니다.",
      },
      {
        status: 503,
      },
    );
  }
}
