"use client";

import Link from "next/link";

import { Badge, Stat } from "@/components/UI";
import { problems, processes } from "@/data/mock";
import { usePublicData } from "@/lib/publicData";
import {
  KnowledgeVisual,
  ProcessVisual,
  PrototypeProductThumb,
  SupplierDirectoryVisual,
} from "@/components/PrototypeProductVisual";

const sourcingSteps = [
  {
    number: "01",
    label: "KNOWLEDGE",
    title: "기술 이해",
    description: "공정·소재·장비와 엔지니어링 문제를 먼저 이해합니다.",
    href: "/knowledge",
  },
  {
    number: "02",
    label: "PROCESS",
    title: "공정 탐색",
    description: "적용 공정과 기술 영역을 기준으로 후보를 좁힙니다.",
    href: "/products",
  },
  {
    number: "03",
    label: "PRODUCT",
    title: "제품 검토",
    description: "관련 제품의 소재·공정·공급사 정보를 확인합니다.",
    href: "/products",
  },
  {
    number: "04",
    label: "SUPPLIER",
    title: "공급사 확인",
    description: "공급 역량과 Verified 상태를 기준으로 공급사를 검토합니다.",
    href: "/suppliers",
  },
  {
    number: "05",
    label: "RFQ",
    title: "견적 요청",
    description: "선정한 제품과 공급사를 실제 소싱 요청으로 연결합니다.",
    href: "/rfq",
  },
];

export default function Home() {
  const {
    products,
    suppliers,
    knowledge,
    source,
    ready,
  } = usePublicData();

  const preferredProducts = products.filter(
    (item) => item.featured,
  );

  const featuredProducts = (
    preferredProducts.length
      ? preferredProducts
      : products
  ).slice(0, 3);

  const verifiedSuppliers = suppliers.filter(
    (item) => item.verified,
  );

  const featuredSuppliers = (
    verifiedSuppliers.length
      ? verifiedSuppliers
      : suppliers
  ).slice(0, 3);

  const featuredKnowledge = knowledge.slice(0, 3);

  return (
    <>
      <section className="container marketHomeHeroWrap">
        <div className="marketHomeHero">
          <div className="marketHomeHeroCopy">
            <p className="marketHomeEyebrow">
              SEMICONDUCTOR MANUFACTURING INTELLIGENCE + SOURCING
            </p>

            <h1>
              반도체 기술·제품·공급사를
              <br />
              <em>하나의 소싱 흐름으로 연결합니다.</em>
            </h1>

            <p className="marketHomeLead">
              공정과 엔지니어링 문제에서 출발해 기술 Knowledge,
              관련 제품, 공급사를 확인하고 RFQ까지 이어지는
              반도체 B2B 소싱 플랫폼입니다.
            </p>

            <form
              className="marketHomeSearch"
              action="/products"
            >
              <input
                name="q"
                aria-label="반도체 제품 통합 검색"
                placeholder="예: Dry Etching, Focus Ring, TIM, Thermal Testing"
              />

              <button type="submit">
                통합 검색
              </button>
            </form>

            <div className="marketHomeQuickTags">
              {[
                "Dry Etching",
                "HBM",
                "TIM",
                "CFD",
                "Thermal Testing",
                "Advanced Packaging",
              ].map((item) => (
                <Link
                  key={item}
                  href={`/products?q=${encodeURIComponent(
                    item,
                  )}`}
                >
                  {item}
                </Link>
              ))}
            </div>

            <div className="marketHomeHeroActions">
              <Link
                className="btn primary"
                href="/products"
              >
                제품 탐색
              </Link>

              <Link
                className="btn marketHomeGhostBtn"
                href="/knowledge"
              >
                기술 Knowledge
              </Link>

              <Link
                className="btn marketHomeGhostBtn"
                href="/rfq"
              >
                RFQ 요청
              </Link>
            </div>
          </div>

          <div className="marketHomeHeroVisual waferVisual">
            <div className="marketHomeVisualLabel">
              <small>
                CONNECTED SOURCING
              </small>

              <strong>
                Knowledge
                <br />
                Process
                <br />
                Product
                <br />
                Supplier
                <br />
                RFQ
              </strong>
            </div>

            <div className="marketHomeVisualFlow">
              <span>KNOWLEDGE</span>
              <b>→</b>
              <span>PROCESS</span>
              <b>→</b>
              <span>PRODUCT</span>
              <b>→</b>
              <span>SUPPLIER</span>
              <b>→</b>
              <span>RFQ</span>
            </div>
          </div>
        </div>
      </section>

      <section className="container">
        <div className="publicSyncBanner homeSyncBanner marketHomeSync">
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
              ? "PostgreSQL Published 데이터가 Marketplace에 연결되었습니다."
              : source === "cms"
                ? "Admin CMS Published 데이터가 Marketplace에 반영됩니다."
                : "Mock Data Mode"}
          </strong>

          <small>
            {source === "database"
              ? "Products · Suppliers · Knowledge를 공개 데이터 기준으로 불러옵니다."
              : source === "cms"
                ? "Published 상태의 Product · Supplier · Knowledge만 공개됩니다."
                : "공개 데이터 연결 전 기본 샘플 데이터를 표시합니다."}
          </small>
        </div>
      </section>

      <section className="container marketHomeStats">
        <Stat
          value={ready ? `${products.length}` : "—"}
          label="공개 제품"
          delta={
            source === "database"
              ? "PostgreSQL"
              : source === "cms"
                ? "Published"
                : "MVP"
          }
        />

        <Stat
          value={ready ? `${suppliers.length}` : "—"}
          label="공개 공급사"
          delta={
            source === "database"
              ? "PostgreSQL"
              : source === "cms"
                ? "Published"
                : "MVP"
          }
        />

        <Stat
          value={`${processes.length}`}
          label="공정·기술 영역"
          delta="Discovery"
        />

        <Stat
          value={ready ? `${knowledge.length}` : "—"}
          label="기술 Knowledge"
          delta={
            source === "database"
              ? "PostgreSQL"
              : source === "cms"
                ? "Published"
                : "MVP"
          }
        />
      </section>

      <section className="container section marketHomeFlowSection">
        <div className="marketHomeSectionHead">
          <div>
            <span>
              SOURCING WORKFLOW
            </span>

            <h2>
              기술 이해에서 RFQ까지
            </h2>

            <p>
              정보를 따로 찾는 것이 아니라 하나의 구매 의사결정 흐름으로 연결합니다.
            </p>
          </div>

          <Link
            className="btn"
            href="/my-desk"
          >
            My Desk 보기
          </Link>
        </div>

        <div className="marketHomeFlow">
          {sourcingSteps.map((step) => (
            <Link
              className="marketHomeFlowStep"
              href={step.href}
              key={step.number}
            >
              <span className="marketHomeFlowNumber">
                {step.number}
              </span>

              <small>
                {step.label}
              </small>

              <strong>
                {step.title}
              </strong>

              <p>
                {step.description}
              </p>

              <b>
                다음 단계 →
              </b>
            </Link>
          ))}
        </div>
      </section>

      <section
        className="container section"
        id="process"
      >
        <div className="marketHomeSectionHead">
          <div>
            <span>
              PROCESS DISCOVERY
            </span>

            <h2>
              공정에서 제품까지 탐색
            </h2>

            <p>
              반도체 공정과 기술 영역을 기준으로 관련 제품을 빠르게 좁혀보세요.
            </p>
          </div>

          <Link
            className="btn"
            href="/products"
          >
            전체 제품 탐색
          </Link>
        </div>

        <div className="processGrid marketHomeProcessGrid">
          {processes.slice(0, 6).map(
            (processItem, index) => (
              <Link
                className="card processCard marketHomeProcessCard"
                href={`/products?process=${encodeURIComponent(
                  processItem.name,
                )}`}
                key={processItem.name}
              >
                <div className="processCardBody">
                  <span className="processIndex">
                    {String(index + 1).padStart(
                      2,
                      "0",
                    )}
                  </span>

                  <div>
                    <small className="marketHomeProcessLabel">
                      PROCESS
                    </small>

                    <h3>
                      {processItem.name}
                    </h3>

                    <strong>
                      {processItem.ko}
                    </strong>

                    <p>
                      {processItem.description}
                    </p>
                  </div>
                </div>

                <ProcessVisual
                  process={
                    processItem.name
                  }
                />
              </Link>
            ),
          )}
        </div>
      </section>

      <section className="container section">
        <div className="marketHomeSectionHead">
          <div>
            <span>
              ENGINEERING PROBLEM
            </span>

            <h2>
              어떤 문제를 해결하고 계신가요?
            </h2>

            <p>
              제품명보다 현장의 문제에서 출발해 관련 기술과 제품을 탐색할 수 있습니다.
            </p>
          </div>
        </div>

        <div className="marketHomeProblemGrid">
          {problems.map((problem) => (
            <Link
              className="marketHomeProblem"
              href={`/products?q=${encodeURIComponent(
                problem,
              )}`}
              key={problem}
            >
              <span>ENGINEERING ISSUE</span>
              <strong>{problem}</strong>
              <b>관련 제품 찾기 →</b>
            </Link>
          ))}
        </div>
      </section>

      <section className="container section">
        <div className="marketHomeSectionHead">
          <div>
            <span>
              FEATURED PRODUCTS
            </span>

            <h2>
              현재 공개된 주요 제품
            </h2>

            <p>
              공정·소재·공급사 정보를 확인하고 바로 상세 페이지와 RFQ로 이동할 수 있습니다.
            </p>
          </div>

          <Link
            className="btn"
            href="/products"
          >
            전체 제품 보기
          </Link>
        </div>

        {featuredProducts.length ? (
          <div className="productGrid marketHomeProductGrid">
            {featuredProducts.map(
              (item) => {
                const supplierRecord =
                  suppliers.find(
                    (supplier) =>
                      supplier.slug ===
                      item.supplierSlug,
                  );

                return (
                  <article
                    className="card marketProductCard marketHomeProductCard"
                    key={item.slug}
                  >
                    <Link
                      href={`/products/${item.slug}`}
                      className="productCardMain"
                    >
                      <PrototypeProductThumb
                        source={item}
                        label={item.process}
                      />

                      <div className="productCardTopline">
                        <Badge>
                          {item.category}
                        </Badge>

                        <Badge
                          kind={
                            supplierRecord?.verified
                              ? "green"
                              : "amber"
                          }
                        >
                          {supplierRecord?.verified
                            ? "Verified"
                            : "Supplier Check"}
                        </Badge>
                      </div>

                      <h3>
                        {item.name}
                      </h3>

                      <p>
                        {item.subtitle}
                      </p>

                      <div className="productMetaStack productDiscoveryMeta">
                        <span>
                          <b>
                            Process
                          </b>
                          {item.process}
                        </span>

                        <span>
                          <b>
                            Material
                          </b>
                          {item.material}
                        </span>

                        <span>
                          <b>
                            Supplier
                          </b>
                          {item.supplier}
                        </span>
                      </div>
                    </Link>

                    <div className="productCardActions">
                      <Link
                        href={`/products/${item.slug}`}
                      >
                        상세 정보
                      </Link>

                      <Link
                        className="primaryAction"
                        href={`/rfq?product=${item.slug}`}
                      >
                        RFQ 요청
                      </Link>
                    </div>
                  </article>
                );
              },
            )}
          </div>
        ) : (
          <div className="card emptyState">
            현재 Published 제품이 없습니다.
          </div>
        )}
      </section>

      <section className="container section">
        <div className="marketHomeSectionHead">
          <div>
            <span>
              SUPPLIER INTELLIGENCE
            </span>

            <h2>
              Verified 공급사 탐색
            </h2>

            <p>
              주요 공정 역량과 공급 지역을 확인하고 관련 제품 또는 RFQ로 연결하세요.
            </p>
          </div>

          <Link
            className="btn"
            href="/suppliers"
          >
            전체 공급사 보기
          </Link>
        </div>

        {featuredSuppliers.length ? (
          <div className="supplierDirectoryGrid marketHomeSupplierGrid">
            {featuredSuppliers.map(
              (supplier) => {
                const connectedProducts =
                  products.filter(
                    (product) =>
                      product.supplierSlug ===
                      supplier.slug,
                  );

                return (
                  <article
                    className="card supplierDirectoryCard marketHomeSupplierCard"
                    key={supplier.slug}
                  >
                    <Link
                      href={`/suppliers/${supplier.slug}`}
                      className="supplierCardMain marketHomeSupplierMain"
                    >
                      <SupplierDirectoryVisual
                        supplier={supplier}
                        source={
                          connectedProducts[0]
                        }
                      />

                      <div className="supplierDiscoveryTopline">
                        <Badge>
                          {supplier.type}
                        </Badge>

                        <Badge
                          kind={
                            supplier.verified
                              ? "green"
                              : "amber"
                          }
                        >
                          {supplier.verified
                            ? "Verified Supplier"
                            : "Published"}
                        </Badge>
                      </div>

                      <div className="marketHomeSupplierIdentity">
                        <div className="supplierLogo compact">
                          {supplier.name
                            .slice(0, 4)
                            .toUpperCase()}
                        </div>

                        <div>
                          <h3>
                            {supplier.name}
                          </h3>

                          <span>
                            {supplier.region}
                          </span>
                        </div>
                      </div>

                      <p>
                        {supplier.meta}
                      </p>

                      <div className="chipRow light marketHomeSupplierProcesses">
                        {supplier.processes
                          .slice(0, 3)
                          .map(
                            (
                              processItem,
                            ) => (
                              <span
                                key={
                                  processItem
                                }
                              >
                                {
                                  processItem
                                }
                              </span>
                            ),
                          )}
                      </div>

                      <div className="supplierDirectoryStatusLine">
                        <div>
                          <span>
                            CONNECTED PRODUCTS
                          </span>

                          <strong>
                            {
                              connectedProducts.length
                            }{" "}
                            Products
                          </strong>
                        </div>

                        <b>
                          공급사 상세 →
                        </b>
                      </div>
                    </Link>

                    <div className="productCardActions supplierActions supplierDiscoveryActions">
                      <Link
                        href={`/suppliers/${supplier.slug}`}
                      >
                        공급사 상세
                      </Link>

                      <Link
                        className="primaryAction"
                        href={`/rfq?supplier=${supplier.slug}`}
                      >
                        RFQ 요청
                      </Link>
                    </div>
                  </article>
                );
              },
            )}
          </div>
        ) : (
          <div className="card emptyState">
            현재 Published 공급사가 없습니다.
          </div>
        )}
      </section>

      <section
        className="container section"
        id="knowledge"
      >
        <div className="marketHomeSectionHead">
          <div>
            <span>
              TECHNICAL KNOWLEDGE
            </span>

            <h2>
              기술 Knowledge Hub
            </h2>

            <p>
              기술 개념을 읽는 데서 끝내지 않고 관련 공정과 제품, 공급사로 이어집니다.
            </p>
          </div>

          <Link
            className="btn"
            href="/knowledge"
          >
            Knowledge 전체 보기
          </Link>
        </div>

        {featuredKnowledge.length ? (
          <div className="knowledgeListGrid marketHomeKnowledgeGrid">
            {featuredKnowledge.map(
              (article) => (
                <Link
                  href={`/knowledge/${article.slug}`}
                  className="card knowledgeListCard marketHomeKnowledgeCard"
                  key={article.slug}
                >
                  <KnowledgeVisual
                    article={article}
                    className="knowledgeCover"
                  />

                  <div className="knowledgeDiscoveryTopline">
                    <Badge>
                      {article.category}
                    </Badge>

                    <span>
                      {article.readingTime}
                    </span>
                  </div>

                  <h2>
                    {article.title}
                  </h2>

                  <p>
                    {article.summary}
                  </p>

                  <div className="knowledgeCardBottom">
                    <div>
                      <span>
                        RELATED PROCESS
                      </span>

                      <strong>
                        {article.relatedProcess}
                      </strong>
                    </div>

                    <b>
                      Knowledge 상세 →
                    </b>
                  </div>
                </Link>
              ),
            )}
          </div>
        ) : (
          <div className="card emptyState">
            현재 Published Knowledge가 없습니다.
          </div>
        )}
      </section>

      <section className="container section">
        <div className="marketHomeFinalCta">
          <div>
            <span>
              CONNECTED SOURCING
            </span>

            <h2>
              필요한 제품과 공급사를 찾았다면
              <br />
              RFQ로 실제 소싱을 시작하세요.
            </h2>

            <p>
              제품과 공급사를 저장하고 My Desk에서 관리하거나,
              바로 RFQ를 작성해 후보 공급사와 연결할 수 있습니다.
            </p>
          </div>

          <div className="marketHomeFinalActions">
            <Link
              className="btn marketHomeFinalSecondary"
              href="/my-desk"
            >
              My Desk
            </Link>

            <Link
              className="btn primary"
              href="/rfq"
            >
              RFQ 요청
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
