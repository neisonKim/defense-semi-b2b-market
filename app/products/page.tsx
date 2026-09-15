import { SectionTitle } from "@/components/UI";
import ProductCatalog from "./ProductCatalog";

export default function ProductsPage() {
  return (
    <div className="container section">
      <p className="crumb">홈 / Marketplace / Products</p>
      <div className="pageHeader">
        <h1>제품 탐색</h1>
        <p>제품명뿐 아니라 공정, 소재, 장비, 공급사까지 한 번에 찾고 바로 Supplier와 RFQ로 연결합니다.</p>
      </div>

      <section className="section">
        <SectionTitle
          title="Published 제품 카탈로그"
          sub="Admin CMS에서 Published 처리된 제품이 이 화면에 자동 반영됩니다. 현재 단계에서는 Local Storage를 공개 데이터 소스로 사용합니다."
        />
        <ProductCatalog />
      </section>
    </div>
  );
}
