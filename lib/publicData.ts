"use client";

import { useEffect, useMemo, useState } from "react";
import {
  knowledgeArticles as seedKnowledge,
  products as seedProducts,
  suppliers as seedSuppliers,
  type KnowledgeArticle,
  type Product,
  type Supplier,
} from "@/data/mock";

type AdminStatus = "Draft" | "Review" | "Verified" | "Published" | "Needs Update";

type AdminProduct = {
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

type AdminSupplier = {
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

type AdminKnowledge = {
  id: string;
  slug: string;
  title: string;
  category: string;
  process: string;
  summary: string;
  status: AdminStatus;
  updatedAt: string;
};

type AdminState = {
  products: AdminProduct[];
  suppliers: AdminSupplier[];
  knowledge: AdminKnowledge[];
};

export type PublicDataState = {
  products: Product[];
  suppliers: Supplier[];
  knowledge: KnowledgeArticle[];
  source: "mock" | "cms" | "database";
  ready: boolean;
  error?: string;
};

export const ADMIN_STORAGE_KEY = "defense-semi-admin-cms-v1";
export const PUBLIC_DATA_EVENT = "defense-semi-public-data-updated";

const fallbackState: PublicDataState = {
  products: seedProducts,
  suppliers: seedSuppliers,
  knowledge: seedKnowledge,
  source: "mock",
  ready: false,
};

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function findSeedProduct(slug: string) {
  return seedProducts.find((item) => item.slug === slug);
}

function findSeedSupplier(slug: string) {
  return seedSuppliers.find((item) => item.slug === slug);
}

function findSeedKnowledge(slug: string) {
  return seedKnowledge.find((item) => item.slug === slug);
}

function deriveSupplierSlug(name: string, publishedSuppliers: AdminSupplier[]) {
  const match = publishedSuppliers.find((supplier) => supplier.name.trim().toLowerCase() === name.trim().toLowerCase());
  return match?.slug || seedSuppliers.find((supplier) => supplier.name.trim().toLowerCase() === name.trim().toLowerCase())?.slug || slugify(name);
}

export function normalizeAdminState(admin: AdminState): PublicDataState {
  const publishedSuppliers = admin.suppliers.filter((item) => item.status === "Published");
  const publishedProducts = admin.products.filter((item) => item.status === "Published");
  const publishedKnowledge = admin.knowledge.filter((item) => item.status === "Published");

  const suppliers: Supplier[] = publishedSuppliers.map((item) => {
    const seed = findSeedSupplier(item.slug);
    const connectedProcesses = publishedProducts
      .filter((product) => product.supplier.trim().toLowerCase() === item.name.trim().toLowerCase())
      .map((product) => product.process)
      .filter(Boolean);

    return {
      slug: item.slug,
      name: item.name,
      type: item.type || seed?.type || "Supplier",
      meta: item.meta || seed?.meta || "관리자 CMS 등록 공급사",
      region: item.region || seed?.region || "문의 필요",
      verified: item.verified,
      processes: Array.from(new Set(connectedProcesses.length ? connectedProcesses : seed?.processes ?? ["General"])),
      leadTime: seed?.leadTime || "문의 필요",
      moq: seed?.moq || "문의 필요",
      sample: seed?.sample || "문의 필요",
    };
  });

  const products: Product[] = publishedProducts.map((item) => {
    const seed = findSeedProduct(item.slug);
    return {
      slug: item.slug,
      name: item.name,
      subtitle: seed?.subtitle || `${item.category || "Semiconductor Product"} · ${item.process || "Application"}`,
      category: item.category || seed?.category || "Uncategorized",
      material: item.material || seed?.material || "공급사 확인 필요",
      manufacturingMethod: seed?.manufacturingMethod || "관리자 CMS 등록 데이터",
      process: item.process || seed?.process || "공정 확인 필요",
      equipment: seed?.equipment || "적용 장비 확인 필요",
      location: seed?.location || "적용 위치 확인 필요",
      function: seed?.function || `${item.process || "반도체 공정"} 적용 제품`,
      wafer: seed?.wafer || "공급사 확인 필요",
      purity: seed?.purity || "공급사 확인 필요",
      supplier: item.supplier || seed?.supplier || "Supplier TBD",
      supplierSlug: deriveSupplierSlug(item.supplier || seed?.supplier || "supplier", publishedSuppliers),
      verifiedAt: item.updatedAt || seed?.verifiedAt || new Date().toISOString().slice(0, 10),
      featured: seed?.featured ?? false,
    };
  });

  const knowledge: KnowledgeArticle[] = publishedKnowledge.map((item) => {
    const seed = findSeedKnowledge(item.slug);
    const processNeedle = item.process.trim().toLowerCase();
    const relatedByProcess = processNeedle
      ? products
          .filter((product) => product.process.toLowerCase().includes(processNeedle) || processNeedle.includes(product.process.toLowerCase()))
          .slice(0, 3)
          .map((product) => product.slug)
      : [];

    return {
      slug: item.slug,
      title: item.title,
      category: item.category || seed?.category || "Engineering Knowledge",
      summary: item.summary || seed?.summary || "관리자 CMS에서 발행한 기술 콘텐츠입니다.",
      relatedProcess: item.process || seed?.relatedProcess || "General",
      relatedProductSlugs: seed?.relatedProductSlugs?.length ? seed.relatedProductSlugs.filter((slug) => products.some((product) => product.slug === slug)) : relatedByProcess,
      publishedAt: item.updatedAt || seed?.publishedAt || new Date().toISOString().slice(0, 10),
      readingTime: seed?.readingTime || "5분",
      tags: seed?.tags || [item.category, item.process].filter(Boolean),
      keyPoints: seed?.keyPoints || [
        `${item.process || "관련 공정"}과 연결되는 핵심 기술 정보를 설명합니다.`,
        "관련 Product와 Supplier를 함께 확인할 수 있도록 구성합니다.",
        "Knowledge에서 RFQ까지 이어지는 B2B 소싱 흐름을 지원합니다.",
      ],
    };
  });

  return { products, suppliers, knowledge, source: "cms", ready: true };
}

function readPublicData(): PublicDataState {
  if (typeof window === "undefined") return fallbackState;
  try {
    const raw = window.localStorage.getItem(ADMIN_STORAGE_KEY);
    if (!raw) return { ...fallbackState, ready: true };
    const parsed = JSON.parse(raw) as AdminState;
    if (!parsed || !Array.isArray(parsed.products) || !Array.isArray(parsed.suppliers) || !Array.isArray(parsed.knowledge)) return { ...fallbackState, ready: true };
    return normalizeAdminState(parsed);
  } catch {
    return { ...fallbackState, ready: true };
  }
}

export function usePublicData() {
  const [data, setData] = useState<PublicDataState>(fallbackState);

  useEffect(() => {
    const databaseMode = process.env.NEXT_PUBLIC_DATA_SOURCE === "database";

    if (databaseMode) {
      let cancelled = false;
      const load = async () => {
        try {
          const response = await fetch("/api/public-data", { cache: "no-store" });
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const payload = await response.json() as {
            products: Product[];
            suppliers: Supplier[];
            knowledge: KnowledgeArticle[];
          };
          if (!cancelled) setData({ ...payload, source: "database", ready: true });
        } catch (error) {
          console.error("PostgreSQL public data load failed; falling back to Mock Data.", error);
          if (!cancelled) setData({ ...fallbackState, ready: true, error: "DATABASE_UNAVAILABLE" });
        }
      };
      load();
      return () => { cancelled = true; };
    }

    const sync = () => setData(readPublicData());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener(PUBLIC_DATA_EVENT, sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(PUBLIC_DATA_EVENT, sync);
    };
  }, []);

  return data;
}

export function usePublicRelations() {
  const data = usePublicData();
  return useMemo(() => ({
    ...data,
    getProduct: (slug: string) => data.products.find((item) => item.slug === slug),
    getSupplier: (slug: string) => data.suppliers.find((item) => item.slug === slug),
    getKnowledge: (slug: string) => data.knowledge.find((item) => item.slug === slug),
    getProductsBySupplier: (slug: string) => data.products.filter((item) => item.supplierSlug === slug),
    getArticlesForProduct: (slug: string) => data.knowledge.filter((article) => article.relatedProductSlugs.includes(slug)),
    getProductsForArticle: (article: KnowledgeArticle) => article.relatedProductSlugs.map((slug) => data.products.find((item) => item.slug === slug)).filter((item): item is Product => Boolean(item)),
  }), [data]);
}
