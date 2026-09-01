create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  category text not null default '일상',
  created_at timestamptz not null default now()
);

alter table posts add column if not exists category text not null default '일상';

create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  role text not null,
  content text not null,
  context text,
  created_at timestamptz not null default now()
);

comment on table posts is '블로그 포스팅. 목록/카테고리 필터/상세/작성 API에서 사용.';
comment on column posts.id is '기본키, UUID';
comment on column posts.title is '글 제목';
comment on column posts.content is '본문 (Tiptap 에디터가 만드는 HTML)';
comment on column posts.category is '카테고리, 기본값 일상';
comment on column posts.created_at is '작성 시각';

comment on table conversations is 'write 페이지 AI 챗에서 나눈 대화. POST /chat이 스트리밍 전후로 자동 저장하고, POST /conversations로도 독립적으로 저장 가능.';
comment on column conversations.id is '기본키, UUID';
comment on column conversations.session_id is '챗 세션 하나를 묶는 식별자 (FE에서 crypto.randomUUID()로 생성)';
comment on column conversations.role is 'user 또는 assistant 값만 사용';
comment on column conversations.content is '메시지 본문';
comment on column conversations.context is '대화 출처 구분자, 현재는 devlog-chat 값만 사용';
comment on column conversations.created_at is '저장 시각';
