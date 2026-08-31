# FE 개발 로그

> `apps/fe` (Next.js) 관련 작업만 기록.

---

## 2026-08-31 — Next.js 프로젝트 세팅

### 작업 내용

| # | 작업 | 상태 |
|---|------|------|
| 1 | `create-next-app`으로 `apps/fe` 스캐폴드 (TypeScript, Tailwind, App Router, src 디렉터리) | ✅ |
| 2 | 루트 `pnpm install`로 워크스페이스 연결, `unrs-resolver` 빌드 스크립트 승인 | ✅ |
| 3 | 루트 `package.json`에 `fe:dev` 스크립트 추가 | ✅ |
| 4 | `pnpm dev` → `GET /` → 200 확인 (포트 3010 — 3000은 smpay 개발 서버와 충돌) | ✅ |

### 스택

- Next.js 16.3.3 (Turbopack), React 19.2.8, TypeScript, Tailwind CSS 4

### 다음 할 일

- [x] `apps/api`(`GET /posts`, `POST /posts`) 연동 — 글 목록/작성 페이지
- [ ] 노션 스타일 에디터 (직접 구현 vs BlockNote/Tiptap 등 라이브러리 검토)

---

## 2026-08-31 (이어서) — apps/api 연동, 글 작성/목록 최소 화면

### 작업 내용

| # | 작업 | 상태 |
|---|------|------|
| 1 | `src/lib/posts.ts` — `getPosts`/`createPost` fetch 헬퍼 작성 | ✅ |
| 2 | `src/app/page.tsx` — 기본 스타터 페이지를 글 작성 폼 + 목록으로 교체 | ✅ |
| 3 | `apps/api`에 CORS 미들웨어 추가 (`http://localhost:3010` 허용) | ✅ |
| 4 | `.env.local`에 `NEXT_PUBLIC_API_URL=http://localhost:8000` 설정 | ✅ |
| 5 | `.claude/launch.json` 추가 (fe, 포트 3010 고정) | ✅ |
| 6 | 브라우저에서 실제로 글 작성 → 목록에 반영되는 것까지 확인 (스크린샷) | ✅ |

### 참고

- `preview_start`가 세션의 기본 프로젝트(smpay-frontend-monorepo)에 묶여 있어서, devlog-llm은 `pnpm dev`로 직접
  띄우고 브라우저 `navigate`로 열어서 확인하는 방식 사용

### 결과

STRATEGY.md Phase 1(블로그 뼈대)의 핵심 루프 — "글 쓰고 목록에서 보기" — FE까지 포함해서 완전히 동작 확인.
아직 에디터는 plain textarea 수준. 노션 스타일 에디터는 다음 단계.
