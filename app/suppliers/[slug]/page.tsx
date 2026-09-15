"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Badge } from "@/components/UI";
import { SaveToDeskButton } from "@/components/SaveToDeskButton";
import { usePublicRelations } from "@/lib/publicData";
import { PrototypeProductThumb, SupplierVisual } from "@/components/PrototypeProductVisual";

export default function SupplierPage() {
  const params = useParams<{ slug: string }>();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const { getSupplier, getProductsBySupplier, source, ready } = usePublicRelations();
  const supplier = getSupplier(slug);

  if (!ready) {
    return <div className="container section"><div className="card emptyState"><h1>공개 데이터를 불러오는 중입니다.</h1><p>Admin CMS의 Published 상태를 확인하고 있습니다.</p></div></div>;
  }

  if (!supplier) {
    return (
      <div className="container section"><div className="card emptyState"><h1>공개된 공급사를 찾을 수 없습니다.</h1><p>Admin CMS에서 해당 공급사를 Published 상태로 변경해 주세요.</p><Link className="btn primary" href="/suppliers">공급사 목록으로</Link></div></div>
    );
  }

  const connectedProducts = getProductsBySupplier(slug);

  return (
    <div className="container section supplierDetailPage">
      <p className="crumb">홈 / 공급사 / {supplier.name}</p>
      <div className="publicSyncBanner compactSync"><span className={source !== "mock" ? "live" : "demo"}>●</span><strong>{source === "database" ? "PostgreSQL Published Supplier" : source === "cms" ? "CMS Published Supplier" : "Mock Supplier"}</strong><small>공개 디렉터리와 관리자 발행 상태가 연결되어 있습니다.</small></div>
      <section className="supplierHero card">
        <div className="supplierLogo">{supplier.name.slice(0, 3)}</div>
        <div>
          <Badge kind={supplier.verified ? "green" : "amber"}>{supplier.verified ? "Verified Supplier" : "Not Verified"}</Badge>
          <h1>{supplier.name}</h1>
          <p>{supplier.meta}. 공급능력 중심의 B2B Supplier Page 구조입니다.</p>
          <div className="badgeRow"><Badge>Supplier Type: {supplier.type}</Badge><Badge>Region: {supplier.region}</Badge><Badge>Connected Products: {connectedProducts.length}</Badge></div>
          <div className="ctaRow"><button className="btn primary">공급사 문의</button><Link className="btn dark" href={`/rfq?supplier=${supplier.slug}`}>RFQ 요청</Link><SaveToDeskButton type="supplier" slug={supplier.slug} label="☆ 관심 공급사 저장" /></div>
        </div>
        <SupplierVisual source={connectedProducts[0]} supplier={supplier} />
      </section>

      <div className="capGrid section">
        {[
          ["공급사 유형",supplier.type],
          ["주요 공정",supplier.processes.join(" / ")],
          ["공급 지역",supplier.region],
          ["일반 납기",supplier.leadTime],
          ["MOQ",supplier.moq],
          ["샘플 제공",supplier.sample],
        ].map(([a,b])=><div className="card" key={a}><span>{a}</span><strong>{b}</strong></div>)}
      </div>

      <div className="twoGrid section">
        <article className="card"><h2>공급망 내 위치</h2><p>Process / Material → Product → Supplier → RFQ 구조에서 이 공급사가 어느 제품과 공정에 연결되는지 보여줍니다.</p></article>
        <article className="card"><h2>지원 가능 공정</h2><div className="chipRow light">{supplier.processes.map((process)=><span key={process}>{process}</span>)}</div></article>
      </div>

      <section className="section">
        <h2 className="detailSectionTitle">연결된 주요 제품</h2>
        {connectedProducts.length > 0 ? (
          <div className="productGrid">
            {connectedProducts.map((product)=><Link className="card marketProductCard" href={`/products/${product.slug}`} key={product.slug}><PrototypeProductThumb source={product} label={product.process} /><Badge>{product.category}</Badge><h3>{product.name}</h3><p>{product.subtitle}</p><strong className="cardLink">제품 상세 →</strong></Link>)}
          </div>
        ) : (
          <div className="card emptyState">현재 Published 상태로 연결된 제품이 없습니다.</div>
        )}
      </section>
      <div className="supplierMobileBar"><SaveToDeskButton type="supplier" slug={supplier.slug} label="☆" /><Link href={`/rfq?supplier=${supplier.slug}`}>공급사 문의</Link></div>
    </div>
  );
}
