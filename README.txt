Stage 09 Prisma schema fix

기존 프로젝트의 prisma/schema.prisma 파일을 이 패치의 파일로 덮어쓰세요.
그 다음 실행:
  npm.cmd run db:validate

원인: enum 값들을 한 줄에 작성한 Prisma 문법 오류를 여러 줄 형식으로 수정했습니다.
