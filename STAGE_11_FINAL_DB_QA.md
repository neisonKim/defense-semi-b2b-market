# Stage 11 — PostgreSQL Final DB QA

## 목적
Stage 10에서 Admin CMS CRUD와 RFQ 저장까지 PostgreSQL로 전환한 뒤, 실제 DB 관계가 깨지지 않았는지 최종 확인합니다.

## 실행
프로젝트 폴더에서:

```powershell
npm.cmd run qa:db
```

또는 개발 서버 실행 후 브라우저에서:

```text
http://localhost:3000/api/db/qa
```

## 자동 검사 항목
- PostgreSQL 연결 가능 여부
- Product 전체 / Published 수
- Supplier 전체 / Published 수
- Knowledge 전체 / Published 수
- RFQ / RfqItem / RfqSupplierMatch 수
- Published Product에 Process가 연결되어 있는지
- Published Product에 Published Supplier가 연결되어 있는지
- Published Knowledge에 Process가 연결되어 있는지
- Published Knowledge에 Product가 연결되어 있는지
- Published Supplier에 공개 Product가 연결되어 있는지
- Item이 없는 비정상 RFQ가 존재하는지

## 결과 해석
- `RESULT: PASS` : 핵심 DB 무결성 오류 없음
- `WARN` : 서비스는 동작하지만 관계 보완 권장
- `ERROR` : DB 관계 오류. 해결 후 다음 단계 진행

## 브라우저 QA
다음 주소도 순서대로 확인합니다.

1. `/api/db/health`
2. `/api/db/qa`
3. `/products`
4. `/suppliers`
5. `/knowledge`
6. `/rfq`
7. `/my-desk`
8. `/admin`

## Stage 11 완료 조건
- `npm.cmd run qa:db` 결과가 `RESULT: PASS`
- Product → Supplier → RFQ 흐름 정상
- Admin에서 Published 변경 후 공개 페이지 반영
- RFQ 제출 후 Rfq + RfqItem 저장 확인
- Desktop / Tablet / Mobile에서 주요 CTA가 가려지지 않음

Stage 11이 끝나면 핵심 MVP의 DB 전환까지 완료된 상태입니다. 이후 로그인/권한은 선택 단계입니다.
