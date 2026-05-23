-- Roles
create type public.app_role as enum ('admin', 'user');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

-- Auto-create profile + default role on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email,'@',1)),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;

  insert into public.user_roles (user_id, role)
  values (new.id, 'user')
  on conflict do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- updated_at helper
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- Profiles RLS
create policy "Profiles are viewable by owner"
on public.profiles for select to authenticated
using (auth.uid() = id);

create policy "Admins can view all profiles"
on public.profiles for select to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "Users can update own profile"
on public.profiles for update to authenticated
using (auth.uid() = id);

-- user_roles RLS
create policy "Users can read own roles"
on public.user_roles for select to authenticated
using (auth.uid() = user_id);

create policy "Admins can read all roles"
on public.user_roles for select to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can manage roles"
on public.user_roles for all to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

-- Inquiries (contact form)
create table public.inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  service text,
  budget text,
  timeline text,
  message text not null,
  handled boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.inquiries enable row level security;

create policy "Anyone can submit an inquiry"
on public.inquiries for insert to anon, authenticated
with check (
  length(name) between 1 and 120 and
  length(email) between 3 and 255 and
  length(message) between 1 and 4000
);

create policy "Admins can read inquiries"
on public.inquiries for select to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can update inquiries"
on public.inquiries for update to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can delete inquiries"
on public.inquiries for delete to authenticated
using (public.has_role(auth.uid(), 'admin'));
