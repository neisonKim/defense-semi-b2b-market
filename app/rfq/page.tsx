import RFQForm from "./RFQForm";

export default function RFQPage(){
  return (
    <div className="container section rfqPage">
      <p className="crumb">홈 / RFQ / 견적 요청하기</p>
      <div className="pageHeader">
        <div>
          <h1>견적 요청하기 (RFQ)</h1>
          <p>제품 상세 또는 공급사 페이지에서 들어온 정보를 이어받아 3단계로 RFQ를 작성하고 Demo 상태로 저장합니다.</p>
        </div>
      </div>
      <RFQForm />
    </div>
  );
}
