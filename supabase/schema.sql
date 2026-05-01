create extension if not exists pgcrypto;

create table if not exists public.letters (
  id uuid primary key default gen_random_uuid(),
  nickname text not null,
  content text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  public_preview text,
  created_at timestamptz not null default now()
);

create table if not exists public.banned_words (
  id bigint generated always as identity primary key,
  word text not null unique,
  created_at timestamptz not null default now()
);

alter table public.letters enable row level security;
alter table public.banned_words enable row level security;

drop policy if exists "public can read letters" on public.letters;
create policy "public can read letters"
on public.letters
for select
using (true);

drop policy if exists "public cannot write letters directly" on public.letters;
create policy "public cannot write letters directly"
on public.letters
for insert
with check (false);

drop policy if exists "public cannot update letters directly" on public.letters;
create policy "public cannot update letters directly"
on public.letters
for update
using (false);

drop policy if exists "public cannot delete letters directly" on public.letters;
create policy "public cannot delete letters directly"
on public.letters
for delete
using (false);

drop policy if exists "public cannot read banned words directly" on public.banned_words;
create policy "public cannot read banned words directly"
on public.banned_words
for select
using (false);

insert into public.banned_words (word)
values ('금칙어예시1'), ('금칙어예시2')
on conflict (word) do nothing;
