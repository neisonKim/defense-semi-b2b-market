"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { usePublicData } from "@/lib/publicData";

type RFQRecord = {
  id: string;
  productSlug: string;
  productName: string;
  qty: string;
  unit: string;
  due: string;
  requirement?: string;
  company?: string;
  contact?: string;
  phone?: string;
  email?: string;
  supplierCandidates?: string[];
  status: string;
  createdAt?: string;
};

type Tab = "rfq" | "products" | "suppliers" | "knowledge";

function readArray<T>(key: string): T[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(parsed) ? parsed as T[] : [];
  } catch {
    return [];
  }
}

export default function MyDeskClient() {
  const { products, suppliers, knowledge, ready, source } = usePublicData();
  const [tab, setTab] = useState<Tab>("rfq");
  const [rfqs, setRfqs] = useState<RFQRecord[]>([]);
  const [productSlugs, setProductSlugs] = useState<string[]>([]);
  const [supplierSlugs, setSupplierSlugs] = useState<string[]>([]);
  const [knowledgeSlugs, setKnowledgeSlugs] = useState<string[]>([]);

  const refresh = () => {
    setRfqs(readArray<RFQRecord>("defense-semi-rfqs"));
    setProductSlugs(readArray<string>("defense-semi-favorite-products"));
    setSupplierSlugs(readArray<string>("defense-semi-favorite-suppliers"));
    setKnowledgeSlugs(readArray<string>("defense-semi-saved-knowledge"));
  };

  useEffect(() => refresh(), []);

  const savedProducts = useMemo(() => productSlugs.map((slug) => products.find((item) => item.slug === slug)).filter((item): item is NonNullable<typeof item> => Boolean(item)), [productSlugs, products]);
  const savedSuppliers = useMemo(() => supplierSlugs.map((slug) => suppliers.find((item) => item.slug === slug)).filter((item): item is NonNullable<typeof item> => Boolean(item)), [supplierSlugs, suppliers]);
  const savedKnowledge = useMemo(() => knowledgeSlugs.map((slug) => knowledge.find((item) => item.slug === slug)).filter((item): item is NonNullable<typeof item> => Boolean(item)), [knowledgeSlugs, knowledge]);

  const removeSaved = (key: string, slug: string) => {
    const next = readArray<string>(key).filter((item) => item !== slug);
    localStorage.setItem(key, JSON.stringify(next));
    refresh();
  };

  const clearRfqs = () => {
    localStorage.removeItem("defense-semi-rfqs");
    refresh();
  };

  if (!ready) {
    return <div className="card emptyState"><h3>My Desk 데이터를 불러오는 중입니다.</h3><p>Published 데이터와 저장 항목을 동기화하고 있습니다.</p></div>;
  }

  return (
    <>
      <div className="publicSyncBanner compactSync">
        <span className={source !== "mock" ? "live" : "demo"}>●</span>
        <strong>{source === "database" ? "PostgreSQL 공개 데이터와 My Desk 연결" : source === "cms" ? "CMS Published 데이터와 My Desk 동기화" : "Mock Data와 My Desk 연결"}</strong>
        <small>현재 공개 상태인 Product / Supplier / Knowledge만 저장 목록에 표시됩니다.</small>
      </div>

      <div className="myDeskStats section">
        <DeskStat value={rfqs.length} label="RFQ 요청" />
        <DeskStat value={savedProducts.length} label="관심 제품" />
        <DeskStat value={savedSuppliers.length} label="관심 공급사" />
        <DeskStat value={savedKnowledge.length} label="저장 Knowledge" />
      </div>

      <section className="card myDeskWorkspace">
        <div className="myDeskTabs">
          <TabButton active={tab === "rfq"} onClick={() => setTab("rfq")}>RFQ 내역</TabButton>
          <TabButton active={tab === "products"} onClick={() => setTab("products")}>관심 제품</TabButton>
          <TabButton active={tab === "suppliers"} onClick={() => setTab("suppliers")}>관심 공급사</TabButton>
          <TabButton active={tab === "knowledge"} onClick={() => setTab("knowledge")}>저장 Knowledge</TabButton>
        </div>

        {tab === "rfq" && (
          <div className="deskPanel">
            <div className="rowBetween"><div><h2>RFQ 요청 내역</h2><p>RFQ 원본은 PostgreSQL에 저장되며, 로그인 기능 전까지 My Desk 표시용 요약본은 현재 브라우저에 보관합니다.</p></div>{rfqs.length > 0 && <button className="btn" onClick={clearRfqs}>Demo 내역 비우기</button>}</div>
            {rfqs.length === 0 ? <Empty title="아직 RFQ 요청이 없습니다." action="첫 RFQ 작성" href="/rfq" /> : <div className="deskRfqList">{rfqs.map((rfq) => {
              const isPublished = products.some((item) => item.slug === rfq.productSlug);
              return <div className="deskRfqCard" key={rfq.id}><div><span className="deskStatus">{rfq.status}</span><h3>{rfq.productName}</h3><p>{rfq.id} · {rfq.qty} {rfq.unit} · 납기 {rfq.due}</p>{rfq.supplierCandidates && <small>매칭 후보: {rfq.supplierCandidates.join(", ")}</small>}</div><div className="deskRfqActions">{isPublished ? <Link className="btn" href={`/products/${rfq.productSlug}`}>제품 보기</Link> : <span className="btn disabledLink">현재 비공개</span>}<Link className="btn primary" href={isPublished ? `/rfq?product=${rfq.productSlug}` : "/rfq"}>다시 RFQ</Link></div></div>;
            })}</div>}
          </div>
        )}

        {tab === "products" && (
          <div className="deskPanel">
            <h2>관심 제품</h2>
            {savedProducts.length === 0 ? <Empty title="현재 공개 상태인 저장 제품이 없습니다." action="제품 탐색" href="/products" /> : <div className="deskSavedGrid">{savedProducts.map((item) => <div className="deskSavedCard" key={item.slug}><span>{item.category}</span><h3>{item.name}</h3><p>{item.subtitle}</p><small>{item.process} · {item.supplier}</small><div className="deskSavedActions"><Link className="btn primary" href={`/products/${item.slug}`}>제품 보기</Link><button className="btn" onClick={() => removeSaved("defense-semi-favorite-products", item.slug)}>삭제</button></div></div>)}</div>}
          </div>
        )}

        {tab === "suppliers" && (
          <div className="deskPanel">
            <h2>관심 공급사</h2>
            {savedSuppliers.length === 0 ? <Empty title="현재 공개 상태인 저장 공급사가 없습니다." action="공급사 탐색" href="/suppliers" /> : <div className="deskSavedGrid">{savedSuppliers.map((item) => <div className="deskSavedCard" key={item.slug}><span>{item.type}</span><h3>{item.name}</h3><p>{item.meta}</p><small>{item.region} · {item.processes.join(" / ")}</small><div className="deskSavedActions"><Link className="btn primary" href={`/suppliers/${item.slug}`}>공급사 보기</Link><button className="btn" onClick={() => removeSaved("defense-semi-favorite-suppliers", item.slug)}>삭제</button></div></div>)}</div>}
          </div>
        )}

        {tab === "knowledge" && (
          <div className="deskPanel">
            <h2>저장 Knowledge</h2>
            {savedKnowledge.length === 0 ? <Empty title="현재 공개 상태인 저장 Knowledge가 없습니다." action="Knowledge 탐색" href="/knowledge" /> : <div className="deskSavedGrid">{savedKnowledge.map((item) => <div className="deskSavedCard" key={item.slug}><span>{item.category}</span><h3>{item.title}</h3><p>{item.summary}</p><small>{item.relatedProcess} · {item.readingTime}</small><div className="deskSavedActions"><Link className="btn primary" href={`/knowledge/${item.slug}`}>콘텐츠 보기</Link><button className="btn" onClick={() => removeSaved("defense-semi-saved-knowledge", item.slug)}>삭제</button></div></div>)}</div>}
          </div>
        )}
      </section>
    </>
  );
}

function DeskStat({ value, label }: { value: number; label: string }) {
  return <div className="card deskStat"><strong>{value}</strong><span>{label}</span></div>;
}
function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return <button className={active ? "active" : ""} onClick={onClick}>{children}</button>;
}
function Empty({ title, action, href }: { title: string; action: string; href: string }) {
  return <div className="deskEmpty"><h3>{title}</h3><p>관련 페이지에서 My Desk 저장 버튼을 사용하거나 RFQ를 제출하면 여기에 표시됩니다.</p><Link className="btn primary" href={href}>{action}</Link></div>;
}
