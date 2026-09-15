"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePublicData } from "@/lib/publicData";

function supplierMatchesProcess(process: string, supplierProcesses: string[]) {
  const parts = process.split("/").map((item) => item.trim().toLowerCase()).filter(Boolean);
  return supplierProcesses.some((supplierProcess) => {
    const needle = supplierProcess.toLowerCase();
    return parts.some((part) => part.includes(needle) || needle.includes(part));
  });
}

export default function RFQForm() {
  const { products, suppliers, source, ready } = usePublicData();
  const [productSlug, setProductSlug] = useState("");
  const [preferredSupplierSlug, setPreferredSupplierSlug] = useState("");
  const [qty, setQty] = useState("10");
  const [unit, setUnit] = useState("EA");
  const [due, setDue] = useState("2026-12-31");
  const [requirement, setRequirement] = useState("");
  const [company, setCompany] = useState("디펜스세미 주식회사");
  const [contact, setContact] = useState("홍길동");
  const [phone, setPhone] = useState("010-1234-5678");
  const [email, setEmail] = useState("sample@defensemi.com");
  const [submittedId, setSubmittedId] = useState("");
  const [submittedSource, setSubmittedSource] = useState<"local" | "database">("local");
  const [submissionError, setSubmissionError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!ready || products.length === 0) return;
    const params = new URLSearchParams(window.location.search);
    const requestedProduct = params.get("product");
    const requestedSupplier = params.get("supplier");

    setProductSlug((current) => {
      if (requestedProduct && products.some((item) => item.slug === requestedProduct)) return requestedProduct;
      if (current && products.some((item) => item.slug === current)) return current;
      return products[0].slug;
    });

    if (requestedSupplier && suppliers.some((item) => item.slug === requestedSupplier)) {
      setPreferredSupplierSlug(requestedSupplier);
    }
  }, [products, suppliers, ready]);

  const selectedProduct = useMemo(
    () => products.find((item) => item.slug === productSlug) ?? products[0],
    [products, productSlug]
  );

  const candidates = useMemo(() => {
    if (!selectedProduct) return [];
    const direct = suppliers.filter((item) => item.slug === selectedProduct.supplierSlug);
    const related = suppliers.filter((item) => supplierMatchesProcess(selectedProduct.process, item.processes));
    const preferred = preferredSupplierSlug ? suppliers.filter((item) => item.slug === preferredSupplierSlug) : [];
    return Array.from(new Map([...preferred, ...direct, ...related].map((item) => [item.slug, item])).values()).slice(0, 5);
  }, [selectedProduct, preferredSupplierSlug, suppliers]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedProduct || submitting) return;

    setSubmitting(true);
    setSubmissionError("");

    try {
      let id = `RFQ-DEMO-${String(Date.now()).slice(-6)}`;
      let persistedSource: "local" | "database" = "local";

      if (source === "database") {
        const response = await fetch("/api/rfq", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productSlug: selectedProduct.slug,
            quantity: Number(qty),
            unit,
            targetDate: due,
            companyName: company,
            contactName: contact,
            email,
            phone,
            requirements: requirement,
            application: selectedProduct.process,
            candidateSupplierSlugs: candidates.map((item) => item.slug),
          }),
        });
        const payload = await response.json();
        if (!response.ok || !payload.ok) throw new Error(payload.error || `HTTP ${response.status}`);
        id = payload.rfqId;
        persistedSource = "database";
      }

      const record = {
        id,
        productSlug: selectedProduct.slug,
        productName: selectedProduct.name,
        qty,
        unit,
        due,
        requirement,
        company,
        contact,
        phone,
        email,
        supplierCandidates: candidates.map((item) => item.name),
        status: "Submitted",
        createdAt: new Date().toISOString(),
        persistedSource,
      };

      // My Desk remains browser-based in Stage 09, so keep a local mirror even when PostgreSQL stores the RFQ.
      try {
        const existing = JSON.parse(localStorage.getItem("defense-semi-rfqs") || "[]");
        localStorage.setItem("defense-semi-rfqs", JSON.stringify([record, ...(Array.isArray(existing) ? existing : [])]));
      } catch {
        localStorage.setItem("defense-semi-rfqs", JSON.stringify([record]));
      }

      setSubmittedSource(persistedSource);
      setSubmittedId(id);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error(error);
      setSubmissionError("RFQ를 데이터베이스에 저장하지 못했습니다. DB 연결 상태를 확인해 주세요.");
    } finally {
      setSubmitting(false);
    }
  };


  if (!ready) {
    return <div className="card emptyState"><h3>공개 제품 데이터를 불러오는 중입니다.</h3><p>Admin CMS의 Published 데이터를 확인하고 있습니다.</p></div>;
  }

  if (!selectedProduct) {
    return <div className="card emptyState"><h3>RFQ를 작성할 공개 제품이 없습니다.</h3><p>Admin CMS에서 제품을 Published 상태로 발행한 뒤 다시 시도해 주세요.</p><Link className="btn primary" href="/admin">Admin CMS 이동</Link></div>;
  }

  if (submittedId) {
    return (
      <div className="rfqSuccess card">
        <div className="successIcon">✓</div>
        <p className="kicker">RFQ DEMO SUBMITTED</p>
        <h1>견적 요청이 접수되었습니다.</h1>
        <p>{submittedSource === "database" ? "RFQ가 PostgreSQL에 저장되었습니다. My Desk 호환을 위해 브라우저에도 요약본을 함께 보관합니다." : "현재 Local Storage Demo 모드로 RFQ를 저장했습니다."}</p>
        <div className="rfqSuccessId">{submittedId}</div>
        <div className="twoGrid rfqSuccessMeta">
          <div><span>제품</span><strong>{selectedProduct.name}</strong></div>
          <div><span>상태</span><strong>Submitted</strong></div>
          <div><span>수량</span><strong>{qty} {unit}</strong></div>
          <div><span>매칭 후보</span><strong>{candidates.length}개</strong></div>
        </div>
        <div className="ctaRow">
          <button className="btn primary" onClick={() => setSubmittedId("")}>새 RFQ 작성</button>
          <Link className="btn" href={`/products/${selectedProduct.slug}`}>제품으로 돌아가기</Link>
          <Link className="btn dark" href="/my-desk">My Desk에서 확인</Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit}>
      <div className="publicSyncBanner compactSync">
        <span className={source === "database" || source === "cms" ? "live" : "demo"}>●</span>
        <strong>{source === "database" ? "PostgreSQL Product 기반 RFQ" : source === "cms" ? "Published Product 기반 RFQ" : "Mock Product 기반 RFQ"}</strong>
        <small>제품 상세에서 전달된 상품과 공급사 정보를 그대로 이어받습니다.</small>
      </div>

      <div className="steps"><Step n="1" t="제품 선택"/><Step n="2" t="사양 / 요구사항"/><Step n="3" t="회사정보 / 제출"/></div>
      <div className="rfqGrid">
        <section>
          <div className="card formCard">
            <h2>1. 제품 선택</h2>
            <label>제품
              <select value={selectedProduct.slug} onChange={(event) => setProductSlug(event.target.value)}>
                {products.map((item) => <option value={item.slug} key={item.slug}>{item.name} · {item.process}</option>)}
              </select>
            </label>
            <div className="selectedProduct">
              <div className="chipIcon">▥</div>
              <div><strong>{selectedProduct.name}</strong><span>{selectedProduct.category} · {selectedProduct.process} · {selectedProduct.supplier}</span></div>
            </div>
          </div>

          <div className="card formCard">
            <h2>2. 사양 / 요구사항</h2>
            <div className="formTwo">
              <label>요청 수량<input value={qty} onChange={(event) => setQty(event.target.value)} required /></label>
              <label>단위<select value={unit} onChange={(event) => setUnit(event.target.value)}><option>EA</option><option>PCS</option><option>SET</option><option>LOT</option></select></label>
              <label>목표 납기<input type="date" value={due} onChange={(event) => setDue(event.target.value)} required /></label>
              <label>적용 공정<input value={selectedProduct.process} readOnly /></label>
            </div>
            <label>기술 요구사항<textarea value={requirement} onChange={(event) => setRequirement(event.target.value)} placeholder="치수, 사용 환경, 장비 모델, 인증 요건 등 필요한 내용을 입력하세요." /></label>
          </div>

          <div className="card formCard">
            <h2>3. 회사정보 / 첨부</h2>
            <div className="formTwo">
              <label>회사명<input value={company} onChange={(event) => setCompany(event.target.value)} required /></label>
              <label>담당자<input value={contact} onChange={(event) => setContact(event.target.value)} required /></label>
              <label>연락처<input value={phone} onChange={(event) => setPhone(event.target.value)} required /></label>
              <label>이메일<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
            </div>
            <div className="upload">도면 / 사양서 / 구매요청서 업로드 영역 (Demo)</div>
          </div>
        </section>

        <aside className="rfqSummary card">
          <h2>요청 요약</h2>
          <div className="selectedProduct"><div className="chipIcon">▥</div><div><strong>{selectedProduct.name}</strong><span>{qty || "-"} {unit} · {due || "납기 미정"}</span></div></div>
          <dl className="rfqSummaryList">
            <div><dt>Category</dt><dd>{selectedProduct.category}</dd></div>
            <div><dt>Process</dt><dd>{selectedProduct.process}</dd></div>
            <div><dt>Material</dt><dd>{selectedProduct.material}</dd></div>
            <div><dt>Preferred Supplier</dt><dd>{preferredSupplierSlug ? suppliers.find((item) => item.slug === preferredSupplierSlug)?.name ?? selectedProduct.supplier : selectedProduct.supplier}</dd></div>
          </dl>
          <p>예상 매칭 공급사</p>
          <strong className="bigNum">{candidates.length}</strong>
          <div className="rfqCandidates">
            {candidates.length ? candidates.map((item) => <span key={item.slug}>{item.name}{item.verified ? " ✓" : ""}</span>) : <span>조건에 맞는 공개 공급사를 추가 확인해야 합니다.</span>}
          </div>
          <p>제품과 적용 공정을 기준으로 관련 공급사 후보를 보여주는 Demo 매칭입니다.</p>
          {submissionError && <p className="rfqError">{submissionError}</p>}
          <button className="btn primary full" type="submit" disabled={submitting}>{submitting ? "저장 중..." : "RFQ 제출"}</button>
        </aside>
      </div>
      <div className="rfqMobileBar"><span>{selectedProduct.name} · {qty} {unit}</span><button type="submit" disabled={submitting}>{submitting ? "저장 중..." : "RFQ 제출"}</button></div>
    </form>
  );
}

function Step({n,t}:{n:string;t:string}){return <div className="stepCard"><span>{n}</span><strong>{t}</strong></div>}
