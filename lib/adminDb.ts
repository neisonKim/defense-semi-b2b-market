import "server-only";
import {
  Prisma,
  SupplierType,
  VerificationStatus,
} from "@prisma/client";
import { prisma } from "@/lib/db";

export type AdminStatus = "Draft" | "Review" | "Verified" | "Published" | "Needs Update";

export type AdminProduct = {
  id: string;
  slug: string;
  name: string;
  category: string;
  process: string;
  supplier: string;
  material: string;
  status: AdminStatus;
  updatedAt: string;
};

export type AdminSupplier = {
  id: string;
  slug: string;
  name: string;
  type: string;
  region: string;
  meta: string;
  verified: boolean;
  status: AdminStatus;
  updatedAt: string;
};

export type AdminKnowledge = {
  id: string;
  slug: string;
  title: string;
  category: string;
  process: string;
  summary: string;
  status: AdminStatus;
  updatedAt: string;
};

export type AdminState = {
  products: AdminProduct[];
  suppliers: AdminSupplier[];
  knowledge: AdminKnowledge[];
};

function isoDate(value: Date) {
  return value.toISOString().slice(0, 10);
}

export function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function statusToAdmin(status: VerificationStatus): AdminStatus {
  switch (status) {
    case VerificationStatus.DRAFT:
      return "Draft";
    case VerificationStatus.REVIEW:
    case VerificationStatus.TECHNICAL_REVIEW:
      return "Review";
    case VerificationStatus.VERIFIED:
      return "Verified";
    case VerificationStatus.PUBLISHED:
      return "Published";
    case VerificationStatus.NEEDS_UPDATE:
    case VerificationStatus.REJECTED:
      return "Needs Update";
  }
}

export function statusToDb(status: AdminStatus): VerificationStatus {
  switch (status) {
    case "Draft":
      return VerificationStatus.DRAFT;
    case "Review":
      return VerificationStatus.REVIEW;
    case "Verified":
      return VerificationStatus.VERIFIED;
    case "Published":
      return VerificationStatus.PUBLISHED;
    case "Needs Update":
      return VerificationStatus.NEEDS_UPDATE;
  }
}

function supplierTypeToDb(value: string): SupplierType {
  const normalized = value.trim().toUpperCase().replace(/[\s/-]+/g, "_");
  if (normalized.includes("AUTHORIZED") && normalized.includes("DISTRIBUTOR")) return SupplierType.AUTHORIZED_DISTRIBUTOR;
  if (normalized.includes("DISTRIBUTOR")) return SupplierType.DISTRIBUTOR;
  if (normalized.includes("REPRESENTATIVE")) return SupplierType.REPRESENTATIVE;
  if (normalized.includes("SOFTWARE")) return SupplierType.SOFTWARE_VENDOR;
  if (normalized.includes("SYSTEM") && normalized.includes("INTEGRATOR")) return SupplierType.SYSTEM_INTEGRATOR;
  if (normalized.includes("SERVICE") || normalized.includes("SOLUTION") || normalized.includes("PROVIDER")) return SupplierType.SERVICE_PROVIDER;
  return SupplierType.MANUFACTURER;
}

function supplierTypeToAdmin(value: SupplierType) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function splitValues(value: string) {
  return Array.from(
    new Set(
      value
        .split(/\s*(?:\/|,|\||·)\s*/)
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  );
}

async function ensureCategory(name: string) {
  const resolvedName = name.trim() || "Uncategorized";
  const slug = slugify(resolvedName) || "uncategorized";
  return prisma.productCategory.upsert({
    where: { slug },
    update: { name: resolvedName },
    create: { slug, name: resolvedName },
  });
}

async function ensureProcesses(value: string) {
  const names = splitValues(value || "General");
  const resolved = names.length ? names : ["General"];
  return Promise.all(
    resolved.map((name) => {
      const slug = slugify(name) || "general";
      return prisma.process.upsert({
        where: { slug },
        update: { name },
        create: { slug, name },
      });
    }),
  );
}

async function ensureMaterial(name: string) {
  const resolvedName = name.trim() || "Supplier confirmation required";
  const slug = slugify(resolvedName) || "supplier-confirmation-required";
  return prisma.material.upsert({
    where: { slug },
    update: { name: resolvedName },
    create: { slug, name: resolvedName },
  });
}

async function findSupplier(value: string) {
  const text = value.trim();
  if (!text) return null;
  return prisma.supplier.findFirst({
    where: {
      OR: [
        { slug: slugify(text) },
        { name: { equals: text, mode: "insensitive" } },
      ],
    },
  });
}

export async function getAdminState(): Promise<AdminState> {
  const [products, suppliers, knowledge] = await Promise.all([
    prisma.product.findMany({
      orderBy: [{ updatedAt: "desc" }, { name: "asc" }],
      include: {
        category: true,
        processes: { include: { process: true } },
        materials: { include: { material: true } },
        supplierProducts: { include: { supplier: true } },
      },
    }),
    prisma.supplier.findMany({ orderBy: [{ updatedAt: "desc" }, { name: "asc" }] }),
    prisma.knowledgeArticle.findMany({
      orderBy: [{ updatedAt: "desc" }, { title: "asc" }],
      include: { processes: { include: { process: true } } },
    }),
  ]);

  return {
    products: products.map((item) => ({
      id: item.id,
      slug: item.slug,
      name: item.name,
      category: item.category.name,
      process: item.processes.map((entry) => entry.process.name).join(" / "),
      supplier: item.supplierProducts[0]?.supplier.name ?? "",
      material: item.materials[0]?.material.name ?? "",
      status: statusToAdmin(item.status),
      updatedAt: isoDate(item.updatedAt),
    })),
    suppliers: suppliers.map((item) => ({
      id: item.id,
      slug: item.slug,
      name: item.name,
      type: supplierTypeToAdmin(item.type),
      region: item.regions.join(" / ") || item.country || "",
      meta: item.description ?? "",
      verified: item.companyVerified,
      status: statusToAdmin(item.status),
      updatedAt: isoDate(item.updatedAt),
    })),
    knowledge: knowledge.map((item) => ({
      id: item.id,
      slug: item.slug,
      title: item.title,
      category: item.category ?? "",
      process: item.processes.map((entry) => entry.process.name).join(" / "),
      summary: item.summary ?? "",
      status: statusToAdmin(item.status),
      updatedAt: isoDate(item.updatedAt),
    })),
  };
}

export async function createProduct(input: Omit<AdminProduct, "id" | "updatedAt">) {
  const slug = input.slug.trim() || slugify(input.name);
  if (!slug) throw new Error("SLUG_REQUIRED");

  const [category, processes, material, supplier] = await Promise.all([
    ensureCategory(input.category),
    ensureProcesses(input.process),
    ensureMaterial(input.material),
    findSupplier(input.supplier),
  ]);

  if (input.supplier.trim() && !supplier) throw new Error("SUPPLIER_NOT_FOUND");

  return prisma.product.create({
    data: {
      slug,
      name: input.name.trim(),
      subtitle: `${input.category || "Semiconductor Product"} · ${input.process || "Application"}`,
      categoryId: category.id,
      status: statusToDb(input.status),
      lastVerifiedAt: ["Verified", "Published"].includes(input.status) ? new Date() : null,
      processes: { create: processes.map((process) => ({ processId: process.id })) },
      materials: { create: [{ materialId: material.id }] },
      ...(supplier
        ? {
            supplierProducts: {
              create: [{ supplierId: supplier.id, availability: "Contact required" }],
            },
          }
        : {}),
    },
  });
}

export async function updateProduct(id: string, input: Omit<AdminProduct, "id" | "updatedAt">) {
  const slug = input.slug.trim() || slugify(input.name);
  if (!slug) throw new Error("SLUG_REQUIRED");
  const [category, processes, material, supplier] = await Promise.all([
    ensureCategory(input.category),
    ensureProcesses(input.process),
    ensureMaterial(input.material),
    findSupplier(input.supplier),
  ]);
  if (input.supplier.trim() && !supplier) throw new Error("SUPPLIER_NOT_FOUND");

  await prisma.$transaction(async (tx) => {
    await tx.product.update({
      where: { id },
      data: {
        slug,
        name: input.name.trim(),
        subtitle: `${input.category || "Semiconductor Product"} · ${input.process || "Application"}`,
        categoryId: category.id,
        status: statusToDb(input.status),
        lastVerifiedAt: ["Verified", "Published"].includes(input.status) ? new Date() : null,
      },
    });
    await tx.productProcess.deleteMany({ where: { productId: id } });
    await tx.productMaterial.deleteMany({ where: { productId: id } });
    await tx.supplierProduct.deleteMany({ where: { productId: id } });
    if (processes.length) {
      await tx.productProcess.createMany({ data: processes.map((process) => ({ productId: id, processId: process.id })) });
    }
    await tx.productMaterial.create({ data: { productId: id, materialId: material.id } });
    if (supplier) {
      await tx.supplierProduct.create({ data: { productId: id, supplierId: supplier.id, availability: "Contact required" } });
    }
  });
}

export async function deleteProduct(id: string) {
  const rfqCount = await prisma.rfqItem.count({ where: { productId: id } });
  if (rfqCount > 0) throw new Error("PRODUCT_HAS_RFQ");
  await prisma.product.delete({ where: { id } });
}

export async function createSupplier(input: Omit<AdminSupplier, "id" | "updatedAt">) {
  const slug = input.slug.trim() || slugify(input.name);
  if (!slug) throw new Error("SLUG_REQUIRED");
  const regions = splitValues(input.region);
  return prisma.supplier.create({
    data: {
      slug,
      name: input.name.trim(),
      type: supplierTypeToDb(input.type),
      country: regions[0] ?? null,
      regions,
      description: input.meta.trim() || null,
      companyVerified: input.verified,
      productDataVerified: input.verified,
      documentVerified: input.verified,
      status: statusToDb(input.status),
      lastVerifiedAt: input.verified || ["Verified", "Published"].includes(input.status) ? new Date() : null,
    },
  });
}

export async function updateSupplier(id: string, input: Omit<AdminSupplier, "id" | "updatedAt">) {
  const slug = input.slug.trim() || slugify(input.name);
  if (!slug) throw new Error("SLUG_REQUIRED");
  const regions = splitValues(input.region);
  await prisma.supplier.update({
    where: { id },
    data: {
      slug,
      name: input.name.trim(),
      type: supplierTypeToDb(input.type),
      country: regions[0] ?? null,
      regions,
      description: input.meta.trim() || null,
      companyVerified: input.verified,
      productDataVerified: input.verified,
      documentVerified: input.verified,
      status: statusToDb(input.status),
      lastVerifiedAt: input.verified || ["Verified", "Published"].includes(input.status) ? new Date() : null,
    },
  });
}

export async function deleteSupplier(id: string) {
  const linkedProducts = await prisma.supplierProduct.count({ where: { supplierId: id } });
  if (linkedProducts > 0) throw new Error("SUPPLIER_HAS_PRODUCTS");
  await prisma.supplier.delete({ where: { id } });
}

async function relatedProductIdsForProcesses(processIds: string[]) {
  if (!processIds.length) return [] as string[];
  const links = await prisma.productProcess.findMany({
    where: { processId: { in: processIds } },
    select: { productId: true },
    take: 12,
  });
  return Array.from(new Set(links.map((item) => item.productId))).slice(0, 6);
}

async function supplierIdsForProducts(productIds: string[]) {
  if (!productIds.length) return [] as string[];
  const links = await prisma.supplierProduct.findMany({
    where: { productId: { in: productIds } },
    select: { supplierId: true },
  });
  return Array.from(new Set(links.map((item) => item.supplierId)));
}

export async function createKnowledge(input: Omit<AdminKnowledge, "id" | "updatedAt">) {
  const slug = input.slug.trim() || slugify(input.title);
  if (!slug) throw new Error("SLUG_REQUIRED");
  const processes = await ensureProcesses(input.process);
  const processIds = processes.map((item) => item.id);
  const productIds = await relatedProductIdsForProcesses(processIds);
  const supplierIds = await supplierIdsForProducts(productIds);

  return prisma.knowledgeArticle.create({
    data: {
      slug,
      title: input.title.trim(),
      category: input.category.trim() || null,
      summary: input.summary.trim() || null,
      content: input.summary.trim() || null,
      readingTime: "5분",
      status: statusToDb(input.status),
      publishedAt: input.status === "Published" ? new Date() : null,
      lastVerifiedAt: ["Verified", "Published"].includes(input.status) ? new Date() : null,
      processes: { create: processIds.map((processId) => ({ processId })) },
      products: { create: productIds.map((productId) => ({ productId })) },
      suppliers: { create: supplierIds.map((supplierId) => ({ supplierId })) },
    },
  });
}

export async function updateKnowledge(id: string, input: Omit<AdminKnowledge, "id" | "updatedAt">) {
  const slug = input.slug.trim() || slugify(input.title);
  if (!slug) throw new Error("SLUG_REQUIRED");
  const processes = await ensureProcesses(input.process);
  const processIds = processes.map((item) => item.id);
  const productIds = await relatedProductIdsForProcesses(processIds);
  const supplierIds = await supplierIdsForProducts(productIds);

  await prisma.$transaction(async (tx) => {
    await tx.knowledgeArticle.update({
      where: { id },
      data: {
        slug,
        title: input.title.trim(),
        category: input.category.trim() || null,
        summary: input.summary.trim() || null,
        content: input.summary.trim() || null,
        status: statusToDb(input.status),
        publishedAt: input.status === "Published" ? new Date() : null,
        lastVerifiedAt: ["Verified", "Published"].includes(input.status) ? new Date() : null,
      },
    });
    await tx.articleProcess.deleteMany({ where: { articleId: id } });
    await tx.articleProduct.deleteMany({ where: { articleId: id } });
    await tx.articleSupplier.deleteMany({ where: { articleId: id } });
    if (processIds.length) await tx.articleProcess.createMany({ data: processIds.map((processId) => ({ articleId: id, processId })) });
    if (productIds.length) await tx.articleProduct.createMany({ data: productIds.map((productId) => ({ articleId: id, productId })) });
    if (supplierIds.length) await tx.articleSupplier.createMany({ data: supplierIds.map((supplierId) => ({ articleId: id, supplierId })) });
  });
}

export async function deleteKnowledge(id: string) {
  await prisma.knowledgeArticle.delete({ where: { id } });
}

export async function updateEntityStatus(entity: "Product" | "Supplier" | "Knowledge", id: string, status: AdminStatus) {
  const dbStatus = statusToDb(status);
  const verified = status === "Verified" || status === "Published";
  if (entity === "Product") {
    await prisma.product.update({ where: { id }, data: { status: dbStatus, lastVerifiedAt: verified ? new Date() : null } });
    return;
  }
  if (entity === "Supplier") {
    await prisma.supplier.update({
      where: { id },
      data: {
        status: dbStatus,
        companyVerified: verified,
        productDataVerified: verified,
        documentVerified: verified,
        lastVerifiedAt: verified ? new Date() : null,
      },
    });
    return;
  }
  await prisma.knowledgeArticle.update({
    where: { id },
    data: {
      status: dbStatus,
      publishedAt: status === "Published" ? new Date() : undefined,
      lastVerifiedAt: verified ? new Date() : null,
    },
  });
}

export function adminErrorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "UNKNOWN_ERROR";
  if (message === "SUPPLIER_NOT_FOUND") return { status: 400, error: message, message: "Product를 저장하기 전에 Supplier를 먼저 등록해 주세요." };
  if (message === "SUPPLIER_HAS_PRODUCTS") return { status: 409, error: message, message: "연결된 Product가 있어 Supplier를 삭제할 수 없습니다." };
  if (message === "PRODUCT_HAS_RFQ") return { status: 409, error: message, message: "연결된 RFQ가 있어 Product를 삭제할 수 없습니다." };
  if (message === "SLUG_REQUIRED") return { status: 400, error: message, message: "Slug를 생성할 수 없습니다." };
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    return { status: 409, error: "DUPLICATE_SLUG", message: "같은 Slug가 이미 존재합니다." };
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
    return { status: 404, error: "NOT_FOUND", message: "대상을 찾을 수 없습니다." };
  }
  console.error("Admin database operation failed", error);
  return { status: 500, error: "DATABASE_ERROR", message: "데이터베이스 처리 중 오류가 발생했습니다." };
}
