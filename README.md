# DEFENSE SEMI B2B MARKET — Version 1.0 Portfolio MVP

**Semiconductor Manufacturing Intelligence + Sourcing Platform**

반도체 공정·기술 지식에서 Product, Supplier, RFQ까지 이어지는 B2B sourcing workflow를 Next.js + PostgreSQL + Prisma로 구현한 포트폴리오 프로젝트입니다.

## Core Flow
```text
Knowledge → Engineering Problem → Process / Technology → Product → Supplier → RFQ → Data
```

## Included
- Responsive Marketplace Home
- Product Catalog / Product Detail
- Supplier Directory / Supplier Detail
- Knowledge Hub / Article Detail
- Search / Filter
- Product ↔ Supplier relation UX
- Knowledge ↔ Product relation UX
- 3-step RFQ
- My Desk
- Admin CMS Product / Supplier / Knowledge CRUD
- Published workflow
- PostgreSQL + Prisma
- RFQ / RfqItem / RfqSupplierMatch DB storage
- DB QA script
- AI semiconductor visual assets
- Responsive QA for 1440 / 1280 / 1024 / 768 / 430 / 390 / 375

## Run
```bash
cp .env.example .env
npm install
npm run dev
```

Windows PowerShell:
```powershell
npm.cmd install
npm.cmd run dev
```

## PostgreSQL Mode
`.env`:
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/defense_semi?schema=public"
NEXT_PUBLIC_DATA_SOURCE="database"
```

Setup:
```powershell
npm.cmd run db:setup
```

DB QA:
```powershell
npm.cmd run qa:db
```

Prisma Studio:
```powershell
npm.cmd run db:studio
```

## Architecture
```text
Next.js UI
→ Route Handlers / API
→ Prisma ORM
→ PostgreSQL
```

Database mode에서는 Published Product / Supplier / Knowledge를 PostgreSQL에서 조회하며 RFQ를 실제 DB에 저장합니다. Database unavailable 시 public catalog는 mock data fallback을 사용할 수 있습니다.

## Portfolio Documentation
- `STAGE_21_PORTFOLIO_RELEASE.md`
- `docs/PORTFOLIO_CASE_STUDY.md`
- `docs/PORTFOLIO_SUMMARY_KR.md`
- `docs/PORTFOLIO_COPY.md`
- `docs/ERD.md`
- `docs/API_SPEC.md`
- `docs/DEVELOPMENT_SPEC.md`

## Version 1.0 Scope
Version 1.0 is a **Portfolio MVP**, not a production SaaS release.

Intentional follow-up scope:
- Authentication / Authorization
- Buyer / Supplier / Admin roles
- User-specific server-side My Desk
- Email / notification workflow
- Supplier Portal
- Production deployment / monitoring / backup

## Version
`1.0.0`
