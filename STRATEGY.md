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
│   ├── be/               # NestJS — 포스트 CRUD, 인증, AI 서비스 프록시
│   └── ai/               # Python + FastAPI — 대화 수집, 임베딩, RAG 검색
├── packages/             # (필요 시) FE/BE 공유 타입, 유틸
├── docs/
│   ├── STRATEGY.md       # 현재 파일
│   └── progress/         # 작업 로그
└── pnpm-workspace.yaml   # fe, be, packages만 포함 (ai는 별도 venv)
```

> `apps/ai`는 Python이라 pnpm workspace 대상에서 제외. 같은 레포 안에 위치만 공유하고
> 빌드/의존성은 독립적으로 관리 (requirements.txt + venv).

---

## 역할 분담

| 앱 | 스택 | 역할 |
|---|---|---|
| `apps/fe` | Next.js + React + TS | 노션 스타일 에디터로 글 작성, 글 목록/상세, AI 챗 UI |
| `apps/be` | NestJS + TS | 포스트 CRUD API, 인증(로그인), `apps/ai` 프록시/오케스트레이션 |
| `apps/ai` | Python + FastAPI | 대화 수집 API, 임베딩 생성, 벡터DB 검색(RAG), LLM 응답 생성 |

### 의존 방향

```
apps/fe → apps/be → apps/ai
```

FE는 BE만 호출. BE가 필요 시 AI 서비스를 내부적으로 호출 (AI 서비스를 FE에 직접 노출하지 않음).

---

## 단계별 전략

### Phase 1 — 블로그 뼈대 구축

- `apps/be`: NestJS 프로젝트 세팅, PostgreSQL 연결(Supabase 재사용 가능), `posts` 테이블 CRUD API
- `apps/fe`: Next.js 세팅, 글 목록/상세 페이지, 간단한 에디터(마크다운 or 블록 에디터)
- 인증: 개인용이라 우선 심플하게 (단일 사용자, 비밀번호 or NextAuth)

### Phase 2 — 대화 기록 수집

- `apps/ai`: FastAPI 세팅, `POST /conversations` (Claude Code 세션 대화 저장)
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
| 블로그 포스팅 | `apps/fe` 에디터에서 직접 작성 → `apps/be`에 저장 |
| Claude Code 세션 대화 | 개발 중 수동/자동으로 `apps/ai`의 `POST /conversations`에 전송 |

---

## 기술 스택

| 역할 | 기술 | 선택 이유 |
|---|---|---|
| FE | Next.js + React + TS | 기존 숙련 스택 |
| BE | NestJS | TS 통일, 구조화된 백엔드 아키텍처 학습 목적 |
| AI/LLM | Python + FastAPI | LLM/임베딩 생태계 (LangChain, Groq 등) |
| DB | Supabase (PostgreSQL + pgvector) | 무료 플랜, RAG용 벡터 검색 내장 |
| LLM | Groq (무료 API) | `smpay-ai-conversation-pipeline`에서 검증된 선택 |
| 배포 | 미정 (Vercel/FE, Render/BE·AI 검토) | Phase 1 완료 후 결정 |

---

## 우선순위

1. ✅ 전략 수립 (현재)
2. ⬜ Phase 1 — 블로그 뼈대 (FE + BE)
3. ⬜ Phase 2 — 대화 기록 수집 (AI)
4. ⬜ Phase 3 — RAG 구축
5. ⬜ Phase 4 — 챗 UI 통합

---

## 미정 사항 (진행하면서 결정)

- [ ] 벡터DB: pgvector vs 별도 벡터DB(Chroma/Qdrant)
- [ ] 에디터: 직접 구현 vs 오픈소스 블록 에디터(BlockNote, Tiptap 등) 사용
- [ ] Claude Code 대화 자동 수집 방식 (hook? 수동 복붙? 별도 스크립트?)
- [ ] 인증 방식 (개인용이라 최소화할지, NextAuth로 통일할지)
