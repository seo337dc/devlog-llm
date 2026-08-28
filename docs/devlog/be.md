# BE 개발 로그

> `apps/be` (NestJS) 관련 작업만 기록.

---

## 2026-08-28 — NestJS 프로젝트 세팅

### 작업 내용

| # | 작업 | 상태 |
|---|------|------|
| 1 | `apps/be`에 NestJS 12 스캐폴드 생성 (`nest new`, pnpm 패키지 매니저) | ✅ |
| 2 | 루트 `pnpm-workspace.yaml` — `apps/fe`, `apps/be`, `packages/*` 워크스페이스 등록 | ✅ |
| 3 | 루트 `package.json` — `be:dev`, `be:build` 스크립트 추가 | ✅ |
| 4 | `pnpm install`로 전체 워크스페이스 의존성 설치 | ✅ |
| 5 | `pnpm be:dev` 실행 → `GET /` → "Hello World!" 응답 확인 | ✅ |

### 스택

- NestJS 12 (Express 플랫폼)
- 테스트: Vitest
- 린트: oxlint
- 패키지 매니저: pnpm (workspace)

### 다음 할 일

- [ ] PostgreSQL 연결 (Supabase 재사용 검토)
- [ ] `posts` 테이블 스키마 정의 + CRUD API (`PostsModule`)
- [ ] 인증 방식 결정 (개인용 — 단일 사용자 심플 인증 vs NextAuth 연동)
