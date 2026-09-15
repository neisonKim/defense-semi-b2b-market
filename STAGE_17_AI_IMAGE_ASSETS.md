# DEFENSE SEMI B2B MARKET — Stage 17 AI Image Assets

이번 패치는 웹페이지 시안 이미지를 넣는 것이 아니라, 실제 카드/상세페이지/히어로에서 사용하는 독립 사진형 이미지 파일을 삽입합니다.

## 적용 이미지

- `public/images/ai/focus-ring.webp`
- `public/images/ai/tim-material.webp`
- `public/images/ai/thermal-tester.webp`
- `public/images/ai/cfd-thermal-simulation.webp`
- `public/images/ai/plasma-etch.webp`
- `public/images/ai/advanced-packaging.webp`
- `public/images/ai/thermal-management.webp`
- `public/images/ai/wafer-inspection.webp`

원본 PNG는 웹 성능을 위해 WebP로 최적화했습니다.

## 적용 위치

1. 메인 Hero — Wafer Inspection
2. 공정 카드 — Etching / Packaging / Thermal / Reliability 등
3. 메인 Product 카드
4. Products Catalog 카드
5. Product Detail 이미지 갤러리
6. Supplier Detail 대표 비주얼
7. 메인 Knowledge 카드
8. Knowledge Catalog 카드
9. Knowledge Detail Hero

## 데이터 구조 변경 여부

없습니다. PostgreSQL / Prisma schema / Admin CRUD / RFQ 로직은 변경하지 않습니다.
이미지는 제품명·카테고리·공정 문자열에 따라 UI에서 자동 매칭됩니다.

## 적용 방법

이 패치의 내용을 현재 프로젝트 최상위 폴더에 그대로 덮어씁니다.

그 다음:

```powershell
npm.cmd run dev
```

`npm install`, `db:push`, `db:seed`는 다시 할 필요가 없습니다.

## 확인 페이지

- `/`
- `/products`
- `/products/cvd-sic-focus-ring`
- `/products/tim-material`
- `/products/thermal-transient-tester`
- `/products/cfd-thermal-simulation`
- `/suppliers/tck`
- `/knowledge`
- `/knowledge/plasma-etch-focus-ring`
- `/knowledge/hbm-thermal-management`

