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
