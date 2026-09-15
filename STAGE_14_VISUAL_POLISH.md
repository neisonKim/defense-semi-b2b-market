# Stage 14 — Visual Polish

기능 수정 없이 시각 체계만 정리하는 단계입니다.

## 변경 내용
- 카드 border / shadow 강도 통일
- Hero 대비 강화
- Primary / Secondary / Ghost CTA 계층 정리
- Product card CTA 우선순위 강화
- 상태 badge 색상 통일
- 검색 / 폼 focus 상태 통일
- 키보드 focus-visible 추가
- DB sync banner를 상태 정보로 정돈
- Admin CMS와 공개 페이지의 시각 언어 통일
- 모바일 shadow / fixed CTA 대비 보정

## 적용
1. 기존 프로젝트에 `app/globals.css` 덮어쓰기
2. `npm.cmd run dev`
3. `/`, `/products`, `/suppliers`, `/knowledge`, `/admin` 확인

## 확인 포인트
- Primary CTA가 페이지에서 가장 먼저 보이는지
- 일반 카드 테두리/그림자 강도가 모두 비슷한지
- 상태 badge가 의미별로 일관적인지
- Hover가 과하지 않은지
- 모바일에서 fixed CTA가 충분히 구분되는지
