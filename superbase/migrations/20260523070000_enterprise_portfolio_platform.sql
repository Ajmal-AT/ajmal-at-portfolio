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
    coalesce(new.id, old.id),
    case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) else null end,
    case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) else null end
  );
  return coalesce(new, old);
end;
$$;

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

insert into public.profile_information (
  full_name, designation, professional_title, bio, short_intro, long_intro,
  years_of_experience, projects_delivered, happy_clients, technologies_mastered,
  availability_status, email, phone, location, github_url, linkedin_url, instagram_url, whatsapp_url, linktree_url
) values (
  'Ajmal AT',
  'Software Engineer',
  'Backend Architect & Full-Stack Developer',
  'Software engineer and tech consultant building scalable digital products, backend APIs, SaaS platforms and premium portfolio systems.',
  'Building scalable digital solutions.',
  'I help founders and teams turn ideas into reliable products through clean architecture, secure APIs, production infrastructure and careful user experience.',
  5, 60, 25, 15,
  'Available for new projects - Q2 2026',
  'hello@ajmal.dev',
  '+91 85928 17937',
  'India',
  'https://github.com/Ajmal-AT',
  'https://www.linkedin.com/in/ajmal-at/',
  'https://www.instagram.com/code.with.ajmal',
  'https://api.whatsapp.com/send/?phone=918592817937&text&type=phone_number&app_absent=0',
  'https://linktr.ee/ajmal_at'
) on conflict do nothing;

insert into public.resumes (title, type, resume_url, version, is_active) values
('Indian Resume', 'INDIAN', 'https://drive.google.com/file/d/1BfTm_RQFo9Srk7kYIHpKpUvdB30pSDfE/view', 1, true),
('International Resume', 'INTERNATIONAL', 'https://drive.google.com/file/d/14lMkK4UEcVeQla48Um9RAT3tk6sFtz_U/view', 1, true)
on conflict do nothing;

insert into public.professional_statistics (roles, years_of_experience, projects_delivered, happy_clients, technologies_mastered)
values (array['Software Engineer','Backend Architect','Full-Stack Developer','Tech Consultant'], 5, 60, 25, 15)
on conflict do nothing;

insert into public.skills (skill_name, category, proficiency_level, display_order) values
('Java','Languages',92,1),('TypeScript','Languages',90,2),('Python','Languages',84,3),('JavaScript','Languages',88,4),('SQL','Languages',90,5),
('Spring Boot','Backend',92,10),('Node.js','Backend',88,11),('FastAPI','Backend',84,12),('Microservices','Backend',90,13),('REST','Backend',94,14),('GraphQL','Backend',80,15),
('React','Frontend',90,20),('Next.js','Frontend',86,21),('TanStack','Frontend',82,22),('Tailwind CSS','Frontend',88,23),
('PostgreSQL','Data',90,30),('MySQL','Data',86,31),('MongoDB','Data',82,32),('Redis','Data',84,33),
('AWS','Cloud & DevOps',82,40),('Docker','Cloud & DevOps',88,41),('GitHub Actions','Cloud & DevOps',84,42),('CI/CD','Cloud & DevOps',86,43),('Nginx','Cloud & DevOps',80,44)
on conflict do nothing;

insert into public.technology_stack (technology_name, category, proficiency, years_of_usage, display_order)
select skill_name, category, proficiency_level, 3, display_order from public.skills
on conflict do nothing;

insert into public.software_services (title, slug, short_description, full_description, starting_price, pricing_type, icon, features, ownership_note, display_order) values
('Custom Software & SaaS','custom-software-saas','Production-grade web apps, SaaS platforms and internal tools built to scale.','End-to-end product engineering with architecture, UI, APIs, database design, deployment and handoff.',49999,'Starting price','Cpu',array['Custom software development','Web application development','SaaS platform development','Admin dashboard development','Cloud deployment'],'Monthly subscription available. Subscription does not provide ownership rights unless agreed separately.',1),
('Backend & APIs','backend-apis','REST APIs, microservices, auth, payments, queues and database architecture.','Secure backend systems designed for reliability, observability and future growth.',49999,'Custom quote','Database',array['Backend API development','Microservices architecture','Authentication and RBAC','Database architecture','Automation systems'],'Ownership and source-code rights are defined per engagement.',2),
('Enterprise Systems','enterprise-systems','Scalable operational systems for teams that need reliable workflows.','Enterprise-grade systems with audit logs, roles, analytics, integrations and monitoring.',99999,'Custom quote','Layers',array['Enterprise solutions','Role-based workflows','Audit trails','API monitoring','Performance optimization'],'Enterprise support and IP transfer are handled contractually.',3)
on conflict (slug) do nothing;

insert into public.resume_services (title, short_description, full_description, starting_price, features, delivery_time, display_order) values
('ATS Resume Rewrite','ATS-friendly Indian and international resume creation.','Outcome-driven resume writing with recruiter-friendly structure and ATS-safe formatting.',199,array['ATS-friendly resume','Indian professional resume','International resume format','Tech resume enhancement'],'2-4 business days',1),
('LinkedIn Optimization','Profile positioning for recruiters and global opportunities.','Headline, about section, experience framing and keyword optimization.',999,array['LinkedIn rewrite','Keyword optimization','Professional positioning'],'3-5 business days',2)
on conflict do nothing;

insert into public.portfolio_services (title, short_description, full_description, starting_price, features, technologies, display_order) values
('Premium Developer Portfolio','Modern animated portfolio with admin-managed content.','A polished personal brand platform with projects, testimonials, services, SEO and analytics.',5999,array['Personal portfolio websites','Developer portfolios','Premium animated portfolios','Modern UI/UX portfolios'],array['React','TypeScript','Tailwind CSS','Supabase'],1),
('Business Portfolio Platform','Conversion-focused portfolio for consultants and small businesses.','Service pages, lead capture, media, testimonials and content administration.',9999,array['Business portfolios','Admin dashboard','SEO configuration','Media management'],array['React','TanStack','Cloudinary'],2)
on conflict do nothing;

insert into public.projects (title, slug, category, short_description, full_description, tech_stack, client_name, client_feedback, featured, vip_project, status, display_order) values
('OrbitPay','orbitpay','Fintech SaaS','Multi-tenant payments platform with ledger, reconciliation and webhooks.','Case study for a scalable fintech SaaS platform.',array['Spring Boot','PostgreSQL','Kafka','AWS'],'OrbitPay','The system scaled beautifully with clean APIs and sensible defaults.',true,true,'published',1),
('DeskHQ','deskhq','B2B Dashboard','Real-time analytics dashboard for ops teams with role-based access.','Operational analytics dashboard with RBAC and deployment automation.',array['React','Node','Redis','Docker'],'DeskHQ','Excellent communication and fast delivery.',true,false,'published',2),
('Hireloop','hireloop','HR Tech','AI-assisted resume screening and pipeline automation for recruiters.','Recruiting automation product with AI-assisted workflows.',array['FastAPI','PostgreSQL','React'],'Hireloop','A rare blend of speed and craft.',true,false,'published',3)
on conflict (slug) do nothing;

insert into public.testimonials (client_name, company_name, review, rating, project_reference, moderation_status, display_order) values
('Aarav Mehta','OrbitPay','Ajmal architected our payments platform from zero to production. The system has scaled beautifully.',5,'OrbitPay','approved',1),
('Sara Khan','DeskHQ','He moves like a senior teammate: small PRs, great trade-offs and excellent communication.',5,'DeskHQ','approved',2),
('David Park','Hireloop','Ajmal turned a vague brief into a polished AI feature that our users genuinely love.',5,'Hireloop','approved',3)
on conflict do nothing;

insert into public.terminal_showcase (terminal_title, username, designation, backend_stack, frontend_stack, cloud_stack, focus_area, deploy_speed, commands)
values ('~/ajmal-at - zsh','ajmal_at','software engineer','Spring Boot - Node - FastAPI','React - Next.js - TypeScript','AWS - Docker - CI/CD','scalable systems','42ms','[{"command":"whoami"},{"command":"cat stack.json"},{"command":"deploy --prod"}]'::jsonb)
on conflict do nothing;

insert into public.featured_services (icon, title, description, pricing_text, display_order) values
('Cpu','Custom Software & SaaS','Production-grade web apps, SaaS platforms and internal tools built to scale.','From INR 49,999',1),
('Database','Backend & APIs','REST APIs, microservices, auth, payments, queues and database architecture.','Custom quote',2),
('Sparkles','Portfolios & Resumes','Premium developer portfolios and ATS-friendly resumes that convert.','From INR 199',3)
on conflict do nothing;

insert into public.career_journey (year_range, role_title, company_name, description, display_order) values
('2024 - Present','Independent Engineer & Consultant',null,'Designing SaaS platforms and backend systems for startups and enterprises.',1),
('2022 - 2024','Senior Backend Engineer',null,'Led microservices, payments and API platforms at scale.',2),
('2020 - 2022','Full-Stack Developer',null,'Shipped customer-facing web products with React and Node.',3),
('2019','Started building on the web',null,'First open-source contributions and freelance projects.',4)
on conflict do nothing;

insert into public.engineering_principles (title, description, icon, display_order) values
('Clean architecture','Modular, testable systems that survive change.','Layers',1),
('Security first','Auth, RBAC, secrets and audit baked in from day one.','ShieldCheck',2),
('Ship to learn','Tight feedback loops over speculative perfection.','Rocket',3),
('Data-driven','Schemas, indexes and queries designed with care.','Database',4),
('Trunk-based','Small PRs, CI gates and confident releases.','GitBranch',5),
('Craftsmanship','Readable code is the cheapest documentation.','Code2',6)
on conflict do nothing;

insert into public.site_sections (page_name, section_key, eyebrow, heading, body, cta_label, cta_url, secondary_cta_label, secondary_cta_url, display_order) values
('home','hero',null,'Building scalable digital solutions','I help startups and enterprises ship robust APIs, SaaS platforms and developer products that scale.','Hire Me','/contact','View Projects','/projects',1),
('home','services','// services','What I build',null,'Explore all services','/services',null,null,2),
('home','stack','tech stack','A toolkit engineered for production.',null,null,null,null,null,3),
('home','cta',null,'Have an idea worth building?','From a quick consultation to a full enterprise build, let us ship something exceptional.','Start a project','/contact','See pricing','/services',4),
('about','hero','// about','Engineer obsessed with scalable, well-crafted software.','I help founders and teams turn ideas into reliable products through backend architecture, API design and developer experience.',null,null,null,null,1),
('services','hero','// services & pricing','Engineered offerings, transparent starting prices.','Three focused tracks: build software that scales, polish a resume that opens doors, and ship a portfolio that converts.',null,null,null,null,1),
('projects','hero','// featured work','Selected projects across SaaS, APIs and modern web.','A curated set of shipped products: startup MVPs, enterprise platforms and developer tools.',null,null,null,null,1),
('resume','hero','// resume','A resume engineered to open doors.','Pick the version that fits: view it in the browser or download the PDF.',null,null,null,null,1),
('testimonials','hero','// testimonials','Trusted by founders, teams and enterprises.','A few words from people I have shipped great work with.',null,null,null,null,1)
on conflict (page_name, section_key) do nothing;

insert into public.seo_configurations (page_name, title, meta_description, og_title, og_description, canonical_url, keywords) values
('home','Ajmal AT - Software Engineer, Backend Architect & Full-Stack Developer','Building scalable digital solutions. Custom software, SaaS platforms, backend APIs and premium portfolios engineered to enterprise standards.','Ajmal AT - Software Engineer & Tech Consultant','Transforming ideas into enterprise-grade applications.','/',array['Ajmal AT','software engineer','backend architect','full-stack developer']),
('about','About - Ajmal AT, Software Engineer','Career journey, engineering principles and production technology stack.','About Ajmal AT','Engineering principles, journey and stack.','/about',array['software engineer','clean architecture']),
('services','Services & Pricing - Ajmal AT','Custom software, SaaS development, backend APIs, premium portfolios and ATS-friendly resumes.','Services & Pricing - Ajmal AT','Software, SaaS, portfolios and resumes.','/services',array['software services','resume services','portfolio services']),
('projects','Projects - Ajmal AT','Featured software projects: SaaS platforms, backend APIs, dashboards and premium developer products.','Featured Projects - Ajmal AT','Selected work across SaaS, APIs and modern web.','/projects',array['software projects','SaaS','APIs']),
('resume','Resume - Ajmal AT','View or download Ajmal AT resumes in Indian and international versions.','Resume - Ajmal AT','Software engineer resume in Indian and international formats.','/resume',array['resume','software engineer resume']),
('testimonials','Testimonials - Ajmal AT','What clients say about working with Ajmal AT.','Testimonials - Ajmal AT','Trusted by founders, teams and enterprises.','/testimonials',array['testimonials','client reviews'])
on conflict (page_name) do nothing;
