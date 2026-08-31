# devlog-llm — 전략 문서

## 목표

개발하면서 나눈 대화와 작성한 글을 기록하는 노션 스타일 블로그를 만들고,
그 기록을 학습 데이터로 삼아 "나만의 개발 지식을 아는 LLM"을 만든다.

블로그(기록) + LLM(학습/검색)을 하나의 모노레포로 묶어서 관리한다.

---

## 전체 흐름

```
블로그 포스팅 작성 (FE) ─┐
                          ├─→ BE 저장 (PostgreSQL)
개발 관련 대화 기록 ──────┘         │
                                    ↓
                          AI/LLM 서비스가 데이터 임베딩
                                    ↓
                          벡터DB에 저장 (RAG)
                                    ↓
                    질문하면 관련 글/대화를 찾아 LLM이 답변
                    ("내가 예전에 이거 어떻게 해결했더라?")
```

---

## 모노레포 구조

```
devlog-llm/
├── apps/
│   ├── fe/              # Next.js — 블로그 에디터 + 뷰어 + 챗 UI
│   └── api/             # Python + FastAPI — 포스트 CRUD, 대화 수집, 임베딩, RAG 검색
├── packages/             # (필요 시) FE 공유 타입, 유틸
├── docs/
│   ├── STRATEGY.md       # 현재 파일
│   └── progress/         # 작업 로그
└── pnpm-workspace.yaml   # fe, packages만 포함 (api는 별도 venv)
```

> 원래 BE(포스트 CRUD)와 AI(대화 수집·RAG)를 분리할 계획이었으나, 혼자 쓰는
> 개인 프로젝트에서 서비스를 둘로 나눌 이유가 없어 `apps/api` 하나로 통합.
> 언어도 Node → Go → Python으로 계속 흔들리다가, AI/LLM 생태계가 어차피
> Python 중심이라는 점과 `smpay-ai-conversation-pipeline`에서 이미 Python을
> 학습 중이라는 점을 근거로 Python(FastAPI) 하나로 최종 확정.
> pnpm workspace 대상에서는 제외 (requirements.txt + venv로 독립 관리).

---

## 역할 분담

| 앱 | 스택 | 역할 |
|---|---|---|
| `apps/fe` | Next.js + React + TS | 노션 스타일 에디터로 글 작성, 글 목록/상세, AI 챗 UI |
| `apps/api` | Python + FastAPI | 포스트 CRUD API, 대화 수집 API, 임베딩 생성, 벡터DB 검색(RAG), LLM 응답 생성 |

### 의존 방향

```
apps/fe → apps/api
```

---

## 단계별 전략

### Phase 1 — 블로그 뼈대 구축

- `apps/api`: FastAPI 세팅, Supabase(PostgreSQL) 연결, `posts` 테이블 CRUD API
- `apps/fe`: Next.js 세팅, 글 목록/상세 페이지, 간단한 에디터(마크다운 or 블록 에디터)
- 인증: 개인용이라 우선 심플하게 (단일 사용자, 비밀번호 or NextAuth)

### Phase 2 — 대화 기록 수집

- `apps/api`: `POST /conversations` (Claude Code 세션 대화 저장)
- 개발 중 Claude Code와 나눈 대화를 이 API로 전송해서 축적
- 스키마: `session_id`, `role`, `content`, `context`(어떤 프로젝트/주제), `created_at`

### Phase 3 — RAG 구축

- 블로그 포스트 + 저장된 대화를 임베딩(OpenAI/Cohere/오픈소스 임베딩 모델)
- 벡터DB(pgvector on Supabase, 또는 Chroma/Qdrant)에 저장
- 질문 시: 벡터 검색으로 관련 글/대화 추출 → LLM(Groq 등)에게 컨텍스트로 전달 → 답변 생성

### Phase 4 — 챗 UI 통합

- `apps/fe`에 "내 기록에게 물어보기" 챗 인터페이스 추가
- 답변에 출처(어떤 글/대화에서 가져왔는지) 링크 표시
- (선택) 파인튜닝으로 확장 검토 — RAG로 한계 느낄 때 재평가

---

## 데이터 소스

| 소스 | 수집 방식 |
|---|---|
| 블로그 포스팅 | `apps/fe` 에디터에서 직접 작성 → `apps/api`에 저장 |
| Claude Code 세션 대화 | 개발 중 수동/자동으로 `apps/api`의 `POST /conversations`에 전송 |

---

## 기술 스택

| 역할 | 기술 | 선택 이유 |
|---|---|---|
| FE | Next.js + React + TS | 기존 숙련 스택 |
| API | Python + FastAPI | AI/LLM 생태계 중심 언어, `smpay-ai-conversation-pipeline`과 학습 병행 |
| DB | Supabase (PostgreSQL + pgvector) | 무료 플랜, RAG용 벡터 검색 내장 |
| LLM | Groq (무료 API) | `smpay-ai-conversation-pipeline`에서 검증된 선택 |
| 배포 | Vercel(FE) + Render(API) | Inote Money와 동일 조합, 무료 티어, GitHub 연동 자동 배포 |

---

## 우선순위

1. ✅ 전략 수립 (현재)
2. ⬜ Phase 1 — 블로그 뼈대 (FE + API)
3. ⬜ Phase 2 — 대화 기록 수집 (API)
4. ⬜ Phase 3 — RAG 구축
5. ⬜ Phase 4 — 챗 UI 통합

---

## 미정 사항 (진행하면서 결정)

- [ ] 벡터DB: pgvector vs 별도 벡터DB(Chroma/Qdrant)
- [ ] 에디터: 직접 구현 vs 오픈소스 블록 에디터(BlockNote, Tiptap 등) 사용
- [ ] Claude Code 대화 자동 수집 방식 (hook? 수동 복붙? 별도 스크립트?)
- [ ] 인증 방식 (개인용이라 최소화할지, NextAuth로 통일할지)
