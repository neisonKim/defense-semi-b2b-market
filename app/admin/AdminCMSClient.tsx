"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { knowledgeArticles, products, suppliers } from "@/data/mock";
import { Badge, Stat } from "@/components/UI";

type AdminStatus = "Draft" | "Review" | "Verified" | "Published" | "Needs Update";
type Tab = "dashboard" | "products" | "suppliers" | "knowledge" | "verification";

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

export default function AdminCMSClient() {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [data, setData] = useState<AdminState>(seedState);
  const [hydrated, setHydrated] = useState(false);
  const [query, setQuery] = useState("");
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
    const verificationQueue = [
      ...data.products.filter((item) => ["Draft", "Review", "Needs Update"].includes(item.status)),
      ...data.suppliers.filter((item) => ["Draft", "Review", "Needs Update"].includes(item.status)),
      ...data.knowledge.filter((item) => ["Draft", "Review", "Needs Update"].includes(item.status)),
    ];
    return {
      products: data.products.length,
      suppliers: data.suppliers.length,
      knowledge: data.knowledge.length,
      published: [...data.products, ...data.suppliers, ...data.knowledge].filter((item) => item.status === "Published").length,
      verification: verificationQueue.length,
      verifiedSuppliers: data.suppliers.filter((item) => item.verified).length,
    };
  }, [data]);

  const normalizedQuery = query.trim().toLowerCase();
  const visibleProducts = data.products.filter((item) => !normalizedQuery || [item.name, item.category, item.process, item.supplier, item.material].join(" ").toLowerCase().includes(normalizedQuery));
  const visibleSuppliers = data.suppliers.filter((item) => !normalizedQuery || [item.name, item.type, item.region, item.meta].join(" ").toLowerCase().includes(normalizedQuery));
  const visibleKnowledge = data.knowledge.filter((item) => !normalizedQuery || [item.title, item.category, item.process, item.summary].join(" ").toLowerCase().includes(normalizedQuery));

  const flash = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2200);
  };

  const saveProduct = async (event: FormEvent) => {
    event.preventDefault();
    if (!productForm.name.trim()) return;
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
    if (!supplierForm.name.trim()) return;
    const resolvedSlug = supplierForm.slug || slugify(supplierForm.name);
    if (data.suppliers.some((item) => item.slug === resolvedSlug && item.id !== editingSupplierId)) {
      flash("같은 Supplier Slug가 이미 존재합니다. Slug를 변경해 주세요.");
      return;
    }
    const record: AdminSupplier = { ...supplierForm, slug: resolvedSlug, updatedAt: today() };
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
    if (!knowledgeForm.title.trim()) return;
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
          <button className={tab === "dashboard" ? "active" : ""} onClick={() => { setTab("dashboard"); setQuery(""); }}>대시보드</button>
          <button className={tab === "products" ? "active" : ""} onClick={() => { setTab("products"); setQuery(""); }}>제품 관리 <span>{data.products.length}</span></button>
          <button className={tab === "suppliers" ? "active" : ""} onClick={() => { setTab("suppliers"); setQuery(""); }}>공급사 관리 <span>{data.suppliers.length}</span></button>
          <button className={tab === "knowledge" ? "active" : ""} onClick={() => { setTab("knowledge"); setQuery(""); }}>Knowledge 관리 <span>{data.knowledge.length}</span></button>
          <button className={tab === "verification" ? "active" : ""} onClick={() => { setTab("verification"); setQuery(""); }}>검증 큐 <span>{metrics.verification}</span></button>
          <div className="adminCmsNavNote">Stage 11: PostgreSQL CRUD 이후 DB 관계와 RFQ 무결성을 최종 QA합니다.</div>
        </aside>

        <section className="adminCmsMain">
          {tab === "dashboard" && (
            <>
              <div className="adminHeroV2">
                <div>
                  <span>Semiconductor Data Platform</span>
                  <h2>데이터를 등록하고 검증하며<br/>하나의 공급망으로 연결합니다.</h2>
                  <p>Stage 11에서는 PostgreSQL CRUD와 공개 데이터 관계, RFQ 저장 구조까지 최종 점검합니다.</p>
                </div>
                <div className="adminHeroGraph"><i/><i/><i/><i/><i/></div>
              </div>
              <div className="adminKpi adminKpiV2">
                <Stat value={String(metrics.products)} label="등록 제품" delta="Mock CRUD"/>
                <Stat value={String(metrics.suppliers)} label="등록 공급사" delta={`${metrics.verifiedSuppliers} Verified`}/>
                <Stat value={String(metrics.knowledge)} label="Knowledge" delta="Connected"/>
                <Stat value={String(metrics.published)} label="Published" delta="공개 상태"/>
                <Stat value={String(metrics.verification)} label="검증 대기" delta="Review Queue"/>
                <Stat value={databaseMode ? "DB" : "Local"} label="저장 방식" delta={databaseMode ? "PostgreSQL" : "Browser"}/>
              </div>
              <div className="twoGrid adminDashboardPanels">
                <div className="card adminOpsCard">
                  <div className="rowBetween"><div><h2>운영 데이터</h2><p>관리할 데이터 유형을 선택하세요.</p></div></div>
                  <div className="adminQuickGrid">
                    <button onClick={() => setTab("products")}><strong>Product</strong><span>{metrics.products}개 관리</span></button>
                    <button onClick={() => setTab("suppliers")}><strong>Supplier</strong><span>{metrics.suppliers}개 관리</span></button>
                    <button onClick={() => setTab("knowledge")}><strong>Knowledge</strong><span>{metrics.knowledge}개 관리</span></button>
                    <button onClick={() => setTab("verification")}><strong>Verification</strong><span>{metrics.verification}개 검토</span></button>
                    <a className="adminQaLink" href="/api/db/qa" target="_blank" rel="noreferrer"><strong>DB QA</strong><span>관계 / RFQ 점검</span></a>
                  </div>
                </div>
                <div className="card adminOpsCard">
                  <h2>콘텐츠 발행 워크플로우</h2>
                  <div className="adminWorkflowV2">
                    {['Draft','Review','Technical Review','Verified','Published','Needs Update'].map((item, index) => <div key={item}><span>{String(index + 1).padStart(2,'0')}</span><strong>{item}</strong></div>)}
                  </div>
                </div>
              </div>
              <div className="card adminDataModelV2">
                <div className="rowBetween"><div><h2>관계형 데이터 구조</h2><p>Product · Supplier · Knowledge · RFQ와 Admin CRUD가 동일한 PostgreSQL 관계형 데이터 모델을 사용합니다.</p></div><Badge>Architecture Ready</Badge></div>
                <div className="adminEntityFlow">
                  {['Process','Technology','Material','Product','SupplierProduct','Supplier','Knowledge','RFQ'].map((item) => <div key={item}>{item}</div>)}
                </div>
              </div>
            </>
          )}

          {tab === "products" && (
            <AdminSection title="제품 관리" description="제품을 추가·수정·삭제하고 발행 상태를 관리합니다." query={query} setQuery={setQuery} count={visibleProducts.length}>
              <form className="card adminCrudForm" onSubmit={saveProduct}>
                <div className="adminFormHeader"><div><strong>{editingProductId ? "제품 수정" : "새 제품 등록"}</strong><span>필수 정보부터 입력합니다.</span></div>{editingProductId && <button type="button" className="btn" onClick={() => { setEditingProductId(null); setProductForm(emptyProduct()); }}>수정 취소</button>}</div>
                <div className="adminFormGrid">
                  <Field label="제품명 *"><input value={productForm.name} onChange={(e) => setProductForm({...productForm, name:e.target.value, slug: editingProductId ? productForm.slug : slugify(e.target.value)})} required /></Field>
                  <Field label="Slug"><input value={productForm.slug} onChange={(e) => setProductForm({...productForm, slug:e.target.value})} /></Field>
                  <Field label="Category"><input value={productForm.category} onChange={(e) => setProductForm({...productForm, category:e.target.value})} placeholder="Chamber Parts" /></Field>
                  <Field label="Process"><input value={productForm.process} onChange={(e) => setProductForm({...productForm, process:e.target.value})} placeholder="Dry Etching" /></Field>
                  <Field label="Supplier"><input value={productForm.supplier} onChange={(e) => setProductForm({...productForm, supplier:e.target.value})} placeholder="TCK" /></Field>
                  <Field label="Material"><input value={productForm.material} onChange={(e) => setProductForm({...productForm, material:e.target.value})} placeholder="SiC" /></Field>
                  <Field label="Status"><StatusSelect value={productForm.status} onChange={(value) => setProductForm({...productForm, status:value})} /></Field>
                </div>
                <button className="btn primary" type="submit">{editingProductId ? "제품 수정 저장" : "제품 등록"}</button>
              </form>
              <CrudTable headers={["제품명","Category / Process","Supplier","Status","Updated","관리"]}>
                {visibleProducts.map((item) => <tr key={item.id}><td><strong>{item.name}</strong><small>{item.slug}</small></td><td>{item.category}<small>{item.process}</small></td><td>{item.supplier}<small>{item.material}</small></td><td><Badge kind={statusKind(item.status)}>{item.status}</Badge></td><td>{item.updatedAt}</td><td><div className="adminRowActions"><button onClick={() => { setEditingProductId(item.id); setProductForm(item); window.scrollTo({top:0,behavior:'smooth'}); }}>수정</button><button className="danger" onClick={() => removeProduct(item.id)}>삭제</button></div></td></tr>)}
              </CrudTable>
            </AdminSection>
          )}

          {tab === "suppliers" && (
            <AdminSection title="공급사 관리" description="공급사 유형, 지역, 검증 상태와 발행 상태를 관리합니다." query={query} setQuery={setQuery} count={visibleSuppliers.length}>
              <form className="card adminCrudForm" onSubmit={saveSupplier}>
                <div className="adminFormHeader"><div><strong>{editingSupplierId ? "공급사 수정" : "새 공급사 등록"}</strong><span>기업 검증 상태와 메타 정보를 관리합니다.</span></div>{editingSupplierId && <button type="button" className="btn" onClick={() => { setEditingSupplierId(null); setSupplierForm(emptySupplier()); }}>수정 취소</button>}</div>
                <div className="adminFormGrid">
                  <Field label="공급사명 *"><input value={supplierForm.name} onChange={(e) => setSupplierForm({...supplierForm, name:e.target.value, slug: editingSupplierId ? supplierForm.slug : slugify(e.target.value)})} required /></Field>
                  <Field label="Slug"><input value={supplierForm.slug} onChange={(e) => setSupplierForm({...supplierForm, slug:e.target.value})} /></Field>
                  <Field label="Supplier Type"><input value={supplierForm.type} onChange={(e) => setSupplierForm({...supplierForm, type:e.target.value})} /></Field>
                  <Field label="Region"><input value={supplierForm.region} onChange={(e) => setSupplierForm({...supplierForm, region:e.target.value})} /></Field>
                  <Field label="Capabilities"><input value={supplierForm.meta} onChange={(e) => setSupplierForm({...supplierForm, meta:e.target.value})} placeholder="SiC · Chamber Parts" /></Field>
                  <Field label="Status"><StatusSelect value={supplierForm.status} onChange={(value) => setSupplierForm({...supplierForm, status:value})} /></Field>
                  <label className="adminVerifyCheck"><input type="checkbox" checked={supplierForm.verified} onChange={(e) => setSupplierForm({...supplierForm, verified:e.target.checked})}/><span>Company Verified</span></label>
                </div>
                <button className="btn primary" type="submit">{editingSupplierId ? "공급사 수정 저장" : "공급사 등록"}</button>
              </form>
              <CrudTable headers={["공급사","Type","Region","Verification","Status","관리"]}>
                {visibleSuppliers.map((item) => <tr key={item.id}><td><strong>{item.name}</strong><small>{item.meta}</small></td><td>{item.type}</td><td>{item.region}</td><td><Badge kind={item.verified?"green":"amber"}>{item.verified?"Verified":"Not Verified"}</Badge></td><td><Badge kind={statusKind(item.status)}>{item.status}</Badge></td><td><div className="adminRowActions"><button onClick={() => { setEditingSupplierId(item.id); setSupplierForm(item); window.scrollTo({top:0,behavior:'smooth'}); }}>수정</button><button className="danger" onClick={() => removeSupplier(item.id)}>삭제</button></div></td></tr>)}
              </CrudTable>
            </AdminSection>
          )}

          {tab === "knowledge" && (
            <AdminSection title="Knowledge 관리" description="기술 콘텐츠를 공정·카테고리와 함께 관리합니다." query={query} setQuery={setQuery} count={visibleKnowledge.length}>
              <form className="card adminCrudForm" onSubmit={saveKnowledge}>
                <div className="adminFormHeader"><div><strong>{editingKnowledgeId ? "Knowledge 수정" : "새 Knowledge 등록"}</strong><span>공정과 제품으로 연결될 콘텐츠의 기본 정보를 입력합니다.</span></div>{editingKnowledgeId && <button type="button" className="btn" onClick={() => { setEditingKnowledgeId(null); setKnowledgeForm(emptyKnowledge()); }}>수정 취소</button>}</div>
                <div className="adminFormGrid">
                  <Field label="제목 *"><input value={knowledgeForm.title} onChange={(e) => setKnowledgeForm({...knowledgeForm, title:e.target.value, slug: editingKnowledgeId ? knowledgeForm.slug : slugify(e.target.value)})} required /></Field>
                  <Field label="Slug"><input value={knowledgeForm.slug} onChange={(e) => setKnowledgeForm({...knowledgeForm, slug:e.target.value})} /></Field>
                  <Field label="Category"><input value={knowledgeForm.category} onChange={(e) => setKnowledgeForm({...knowledgeForm, category:e.target.value})} placeholder="CAE / CFD" /></Field>
                  <Field label="Related Process"><input value={knowledgeForm.process} onChange={(e) => setKnowledgeForm({...knowledgeForm, process:e.target.value})} placeholder="Thermal Management" /></Field>
                  <Field label="Status"><StatusSelect value={knowledgeForm.status} onChange={(value) => setKnowledgeForm({...knowledgeForm, status:value})} /></Field>
                  <Field label="Summary" wide><textarea value={knowledgeForm.summary} onChange={(e) => setKnowledgeForm({...knowledgeForm, summary:e.target.value})} rows={3}/></Field>
                </div>
                <button className="btn primary" type="submit">{editingKnowledgeId ? "Knowledge 수정 저장" : "Knowledge 등록"}</button>
              </form>
              <CrudTable headers={["제목","Category","Related Process","Status","Updated","관리"]}>
                {visibleKnowledge.map((item) => <tr key={item.id}><td><strong>{item.title}</strong><small>{item.slug}</small></td><td>{item.category}</td><td>{item.process}</td><td><Badge kind={statusKind(item.status)}>{item.status}</Badge></td><td>{item.updatedAt}</td><td><div className="adminRowActions"><button onClick={() => { setEditingKnowledgeId(item.id); setKnowledgeForm(item); window.scrollTo({top:0,behavior:'smooth'}); }}>수정</button><button className="danger" onClick={() => removeKnowledge(item.id)}>삭제</button></div></td></tr>)}
              </CrudTable>
            </AdminSection>
          )}

          {tab === "verification" && <VerificationQueue data={data} onStatusChange={changeStatus} busy={busy} />}
        </section>
      </div>
    </main>
  );
}

function Field({ label, children, wide=false }: { label:string; children:React.ReactNode; wide?:boolean }) {
  return <label className={`adminField ${wide ? "wide" : ""}`}><span>{label}</span>{children}</label>;
}

function StatusSelect({ value, onChange }: { value:AdminStatus; onChange:(value:AdminStatus)=>void }) {
  return <select value={value} onChange={(event) => onChange(event.target.value as AdminStatus)}>{["Draft","Review","Verified","Published","Needs Update"].map((item) => <option key={item}>{item}</option>)}</select>;
}

function AdminSection({title,description,query,setQuery,count,children}:{title:string;description:string;query:string;setQuery:(value:string)=>void;count:number;children:React.ReactNode}) {
  return <div className="adminCrudSection"><div className="adminSectionHead"><div><h2>{title}</h2><p>{description}</p></div><div className="adminSearch"><input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="검색"/><strong>{count}개</strong></div></div>{children}</div>;
}

function CrudTable({headers,children}:{headers:string[];children:React.ReactNode}) {
  return <div className="card adminTableWrap"><table className="adminCrudTable"><thead><tr>{headers.map((header)=><th key={header}>{header}</th>)}</tr></thead><tbody>{children}</tbody></table></div>;
}

function VerificationQueue({data,onStatusChange,busy}:{data:AdminState;onStatusChange:(entity:"Product"|"Supplier"|"Knowledge",id:string,status:AdminStatus)=>void|Promise<void>;busy:boolean}) {
  const rows = [
    ...data.products.filter((item)=>["Draft","Review","Needs Update"].includes(item.status)).map((item)=>({kind:"Product" as const,id:item.id,title:item.name,status:item.status})),
    ...data.suppliers.filter((item)=>["Draft","Review","Needs Update"].includes(item.status)).map((item)=>({kind:"Supplier" as const,id:item.id,title:item.name,status:item.status})),
    ...data.knowledge.filter((item)=>["Draft","Review","Needs Update"].includes(item.status)).map((item)=>({kind:"Knowledge" as const,id:item.id,title:item.title,status:item.status})),
  ];
  return <div className="adminCrudSection"><div className="adminSectionHead"><div><h2>검증 큐</h2><p>Draft · Review · Needs Update 항목을 검토하고 Verified 또는 Published 상태로 변경합니다.</p></div><Badge kind={rows.length?"amber":"green"}>{rows.length} Pending</Badge></div>{rows.length===0?<div className="card adminEmptyQueue"><strong>검증 대기 항목이 없습니다.</strong><span>새 Draft 또는 Review 콘텐츠가 등록되면 이곳에 표시됩니다.</span></div>:<div className="card adminTableWrap"><table className="adminCrudTable"><thead><tr><th>Type</th><th>Title</th><th>Status</th><th>Action</th></tr></thead><tbody>{rows.map((row)=><tr key={`${row.kind}-${row.id}`}><td>{row.kind}</td><td><strong>{row.title}</strong></td><td><Badge kind="amber">{row.status}</Badge></td><td><div className="adminRowActions"><button disabled={busy} onClick={()=>onStatusChange(row.kind,row.id,"Verified")}>Verified</button><button disabled={busy} className="publish" onClick={()=>onStatusChange(row.kind,row.id,"Published")}>Published</button></div></td></tr>)}</tbody></table></div>}</div>;
}
