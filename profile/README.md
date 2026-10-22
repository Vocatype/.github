<p align="center">
  <img src="./icon.svg" width="96" height="96" alt="Vocatype 아이콘">
</p>

<h1 align="center">Vocatype</h1>

<p align="center">
  목소리로 그리는 나의 초상<br>
  <sub>A portrait drawn by your voice</sub>
</p>

## 링크

| | |
| --- | --- |
| 서비스 | <https://vocatype.hs827.workers.dev> |
| 저장소 | [Vocatype/vocatype](https://github.com/Vocatype/vocatype) |
| 작업 기록 | [branches/](https://github.com/Vocatype/vocatype/tree/main/branches) — 작업마다 설계·구현·리뷰 문서 |

## 성격

Vocatype은 짧은 글을 소리 내어 읽으면 그 목소리로 나를 그려 주는 웹 서비스입니다.
브라우저가 피치·에너지·말 속도·음색을 분석해 4축 16가지 보이스 타입으로 나누고, 퍼스널 컬러·시그니처 향·사운드 시그니처·궁합 타입에 AI 초상과 목소리 해설을 더해 1080×1920 카드 한 장으로 만듭니다.

- **목소리는 기기 밖으로 나가지 않습니다.** 분석은 브라우저 안에서 끝납니다. AI 초상에는 타입 코드와 씨앗만, 목소리 해설에는 타입 코드·축 수치·언어만 보냅니다.
- **아무것도 남기지 않습니다.** 로그인, 쿠키, 브라우저 저장소, 외부 분석·광고 스크립트를 쓰지 않습니다.
- **기록하며 만듭니다.** 모든 변경은 번호 붙은 브랜치에서 설계 → 구현 → 독립 리뷰를 거쳐 병합합니다.
- 한국어·영어, 라이트·다크 테마를 지원합니다.

React · TypeScript · Vite / Cloudflare Workers · Workers AI · Claude API

## 개발자

| | GitHub | 역할 |
| --- | --- | --- |
| <img src="https://github.com/hyunseop827.png" width="40" height="40" alt=""> | [@hyunseop827](https://github.com/hyunseop827) (Hyunseop Kim) | 조직 관리자 · 개발 |
| <img src="https://github.com/eric91405.png" width="40" height="40" alt=""> | [@eric91405](https://github.com/eric91405) (MIN2EO) | 메인테이너 |
