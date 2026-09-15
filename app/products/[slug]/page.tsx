"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Badge } from "@/components/UI";
import { SaveToDeskButton } from "@/components/SaveToDeskButton";
import { usePublicRelations } from "@/lib/publicData";
import { PrototypeProductGallery } from "@/components/PrototypeProductVisual";

export default function ProductPage() {
  const params = useParams<{ slug: string }>();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const { getProduct, getSupplier, getArticlesForProduct, source, ready } = usePublicRelations();
  const product = getProduct(slug);

  if (!ready) {
    return <div className="container section"><div className="card emptyState"><h1>공개 데이터를 불러오는 중입니다.</h1><p>Admin CMS의 Published 상태를 확인하고 있습니다.</p></div></div>;
  }

  if (!product) {
    return (
      <div className="container section">
        <div className="card emptyState">
          <h1>공개된 제품을 찾을 수 없습니다.</h1>
          <p>Admin CMS에서 해당 제품이 Published 상태인지 확인해 주세요.</p>
          <Link className="btn primary" href="/products">제품 목록으로</Link>
        </div>
      </div>
    );
  }

  const supplier = getSupplier(product.supplierSlug);
  const articles = getArticlesForProduct(product.slug);

  return (
    <div className="container section productDetailPage">
      <p className="crumb">홈 / 제품 / {product.category} / {product.name}</p>
      <div className="publicSyncBanner compactSync">
        <span className={source !== "mock" ? "live" : "demo"}>●</span>
        <strong>{source === "database" ? "PostgreSQL Published Product" : source === "cms" ? "CMS Published Product" : "Mock Product"}</strong>
        <small>Last Verified / Updated: {product.verifiedAt}</small>
      </div>

      <div className="productTop">
        <div className="card productMedia"><PrototypeProductGallery source={product} /></div>
        <div className="card productInfo">
          <Badge>{product.category}</Badge>
          <h1>{product.name}</h1>
          <p>{product.subtitle}</p>
          <dl>
            {[
              ["제품 카테고리", product.category],
              ["소재", product.material],
              ["제조 공법", product.manufacturingMethod],
              ["적용 공정", product.process],
              ["적용 장비", product.equipment],
              ["사용 위치", product.location],
              ["주요 기능", product.function],
            ].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
          </dl>
          <div className="ctaRow">
            <Link className="btn primary" href={`/rfq?product=${product.slug}`}>RFQ 요청</Link>
            <button className="btn">기술 문의</button>
            <button className="btn">샘플 문의</button>
            <SaveToDeskButton type="product" slug={product.slug} label="☆ 관심 제품 저장" />
          </div>
        </div>
        <aside className="card supplierSummary">
          <div className="rowBetween"><h2>{product.supplier}</h2>{supplier?.verified ? <Badge kind="green">Company Verified</Badge> : <Badge kind="amber">Supplier Check</Badge>}</div>
          <p>{supplier?.meta ?? "공개된 공급사 프로필이 아직 없습니다."}</p>
          <div className="miniStats"><StatMini a={supplier?.region ?? "-"} b="공급 지역"/><StatMini a={supplier?.leadTime ?? "-"} b="일반 납기"/></div>
          {supplier ? <Link className="btn full" href={`/suppliers/${product.supplierSlug}`}>공급사 프로필 보기</Link> : <Link className="btn full" href="/suppliers">공급사 탐색</Link>}
        </aside>
      </div>

      <div className="desktopDetailGrid section">
        <article className="card"><h2>제품 개요</h2><p>{product.subtitle}. 공정·소재·장비·공급사 데이터를 분리해 보여주는 제품 상세 구조입니다.</p></article>
        <article className="card"><h2>주요 사양</h2><dl>{[["Wafer Size",product.wafer],["Purity",product.purity],["Process",product.process],["Equipment",product.equipment]].map(([a,b])=><div key={a}><dt>{a}</dt><dd>{b}</dd></div>)}</dl></article>
        <article className="card"><h2>Application Fit</h2><ul><li>{product.process} 적용 검토</li><li>{product.equipment} 호환성 확인</li><li>양산 전 공급사 기술 검토 권장</li></ul></article>
      </div>

      {articles.length > 0 && (
        <section className="section">
          <h2 className="detailSectionTitle">이 제품과 연결된 Knowledge</h2>
          <div className="threeGrid">
            {articles.map((article) => (
              <Link href={`/knowledge/${article.slug}`} className="card relatedKnowledgeCard" key={article.slug}>
                <Badge>{article.category}</Badge>
                <h3>{article.title}</h3>
                <p>{article.summary}</p>
                <small>{article.relatedProcess} · Knowledge 상세 →</small>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="mobileAccordions section">{["제품 개요","주요 사양","적용 공정 / 사용 위치","Application Fit","공식 출처 및 데이터 신뢰성"].map((title,index)=><details key={title} open={index===0}><summary>{title}</summary><p>{index===4?`Last Verified: ${product.verifiedAt}`:`${product.name}의 ${title} 정보를 모바일 아코디언으로 제공합니다.`}</p></details>)}</div>
      <div className="mobileSticky"><SaveToDeskButton type="product" slug={product.slug} label="♡" /><button>기술 문의</button><Link href={`/rfq?product=${product.slug}`}>RFQ 요청</Link></div>
    </div>
  );
}

function StatMini({a,b}:{a:string;b:string}){return <div><strong>{a}</strong><span>{b}</span></div>}
