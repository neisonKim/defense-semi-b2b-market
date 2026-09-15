import {
  PrismaClient,
  SupplierType,
  VerificationStatus,
} from "@prisma/client";
import {
  knowledgeArticles,
  processes as mockProcesses,
  products as mockProducts,
  suppliers as mockSuppliers,
} from "../data/mock";

const prisma = new PrismaClient();

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\([^)]*\)/g, " ")
    .replace(/[^a-z0-9가-힣]+/g, "-")
    .replace(/^-+|-+$/g, "") || "item";
}

function supplierType(value: string): SupplierType {
  const normalized = value.toLowerCase();
  if (normalized.includes("manufacturer")) return SupplierType.MANUFACTURER;
  if (normalized.includes("authorized")) return SupplierType.AUTHORIZED_DISTRIBUTOR;
  if (normalized.includes("integrator")) return SupplierType.SYSTEM_INTEGRATOR;
  if (normalized.includes("software")) return SupplierType.SOFTWARE_VENDOR;
  if (normalized.includes("solution") || normalized.includes("service")) return SupplierType.SERVICE_PROVIDER;
  return SupplierType.DISTRIBUTOR;
}

function splitProcesses(value: string) {
  return value
    .split("/")
    .map((item) => item.trim())
    .filter(Boolean);
}

async function ensureProcess(name: string) {
  const slug = slugify(name);
  return prisma.process.upsert({
    where: { slug },
    update: { name },
    create: { slug, name },
  });
}

async function main() {
  console.log("Seeding DEFENSE SEMI B2B MARKET database...");

  for (const process of mockProcesses) {
    await prisma.process.upsert({
      where: { slug: slugify(process.name) },
      update: { name: process.name, description: process.description },
      create: {
        slug: slugify(process.name),
        name: process.name,
        description: process.description,
      },
    });
  }

  for (const supplier of mockSuppliers) {
    await prisma.supplier.upsert({
      where: { slug: supplier.slug },
      update: {
        name: supplier.name,
        type: supplierType(supplier.type),
        description: supplier.meta,
        country: supplier.region,
        regions: [supplier.region],
        companyVerified: supplier.verified,
        productDataVerified: supplier.verified,
        documentVerified: supplier.verified,
        status: VerificationStatus.PUBLISHED,
        lastVerifiedAt: new Date("2026-09-15"),
      },
      create: {
        slug: supplier.slug,
        name: supplier.name,
        type: supplierType(supplier.type),
        description: supplier.meta,
        country: supplier.region,
        regions: [supplier.region],
        companyVerified: supplier.verified,
        productDataVerified: supplier.verified,
        documentVerified: supplier.verified,
        status: VerificationStatus.PUBLISHED,
        lastVerifiedAt: new Date("2026-09-15"),
      },
    });
  }

  for (const item of mockProducts) {
    const categorySlug = slugify(item.category);
    const category = await prisma.productCategory.upsert({
      where: { slug: categorySlug },
      update: { name: item.category },
      create: { slug: categorySlug, name: item.category },
    });

    const materialSlug = slugify(item.material);
    const material = await prisma.material.upsert({
      where: { slug: materialSlug },
      update: { name: item.material, purity: item.purity },
      create: { slug: materialSlug, name: item.material, purity: item.purity },
    });

    const product = await prisma.product.upsert({
      where: { slug: item.slug },
      update: {
        name: item.name,
        subtitle: item.subtitle,
        description: item.subtitle,
        categoryId: category.id,
        manufacturingMethod: item.manufacturingMethod,
        equipment: item.equipment,
        applicationLocation: item.location,
        functionSummary: item.function,
        waferSize: item.wafer,
        purity: item.purity,
        status: VerificationStatus.PUBLISHED,
        lastVerifiedAt: new Date(item.verifiedAt),
        verifiedBy: "Stage 09 seed",
      },
      create: {
        slug: item.slug,
        name: item.name,
        subtitle: item.subtitle,
        description: item.subtitle,
        categoryId: category.id,
        manufacturingMethod: item.manufacturingMethod,
        equipment: item.equipment,
        applicationLocation: item.location,
        functionSummary: item.function,
        waferSize: item.wafer,
        purity: item.purity,
        status: VerificationStatus.PUBLISHED,
        lastVerifiedAt: new Date(item.verifiedAt),
        verifiedBy: "Stage 09 seed",
      },
    });

    await prisma.productMaterial.deleteMany({ where: { productId: product.id } });
    await prisma.productMaterial.create({ data: { productId: product.id, materialId: material.id } });

    await prisma.productProcess.deleteMany({ where: { productId: product.id } });
    for (const processName of splitProcesses(item.process)) {
      const process = await ensureProcess(processName);
      await prisma.productProcess.create({ data: { productId: product.id, processId: process.id } });
    }

    const supplier = await prisma.supplier.findUnique({ where: { slug: item.supplierSlug } });
    if (supplier) {
      await prisma.supplierProduct.deleteMany({ where: { supplierId: supplier.id, productId: product.id } });
      const sourceSupplier = mockSuppliers.find((entry) => entry.slug === item.supplierSlug);
      await prisma.supplierProduct.create({
        data: {
          supplierId: supplier.id,
          productId: product.id,
          sku: `${item.slug.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10)}-DEMO`,
          region: sourceSupplier?.region ?? "Global",
          leadTimeDays: null,
          moq: null,
          authorizedStatus: sourceSupplier?.verified ? "Verified supplier" : "Demo supplier",
          availability: "Contact for availability",
          sampleAvailable: sourceSupplier?.sample.toLowerCase().includes("가능") ?? false,
          customization: true,
        },
      });
    }
  }

  for (const article of knowledgeArticles) {
    const saved = await prisma.knowledgeArticle.upsert({
      where: { slug: article.slug },
      update: {
        title: article.title,
        category: article.category,
        summary: article.summary,
        content: article.keyPoints.join("\n\n"),
        readingTime: article.readingTime,
        keyPoints: article.keyPoints,
        publishedAt: new Date(article.publishedAt),
        status: VerificationStatus.PUBLISHED,
        lastVerifiedAt: new Date("2026-09-15"),
      },
      create: {
        slug: article.slug,
        title: article.title,
        category: article.category,
        summary: article.summary,
        content: article.keyPoints.join("\n\n"),
        readingTime: article.readingTime,
        keyPoints: article.keyPoints,
        publishedAt: new Date(article.publishedAt),
        status: VerificationStatus.PUBLISHED,
        lastVerifiedAt: new Date("2026-09-15"),
      },
    });

    await prisma.articleProduct.deleteMany({ where: { articleId: saved.id } });
    for (const productSlug of article.relatedProductSlugs) {
      const product = await prisma.product.findUnique({ where: { slug: productSlug } });
      if (product) await prisma.articleProduct.create({ data: { articleId: saved.id, productId: product.id } });
    }

    await prisma.articleProcess.deleteMany({ where: { articleId: saved.id } });
    const process = await ensureProcess(article.relatedProcess);
    await prisma.articleProcess.create({ data: { articleId: saved.id, processId: process.id } });

    await prisma.articleTag.deleteMany({ where: { articleId: saved.id } });
    for (const tagName of article.tags) {
      const tag = await prisma.tag.upsert({
        where: { slug: slugify(tagName) },
        update: { name: tagName },
        create: { slug: slugify(tagName), name: tagName, type: "Knowledge" },
      });
      await prisma.articleTag.create({ data: { articleId: saved.id, tagId: tag.id } });
    }
  }

  console.log(`Seed complete: ${mockProducts.length} products, ${mockSuppliers.length} suppliers, ${knowledgeArticles.length} knowledge articles.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
