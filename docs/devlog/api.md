# API 개발 로그

> `apps/api` (Python + FastAPI) 관련 작업만 기록.
> 원래 `apps/be`(포스트 CRUD)와 `apps/ai`(대화 수집·RAG)로 나눌 계획이었으나 하나로 통합함 — 아래 두 로그 병합.

---

## 2026-08-31 — Supabase 연결 + posts 생성/조회 확인 (Phase 1 최소 루프 완성)

### 작업 내용

| # | 작업 | 상태 |
|---|------|------|
| 1 | Supabase 프로젝트(`devlog-llm`) 생성, SQL Editor에서 `schema.sql` 실행 | ✅ |
| 2 | `apps/api/.env`에 `SUPABASE_URL`/`SUPABASE_KEY` 설정 | ✅ |
| 3 | `POST /posts` → `GET /posts`로 실제 Supabase 저장·조회 확인 | ✅ |

### 트러블슈팅

- **키 타입 실수**: Supabase가 최근 키 체계를 JWT(anon/service_role)에서 `sb_publishable_...`/`sb_secret_...`
  형태로 바꿨는데, 처음에 publishable 키를 넣어서 insert 시 `new row violates row-level security policy` 에러
  발생. secret 키(server 전용, RLS 우회)로 교체해서 해결.
- **`.env` 위치 실수**: `python-dotenv`의 `load_dotenv()`는 실행 디렉터리 기준으로 상위로 탐색하지, 하위
  디렉터리(`app/`)는 안 찾음. 에디터가 이전 경로를 기억해서 `apps/api/app/.env`에 저장되는 바람에 두 번이나
  같은 실수 반복 — `apps/api/.env`(패키지 루트, `app/`의 부모)가 맞는 위치.

### 결과

STRATEGY.md Phase 1(블로그 뼈대)의 핵심 — "글 하나 쓰고 조회"가 실제로 동작 확인됨. PLANNING.md에서 정의한
MVP 최소 루프("글 하나 쓰고 → AI 대화 하나 기록하고 → 회고 남기기") 중 첫 번째 조각 완성.

### 다음 할 일

- [ ] `apps/fe` 세팅 — 지금은 API만 있고 실제로 글 쓰는 화면이 없음
- [ ] `POST /conversations` — 대화 수집 API (Phase 2)

---

## 2026-08-28 (밤) — BE/AI 통합 + 언어 최종 확정: Python(FastAPI)

### 결정 배경

- 하루 동안 BE 언어를 NestJS → Go → Python으로 세 번 바꾸는 의사결정 지연이 발생 — 취업 준비 불안이
  사이드 프로젝트 설계 판단에 영향을 준 신호로 보고 멈춰서 원인을 다시 짚음
- 실제로는 이미 별도 사이드 프로젝트(Inote Money, NestJS)로 "Node.js 백엔드" 요건을 충족하고 있어서,
  devlog-llm의 BE 언어가 취업 여부에 미치는 영향은 거의 없었음 — 이 프로젝트는 PLANNING.md에 적어둔 대로
  학습 트랙이지 이력서 필수 요건이 아님
- Python 쪽으로 마음이 간 진짜 이유는 AI/LLM 생태계가 Python 중심이고, `smpay-ai-conversation-pipeline`에서
  이미 Python을 배우고 있어 학습이 겹친다는 점 — 이 근거는 타당하다고 판단
- 혼자 쓰는 개인 프로젝트에서 BE(포스트 CRUD)와 AI(대화 수집·RAG)를 굳이 별도 서비스로 나눌 이유가 없어
  `apps/api` 하나로 통합 — 서비스 2개 유지·배포 비용을 줄임

### 작업 내용

| # | 작업 | 상태 |
|---|------|------|
| 1 | 기존 Go 모듈(`apps/be`) 제거 | ✅ |
| 2 | `apps/api` 신설 — Python 3.9 venv, FastAPI/uvicorn/supabase/python-dotenv 설치 | ✅ |
| 3 | `app/main.py`, `app/routers/posts.py`, `app/models.py`, `app/db/supabase.py` 작성 | ✅ |
| 4 | `GET /health` → `{"status":"ok"}` 응답 확인 (포트 충돌로 8000번으로 변경 후 확인) | ✅ |
| 5 | `POST /posts`, `GET /posts` — Supabase 파이썬 클라이언트 기반 CRUD 작성 (DB 연결 테스트는 Supabase 프로젝트 생성 후 예정) | ✅ (코드) / ⏳ (실제 DB 연결 테스트) |
| 6 | STRATEGY.md/PLANNING.md — `apps/be`+`apps/ai` → `apps/api` 통합 구조로 반영 | ✅ |

### 스택 (최종)

- Python 3.9 + FastAPI + uvicorn
- DB 클라이언트: `supabase` 파이썬 SDK (raw SQL/ORM 대신 REST 기반 클라이언트로 시작 — 필요해지면 SQLAlchemy 등 검토)
- 개발 서버 포트: 3000은 smpay-frontend-monorepo 개발 서버와 충돌 가능 → 8000 사용

### 다음 할 일

- [ ] Supabase 프로젝트 생성 + `schema.sql`(`posts` 테이블) 적용
- [ ] `.env`에 `SUPABASE_URL`/`SUPABASE_KEY` 설정 후 실제 글 생성·조회 테스트
- [ ] `POST /conversations` — 대화 수집 API (STRATEGY.md Phase 2)
- [ ] 임베딩 생성 + 벡터DB(pgvector) 저장, RAG 검색 (Phase 3)

---

## 2026-08-28 (오후) — BE 언어를 NestJS → Go로 전환 (이후 Python으로 재전환됨 — 아래는 기록용)

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
