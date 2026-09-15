"use client";

import { Badge } from "@/components/UI";
import { usePublicData } from "@/lib/publicData";
import KnowledgeCatalog from "./KnowledgeCatalog";

export default function KnowledgePage() {
  const { knowledge, source } = usePublicData();

  return (
    <div className="container section">
      <p className="crumb">홈 / Knowledge</p>
      <section className="knowledgeHero card">
        <div>
          <Badge kind="green">Engineering Knowledge Hub</Badge>
          <h1>기술 콘텐츠를 제품과 공급사까지 연결합니다.</h1>
          <p>단순한 블로그가 아니라 Knowledge → Process → Product → Supplier → RFQ로 이어지는 B2B 소싱 퍼널의 시작점입니다.</p>
        </div>
        <div className="knowledgeFlow">
          <span>Knowledge</span><b>→</b><span>Process</span><b>→</b><span>Product</span><b>→</b><span>Supplier</span><b>→</b><span>RFQ</span>
        </div>
      </section>

      <section className="section">
        <div className="publicSyncBanner">
          <span className={source !== "mock" ? "live" : "demo"}>●</span>
          <strong>{source === "database" ? `PostgreSQL Knowledge ${knowledge.length}개 연결됨` : source === "cms" ? `Published Knowledge ${knowledge.length}개 동기화 중` : "기본 Knowledge Mock Data 표시 중"}</strong>
          <small>Admin CMS에서 Published 처리하면 Knowledge Hub에 자동 공개됩니다.</small>
        </div>
        <KnowledgeCatalog articles={knowledge} />
      </section>
    </div>
  );
}
