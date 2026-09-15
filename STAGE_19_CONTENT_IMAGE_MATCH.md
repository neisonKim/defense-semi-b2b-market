# Stage 19 — Content ↔ Image Matching

## 목표
Stage 17~18에서 삽입한 AI 이미지 자산을 단순 fallback 방식이 아니라 실제 Product / Process / Supplier / Knowledge 의미와 명시적으로 연결합니다.

## 핵심 변경

### Product
- CVD-SiC Focus Ring → focus-ring.webp
- Plasma Etch Equipment → plasma-etch.webp
- High Purity Process Material → tim-material.webp (material/editorial proxy)
- Lithography System → wafer-inspection.webp
- Thermal Interface Material → tim-material.webp
- Underfill Material → advanced-packaging.webp
- Thermal Transient Tester → thermal-tester.webp
- CFD Thermal Simulation → cfd-thermal-simulation.webp

### Knowledge
- CFD 기초 → CFD simulation
- CFD 수렴 점검 → Thermal management
- Thermal Transient Testing → Thermal tester
- HBM / 2.5D / 3D → Advanced packaging
- Dry Etching / Focus Ring → Plasma etch
- RFQ / Sourcing Data → Wafer / semiconductor manufacturing visual

유사한 두 CFD 콘텐츠에 같은 사진을 반복하지 않고, 수렴 점검 글은 thermal engineering 계열 이미지로 분리했습니다.

### Supplier
Supplier slug 기준으로 대표 역량 이미지를 연결합니다.
- TCK → Focus Ring
- Tokyo Electron → Plasma Etch
- Entegris → Material
- ASML → Wafer / Lithography
- Delta ES → CFD
- Thermal Demo → Thermal Management
- Packaging Demo → Advanced Packaging

Supplier Directory에도 대표 이미지를 추가했습니다.

### Product Detail Gallery
제품별로 4개의 연관 이미지를 명시적으로 지정했습니다. 첫 이미지는 제품/솔루션 자체, 이후 이미지는 적용 공정·검증·열관리 등 인접 맥락을 보여줍니다.

## 변경하지 않은 것
- PostgreSQL schema
- Prisma
- Admin CRUD
- RFQ 저장
- My Desk 저장 구조
- Published workflow

## 적용
현재 Stage 18 프로젝트 루트에 Stage 19 patch 압축 내용을 덮어씁니다.

```powershell
npm.cmd run dev
```

`npm install`, `db:push`, `db:seed`는 필요하지 않습니다.

## QA
아래 페이지를 확인합니다.

1. `/`
   - Process 이미지 의미 일치
   - Product 이미지 일치
   - Knowledge 6개가 과도하게 같은 이미지로 반복되지 않는지 확인

2. `/products`
   - Focus Ring / Etch / Lithography / TIM / Underfill / Tester / CFD 매칭 확인

3. `/suppliers`
   - 공급사별 대표 역량 이미지 확인

4. `/suppliers/tck`
   - Focus Ring 이미지 확인

5. `/suppliers/delta-es`
   - CFD 계열 이미지 확인

6. `/knowledge`
   - 6개 콘텐츠 이미지 주제 일치 확인

7. `/products/cvd-sic-focus-ring`
   - Gallery 첫 이미지가 Focus Ring이며 이후 Etch / Wafer / Reliability 맥락으로 이어지는지 확인

## Stage 20
다음 단계는 최종 Responsive QA입니다.
- 1440 / 1280 / 1024 / 768 / 430 / 390 / 375
- overflow
- sticky/fixed CTA 충돌
- 이미지 crop
- 카드 높이
- header/mobile navigation
- RFQ form
- Admin table horizontal scroll
