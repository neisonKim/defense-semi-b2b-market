import MyDeskClient from "./MyDeskClient";

export default function MyDeskPage() {
  return (
    <div className="container section myDeskPage">
      <p className="crumb">홈 / My Desk</p>
      <section className="card myDeskHero">
        <div>
          <p className="kicker">PERSONAL SOURCING WORKSPACE</p>
          <h1>My Desk</h1>
          <p>RFQ 요청, 관심 제품, 관심 공급사, 저장한 Knowledge를 한곳에서 관리하는 개인 업무 공간입니다.</p>
        </div>
        <div className="myDeskFlow"><span>Search</span><b>→</b><span>Product</span><b>→</b><span>Supplier</span><b>→</b><span>RFQ</span><b>→</b><span>My Desk</span></div>
      </section>
      <MyDeskClient />
    </div>
  );
}
