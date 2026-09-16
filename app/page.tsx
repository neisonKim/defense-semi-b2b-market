"use client";

import Link from "next/link";
import { Badge, SectionTitle, Stat } from "@/components/UI";
import { problems, processes } from "@/data/mock";
import { usePublicData } from "@/lib/publicData";
import {
  KnowledgeVisual,
  ProcessVisual,
  PrototypeProductThumb,
} from "@/components/PrototypeProductVisual";

export default function Home() {
  const { products, suppliers, knowledge, source } = usePublicData();

  const preferredProducts = products.filter((item) => item.featured);
  const featuredProducts = (
    preferredProducts.length ? preferredProducts : products
  ).slice(0, 6);

  const verifiedSuppliers = suppliers.filter((item) => item.verified);
  const featuredSuppliers = (
    verifiedSuppliers.length ? verifiedSuppliers : suppliers
  ).slice(0, 4);

  return (
    <>
      {/* ========================================
          HERO
      ======================================== */}
      <section className="homeHeroSection">
        <div className="container">
          <div className="hero">
            <div className="heroContent">
              <div className="heroCopy">
                <p className="kicker">
                  SEMICONDUCTOR MANUFACTURING INTELLIGENCE + SOURCING
                </p>

                <h1 className="heroTitle">
                  반도체 기술·제품·공급사를
                  <br />
                  <em>하나의 흐름으로 연결합니다.</em>
                </h1>

                <p className="lead heroLead">
                  공정과 엔지니어링 문제에서 출발해 관련 제품, 공급사,
                  기술 콘텐츠를 탐색하고 RFQ까지 연결하는 반도체 B2B
                  소싱 플랫폼입니다.
                </p>

                <form
                  className="searchBar heroSearchBar"
                  action="/products"
                >
                  <input
                    name="q"
                    aria-label="반도체 제품 통합 검색"
                    placeholder="예: Dry Etching, Focus Ring, TIM, Thermal Testing"
                  />

                  <button type="submit">통합 검색</button>
                </form>

                <div className="chipRow heroChipRow">
                  <span>Dry Etching</span>
                  <span>HBM</span>
                  <span>TIM</span>
                  <span>CFD</span>
                  <span>Thermal Testing</span>
                  <span>Advanced Packaging</span>
                </div>

                <div className="ctaRow heroCtaRow">
                  <Link className="btn primary" href="/products">
                    제품 탐색
                  </Link>

                  <Link className="btn ghost" href="/rfq">
                    견적 요청 (RFQ)
                  </Link>
                </div>
              </div>

              <div className="waferVisual heroVisual">
                <div className="heroVisualLabel">
                  <small>CONNECTED ENGINEERING FLOW</small>
                  <span>
                    KNOWLEDGE → PROCESS → PRODUCT
                    <br />
                    SUPPLIER → RFQ
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* DATA STATUS */}
          <div className="publicSyncBanner homeSyncBanner">
            <span
              className={source !== "mock" ? "live" : "demo"}
              aria-hidden="true"
            >
              ●
            </span>

            <div className="syncText">
              <strong>
                {source === "database"
                  ? "PostgreSQL Published 데이터 연결"
                  : source === "cms"
                    ? "Admin CMS Published 데이터 연결"
                    : "Portfolio Demo Data"}
              </strong>

              <small>
                {source === "database"
                  ? "Products · Suppliers · Knowledge를 Prisma API에서 불러옵니다."
                  : source === "cms"
                    ? "Products · Suppliers · Knowledge의 공개 상태가 CMS와 동기화됩니다."
                    : "현재 포트폴리오 데모 데이터를 표시하고 있습니다."}
              </small>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================
          KPI
      ======================================== */}
      <section className="homeKpiSection">
        <div className="container statGrid">
          <Stat
            value={`${products.length}`}
            label="공개 제품"
            delta={
              source === "database"
                ? "PostgreSQL"
                : source === "cms"
                  ? "Published"
                  : "Products"
            }
          />

          <Stat
            value={`${suppliers.length}`}
            label="공개 공급사"
            delta={
              source === "database"
                ? "PostgreSQL"
                : source === "cms"
                  ? "Published"
                  : "Suppliers"
            }
          />

          <Stat
            value={`${processes.length}`}
            label="공정·기술 영역"
            delta="Processes"
          />

          <Stat
            value={`${knowledge.length}`}
            label="공개 기술 콘텐츠"
            delta={
              source === "database"
                ? "PostgreSQL"
                : source === "cms"
                  ? "Published"
                  : "Knowledge"
            }
          />
        </div>
      </section>

      {/* ========================================
          PROCESS
      ======================================== */}
      <section className="homeSection homeSectionSoft" id="process">
        <div className="container section">
          <SectionTitle
            title="공정에서 제품까지 탐색"
            sub="Knowledge → Process → Product → Supplier → RFQ 관계를 실제 공개 데이터와 연결합니다."
          />

          <div className="processGrid">
            {processes.map((process, index) => (
              <article
                className="card processCard"
                key={process.name}
              >
                <div className="processCardBody">
                  <span className="processIndex">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <div>
                    <h3>{process.name}</h3>
                    <strong>{process.ko}</strong>
                    <p>{process.description}</p>
                  </div>
                </div>

                <ProcessVisual process={process.name} />
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================
          PRODUCTS
      ======================================== */}
      <section className="homeSection homeSectionWhite">
        <div className="container section">
          <SectionTitle
            title="현재 공개된 제품"
            sub="반도체 제조 공정과 엔지니어링 요구에 연결되는 주요 제품을 탐색합니다."
          />

          {featuredProducts.length ? (
            <div className="productGrid">
              {featuredProducts.map((item) => (
                <Link
                  href={`/products/${item.slug}`}
                  className="card marketProductCard"
                  key={item.slug}
                >
                  <PrototypeProductThumb
                    source={item}
                    label={item.process}
                  />

                  <div className="marketProductContent">
                    <Badge>{item.category}</Badge>

                    <h3>{item.name}</h3>

                    <p>{item.subtitle}</p>

                    <div className="productMetaLine">
                      <span>{item.material}</span>
                      <span>{item.supplier}</span>
                    </div>

                    <strong className="cardLink">
                      제품 상세 보기 →
                    </strong>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="card emptyState">
              현재 Published 제품이 없습니다. Admin CMS에서 제품을
              발행해 주세요.
            </div>
          )}

          <div className="sectionAction">
            <Link className="btn" href="/products">
              전체 제품 보기
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================
          ENGINEERING PROBLEM
      ======================================== */}
      <section className="homeSection homeEngineeringSection">
        <div className="container section">
          <SectionTitle
            title="어떤 엔지니어링 문제를 해결하고 계신가요?"
            sub="제품명보다 먼저 현장의 문제에서 출발해 관련 기술과 솔루션을 탐색할 수 있습니다."
          />

          <div className="problemGrid">
            {problems.map((problem) => (
              <div className="problem" key={problem}>
                <span className="problemDot" />
                {problem}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================
          SUPPLIERS
      ======================================== */}
      <section className="homeSection homeSectionWhite">
        <div className="container section">
          <SectionTitle
            title="공개된 공급사"
            sub="반도체 공정·제품과 연결되는 주요 공급사 정보를 탐색합니다."
          />

          {featuredSuppliers.length ? (
            <div className="supplierGrid">
              {featuredSuppliers.map((supplier) => (
                <Link
                  href={`/suppliers/${supplier.slug}`}
                  className="card supplierCard"
                  key={supplier.slug}
                >
                  <div className="supplierIdentity">
                    <div className="supplierMonogram">
                      {supplier.name
                        .split(" ")
                        .map((word) => word[0])
                        .join("")
                        .slice(0, 3)}
                    </div>

                    <div>
                      <h3>{supplier.name}</h3>
                      <p>{supplier.meta}</p>
                      <small>
                        {supplier.processes.join(" · ")}
                      </small>
                    </div>
                  </div>

                  <Badge
                    kind={supplier.verified ? "green" : "amber"}
                  >
                    {supplier.verified
                      ? "Verified"
                      : "Published"}
                  </Badge>
                </Link>
              ))}
            </div>
          ) : (
            <div className="card emptyState">
              현재 Published 공급사가 없습니다.
            </div>
          )}

          <div className="sectionAction">
            <Link className="btn" href="/suppliers">
              전체 공급사 보기
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================
          KNOWLEDGE
      ======================================== */}
      <section
        className="homeSection homeSectionSoft"
        id="knowledge"
      >
        <div className="container section">
          <SectionTitle
            title="Knowledge Hub"
            sub="공정·제품·공급사 탐색으로 이어지는 반도체 엔지니어링 콘텐츠를 제공합니다."
          />

          {knowledge.length ? (
            <div className="threeGrid">
              {knowledge.slice(0, 6).map((article) => (
                <Link
                  href={`/knowledge/${article.slug}`}
                  className="card knowledge"
                  key={article.slug}
                >
                  <KnowledgeVisual article={article} />

                  <div className="knowledgeContent">
                    <Badge>{article.category}</Badge>

                    <h3>{article.title}</h3>

                    <p>{article.summary}</p>

                    <div className="relatedRow">
                      <span>{article.relatedProcess}</span>
                      <strong>Knowledge 상세 →</strong>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="card emptyState">
              현재 Published Knowledge가 없습니다.
            </div>
          )}

          <div className="sectionAction">
            <Link className="btn" href="/knowledge">
              Knowledge 전체 보기
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================
          FINAL CTA
      ======================================== */}
      <section className="homeFinalCtaSection">
        <div className="container">
          <div className="conversionCard homeFinalCta">
            <div>
              <p className="kicker">
                SEMICONDUCTOR SOURCING
              </p>

              <h2>
                필요한 반도체 제품과 공급사를
                <br />
                찾고 계신가요?
              </h2>

              <p>
                공정·제품·엔지니어링 요구사항을 등록하고
                적합한 공급사와 RFQ 프로세스를 시작해 보세요.
              </p>
            </div>

            <Link className="btn primary" href="/rfq">
              RFQ 요청하기
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}