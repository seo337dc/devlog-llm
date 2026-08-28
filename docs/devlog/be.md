# BE 개발 로그

> `apps/be` (Go) 관련 작업만 기록.

---

## 2026-08-28 (오후) — BE 언어를 NestJS → Go로 전환

### 결정 배경

- 채용 시장 리서치 결과, Go/Rust가 클라우드 네이티브·마이크로서비스 쪽에서 수요가 높다는 걸 확인
- 이 사이드 프로젝트의 목적 자체가 "이력서에 바로 쓸 완성품"이 아니라 "실력을 쌓는 학습 트랙"이므로,
  익숙한 TS 생태계(NestJS)보다 새로운 언어(Go)로 CS 기본기(동시성, 메모리 모델, 표준 라이브러리 활용)를
  직접 부딪히며 배우는 쪽이 장기적으로 더 남는다고 판단
- 이직 준비(이력서/지원)는 별도 트랙으로 이미 진행 중이라, 이 프로젝트가 당장 완성될 필요는 없음 — 언어를
  바꿔서 학습 곡선이 늘어나는 리스크를 감수해도 되는 상황

### 작업 내용

| # | 작업 | 상태 |
|---|------|------|
| 1 | 기존 NestJS 스캐폴드(`apps/be`) 제거 | ✅ |
| 2 | Homebrew로 Go 설치 (`go1.27.0`) | ✅ |
| 3 | `apps/be`에 Go 모듈 초기화 (`go mod init devlog-llm/be`) | ✅ |
| 4 | 표준 라이브러리(`net/http`)만으로 `cmd/server/main.go` 작성 — 프레임워크 없이 시작 (Go 1.22+ ServeMux의 메서드 기반 라우팅 활용) | ✅ |
| 5 | `GET /health` → `{"status":"ok"}` 응답 확인 | ✅ |
| 6 | 루트 `pnpm-workspace.yaml`/`package.json`에서 `apps/be` 관련 항목 제거 (더 이상 JS 패키지 아님) | ✅ |

### 스택 (변경 후)

- Go 1.27 (표준 라이브러리 `net/http`, 외부 프레임워크 없음 — 필요해지면 그때 chi/gin 등 검토)
- 빌드: `go build`

### 다음 할 일

- [ ] PostgreSQL 연결 (`database/sql` + driver, 또는 `sqlc` 검토)
- [ ] `posts` 테이블 스키마 정의 + CRUD 핸들러
- [ ] 인증 방식 결정

---

## 2026-08-28 (오전) — NestJS 프로젝트 세팅 (이후 Go로 전환됨 — 아래는 기록용)

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
