# CLAUDE.md — devlog-llm

새 세션(다른 PC, 다른 AI 포함)에서 이 프로젝트를 이어받을 때 먼저 읽는 파일. 자세한 배경은
`STRATEGY.md`(무엇을 만들지), `PLANNING.md`(왜 만들고 뭘 성공으로 볼지), `docs/devlog/{fe,api}.md`(날짜별
상세 작업 이력)를 참고.

---

## 프로젝트 한 줄 요약

노션처럼 쓸 수 있는 개인 개발 블로그 + 그 글로 학습하는 개인용 AI. 사용자는 나 자신 하나뿐인 개인 프로젝트.
핵심 가설은 "AI를 잘 쓰는 패턴은 기록·분석하면 재사용 가능한 지식이 된다" (PLANNING.md 참고).

## 현재 상태 (2026-09-01 기준)

- **Phase 1(블로그 뼈대) 완료**: 글 작성/조회/카테고리 필터/상세 페이지까지 FE+API 연동 완료
- **Phase 2(대화 기록 수집) 완료**: Groq 연동(`POST /chat`, SSE 스트리밍), `conversations` 테이블 자동 저장,
  "이 대화로 초안 만들기"(대화 → 에디터 삽입, 최소 버전) — 전부 로컬에서 실제 동작 확인됨. 상세는
  `docs/devlog/{api,fe}.md`의 2026-09-01 항목 참고
- **배포 완료**: FE(Vercel), API(Render) — 아래 링크 참고. 단, 이번 세션 변경사항(Groq 연동 등)은 아직
  로컬에서만 확인, 배포 환경에는 반영 전 (Render에 `GROQ_API_KEY` 환경변수 추가 필요)
- **미해결**: Render `ALLOWED_ORIGINS`가 아직 `http://localhost:3010`로 남아있어서, 배포된 사이트에서
  브라우저가 직접 호출하는 `/write` 저장이 CORS로 막혀있음. Vercel URL로 업데이트 필요

## 아키텍처

```
apps/fe   - Next.js (블로그 에디터/뷰어 + AI 챗 UI)
apps/api  - Python + FastAPI (포스트 CRUD + 대화 수집 + 임베딩/RAG, 전부 하나로 통합)
```

원래 BE(글 CRUD)와 AI(대화 수집·RAG)를 서비스 두 개로 나눌 계획이었으나, 혼자 쓰는 프로젝트에서 나눌
이유가 없어 `apps/api` 하나로 통합. 백엔드 언어는 NestJS → Go → Python 순으로 하루 만에 세 번 바뀌었는데,
이유와 교훈은 `docs/devlog/api.md`의 2026-08-31 항목에 상세히 기록되어 있음 — 요약하면 "취업 준비 불안이
무관한 기술 선택에 새어 들어온 것"이었고, Python으로 확정한 진짜 이유는 AI/LLM 생태계 때문.

## 로컬 개발

**API (`apps/api`)**
```bash
cd apps/api
source venv/bin/activate
uvicorn app.main:app --port 8000
```
`.env` 필요 (`.env.example` 참고): `SUPABASE_URL`, `SUPABASE_KEY`(secret 키, publishable 아님 — 아래 참고),
`ALLOWED_ORIGINS`.

> ⚠️ `.env`는 반드시 `apps/api/.env`에 있어야 함 (`apps/api/app/.env` 아님). `python-dotenv`는 실행 디렉터리
> 기준 상위로만 탐색해서 하위 경로는 못 찾음 — 과거 이 실수를 두 번 반복함.

**FE (`apps/fe`)**
```bash
pnpm --filter fe dev --port 3010
```
`.env.local` 필요: `NEXT_PUBLIC_API_URL=http://localhost:8000`. 포트는 3000 대신 3010 사용 —
`smpay-frontend-monorepo` 등 다른 프로젝트의 3000번 개발 서버와 충돌 가능.

## 배포

| | URL |
|---|---|
| FE (Vercel) | https://devlog-llm-fe.vercel.app |
| API (Render) | https://devlog-llm.onrender.com |

- Vercel: Root Directory를 `apps/fe`로 수동 설정해야 함 (모노레포라 자동 감지 안 됨)
- Render: `render.yaml`(Blueprint)을 준비해뒀으나 대시보드에 Blueprint 메뉴가 안 보여서 **Web Service를
  수동 생성**해서 배포함 (Root Directory `apps/api`, Build `pip install -r requirements.txt`, Start
  `uvicorn app.main:app --host 0.0.0.0 --port $PORT`). 필요시 Blueprint 방식 재시도 가능.
- Render 무료 티어는 무활동 시 슬립됨 (콜드스타트 발생 가능) — 필요해지면 `Inote Money`에서 썼던 것처럼
  헬스체크 핑 방식 도입 검토.

## Git / GitHub 계정 (중요 — 새 머신에서는 재설정 필요)

이 레포는 개인 계정 `seo337dc` 전용으로 쓰도록 **로컬 전용** git 설정을 해뒀음 (`.git/config`, 커밋되지
않으므로 새로 클론하면 없음):
- `user.name`/`user.email`을 `seo337dc` 명의로 로컬 설정
- push 인증도 `seo337dc` 토큰만 쓰도록 `credential.helper` 로컬 오버라이드
- GitHub Actions 워크플로 파일을 푸시하려면 `seo337dc` 토큰에 `workflow` 스코프가 있어야 함
  (`gh auth switch --hostname github.com --user seo337dc` → `gh auth refresh -h github.com --scopes repo,workflow`
  → 다시 원래 계정으로 `gh auth switch` — `gh auth refresh`엔 계정 지정 플래그가 없어서 반드시 switch 후 실행해야 함)

## 알아둘 것 (겪었던 문제들)

- **ruff**: `apps/api/pyproject.toml`에 `target-version = "py39"` 명시 필수. 없으면 `Optional[X]` →
  `X | None` 같은 3.10+ 문법을 자동 제안하는데, 실제 런타임(Python 3.9)에서 깨짐.
- **pydantic 모델의 `X | None`**: 일반 변수/함수 시그니처는 `from __future__ import annotations`를 켜면
  Python 3.9에서도 `X | None`이 안전하지만(`db/supabase.py`), **pydantic `BaseModel` 필드**는 런타임에
  애노테이션을 다시 eval해서 3.9에서 그대로 깨짐(`TypeError: unsupported operand type(s) for |`). 모델
  필드는 무조건 `typing.Optional[X]` 사용.
- **CI-FE**: 빌드 전에 `tsc --noEmit`를 별도로 돌리면 안 됨 — Next.js가 `next build` 시점에 자동 생성하는
  `PageProps`/`LayoutProps` 타입(`.next/types`, gitignore 대상)이 아직 없어서 실패함. `next build`가 이미
  자체 타입체크를 포함하므로 그걸로 충분.
- **Supabase 키**: 최근 anon/service_role(JWT) 체계에서 `sb_publishable_*`/`sb_secret_*` 체계로 바뀜.
  서버(API)에서는 RLS 우회가 되는 **secret** 키를 써야 함 — publishable 키를 쓰면
  `new row violates row-level security policy` 에러 발생.

## 다음 할 일

- [ ] Render `ALLOWED_ORIGINS`를 Vercel 배포 URL로 업데이트
- [ ] Render에 `GROQ_API_KEY` 환경변수 추가 (배포 환경에서도 `/chat` 동작하려면 필요)
- [ ] UI 전반 재검토 (사용자와 다음 세션에서 진행 예정)
- [x] `POST /chat` — 실제 LLM(Groq) 응답 연동, SSE 스트리밍 (2026-09-01)
- [x] `POST /conversations` — 대화 저장 API + `conversations` 테이블, `/chat`이 자동 저장 (2026-09-01)
- [x] AI와 대화하며 블로그를 자동으로 작성하는 기능 — 최소 버전(대화 그대로 이어붙이기) (2026-09-01)
- [ ] 임베딩 + 벡터DB(pgvector) 저장, RAG 검색 — 데이터 축적 후 진행 (STRATEGY.md Phase 3)
- [ ] 이미지 업로드, 글자 크기/스타일 등 에디터 기능 확장
