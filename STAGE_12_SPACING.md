# Stage 12 - Spacing / Layout cleanup

이 패치는 기능을 변경하지 않고 `app/globals.css`의 레이아웃 여백만 정리합니다.

## 변경 내용
- 공통 컨테이너 최대 폭: 1280px
- Desktop 좌우 여백: 24px
- Tablet 좌우 여백: 20px
- Mobile 좌우 여백: 16px
- Hero 내부 여백/간격 통일
- Hero → DB 상태 배너 → KPI 카드 간격 통일
- Section title / description / content 간격 통일
- Process / Product / Supplier / Knowledge 카드 gap 통일
- Tablet / Mobile spacing 별도 최적화

## 적용
기존 프로젝트에 이 패치의 `app/globals.css`를 덮어쓰기 합니다.

그 다음:

```powershell
npm.cmd run dev
```

확인 폭:
- 1440px
- 1280px
- 1024px
- 768px
- 430px
- 390px
- 375px
