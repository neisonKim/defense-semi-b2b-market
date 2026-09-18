"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/UI";
import { processes } from "@/data/mock";
import { usePublicData } from "@/lib/publicData";
import { PrototypeProductThumb } from "@/components/PrototypeProductVisual";

const ALL = "전체";

export default function ProductCatalog() {
  const { products, suppliers, source, ready } = usePublicData();

  const [query, setQuery] = useState("");
  const [process, setProcess] = useState(ALL);
  const [category, setCategory] = useState(ALL);
  const [material, setMaterial] = useState(ALL);
  const [supplier, setSupplier] = useState(ALL);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const q = params.get("q");
    const processParam = params.get("process");
    const categoryParam = params.get("category");
    const materialParam = params.get("material");
    const supplierParam = params.get("supplier");
    const verifiedParam = params.get("verified");

    if (q) setQuery(q);
    if (processParam) setProcess(processParam);
    if (categoryParam) setCategory(categoryParam);
    if (materialParam) setMaterial(materialParam);
    if (supplierParam) setSupplier(supplierParam);
    if (verifiedParam === "1" || verifiedParam === "true") {
      setVerifiedOnly(true);
    }
  }, []);

  const categories = useMemo(
    () => [
      ALL,
      ...Array.from(
        new Set(
          products
            .map((item) => item.category)
            .filter(Boolean),
        ),
      ),
    ],
    [products],
  );

  const materials = useMemo(
    () => [
      ALL,
      ...Array.from(
        new Set(
          products
            .map((item) => item.material)
            .filter(Boolean),
        ),
      ),
    ],
    [products],
  );

  const supplierNames = useMemo(
    () => [
      ALL,
      ...Array.from(
        new Set(
          products
            .map((item) => item.supplier)
            .filter(Boolean),
        ),
      ),
    ],
    [products],
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();

    return products.filter((item) => {
      const supplierRecord = suppliers.find(
        (entry) => entry.slug === item.supplierSlug,
      );

      const haystack = [
        item.name,
        item.subtitle,
        item.category,
        item.material,
        item.manufacturingMethod,
        item.process,
        item.equipment,
        item.function,
        item.supplier,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const queryMatch =
        !q || haystack.includes(q);

      const processMatch =
        process === ALL ||
        item.process
          .toLowerCase()
          .includes(process.toLowerCase());

      const categoryMatch =
        category === ALL ||
        item.category === category;

      const materialMatch =
        material === ALL ||
        item.material === material;

      const supplierMatch =
        supplier === ALL ||
        item.supplier === supplier;

      const verifiedMatch =
        !verifiedOnly ||
        Boolean(supplierRecord?.verified);

      return (
        queryMatch &&
        processMatch &&
        categoryMatch &&
        materialMatch &&
        supplierMatch &&
        verifiedMatch
      );
    });
  }, [
    products,
    suppliers,
    query,
    process,
    category,
    material,
    supplier,
    verifiedOnly,
  ]);

  const hasActiveFilters =
    Boolean(query.trim()) ||
    process !== ALL ||
    category !== ALL ||
    material !== ALL ||
    supplier !== ALL ||
    verifiedOnly;

  const activeFilters = useMemo(() => {
    const filters: string[] = [];

    if (query.trim()) {
      filters.push(`검색: ${query.trim()}`);
    }

    if (process !== ALL) {
      filters.push(`공정: ${process}`);
    }

    if (category !== ALL) {
      filters.push(`카테고리: ${category}`);
    }

    if (material !== ALL) {
      filters.push(`소재: ${material}`);
    }

    if (supplier !== ALL) {
      filters.push(`공급사: ${supplier}`);
    }

    if (verifiedOnly) {
      filters.push("Verified Supplier");
    }

    return filters;
  }, [
    query,
    process,
    category,
    material,
    supplier,
    verifiedOnly,
  ]);

  const reset = () => {
    setQuery("");
    setProcess(ALL);
    setCategory(ALL);
    setMaterial(ALL);
    setSupplier(ALL);
    setVerifiedOnly(false);
    setMobileFiltersOpen(false);
  };

  if (!ready) {
    return (
      <div className="card emptyState">
        <h3>제품 데이터를 불러오는 중입니다.</h3>
        <p>
          Published 상태의 제품과 공급사 정보를 확인하고 있습니다.
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
            ? "PostgreSQL Published 제품 연결 중"
            : source === "cms"
              ? "Admin CMS Published 데이터 동기화 중"
              : "기본 Mock Data 표시 중"}
        </strong>

        <small>
          {source === "database"
            ? "PostgreSQL의 Published 제품만 공개됩니다."
            : source === "cms"
              ? "관리자에서 Published 처리된 제품만 공개됩니다."
              : "Admin CMS를 한 번 열면 발행 상태가 공개 페이지와 연결됩니다."}
        </small>
      </div>

      <div className="catalogResultBar">
        <div className="catalogResultCopy">
          <span>PRODUCT DISCOVERY</span>

          <div>
            <h2>제품 탐색 결과</h2>
            <strong>{results.length}</strong>
          </div>

          <p>
            제품명, 공정, 소재, 공급사 정보를 기준으로
            반도체 제품을 탐색할 수 있습니다.
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

      <div className="card liveCatalogFilter productCatalogFilter">
        <div className="catalogFilterHead">
          <div>
            <span>SEARCH & FILTER</span>
            <strong>제품 검색 및 조건 설정</strong>
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
          <div className="catalogSearchRow">
            <label className="catalogField grow">
              <span>제품 통합 검색</span>

              <input
                value={query}
                onChange={(event) =>
                  setQuery(event.target.value)
                }
                placeholder="제품명, 소재, 공정, 장비, 공급사 검색"
              />
            </label>

            <label className="catalogField">
              <span>Category</span>

              <select
                value={category}
                onChange={(event) =>
                  setCategory(event.target.value)
                }
              >
                {categories.map((item) => (
                  <option key={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label className="catalogField">
              <span>Material</span>

              <select
                value={material}
                onChange={(event) =>
                  setMaterial(event.target.value)
                }
              >
                {materials.map((item) => (
                  <option key={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label className="catalogField">
              <span>Supplier</span>

              <select
                value={supplier}
                onChange={(event) =>
                  setSupplier(event.target.value)
                }
              >
                {supplierNames.map((item) => (
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
                Verified Supplier 제품만 보기
              </span>
            </label>

            <div className="filterResultActions">
              <strong>
                {results.length}개 결과
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

      <div
        className="processQuickFilter"
        aria-label="공정 빠른 필터"
      >
        <button
          type="button"
          className={
            process === ALL ? "active" : ""
          }
          onClick={() => setProcess(ALL)}
        >
          {ALL}
        </button>

        {processes.map((item) => (
          <button
            type="button"
            className={
              process === item.name
                ? "active"
                : ""
            }
            key={item.name}
            onClick={() =>
              setProcess(item.name)
            }
          >
            {item.name}
            <small>{item.ko}</small>
          </button>
        ))}
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
        <div className="productGrid">
          {results.map((item) => {
            const supplierRecord =
              suppliers.find(
                (entry) =>
                  entry.slug ===
                  item.supplierSlug,
              );

            return (
              <article
                className="card marketProductCard productDiscoveryCard"
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

                    {supplierRecord?.verified ? (
                      <Badge kind="green">
                        Verified
                      </Badge>
                    ) : (
                      <Badge kind="amber">
                        Supplier Check
                      </Badge>
                    )}
                  </div>

                  <h3>{item.name}</h3>

                  <p>{item.subtitle}</p>

                  <div className="productMetaStack productDiscoveryMeta">
                    <span>
                      <b>Process</b>
                      {item.process}
                    </span>

                    <span>
                      <b>Material</b>
                      {item.material}
                    </span>

                    <span>
                      <b>Supplier</b>
                      {item.supplier}
                    </span>
                  </div>

                  <div className="productSupplierLine">
                    <div>
                      <span>SUPPLIER STATUS</span>

                      <strong>
                        {supplierRecord?.verified
                          ? "Verified Supplier"
                          : "Verification Review"}
                      </strong>
                    </div>

                    <b>제품 상세 →</b>
                  </div>
                </Link>

                <div className="productCardActions">
                  <Link
                    href={`/products/${item.slug}`}
                  >
                    상세 정보
                  </Link>

                  {supplierRecord ? (
                    <Link
                      href={`/suppliers/${item.supplierSlug}`}
                    >
                      공급사
                    </Link>
                  ) : (
                    <span>
                      공급사 확인중
                    </span>
                  )}

                  <Link
                    className="primaryAction"
                    href={`/rfq?product=${item.slug}`}
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
            조건에 맞는 공개 제품이 없습니다.
          </h3>

          <p>
            검색어나 공정·소재·공급사 조건을
            조정하거나 필터를 초기화해 보세요.
          </p>

          <button
            className="btn primary"
            onClick={reset}
          >
            필터 초기화
          </button>
        </div>
      )}
    </>
  );
}
