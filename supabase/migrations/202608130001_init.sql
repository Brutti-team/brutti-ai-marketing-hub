create extension if not exists pgcrypto;

create table if not exists public.staff_members (
  email text primary key,
  role text not null default 'editor',
  created_at timestamptz not null default now()
);

alter table public.staff_members enable row level security;

create or replace function public.is_brutti_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.staff_members
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

grant execute on function public.is_brutti_staff() to authenticated;

create policy "staff can read own membership"
on public.staff_members for select to authenticated
using (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));

create table if not exists public.content_items (
  id text primary key default gen_random_uuid()::text,
  title text not null,
  platform text not null default 'Facebook',
  content_type text not null,
  product text not null default 'General / No Product',
  language text not null default 'Bahasa Melayu',
  tone text not null default 'Warm & confident',
  source_facts text,
  copy text not null,
  ai_review_status text not null default 'Human Review Required',
  ai_review jsonb not null default '{}'::jsonb,
  stage text not null default 'Draft',
  approved_at timestamptz,
  approved_by uuid references auth.users(id),
  published_at timestamptz,
  meta_post_id text,
  notion_page_id text,
  created_by uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.content_plans (
  id text primary key default gen_random_uuid()::text,
  title text not null,
  plan_date date not null,
  channel text not null default 'Facebook',
  content_type text not null,
  status text not null default 'Idea',
  product text not null default 'General / No Product',
  content_id text references public.content_items(id) on delete set null,
  created_by uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.assets (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  source text not null default 'Supabase',
  storage_path text,
  drive_file_id text,
  mime_type text,
  product text,
  verified boolean not null default false,
  created_by uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.integration_runs (
  id uuid primary key default gen_random_uuid(),
  integration text not null,
  action text not null,
  status text not null,
  details jsonb not null default '{}'::jsonb,
  created_by uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now()
);

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists content_items_touch_updated_at on public.content_items;
create trigger content_items_touch_updated_at
before update on public.content_items
for each row execute function public.touch_updated_at();

drop trigger if exists content_plans_touch_updated_at on public.content_plans;
create trigger content_plans_touch_updated_at
before update on public.content_plans
for each row execute function public.touch_updated_at();

drop trigger if exists assets_touch_updated_at on public.assets;
create trigger assets_touch_updated_at
before update on public.assets
for each row execute function public.touch_updated_at();

alter table public.content_items enable row level security;
alter table public.content_plans enable row level security;
alter table public.assets enable row level security;
alter table public.integration_runs enable row level security;

create policy "authenticated staff manage content"
on public.content_items for all to authenticated
using (public.is_brutti_staff()) with check (public.is_brutti_staff());

create policy "authenticated staff manage plans"
on public.content_plans for all to authenticated
using (public.is_brutti_staff()) with check (public.is_brutti_staff());

create policy "authenticated staff manage assets"
on public.assets for all to authenticated
using (public.is_brutti_staff()) with check (public.is_brutti_staff());

create policy "authenticated staff read integration runs"
on public.integration_runs for select to authenticated
using (public.is_brutti_staff());

create policy "authenticated staff create integration runs"
on public.integration_runs for insert to authenticated
with check (public.is_brutti_staff());

insert into storage.buckets (id, name, public)
values ('brutti-assets', 'brutti-assets', false)
on conflict (id) do nothing;

create policy "authenticated staff read brutti assets"
on storage.objects for select to authenticated
using (bucket_id = 'brutti-assets' and public.is_brutti_staff());

create policy "authenticated staff upload brutti assets"
on storage.objects for insert to authenticated
with check (bucket_id = 'brutti-assets' and public.is_brutti_staff());

create policy "authenticated staff update brutti assets"
on storage.objects for update to authenticated
using (bucket_id = 'brutti-assets' and public.is_brutti_staff());

create policy "authenticated staff delete brutti assets"
on storage.objects for delete to authenticated
using (bucket_id = 'brutti-assets' and public.is_brutti_staff());
