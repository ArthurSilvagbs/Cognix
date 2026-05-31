-- ============================================================
-- Cognix — SQL Schema
-- Cole no Supabase: SQL Editor > New Query > Run
-- ============================================================

-- Perfil do usuário (XP, nível, conquistas)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null default 'Estudante',
  xp integer not null default 0,
  level integer not null default 1,
  unlocked_achievements text[] not null default '{}'
);
alter table public.profiles enable row level security;
create policy "profiles_own" on public.profiles for all using (auth.uid() = id);

-- Trigger: cria perfil automaticamente no cadastro
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', 'Estudante'));
  return new;
end;
$$;

-- Impede execução pública da função (segurança)
revoke execute on function public.handle_new_user() from public;
revoke execute on function public.handle_new_user() from anon;
revoke execute on function public.handle_new_user() from authenticated;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Grupos de estudo
create table public.groups (
  id uuid primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  description text,
  color text not null,
  emoji text not null,
  created_at timestamptz not null default now()
);
alter table public.groups enable row level security;
create policy "groups_own" on public.groups for all using (auth.uid() = user_id);

-- Tarefas
create table public.tasks (
  id uuid primary key,
  user_id uuid references auth.users on delete cascade not null,
  group_id uuid references public.groups on delete set null,
  title text not null,
  subject text not null,
  priority text not null,
  type text not null,
  status text not null default 'pending',
  due_date date,
  estimated_min integer not null,
  description text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);
alter table public.tasks enable row level security;
create policy "tasks_own" on public.tasks for all using (auth.uid() = user_id);

-- Sessões de estudo
create table public.sessions (
  id uuid primary key,
  user_id uuid references auth.users on delete cascade not null,
  group_id uuid references public.groups on delete set null,
  subject text not null,
  duration_min integer not null,
  date date not null,
  notes text,
  created_at timestamptz not null default now()
);
alter table public.sessions enable row level security;
create policy "sessions_own" on public.sessions for all using (auth.uid() = user_id);

-- Matérias por grupo
create table public.subjects (
  id uuid primary key,
  user_id uuid references auth.users on delete cascade not null,
  group_id uuid references public.groups on delete cascade not null,
  name text not null,
  created_at timestamptz not null default now(),
  unique (group_id, name)
);
alter table public.subjects enable row level security;
create policy "subjects_own" on public.subjects for all using (auth.uid() = user_id);

-- Sessões de estudo
create table public.sessions (
  id uuid primary key,
  user_id uuid references auth.users on delete cascade not null,
  group_id uuid references public.groups on delete set null,
  subject text not null,
  duration_min integer not null,
  date date not null,
  notes text,
  created_at timestamptz not null default now()
);
alter table public.sessions enable row level security;
create policy "sessions_own" on public.sessions for all using (auth.uid() = user_id);

-- Ciclos de estudo semanais
create table public.study_cycles (
  id uuid primary key,
  user_id uuid references auth.users on delete cascade not null,
  group_id uuid references public.groups on delete set null,
  subject text not null,
  planned_min integer not null,
  days_of_week integer[] not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.study_cycles enable row level security;
create policy "cycles_own" on public.study_cycles for all using (auth.uid() = user_id);

-- Novas colunas na tabela sessions (rodar via ALTER no Supabase SQL Editor)
-- alter table public.sessions add column if not exists cycle_id uuid references public.study_cycles on delete set null;
-- alter table public.sessions add column if not exists actual_min integer;

-- Exercícios
create table public.exercises (
  id uuid primary key,
  user_id uuid references auth.users on delete cascade not null,
  group_id uuid references public.groups on delete set null,
  title text not null,
  language text not null,
  difficulty text not null,
  topic_tags text[] not null default '{}',
  description text not null,
  starter_code text,
  user_code text,
  status text not null default 'pending',
  is_starred boolean not null default false,
  feedback text,
  created_at timestamptz not null default now()
);
alter table public.exercises enable row level security;
create policy "exercises_own" on public.exercises for all using (auth.uid() = user_id);
