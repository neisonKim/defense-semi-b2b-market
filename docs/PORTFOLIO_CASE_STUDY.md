# DEFENSE SEMI B2B MARKET — Portfolio Case Study

## 1. Project Overview

**Project**: DEFENSE SEMI B2B MARKET  
**Type**: Semiconductor B2B Marketplace / Manufacturing Intelligence / Sourcing UX  
**Role**: Product Planning, Information Architecture, UX/UI Design, Content Modeling, Front-end Implementation, Database Integration  
**Stack**: Next.js, React, TypeScript, PostgreSQL, Prisma, Zod  
**Version**: 1.0 Portfolio MVP

### One-line summary
반도체 엔지니어와 구매 담당자가 기술 지식에서 출발해 공정, 제품, 공급사, RFQ까지 연결할 수 있도록 설계한 B2B 소싱 플랫폼입니다.

---

## 2. Problem

반도체 B2B 구매에서는 단순 제품 검색만으로 의사결정이 끝나지 않습니다. 사용자는 다음을 함께 확인해야 합니다.

- 어떤 공정에 쓰이는가
- 어떤 장비/위치에 적용되는가
- 어떤 소재와 제조 방식인가
- 어떤 공급사가 취급하는가
- 기술적으로 검증된 정보인가
- 실제 문의/RFQ로 어떻게 이어지는가

따라서 일반 쇼핑몰의 `Category → Product → Cart` 구조보다 다음 흐름이 적합하다고 판단했습니다.

```text
Knowledge → Problem → Process → Product → Supplier → RFQ
```

---

## 3. Product Strategy

### 핵심 포지셔닝
**Semiconductor Manufacturing Intelligence + Sourcing Platform**

### 핵심 전환
구매 버튼이 아니라 **RFQ(Request for Quotation)** 를 주요 conversion으로 설정했습니다.

### 핵심 엔터티
- Process
- Product
- Supplier
- SupplierProduct
- KnowledgeArticle
- RFQ
- RFQItem
- RFQSupplierMatch

Product와 Supplier는 1:1로 고정하지 않고 확장 가능한 N:M 관계를 염두에 두었습니다.

---

## 4. UX / IA

### Public
- Marketplace Home
- Products
- Product Detail
- Suppliers
- Supplier Detail
- Knowledge
- Knowledge Detail
- RFQ
- My Desk

### Admin
- Product Management
- Supplier Management
- Knowledge Management
- Verification / Publishing Workflow
- DB QA

### Responsive strategy
- Desktop: 정보 밀도와 비교 탐색 중심
- Tablet: 2열 축소 및 navigation overlay
- Mobile: 1열 카드, bottom navigation, sticky RFQ CTA

QA 기준 viewport:
`1440 / 1280 / 1024 / 768 / 430 / 390 / 375`

---

## 5. Data Architecture

제품 데이터는 제품명 하나에 모든 속성을 섞지 않고 분리했습니다.

```text
Product Name
Product Category
Material
Manufacturing Method
Application Process
Application Equipment
Application Location
Function
```

기술 탐색 구조 예시:

```text
PROCESS Etching
→ TECHNOLOGY Plasma Etching
→ EQUIPMENT Dry Etcher
→ COMPONENT Focus Ring
→ MATERIAL CVD-SiC
→ SUPPLIER
```

검증 메타데이터는 다음 확장을 고려했습니다.

```text
Source URL
Source Type
Last Verified
Verified By
Verification Status
```

Publishing workflow:

```text
Draft → Review → Technical Review → Verified → Published → Needs Update
```

---

## 6. Engineering Implementation

### Front end
- Next.js App Router
- TypeScript
- Responsive CSS
- Product/Supplier/Knowledge catalog filtering
- Dynamic detail routes

### Back end / Data
- Next.js Route Handlers
- Prisma ORM
- PostgreSQL
- Zod RFQ validation

### Data mode
환경변수로 mock/local과 database 기반 동작을 분리했습니다.

```env
NEXT_PUBLIC_DATA_SOURCE="database"
```

Database mode flow:

```text
Admin CMS
→ Next.js API
→ Prisma
→ PostgreSQL
→ Published Public Pages
```

RFQ flow:

```text
Product Detail
→ RFQ Form
→ Zod Validation
→ POST /api/rfq
→ Prisma
→ PostgreSQL Rfq / RfqItem / RfqSupplierMatch
```

---

## 7. Visual System

- Navy / Blue / Cyan 중심의 semiconductor technology tone
- AI-generated semiconductor visual assets
- Product photography는 `contain`, process/editorial imagery는 `cover`
- Product / Process / Supplier / Knowledge별 의미 기반 이미지 매칭
- 공통 spacing / typography / card hierarchy / CTA priority 통일

---

## 8. QA

### Database QA
`npm.cmd run qa:db`

검사 항목:
- PostgreSQL 연결
- Published Product / Supplier / Knowledge
- Product ↔ Supplier 관계
- Knowledge ↔ Product 관계
- RFQ / RFQ Item / Supplier Match

### Responsive QA
- horizontal overflow
- sticky CTA collision
- long title / badge wrapping
- table overflow
- card image crop
- tablet navigation

---

## 9. Outcome

Version 1.0에서는 아래 end-to-end 흐름을 하나의 prototype/service codebase에서 구현했습니다.

```text
Technical Knowledge
→ Product Discovery
→ Supplier Discovery
→ RFQ Submission
→ PostgreSQL Storage
→ Admin Management
```

프로젝트의 핵심 성과는 단순 웹 화면 제작이 아니라, **반도체 B2B 도메인을 데이터 구조와 사용자 여정으로 변환하고 실제 동작하는 서비스 구조까지 연결한 것**입니다.

---

## 10. What I Would Build Next

Version 1.1 이후에는 실제 운영을 위해 다음을 추가할 수 있습니다.

- Authentication / Authorization
- Buyer / Supplier / Admin roles
- User-specific My Desk
- Supplier portal
- RFQ email / notification workflow
- Audit logs
- Deployment / monitoring / backup

이 기능들은 Portfolio MVP의 핵심 목표와 분리해 후속 확장 범위로 정의했습니다.
