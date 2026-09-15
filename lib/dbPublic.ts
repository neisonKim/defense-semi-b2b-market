import "server-only";
import { VerificationStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import type { KnowledgeArticle, Product, Supplier } from "@/data/mock";

function isoDate(value: Date | null | undefined) {
  return (value ?? new Date()).toISOString().slice(0, 10);
}

function first<T>(items: T[]) {
  return items[0];
}

export async function getDatabasePublicData(): Promise<{
  products: Product[];
  suppliers: Supplier[];
  knowledge: KnowledgeArticle[];
}> {
  const [dbProducts, dbSuppliers, dbKnowledge] = await Promise.all([
    prisma.product.findMany({
      where: { status: VerificationStatus.PUBLISHED },
      orderBy: [{ updatedAt: "desc" }, { name: "asc" }],
      include: {
        category: true,
        processes: { include: { process: true } },
        materials: { include: { material: true } },
        supplierProducts: {
          where: { supplier: { status: VerificationStatus.PUBLISHED } },
          include: { supplier: true },
        },
      },
    }),
    prisma.supplier.findMany({
      where: { status: VerificationStatus.PUBLISHED },
      orderBy: [{ companyVerified: "desc" }, { name: "asc" }],
      include: {
        supplierProducts: {
          where: { product: { status: VerificationStatus.PUBLISHED } },
          include: {
            product: {
              include: { processes: { include: { process: true } } },
            },
          },
        },
      },
    }),
    prisma.knowledgeArticle.findMany({
      where: { status: VerificationStatus.PUBLISHED },
      orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
      include: {
        products: { include: { product: true } },
        processes: { include: { process: true } },
        tags: { include: { tag: true } },
      },
    }),
  ]);

  const products: Product[] = dbProducts.map((item) => {
    const material = first(item.materials)?.material;
    const processNames = item.processes.map((entry) => entry.process.name);
    const supply = first(item.supplierProducts);
    return {
      slug: item.slug,
      name: item.name,
      subtitle: item.subtitle ?? item.description ?? "Semiconductor B2B product",
      category: item.category.name,
      material: material?.name ?? "Supplier confirmation required",
      manufacturingMethod: item.manufacturingMethod ?? "Supplier confirmation required",
      process: processNames.join(" / ") || "Process confirmation required",
      equipment: item.equipment ?? "Equipment confirmation required",
      location: item.applicationLocation ?? "Application location confirmation required",
      function: item.functionSummary ?? "Engineering application",
      wafer: item.waferSize ?? "Supplier confirmation required",
      purity: item.purity ?? material?.purity ?? "Supplier confirmation required",
      supplier: supply?.supplier.name ?? "Supplier TBD",
      supplierSlug: supply?.supplier.slug ?? "supplier-tbd",
      verifiedAt: isoDate(item.lastVerifiedAt ?? item.updatedAt),
      featured: Boolean(supply?.supplier.companyVerified),
    };
  });

  const suppliers: Supplier[] = dbSuppliers.map((item) => {
    const processNames = Array.from(new Set(item.supplierProducts.flatMap((link) => link.product.processes.map((entry) => entry.process.name))));
    const firstLink = first(item.supplierProducts);
    return {
      slug: item.slug,
      name: item.name,
      type: item.type.replaceAll("_", " "),
      meta: item.description ?? "Semiconductor B2B supplier",
      region: item.regions.join(" / ") || item.country || "Contact required",
      verified: item.companyVerified,
      processes: processNames.length ? processNames : ["General"],
      leadTime: firstLink?.leadTimeDays ? `${firstLink.leadTimeDays}일` : "문의 필요",
      moq: firstLink?.moq ? `${firstLink.moq}` : "협의",
      sample: item.supplierProducts.some((link) => link.sampleAvailable) ? "가능" : "문의 필요",
    };
  });

  const knowledge: KnowledgeArticle[] = dbKnowledge.map((item) => {
    const rawKeyPoints = Array.isArray(item.keyPoints) ? item.keyPoints.filter((entry): entry is string => typeof entry === "string") : [];
    return {
      slug: item.slug,
      title: item.title,
      category: item.category ?? "Engineering Knowledge",
      summary: item.summary ?? "Semiconductor engineering knowledge article",
      relatedProcess: first(item.processes)?.process.name ?? "General",
      relatedProductSlugs: item.products.map((entry) => entry.product.slug),
      publishedAt: isoDate(item.publishedAt ?? item.updatedAt),
      readingTime: item.readingTime ?? "5분",
      tags: item.tags.map((entry) => entry.tag.name),
      keyPoints: rawKeyPoints.length ? rawKeyPoints : [item.summary ?? "관련 기술 정보를 확인하세요."],
    };
  });

  return { products, suppliers, knowledge };
}
