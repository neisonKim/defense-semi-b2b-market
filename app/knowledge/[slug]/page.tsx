"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Badge } from "@/components/UI";
import { SaveToDeskButton } from "@/components/SaveToDeskButton";
import { usePublicRelations } from "@/lib/publicData";
import { KnowledgeVisual } from "@/components/PrototypeProductVisual";

export default function KnowledgeDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const { getKnowledge, getProductsForArticle, suppliers, source, ready } = usePublicRelations();
  const article = getKnowledge(slug);

  if (!ready) {
    return <div className="container section"><div className="card emptyState"><h1>공개 데이터를 불러오는 중입니다.</h1><p>Admin CMS의 Published 상태를 확인하고 있습니다.</p></div></div>;
  }

  if (!article) {
    return <div className="container section"><div className="card emptyState"><h1>공개된 Knowledge를 찾을 수 없습니다.</h1><p>Admin CMS에서 Published 상태인지 확인해 주세요.</p><Link className="btn primary" href="/knowledge">Knowledge 목록으로</Link></div></div>;
  }

  const relatedProducts = getProductsForArticle(article);
  const supplierSlugs = Array.from(new Set(relatedProducts.map((product) => product.supplierSlug)));
  const relatedSuppliers = suppliers.filter((supplier) => supplierSlugs.includes(supplier.slug));
  const primaryProduct = relatedProducts[0];

  return (
    <div className="container section knowledgeDetailPage">
      <p className="crumb">홈 / Knowledge / {article.category} / {article.title}</p>
      <div className="publicSyncBanner compactSync"><span className={source !== "mock" ? "live" : "demo"}>●</span><strong>{source === "database" ? "PostgreSQL Published Knowledge" : source === "cms" ? "CMS Published Knowledge" : "Mock Knowledge"}</strong><small>{article.publishedAt}</small></div>

      <article className="knowledgeArticleHero card knowledgeArticleHeroWithImage">
        <div className="knowledgeArticleHeroCopy">
          <div className="knowledgeArticleMeta"><Badge>{article.category}</Badge><span>{article.publishedAt}</span><span>{article.readingTime}</span><SaveToDeskButton type="knowledge" slug={article.slug} label="☆ Knowledge 저장" /></div>
          <h1>{article.title}</h1>
          <p>{article.summary}</p>
          <div className="knowledgeTags">{article.tags.map((tag) => <span key={tag}>#{tag}</span>)}</div>
        </div>
        <KnowledgeVisual article={article} className="knowledgeArticleHeroImage" />
      </article>

      <div className="knowledgeDetailLayout section">
        <article className="card articleBody">
          <h2>핵심부터 이해하기</h2>
          <p>{article.summary}</p>

          <div className="articleKeyPoints">
            {article.keyPoints.map((point, index) => (
              <div key={`${point}-${index}`}><span>{String(index + 1).padStart(2, "0")}</span><p>{point}</p></div>
            ))}
          </div>

          <h2>왜 이 정보가 중요한가?</h2>
          <p>반도체 B2B 구매에서는 기술 개념을 이해하는 것에서 끝나지 않고, 실제 적용 공정과 제품 사양, 공급 가능한 기업까지 연결해야 구매 판단으로 이어집니다. 이 Knowledge 페이지는 해당 기술을 관련 제품과 공급사 데이터에 직접 연결합니다.</p>

          <h2>연결된 공정 / 기술 영역</h2>
          <div className="processConnectionCard"><strong>{article.relatedProcess}</strong><span>이 콘텐츠가 직접 연결되는 공정 또는 엔지니어링 영역입니다.</span></div>

          {relatedProducts.length > 0 ? (
            <>
              <h2>관련 제품</h2>
              <div className="articleProductGrid">
                {relatedProducts.map((product) => (
                  <Link className="articleProductCard" href={`/products/${product.slug}`} key={product.slug}>
                    <div><span>{product.category}</span><h3>{product.name}</h3><p>{product.subtitle}</p></div><strong>제품 상세 →</strong>
                  </Link>
                ))}
              </div>
            </>
          ) : <div className="knowledgeNotice">현재 Published 상태로 연결된 제품이 없습니다.</div>}
        </article>

        <aside className="knowledgeSide">
          <div className="card knowledgeRelationCard">
            <h2>연결 관계</h2>
            <div className="relationStep"><span>01</span><div><small>Knowledge</small><strong>{article.category}</strong></div></div>
            <div className="relationStep"><span>02</span><div><small>Process</small><strong>{article.relatedProcess}</strong></div></div>
            <div className="relationStep"><span>03</span><div><small>Published Products</small><strong>{relatedProducts.length}개 연결</strong></div></div>
            <div className="relationStep"><span>04</span><div><small>Published Suppliers</small><strong>{relatedSuppliers.length}개 연결</strong></div></div>
          </div>

          {relatedSuppliers.length > 0 && <div className="card knowledgeRelationCard"><h2>관련 공급사</h2>{relatedSuppliers.map((supplier) => <Link href={`/suppliers/${supplier.slug}`} className="knowledgeSupplierRow" key={supplier.slug}><div className="supplierLogo compact">{supplier.name.slice(0, 3)}</div><div><strong>{supplier.name}</strong><span>{supplier.meta}</span></div></Link>)}</div>}

          <div className="card knowledgeRfqCard">
            <Badge kind="green">Next Action</Badge><h2>기술 이해를 실제 문의로 연결</h2><p>{primaryProduct ? `${primaryProduct.name} 제품을 기준으로 RFQ를 시작할 수 있습니다.` : "관련 제품을 먼저 탐색한 뒤 RFQ로 연결할 수 있습니다."}</p>
            <Link className="btn primary full" href={primaryProduct ? `/rfq?product=${primaryProduct.slug}` : "/rfq"}>RFQ 시작</Link>
          </div>
        </aside>
      </div>

      <section className="card knowledgeBottomCta"><div><Badge>Connected Sourcing</Badge><h2>Knowledge에서 구매 의사결정까지</h2><p>관련 기술을 이해한 다음 제품과 공급사를 비교하고 RFQ까지 이어지는 전체 흐름을 확인해보세요.</p></div><div className="ctaRow"><Link className="btn" href="/products">제품 탐색</Link><Link className="btn primary" href="/suppliers">공급사 탐색</Link></div></section>
    </div>
  );
}
