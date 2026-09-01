# API 개발 로그

> `apps/api` (Python + FastAPI) 관련 작업만 기록.
> 원래 `apps/be`(포스트 CRUD)와 `apps/ai`(대화 수집·RAG)로 나눌 계획이었으나 하나로 통합함 — 아래 두 로그 병합.

---

## 2026-09-01 — Groq API 키 확보 (Phase 2 Step 1)

### 작업 내용

| # | 작업 | 상태 |
|---|------|------|
| 1 | `smpay-ai-conversation-pipeline`의 `GROQ_API_KEY` 재사용 결정 (신규 발급 대신) | ✅ |
| 2 | `apps/api/.env`에 `GROQ_API_KEY` 추가, `.env.example` 갱신 | ✅ |
| 3 | `requirements.txt`에 `groq==1.0.0`(+`distro`, `sniffio`) 추가, venv 설치 | ✅ |
| 4 | 실제 Groq API 호출로 키 동작 확인 (`openai/gpt-oss-20b` 모델) | ✅ |

### 판단 근거 — 키 재사용 여부

`smpay-ai-conversation-pipeline`은 실제 SMPay 서비스용 AI 어시스턴트(회사 제품)라서, 회사 인프라 키를 개인
프로젝트에 섞는 리스크(쿼터 공유, 키 회전 시 devlog-llm이 예고 없이 깨짐)를 짚고 신규 발급을 권장했으나,
사용자가 기존 키 재사용을 선택함. 회전 시 devlog-llm도 영향받는다는 점을 인지한 상태로 진행.

### 트러블슈팅

- `openai/gpt-oss-20b`는 reasoning 모델이라 응답 전에 내부적으로 reasoning 토큰을 소모함. 테스트 시
  `max_tokens=20`으로 호출하니 reasoning만 소모되고 실제 답변(`content`)이 빈 문자열로 잘림 —
  `max_tokens=200`으로 올리니 정상 응답(`completion_tokens_details.reasoning_tokens=26` 확인). 향후 채팅
  엔드포인트 구현 시 `max_tokens`를 충분히 잡아야 함 (smpay 쪽은 `max_tokens=1024` 사용 중, 동일하게 따라감).

---

## 2026-09-01 (이어서) — `POST /chat` SSE 엔드포인트 + FE 연동 (Phase 2 Step 2)

### 작업 내용

| # | 작업 | 상태 |
|---|------|------|
| 1 | `app/routers/chat.py` 신규 — `POST /chat`, Groq `openai/gpt-oss-20b` 모델, SSE 스트리밍 (smpay 패턴 참고, `page_guidelines`·대화 저장 등 회사 전용/Step 3 기능은 제외한 최소 버전) | ✅ |
| 2 | `main.py`에 `chat.router` 등록 | ✅ |
| 3 | FE `AIChat.tsx` — 로컬 state뿐이던 뼈대를 실제 `fetch` + `ReadableStream`으로 SSE 응답을 받아 렌더링하도록 교체. `session_id`는 컴포넌트 마운트 시 `crypto.randomUUID()`로 1회 생성 | ✅ |
| 4 | 로컬에서 API(`uvicorn`, 8000) + FE(`pnpm dev`, 3010) 동시 실행 후 `curl -N`으로 SSE 스트림 직접 확인, 이어서 브라우저로 `/write` 페이지에서 실제 대화 확인 (스크린샷) | ✅ |

### 참고

- 이번 단계는 대화 저장(Step 3) 없이 순수 프록시로만 구현. `conversations` 테이블이 아직 없어서 저장 로직을
  넣으면 바로 에러가 나기 때문에 의도적으로 뺌.
- FE 스트림 파싱은 `smpay-frontend-monorepo`의 `ChatDrawer.tsx` 패턴(줄 단위로 `data: ` 접두사 파싱, 마지막
  assistant 메시지를 계속 갱신)을 그대로 가져옴 — 새로 설계하지 않고 검증된 패턴 재사용.

### 결과

STRATEGY.md Phase 2의 핵심 — "AI 채팅 UI가 실제 LLM 응답을 받는다"가 로컬에서 완전히 동작 확인됨.

### 다음 할 일

- [ ] `conversations` 테이블 + 저장 방식 결정 (자동 저장 vs 명시적 `POST /conversations`) — Phase 2 Step 3
- [ ] AI와의 대화로 에디터 초안을 채우는 "AI로 글쓰기" 기능 — Phase 2 Step 4

---

## 2026-09-01 (이어서 2) — `conversations` 테이블 + `POST /conversations` (Phase 2 Step 3)

### 작업 내용

| # | 작업 | 상태 |
|---|------|------|
| 1 | 저장 방식 대안 제시 후 사용자 승인 — `/chat`이 공유 헬퍼(`save_conversation`)로 내부 자동 저장, `POST /conversations`는 별도 공개 엔드포인트로 유지(향후 Claude Code 세션 수집 등에 재사용 대비) | ✅ |
| 2 | `schema.sql`에 `conversations` 테이블 추가 (`session_id`, `role`, `content`, `context`, `created_at`) — Supabase SQL Editor에서 사용자가 직접 실행 | ✅ |
| 3 | `app/models.py`에 `ConversationCreate`/`Conversation` 추가 | ✅ |
| 4 | `app/routers/conversations.py` 신규 — `save_conversation()` 내부 헬퍼(예외 삼킴, fire-and-forget) + `POST /conversations` 공개 엔드포인트 | ✅ |
| 5 | `chat.py`가 스트리밍 시작 전 사용자 메시지, 스트리밍 종료 후 전체 assistant 응답을 `save_conversation()`으로 저장 (`context="devlog-chat"`) | ✅ |
| 6 | `curl`로 `POST /conversations` 단독 호출 확인 → `/chat` 호출 후 Supabase에서 직접 조회해 user/assistant 두 행 모두 저장됨을 확인 → 브라우저 `/write`에서 실제 대화 후 동일하게 저장 확인 | ✅ |

### 트러블슈팅

- `app/models.py`에 `from __future__ import annotations` + `context: str | None`을 추가했더니 서버가 기동 시점에
  `TypeError: unsupported operand type(s) for |: 'type' and 'NoneType'`로 죽음. `db/supabase.py`의
  `Client | None`(일반 변수 애노테이션)과 달리, **pydantic `BaseModel` 필드**는 `from __future__ import
  annotations`를 켜도 런타임에 문자열 애노테이션을 다시 eval하기 때문에 Python 3.9에서 `X | None` 문법이
  그대로 깨짐. `typing.Optional[str]`로 바꾸고 `from __future__ import annotations`는 제거해서 해결. 같은
  루트 원인(3.9 vs 3.10+ 문법)을 pydantic 모델에서 또 겪은 케이스 — CLAUDE.md의 "알아둘 것"에 일반화해서
  추가할 필요 있음 (일반 변수/함수 시그니처는 안전, pydantic 모델 필드는 `Optional` 써야 함).

### 결과

STRATEGY.md Phase 2의 "대화 기록 수집" 핵심 루프 완성 — AIChat에서 나눈 대화가 실제로 Supabase에 쌓임.
Phase 4(RAG)의 데이터 소스 하나가 실제로 축적되기 시작.

### 다음 할 일

- [ ] AI와의 대화로 에디터 초안을 채우는 "AI로 글쓰기" 기능 — Phase 2 Step 4

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

- [x] `apps/fe` 세팅 — 지금은 API만 있고 실제로 글 쓰는 화면이 없음
- [ ] `POST /conversations` — 대화 수집 API (Phase 2)

---

## 2026-08-31 (이어서 3) — CI 세팅 + Render 배포 준비

### 작업 내용

| # | 작업 | 상태 |
|---|------|------|
| 1 | `.github/workflows/ci-api.yml` — `apps/api/**` 변경 시에만 트리거, ruff lint + import 체크 | ✅ |
| 2 | `pyproject.toml`에 `target-version = "py39"` 명시 — ruff가 3.10+ 문법(`X \| None`)을 잘못 제안하는 것 방지 | ✅ |
| 3 | ruff 지적사항 반영: import 정렬, `from __future__ import annotations` + `Client \| None`, `List` → `list` | ✅ |
| 4 | `requirements-dev.txt` 분리 (ruff는 dev 전용) | ✅ |
| 5 | CORS `allow_origins`를 하드코딩 대신 `ALLOWED_ORIGINS` 환경변수로 변경 (배포 환경 대응) | ✅ |
| 6 | 루트에 `render.yaml` 추가 (Render Blueprint) | ✅ |

### 트러블슈팅

- ruff 기본 설정이 target-version을 최신으로 가정해서 `Optional[Client]` → `Client \| None`을 제안함 — 이걸
  그대로 적용하면 Python 3.9 런타임에서 다시 깨짐 (아까 Go→Python 전환 때 겪은 것과 같은 종류의 실수).
  `pyproject.toml`에 `target-version = "py39"`를 먼저 박아두고 나서야 안전하게 자동수정 적용.
  `from __future__ import annotations`를 추가하면 3.9에서도 `X \| None` 문법을 안전하게 쓸 수 있다는 것도 확인.

### 배포

- Render 대시보드에 Blueprint 메뉴가 안 보여서(UI 변경) `render.yaml` 대신 **Web Service 수동 생성**으로 배포
  (Root Directory: `apps/api`, Build: `pip install -r requirements.txt`, Start:
  `uvicorn app.main:app --host 0.0.0.0 --port $PORT`)
- 배포 완료: https://devlog-llm.onrender.com — `/health`, `/posts` 모두 프로덕션 Supabase 연결 확인됨
- `ALLOWED_ORIGINS`는 아직 `http://localhost:3010`로 남아있음 — Vercel 배포 URL로 업데이트 필요
  (브라우저에서 직접 호출하는 `/write` 저장은 이거 고치기 전까진 CORS로 막힘. SSR로 가져오는 홈/상세
  화면은 서버-서버 요청이라 CORS 영향 없음)

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
