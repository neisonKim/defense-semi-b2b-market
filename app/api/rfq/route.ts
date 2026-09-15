import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { RFQStatus, VerificationStatus } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { databaseModeEnabled } from "@/lib/dataMode";
import { rfqWritesEnabled } from "@/lib/deploymentSafety";

const RFQSchema = z.object({
  productSlug: z.string().min(1),
  quantity: z.coerce.number().int().positive(),
  unit: z.string().min(1).max(20).default("EA"),
  targetDate: z.string().optional(),
  companyName: z.string().min(2),
  contactName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  requirements: z.string().optional(),
  application: z.string().optional(),
  candidateSupplierSlugs: z.array(z.string()).max(10).optional().default([]),
});

function referenceNo() {
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  return `RFQ-${date}-${randomUUID().slice(0, 6).toUpperCase()}`;
}

export async function POST(req: Request) {
  const parsed = RFQSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
  }

  if (!databaseModeEnabled()) {
    return NextResponse.json({ ok: true, source: "local", rfqId: `RFQ-DEMO-${String(Date.now()).slice(-6)}` }, { status: 201 });
  }

  if (!rfqWritesEnabled()) {
    return NextResponse.json({
      ok: true,
      source: "portfolio-demo",
      rfqId: `RFQ-DEMO-${String(Date.now()).slice(-6)}`,
      message: "Portfolio demo에서는 실제 개인정보/RFQ를 DB에 저장하지 않습니다.",
    }, { status: 201 });
  }

  try {
    const input = parsed.data;
    const product = await prisma.product.findFirst({
      where: { slug: input.productSlug, status: VerificationStatus.PUBLISHED },
    });
    if (!product) return NextResponse.json({ ok: false, error: "PRODUCT_NOT_FOUND" }, { status: 404 });

    const suppliers = input.candidateSupplierSlugs.length
      ? await prisma.supplier.findMany({
          where: { slug: { in: input.candidateSupplierSlugs }, status: VerificationStatus.PUBLISHED },
          select: { id: true, slug: true },
        })
      : [];

    const ref = referenceNo();
    const created = await prisma.rfq.create({
      data: {
        referenceNo: ref,
        status: RFQStatus.SUBMITTED,
        companyName: input.companyName,
        contactName: input.contactName,
        email: input.email,
        phone: input.phone || null,
        targetDate: input.targetDate ? new Date(`${input.targetDate}T00:00:00`) : null,
        application: input.application || null,
        requirements: input.requirements || null,
        items: {
          create: {
            productId: product.id,
            productName: product.name,
            quantity: input.quantity,
            unit: input.unit,
          },
        },
        matches: {
          create: suppliers.map((supplier, index) => ({
            supplierId: supplier.id,
            score: Math.max(60, 95 - index * 5),
            matchedReason: { source: "prototype-candidate", supplierSlug: supplier.slug },
          })),
        },
      },
      select: { id: true, referenceNo: true, status: true, createdAt: true },
    });

    return NextResponse.json({ ok: true, source: "database", rfqId: created.referenceNo, recordId: created.id, status: created.status }, { status: 201 });
  } catch (error) {
    console.error("POST /api/rfq failed", error);
    return NextResponse.json({ ok: false, error: "DATABASE_WRITE_FAILED" }, { status: 503 });
  }
}
