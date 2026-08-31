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

- [ ] `apps/api`(`GET /posts`, `POST /posts`) 연동 — 글 목록/작성 페이지
- [ ] 노션 스타일 에디터 (직접 구현 vs BlockNote/Tiptap 등 라이브러리 검토)
