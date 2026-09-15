# Stage 06 — Admin CMS Mock CRUD

## 이번 단계에서 추가된 기능

- Product 등록 / 수정 / 삭제
- Supplier 등록 / 수정 / 삭제
- Knowledge 등록 / 수정 / 삭제
- Draft / Review / Verified / Published / Needs Update 상태 관리
- Supplier Company Verified 토글
- 검증 큐에서 Verified / Published 전환
- 검색
- 브라우저 Local Storage 자동 저장
- Demo 데이터 초기화

## 저장 방식

현재는 PostgreSQL을 연결하지 않고 브라우저 Local Storage를 사용합니다.

키:

`defense-semi-admin-cms-v1`

따라서 브라우저를 새로고침해도 관리자에서 변경한 데모 데이터가 유지됩니다.

## 목적

이 단계의 목표는 실제 DB 도입 전에 운영자가 데이터를 입력하고 검토하는 CMS 흐름을 검증하는 것입니다.

다음 단계에서는 이 Local Storage CRUD를 실제 public Product / Supplier / Knowledge 목록과 동기화하거나 PostgreSQL + Prisma CRUD로 교체할 수 있습니다.
