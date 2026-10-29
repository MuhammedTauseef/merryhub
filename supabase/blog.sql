-- MerryHub blog — database setup.
-- Run this in the Supabase SQL Editor (see ADMIN-SETUP.md). The whole
-- file is idempotent — re-running it on an already-set-up database is
-- safe (it just adds anything missing, e.g. the hero_image column and
-- the blog-images storage bucket below).
--
-- Model: a single-admin blog. The public site reads PUBLISHED posts with
-- the anon key (RLS below). All writes go through the site's admin API
-- routes, which verify the caller's Supabase Auth session + the ADMIN_EMAIL
-- allowlist server-side and then write with the service-role key (which
-- bypasses RLS). No write policies are granted to anon/authenticated
-- roles, so the table cannot be written to from the browser directly.

create table if not exists public.blog_posts (
  id             uuid primary key default gen_random_uuid(),
  slug           text not null unique,
  title          text not null,
  excerpt        text not null default '',          -- meta description (<=160 chars)
  category       text not null default 'Guides',
  target_keyword text not null default '',
  direct_answer  text not null default '',          -- 40-60 word answer block
  hero_image     text not null default '',          -- cover image URL ('' = none); uploaded to the blog-images bucket
  sections       jsonb not null default '[]'::jsonb, -- [{h2, paragraphs[], bullets[]}]
  faqs           jsonb not null default '[]'::jsonb, -- [{q, a}] (5 per post)
  related_links  jsonb not null default '[]'::jsonb, -- [{href, label}]
  status         text not null default 'draft' check (status in ('draft', 'published')),
  published_at   timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- For databases created before hero images existed: add the column if
-- it is missing (a no-op when the create-table above already made it).
alter table public.blog_posts
  add column if not exists hero_image text not null default '';

create index if not exists blog_posts_public_idx
  on public.blog_posts (status, published_at desc);

alter table public.blog_posts enable row level security;

-- Public (anon + authenticated) may read published posts only.
drop policy if exists "Published posts are public" on public.blog_posts;
create policy "Published posts are public"
  on public.blog_posts
  for select
  to anon, authenticated
  using (status = 'published');

-- No INSERT/UPDATE/DELETE policies on purpose: writes are service-role
-- only, via the admin API routes (session + ADMIN_EMAIL verified there).

-- Keep updated_at honest on every write.
create or replace function public.touch_blog_posts_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists blog_posts_touch on public.blog_posts;
create trigger blog_posts_touch
  before update on public.blog_posts
  for each row execute function public.touch_blog_posts_updated_at();

-- Cover images live in a PUBLIC storage bucket named blog-images: anyone
-- may read an image by its public URL (that is how the blog displays
-- it), while uploads happen only through the admin API route with the
-- service-role key (which bypasses storage policies), so no write
-- policies are granted here either.
insert into storage.buckets (id, name, public)
values ('blog-images', 'blog-images', true)
on conflict (id) do nothing;
