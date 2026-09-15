# Stage 15 — Visual / Icon Unification + Portfolio Screen QA

## 목적
Stage 12~14에서 정리한 spacing, typography, card, color system 위에
마지막으로 visual asset와 icon language를 통일합니다.

## 이번 패치에서 변경되는 것
- Hero / Product / Supplier / Knowledge placeholder visual tone 통일
- Product / Knowledge thumbnail을 16:9 비율로 통일
- Brand mark / process index / RFQ step / relation icon의 크기·border·radius 통일
- Supplier logo placeholder 톤 통일
- Product detail의 제품 비주얼 영역 정리
- Admin chart visual을 공개 페이지와 같은 blue/cyan system으로 통일
- Tablet / Mobile visual height 재조정
- prefers-reduced-motion 대응

## 기능 영향
없음. CSS-only visual refinement입니다.

## 확인할 URL
- /
- /products
- /products/cvd-sic-focus-ring
- /suppliers
- /suppliers/tck
- /knowledge
- /rfq
- /admin

## QA 해상도
- 1440
- 1280
- 1024
- 768
- 430
- 390
- 375

## 체크포인트
1. Product 카드 thumbnail 높이가 동일한가
2. Knowledge 카드 thumbnail 비율이 동일한가
3. Supplier logo가 제품 visual보다 튀지 않는가
4. Hero / Supplier / Knowledge visual이 동일한 브랜드 계열로 보이는가
5. 모바일에서 이미지가 과도하게 높지 않은가
6. CTA가 visual보다 항상 높은 우선순위를 갖는가
7. Admin 화면이 별개의 제품처럼 보이지 않고 같은 플랫폼으로 느껴지는가
