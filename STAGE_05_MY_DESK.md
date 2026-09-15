# Stage 05 — My Desk 연결

이번 단계에서 추가된 기능:

- `/my-desk` 개인 업무공간
- RFQ Demo 제출 내역 조회
- 관심 제품 저장 / 삭제
- 관심 공급사 저장 / 삭제
- Knowledge 저장 / 삭제
- Product / Supplier / Knowledge 상세에서 My Desk 저장 버튼 제공
- RFQ 제출 후 My Desk 이동
- Desktop Header에 My Desk 메뉴 추가
- Mobile Bottom Navigation에 My Desk 추가

## 저장 방식
현재는 실제 DB가 아닌 브라우저 Local Storage를 사용합니다.

- `defense-semi-rfqs`
- `defense-semi-favorite-products`
- `defense-semi-favorite-suppliers`
- `defense-semi-saved-knowledge`

따라서 PostgreSQL 연결 전에도 전체 사용자 흐름을 테스트할 수 있습니다.
