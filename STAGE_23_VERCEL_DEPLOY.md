# Stage 23 — Vercel + Cloud PostgreSQL Deployment

## 목적
Version 1.0 Portfolio MVP를 공개 URL로 배포하기 위한 안전 패치입니다.

## Production safety defaults
- `PORTFOLIO_DEMO_MODE=true`
- `ADMIN_WRITE_ENABLED=false`
- `RFQ_WRITE_ENABLED=false`

따라서 공개 배포 시 관리자 CRUD는 읽기 전용이며 RFQ 폼은 성공 UX만 시뮬레이션하고 개인정보를 DB에 저장하지 않습니다. 로컬 개발(`npm run dev`)은 기존 CRUD/RFQ DB 저장이 유지됩니다.

## Build readiness
`package.json`에 다음을 추가했습니다.

```json
"build": "prisma generate && next build",
"postinstall": "prisma generate"
```

## Vercel environment variables
```env
DATABASE_URL=<cloud-postgres-connection-string>
NEXT_PUBLIC_DATA_SOURCE=database
NEXT_PUBLIC_APP_URL=https://YOUR-PROJECT.vercel.app
PORTFOLIO_DEMO_MODE=true
ADMIN_WRITE_ENABLED=false
RFQ_WRITE_ENABLED=false
NEXT_PUBLIC_PORTFOLIO_DEMO_MODE=true
```

## Cloud DB first-time setup
현재 Portfolio MVP는 migration 파일 대신 `prisma db push` workflow를 사용합니다. Cloud `DATABASE_URL`을 임시 환경변수로 설정한 뒤:

```powershell
npm.cmd run db:generate
npm.cmd run db:push
npm.cmd run db:seed
npm.cmd run qa:db
```

운영 SaaS로 전환할 때는 Prisma migrations 기반 배포로 변경하는 것을 권장합니다.
