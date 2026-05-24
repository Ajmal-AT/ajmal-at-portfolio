alter type public.app_role add value if not exists 'SUPER_ADMIN';
alter type public.app_role add value if not exists 'ADMIN';
alter type public.app_role add value if not exists 'EDITOR';

create or replace function public.has_staff_role(_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id
    and role::text in ('SUPER_ADMIN', 'ADMIN', 'EDITOR', 'admin')
  )
$$;

create or replace function public.has_admin_role(_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id
    and role::text in ('SUPER_ADMIN', 'ADMIN', 'admin')
  )
$$;

create or replace function public.audit_content_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.audit_logs (actor_id, action, table_name, record_id, before_data, after_data)
  values (
    auth.uid(),
    tg_op,
    tg_table_name,
    case when tg_op = 'DELETE' then old.id else new.id end,
    case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) else null end,
    case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) else null end
  );
  return coalesce(new, old);
end;
$$;

insert into storage.buckets (id, name, public)
values ('portfolio-media', 'portfolio-media', true)
on conflict (id) do nothing;

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  table_name text not null,
  record_id uuid,
  before_data jsonb,
  after_data jsonb,
  ip_address text,
  created_at timestamptz not null default now()
);
alter table public.audit_logs enable row level security;

create table if not exists public.profile_information (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  designation text,
  professional_title text,
  bio text,
  short_intro text,
  long_intro text,
  years_of_experience integer default 0,
  projects_delivered integer default 0,
  happy_clients integer default 0,
  technologies_mastered integer default 0,
  profile_image text,
  hero_background text,
  availability_status text,
  email text,
  phone text,
  location text,
  github_url text,
  linkedin_url text,
  instagram_url text,
  whatsapp_url text,
  linktree_url text,
  is_active boolean not null default true,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.resumes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  type text not null check (type in ('INDIAN', 'INTERNATIONAL')),
  resume_url text not null,
  thumbnail text,
  version integer not null default 1,
  downloads_count integer not null default 0,
  views_count integer not null default 0,
  is_active boolean not null default true,
  uploaded_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  skill_name text not null,
  category text not null,
  proficiency_level integer not null default 80 check (proficiency_level between 0 and 100),
  logo_url text,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.software_services (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  short_description text,
  full_description text,
  starting_price numeric(12,2),
  pricing_type text,
  icon text,
  image_url text,
  features text[] not null default '{}',
  ownership_note text,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.resume_services (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  short_description text,
  full_description text,
  starting_price numeric(12,2),
  features text[] not null default '{}',
  delivery_time text,
  image_url text,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.portfolio_services (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  short_description text,
  full_description text,
  starting_price numeric(12,2),
  features text[] not null default '{}',
  technologies text[] not null default '{}',
  image_url text,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  category text,
  short_description text,
  full_description text,
  tech_stack text[] not null default '{}',
  client_name text,
  client_feedback text,
  project_url text,
  github_url text,
  thumbnail text,
  gallery_images text[] not null default '{}',
  demo_video text,
  featured boolean not null default false,
  vip_project boolean not null default false,
  delivery_date date,
  status text default 'published',
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  client_name text not null,
  client_email text,
  client_image text,
  company_name text,
  review text not null,
  rating integer not null default 5 check (rating between 1 and 5),
  project_reference text,
  project_image text,
  video_testimonial text,
  moderation_status text not null default 'approved',
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.professional_statistics (
  id uuid primary key default gen_random_uuid(),
  roles text[] not null default '{}',
  years_of_experience integer not null default 0,
  projects_delivered integer not null default 0,
  happy_clients integer not null default 0,
  technologies_mastered integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.technology_stack (
  id uuid primary key default gen_random_uuid(),
  technology_name text not null,
  logo_url text,
  category text,
  official_website text,
  proficiency integer default 80 check (proficiency between 0 and 100),
  years_of_usage numeric(4,1) default 1,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.seo_configurations (
  id uuid primary key default gen_random_uuid(),
  page_name text not null unique,
  title text not null,
  meta_description text,
  og_title text,
  og_description text,
  canonical_url text,
  keywords text[] not null default '{}',
  favicon text,
  og_image text,
  structured_data jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.terminal_showcase (
  id uuid primary key default gen_random_uuid(),
  terminal_title text,
  username text,
  designation text,
  backend_stack text,
  frontend_stack text,
  cloud_stack text,
  focus_area text,
  deploy_speed text,
  commands jsonb not null default '[]'::jsonb,
  animation_values jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.featured_services (
  id uuid primary key default gen_random_uuid(),
  icon text,
  title text not null,
  description text,
  pricing_text text,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.career_journey (
  id uuid primary key default gen_random_uuid(),
  year_range text not null,
  role_title text not null,
  company_name text,
  description text,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.engineering_principles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  icon text,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_sections (
  id uuid primary key default gen_random_uuid(),
  page_name text not null,
  section_key text not null,
  eyebrow text,
  heading text,
  body text,
  cta_label text,
  cta_url text,
  secondary_cta_label text,
  secondary_cta_url text,
  media_url text,
  metadata jsonb not null default '{}'::jsonb,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (page_name, section_key)
);

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'cloudinary',
  asset_type text,
  file_name text,
  public_url text not null,
  storage_path text,
  alt_text text,
  metadata jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists skills_category_order_idx on public.skills (category, display_order);
create index if not exists projects_featured_order_idx on public.projects (featured, display_order);
create index if not exists site_sections_page_order_idx on public.site_sections (page_name, display_order);

do $$
declare
  t text;
begin
  foreach t in array array[
    'profile_information','resumes','skills','software_services','resume_services','portfolio_services',
    'projects','testimonials','professional_statistics','technology_stack','seo_configurations',
    'terminal_showcase','featured_services','career_journey','engineering_principles','site_sections',
    'media_assets'
  ]
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "%I public active read" on public.%I', t, t);
    execute format('drop policy if exists "%I staff read" on public.%I', t, t);
    execute format('drop policy if exists "%I staff insert" on public.%I', t, t);
    execute format('drop policy if exists "%I staff update" on public.%I', t, t);
    execute format('drop policy if exists "%I staff delete" on public.%I', t, t);
    execute format('create policy "%I public active read" on public.%I for select to anon, authenticated using (coalesce(is_active, true) = true)', t, t);
    execute format('create policy "%I staff read" on public.%I for select to authenticated using (public.has_staff_role(auth.uid()))', t, t);
    execute format('create policy "%I staff insert" on public.%I for insert to authenticated with check (public.has_staff_role(auth.uid()))', t, t);
    execute format('create policy "%I staff update" on public.%I for update to authenticated using (public.has_staff_role(auth.uid())) with check (public.has_staff_role(auth.uid()))', t, t);
    execute format('create policy "%I staff delete" on public.%I for delete to authenticated using (public.has_admin_role(auth.uid()))', t, t);
  end loop;
end $$;

drop policy if exists "audit logs staff read" on public.audit_logs;
create policy "audit logs staff read" on public.audit_logs for select to authenticated
using (public.has_staff_role(auth.uid()));

do $$
declare
  t text;
begin
  foreach t in array array[
    'profile_information','resumes','skills','software_services','resume_services','portfolio_services',
    'projects','testimonials','professional_statistics','technology_stack','seo_configurations',
    'terminal_showcase','featured_services','career_journey','engineering_principles','site_sections',
    'media_assets'
  ]
  loop
    execute format('drop trigger if exists %I_audit on public.%I', t, t);
    execute format('create trigger %I_audit after insert or update or delete on public.%I for each row execute function public.audit_content_change()', t, t);
    if exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = t and column_name = 'updated_at'
    ) then
      execute format('drop trigger if exists %I_set_updated_at on public.%I', t, t);
      execute format('create trigger %I_set_updated_at before update on public.%I for each row execute function public.set_updated_at()', t, t);
    end if;
  end loop;
end $$;