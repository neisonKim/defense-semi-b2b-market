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
    <form className="rfqExperience" onSubmit={submit}>
      <div className="publicSyncBanner compactSync">
        <span className={source === "database" || source === "cms" ? "live" : "demo"}>●</span>
        <strong>
          {source === "database"
            ? "PostgreSQL Product 기반 RFQ"
            : source === "cms"
              ? "Published Product 기반 RFQ"
              : "Mock Product 기반 RFQ"}
        </strong>
        <small>제품 상세에서 전달된 제품·공급사 정보를 이어받아 소싱 요청을 구성합니다.</small>
      </div>

      <header className="rfqIntro">
        <div>
          <span className="rfqEyebrow">REQUEST FOR QUOTATION</span>
          <h1>반도체 제품 소싱 요청</h1>
          <p>
            제품과 공급사 조건을 확인하고 수량, 납기, 기술 요구사항을 입력하면
            관련 공급사 후보와 함께 RFQ를 구성합니다.
          </p>
        </div>

        <div className="rfqIntroMeta">
          <span>SELECTED PRODUCT</span>
          <strong>{selectedProduct.name}</strong>
          <small>{selectedProduct.process} · {selectedProduct.supplier}</small>
        </div>
      </header>

      <div className="steps rfqSteps">
        <Step n="01" t="Request Target" s="제품 / 공급사" />
        <Step n="02" t="Requirements" s="수량 / 기술 사양" />
        <Step n="03" t="Sourcing" s="납기 / 매칭" />
        <Step n="04" t="Contact" s="회사 / 담당자" />
      </div>

      <div className="rfqGrid rfqExperienceGrid">
        <section className="rfqFormColumn">
          <div className="card formCard rfqSectionCard">
            <SectionHeading
              n="01"
              eyebrow="REQUEST TARGET"
              title="요청 대상"
              description="견적을 요청할 제품과 우선 검토 공급사를 선택합니다."
            />

            <label className="rfqField">
              <span>제품</span>
              <select
                value={selectedProduct.slug}
                onChange={(event) => setProductSlug(event.target.value)}
              >
                {products.map((item) => (
                  <option value={item.slug} key={item.slug}>
                    {item.name} · {item.process}
                  </option>
                ))}
              </select>
            </label>

            <div className="selectedProduct rfqSelectedTarget">
              <div className="chipIcon">▥</div>
              <div>
                <small>SELECTED PRODUCT</small>
                <strong>{selectedProduct.name}</strong>
                <span>
                  {selectedProduct.category} · {selectedProduct.process} · {selectedProduct.supplier}
                </span>
              </div>
            </div>

            <label className="rfqField">
              <span>우선 검토 공급사</span>
              <select
                value={preferredSupplierSlug}
                onChange={(event) => setPreferredSupplierSlug(event.target.value)}
              >
                <option value="">제품 기본 공급사 / 자동 매칭</option>
                {suppliers.map((item) => (
                  <option value={item.slug} key={item.slug}>
                    {item.name} · {item.region}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="card formCard rfqSectionCard">
            <SectionHeading
              n="02"
              eyebrow="TECHNICAL REQUIREMENTS"
              title="기술 요구사항"
              description="구매 수량과 제품의 적용 조건을 입력합니다."
            />

            <div className="formTwo rfqFieldGrid">
              <label className="rfqField">
                <span>요청 수량</span>
                <input value={qty} onChange={(event) => setQty(event.target.value)} inputMode="numeric" required />
              </label>

              <label className="rfqField">
                <span>단위</span>
                <select value={unit} onChange={(event) => setUnit(event.target.value)}>
                  <option>EA</option>
                  <option>PCS</option>
                  <option>SET</option>
                  <option>LOT</option>
                </select>
              </label>

              <label className="rfqField">
                <span>적용 공정</span>
                <input value={selectedProduct.process} readOnly />
              </label>

              <label className="rfqField">
                <span>소재</span>
                <input value={selectedProduct.material} readOnly />
              </label>
            </div>

            <label className="rfqField">
              <span>상세 기술 요구사항</span>
              <textarea
                value={requirement}
                onChange={(event) => setRequirement(event.target.value)}
                placeholder="치수, 사용 환경, 장비 모델, 인증 요건, 요구 사양 등 필요한 내용을 입력하세요."
              />
            </label>

            <div className="rfqRequirementHint">
              <strong>작성 Tip</strong>
              <span>장비 모델 · 사용 위치 · 치수 · 순도 · 인증조건을 함께 적으면 공급사 검토가 쉬워집니다.</span>
            </div>
          </div>

          <div className="card formCard rfqSectionCard">
            <SectionHeading
              n="03"
              eyebrow="DELIVERY & SOURCING"
              title="납기 및 공급사 매칭"
              description="희망 납기를 지정하고 현재 조건에서 연결되는 공급사 후보를 확인합니다."
            />

            <div className="formTwo rfqFieldGrid">
              <label className="rfqField">
                <span>목표 납기</span>
                <input
                  type="date"
                  value={due}
                  onChange={(event) => setDue(event.target.value)}
                  required
                />
              </label>

              <div className="rfqMatchMetric">
                <span>MATCH CANDIDATES</span>
                <strong>{candidates.length}</strong>
                <small>현재 제품·공정 기준</small>
              </div>
            </div>

            <div className="rfqCandidatePanel">
              <div className="rfqCandidateHead">
                <div>
                  <small>SUPPLIER MATCHING</small>
                  <strong>예상 매칭 공급사</strong>
                </div>
                <span>{candidates.length} candidates</span>
              </div>

              <div className="rfqCandidates rfqCandidateList">
                {candidates.length ? (
                  candidates.map((item) => (
                    <span key={item.slug}>
                      {item.name}
                      {item.verified ? " ✓" : ""}
                    </span>
                  ))
                ) : (
                  <span>조건에 맞는 공개 공급사를 추가 확인해야 합니다.</span>
                )}
              </div>

              <p>
                제품의 공급사 연결 정보와 적용 공정을 기준으로 후보를 구성하는 Demo 매칭입니다.
              </p>
            </div>
          </div>

          <div className="card formCard rfqSectionCard">
            <SectionHeading
              n="04"
              eyebrow="CONTACT INFORMATION"
              title="회사 및 담당자 정보"
              description="RFQ 회신과 소싱 협의를 위한 기본 연락처입니다."
            />

            <div className="formTwo rfqFieldGrid">
              <label className="rfqField">
                <span>회사명</span>
                <input value={company} onChange={(event) => setCompany(event.target.value)} required />
              </label>

              <label className="rfqField">
                <span>담당자</span>
                <input value={contact} onChange={(event) => setContact(event.target.value)} required />
              </label>

              <label className="rfqField">
                <span>연락처</span>
                <input value={phone} onChange={(event) => setPhone(event.target.value)} required />
              </label>

              <label className="rfqField">
                <span>이메일</span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </label>
            </div>

            <div className="upload rfqUpload">
              <span className="rfqUploadIcon">＋</span>
              <div>
                <strong>도면 / 사양서 / 구매요청서</strong>
                <small>포트폴리오 Demo에서는 실제 파일 전송 없이 UI만 제공합니다.</small>
              </div>
            </div>
          </div>
        </section>

        <aside className="rfqSummary card rfqSummaryV2">
          <div className="rfqSummaryHeader">
            <div>
              <span>RFQ SUMMARY</span>
              <h2>요청 요약</h2>
            </div>
            <span className="rfqSummaryStatus">Draft</span>
          </div>

          <div className="selectedProduct rfqSummaryProduct">
            <div className="chipIcon">▥</div>
            <div>
              <small>PRODUCT</small>
              <strong>{selectedProduct.name}</strong>
              <span>{selectedProduct.category}</span>
            </div>
          </div>

          <dl className="rfqSummaryList rfqSummaryListV2">
            <div><dt>Quantity</dt><dd>{qty || "-"} {unit}</dd></div>
            <div><dt>Target Date</dt><dd>{due || "미정"}</dd></div>
            <div><dt>Process</dt><dd>{selectedProduct.process}</dd></div>
            <div><dt>Material</dt><dd>{selectedProduct.material}</dd></div>
            <div>
              <dt>Supplier</dt>
              <dd>
                {preferredSupplierSlug
                  ? suppliers.find((item) => item.slug === preferredSupplierSlug)?.name ?? selectedProduct.supplier
                  : selectedProduct.supplier}
              </dd>
            </div>
          </dl>

          <div className="rfqSummaryMatch">
            <span>SUPPLIER MATCH</span>
            <div>
              <strong>{candidates.length}</strong>
              <small>candidate suppliers</small>
            </div>
          </div>

          <div className="rfqCandidates rfqSummaryCandidates">
            {candidates.length ? (
              candidates.map((item) => (
                <span key={item.slug}>
                  {item.name}
                  {item.verified ? " ✓" : ""}
                </span>
              ))
            ) : (
              <span>추가 검토 필요</span>
            )}
          </div>

          <div className="rfqSummaryNotice">
            제출 후 My Desk에서 RFQ 상태와 요청 정보를 다시 확인할 수 있습니다.
          </div>

          {submissionError && <p className="rfqError">{submissionError}</p>}

          <button className="btn primary full rfqSubmitButton" type="submit" disabled={submitting}>
            {submitting ? "저장 중..." : "RFQ 제출하기"}
          </button>

          <small className="rfqSummaryFootnote">
            Demo 환경에서는 설정된 데이터 소스에 따라 PostgreSQL 또는 Local Storage에 저장됩니다.
          </small>
        </aside>
      </div>

      <div className="rfqMobileBar rfqMobileBarV2">
        <div>
          <small>{selectedProduct.name}</small>
          <strong>{qty || "-"} {unit}</strong>
        </div>
        <button type="submit" disabled={submitting}>
          {submitting ? "저장 중..." : "RFQ 제출"}
        </button>
      </div>
    </form>
  );
}

function Step({
  n,
  t,
  s,
}: {
  n: string;
  t: string;
  s: string;
}) {
  return (
    <div className="stepCard">
      <span>{n}</span>
      <div>
        <strong>{t}</strong>
        <small>{s}</small>
      </div>
    </div>
  );
}

function SectionHeading({
  n,
  eyebrow,
  title,
  description,
}: {
  n: string;
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rfqSectionHeading">
      <span>{n}</span>
      <div>
        <small>{eyebrow}</small>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    </div>
  );
}
