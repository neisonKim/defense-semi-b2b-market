# Stage 16 — Prototype Visual Restore

이번 패치는 기존 정적 프로토타입에 있던 비주얼을 실제 Next.js 화면에 다시 적용합니다.

## 적용 범위
- Main Hero: 프로토타입의 wafer/beam CSS visual
- Product list / Main featured products: 프로토타입 제품 오브젝트 스타일
- Product detail: ring / powder / parts / bottle 4개 비주얼 갤러리
- Supplier detail: 프로토타입 wafer visual
- Knowledge card: 프로토타입 knowledge thumbnail

## 중요한 점
외부 스톡 이미지나 원격 URL을 사용하지 않습니다. 기존 프로토타입이 사용하던 CSS 기반 그래픽을 그대로 재사용합니다.

## 적용
압축을 프로젝트 루트에 덮어쓴 뒤:

```powershell
npm.cmd run dev
```

`npm install`은 필요하지 않습니다.
