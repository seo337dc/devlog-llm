# FE 개발 로그

> `apps/fe` (Next.js) 관련 작업만 기록.

---

## 2026-08-31 (이어서 5) — 레이아웃 전면 재구성 + AI 패널 추가

사용자 피드백: 사이드바가 중앙 정렬 컨테이너 때문에 화면 왼쪽에 큰 여백을 두고 떠 있는 것처럼 보임 (실제
스크린샷 기준). "왼쪽으로 쭉 밀어라", "write 페이지에도 사이드바 나오게", "공간 넓혀라", "AI 버튼 누르면
화면 반이 AI 패널로 열리게" 요청.

### 작업 내용

| # | 작업 | 상태 |
|---|------|------|
| 1 | `Sidebar`를 `page.tsx`가 아니라 루트 `layout.tsx`로 이동 — 모든 페이지(`/`, `/write`, `/posts/[id]`)에 공통 적용 | ✅ |
| 2 | `Sidebar`를 client component로 전환, `usePathname`/`useSearchParams`로 활성 카테고리 직접 계산 (layout은 searchParams를 못 받음) | ✅ |
| 3 | `layout.tsx`에서 `getPosts()` 호출해 카테고리 집계 후 `Sidebar`에 전달 | ✅ |
| 4 | 홈(`page.tsx`)에서 `mx-auto max-w-5xl` 전체 폭 제한 제거 — 사이드바는 화면 끝에 flush, 본문만 `max-w-3xl`로 가독성 유지 | ✅ |
| 5 | `components/AIPanel.tsx` 신규 — 우하단 플로팅 "AI" 버튼 + 클릭 시 화면 우측 절반(`w-1/2`) 슬라이드인 채팅 패널 | ✅ |
| 6 | 브라우저로 사이드바 flush 배치, write 페이지 사이드바 노출, AI 패널 열림/입력까지 확인 | ✅ |

### 참고

- AI 패널은 지금 **UI 뼈대만** — 실제 LLM 응답 없음, 로컬 state로 사용자 메시지만 쌓임. 첫 메시지로 "아직
  실제 학습된 답변 아님"을 명시해둠. 실제 연동은 Phase 2(대화 수집)·Phase 3(RAG) 이후.
- `useSearchParams`를 쓰는 client component는 Suspense 경계가 필요해서 `layout.tsx`에서 `<Suspense>`로 감쌈.

---

## 2026-08-31 (이어서 7) — AI 리모트 반화면으로 확정, write 미리보기 토글

write 페이지의 에디터/AI 반반 스플릿을 확인한 사용자가 "이거였다"고 확인 — 이전에 "AI는 패널이 아니라
화면으로"라고 했던 요청이 사실 "반화면"을 의미했던 것으로 정정. 전체화면 오버레이를 다시 반화면으로 되돌림.

### 작업 내용

| # | 작업 | 상태 |
|---|------|------|
| 1 | `AIPanel` — 전체화면(`inset-0`) → 반화면(`inset-y-0 right-0 w-1/2`)으로 되돌림, 닫기 버튼 동작 확인 | ✅ |
| 2 | `/write` — 제목 옆에 "미리보기"/"편집으로" 토글 버튼 추가, 클릭 시 에디터 대신 실제 발행됐을 때의 모습(`prose` 렌더링)을 보여줌 | ✅ |
| 3 | 브라우저로 AI 반화면 열기/닫기, 미리보기 토글 전부 확인 | ✅ |

---

## 2026-08-31 (이어서 6) — 햄버거 드로어, AI 전체화면, Tiptap 에디터, write 반반 스플릿

추가 피드백: 사이드바를 상시 노출 대신 햄버거로 토글, AI는 패널이 아니라 전체화면, 본문은 노션처럼
마크다운 입력이 되는 리치 에디터로, 그리고 write 화면은 에디터/AI를 반반으로 나눠서 대화하며 쓸 수 있게.

### 작업 내용

| # | 작업 | 상태 |
|---|------|------|
| 1 | `Sidebar` — 상시 노출 → 햄버거 버튼(fixed) + 오버레이 드로어(기본 닫힘)로 전환 | ✅ |
| 2 | `layout.tsx` — 사이드바가 실제 레이아웃 폭을 차지하지 않도록 `flex` 분할 제거 | ✅ |
| 3 | `@tiptap/react` + `@tiptap/starter-kit` 도입, `components/Editor.tsx` — 툴바(H1/H2/B/I/목록/코드) + 마크다운 입력 규칙 지원 리치 에디터 | ✅ |
| 4 | `@tailwindcss/typography` 추가 — 상세 페이지에서 에디터 HTML 출력을 `prose` 클래스로 렌더링 | ✅ |
| 5 | `AIChat.tsx`로 채팅 UI(메시지 목록+입력폼)를 재사용 가능한 컴포넌트로 분리 | ✅ |
| 6 | `AIPanel.tsx` — 우하단 버튼 클릭 시 반쪽 패널 대신 **전체화면** 오버레이로 변경, `/write` 경로에서는 버튼 자체를 숨김 | ✅ |
| 7 | `/write` 페이지 — 좌: 제목/분류/에디터, 우: `AIChat` 인라인 배치로 화면을 정확히 반반 분할 | ✅ |

### 참고

- 게시글 저장 포맷을 plain text → Tiptap의 `getHTML()` 결과(HTML 문자열)로 변경. 상세 페이지는
  `dangerouslySetInnerHTML` + `prose` 클래스로 렌더링. 개인 단독 사용자 블로그라 XSS 리스크를 감수할 만하다고
  판단(본인 글만 저장/렌더링됨).
- 홈 목록의 요약(excerpt)은 HTML 태그를 정규식으로 벗겨서 텍스트만 보여주도록 처리.
- write 페이지의 `AIChat`은 아직 실제 LLM 연동 전 — 다음 단계(대화 저장 API + Groq 연동)에서 실제로
  "AI와 대화하며 블로그 자동 작성" 기능을 붙일 예정.

### 다음 할 일

- [ ] `POST /conversations` — 대화 저장 API (Phase 2, Groq API 키 필요)
- [ ] AIChat이 실제 Groq 응답을 받도록 연동
- [ ] AI 응답으로 에디터 내용을 채우는 "자동 작성" 기능
- [ ] 이미지 업로드, 글자 크기/스타일 등 에디터 기능 확장

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

---

## 2026-08-31 (이어서 2) — 노션 + 티스토리 느낌 레이아웃

사용자가 실제 티스토리 블로그(사이드바 카테고리)와 노션 페이지(제목/본문 타이포그래피) 스크린샷을 참고자료로
주고, 이 둘을 섞은 느낌으로 요청.

### 작업 내용

| # | 작업 | 상태 |
|---|------|------|
| 1 | `posts` 테이블에 `category` 컬럼 추가 (기본값 `'일상'`) | ✅ |
| 2 | `GET /posts/{id}` 단건 조회 API 추가 | ✅ |
| 3 | `components/Sidebar.tsx` — 티스토리 스타일 카테고리 목록(글 수 포함), `?category=` 쿼리로 필터 | ✅ |
| 4 | `/` — 사이드바 + 글 목록(제목/카테고리/날짜/요약) 서버 컴포넌트로 재작성 | ✅ |
| 5 | `/write` — 제목/분류/본문 작성 폼 별도 페이지로 분리 | ✅ |
| 6 | `/posts/[id]` — 노션 스타일 상세 페이지(카테고리 · 제목 · 날짜 · 본문, 넉넉한 여백) | ✅ |
| 7 | 브라우저로 작성 → 상세 이동 → 목록/카테고리 필터까지 전체 흐름 확인 | ✅ |

### 결과

목록(티스토리식 사이드바+카드) / 상세(노션식 타이포그래피) / 작성 페이지 분리까지 완료. 아직 본문은 plain
textarea + `whitespace-pre-wrap` 렌더링 — 리치 텍스트 에디터는 여전히 다음 단계.

### 다음 할 일

- [ ] 노션 스타일 리치 에디터 (Tiptap 등) 도입
- [ ] `POST /conversations` — 대화 수집 API (Phase 2)

---

## 2026-08-31 (이어서 4) — CI 세팅 + Vercel 배포 준비

### 작업 내용

| # | 작업 | 상태 |
|---|------|------|
| 1 | `.github/workflows/ci-fe.yml` — `apps/fe/**` 변경 시에만 트리거, typecheck + lint + build | ✅ |
| 2 | 로컬에서 `tsc --noEmit`, `pnpm lint`, `pnpm build` 전부 통과 확인 후 워크플로 작성 | ✅ |

### 배포 (예정)

- Vercel 대시보드에서 이 레포 연결, **Root Directory를 `apps/fe`로 설정** (모노레포라 필수)
- 환경변수 `NEXT_PUBLIC_API_URL`을 Render에 배포된 API의 실제 URL로 설정
- Vercel은 GitHub 연동만 해두면 push마다 자동 배포 — 별도 GitHub Actions CD 불필요
