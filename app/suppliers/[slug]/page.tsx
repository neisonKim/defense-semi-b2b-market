"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { Badge } from "@/components/UI";
import { SaveToDeskButton } from "@/components/SaveToDeskButton";
import { usePublicRelations } from "@/lib/publicData";
import {
  PrototypeProductThumb,
  SupplierVisual,
} from "@/components/PrototypeProductVisual";

export default function SupplierPage() {
  const params = useParams<{ slug: string }>();

  const slug = Array.isArray(params.slug)
    ? params.slug[0]
    : params.slug;

  const {
    getSupplier,
    getProductsBySupplier,
    source,
    ready,
  } = usePublicRelations();

  const supplier = getSupplier(slug);

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

  if (!supplier) {
    return (
      <div className="container section">
        <div className="card emptyState">
          <h1>공개된 공급사를 찾을 수 없습니다.</h1>

          <p>
            Admin CMS에서 해당 공급사를 Published 상태로
            변경해 주세요.
          </p>

          <Link
            className="btn primary"
            href="/suppliers"
          >
            공급사 목록으로
          </Link>
        </div>
      </div>
    );
  }

  const connectedProducts =
    getProductsBySupplier(slug);

  const processes =
    supplier.processes ?? [];

  const primaryProcess =
    processes[0] ?? "Semiconductor";

  return (
    <div className="container section supplierDetailPage">

      {/* Breadcrumb */}
      <p className="crumb">
        홈 / 공급사 / {supplier.name}
      </p>


      {/* Data source status */}
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
            ? "PostgreSQL Published Supplier"
            : source === "cms"
              ? "CMS Published Supplier"
              : "Mock Supplier"}
        </strong>

        <small>
          공개 디렉터리와 관리자 발행 상태가 연결되어 있습니다.
        </small>
      </div>


      {/* =========================================
          SUPPLIER HERO
      ========================================= */}
      <section className="card supplierProfileHero">

        <div className="supplierHeroMain">

          <div className="supplierIdentityRow">

            <div className="supplierLogo supplierProfileLogo">
              {supplier.name
                .slice(0, 4)
                .toUpperCase()}
            </div>

            <div className="supplierIdentityCopy">

              <span className="supplierEyebrow">
                SUPPLIER INTELLIGENCE
              </span>

              <div className="supplierVerificationRow">
                <Badge
                  kind={
                    supplier.verified
                      ? "green"
                      : "amber"
                  }
                >
                  {supplier.verified
                    ? "Company Verified"
                    : "Supplier Check"}
                </Badge>

                <span>
                  {supplier.region}
                </span>
              </div>

              <h1>{supplier.name}</h1>

            </div>
          </div>


          <p className="supplierHeroDescription">
            {supplier.meta}.
            반도체 공정·제품·공급능력 데이터를 기반으로
            소싱 가능성을 검토할 수 있는 공급사 프로필입니다.
          </p>


          <div className="supplierHeroTags">

            <span>
              {supplier.type}
            </span>

            <span>
              {primaryProcess}
            </span>

            <span>
              {connectedProducts.length} Products
            </span>

          </div>


          <div className="supplierHeroActions">

            <Link
              className="btn primary"
              href={`/rfq?supplier=${supplier.slug}`}
            >
              RFQ 요청
            </Link>

            <a
              className="btn"
              href="#supplier-products"
            >
              연결 제품 보기
            </a>

            <SaveToDeskButton
              type="supplier"
              slug={supplier.slug}
              label="☆ 관심 공급사 저장"
            />

          </div>
        </div>


        <div className="supplierHeroVisual">
          <SupplierVisual
            source={connectedProducts[0]}
            supplier={supplier}
          />

          <div className="supplierVisualCaption">
            <small>
              CORE CAPABILITY
            </small>

            <strong>
              {primaryProcess}
            </strong>
          </div>
        </div>

      </section>


      {/* =========================================
          SUPPLIER INTELLIGENCE KPI
      ========================================= */}
      <section className="supplierIntelGrid section">

        <div className="supplierIntelCard">
          <span>01</span>
          <small>VERIFICATION</small>

          <strong>
            {supplier.verified
              ? "Verified"
              : "Review"}
          </strong>

          <p>
            기업 데이터 검증 상태
          </p>
        </div>


        <div className="supplierIntelCard">
          <span>02</span>
          <small>SUPPLY REGION</small>

          <strong>
            {supplier.region}
          </strong>

          <p>
            주요 공급 가능 지역
          </p>
        </div>


        <div className="supplierIntelCard">
          <span>03</span>
          <small>LEAD TIME</small>

          <strong>
            {supplier.leadTime}
          </strong>

          <p>
            일반적인 공급 리드타임
          </p>
        </div>


        <div className="supplierIntelCard">
          <span>04</span>
          <small>PRODUCTS</small>

          <strong>
            {connectedProducts.length}
          </strong>

          <p>
            Published 연결 제품
          </p>
        </div>

      </section>


      {/* =========================================
          COMPANY + CAPABILITIES
      ========================================= */}
      <section className="supplierInfoGrid section">

        <article className="card supplierSectionCard">

          <div className="supplierSectionHeader">

            <span className="supplierSectionNumber">
              01
            </span>

            <div>
              <small>
                COMPANY OVERVIEW
              </small>

              <h2>
                공급사 개요
              </h2>
            </div>

          </div>


          <p className="supplierOverviewText">
            {supplier.meta}. DEFENSE SEMI B2B MARKET은
            공급사를 단순 기업 목록이 아니라 제품,
            공정, 공급조건 및 RFQ와 연결된
            Supplier Intelligence 단위로 구성합니다.
          </p>


          <div className="supplierOverviewFacts">

            <div>
              <span>
                Supplier Type
              </span>

              <strong>
                {supplier.type}
              </strong>
            </div>


            <div>
              <span>
                Region
              </span>

              <strong>
                {supplier.region}
              </strong>
            </div>


            <div>
              <span>
                MOQ
              </span>

              <strong>
                {supplier.moq}
              </strong>
            </div>


            <div>
              <span>
                Sample
              </span>

              <strong>
                {supplier.sample}
              </strong>
            </div>

          </div>

        </article>


        <article className="card supplierSectionCard">

          <div className="supplierSectionHeader">

            <span className="supplierSectionNumber">
              02
            </span>

            <div>
              <small>
                ENGINEERING CAPABILITY
              </small>

              <h2>
                지원 가능 공정
              </h2>
            </div>

          </div>


          <div className="supplierCapabilityList">

            {processes.length > 0
              ? processes.map(
                  (
                    process,
                    index,
                  ) => (
                    <div
                      className="supplierCapabilityItem"
                      key={process}
                    >
                      <span>
                        {String(
                          index + 1,
                        ).padStart(
                          2,
                          "0",
                        )}
                      </span>

                      <div>
                        <strong>
                          {process}
                        </strong>

                        <small>
                          Semiconductor Process Capability
                        </small>
                      </div>
                    </div>
                  ),
                )
              : (
                <p className="supplierNoData">
                  등록된 공정 정보가 없습니다.
                </p>
              )}

          </div>

        </article>

      </section>


      {/* =========================================
          CONNECTED PRODUCTS
      ========================================= */}
      <section
        className="section supplierProductsSection"
        id="supplier-products"
      >

        <div className="supplierProductsHead">

          <div>
            <span>
              03 · PRODUCT PORTFOLIO
            </span>

            <h2 className="detailSectionTitle">
              연결된 주요 제품
            </h2>

            <p>
              이 공급사와 연결된 Published 제품을
              공정과 함께 확인할 수 있습니다.
            </p>
          </div>

          <strong>
            {connectedProducts.length} Products
          </strong>

        </div>


        {connectedProducts.length > 0 ? (
          <div className="productGrid">

            {connectedProducts.map(
              (product) => (
                <Link
                  className="card marketProductCard"
                  href={`/products/${product.slug}`}
                  key={product.slug}
                >

                  <PrototypeProductThumb
                    source={product}
                    label={product.process}
                  />

                  <Badge>
                    {product.category}
                  </Badge>

                  <h3>
                    {product.name}
                  </h3>

                  <p>
                    {product.subtitle}
                  </p>

                  <div className="supplierProductMeta">
                    <span>
                      {product.material}
                    </span>

                    <span>
                      {product.process}
                    </span>
                  </div>

                  <strong className="cardLink">
                    제품 상세 →
                  </strong>

                </Link>
              ),
            )}

          </div>
        ) : (
          <div className="card emptyState">
            현재 Published 상태로 연결된 제품이 없습니다.
          </div>
        )}

      </section>


      {/* =========================================
          FINAL RFQ CTA
      ========================================= */}
      <section className="supplierRfqCta">

        <div>
          <span>
            SOURCING ACTION
          </span>

          <h2>
            이 공급사와 거래를 검토하고 계신가요?
          </h2>

          <p>
            제품·수량·납기·기술 요구조건을 등록하고
            RFQ 프로세스를 시작할 수 있습니다.
          </p>
        </div>

        <Link
          className="btn primary"
          href={`/rfq?supplier=${supplier.slug}`}
        >
          RFQ 요청하기 →
        </Link>

      </section>


      {/* Mobile Bottom CTA */}
      <div className="supplierMobileBar">

        <SaveToDeskButton
          type="supplier"
          slug={supplier.slug}
          label="☆"
        />

        <Link
          href={`/rfq?supplier=${supplier.slug}`}
        >
          RFQ 요청
        </Link>

      </div>

    </div>
  );
}
