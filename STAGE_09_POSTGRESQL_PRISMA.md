# Stage 09 — PostgreSQL + Prisma 실제 DB 연결

## 목표
Stage 08까지의 Mock / Local Storage MVP를 유지하면서 실제 PostgreSQL을 단계적으로 연결합니다.

이번 단계에서 DB로 전환되는 영역:
- 공개 Product 조회
- 공개 Supplier 조회
- 공개 Knowledge 조회
- RFQ 실제 저장
- DB Health Check

아직 Local Storage를 유지하는 영역:
- Admin CMS 등록/수정/삭제
- My Desk 즐겨찾기
- My Desk의 RFQ 목록은 DB 저장 후 브라우저 호환용 요약본도 함께 저장

Admin CMS DB CRUD는 Stage 10에서 전환합니다.

## 1. PostgreSQL 데이터베이스 준비
로컬 PostgreSQL 또는 PostgreSQL 호스팅 서비스 중 하나를 사용할 수 있습니다.

로컬 DB 이름 예시:

```sql
CREATE DATABASE defense_semi;
```

## 2. .env 생성
프로젝트 루트에서 `.env.example`을 복사하여 `.env`를 만듭니다.

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

`.env`에서 비밀번호를 실제 PostgreSQL 비밀번호로 바꿉니다.

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/defense_semi?schema=public"
NEXT_PUBLIC_DATA_SOURCE="database"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

Local Storage 버전으로 되돌리고 싶다면:

```env
NEXT_PUBLIC_DATA_SOURCE="local"
```

## 3. Prisma 스키마 확인

```powershell
npm.cmd run db:validate
```

## 4. DB 테이블 생성 + Seed

```powershell
npm.cmd run db:setup
```

위 명령은 다음을 실행합니다.

```text
prisma generate
→ prisma db push
→ seed.ts
```

Seed 데이터:
- Product: 기존 MVP 제품
- Supplier: 기존 MVP 공급사
- Knowledge: 기존 기술 콘텐츠
- Process / Material / Category 관계
- Product ↔ Supplier 관계

## 5. 서버 실행

```powershell
npm.cmd run dev
```

## 6. DB 연결 확인
브라우저:

```text
http://localhost:3000/api/db/health
```

정상 예시:

```json
{
  "ok": true,
  "database": "connected",
  "counts": {
    "products": 8,
    "suppliers": 7,
    "knowledge": 6,
    "rfqs": 0
  }
}
```

## 7. 공개 데이터 확인

```text
http://localhost:3000/products
http://localhost:3000/suppliers
http://localhost:3000/knowledge
```

화면 상단 데이터 배너가 `PostgreSQL`로 표시되면 DB 조회 모드입니다.

## 8. RFQ 실제 저장 테스트

```text
http://localhost:3000/rfq
```

RFQ 제출 후 성공 화면에 다음 형식의 번호가 표시됩니다.

```text
RFQ-YYYYMMDD-XXXXXX
```

DB 레코드는 Prisma Studio에서 확인할 수 있습니다.

```powershell
npm.cmd run db:studio
```

## Stage 09 완료 기준
- `/api/db/health` → connected
- `/products` → PostgreSQL 데이터 표시
- `/suppliers` → PostgreSQL 데이터 표시
- `/knowledge` → PostgreSQL 데이터 표시
- RFQ 제출 → RFQ 테이블에 레코드 생성
- `NEXT_PUBLIC_DATA_SOURCE=local`로 변경하면 기존 Local Storage MVP로 복귀 가능

## 다음 단계 — Stage 10
Admin CMS CRUD를 Local Storage가 아닌 Prisma API로 변경합니다.

```text
Admin CMS
↓
POST / PATCH / DELETE API
↓
Prisma
↓
PostgreSQL
↓
Published Public Pages
```
