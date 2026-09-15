# STAGE 08 — Final QA / Responsive QA

## 목적
PostgreSQL + Prisma 실제 DB 연결 전에 Mock Data / Local Storage 기반 MVP의 전체 사용자 흐름과 반응형 동작을 최종 점검한다.

## 이번 단계에서 수정한 항목

### 1. CMS Published Product → RFQ 연결 수정
이전 RFQ는 `data/mock.ts`의 Seed Product만 읽었다.
이제 RFQ가 `usePublicData()`를 사용하므로 Admin CMS에서 새로 등록 후 Published 처리한 Product도 바로 RFQ에서 선택된다.

흐름:
`Admin → Published Product → Product Detail → RFQ → My Desk`

### 2. CMS Published Data → My Desk 연결 수정
My Desk가 Seed Product / Supplier / Knowledge만 조회하던 문제를 수정했다.
이제 공개 상태의 CMS 데이터를 기준으로 관심 제품, 관심 공급사, 저장 Knowledge를 표시한다.

### 3. 공개 데이터 Hydration 상태 처리
새 CMS 데이터의 상세 URL에 직접 접근했을 때 잠깐 `찾을 수 없음`이 보이는 현상을 줄이기 위해 Public Data에 `ready` 상태를 추가했다.

### 4. 메인 통합 검색 연결
메인 검색창 입력값을 `/products?q=...`로 전달하고 Product Catalog가 Query String을 읽어 실제 필터에 적용한다.

### 5. Admin Slug 중복 방지
Product / Supplier / Knowledge에서 동일한 Slug를 중복 등록하지 못하도록 방어 로직을 추가했다.

### 6. Supplier 관계 무결성 보완
연결된 Product가 존재하는 Supplier를 Admin에서 바로 삭제하지 못하도록 처리했다.

### 7. Tablet Navigation 보완
768~1199px에서 Desktop Navigation이 사라지는데 대체 메뉴가 없던 문제를 수정했다.
Tablet / Mobile용 Hamburger Drawer를 추가했다.

### 8. Mobile Sticky CTA 보완
Product / Supplier / RFQ 하단 고정 CTA와 Mobile Bottom Navigation이 겹치지 않도록 하단 여백을 조정했다.
저장 버튼은 모바일에서 `☆ / ★` 아이콘형으로 유지한다.

### 9. Local Storage 방어 처리
즐겨찾기 및 RFQ 저장 데이터 JSON이 손상되어도 화면이 깨지지 않도록 안전한 parsing을 적용했다.

## QA 확인 주소
- `/`
- `/products`
- `/products/cvd-sic-focus-ring`
- `/suppliers`
- `/suppliers/tck`
- `/knowledge`
- `/knowledge/what-is-cfd`
- `/rfq`
- `/my-desk`
- `/admin`

## 권장 화면 폭
- 1440px
- 1024px
- 768px
- 430px
- 390px
- 375px

## 반드시 테스트할 시나리오
1. Admin에서 Supplier 등록 → Published
2. Admin에서 해당 Supplier 이름을 사용한 Product 등록 → Published
3. `/products`에서 새 Product 확인
4. Product Detail → Supplier Detail 확인
5. Product Detail → RFQ 이동 시 새 Product 자동 선택 확인
6. RFQ 제출 → My Desk에서 내역 확인
7. Product / Supplier / Knowledge 저장 → My Desk 확인
8. Product 상태를 Review로 변경 → 공개 페이지에서 사라지는지 확인
9. 동일 Slug 등록 시 차단되는지 확인
10. 768px에서 Hamburger Navigation 동작 확인

## 현재 단계
포트폴리오용 Mock MVP: 약 95%

다음 단계는 선택 사항이다.
- 포트폴리오 완성: 실제 DB 없이 종료 가능
- 실제 서비스 개발: Prisma + PostgreSQL로 Local Storage를 교체
