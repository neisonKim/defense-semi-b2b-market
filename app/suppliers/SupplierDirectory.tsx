"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge } from "@/components/UI";
import { usePublicData } from "@/lib/publicData";
import { SupplierDirectoryVisual } from "@/components/PrototypeProductVisual";

const ALL = "전체";

export default function SupplierDirectory() {
  const { suppliers, products, source } = usePublicData();
  const [query, setQuery] = useState("");
  const [type, setType] = useState(ALL);
  const [region, setRegion] = useState(ALL);
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const types = useMemo(() => [ALL, ...Array.from(new Set(suppliers.map((item) => item.type)))], [suppliers]);
  const regions = useMemo(() => [ALL, ...Array.from(new Set(suppliers.map((item) => item.region)))], [suppliers]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return suppliers.filter((item) => {
      const text = [item.name, item.type, item.meta, item.region, item.processes.join(" ")].join(" ").toLowerCase();
      return (
        (!q || text.includes(q)) &&
        (type === ALL || item.type === type) &&
        (region === ALL || item.region === region) &&
        (!verifiedOnly || item.verified)
      );
    });
  }, [suppliers, query, type, region, verifiedOnly]);

  const reset = () => {
    setQuery("");
    setType(ALL);
    setRegion(ALL);
    setVerifiedOnly(false);
  };

  return (
    <>
      <div className="publicSyncBanner">
        <span className={source !== "mock" ? "live" : "demo"}>●</span>
        <strong>{source === "database" ? "PostgreSQL Published 공급사 연결 중" : source === "cms" ? "Admin CMS Published 공급사 동기화 중" : "기본 Mock Supplier 표시 중"}</strong>
        <small>{source === "database" ? "PostgreSQL에서 Published 상태의 공급사만 표시됩니다." : source === "cms" ? "Published 상태의 공급사만 공개 디렉터리에 표시됩니다." : "CMS 저장 데이터가 생성되면 공개 상태와 연동됩니다."}</small>
      </div>

      <div className="card liveCatalogFilter">
        <div className="catalogSearchRow supplierSearchRow">
          <label className="catalogField grow">
            <span>공급사 검색</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="기업명, 공정, 소재, 역량 검색" />
          </label>
          <label className="catalogField">
            <span>Supplier Type</span>
            <select value={type} onChange={(event) => setType(event.target.value)}>
              {types.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label className="catalogField">
            <span>Region</span>
            <select value={region} onChange={(event) => setRegion(event.target.value)}>
              {regions.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
        </div>
        <div className="catalogFilterFooter">
          <label className="checkFilter">
            <input type="checkbox" checked={verifiedOnly} onChange={(event) => setVerifiedOnly(event.target.checked)} />
            <span>Verified Supplier만 보기</span>
          </label>
          <div className="filterResultActions"><strong>{results.length}개 공급사</strong><button className="btn" onClick={reset}>필터 초기화</button></div>
        </div>
      </div>

      {results.length > 0 ? (
        <div className="supplierDirectoryGrid">
          {results.map((supplier) => {
            const connectedProducts = products.filter((product) => product.supplierSlug === supplier.slug);
            return (
              <article className="card supplierDirectoryCard" key={supplier.slug}>
                <Link href={`/suppliers/${supplier.slug}`} className="supplierCardMain">
                  <SupplierDirectoryVisual supplier={supplier} source={connectedProducts[0]} />
                  <div className="rowBetween">
                    <div className="supplierLogo compact">{supplier.name.slice(0, 2)}</div>
                    <Badge kind={supplier.verified ? "green" : "amber"}>{supplier.verified ? "Verified" : "Not Verified"}</Badge>
                  </div>
                  <h3>{supplier.name}</h3>
                  <p>{supplier.meta}</p>
                  <dl>
                    <div><dt>Supplier Type</dt><dd>{supplier.type}</dd></div>
                    <div><dt>Region</dt><dd>{supplier.region}</dd></div>
                    <div><dt>Connected Products</dt><dd>{connectedProducts.length}</dd></div>
                  </dl>
                  <div className="chipRow light">{supplier.processes.map((process) => <span key={process}>{process}</span>)}</div>
                </Link>
                <div className="productCardActions supplierActions">
                  <Link href={`/suppliers/${supplier.slug}`}>프로필</Link>
                  <Link className="primaryAction" href={`/rfq?supplier=${supplier.slug}`}>공급사 RFQ</Link>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="card emptyState"><h3>공개된 공급사가 없거나 검색 결과가 없습니다.</h3><p>Admin CMS에서 Published 상태를 확인하거나 필터를 변경해 보세요.</p><button className="btn primary" onClick={reset}>전체 공급사 보기</button></div>
      )}
    </>
  );
}
