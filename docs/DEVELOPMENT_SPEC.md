# DEFENSE SEMI B2B MARKET 개발 명세서 v0.2

## 1. 서비스 정의
반도체 제조산업의 기술·공정·제품·공급사·문서·RFQ를 연결하는 B2B 소싱 플랫폼.

핵심 사용자 흐름:
`Search / Engineering Problem → Product → Supplier → RFQ → Supplier Match → Quote → My Desk`

## 2. 권장 기술 스택
- Frontend: Next.js App Router + TypeScript
- Database: PostgreSQL
- ORM: Prisma
- Validation: Zod
- File Storage: S3 / Cloudflare R2 / Firebase Storage 중 택1
- Auth: Auth.js / Clerk / Firebase Auth 중 택1
- Hosting: Vercel
- Search: 초기 PostgreSQL Full Text + pg_trgm, 확장 시 Meilisearch / Typesense / Elasticsearch
- Analytics: GA4 + 내부 이벤트 테이블 또는 PostHog

### PostgreSQL을 권장하는 이유
1. Product ↔ Supplier가 N:M 관계임.
2. Product ↔ Process, Material, Tag도 N:M 구조임.
3. RFQ 하나가 여러 Supplier로 Match됨.
4. 필터가 Category + Process + Material + Region + Verification + Availability처럼 복합 조건임.
5. CMS에서 Source / Revision / Verification History를 일관되게 관리해야 함.

## 3. 페이지 구조
- `/` Marketplace Home
- `/products/[slug]` Product Detail
- `/suppliers/[slug]` Supplier Detail
- `/rfq` RFQ Submission
- `/admin` Admin CMS Dashboard
- 추후 `/search`, `/process/[slug]`, `/knowledge/[slug]`, `/my-desk`, `/admin/products`, `/admin/suppliers` 추가

## 4. 핵심 데이터 엔티티
### Process
- id, slug, name, description

### Technology
- id, slug, name, description
- Process와 N:M

### Material
- id, slug, name, purity, description
- Technology와 N:M
- Product와 N:M

### ProductCategory
- 계층형 카테고리
- parentId로 상하위 구성

### Product
- name / slug
- category
- manufacturingMethod
- equipment
- applicationLocation
- functionSummary
- waferSize
- purity
- lifecycle
- sourceUrl
- lastVerifiedAt
- verificationStatus

### Supplier
- name / slug / legalName
- SupplierType
- regions
- website
- companyVerified
- productDataVerified
- documentVerified
- sourceUrl / lastVerifiedAt

### SupplierProduct
Product ↔ Supplier N:M 브리지.
- SKU
- Region
- Lead Time
- MOQ
- Authorized Status
- Price Type
- Price Range
- Availability
- Sample Available
- Customization

### KnowledgeArticle
- title / summary / content
- Product / Supplier / Process / Tag와 관계

### Document
- Datasheet / Catalog / Certificate / Drawing / Whitepaper
- Product / Supplier / Process에 연결

### RFQ
- company/contact/email/phone
- target date / target price
- application / requirements / certification
- shipping country / NDA

### RFQItem
RFQ 내 제품 단위 요구사항.

### RFQSupplierMatch
- Supplier별 Match Score
- Match Reason
- Status
- Quote Price
- Quote Lead Time

## 5. 데이터 검증 원칙
`Draft → Review → Technical Review → Verified → Published → Needs Update`

반드시 저장할 필드:
- Source URL
- Source Type
- Last Verified At
- Verified By
- Verification Status

### Verified와 Premium 분리
- Verified: 사실 검증 여부
- Premium: 유료 노출 상품
돈을 지불했다고 Verified Badge를 주지 않음.

## 6. Search / Filter 요구사항
초기 필터:
- Product Category
- Process
- Material
- Supplier Type
- Region
- Verification Status
- Availability
- Sample Available

### Zero Result Search
검색 결과가 0건인 키워드는 별도 Analytics 이벤트로 저장하여 다음 DB 구축 우선순위로 활용.

## 7. RFQ Matching 로직 v1
점수 예시:
- Product Category match: +30
- Process match: +25
- Region match: +15
- Supplier Type match: +10
- Verification complete: +10
- Sample / Customization capability: +5
- Availability: +5

`score >= 60`인 Supplier만 Candidate로 제시.
초기 MVP에서는 관리자 수동 승인 후 발송 가능.

## 8. API v1
### GET /api/products
목록 및 필터.

### GET /api/products/:slug
제품 상세 + SupplierProduct + Process + Material + Documents.

### GET /api/suppliers
공급사 검색.

### GET /api/suppliers/:slug
공급능력, 인증, 제품, 문서.

### POST /api/rfq
RFQ 생성.
필수: productId / quantity / company / email.

### POST /api/rfq/:id/match
관리자 또는 Match Engine이 Supplier Candidate 생성.

## 9. 권한 구조
### Visitor
검색, Product/Supplier 조회, 공개 문서 조회.

### Buyer
RFQ, Favorite, Compare, My Desk.

### Supplier
Company Profile, Product 제출, RFQ 응답.

### Technical Reviewer
Product / Document / Article 기술 검토.

### Admin
전체 CMS / Verification / RFQ Routing / Analytics.

## 10. 관리자 CMS 모듈
1. Dashboard
2. Process / Technology
3. Product Category
4. Material
5. Product
6. Supplier
7. Supplier Product
8. Knowledge
9. Document
10. RFQ
11. Verification Queue
12. Analytics
13. User / Role

## 11. MVP 범위
### Phase 1
- Product 100~200
- Supplier 20~50
- Process 10
- Category 30
- Knowledge 50~100
- Search/Filter
- Product/Supplier Detail
- RFQ
- Admin CMS 기본

### Phase 2
- Supplier Portal
- Compare
- Favorite
- My Desk
- RFQ Matching 자동화
- Newsletter / Lead Scoring

### Phase 3
- BOM Upload
- AI Sourcing Assistant
- Supply Chain Graph
- Supplier Analytics
- Market Intelligence

## 12. KPI
- Search Count
- Zero Result Search
- Product View
- Supplier View
- Datasheet Download
- Technical Inquiry
- RFQ Count
- Qualified RFQ
- RFQ Response Rate
- RFQ Match Rate
- Returning Buyer

North Star Metric: `Qualified RFQ / month`

## 13. 운영상 주의사항
- 샘플 데이터와 실제 제조사 정보를 구분.
- 실서비스 Product/Supplier 데이터는 공식 출처를 남김.
- CVD 등 제조방법과 Etching 등 적용공정을 필드 레벨에서 분리.
- 허위 인증 및 비공식 Authorized Distributor 표기를 방지.
- 공급사 연락처 공개 여부는 Supplier 동의/정책에 따라 처리.
