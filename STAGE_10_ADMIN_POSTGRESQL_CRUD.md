# Stage 10 — Admin CMS PostgreSQL CRUD

## 목표
Stage 09에서 공개 Product / Supplier / Knowledge 조회와 RFQ 저장을 PostgreSQL로 전환한 다음, Stage 10에서는 Admin CMS의 등록·수정·삭제·검증 상태 변경까지 실제 PostgreSQL + Prisma에 저장합니다.

## 데이터 흐름

Admin CMS
→ Next.js Route Handler
→ Prisma
→ PostgreSQL
→ /api/public-data
→ Product / Supplier / Knowledge 공개 페이지

## 실제 DB로 전환되는 기능
- Product 등록 / 수정 / 삭제
- Supplier 등록 / 수정 / 삭제
- Knowledge 등록 / 수정 / 삭제
- Draft / Review / Verified / Published / Needs Update 상태 변경
- Supplier Company Verified 상태
- Product ↔ Process / Material / Supplier 관계 저장
- Knowledge ↔ Process 및 연관 Product / Supplier 자동 연결

## 그대로 Local Storage에 남는 기능
- My Desk 즐겨찾기
- 최근 본 항목 등 개인 브라우저 상태

로그인 기능이 아직 없으므로 개인화 데이터는 현재 Local Storage를 유지합니다.

## 적용 후 확인
`.env`:

```env
NEXT_PUBLIC_DATA_SOURCE="database"
```

개발 서버:

```powershell
npm.cmd run dev
```

확인 주소:

```text
http://localhost:3000/admin
```

### 테스트 1 — Supplier
1. 공급사 관리
2. Test Semiconductor 등록
3. Status = Published
4. 저장
5. `/suppliers`에서 표시되는지 확인

### 테스트 2 — Product
Supplier를 먼저 등록해야 합니다.

1. 제품 관리
2. Product Name = Test Focus Ring
3. Supplier = Test Semiconductor
4. Process = Dry Etching
5. Material = SiC
6. Status = Published
7. 저장
8. `/products`에서 표시되는지 확인

### 테스트 3 — Knowledge
1. Knowledge 관리
2. Related Process = Dry Etching
3. Status = Published
4. 저장
5. `/knowledge`에서 확인
6. 같은 Process Product가 관련 제품으로 연결되는지 확인

### 테스트 4 — 검증 큐
1. Draft 또는 Review 상태로 항목 등록
2. 검증 큐 이동
3. Verified 또는 Published 클릭
4. Prisma Studio에서 status 값 확인

## Prisma Studio 확인

```powershell
npm.cmd run db:studio
```

Admin에서 등록한 데이터가 Product / Supplier / KnowledgeArticle에 실제로 추가되는지 확인합니다.

## 삭제 보호
- RFQ에 연결된 Product는 삭제를 차단합니다.
- Product가 연결된 Supplier는 삭제를 차단합니다.

## 주의
현재 Admin 인증/권한은 아직 없습니다. 로컬 개발용 CMS입니다. 인터넷에 배포하기 전에 로그인과 Admin 권한 보호를 추가해야 합니다.
