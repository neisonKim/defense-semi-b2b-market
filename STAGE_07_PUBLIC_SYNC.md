# Stage 07 — Admin CMS → Public Pages Sync

## 목표
Admin CMS에서 관리하는 Product / Supplier / Knowledge의 `Published` 상태를 실제 공개 Marketplace 페이지와 연결합니다.

## 동작 구조

```text
Admin CMS
  ↓ Draft / Review / Verified
Published
  ↓
Local Storage Public Adapter
  ↓
Home / Products / Suppliers / Knowledge
  ↓
Dynamic Detail Page
  ↓
RFQ
```

## 이번 단계에서 추가된 기능
- Admin CMS `Published` Product → `/products` 및 `/products/[slug]` 공개
- Admin CMS `Published` Supplier → `/suppliers` 및 `/suppliers/[slug]` 공개
- Admin CMS `Published` Knowledge → `/knowledge` 및 `/knowledge/[slug]` 공개
- 삭제 또는 비공개 상태 변경 시 공개 페이지에서 제외
- 메인페이지의 Product / Supplier / Knowledge 숫자와 카드도 공개 데이터 기준으로 반영
- 공개 페이지에 CMS Sync 상태 표시
- 신규 CMS Product는 기존 상세 데이터가 없을 경우 안전한 기본 상세 필드 자동 생성
- 신규 Knowledge는 같은 Process의 Published Product와 자동 연결

## 테스트 순서
1. `/admin` 접속
2. 새 Supplier 등록 → Status `Published`
3. 새 Product 등록 → Supplier 이름을 위 Supplier와 동일하게 입력 → `Published`
4. 새 Knowledge 등록 → Product와 동일/유사 Process 입력 → `Published`
5. `/suppliers`, `/products`, `/knowledge` 각각 확인
6. 새 Product 상세 URL 진입 확인
7. Product → Supplier → RFQ 연결 확인
8. Admin에서 Status를 `Review`로 변경 후 공개 목록에서 사라지는지 확인

## 현재 저장 방식
현재는 `localStorage` 기반 프로토타입입니다. 브라우저/기기별 데이터이며 실제 다중 사용자 서비스 저장소가 아닙니다.

다음 단계에서 PostgreSQL을 붙이지 않는다면, 포트폴리오 MVP는 이 구조로도 충분히 검증 가능합니다.
