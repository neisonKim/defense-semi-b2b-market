"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { knowledgeArticles, products, suppliers } from "@/data/mock";
import { Badge, Stat } from "@/components/UI";

type AdminStatus = "Draft" | "Review" | "Verified" | "Published" | "Needs Update";
type Tab = "dashboard" | "products" | "suppliers" | "knowledge" | "verification";
type StatusFilter = "All" | AdminStatus;
type SortOrder = "updated-desc" | "updated-asc" | "name-asc";

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

const STORAGE_KEY = "defense-semi-admin-cms-v1";
const today = () => new Date().toISOString().slice(0, 10);
const uid = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const databaseMode = process.env.NEXT_PUBLIC_DATA_SOURCE === "database";

const seedState = (): AdminState => ({
  products: products.map((item, index) => ({
    id: `seed-product-${index + 1}`,
    slug: item.slug,
    name: item.name,
    category: item.category,
    process: item.process,
    supplier: item.supplier,
    material: item.material,
    status: "Published",
    updatedAt: item.verifiedAt,
  })),
  suppliers: suppliers.map((item, index) => ({
    id: `seed-supplier-${index + 1}`,
    slug: item.slug,
    name: item.name,
    type: item.type,
    region: item.region,
    meta: item.meta,
    verified: item.verified,
    status: item.verified ? "Published" : "Review",
    updatedAt: "2026-09-14",
  })),
  knowledge: knowledgeArticles.map((item, index) => ({
    id: `seed-knowledge-${index + 1}`,
    slug: item.slug,
    title: item.title,
    category: item.category,
    process: item.relatedProcess,
    summary: item.summary,
    status: "Published",
    updatedAt: item.publishedAt,
  })),
});

const emptyProduct = (): AdminProduct => ({
  id: "",
  slug: "",
  name: "",
  category: "",
  process: "",
  supplier: "",
  material: "",
  status: "Draft",
  updatedAt: today(),
});
const emptySupplier = (): AdminSupplier => ({
  id: "",
  slug: "",
  name: "",
  type: "Manufacturer",
  region: "Korea",
  meta: "",
  verified: false,
  status: "Draft",
  updatedAt: today(),
});
const emptyKnowledge = (): AdminKnowledge => ({
  id: "",
  slug: "",
  title: "",
  category: "",
  process: "",
  summary: "",
  status: "Draft",
  updatedAt: today(),
});

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function statusKind(status: AdminStatus): "blue" | "green" | "amber" {
  if (status === "Published" || status === "Verified") return "green";
  if (status === "Review" || status === "Needs Update") return "amber";
  return "blue";
}

function isFinalStatus(status: AdminStatus) {
  return status === "Verified" || status === "Published";
}

function getStatusCounts<T extends { status: AdminStatus }>(items: T[]) {
  return {
    All: items.length,
    Draft: items.filter((item) => item.status === "Draft").length,
    Review: items.filter((item) => item.status === "Review").length,
    Verified: items.filter((item) => item.status === "Verified").length,
    Published: items.filter((item) => item.status === "Published").length,
    "Needs Update": items.filter((item) => item.status === "Needs Update").length,
  } satisfies Record<StatusFilter, number>;
}

function compareAdminRows(
  a: { updatedAt: string },
  b: { updatedAt: string },
  aName: string,
  bName: string,
  sortOrder: SortOrder,
) {
  if (sortOrder === "name-asc") {
    return aName.localeCompare(bName, "ko");
  }

  const aTime = new Date(a.updatedAt).getTime();
  const bTime = new Date(b.updatedAt).getTime();

  if (sortOrder === "updated-asc") {
    return (Number.isNaN(aTime) ? 0 : aTime) - (Number.isNaN(bTime) ? 0 : bTime);
  }

  return (Number.isNaN(bTime) ? 0 : bTime) - (Number.isNaN(aTime) ? 0 : aTime);
}

function getMissingFields(
  fields: Array<[label: string, value: string | boolean]>,
) {
  return fields
    .filter(([, value]) =>
      typeof value === "boolean" ? !value : !value.trim(),
    )
    .map(([label]) => label);
}

export default function AdminCMSClient() {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [data, setData] = useState<AdminState>(seedState);
  const [hydrated, setHydrated] = useState(false);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [sortOrder, setSortOrder] = useState<SortOrder>("updated-desc");
  const [productForm, setProductForm] = useState<AdminProduct>(emptyProduct);
  const [supplierForm, setSupplierForm] = useState<AdminSupplier>(emptySupplier);
  const [knowledgeForm, setKnowledgeForm] = useState<AdminKnowledge>(emptyKnowledge);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editingSupplierId, setEditingSupplierId] = useState<string | null>(null);
  const [editingKnowledgeId, setEditingKnowledgeId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  const loadDatabaseData = async () => {
    const response = await fetch("/api/admin/data", { cache: "no-store" });
    const payload = await response.json() as { ok: boolean; data?: AdminState; message?: string };
    if (!response.ok || !payload.ok || !payload.data) throw new Error(payload.message || "관리자 DB 데이터를 불러오지 못했습니다.");
    setData(payload.data);
  };

  const apiRequest = async (url: string, options: RequestInit) => {
    const response = await fetch(url, { ...options, headers: { "Content-Type": "application/json", ...(options.headers || {}) } });
    const payload = await response.json().catch(() => ({})) as { ok?: boolean; message?: string };
    if (!response.ok || payload.ok === false) throw new Error(payload.message || `HTTP ${response.status}`);
    return payload;
  };

  useEffect(() => {
    const bootstrap = async () => {
      try {
        if (databaseMode) {
          await loadDatabaseData();
        } else {
          const saved = window.localStorage.getItem(STORAGE_KEY);
          if (saved) setData(JSON.parse(saved) as AdminState);
        }
      } catch (error) {
        console.error(error);
        setData(seedState());
        setNotice(error instanceof Error ? error.message : "관리자 데이터를 불러오지 못했습니다.");
      } finally {
        setHydrated(true);
      }
    };
    bootstrap();
  }, []);

  useEffect(() => {
    if (!hydrated || databaseMode) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new Event("defense-semi-public-data-updated"));
  }, [data, hydrated]);

  const metrics = useMemo(() => {
    const allRecords = [
      ...data.products,
      ...data.suppliers,
      ...data.knowledge,
    ];

    const verificationQueue = allRecords.filter((item) =>
      ["Draft", "Review", "Needs Update"].includes(item.status),
    );

    return {
      total: allRecords.length,
      products: data.products.length,
      suppliers: data.suppliers.length,
      knowledge: data.knowledge.length,
      published: allRecords.filter((item) => item.status === "Published").length,
      draft: allRecords.filter((item) => item.status === "Draft").length,
      review: allRecords.filter((item) => item.status === "Review").length,
      verified: allRecords.filter((item) => item.status === "Verified").length,
      needsUpdate: allRecords.filter((item) => item.status === "Needs Update").length,
      verification: verificationQueue.length,
      verifiedSuppliers: data.suppliers.filter((item) => item.verified).length,
    };
  }, [data]);

  const recentItems = useMemo(() => {
    const rows = [
      ...data.products.map((item) => ({
        id: `Product-${item.id}`,
        kind: "Product" as const,
        title: item.name,
        status: item.status,
        updatedAt: item.updatedAt,
      })),
      ...data.suppliers.map((item) => ({
        id: `Supplier-${item.id}`,
        kind: "Supplier" as const,
        title: item.name,
        status: item.status,
        updatedAt: item.updatedAt,
      })),
      ...data.knowledge.map((item) => ({
        id: `Knowledge-${item.id}`,
        kind: "Knowledge" as const,
        title: item.title,
        status: item.status,
        updatedAt: item.updatedAt,
      })),
    ];

    return rows
      .sort((a, b) => {
        const aTime = new Date(a.updatedAt).getTime();
        const bTime = new Date(b.updatedAt).getTime();

        if (Number.isNaN(aTime) && Number.isNaN(bTime)) return 0;
        if (Number.isNaN(aTime)) return 1;
        if (Number.isNaN(bTime)) return -1;

        return bTime - aTime;
      })
      .slice(0, 6);
  }, [data]);

  const publishRate =
    metrics.total > 0
      ? Math.round((metrics.published / metrics.total) * 100)
      : 0;

  const openCreateTab = (
    target: "products" | "suppliers" | "knowledge",
  ) => {
    setQuery("");
    setStatusFilter("All");
    setSortOrder("updated-desc");

    if (target === "products") {
      setEditingProductId(null);
      setProductForm(emptyProduct());
    }

    if (target === "suppliers") {
      setEditingSupplierId(null);
      setSupplierForm(emptySupplier());
    }

    if (target === "knowledge") {
      setEditingKnowledgeId(null);
      setKnowledgeForm(emptyKnowledge());
    }

    setTab(target);
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  };


  const openEditFromVerification = (
    entity: "Product" | "Supplier" | "Knowledge",
    id: string,
  ) => {
    setQuery("");
    setStatusFilter("All");
    setSortOrder("updated-desc");

    if (entity === "Product") {
      const target = data.products.find((item) => item.id === id);
      if (!target) return;
      setEditingProductId(target.id);
      setProductForm(target);
      setTab("products");
    }

    if (entity === "Supplier") {
      const target = data.suppliers.find((item) => item.id === id);
      if (!target) return;
      setEditingSupplierId(target.id);
      setSupplierForm(target);
      setTab("suppliers");
    }

    if (entity === "Knowledge") {
      const target = data.knowledge.find((item) => item.id === id);
      if (!target) return;
      setEditingKnowledgeId(target.id);
      setKnowledgeForm(target);
      setTab("knowledge");
    }

    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  };

  const getStatusChangeIssues = (
    entity: "Product" | "Supplier" | "Knowledge",
    id: string,
  ) => {
    if (entity === "Product") {
      const target = data.products.find((item) => item.id === id);
      if (!target) return ["Product를 찾을 수 없습니다."];

      const missing = getMissingFields([
        ["제품명", target.name],
        ["Category", target.category],
        ["Process", target.process],
        ["Supplier", target.supplier],
        ["Material", target.material],
      ]);

      const supplierExists =
        !!target.supplier.trim() &&
        data.suppliers.some(
          (supplier) =>
            supplier.name.trim().toLowerCase() ===
            target.supplier.trim().toLowerCase(),
        );

      if (target.supplier.trim() && !supplierExists) {
        missing.push("등록된 Supplier 연결");
      }

      return missing;
    }

    if (entity === "Supplier") {
      const target = data.suppliers.find((item) => item.id === id);
      if (!target) return ["Supplier를 찾을 수 없습니다."];

      return getMissingFields([
        ["공급사명", target.name],
        ["Supplier Type", target.type],
        ["Region", target.region],
        ["Capabilities", target.meta],
      ]);
    }

    const target = data.knowledge.find((item) => item.id === id);
    if (!target) return ["Knowledge를 찾을 수 없습니다."];

    return getMissingFields([
      ["제목", target.title],
      ["Category", target.category],
      ["Related Process", target.process],
      ["Summary", target.summary],
    ]);
  };

  const normalizedQuery = query.trim().toLowerCase();

  const productStatusCounts = useMemo(
    () => getStatusCounts(data.products),
    [data.products],
  );
  const supplierStatusCounts = useMemo(
    () => getStatusCounts(data.suppliers),
    [data.suppliers],
  );
  const knowledgeStatusCounts = useMemo(
    () => getStatusCounts(data.knowledge),
    [data.knowledge],
  );

  const visibleProducts = useMemo(
    () =>
      data.products
        .filter(
          (item) =>
            (!normalizedQuery ||
              [item.name, item.category, item.process, item.supplier, item.material]
                .join(" ")
                .toLowerCase()
                .includes(normalizedQuery)) &&
            (statusFilter === "All" || item.status === statusFilter),
        )
        .sort((a, b) =>
          compareAdminRows(a, b, a.name, b.name, sortOrder),
        ),
    [data.products, normalizedQuery, statusFilter, sortOrder],
  );

  const visibleSuppliers = useMemo(
    () =>
      data.suppliers
        .filter(
          (item) =>
            (!normalizedQuery ||
              [item.name, item.type, item.region, item.meta]
                .join(" ")
                .toLowerCase()
                .includes(normalizedQuery)) &&
            (statusFilter === "All" || item.status === statusFilter),
        )
        .sort((a, b) =>
          compareAdminRows(a, b, a.name, b.name, sortOrder),
        ),
    [data.suppliers, normalizedQuery, statusFilter, sortOrder],
  );

  const visibleKnowledge = useMemo(
    () =>
      data.knowledge
        .filter(
          (item) =>
            (!normalizedQuery ||
              [item.title, item.category, item.process, item.summary]
                .join(" ")
                .toLowerCase()
                .includes(normalizedQuery)) &&
            (statusFilter === "All" || item.status === statusFilter),
        )
        .sort((a, b) =>
          compareAdminRows(a, b, a.title, b.title, sortOrder),
        ),
    [data.knowledge, normalizedQuery, statusFilter, sortOrder],
  );

  const productMissing = getMissingFields([
    ["제품명", productForm.name],
    ["Category", productForm.category],
    ["Process", productForm.process],
    ["Supplier", productForm.supplier],
    ["Material", productForm.material],
  ]);

  const supplierMissing = getMissingFields([
    ["공급사명", supplierForm.name],
    ["Supplier Type", supplierForm.type],
    ["Region", supplierForm.region],
    ["Capabilities", supplierForm.meta],
  ]);

  const knowledgeMissing = getMissingFields([
    ["제목", knowledgeForm.title],
    ["Category", knowledgeForm.category],
    ["Related Process", knowledgeForm.process],
    ["Summary", knowledgeForm.summary],
  ]);

  const selectedProductSupplierExists =
    !productForm.supplier.trim() ||
    data.suppliers.some(
      (item) =>
        item.name.trim().toLowerCase() ===
        productForm.supplier.trim().toLowerCase(),
    );


  const flash = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2200);
  };

  const saveProduct = async (event: FormEvent) => {
    event.preventDefault();
    if (busy) return;

    if (!productForm.name.trim()) {
      flash("제품명을 입력해 주세요.");
      return;
    }

    if (isFinalStatus(productForm.status) && productMissing.length > 0) {
      flash(`Verified / Published 전 필수 정보가 필요합니다: ${productMissing.join(", ")}`);
      return;
    }

    if (isFinalStatus(productForm.status) && !selectedProductSupplierExists) {
      flash("Verified / Published 제품은 등록된 Supplier와 연결해야 합니다.");
      return;
    }

    const resolvedSlug = productForm.slug || slugify(productForm.name);
    if (data.products.some((item) => item.slug === resolvedSlug && item.id !== editingProductId)) {
      flash("같은 Product Slug가 이미 존재합니다. Slug를 변경해 주세요.");
      return;
    }
    const record: AdminProduct = { ...productForm, slug: resolvedSlug, updatedAt: today() };
    if (databaseMode) {
      try {
        setBusy(true);
        await apiRequest(editingProductId ? `/api/admin/products/${editingProductId}` : "/api/admin/products", {
          method: editingProductId ? "PUT" : "POST",
          body: JSON.stringify({ ...record, id: undefined, updatedAt: undefined }),
        });
        await loadDatabaseData();
        setProductForm(emptyProduct());
        setEditingProductId(null);
        flash(editingProductId ? "제품 정보를 PostgreSQL에 수정했습니다." : "새 제품을 PostgreSQL에 등록했습니다.");
      } catch (error) {
        flash(error instanceof Error ? error.message : "제품 저장에 실패했습니다.");
      } finally {
        setBusy(false);
      }
      return;
    }
    const localRecord: AdminProduct = { ...record, id: editingProductId || uid("product") };
    setData((current) => ({ ...current, products: editingProductId ? current.products.map((item) => item.id === editingProductId ? localRecord : item) : [localRecord, ...current.products] }));
    setProductForm(emptyProduct());
    setEditingProductId(null);
    flash(editingProductId ? "제품 정보를 수정했습니다." : "새 제품을 등록했습니다.");
  };

  const saveSupplier = async (event: FormEvent) => {
    event.preventDefault();
    if (busy) return;

    if (!supplierForm.name.trim()) {
      flash("공급사명을 입력해 주세요.");
      return;
    }

    if (isFinalStatus(supplierForm.status) && supplierMissing.length > 0) {
      flash(`Verified / Published 전 필수 정보가 필요합니다: ${supplierMissing.join(", ")}`);
      return;
    }

    const resolvedSlug = supplierForm.slug || slugify(supplierForm.name);
    if (data.suppliers.some((item) => item.slug === resolvedSlug && item.id !== editingSupplierId)) {
      flash("같은 Supplier Slug가 이미 존재합니다. Slug를 변경해 주세요.");
      return;
    }
    const record: AdminSupplier = {
      ...supplierForm,
      slug: resolvedSlug,
      verified:
        isFinalStatus(supplierForm.status) || supplierForm.verified,
      updatedAt: today(),
    };
    if (databaseMode) {
      try {
        setBusy(true);
        await apiRequest(editingSupplierId ? `/api/admin/suppliers/${editingSupplierId}` : "/api/admin/suppliers", {
          method: editingSupplierId ? "PUT" : "POST",
          body: JSON.stringify({ ...record, id: undefined, updatedAt: undefined }),
        });
        await loadDatabaseData();
        setSupplierForm(emptySupplier());
        setEditingSupplierId(null);
        flash(editingSupplierId ? "공급사 정보를 PostgreSQL에 수정했습니다." : "새 공급사를 PostgreSQL에 등록했습니다.");
      } catch (error) {
        flash(error instanceof Error ? error.message : "공급사 저장에 실패했습니다.");
      } finally {
        setBusy(false);
      }
      return;
    }
    const localRecord: AdminSupplier = { ...record, id: editingSupplierId || uid("supplier") };
    setData((current) => ({ ...current, suppliers: editingSupplierId ? current.suppliers.map((item) => item.id === editingSupplierId ? localRecord : item) : [localRecord, ...current.suppliers] }));
    setSupplierForm(emptySupplier());
    setEditingSupplierId(null);
    flash(editingSupplierId ? "공급사 정보를 수정했습니다." : "새 공급사를 등록했습니다.");
  };

  const saveKnowledge = async (event: FormEvent) => {
    event.preventDefault();
    if (busy) return;

    if (!knowledgeForm.title.trim()) {
      flash("Knowledge 제목을 입력해 주세요.");
      return;
    }

    if (isFinalStatus(knowledgeForm.status) && knowledgeMissing.length > 0) {
      flash(`Verified / Published 전 필수 정보가 필요합니다: ${knowledgeMissing.join(", ")}`);
      return;
    }

    const resolvedSlug = knowledgeForm.slug || slugify(knowledgeForm.title);
    if (data.knowledge.some((item) => item.slug === resolvedSlug && item.id !== editingKnowledgeId)) {
      flash("같은 Knowledge Slug가 이미 존재합니다. Slug를 변경해 주세요.");
      return;
    }
    const record: AdminKnowledge = { ...knowledgeForm, slug: resolvedSlug, updatedAt: today() };
    if (databaseMode) {
      try {
        setBusy(true);
        await apiRequest(editingKnowledgeId ? `/api/admin/knowledge/${editingKnowledgeId}` : "/api/admin/knowledge", {
          method: editingKnowledgeId ? "PUT" : "POST",
          body: JSON.stringify({ ...record, id: undefined, updatedAt: undefined }),
        });
        await loadDatabaseData();
        setKnowledgeForm(emptyKnowledge());
        setEditingKnowledgeId(null);
        flash(editingKnowledgeId ? "Knowledge를 PostgreSQL에 수정했습니다." : "새 Knowledge를 PostgreSQL에 등록했습니다.");
      } catch (error) {
        flash(error instanceof Error ? error.message : "Knowledge 저장에 실패했습니다.");
      } finally {
        setBusy(false);
      }
      return;
    }
    const localRecord: AdminKnowledge = { ...record, id: editingKnowledgeId || uid("knowledge") };
    setData((current) => ({ ...current, knowledge: editingKnowledgeId ? current.knowledge.map((item) => item.id === editingKnowledgeId ? localRecord : item) : [localRecord, ...current.knowledge] }));
    setKnowledgeForm(emptyKnowledge());
    setEditingKnowledgeId(null);
    flash(editingKnowledgeId ? "Knowledge를 수정했습니다." : "새 Knowledge를 등록했습니다.");
  };

  const removeProduct = async (id: string) => {
    if (!window.confirm("이 제품을 삭제할까요?")) return;
    if (databaseMode) {
      try { setBusy(true); await apiRequest(`/api/admin/products/${id}`, { method: "DELETE" }); await loadDatabaseData(); flash("제품을 PostgreSQL에서 삭제했습니다."); }
      catch (error) { flash(error instanceof Error ? error.message : "제품 삭제에 실패했습니다."); } finally { setBusy(false); }
      return;
    }
    setData((current) => ({ ...current, products: current.products.filter((item) => item.id !== id) }));
    flash("제품을 삭제했습니다.");
  };

  const removeSupplier = async (id: string) => {
    const target = data.suppliers.find((item) => item.id === id);
    if (!target) return;
    const linkedProducts = data.products.filter((product) => product.supplier.trim().toLowerCase() === target.name.trim().toLowerCase());
    if (linkedProducts.length > 0) { flash(`연결된 제품 ${linkedProducts.length}개가 있어 공급사를 삭제할 수 없습니다.`); return; }
    if (!window.confirm("이 공급사를 삭제할까요?")) return;
    if (databaseMode) {
      try { setBusy(true); await apiRequest(`/api/admin/suppliers/${id}`, { method: "DELETE" }); await loadDatabaseData(); flash("공급사를 PostgreSQL에서 삭제했습니다."); }
      catch (error) { flash(error instanceof Error ? error.message : "공급사 삭제에 실패했습니다."); } finally { setBusy(false); }
      return;
    }
    setData((current) => ({ ...current, suppliers: current.suppliers.filter((item) => item.id !== id) }));
    flash("공급사를 삭제했습니다.");
  };

  const removeKnowledge = async (id: string) => {
    if (!window.confirm("이 Knowledge를 삭제할까요?")) return;
    if (databaseMode) {
      try { setBusy(true); await apiRequest(`/api/admin/knowledge/${id}`, { method: "DELETE" }); await loadDatabaseData(); flash("Knowledge를 PostgreSQL에서 삭제했습니다."); }
      catch (error) { flash(error instanceof Error ? error.message : "Knowledge 삭제에 실패했습니다."); } finally { setBusy(false); }
      return;
    }
    setData((current) => ({ ...current, knowledge: current.knowledge.filter((item) => item.id !== id) }));
    flash("Knowledge를 삭제했습니다.");
  };

  const changeStatus = async (entity: "Product" | "Supplier" | "Knowledge", id: string, status: AdminStatus) => {
    if (busy) return;

    if (isFinalStatus(status)) {
      const issues = getStatusChangeIssues(entity, id);

      if (issues.length > 0) {
        flash(
          `${status} 전 필수 정보가 필요합니다: ${issues.join(", ")}`,
        );
        return;
      }
    }

    if (databaseMode) {
      try {
        setBusy(true);
        await apiRequest("/api/admin/status", { method: "PATCH", body: JSON.stringify({ entity, id, status }) });
        await loadDatabaseData();
        flash(`${entity} 상태를 ${status}(으)로 변경했습니다.`);
      } catch (error) {
        flash(error instanceof Error ? error.message : "상태 변경에 실패했습니다.");
      } finally { setBusy(false); }
      return;
    }
    setData((current) => ({
      products: current.products.map((item) => entity === "Product" && item.id === id ? { ...item, status, updatedAt: today() } : item),
      suppliers: current.suppliers.map((item) => entity === "Supplier" && item.id === id ? { ...item, status, verified: status === "Verified" || status === "Published", updatedAt: today() } : item),
      knowledge: current.knowledge.map((item) => entity === "Knowledge" && item.id === id ? { ...item, status, updatedAt: today() } : item),
    }));
  };

  const resetDemo = () => {
    if (databaseMode) { flash("Database Mode에서는 데모 초기화를 사용하지 않습니다. 필요하면 npm.cmd run db:seed를 실행하세요."); return; }
    if (!window.confirm("관리자 CMS 데모 데이터를 최초 상태로 되돌릴까요?")) return;
    const fresh = seedState();
    setData(fresh);
    setProductForm(emptyProduct());
    setSupplierForm(emptySupplier());
    setKnowledgeForm(emptyKnowledge());
    setEditingProductId(null);
    setEditingSupplierId(null);
    setEditingKnowledgeId(null);
    flash("초기 데모 데이터로 복원했습니다.");
  };

  return (
    <main className="container section adminCmsV2">
      {notice && <div className="adminToast">{notice}</div>}
      {busy && <div className="adminToast" style={{top:72}}>PostgreSQL 처리 중...</div>}

      <div className="adminTopbar card">
        <div>
          <p className="adminEyebrow">SEMICONDUCTOR DATA OPERATIONS</p>
          <h1>관리자 CMS</h1>
          <p>Product · Supplier · Knowledge를 등록·수정·검증하고 Published 상태를 공개 페이지와 동기화합니다.</p>
        </div>
        <div className="adminTopActions">
          <span className="adminStorageState">● {databaseMode ? "PostgreSQL + Prisma" : "Local Storage + Public Sync"}</span>
          <button className="btn" type="button" onClick={resetDemo} disabled={busy}>{databaseMode ? "Seed 안내" : "데모 초기화"}</button>
        </div>
      </div>

      <div className="adminCmsShell">
        <aside className="adminCmsNav card">
          <strong>DEFENSE SEMI<br/>ADMIN CMS</strong>
          <button className={tab === "dashboard" ? "active" : ""} onClick={() => { setTab("dashboard"); setQuery(""); setStatusFilter("All"); setSortOrder("updated-desc"); }}>대시보드</button>
          <button className={tab === "products" ? "active" : ""} onClick={() => { setTab("products"); setQuery(""); setStatusFilter("All"); setSortOrder("updated-desc"); }}>제품 관리 <span>{data.products.length}</span></button>
          <button className={tab === "suppliers" ? "active" : ""} onClick={() => { setTab("suppliers"); setQuery(""); setStatusFilter("All"); setSortOrder("updated-desc"); }}>공급사 관리 <span>{data.suppliers.length}</span></button>
          <button className={tab === "knowledge" ? "active" : ""} onClick={() => { setTab("knowledge"); setQuery(""); setStatusFilter("All"); setSortOrder("updated-desc"); }}>Knowledge 관리 <span>{data.knowledge.length}</span></button>
          <button className={tab === "verification" ? "active" : ""} onClick={() => { setTab("verification"); setQuery(""); setStatusFilter("All"); setSortOrder("updated-desc"); }}>검증 큐 <span>{metrics.verification}</span></button>
          <div className="adminCmsNavNote">Protected Admin · PostgreSQL CRUD · Published Public Sync 운영 화면입니다.</div>
        </aside>

        <section className="adminCmsMain">
          {tab === "dashboard" && (
            <>
              <div className="adminHeroV2">
                <div className="adminHeroCopyV3">
                  <div className="adminHeroStatusRow">
                    <span>SEMICONDUCTOR DATA OPERATIONS</span>
                    <b>{databaseMode ? "DATABASE LIVE" : "LOCAL MODE"}</b>
                  </div>

                  <h2>
                    데이터 운영 상태를 한 화면에서 확인하고
                    <br />
                    바로 관리 작업으로 이동합니다.
                  </h2>

                  <p>
                    Product · Supplier · Knowledge의 등록, 검증, 발행 상태와
                    공개 데이터 연결 상태를 관리합니다.
                  </p>

                  <div className="adminHeroActionsV3">
                    <button
                      type="button"
                      className="btn primary"
                      onClick={() => openCreateTab("products")}
                    >
                      + Product 등록
                    </button>
                    <button
                      type="button"
                      className="btn adminHeroGhostBtn"
                      onClick={() => setTab("verification")}
                    >
                      검증 큐 {metrics.verification}
                    </button>
                  </div>
                </div>

                <div className="adminHeroMonitorV3">
                  <div className="adminHeroMonitorHead">
                    <span>Publishing Health</span>
                    <strong>{publishRate}%</strong>
                  </div>

                  <div className="adminPublishMeter">
                    <i style={{ width: `${publishRate}%` }} />
                  </div>

                  <div className="adminHeroMonitorGrid">
                    <div>
                      <span>Published</span>
                      <strong>{metrics.published}</strong>
                    </div>
                    <div>
                      <span>Pending</span>
                      <strong>{metrics.verification}</strong>
                    </div>
                    <div>
                      <span>Verified Supplier</span>
                      <strong>{metrics.verifiedSuppliers}</strong>
                    </div>
                    <div>
                      <span>Data Source</span>
                      <strong>{databaseMode ? "DB" : "Local"}</strong>
                    </div>
                  </div>
                </div>
              </div>

              <div className="adminKpi adminKpiV2">
                <Stat value={String(metrics.total)} label="전체 데이터" delta="CMS Records" />
                <Stat value={String(metrics.products)} label="등록 제품" delta="Product" />
                <Stat value={String(metrics.suppliers)} label="등록 공급사" delta={`${metrics.verifiedSuppliers} Verified`} />
                <Stat value={String(metrics.knowledge)} label="Knowledge" delta="Technical Content" />
                <Stat value={String(metrics.published)} label="Published" delta={`${publishRate}% 공개`} />
                <Stat value={String(metrics.verification)} label="검증 대기" delta="Action Required" />
              </div>

              <div className="adminDashboardGridV3">
                <section className="card adminOpsCard adminQuickOpsV3">
                  <div className="adminPanelHeadV3">
                    <div>
                      <span>QUICK ACTIONS</span>
                      <h2>빠른 등록</h2>
                      <p>새 데이터를 바로 등록하거나 검증 업무로 이동합니다.</p>
                    </div>
                  </div>

                  <div className="adminQuickGrid">
                    <button type="button" onClick={() => openCreateTab("products")}>
                      <b>01</b>
                      <strong>Product 등록</strong>
                      <span>제품 · 공정 · 소재 · 공급사 연결</span>
                    </button>

                    <button type="button" onClick={() => openCreateTab("suppliers")}>
                      <b>02</b>
                      <strong>Supplier 등록</strong>
                      <span>기업 · 지역 · Capability 관리</span>
                    </button>

                    <button type="button" onClick={() => openCreateTab("knowledge")}>
                      <b>03</b>
                      <strong>Knowledge 등록</strong>
                      <span>기술 콘텐츠와 Process 연결</span>
                    </button>

                    <button type="button" onClick={() => setTab("verification")}>
                      <b>04</b>
                      <strong>Verification Queue</strong>
                      <span>{metrics.verification}개 검토 필요</span>
                    </button>
                  </div>
                </section>

                <section className="card adminOpsCard adminVerificationHealthV3">
                  <div className="adminPanelHeadV3">
                    <div>
                      <span>VERIFICATION HEALTH</span>
                      <h2>발행 상태</h2>
                      <p>검증 단계별 데이터 분포를 확인합니다.</p>
                    </div>
                    <Badge kind={metrics.verification ? "amber" : "green"}>
                      {metrics.verification ? `${metrics.verification} Pending` : "Healthy"}
                    </Badge>
                  </div>

                  <div className="adminStatusBreakdownV3">
                    <StatusMetric label="Draft" value={metrics.draft} total={metrics.total} />
                    <StatusMetric label="Review" value={metrics.review} total={metrics.total} />
                    <StatusMetric label="Verified" value={metrics.verified} total={metrics.total} />
                    <StatusMetric label="Published" value={metrics.published} total={metrics.total} emphasis />
                    <StatusMetric label="Needs Update" value={metrics.needsUpdate} total={metrics.total} warning />
                  </div>
                </section>

                <section className="card adminOpsCard adminRecentV3">
                  <div className="adminPanelHeadV3">
                    <div>
                      <span>RECENT DATA</span>
                      <h2>최근 업데이트</h2>
                      <p>최근 수정된 CMS 데이터 6건입니다.</p>
                    </div>
                  </div>

                  <div className="adminRecentListV3">
                    {recentItems.length === 0 ? (
                      <div className="adminRecentEmptyV3">업데이트된 데이터가 없습니다.</div>
                    ) : (
                      recentItems.map((item) => (
                        <div className="adminRecentRowV3" key={item.id}>
                          <span className="adminRecentTypeV3">{item.kind}</span>
                          <div>
                            <strong>{item.title}</strong>
                            <small>{item.updatedAt}</small>
                          </div>
                          <Badge kind={statusKind(item.status)}>{item.status}</Badge>
                        </div>
                      ))
                    )}
                  </div>
                </section>

                <section className="card adminOpsCard adminSystemV3">
                  <div className="adminPanelHeadV3">
                    <div>
                      <span>SYSTEM STATUS</span>
                      <h2>운영 상태</h2>
                      <p>현재 관리자 CMS의 주요 연결 상태입니다.</p>
                    </div>
                  </div>

                  <div className="adminSystemListV3">
                    <SystemStatusRow
                      label="Admin Access"
                      value="Protected Session"
                      state="ok"
                    />
                    <SystemStatusRow
                      label="Data Storage"
                      value={databaseMode ? "PostgreSQL + Prisma" : "Local Storage"}
                      state={databaseMode ? "ok" : "warn"}
                    />
                    <SystemStatusRow
                      label="Published Sync"
                      value="Public Data Connected"
                      state="ok"
                    />
                    <SystemStatusRow
                      label="Verification"
                      value={metrics.verification ? `${metrics.verification} Pending` : "No Pending Items"}
                      state={metrics.verification ? "warn" : "ok"}
                    />
                  </div>

                  <a
                    className="adminQaLinkV3"
                    href="/api/db/qa"
                    target="_blank"
                    rel="noreferrer"
                  >
                    DB / Relation QA 열기
                    <span>↗</span>
                  </a>
                </section>
              </div>

              <div className="card adminDataModelV2">
                <div className="rowBetween">
                  <div>
                    <h2>관계형 데이터 구조</h2>
                    <p>
                      Process · Material · Product · Supplier · Knowledge · RFQ가
                      하나의 sourcing data flow로 연결됩니다.
                    </p>
                  </div>
                  <Badge>Architecture Ready</Badge>
                </div>

                <div className="adminEntityFlow">
                  {[
                    "Process",
                    "Technology",
                    "Material",
                    "Product",
                    "SupplierProduct",
                    "Supplier",
                    "Knowledge",
                    "RFQ",
                  ].map((item) => (
                    <div key={item}>{item}</div>
                  ))}
                </div>
              </div>
            </>
          )}

          {tab === "products" && (
            <AdminSection
              title="제품 관리"
              description="제품을 추가·수정·삭제하고 발행 상태를 관리합니다."
              query={query}
              setQuery={setQuery}
              count={visibleProducts.length}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              sortOrder={sortOrder}
              setSortOrder={setSortOrder}
              statusCounts={productStatusCounts}
            >
              <form className="card adminCrudForm" onSubmit={saveProduct}>
                <div className="adminFormHeader">
                  <div>
                    <strong>{editingProductId ? "제품 수정" : "새 제품 등록"}</strong>
                    <span>
                      Draft는 최소 정보로 저장할 수 있고, Verified / Published는 필수 정보와 Supplier 연결을 확인합니다.
                    </span>
                  </div>

                  {editingProductId ? (
                    <button
                      type="button"
                      className="btn"
                      disabled={busy}
                      onClick={() => {
                        setEditingProductId(null);
                        setProductForm(emptyProduct());
                      }}
                    >
                      수정 취소
                    </button>
                  ) : null}
                </div>

                <FormReadiness
                  status={productForm.status}
                  missing={productMissing}
                  extraWarning={
                    productForm.supplier.trim() && !selectedProductSupplierExists
                      ? "등록되지 않은 Supplier 이름입니다."
                      : ""
                  }
                />

                <div className="adminFormGrid">
                  <Field label="제품명 *">
                    <input
                      value={productForm.name}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          name: e.target.value,
                          slug: editingProductId
                            ? productForm.slug
                            : slugify(e.target.value),
                        })
                      }
                      required
                    />
                  </Field>

                  <Field label="Slug">
                    <input
                      value={productForm.slug}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          slug: slugify(e.target.value),
                        })
                      }
                    />
                  </Field>

                  <Field label="Category *">
                    <input
                      value={productForm.category}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          category: e.target.value,
                        })
                      }
                      placeholder="Chamber Parts"
                    />
                  </Field>

                  <Field label="Process *">
                    <input
                      value={productForm.process}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          process: e.target.value,
                        })
                      }
                      placeholder="Dry Etching"
                    />
                  </Field>

                  <Field label="Supplier *">
                    <select
                      value={productForm.supplier}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          supplier: e.target.value,
                        })
                      }
                    >
                      <option value="">등록된 Supplier 선택</option>
                      {productForm.supplier &&
                      !data.suppliers.some(
                        (item) =>
                          item.name.trim().toLowerCase() ===
                          productForm.supplier.trim().toLowerCase(),
                      ) ? (
                        <option value={productForm.supplier}>
                          {productForm.supplier} (기존 값)
                        </option>
                      ) : null}
                      {[...data.suppliers]
                        .sort((a, b) => a.name.localeCompare(b.name, "ko"))
                        .map((supplier) => (
                          <option key={supplier.id} value={supplier.name}>
                            {supplier.name}
                          </option>
                        ))}
                    </select>
                  </Field>

                  <Field label="Material *">
                    <input
                      value={productForm.material}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          material: e.target.value,
                        })
                      }
                      placeholder="SiC"
                    />
                  </Field>

                  <Field label="Status">
                    <StatusSelect
                      value={productForm.status}
                      onChange={(value) =>
                        setProductForm({
                          ...productForm,
                          status: value,
                        })
                      }
                    />
                  </Field>
                </div>

                <div className="adminFormActionsV4">
                  <button
                    className="btn primary"
                    type="submit"
                    disabled={busy}
                  >
                    {busy
                      ? "처리 중..."
                      : editingProductId
                        ? "제품 수정 저장"
                        : "제품 등록"}
                  </button>
                  <button
                    className="btn"
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      setEditingProductId(null);
                      setProductForm(emptyProduct());
                    }}
                  >
                    입력 초기화
                  </button>
                </div>
              </form>

              <CrudTable headers={["제품명", "Category / Process", "Supplier", "Status", "Updated", "관리"]}>
                {visibleProducts.length > 0 ? (
                  visibleProducts.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <strong>{item.name}</strong>
                        <small>{item.slug}</small>
                      </td>
                      <td>
                        {item.category || "—"}
                        <small>{item.process || "Process 미지정"}</small>
                      </td>
                      <td>
                        {item.supplier || "—"}
                        <small>{item.material || "Material 미지정"}</small>
                      </td>
                      <td>
                        <Badge kind={statusKind(item.status)}>{item.status}</Badge>
                      </td>
                      <td>{item.updatedAt}</td>
                      <td>
                        <div className="adminRowActions">
                          <button
                            disabled={busy}
                            onClick={() => {
                              setEditingProductId(item.id);
                              setProductForm(item);
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                          >
                            수정
                          </button>
                          {item.status === "Published" ? (
                            <a
                              href={`/products/${item.slug}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              공개보기
                            </a>
                          ) : null}
                          <button
                            className="danger"
                            disabled={busy}
                            onClick={() => removeProduct(item.id)}
                          >
                            삭제
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <EmptyTableRow
                    colSpan={6}
                    message="검색 또는 상태 조건에 맞는 Product가 없습니다."
                  />
                )}
              </CrudTable>
            </AdminSection>
          )}

          {tab === "suppliers" && (
            <AdminSection
              title="공급사 관리"
              description="공급사 유형, 지역, 검증 상태와 발행 상태를 관리합니다."
              query={query}
              setQuery={setQuery}
              count={visibleSuppliers.length}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              sortOrder={sortOrder}
              setSortOrder={setSortOrder}
              statusCounts={supplierStatusCounts}
            >
              <form className="card adminCrudForm" onSubmit={saveSupplier}>
                <div className="adminFormHeader">
                  <div>
                    <strong>{editingSupplierId ? "공급사 수정" : "새 공급사 등록"}</strong>
                    <span>
                      Verified / Published로 저장하면 Company Verified도 함께 활성화됩니다.
                    </span>
                  </div>

                  {editingSupplierId ? (
                    <button
                      type="button"
                      className="btn"
                      disabled={busy}
                      onClick={() => {
                        setEditingSupplierId(null);
                        setSupplierForm(emptySupplier());
                      }}
                    >
                      수정 취소
                    </button>
                  ) : null}
                </div>

                <FormReadiness
                  status={supplierForm.status}
                  missing={supplierMissing}
                  extraWarning=""
                />

                <div className="adminFormGrid">
                  <Field label="공급사명 *">
                    <input
                      value={supplierForm.name}
                      onChange={(e) =>
                        setSupplierForm({
                          ...supplierForm,
                          name: e.target.value,
                          slug: editingSupplierId
                            ? supplierForm.slug
                            : slugify(e.target.value),
                        })
                      }
                      required
                    />
                  </Field>

                  <Field label="Slug">
                    <input
                      value={supplierForm.slug}
                      onChange={(e) =>
                        setSupplierForm({
                          ...supplierForm,
                          slug: slugify(e.target.value),
                        })
                      }
                    />
                  </Field>

                  <Field label="Supplier Type *">
                    <input
                      value={supplierForm.type}
                      onChange={(e) =>
                        setSupplierForm({
                          ...supplierForm,
                          type: e.target.value,
                        })
                      }
                      placeholder="Manufacturer"
                    />
                  </Field>

                  <Field label="Region *">
                    <input
                      value={supplierForm.region}
                      onChange={(e) =>
                        setSupplierForm({
                          ...supplierForm,
                          region: e.target.value,
                        })
                      }
                      placeholder="Korea"
                    />
                  </Field>

                  <Field label="Capabilities *">
                    <input
                      value={supplierForm.meta}
                      onChange={(e) =>
                        setSupplierForm({
                          ...supplierForm,
                          meta: e.target.value,
                        })
                      }
                      placeholder="SiC · Chamber Parts"
                    />
                  </Field>

                  <Field label="Status">
                    <StatusSelect
                      value={supplierForm.status}
                      onChange={(value) =>
                        setSupplierForm({
                          ...supplierForm,
                          status: value,
                          verified:
                            isFinalStatus(value) || supplierForm.verified,
                        })
                      }
                    />
                  </Field>

                  <label className="adminVerifyCheck">
                    <input
                      type="checkbox"
                      checked={supplierForm.verified}
                      onChange={(e) =>
                        setSupplierForm({
                          ...supplierForm,
                          verified: e.target.checked,
                        })
                      }
                    />
                    <span>Company Verified</span>
                  </label>
                </div>

                <div className="adminFormActionsV4">
                  <button
                    className="btn primary"
                    type="submit"
                    disabled={busy}
                  >
                    {busy
                      ? "처리 중..."
                      : editingSupplierId
                        ? "공급사 수정 저장"
                        : "공급사 등록"}
                  </button>
                  <button
                    className="btn"
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      setEditingSupplierId(null);
                      setSupplierForm(emptySupplier());
                    }}
                  >
                    입력 초기화
                  </button>
                </div>
              </form>

              <CrudTable headers={["공급사", "Type", "Region", "Verification", "Status", "관리"]}>
                {visibleSuppliers.length > 0 ? (
                  visibleSuppliers.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <strong>{item.name}</strong>
                        <small>{item.meta || "Capabilities 미지정"}</small>
                      </td>
                      <td>{item.type || "—"}</td>
                      <td>{item.region || "—"}</td>
                      <td>
                        <Badge kind={item.verified ? "green" : "amber"}>
                          {item.verified ? "Verified" : "Not Verified"}
                        </Badge>
                      </td>
                      <td>
                        <Badge kind={statusKind(item.status)}>{item.status}</Badge>
                      </td>
                      <td>
                        <div className="adminRowActions">
                          <button
                            disabled={busy}
                            onClick={() => {
                              setEditingSupplierId(item.id);
                              setSupplierForm(item);
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                          >
                            수정
                          </button>
                          {item.status === "Published" ? (
                            <a
                              href={`/suppliers/${item.slug}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              공개보기
                            </a>
                          ) : null}
                          <button
                            className="danger"
                            disabled={busy}
                            onClick={() => removeSupplier(item.id)}
                          >
                            삭제
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <EmptyTableRow
                    colSpan={6}
                    message="검색 또는 상태 조건에 맞는 Supplier가 없습니다."
                  />
                )}
              </CrudTable>
            </AdminSection>
          )}

          {tab === "knowledge" && (
            <AdminSection
              title="Knowledge 관리"
              description="기술 콘텐츠를 공정·카테고리와 함께 관리합니다."
              query={query}
              setQuery={setQuery}
              count={visibleKnowledge.length}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              sortOrder={sortOrder}
              setSortOrder={setSortOrder}
              statusCounts={knowledgeStatusCounts}
            >
              <form className="card adminCrudForm" onSubmit={saveKnowledge}>
                <div className="adminFormHeader">
                  <div>
                    <strong>{editingKnowledgeId ? "Knowledge 수정" : "새 Knowledge 등록"}</strong>
                    <span>
                      Published 전 Category · Process · Summary까지 채워 공개 콘텐츠 품질을 확인합니다.
                    </span>
                  </div>

                  {editingKnowledgeId ? (
                    <button
                      type="button"
                      className="btn"
                      disabled={busy}
                      onClick={() => {
                        setEditingKnowledgeId(null);
                        setKnowledgeForm(emptyKnowledge());
                      }}
                    >
                      수정 취소
                    </button>
                  ) : null}
                </div>

                <FormReadiness
                  status={knowledgeForm.status}
                  missing={knowledgeMissing}
                  extraWarning=""
                />

                <div className="adminFormGrid">
                  <Field label="제목 *">
                    <input
                      value={knowledgeForm.title}
                      onChange={(e) =>
                        setKnowledgeForm({
                          ...knowledgeForm,
                          title: e.target.value,
                          slug: editingKnowledgeId
                            ? knowledgeForm.slug
                            : slugify(e.target.value),
                        })
                      }
                      required
                    />
                  </Field>

                  <Field label="Slug">
                    <input
                      value={knowledgeForm.slug}
                      onChange={(e) =>
                        setKnowledgeForm({
                          ...knowledgeForm,
                          slug: slugify(e.target.value),
                        })
                      }
                    />
                  </Field>

                  <Field label="Category *">
                    <input
                      value={knowledgeForm.category}
                      onChange={(e) =>
                        setKnowledgeForm({
                          ...knowledgeForm,
                          category: e.target.value,
                        })
                      }
                      placeholder="CAE / CFD"
                    />
                  </Field>

                  <Field label="Related Process *">
                    <input
                      value={knowledgeForm.process}
                      onChange={(e) =>
                        setKnowledgeForm({
                          ...knowledgeForm,
                          process: e.target.value,
                        })
                      }
                      placeholder="Thermal Management"
                    />
                  </Field>

                  <Field label="Status">
                    <StatusSelect
                      value={knowledgeForm.status}
                      onChange={(value) =>
                        setKnowledgeForm({
                          ...knowledgeForm,
                          status: value,
                        })
                      }
                    />
                  </Field>

                  <Field label="Summary *" wide>
                    <textarea
                      value={knowledgeForm.summary}
                      onChange={(e) =>
                        setKnowledgeForm({
                          ...knowledgeForm,
                          summary: e.target.value,
                        })
                      }
                      rows={4}
                      placeholder="검색 결과와 상세페이지에서 보여줄 핵심 요약을 입력하세요."
                    />
                  </Field>
                </div>

                <div className="adminFormActionsV4">
                  <button
                    className="btn primary"
                    type="submit"
                    disabled={busy}
                  >
                    {busy
                      ? "처리 중..."
                      : editingKnowledgeId
                        ? "Knowledge 수정 저장"
                        : "Knowledge 등록"}
                  </button>
                  <button
                    className="btn"
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      setEditingKnowledgeId(null);
                      setKnowledgeForm(emptyKnowledge());
                    }}
                  >
                    입력 초기화
                  </button>
                </div>
              </form>

              <CrudTable headers={["제목", "Category", "Related Process", "Status", "Updated", "관리"]}>
                {visibleKnowledge.length > 0 ? (
                  visibleKnowledge.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <strong>{item.title}</strong>
                        <small>{item.slug}</small>
                      </td>
                      <td>{item.category || "—"}</td>
                      <td>{item.process || "—"}</td>
                      <td>
                        <Badge kind={statusKind(item.status)}>{item.status}</Badge>
                      </td>
                      <td>{item.updatedAt}</td>
                      <td>
                        <div className="adminRowActions">
                          <button
                            disabled={busy}
                            onClick={() => {
                              setEditingKnowledgeId(item.id);
                              setKnowledgeForm(item);
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                          >
                            수정
                          </button>
                          {item.status === "Published" ? (
                            <a
                              href={`/knowledge/${item.slug}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              공개보기
                            </a>
                          ) : null}
                          <button
                            className="danger"
                            disabled={busy}
                            onClick={() => removeKnowledge(item.id)}
                          >
                            삭제
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <EmptyTableRow
                    colSpan={6}
                    message="검색 또는 상태 조건에 맞는 Knowledge가 없습니다."
                  />
                )}
              </CrudTable>
            </AdminSection>
          )}

          {tab === "verification" && (
            <VerificationQueue
              data={data}
              onStatusChange={changeStatus}
              onEditItem={openEditFromVerification}
              busy={busy}
            />
          )}
        </section>
      </div>
    </main>
  );
}

function StatusMetric({
  label,
  value,
  total,
  emphasis = false,
  warning = false,
}: {
  label: string;
  value: number;
  total: number;
  emphasis?: boolean;
  warning?: boolean;
}) {
  const ratio = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div
      className={`adminStatusMetricV3 ${emphasis ? "emphasis" : ""} ${
        warning ? "warning" : ""
      }`}
    >
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      <div className="adminStatusTrackV3">
        <i style={{ width: `${ratio}%` }} />
      </div>
      <small>{ratio}% of records</small>
    </div>
  );
}

function SystemStatusRow({
  label,
  value,
  state,
}: {
  label: string;
  value: string;
  state: "ok" | "warn";
}) {
  return (
    <div className="adminSystemRowV3">
      <span className={`adminSystemDotV3 ${state}`} />
      <div>
        <strong>{label}</strong>
        <small>{value}</small>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  wide = false,
}: {
  label: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <label className={`adminField ${wide ? "wide" : ""}`}>
      <span>{label}</span>
      {children}
    </label>
  );
}

function StatusSelect({
  value,
  onChange,
}: {
  value: AdminStatus;
  onChange: (value: AdminStatus) => void;
}) {
  return (
    <select
      value={value}
      onChange={(event) =>
        onChange(event.target.value as AdminStatus)
      }
    >
      {["Draft", "Review", "Verified", "Published", "Needs Update"].map(
        (item) => (
          <option key={item}>{item}</option>
        ),
      )}
    </select>
  );
}

function FormReadiness({
  status,
  missing,
  extraWarning,
}: {
  status: AdminStatus;
  missing: string[];
  extraWarning: string;
}) {
  const finalStatus = isFinalStatus(status);
  const ready = missing.length === 0 && !extraWarning;

  return (
    <div
      className={`adminReadinessV4 ${
        finalStatus ? (ready ? "ready" : "warning") : "draft"
      }`}
    >
      <div>
        <strong>
          {finalStatus
            ? ready
              ? "Publish Ready"
              : "발행 전 확인 필요"
            : "Draft / Review 저장 가능"}
        </strong>
        <span>
          {finalStatus
            ? ready
              ? "Verified / Published에 필요한 기본 정보가 준비되었습니다."
              : "Verified / Published 상태에서는 아래 항목을 먼저 보완하세요."
            : "초기 입력 단계에서는 일부 필드가 비어 있어도 저장할 수 있습니다."}
        </span>
      </div>

      {finalStatus && !ready ? (
        <div className="adminReadinessIssuesV4">
          {missing.map((item) => (
            <span key={item}>{item}</span>
          ))}
          {extraWarning ? <span>{extraWarning}</span> : null}
        </div>
      ) : (
        <Badge kind={ready ? "green" : "blue"}>
          {finalStatus ? "READY" : status.toUpperCase()}
        </Badge>
      )}
    </div>
  );
}

function AdminSection({
  title,
  description,
  query,
  setQuery,
  count,
  statusFilter,
  setStatusFilter,
  sortOrder,
  setSortOrder,
  statusCounts,
  children,
}: {
  title: string;
  description: string;
  query: string;
  setQuery: (value: string) => void;
  count: number;
  statusFilter: StatusFilter;
  setStatusFilter: (value: StatusFilter) => void;
  sortOrder: SortOrder;
  setSortOrder: (value: SortOrder) => void;
  statusCounts: Record<StatusFilter, number>;
  children: React.ReactNode;
}) {
  const statuses: StatusFilter[] = [
    "All",
    "Draft",
    "Review",
    "Verified",
    "Published",
    "Needs Update",
  ];

  return (
    <div className="adminCrudSection">
      <div className="adminSectionHead">
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>

        <div className="adminSearch">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="이름 · 공정 · 소재 · 지역 검색"
          />
          <strong>{count}개</strong>
        </div>
      </div>

      <div className="adminCrudToolbarV4">
        <div className="adminStatusFiltersV4">
          {statuses.map((status) => (
            <button
              key={status}
              type="button"
              className={statusFilter === status ? "active" : ""}
              onClick={() => setStatusFilter(status)}
            >
              {status}
              <span>{statusCounts[status]}</span>
            </button>
          ))}
        </div>

        <label className="adminSortV4">
          <span>정렬</span>
          <select
            value={sortOrder}
            onChange={(event) =>
              setSortOrder(event.target.value as SortOrder)
            }
          >
            <option value="updated-desc">최근 수정순</option>
            <option value="updated-asc">오래된 수정순</option>
            <option value="name-asc">이름순</option>
          </select>
        </label>
      </div>

      {children}
    </div>
  );
}

function CrudTable({
  headers,
  children,
}: {
  headers: string[];
  children: React.ReactNode;
}) {
  return (
    <div className="card adminTableWrap">
      <table className="adminCrudTable">
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function EmptyTableRow({
  colSpan,
  message,
}: {
  colSpan: number;
  message: string;
}) {
  return (
    <tr>
      <td colSpan={colSpan}>
        <div className="adminEmptyTableV4">
          <strong>결과가 없습니다.</strong>
          <span>{message}</span>
        </div>
      </td>
    </tr>
  );
}

function VerificationQueue({
  data,
  onStatusChange,
  onEditItem,
  busy,
}: {
  data: AdminState;
  onStatusChange: (
    entity: "Product" | "Supplier" | "Knowledge",
    id: string,
    status: AdminStatus,
  ) => void | Promise<void>;
  onEditItem: (
    entity: "Product" | "Supplier" | "Knowledge",
    id: string,
  ) => void;
  busy: boolean;
}) {
  type QueueKind = "All" | "Product" | "Supplier" | "Knowledge";
  type QueueStatus = "All" | "Draft" | "Review" | "Needs Update";

  const [kindFilter, setKindFilter] = useState<QueueKind>("All");
  const [queueStatus, setQueueStatus] = useState<QueueStatus>("All");
  const [queueQuery, setQueueQuery] = useState("");

  const rows = useMemo(() => {
    const productRows = data.products
      .filter((item) =>
        ["Draft", "Review", "Needs Update"].includes(item.status),
      )
      .map((item) => {
        const issues = getMissingFields([
          ["제품명", item.name],
          ["Category", item.category],
          ["Process", item.process],
          ["Supplier", item.supplier],
          ["Material", item.material],
        ]);

        const supplierExists =
          !!item.supplier.trim() &&
          data.suppliers.some(
            (supplier) =>
              supplier.name.trim().toLowerCase() ===
              item.supplier.trim().toLowerCase(),
          );

        if (item.supplier.trim() && !supplierExists) {
          issues.push("등록된 Supplier 연결");
        }

        return {
          kind: "Product" as const,
          id: item.id,
          title: item.name,
          subtitle: [item.category, item.process, item.supplier]
            .filter(Boolean)
            .join(" · "),
          status: item.status,
          updatedAt: item.updatedAt,
          issues,
        };
      });

    const supplierRows = data.suppliers
      .filter((item) =>
        ["Draft", "Review", "Needs Update"].includes(item.status),
      )
      .map((item) => ({
        kind: "Supplier" as const,
        id: item.id,
        title: item.name,
        subtitle: [item.type, item.region, item.meta]
          .filter(Boolean)
          .join(" · "),
        status: item.status,
        updatedAt: item.updatedAt,
        issues: getMissingFields([
          ["공급사명", item.name],
          ["Supplier Type", item.type],
          ["Region", item.region],
          ["Capabilities", item.meta],
        ]),
      }));

    const knowledgeRows = data.knowledge
      .filter((item) =>
        ["Draft", "Review", "Needs Update"].includes(item.status),
      )
      .map((item) => ({
        kind: "Knowledge" as const,
        id: item.id,
        title: item.title,
        subtitle: [item.category, item.process]
          .filter(Boolean)
          .join(" · "),
        status: item.status,
        updatedAt: item.updatedAt,
        issues: getMissingFields([
          ["제목", item.title],
          ["Category", item.category],
          ["Related Process", item.process],
          ["Summary", item.summary],
        ]),
      }));

    const priority: Record<"Draft" | "Review" | "Needs Update", number> = {
      "Needs Update": 0,
      Review: 1,
      Draft: 2,
    };

    return [...productRows, ...supplierRows, ...knowledgeRows].sort(
      (a, b) => {
        const statusDiff =
          priority[a.status as keyof typeof priority] -
          priority[b.status as keyof typeof priority];

        if (statusDiff !== 0) return statusDiff;

        const aTime = new Date(a.updatedAt).getTime();
        const bTime = new Date(b.updatedAt).getTime();

        return (
          (Number.isNaN(bTime) ? 0 : bTime) -
          (Number.isNaN(aTime) ? 0 : aTime)
        );
      },
    );
  }, [data]);

  const counts = useMemo(
    () => ({
      all: rows.length,
      draft: rows.filter((item) => item.status === "Draft").length,
      review: rows.filter((item) => item.status === "Review").length,
      needsUpdate: rows.filter((item) => item.status === "Needs Update")
        .length,
      ready: rows.filter((item) => item.issues.length === 0).length,
      blocked: rows.filter((item) => item.issues.length > 0).length,
    }),
    [rows],
  );

  const visibleRows = useMemo(() => {
    const normalized = queueQuery.trim().toLowerCase();

    return rows.filter((row) => {
      const matchesKind =
        kindFilter === "All" || row.kind === kindFilter;

      const matchesStatus =
        queueStatus === "All" || row.status === queueStatus;

      const matchesQuery =
        !normalized ||
        [row.title, row.subtitle, row.kind, row.status]
          .join(" ")
          .toLowerCase()
          .includes(normalized);

      return matchesKind && matchesStatus && matchesQuery;
    });
  }, [rows, kindFilter, queueStatus, queueQuery]);

  const kindOptions: QueueKind[] = [
    "All",
    "Product",
    "Supplier",
    "Knowledge",
  ];

  const statusOptions: QueueStatus[] = [
    "All",
    "Draft",
    "Review",
    "Needs Update",
  ];

  return (
    <div className="adminCrudSection adminVerificationV5">
      <div className="adminSectionHead adminVerificationHeadV5">
        <div>
          <p className="adminEyebrow">VERIFICATION OPERATIONS</p>
          <h2>검증 큐</h2>
          <p>
            Draft · Review · Needs Update 항목을 확인하고
            Verified / Published 상태로 전환합니다.
          </p>
        </div>

        <Badge kind={rows.length ? "amber" : "green"}>
          {rows.length} Pending
        </Badge>
      </div>

      <div className="adminVerificationSummaryV5">
        <div className="card">
          <span>검증 대기</span>
          <strong>{counts.all}</strong>
          <small>전체 Queue</small>
        </div>

        <div className="card">
          <span>Review</span>
          <strong>{counts.review}</strong>
          <small>검토 진행</small>
        </div>

        <div className="card warning">
          <span>Needs Update</span>
          <strong>{counts.needsUpdate}</strong>
          <small>우선 보완</small>
        </div>

        <div className="card ready">
          <span>Publish Ready</span>
          <strong>{counts.ready}</strong>
          <small>필수정보 충족</small>
        </div>

        <div className="card blocked">
          <span>Blocked</span>
          <strong>{counts.blocked}</strong>
          <small>정보 보완 필요</small>
        </div>
      </div>

      <div className="card adminVerificationToolsV5">
        <div className="adminVerificationSearchV5">
          <span>SEARCH</span>
          <input
            value={queueQuery}
            onChange={(event) => setQueueQuery(event.target.value)}
            placeholder="검증 대상 검색"
          />
        </div>

        <div className="adminVerificationFilterGroupV5">
          <span>TYPE</span>
          <div>
            {kindOptions.map((kind) => (
              <button
                key={kind}
                type="button"
                className={kindFilter === kind ? "active" : ""}
                onClick={() => setKindFilter(kind)}
              >
                {kind}
              </button>
            ))}
          </div>
        </div>

        <div className="adminVerificationFilterGroupV5">
          <span>STATUS</span>
          <div>
            {statusOptions.map((status) => (
              <button
                key={status}
                type="button"
                className={queueStatus === status ? "active" : ""}
                onClick={() => setQueueStatus(status)}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="adminVerificationToolResultV5">
          <span>RESULT</span>
          <strong>{visibleRows.length}</strong>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="card adminEmptyQueue">
          <strong>검증 대기 항목이 없습니다.</strong>
          <span>
            새 Draft · Review · Needs Update 데이터가 등록되면
            이곳에 표시됩니다.
          </span>
        </div>
      ) : visibleRows.length === 0 ? (
        <div className="card adminEmptyQueue">
          <strong>조건에 맞는 검증 항목이 없습니다.</strong>
          <span>검색어나 Type / Status 필터를 변경해 주세요.</span>
        </div>
      ) : (
        <div className="adminVerificationListV5">
          {visibleRows.map((row) => {
            const ready = row.issues.length === 0;

            return (
              <article
                className={`card adminVerificationCardV5 ${
                  row.status === "Needs Update" ? "needsUpdate" : ""
                }`}
                key={`${row.kind}-${row.id}`}
              >
                <div className="adminVerificationCardMainV5">
                  <div className="adminVerificationTypeV5">
                    <span>{row.kind}</span>
                    <Badge kind={statusKind(row.status)}>
                      {row.status}
                    </Badge>
                  </div>

                  <div className="adminVerificationTitleV5">
                    <strong>{row.title || "제목 없음"}</strong>
                    <span>{row.subtitle || "메타 정보 없음"}</span>
                  </div>

                  <div className="adminVerificationReadinessV5">
                    <div>
                      <span>READINESS</span>
                      <strong className={ready ? "ready" : "blocked"}>
                        {ready ? "Publish Ready" : "Needs Data"}
                      </strong>
                    </div>

                    {ready ? (
                      <Badge kind="green">READY</Badge>
                    ) : (
                      <div className="adminVerificationIssuesV5">
                        {row.issues.slice(0, 3).map((issue) => (
                          <span key={issue}>{issue}</span>
                        ))}
                        {row.issues.length > 3 ? (
                          <span>+{row.issues.length - 3}</span>
                        ) : null}
                      </div>
                    )}
                  </div>

                  <div className="adminVerificationUpdatedV5">
                    <span>UPDATED</span>
                    <strong>{row.updatedAt || "—"}</strong>
                  </div>
                </div>

                <div className="adminVerificationActionsV5">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => onEditItem(row.kind, row.id)}
                  >
                    수정
                  </button>

                  {row.status === "Draft" ? (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        onStatusChange(row.kind, row.id, "Review")
                      }
                    >
                      Review로 이동
                    </button>
                  ) : null}

                  {row.status === "Needs Update" ? (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        onStatusChange(row.kind, row.id, "Review")
                      }
                    >
                      재검토
                    </button>
                  ) : null}

                  <button
                    type="button"
                    disabled={busy || !ready}
                    className="verify"
                    title={
                      ready
                        ? "Verified 상태로 변경"
                        : "필수 정보를 먼저 보완하세요."
                    }
                    onClick={() =>
                      onStatusChange(row.kind, row.id, "Verified")
                    }
                  >
                    Verified
                  </button>

                  <button
                    type="button"
                    disabled={busy || !ready}
                    className="publish"
                    title={
                      ready
                        ? "Published 상태로 변경"
                        : "필수 정보를 먼저 보완하세요."
                    }
                    onClick={() =>
                      onStatusChange(row.kind, row.id, "Published")
                    }
                  >
                    Published
                  </button>

                  {row.status !== "Needs Update" ? (
                    <button
                      type="button"
                      disabled={busy}
                      className="needsUpdate"
                      onClick={() =>
                        onStatusChange(row.kind, row.id, "Needs Update")
                      }
                    >
                      Needs Update
                    </button>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      )}

      <div className="card adminVerificationGuideV5">
        <div>
          <span>01</span>
          <strong>Draft</strong>
          <small>초기 데이터 입력</small>
        </div>
        <b>→</b>
        <div>
          <span>02</span>
          <strong>Review</strong>
          <small>내용·관계 검토</small>
        </div>
        <b>→</b>
        <div>
          <span>03</span>
          <strong>Verified</strong>
          <small>정보 검증 완료</small>
        </div>
        <b>→</b>
        <div>
          <span>04</span>
          <strong>Published</strong>
          <small>공개 페이지 노출</small>
        </div>
        <b>↺</b>
        <div className="warning">
          <span>05</span>
          <strong>Needs Update</strong>
          <small>재검토 필요</small>
        </div>
      </div>
    </div>
  );
}
