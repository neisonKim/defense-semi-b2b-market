import { NextResponse } from "next/server";
import { RFQStatus } from "@prisma/client";
import { z } from "zod";

import { databaseModeEnabled } from "@/lib/dataMode";
import { prisma } from "@/lib/db";
import { adminWritesEnabled } from "@/lib/deploymentSafety";

const UpdateRFQStatusSchema = z.object({
  status: z.nativeEnum(RFQStatus),
});

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  },
) {
  if (!databaseModeEnabled()) {
    return NextResponse.json(
      {
        ok: false,
        error: "DATABASE_MODE_REQUIRED",
        message: "RFQ 상세 조회는 Database Mode에서 사용합니다.",
      },
      {
        status: 409,
      },
    );
  }

  try {
    const { id } = await context.params;

    const rfq = await prisma.rfq.findUnique({
      where: {
        id,
      },
      include: {
        items: true,
        matches: {
          include: {
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

    if (!rfq) {
      return NextResponse.json(
        {
          ok: false,
          error: "RFQ_NOT_FOUND",
          message: "RFQ를 찾을 수 없습니다.",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json({
      ok: true,
      data: rfq,
    });
  } catch (error) {
    console.error("GET /api/admin/rfqs/[id] failed", error);

    return NextResponse.json(
      {
        ok: false,
        error: "RFQ_READ_FAILED",
        message: "RFQ 상세 정보를 불러오지 못했습니다.",
      },
      {
        status: 503,
      },
    );
  }
}

export async function PATCH(
  request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  },
) {
  if (!databaseModeEnabled()) {
    return NextResponse.json(
      {
        ok: false,
        error: "DATABASE_MODE_REQUIRED",
        message: "RFQ 상태 변경은 Database Mode에서 사용합니다.",
      },
      {
        status: 409,
      },
    );
  }

  if (!adminWritesEnabled()) {
    return NextResponse.json(
      {
        ok: false,
        error: "ADMIN_WRITE_DISABLED",
        message:
          "현재 배포 환경에서는 관리자 쓰기 기능이 비활성화되어 있습니다.",
      },
      {
        status: 403,
      },
    );
  }

  try {
    const { id } = await context.params;
    const parsed = UpdateRFQStatusSchema.safeParse(
      await request.json(),
    );

    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          error: "INVALID_RFQ_STATUS",
          message: "올바른 RFQ Status가 필요합니다.",
        },
        {
          status: 400,
        },
      );
    }

    const existing = await prisma.rfq.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
      },
    });

    if (!existing) {
      return NextResponse.json(
        {
          ok: false,
          error: "RFQ_NOT_FOUND",
          message: "RFQ를 찾을 수 없습니다.",
        },
        {
          status: 404,
        },
      );
    }

    const updated = await prisma.rfq.update({
      where: {
        id,
      },
      data: {
        status: parsed.data.status,
      },
      select: {
        id: true,
        referenceNo: true,
        status: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      ok: true,
      data: {
        ...updated,
        updatedAt: updated.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("PATCH /api/admin/rfqs/[id] failed", error);

    return NextResponse.json(
      {
        ok: false,
        error: "RFQ_UPDATE_FAILED",
        message: "RFQ 상태를 변경하지 못했습니다.",
      },
      {
        status: 503,
      },
    );
  }
}
