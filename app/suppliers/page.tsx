import { SectionTitle } from "@/components/UI";
import SupplierDirectory from "./SupplierDirectory";

export default function SuppliersPage() {
  return (
    <div className="container section">
      <p className="crumb">홈 / Marketplace / Suppliers</p>
      <div className="pageHeader">
        <h1>공급사 탐색</h1>
        <p>회사소개보다 공급 능력, 적용 공정, 연결 제품, Verified 상태를 먼저 확인하는 B2B 공급사 디렉터리입니다.</p>
      </div>

      <section className="section">
        <SectionTitle title="Published 공급사 디렉터리" sub="Admin CMS의 발행 상태와 공개 Supplier Directory가 직접 연결되는 단계입니다." />
        <SupplierDirectory />
      </section>
    </div>
  );
}
