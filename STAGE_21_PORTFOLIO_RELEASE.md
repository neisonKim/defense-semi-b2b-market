# Stage 21 — Portfolio Case Study / Version 1.0

## 목적
Stage 21은 새 기능을 추가하는 단계가 아니라, 지금까지 만든 DEFENSE SEMI B2B MARKET을 포트폴리오에서 설명할 수 있는 하나의 완성된 프로젝트로 정리하는 단계입니다.

## Version 1.0 핵심 포지셔닝

**DEFENSE SEMI B2B MARKET**  
Semiconductor Manufacturing Intelligence + Sourcing Platform

반도체 공정·기술 지식에서 제품, 공급사, RFQ로 이어지는 B2B 탐색 흐름을 하나의 플랫폼 UX로 구현한 프로젝트입니다.

```text
Knowledge
→ Engineering Problem
→ Process / Technology
→ Product
→ Supplier
→ RFQ
→ Data
```

## 구현 범위
- Next.js App Router 기반 반응형 웹
- Product / Supplier / Knowledge 공개 카탈로그
- 검색 및 필터
- Product ↔ Supplier 관계 탐색
- Knowledge ↔ Product 관계 탐색
- 3-step RFQ 제출
- PostgreSQL + Prisma 기반 공개 데이터 및 RFQ 저장
- Admin CMS Product / Supplier / Knowledge CRUD
- Published 상태 기반 공개 페이지 동기화
- DB QA 스크립트
- My Desk 즐겨찾기 / RFQ 표시용 로컬 상태
- AI 기반 반도체 이미지 자산 및 콘텐츠별 이미지 매칭
- Desktop / Tablet / Mobile 반응형 QA

## 포트폴리오에서 강조할 문제 정의
기존 반도체 B2B 정보는 기술 지식, 제품 정보, 공급사 정보, 문의가 서로 분리되어 있다는 문제를 가정했습니다. 이 프로젝트는 사용자가 먼저 공정과 기술을 이해하고, 관련 제품과 공급사를 탐색한 뒤 RFQ로 자연스럽게 전환할 수 있도록 정보 구조를 설계했습니다.

## 핵심 UX 설계
1. **Knowledge-first discovery** — 초보 사용자도 기술 문서에서 제품으로 이동할 수 있게 연결
2. **Process-driven navigation** — 제품명만 아는 사용자가 아니라 공정 문제에서 시작하는 사용자도 탐색 가능
3. **Supplier intelligence** — 제품과 공급사 관계를 N:M 관점으로 확장 가능한 구조로 설계
4. **RFQ conversion** — 일반 쇼핑몰의 구매 버튼 대신 B2B 전환에 맞는 RFQ를 핵심 CTA로 설정
5. **Admin publishing workflow** — Draft/Review/Verified/Published/Needs Update 상태를 가진 관리 구조

## 기술 구조
```text
Next.js UI
→ Route Handlers / API
→ Prisma ORM
→ PostgreSQL
```

공개 데이터 소스는 환경변수로 전환 가능합니다.

```env
NEXT_PUBLIC_DATA_SOURCE="database"
```

DB 모드에서는 Published Product / Supplier / Knowledge를 PostgreSQL에서 조회하고 RFQ를 실제 DB에 저장합니다.

## Stage 11 DB QA 기준 확인 결과
사용자 로컬 환경에서 다음 항목이 PASS로 확인되었습니다.
- PostgreSQL connection OK
- Product / Supplier / Knowledge 조회
- RFQ / Item / Match 저장
- Published 관계 검사

WARN은 콘텐츠 관계 보완 권장 사항이며 ERROR가 없는 경우 QA 결과는 PASS입니다.

## Version 1.0에서 의도적으로 남긴 범위
포트폴리오 MVP이므로 다음은 Version 1.1 이후 확장 항목으로 남깁니다.
- 실제 회원가입 / 로그인
- Buyer / Supplier / Admin Role 인증
- My Desk 사용자별 서버 저장
- 이메일 발송 및 RFQ 알림
- Supplier Portal
- 운영 배포 / 모니터링 / 백업 정책

이 항목을 남긴 이유는 기능 누락이 아니라 **포트폴리오 MVP와 실제 SaaS 운영 범위를 명확히 분리**하기 위함입니다.

## 최종 발표용 한 문장
> 반도체 기술 지식에서 제품·공급사 탐색과 RFQ까지 이어지는 B2B 소싱 플랫폼을 기획하고, UX/UI부터 Next.js·PostgreSQL·Prisma·Admin CMS까지 구현했습니다.

## Version
**1.0.0 — Portfolio MVP**
