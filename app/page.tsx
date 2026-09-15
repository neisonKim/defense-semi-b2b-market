"use client";

import Link from "next/link";
import { Badge, SectionTitle, Stat } from "@/components/UI";
import { problems, processes } from "@/data/mock";
import { usePublicData } from "@/lib/publicData";
import { KnowledgeVisual, ProcessVisual, PrototypeProductThumb } from "@/components/PrototypeProductVisual";

export default function Home() {
  const { products, suppliers, knowledge, source } = usePublicData();
  const preferredProducts = products.filter((item) => item.featured);
  const featuredProducts = (preferredProducts.length ? preferredProducts : products).slice(0, 6);
  const verifiedSuppliers = suppliers.filter((item) => item.verified);
  const featuredSuppliers = (verifiedSuppliers.length ? verifiedSuppliers : suppliers).slice(0, 4);

  return (
    <>
      <section className="container heroWrap">
        <div className="hero">
          <div>
            <p className="kicker">Semiconductor Manufacturing Intelligence + Sourcing</p>
            <h1>반도체 기술·제품·공급사를<br/><em>하나의 흐름으로 연결합니다.</em></h1>
            <p className="lead">공정과 엔지니어링 문제에서 출발해 관련 제품, 공급사, 기술 콘텐츠를 확인하고 RFQ까지 이어지는 B2B 소싱 플랫폼 프로토타입입니다.</p>
            <form className="searchBar" action="/products"><input name="q" placeholder="예: Dry Etching, Focus Ring, TIM, Thermal Testing" /><button type="submit">통합 검색</button></form>
            <div className="chipRow"><span>Dry Etching</span><span>HBM</span><span>TIM</span><span>CFD</span><span>Thermal Testing</span><span>Advanced Packaging</span></div>
            <div className="ctaRow"><Link className="btn primary" href="/products">제품 탐색</Link><Link className="btn ghost" href="/rfq">견적 요청 (RFQ)</Link></div>
          </div>
          <div className="waferVisual"><span>KNOWLEDGE → PROCESS → PRODUCT<br/>SUPPLIER → RFQ</span></div>
        </div>
      </section>

      <section className="container">
        <div className="publicSyncBanner homeSyncBanner"><span className={source !== "mock" ? "live" : "demo"}>●</span><strong>{source === "database" ? "PostgreSQL Published 데이터가 메인에 연결되었습니다." : source === "cms" ? "Admin CMS Published 데이터가 메인에도 반영됩니다." : "Mock Data Mode"}</strong><small>{source === "database" ? "Products · Suppliers · Knowledge를 Prisma API에서 불러옵니다." : source === "cms" ? "Products · Suppliers · Knowledge의 공개 상태가 CMS와 동기화되었습니다." : "Admin CMS에서 데이터가 저장되면 발행 상태 기반으로 전환됩니다."}</small></div>
      </section>

      <section className="container statGrid">
        <Stat value={`${products.length}`} label="공개 제품" delta={source === "database" ? "PostgreSQL" : source === "cms" ? "Published" : "MVP"} />
        <Stat value={`${suppliers.length}`} label="공개 공급사" delta={source === "database" ? "PostgreSQL" : source === "cms" ? "Published" : "MVP"} />
        <Stat value={`${processes.length}`} label="공정·기술 영역" delta="MVP" />
        <Stat value={`${knowledge.length}`} label="공개 기술 콘텐츠" delta={source === "database" ? "PostgreSQL" : source === "cms" ? "Published" : "MVP"} />
      </section>

      <section className="container section" id="process">
        <SectionTitle title="공정에서 제품까지 탐색" sub="Knowledge → Process → Product → Supplier → RFQ 관계를 실제 공개 데이터와 연결합니다." />
        <div className="processGrid">{processes.map((process, index) => <article className="card processCard" key={process.name}><div className="processCardBody"><span className="processIndex">{index + 1}</span><div><h3>{process.name}</h3><strong>{process.ko}</strong><p>{process.description}</p></div></div><ProcessVisual process={process.name} /></article>)}</div>
      </section>

      <section className="container section">
        <SectionTitle title="현재 공개된 제품" sub="Admin CMS에서 Published 처리된 제품이 메인과 Product Catalog에 동시에 표시됩니다." />
        {featuredProducts.length ? <div className="productGrid">{featuredProducts.map((item) => <Link href={`/products/${item.slug}`} className="card marketProductCard" key={item.slug}><PrototypeProductThumb source={item} label={item.process} /><Badge>{item.category}</Badge><h3>{item.name}</h3><p>{item.subtitle}</p><div className="productMetaLine"><span>{item.material}</span><span>{item.supplier}</span></div><strong className="cardLink">제품 상세 보기 →</strong></Link>)}</div> : <div className="card emptyState">현재 Published 제품이 없습니다. Admin CMS에서 제품을 발행해 주세요.</div>}
        <div className="sectionAction"><Link className="btn" href="/products">전체 제품 보기</Link></div>
      </section>

      <section className="container section">
        <SectionTitle title="어떤 엔지니어링 문제를 해결하고 계신가요?" sub="검색어보다 먼저 현장의 문제에서 출발할 수 있도록 문제 기반 탐색 구조를 유지합니다." />
        <div className="problemGrid">{problems.map((problem) => <div className="problem" key={problem}>{problem}</div>)}</div>
      </section>

      <section className="container section">
        <SectionTitle title="공개된 공급사" sub="Published 상태와 Company Verified 상태를 함께 보여줍니다." />
        {featuredSuppliers.length ? <div className="supplierGrid">{featuredSuppliers.map((supplier) => <Link href={`/suppliers/${supplier.slug}`} className="card supplierCard" key={supplier.slug}><div><h3>{supplier.name}</h3><p>{supplier.meta}</p><small>{supplier.processes.join(" · ")}</small></div><Badge kind={supplier.verified ? "green" : "amber"}>{supplier.verified ? "Verified" : "Published"}</Badge></Link>)}</div> : <div className="card emptyState">현재 Published 공급사가 없습니다.</div>}
        <div className="sectionAction"><Link className="btn" href="/suppliers">전체 공급사 보기</Link></div>
      </section>

      <section className="container section" id="knowledge">
        <SectionTitle title="Knowledge Hub" sub="Published Knowledge가 관련 Product와 Supplier를 통해 RFQ 퍼널로 이어집니다." />
        {knowledge.length ? <div className="threeGrid">{knowledge.slice(0, 6).map((article) => <Link href={`/knowledge/${article.slug}`} className="card knowledge" key={article.slug}><KnowledgeVisual article={article} /><Badge>{article.category}</Badge><h3>{article.title}</h3><p>{article.summary}</p><div className="relatedRow"><span>{article.relatedProcess}</span><strong>Knowledge 상세 →</strong></div></Link>)}</div> : <div className="card emptyState">현재 Published Knowledge가 없습니다.</div>}
        <div className="sectionAction"><Link className="btn" href="/knowledge">Knowledge 전체 보기</Link></div>
      </section>

      <section className="container section"><div className="card conversionCard"><div><Badge kind="green">Connected Flow</Badge><h2>Admin에서 발행하면 공개 페이지까지 연결됩니다.</h2><p>CMS → Published → Marketplace → Product / Supplier / Knowledge → RFQ 흐름을 하나의 프로토타입에서 확인할 수 있습니다.</p></div><Link className="btn primary" href="/admin">Admin CMS 확인</Link></div></section>
    </>
  );
}
