"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/UI";
import { processes } from "@/data/mock";
import { usePublicData } from "@/lib/publicData";
import { PrototypeProductThumb } from "@/components/PrototypeProductVisual";

const ALL = "전체";

export default function ProductCatalog() {
  const { products, suppliers, source } = usePublicData();
  const [query, setQuery] = useState("");
  const [process, setProcess] = useState(ALL);
  const [category, setCategory] = useState(ALL);
  const [supplier, setSupplier] = useState(ALL);
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    const processParam = params.get("process");
    const categoryParam = params.get("category");
    const supplierParam = params.get("supplier");
    if (q) setQuery(q);
    if (processParam) setProcess(processParam);
    if (categoryParam) setCategory(categoryParam);
    if (supplierParam) setSupplier(supplierParam);
  }, []);

  const categories = useMemo(() => [ALL, ...Array.from(new Set(products.map((item) => item.category)))], [products]);
  const supplierNames = useMemo(() => [ALL, ...Array.from(new Set(products.map((item) => item.supplier)))], [products]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((item) => {
      const supplierRecord = suppliers.find((entry) => entry.slug === item.supplierSlug);
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
      ].join(" ").toLowerCase();

      const queryMatch = !q || haystack.includes(q);
      const processMatch = process === ALL || item.process.toLowerCase().includes(process.toLowerCase());
      const categoryMatch = category === ALL || item.category === category;
      const supplierMatch = supplier === ALL || item.supplier === supplier;
      const verifiedMatch = !verifiedOnly || Boolean(supplierRecord?.verified);
      return queryMatch && processMatch && categoryMatch && supplierMatch && verifiedMatch;
    });
  }, [products, suppliers, query, process, category, supplier, verifiedOnly]);

  const reset = () => {
    setQuery("");
    setProcess(ALL);
    setCategory(ALL);
    setSupplier(ALL);
    setVerifiedOnly(false);
  };

  return (
    <>
      <div className="publicSyncBanner">
        <span className={source !== "mock" ? "live" : "demo"}>●</span>
        <strong>{source === "database" ? "PostgreSQL Published 제품 연결 중" : source === "cms" ? "Admin CMS Published 데이터 동기화 중" : "기본 Mock Data 표시 중"}</strong>
        <small>{source === "database" ? "PostgreSQL의 Published 제품만 공개됩니다." : source === "cms" ? "관리자에서 Published 처리된 제품만 공개됩니다." : "Admin CMS를 한 번 열면 발행 상태가 공개 페이지와 연결됩니다."}</small>
      </div>

      <div className="card liveCatalogFilter">
        <div className="catalogSearchRow">
          <label className="catalogField grow">
            <span>제품 통합 검색</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="제품명, 소재, 공정, 장비, 공급사 검색" />
          </label>
          <label className="catalogField">
            <span>Category</span>
            <select value={category} onChange={(event) => setCategory(event.target.value)}>
              {categories.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label className="catalogField">
            <span>Supplier</span>
            <select value={supplier} onChange={(event) => setSupplier(event.target.value)}>
              {supplierNames.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
        </div>

        <div className="catalogFilterFooter">
          <label className="checkFilter">
            <input type="checkbox" checked={verifiedOnly} onChange={(event) => setVerifiedOnly(event.target.checked)} />
            <span>Verified Supplier 제품만 보기</span>
          </label>
          <div className="filterResultActions">
            <strong>{results.length}개 결과</strong>
            <button className="btn" type="button" onClick={reset}>필터 초기화</button>
          </div>
        </div>
      </div>

      <div className="processQuickFilter">
        <button className={process === ALL ? "active" : ""} onClick={() => setProcess(ALL)}>{ALL}</button>
        {processes.map((item) => (
          <button className={process === item.name ? "active" : ""} key={item.name} onClick={() => setProcess(item.name)}>
            {item.name}<small>{item.ko}</small>
          </button>
        ))}
      </div>

      {results.length > 0 ? (
        <div className="productGrid">
          {results.map((item) => {
            const supplierRecord = suppliers.find((entry) => entry.slug === item.supplierSlug);
            return (
              <article className="card marketProductCard" key={item.slug}>
                <Link href={`/products/${item.slug}`} className="productCardMain">
                  <PrototypeProductThumb source={item} label={item.process} />
                  <div className="rowBetween">
                    <Badge>{item.category}</Badge>
                    {supplierRecord?.verified ? <Badge kind="green">Verified</Badge> : <Badge kind="amber">Supplier Check</Badge>}
                  </div>
                  <h3>{item.name}</h3>
                  <p>{item.subtitle}</p>
                  <div className="productMetaStack">
                    <span><b>Material</b>{item.material}</span>
                    <span><b>Supplier</b>{item.supplier}</span>
                  </div>
                </Link>
                <div className="productCardActions">
                  <Link href={`/products/${item.slug}`}>상세 정보</Link>
                  {supplierRecord ? <Link href={`/suppliers/${item.supplierSlug}`}>공급사</Link> : <span>공급사 확인중</span>}
                  <Link className="primaryAction" href={`/rfq?product=${item.slug}`}>RFQ</Link>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="card emptyState">
          <h3>공개된 제품이 없거나 검색 결과가 없습니다.</h3>
          <p>Admin CMS에서 제품 상태를 Published로 변경하거나 검색 필터를 초기화해 보세요.</p>
          <button className="btn primary" onClick={reset}>필터 초기화</button>
        </div>
      )}
    </>
  );
}
