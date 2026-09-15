# Stage 22 — Smooth Responsive Navigation

반응형 헤더 메뉴의 동작을 개선한 UI 패치입니다.

## 변경 사항
- 햄버거 3줄 아이콘이 열릴 때 X 아이콘으로 자연스럽게 morph
- 닫힐 때 X → 햄버거로 역방향 애니메이션
- 배경 overlay fade + blur
- 우측 메뉴 panel slide-in / slide-out
- 메뉴 항목 순차 fade-in
- 메뉴 오픈 중 body scroll 잠금
- ESC 키로 메뉴 닫기
- 메뉴 링크 클릭 시 자동 닫기
- `prefers-reduced-motion` 접근성 대응

## 적용
Stage 21 프로젝트 최상위에 이 패치의 `components`와 `app` 폴더를 덮어씁니다.

DB / Prisma / npm install 작업은 필요하지 않습니다.

```powershell
npm.cmd run dev
```

확인 폭: 1024 / 768 / 430 / 390 / 375px
