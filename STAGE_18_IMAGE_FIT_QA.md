# Stage 18 — Image Fit / Crop / Card Visual QA

## 목적
Stage 17에서 삽입한 AI 사진 자산을 실제 B2B 카드 UI에 맞게 정리합니다.

## 적용 규칙
- Focus Ring / TIM / Thermal Tester: `contain` — 제품이 잘리지 않음
- CFD / Etching / Advanced Packaging / Thermal / Wafer: `cover` — 카드 프레임을 가득 채움
- Product 카드: 16:10, 모바일 3:2
- Product Detail: 380px 데스크톱 / 270px 모바일
- Supplier Hero: 제품형 이미지는 contain, 현장형 이미지는 cover
- Process / Knowledge: 항상 cover

## 확인 화면
1. `/`
2. `/products`
3. `/products/cvd-sic-focus-ring`
4. `/products/thermal-transient-tester`
5. `/knowledge`
6. `/suppliers` 및 공급사 상세

## QA 기준
- 제품이 프레임 밖으로 잘리지 않는지
- 서로 다른 이미지가 카드 안에서 같은 높이로 보이는지
- 흰 배경 제품 사진이 카드 내부에서 과도하게 확대되지 않는지
- 공정/Knowledge 이미지는 빈 여백 없이 꽉 차는지
- 모바일에서 제품 이미지가 너무 작아지거나 세로로 길어지지 않는지

DB / Prisma / RFQ 로직은 변경하지 않습니다.
