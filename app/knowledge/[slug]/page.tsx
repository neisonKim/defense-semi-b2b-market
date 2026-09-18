"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { Badge } from "@/components/UI";
import { SaveToDeskButton } from "@/components/SaveToDeskButton";
import { usePublicRelations } from "@/lib/publicData";
import { KnowledgeVisual } from "@/components/PrototypeProductVisual";

export default function KnowledgeDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = Array.isArray(params.slug)
    ? params.slug[0]
    : params.slug;

  const {
    getKnowledge,
    getProductsForArticle,
    suppliers,
    source,
    ready,
  } = usePublicRelations();

  const article = getKnowledge(slug);

  if (!ready) {
    return (
      <div className="container section">
        <div className="card emptyState">
          <h1>공개 데이터를 불러오는 중입니다.</h1>
          <p>
            Admin CMS의 Published 상태를 확인하고 있습니다.
          </p>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="container section">
        <div className="card emptyState">
          <h1>
            공개된 Knowledge를 찾을 수 없습니다.
          </h1>
          <p>
            Admin CMS에서 Published 상태인지 확인해 주세요.
          </p>
          <Link
            className="btn primary"
            href="/knowledge"
          >
            Knowledge 목록으로
          </Link>
        </div>
      </div>
    );
  }

  const relatedProducts =
    getProductsForArticle(article);

  const supplierSlugs = Array.from(
    new Set(
      relatedProducts.map(
        (product) => product.supplierSlug,
      ),
    ),
  );

  const relatedSuppliers =
    suppliers.filter((supplier) =>
      supplierSlugs.includes(
        supplier.slug,
      ),
    );

  const primaryProduct =
    relatedProducts[0];

  return (
    <div className="container section knowledgeDetailPage">
      <p className="crumb">
        홈 / Knowledge / {article.category} /{" "}
        {article.title}
      </p>

      <div className="publicSyncBanner compactSync">
        <span
          className={
            source !== "mock"
              ? "live"
              : "demo"
          }
        >
          ●
        </span>

        <strong>
          {source === "database"
            ? "PostgreSQL Published Knowledge"
            : source === "cms"
              ? "CMS Published Knowledge"
              : "Mock Knowledge"}
        </strong>

        <small>
          {article.publishedAt}
        </small>
      </div>

      <article className="card knowledgeArticleHero knowledgeArticleHeroWithImage knowledgeDetailHero">
        <div className="knowledgeArticleHeroCopy">
          <div className="knowledgeDetailEyebrow">
            <span>
              TECHNICAL KNOWLEDGE
            </span>

            <Badge>
              {article.category}
            </Badge>
          </div>

          <h1>
            {article.title}
          </h1>

          <p className="knowledgeDetailLead">
            {article.summary}
          </p>

          <div className="knowledgeDetailMetaGrid">
            <div>
              <span>
                RELATED PROCESS
              </span>
              <strong>
                {article.relatedProcess ||
                  "미지정"}
              </strong>
            </div>

            <div>
              <span>
                READING TIME
              </span>
              <strong>
                {article.readingTime}
              </strong>
            </div>

            <div>
              <span>
                PUBLISHED
              </span>
              <strong>
                {article.publishedAt}
              </strong>
            </div>

            <div>
              <span>
                CONNECTED PRODUCTS
              </span>
              <strong>
                {relatedProducts.length}
              </strong>
            </div>
          </div>

          <div className="knowledgeTags knowledgeDetailTags">
            {article.tags.map(
              (tag) => (
                <span key={tag}>
                  #{tag}
                </span>
              ),
            )}
          </div>

          <div className="knowledgeDetailHeroActions">
            <SaveToDeskButton
              type="knowledge"
              slug={article.slug}
              label="☆ Knowledge 저장"
            />

            <Link
              className="btn"
              href={`/products?process=${encodeURIComponent(
                article.relatedProcess,
              )}`}
            >
              관련 제품 탐색
            </Link>

            <Link
              className="btn primary"
              href={
                primaryProduct
                  ? `/rfq?product=${primaryProduct.slug}`
                  : "/rfq"
              }
            >
              RFQ 시작
            </Link>
          </div>
        </div>

        <KnowledgeVisual
          article={article}
          className="knowledgeArticleHeroImage knowledgeDetailHeroImage"
        />
      </article>

      <div className="knowledgeDetailLayout section">
        <article className="card articleBody knowledgeTechnicalBody">
          <section className="knowledgeContentSection">
            <div className="knowledgeSectionHead">
              <span>01</span>
              <div>
                <small>
                  TECHNICAL OVERVIEW
                </small>
                <h2>
                  핵심부터 이해하기
                </h2>
              </div>
            </div>

            <p>
              {article.summary}
            </p>

            <div className="articleKeyPoints">
              {article.keyPoints.map(
                (point, index) => (
                  <div
                    key={`${point}-${index}`}
                  >
                    <span>
                      {String(
                        index + 1,
                      ).padStart(
                        2,
                        "0",
                      )}
                    </span>

                    <p>
                      {point}
                    </p>
                  </div>
                ),
              )}
            </div>
          </section>

          <section className="knowledgeContentSection">
            <div className="knowledgeSectionHead">
              <span>02</span>
              <div>
                <small>
                  ENGINEERING CONTEXT
                </small>
                <h2>
                  공정과 구매 판단으로 연결하기
                </h2>
              </div>
            </div>

            <p>
              기술 개념을 이해한 다음에는 실제 적용 공정,
              제품 사양과 공급 가능 기업을 함께 확인해야
              소싱 판단으로 연결할 수 있습니다. 이 페이지에서는
              Published 상태의 관련 제품과 공급사를 같은 흐름에서
              확인할 수 있습니다.
            </p>

            <div className="processConnectionCard knowledgeProcessConnection">
              <div>
                <span>
                  RELATED PROCESS
                </span>
                <strong>
                  {article.relatedProcess}
                </strong>
              </div>

              <Link
                href={`/products?process=${encodeURIComponent(
                  article.relatedProcess,
                )}`}
              >
                관련 제품 보기 →
              </Link>
            </div>
          </section>

          <section className="knowledgeContentSection">
            <div className="knowledgeSectionHead">
              <span>03</span>
              <div>
                <small>
                  RELATED PRODUCTS
                </small>
                <h2>
                  연결된 제품
                </h2>
              </div>
            </div>

            {relatedProducts.length >
            0 ? (
              <div className="articleProductGrid knowledgeProductGrid">
                {relatedProducts.map(
                  (product) => (
                    <Link
                      className="articleProductCard knowledgeProductCard"
                      href={`/products/${product.slug}`}
                      key={product.slug}
                    >
                      <div className="knowledgeProductCardCopy">
                        <span>
                          {product.category}
                        </span>

                        <h3>
                          {product.name}
                        </h3>

                        <p>
                          {product.subtitle}
                        </p>

                        <dl>
                          <div>
                            <dt>
                              Process
                            </dt>
                            <dd>
                              {product.process}
                            </dd>
                          </div>

                          <div>
                            <dt>
                              Material
                            </dt>
                            <dd>
                              {product.material}
                            </dd>
                          </div>

                          <div>
                            <dt>
                              Supplier
                            </dt>
                            <dd>
                              {product.supplier}
                            </dd>
                          </div>
                        </dl>
                      </div>

                      <strong>
                        제품 상세 →
                      </strong>
                    </Link>
                  ),
                )}
              </div>
            ) : (
              <div className="knowledgeNotice">
                현재 Published 상태로 연결된 제품이 없습니다.
              </div>
            )}
          </section>
        </article>

        <aside className="knowledgeSide knowledgeIntelligenceSide">
          <div className="card knowledgeRelationCard">
            <div className="knowledgeSideHead">
              <span>
                SOURCING PATH
              </span>
              <h2>
                연결 관계
              </h2>
            </div>

            <div className="relationStep">
              <span>01</span>
              <div>
                <small>
                  Knowledge
                </small>
                <strong>
                  {article.category}
                </strong>
              </div>
            </div>

            <div className="relationStep">
              <span>02</span>
              <div>
                <small>
                  Process
                </small>
                <strong>
                  {article.relatedProcess}
                </strong>
              </div>
            </div>

            <div className="relationStep">
              <span>03</span>
              <div>
                <small>
                  Products
                </small>
                <strong>
                  {relatedProducts.length}개 연결
                </strong>
              </div>
            </div>

            <div className="relationStep">
              <span>04</span>
              <div>
                <small>
                  Suppliers
                </small>
                <strong>
                  {relatedSuppliers.length}개 연결
                </strong>
              </div>
            </div>

            <div className="relationStep">
              <span>05</span>
              <div>
                <small>
                  Action
                </small>
                <strong>
                  RFQ
                </strong>
              </div>
            </div>
          </div>

          {relatedSuppliers.length >
          0 ? (
            <div className="card knowledgeRelationCard knowledgeSupplierCard">
              <div className="knowledgeSideHead">
                <span>
                  RELATED SUPPLIERS
                </span>
                <h2>
                  관련 공급사
                </h2>
              </div>

              {relatedSuppliers.map(
                (supplier) => (
                  <Link
                    href={`/suppliers/${supplier.slug}`}
                    className="knowledgeSupplierRow"
                    key={supplier.slug}
                  >
                    <div className="supplierLogo compact knowledgeSupplierLogo">
                      {supplier.name
                        .slice(
                          0,
                          4,
                        )
                        .toUpperCase()}
                    </div>

                    <div className="knowledgeSupplierInfo">
                      <div>
                        <strong>
                          {supplier.name}
                        </strong>

                        <Badge
                          kind={
                            supplier.verified
                              ? "green"
                              : "amber"
                          }
                        >
                          {supplier.verified
                            ? "Verified"
                            : "Review"}
                        </Badge>
                      </div>

                      <span>
                        {supplier.type} ·{" "}
                        {supplier.region}
                      </span>
                    </div>
                  </Link>
                ),
              )}
            </div>
          ) : null}

          <div className="card knowledgeRfqCard knowledgeNextActionCard">
            <Badge kind="green">
              NEXT ACTION
            </Badge>

            <h2>
              기술 이해를 실제 문의로 연결
            </h2>

            <p>
              {primaryProduct
                ? `${primaryProduct.name} 제품을 기준으로 RFQ를 시작할 수 있습니다.`
                : "관련 제품을 먼저 탐색한 뒤 RFQ로 연결할 수 있습니다."}
            </p>

            <div className="knowledgeNextActionLinks">
              <Link
                className="btn"
                href="/products"
              >
                제품 탐색
              </Link>

              <Link
                className="btn primary"
                href={
                  primaryProduct
                    ? `/rfq?product=${primaryProduct.slug}`
                    : "/rfq"
                }
              >
                RFQ 시작
              </Link>
            </div>
          </div>
        </aside>
      </div>

      <section className="card knowledgeBottomCta knowledgeDecisionCta">
        <div>
          <Badge>
            CONNECTED SOURCING
          </Badge>

          <h2>
            Knowledge에서 구매 의사결정까지
          </h2>

          <p>
            기술을 이해한 다음 관련 제품과 공급사를 확인하고,
            필요한 조건을 RFQ로 연결하세요.
          </p>
        </div>

        <div className="ctaRow">
          <Link
            className="btn"
            href="/knowledge"
          >
            Knowledge 목록
          </Link>

          <Link
            className="btn"
            href="/products"
          >
            제품 탐색
          </Link>

          <Link
            className="btn primary"
            href={
              primaryProduct
                ? `/rfq?product=${primaryProduct.slug}`
                : "/rfq"
            }
          >
            RFQ 요청
          </Link>
        </div>
      </section>
    </div>
  );
}
