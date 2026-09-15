import { VerificationStatus } from "@prisma/client";
import { prisma } from "./db";

export type QaIssue = {
  level: "error" | "warning";
  code: string;
  message: string;
  items?: string[];
};

export type DbQaResult = {
  ok: boolean;
  checkedAt: string;
  counts: {
    products: number;
    publishedProducts: number;
    suppliers: number;
    publishedSuppliers: number;
    knowledge: number;
    publishedKnowledge: number;
    rfqs: number;
    rfqItems: number;
    rfqMatches: number;
  };
  issues: QaIssue[];
};

export async function runDbQa(): Promise<DbQaResult> {
  await prisma.$queryRaw`SELECT 1`;

  const [
    products,
    publishedProducts,
    suppliers,
    publishedSuppliers,
    knowledge,
    publishedKnowledge,
    rfqs,
    rfqItems,
    rfqMatches,
    publishedProductsMissingProcess,
    publishedProductsMissingSupplier,
    publishedKnowledgeMissingProcess,
    publishedKnowledgeMissingProduct,
    publishedSuppliersWithoutProduct,
    rfqsWithoutItems,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { status: VerificationStatus.PUBLISHED } }),
    prisma.supplier.count(),
    prisma.supplier.count({ where: { status: VerificationStatus.PUBLISHED } }),
    prisma.knowledgeArticle.count(),
    prisma.knowledgeArticle.count({ where: { status: VerificationStatus.PUBLISHED } }),
    prisma.rfq.count(),
    prisma.rfqItem.count(),
    prisma.rfqSupplierMatch.count(),
    prisma.product.findMany({
      where: { status: VerificationStatus.PUBLISHED, processes: { none: {} } },
      select: { slug: true, name: true },
      take: 20,
    }),
    prisma.product.findMany({
      where: {
        status: VerificationStatus.PUBLISHED,
        supplierProducts: { none: { supplier: { status: VerificationStatus.PUBLISHED } } },
      },
      select: { slug: true, name: true },
      take: 20,
    }),
    prisma.knowledgeArticle.findMany({
      where: { status: VerificationStatus.PUBLISHED, processes: { none: {} } },
      select: { slug: true, title: true },
      take: 20,
    }),
    prisma.knowledgeArticle.findMany({
      where: { status: VerificationStatus.PUBLISHED, products: { none: {} } },
      select: { slug: true, title: true },
      take: 20,
    }),
    prisma.supplier.findMany({
      where: {
        status: VerificationStatus.PUBLISHED,
        supplierProducts: { none: { product: { status: VerificationStatus.PUBLISHED } } },
      },
      select: { slug: true, name: true },
      take: 20,
    }),
    prisma.rfq.findMany({
      where: { items: { none: {} } },
      select: { referenceNo: true },
      take: 20,
    }),
  ]);

  const issues: QaIssue[] = [];

  if (publishedProductsMissingProcess.length) {
    issues.push({
      level: "warning",
      code: "PUBLISHED_PRODUCT_WITHOUT_PROCESS",
      message: "Published 제품 중 연결된 Process가 없는 항목이 있습니다.",
      items: publishedProductsMissingProcess.map((item) => `${item.name} (${item.slug})`),
    });
  }

  if (publishedProductsMissingSupplier.length) {
    issues.push({
      level: "warning",
      code: "PUBLISHED_PRODUCT_WITHOUT_PUBLISHED_SUPPLIER",
      message: "Published 제품 중 Published 공급사가 연결되지 않은 항목이 있습니다.",
      items: publishedProductsMissingSupplier.map((item) => `${item.name} (${item.slug})`),
    });
  }

  if (publishedKnowledgeMissingProcess.length) {
    issues.push({
      level: "warning",
      code: "PUBLISHED_KNOWLEDGE_WITHOUT_PROCESS",
      message: "Published Knowledge 중 Process 연결이 없는 항목이 있습니다.",
      items: publishedKnowledgeMissingProcess.map((item) => `${item.title} (${item.slug})`),
    });
  }

  if (publishedKnowledgeMissingProduct.length) {
    issues.push({
      level: "warning",
      code: "PUBLISHED_KNOWLEDGE_WITHOUT_PRODUCT",
      message: "Published Knowledge 중 Product 연결이 없는 항목이 있습니다.",
      items: publishedKnowledgeMissingProduct.map((item) => `${item.title} (${item.slug})`),
    });
  }

  if (publishedSuppliersWithoutProduct.length) {
    issues.push({
      level: "warning",
      code: "PUBLISHED_SUPPLIER_WITHOUT_PRODUCT",
      message: "Published 공급사 중 공개 Product가 연결되지 않은 항목이 있습니다.",
      items: publishedSuppliersWithoutProduct.map((item) => `${item.name} (${item.slug})`),
    });
  }

  if (rfqsWithoutItems.length) {
    issues.push({
      level: "error",
      code: "RFQ_WITHOUT_ITEM",
      message: "Product Item이 하나도 없는 RFQ가 있습니다.",
      items: rfqsWithoutItems.map((item) => item.referenceNo),
    });
  }

  return {
    ok: !issues.some((issue) => issue.level === "error"),
    checkedAt: new Date().toISOString(),
    counts: {
      products,
      publishedProducts,
      suppliers,
      publishedSuppliers,
      knowledge,
      publishedKnowledge,
      rfqs,
      rfqItems,
      rfqMatches,
    },
    issues,
  };
}
