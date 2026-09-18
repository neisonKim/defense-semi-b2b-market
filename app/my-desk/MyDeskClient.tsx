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
  persistedSource?: "local" | "database";
};

type Tab = "rfq" | "products" | "suppliers" | "knowledge";

function readArray<T>(key: string): T[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function formatDate(value?: string) {
  if (!value) return "날짜 정보 없음";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "날짜 정보 없음";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
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

  useEffect(() => {
    refresh();
  }, []);

  const savedProducts = useMemo(
    () =>
      productSlugs
        .map((slug) => products.find((item) => item.slug === slug))
        .filter(
          (item): item is NonNullable<typeof item> => Boolean(item),
        ),
    [productSlugs, products],
  );

  const savedSuppliers = useMemo(
    () =>
      supplierSlugs
        .map((slug) => suppliers.find((item) => item.slug === slug))
        .filter(
          (item): item is NonNullable<typeof item> => Boolean(item),
        ),
    [supplierSlugs, suppliers],
  );

  const savedKnowledge = useMemo(
    () =>
      knowledgeSlugs
        .map((slug) => knowledge.find((item) => item.slug === slug))
        .filter(
          (item): item is NonNullable<typeof item> => Boolean(item),
        ),
    [knowledgeSlugs, knowledge],
  );

  const orderedRfqs = useMemo(() => {
    return [...rfqs].sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });
  }, [rfqs]);

  const latestRfq = orderedRfqs[0];

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
    return (
      <div className="card emptyState">
        <h3>My Desk 데이터를 불러오는 중입니다.</h3>
        <p>Published 데이터와 저장 항목을 동기화하고 있습니다.</p>
      </div>
    );
  }

  return (
    <>
      <div className="publicSyncBanner compactSync">
        <span className={source !== "mock" ? "live" : "demo"}>●</span>

        <strong>
          {source === "database"
            ? "PostgreSQL 공개 데이터와 My Desk 연결"
            : source === "cms"
              ? "CMS Published 데이터와 My Desk 동기화"
              : "Mock Data와 My Desk 연결"}
        </strong>

        <small>
          현재 공개 상태인 Product / Supplier / Knowledge만 저장 목록에 표시됩니다.
        </small>
      </div>

      <section className="myDeskOverview section">
        <div className="myDeskOverviewHead">
          <div>
            <span className="myDeskEyebrow">SOURCING WORKSPACE</span>
            <h2>내 소싱 현황</h2>
            <p>
              저장한 제품·공급사·기술자료와 RFQ 진행 내역을 한 화면에서 관리합니다.
            </p>
          </div>

          <Link className="btn primary" href="/rfq">
            새 RFQ 작성
          </Link>
        </div>

        <div className="myDeskStats">
          <DeskStat
            value={orderedRfqs.length}
            label="RFQ 요청"
            meta={latestRfq ? `최근 ${formatDate(latestRfq.createdAt)}` : "아직 요청 없음"}
          />

          <DeskStat
            value={savedProducts.length}
            label="관심 제품"
            meta="Saved Products"
          />

          <DeskStat
            value={savedSuppliers.length}
            label="관심 공급사"
            meta="Saved Suppliers"
          />

          <DeskStat
            value={savedKnowledge.length}
            label="저장 Knowledge"
            meta="Technical Library"
          />
        </div>
      </section>

      {latestRfq ? (
        <section className="card myDeskRecentRfq">
          <div className="myDeskRecentIntro">
            <span className="myDeskEyebrow">RECENT RFQ</span>
            <h2>최근 소싱 요청</h2>
            <p>가장 최근에 제출한 RFQ의 핵심 정보를 빠르게 확인합니다.</p>
          </div>

          <div className="myDeskRecentBody">
            <div className="myDeskRecentStatusRow">
              <span className="deskStatus">{latestRfq.status}</span>
              <small>{formatDate(latestRfq.createdAt)}</small>
            </div>

            <h3>{latestRfq.productName}</h3>

            <div className="myDeskRecentMeta">
              <div>
                <span>RFQ ID</span>
                <strong>{latestRfq.id}</strong>
              </div>

              <div>
                <span>Quantity</span>
                <strong>
                  {latestRfq.qty} {latestRfq.unit}
                </strong>
              </div>

              <div>
                <span>Target Date</span>
                <strong>{latestRfq.due || "미정"}</strong>
              </div>

              <div>
                <span>Supplier Match</span>
                <strong>{latestRfq.supplierCandidates?.length ?? 0}</strong>
              </div>
            </div>

            <div className="myDeskRecentActions">
              <Link className="btn" href={`/products/${latestRfq.productSlug}`}>
                제품 보기
              </Link>

              <Link
                className="btn primary"
                href={`/rfq?product=${latestRfq.productSlug}`}
              >
                다시 RFQ
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      <section className="card myDeskWorkspace">
        <div className="myDeskTabs">
          <TabButton
            active={tab === "rfq"}
            onClick={() => setTab("rfq")}
          >
            <span>RFQ</span>
            <small>{orderedRfqs.length}</small>
          </TabButton>

          <TabButton
            active={tab === "products"}
            onClick={() => setTab("products")}
          >
            <span>관심 제품</span>
            <small>{savedProducts.length}</small>
          </TabButton>

          <TabButton
            active={tab === "suppliers"}
            onClick={() => setTab("suppliers")}
          >
            <span>관심 공급사</span>
            <small>{savedSuppliers.length}</small>
          </TabButton>

          <TabButton
            active={tab === "knowledge"}
            onClick={() => setTab("knowledge")}
          >
            <span>Knowledge</span>
            <small>{savedKnowledge.length}</small>
          </TabButton>
        </div>

        {tab === "rfq" && (
          <div className="deskPanel">
            <div className="deskPanelHeader">
              <div>
                <span className="myDeskEyebrow">RFQ ACTIVITY</span>
                <h2>RFQ 요청 내역</h2>
                <p>
                  RFQ 원본은 설정된 데이터 소스에 저장되며 My Desk에는 브라우저 기반
                  요약본을 표시합니다.
                </p>
              </div>

              {orderedRfqs.length > 0 ? (
                <button className="btn" onClick={clearRfqs}>
                  Demo 내역 비우기
                </button>
              ) : null}
            </div>

            {orderedRfqs.length === 0 ? (
              <Empty
                title="아직 RFQ 요청이 없습니다."
                action="첫 RFQ 작성"
                href="/rfq"
              />
            ) : (
              <div className="deskRfqList">
                {orderedRfqs.map((rfq) => {
                  const isPublished = products.some(
                    (item) => item.slug === rfq.productSlug,
                  );

                  return (
                    <article className="deskRfqCard" key={rfq.id}>
                      <div className="deskRfqMain">
                        <div className="deskRfqTopline">
                          <span className="deskStatus">{rfq.status}</span>
                          <small>{formatDate(rfq.createdAt)}</small>
                        </div>

                        <h3>{rfq.productName}</h3>

                        <p className="deskRfqId">{rfq.id}</p>

                        <div className="deskRfqMetaGrid">
                          <div>
                            <span>Quantity</span>
                            <strong>
                              {rfq.qty} {rfq.unit}
                            </strong>
                          </div>

                          <div>
                            <span>Target Date</span>
                            <strong>{rfq.due || "미정"}</strong>
                          </div>

                          <div>
                            <span>Supplier Match</span>
                            <strong>
                              {rfq.supplierCandidates?.length ?? 0}
                            </strong>
                          </div>

                          <div>
                            <span>Storage</span>
                            <strong>
                              {rfq.persistedSource === "database"
                                ? "PostgreSQL"
                                : "Local Demo"}
                            </strong>
                          </div>
                        </div>

                        {rfq.supplierCandidates?.length ? (
                          <div className="deskCandidateChips">
                            {rfq.supplierCandidates.map((supplier) => (
                              <span key={supplier}>{supplier}</span>
                            ))}
                          </div>
                        ) : null}
                      </div>

                      <div className="deskRfqActions">
                        {isPublished ? (
                          <Link
                            className="btn"
                            href={`/products/${rfq.productSlug}`}
                          >
                            제품 보기
                          </Link>
                        ) : (
                          <span className="btn disabledLink">현재 비공개</span>
                        )}

                        <Link
                          className="btn primary"
                          href={
                            isPublished
                              ? `/rfq?product=${rfq.productSlug}`
                              : "/rfq"
                          }
                        >
                          다시 RFQ
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {tab === "products" && (
          <div className="deskPanel">
            <DeskPanelTitle
              eyebrow="SAVED PRODUCTS"
              title="관심 제품"
              description="비교하거나 다시 검토할 반도체 제품을 관리합니다."
            />

            {savedProducts.length === 0 ? (
              <Empty
                title="현재 공개 상태인 저장 제품이 없습니다."
                action="제품 탐색"
                href="/products"
              />
            ) : (
              <div className="deskSavedGrid">
                {savedProducts.map((item) => (
                  <article className="deskSavedCard" key={item.slug}>
                    <div className="deskSavedCardTop">
                      <span>{item.category}</span>
                      <small>PRODUCT</small>
                    </div>

                    <h3>{item.name}</h3>
                    <p>{item.subtitle}</p>

                    <div className="deskSavedMeta">
                      <span>{item.process}</span>
                      <span>{item.supplier}</span>
                    </div>

                    <div className="deskSavedActions">
                      <Link
                        className="btn primary"
                        href={`/products/${item.slug}`}
                      >
                        제품 보기
                      </Link>

                      <button
                        className="btn"
                        onClick={() =>
                          removeSaved(
                            "defense-semi-favorite-products",
                            item.slug,
                          )
                        }
                      >
                        삭제
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "suppliers" && (
          <div className="deskPanel">
            <DeskPanelTitle
              eyebrow="SAVED SUPPLIERS"
              title="관심 공급사"
              description="검토 중인 공급사와 주요 공정 역량을 관리합니다."
            />

            {savedSuppliers.length === 0 ? (
              <Empty
                title="현재 공개 상태인 저장 공급사가 없습니다."
                action="공급사 탐색"
                href="/suppliers"
              />
            ) : (
              <div className="deskSavedGrid">
                {savedSuppliers.map((item) => (
                  <article className="deskSavedCard" key={item.slug}>
                    <div className="deskSavedCardTop">
                      <span>{item.type}</span>
                      <small>SUPPLIER</small>
                    </div>

                    <h3>{item.name}</h3>
                    <p>{item.meta}</p>

                    <div className="deskSavedMeta">
                      <span>{item.region}</span>
                      <span>{item.processes.join(" / ")}</span>
                    </div>

                    <div className="deskSavedActions">
                      <Link
                        className="btn primary"
                        href={`/suppliers/${item.slug}`}
                      >
                        공급사 보기
                      </Link>

                      <button
                        className="btn"
                        onClick={() =>
                          removeSaved(
                            "defense-semi-favorite-suppliers",
                            item.slug,
                          )
                        }
                      >
                        삭제
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "knowledge" && (
          <div className="deskPanel">
            <DeskPanelTitle
              eyebrow="TECHNICAL LIBRARY"
              title="저장 Knowledge"
              description="소싱과 기술 검토에 필요한 콘텐츠를 다시 확인합니다."
            />

            {savedKnowledge.length === 0 ? (
              <Empty
                title="현재 공개 상태인 저장 Knowledge가 없습니다."
                action="Knowledge 탐색"
                href="/knowledge"
              />
            ) : (
              <div className="deskSavedGrid">
                {savedKnowledge.map((item) => (
                  <article className="deskSavedCard" key={item.slug}>
                    <div className="deskSavedCardTop">
                      <span>{item.category}</span>
                      <small>KNOWLEDGE</small>
                    </div>

                    <h3>{item.title}</h3>
                    <p>{item.summary}</p>

                    <div className="deskSavedMeta">
                      <span>{item.relatedProcess}</span>
                      <span>{item.readingTime}</span>
                    </div>

                    <div className="deskSavedActions">
                      <Link
                        className="btn primary"
                        href={`/knowledge/${item.slug}`}
                      >
                        콘텐츠 보기
                      </Link>

                      <button
                        className="btn"
                        onClick={() =>
                          removeSaved(
                            "defense-semi-saved-knowledge",
                            item.slug,
                          )
                        }
                      >
                        삭제
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}
      </section>
    </>
  );
}

function DeskStat({
  value,
  label,
  meta,
}: {
  value: number;
  label: string;
  meta: string;
}) {
  return (
    <div className="card deskStat">
      <span className="deskStatMeta">{meta}</span>
      <strong>{value}</strong>
      <span className="deskStatLabel">{label}</span>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className={active ? "active" : ""}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function DeskPanelTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="deskPanelTitle">
      <span className="myDeskEyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  );
}

function Empty({
  title,
  action,
  href,
}: {
  title: string;
  action: string;
  href: string;
}) {
  return (
    <div className="deskEmpty">
      <span className="deskEmptyMark">+</span>
      <h3>{title}</h3>
      <p>
        관련 페이지에서 My Desk 저장 버튼을 사용하거나 RFQ를 제출하면 여기에
        표시됩니다.
      </p>
      <Link className="btn primary" href={href}>
        {action}
      </Link>
    </div>
  );
}
