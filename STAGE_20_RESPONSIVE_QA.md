# Stage 20 — Final Responsive QA

목표: 기능을 추가하지 않고 1440 / 1280 / 1024 / 768 / 430 / 390 / 375px에서 레이아웃 깨짐, 가로 스크롤, 과도한 밀도, 모바일 고정 CTA 충돌을 정리합니다.

## 적용 범위
- 공통 overflow / min-width 안전 처리
- 1024px Tablet 레이아웃
- 900px Product Detail / Admin 중간 breakpoint
- 767px Mobile safe-area 및 fixed navigation
- 430 / 390 / 375px 소형 스마트폰 세부 조정
- Product / Supplier / Knowledge / RFQ / My Desk / Admin의 긴 텍스트 wrapping

## 수동 QA 순서
각 폭에서 아래 페이지를 확인합니다.

1. `/`
2. `/products`
3. `/products/cvd-sic-focus-ring`
4. `/suppliers`
5. `/suppliers/tck`
6. `/knowledge`
7. `/rfq`
8. `/my-desk`
9. `/admin`

## PASS 기준
- 페이지 전체에 의도하지 않은 가로 스크롤이 없음
- Header / Hero / Section 좌우 시작선이 일치
- 1024px 이하에서 메뉴가 hamburger navigation으로 전환됨
- 768px 전후에서 Product Detail / Admin이 과도하게 좁아지지 않음
- 430 / 390 / 375px에서 Hero 제목, 카드, form, badge가 viewport 밖으로 나가지 않음
- Mobile bottom navigation과 Product/Supplier/RFQ sticky CTA가 겹치지 않음
- Admin table은 페이지 전체를 밀지 않고 table wrapper 안에서만 가로 스크롤됨
- 이미지가 찌그러지지 않고 Stage 18/19의 contain/cover 규칙을 유지

## DB 영향
없음. PostgreSQL, Prisma, Admin CRUD, RFQ API, seed 데이터는 변경하지 않습니다.
