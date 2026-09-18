"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/UI";
import { usePublicData } from "@/lib/publicData";
import { SupplierDirectoryVisual } from "@/components/PrototypeProductVisual";

const ALL = "전체";

export default function SupplierDirectory() {
  const { suppliers, products, source, ready } = usePublicData();

  const [query, setQuery] = useState("");
  const [type, setType] = useState(ALL);
  const [process, setProcess] = useState(ALL);
  const [region, setRegion] = useState(ALL);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const q = params.get("q");
    const typeParam = params.get("type");
    const processParam = params.get("process");
    const regionParam = params.get("region");
    const verifiedParam = params.get("verified");

    if (q) setQuery(q);
    if (typeParam) setType(typeParam);
    if (processParam) setProcess(processParam);
    if (regionParam) setRegion(regionParam);
    if (verifiedParam === "1" || verifiedParam === "true") {
      setVerifiedOnly(true);
    }
  }, []);

  const types = useMemo(
    () => [
      ALL,
      ...Array.from(
        new Set(
          suppliers
            .map((item) => item.type)
            .filter(Boolean),
        ),
      ),
    ],
    [suppliers],
  );

  const processNames = useMemo(
    () => [
      ALL,
      ...Array.from(
        new Set(
          suppliers.flatMap((item) => item.processes ?? []).filter(Boolean),
        ),
      ),
    ],
    [suppliers],
  );

  const regions = useMemo(
    () => [
      ALL,
      ...Array.from(
        new Set(
          suppliers
            .map((item) => item.region)
            .filter(Boolean),
        ),
      ),
    ],
    [suppliers],
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();

    return suppliers.filter((item) => {
      const text = [
        item.name,
        item.type,
        item.meta,
        item.region,
        ...(item.processes ?? []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const queryMatch =
        !q || text.includes(q);

      const typeMatch =
        type === ALL || item.type === type;

      const processMatch =
        process === ALL ||
        (item.processes ?? []).some((itemProcess) =>
          itemProcess
            .toLowerCase()
            .includes(process.toLowerCase()),
        );

      const regionMatch =
        region === ALL || item.region === region;

      const verifiedMatch =
        !verifiedOnly || item.verified;

      return (
        queryMatch &&
        typeMatch &&
        processMatch &&
        regionMatch &&
        verifiedMatch
      );
    });
  }, [
    suppliers,
    query,
    type,
    process,
    region,
    verifiedOnly,
  ]);

  const hasActiveFilters =
    Boolean(query.trim()) ||
    type !== ALL ||
    process !== ALL ||
    region !== ALL ||
    verifiedOnly;

  const activeFilters = useMemo(() => {
    const filters: string[] = [];

    if (query.trim()) {
      filters.push(`검색: ${query.trim()}`);
    }

    if (type !== ALL) {
      filters.push(`유형: ${type}`);
    }

    if (process !== ALL) {
      filters.push(`공정: ${process}`);
    }

    if (region !== ALL) {
      filters.push(`지역: ${region}`);
    }

    if (verifiedOnly) {
      filters.push("Verified Supplier");
    }

    return filters;
  }, [
    query,
    type,
    process,
    region,
    verifiedOnly,
  ]);

  const reset = () => {
    setQuery("");
    setType(ALL);
    setProcess(ALL);
    setRegion(ALL);
    setVerifiedOnly(false);
    setMobileFiltersOpen(false);
  };

  if (!ready) {
    return (
      <div className="card emptyState">
        <h3>공급사 데이터를 불러오는 중입니다.</h3>
        <p>
          Published 상태의 공급사와 연결 제품 정보를 확인하고 있습니다.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="publicSyncBanner">
        <span className={source !== "mock" ? "live" : "demo"}>
          ●
        </span>

        <strong>
          {source === "database"
            ? "PostgreSQL Published 공급사 연결 중"
            : source === "cms"
              ? "Admin CMS Published 공급사 동기화 중"
              : "기본 Mock Supplier 표시 중"}
        </strong>

        <small>
          {source === "database"
            ? "PostgreSQL에서 Published 상태의 공급사만 표시됩니다."
            : source === "cms"
              ? "Published 상태의 공급사만 공개 디렉터리에 표시됩니다."
              : "CMS 저장 데이터가 생성되면 공개 상태와 연동됩니다."}
        </small>
      </div>

      <div className="catalogResultBar supplierResultBar">
        <div className="catalogResultCopy">
          <span>SUPPLIER DISCOVERY</span>

          <div>
            <h2>공급사 탐색 결과</h2>
            <strong>{results.length}</strong>
          </div>

          <p>
            기업명, 공급사 유형, 반도체 공정과 공급 지역을 기준으로
            공급 파트너를 탐색할 수 있습니다.
          </p>
        </div>

        <button
          type="button"
          className="catalogMobileFilterToggle"
          onClick={() =>
            setMobileFiltersOpen((current) => !current)
          }
          aria-expanded={mobileFiltersOpen}
        >
          {mobileFiltersOpen
            ? "필터 닫기"
            : "검색 / 필터"}

          <span>
            {activeFilters.length > 0
              ? activeFilters.length
              : ""}
          </span>
        </button>
      </div>

      <div className="card liveCatalogFilter supplierCatalogFilter">
        <div className="catalogFilterHead">
          <div>
            <span>SEARCH & FILTER</span>
            <strong>공급사 검색 및 조건 설정</strong>
          </div>

          {hasActiveFilters ? (
            <button
              type="button"
              className="catalogResetText"
              onClick={reset}
            >
              전체 초기화
            </button>
          ) : null}
        </div>

        <div
          className={`catalogFilterBody ${
            mobileFiltersOpen ? "open" : ""
          }`}
        >
          <div className="catalogSearchRow supplierSearchRow">
            <label className="catalogField grow">
              <span>공급사 검색</span>

              <input
                value={query}
                onChange={(event) =>
                  setQuery(event.target.value)
                }
                placeholder="기업명, 공정, 지역, 역량 검색"
              />
            </label>

            <label className="catalogField">
              <span>Supplier Type</span>

              <select
                value={type}
                onChange={(event) =>
                  setType(event.target.value)
                }
              >
                {types.map((item) => (
                  <option key={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label className="catalogField">
              <span>Process</span>

              <select
                value={process}
                onChange={(event) =>
                  setProcess(event.target.value)
                }
              >
                {processNames.map((item) => (
                  <option key={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label className="catalogField">
              <span>Region</span>

              <select
                value={region}
                onChange={(event) =>
                  setRegion(event.target.value)
                }
              >
                {regions.map((item) => (
                  <option key={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="catalogFilterFooter">
            <label className="checkFilter">
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(event) =>
                  setVerifiedOnly(
                    event.target.checked,
                  )
                }
              />

              <span>
                Verified Supplier만 보기
              </span>
            </label>

            <div className="filterResultActions">
              <strong>
                {results.length}개 공급사
              </strong>

              <button
                className="btn"
                type="button"
                onClick={reset}
                disabled={!hasActiveFilters}
              >
                필터 초기화
              </button>
            </div>
          </div>
        </div>
      </div>

      {activeFilters.length > 0 ? (
        <div className="catalogActiveFilters">
          <span>현재 조건</span>

          {activeFilters.map((filter) => (
            <strong key={filter}>
              {filter}
            </strong>
          ))}
        </div>
      ) : null}

      {results.length > 0 ? (
        <div className="supplierDirectoryGrid">
          {results.map((supplier) => {
            const connectedProducts =
              products.filter(
                (product) =>
                  product.supplierSlug ===
                  supplier.slug,
              );

            const primaryProcess =
              supplier.processes?.[0] ??
              "Semiconductor";

            return (
              <article
                className="card supplierDirectoryCard supplierDiscoveryCard"
                key={supplier.slug}
              >
                <Link
                  href={`/suppliers/${supplier.slug}`}
                  className="supplierCardMain supplierDiscoveryMain"
                >
                  <SupplierDirectoryVisual
                    supplier={supplier}
                    source={connectedProducts[0]}
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
                        : "Verification Review"}
                    </Badge>
                  </div>

                  <h3>{supplier.name}</h3>

                  <p>{supplier.meta}</p>

                  <div className="supplierIntelligenceGrid">
                    <div>
                      <span>REGION</span>
                      <strong>{supplier.region}</strong>
                    </div>

                    <div>
                      <span>LEAD TIME</span>
                      <strong>
                        {supplier.leadTime || "문의 필요"}
                      </strong>
                    </div>

                    <div>
                      <span>PRODUCTS</span>
                      <strong>
                        {connectedProducts.length}
                      </strong>
                    </div>
                  </div>

                  <div className="supplierProcessBlock">
                    <span>CORE CAPABILITY</span>

                    <div className="chipRow light supplierProcessChips">
                      {(supplier.processes ?? []).map(
                        (itemProcess) => (
                          <span key={itemProcess}>
                            {itemProcess}
                          </span>
                        ),
                      )}
                    </div>
                  </div>

                  <div className="supplierDirectoryStatusLine">
                    <div>
                      <span>PRIMARY PROCESS</span>
                      <strong>{primaryProcess}</strong>
                    </div>

                    <b>공급사 상세 →</b>
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
          })}
        </div>
      ) : (
        <div className="card emptyState catalogEmptyState">
          <span>0 RESULTS</span>

          <h3>
            조건에 맞는 공개 공급사가 없습니다.
          </h3>

          <p>
            검색어나 공급사 유형·공정·지역 조건을 조정하거나
            필터를 초기화해 보세요.
          </p>

          <button
            className="btn primary"
            onClick={reset}
          >
            전체 공급사 보기
          </button>
        </div>
      )}
    </>
  );
}
