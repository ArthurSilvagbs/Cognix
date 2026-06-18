-- Cognix v2 — schema inicial (fatia ALIMENTAR→RECEBER).
-- Cole e rode no SQL Editor do Supabase (https://supabase.com/dashboard →
-- seu projeto → SQL Editor). Pode ser reexecutado (usa if not exists / drops).
--
-- Modelo (Fase 2): Plano → Matéria → Tópico (entidade central; tópico avulso =
-- materia_id null). Revisões e sessões entram na próxima fatia.
-- RLS liga cada linha ao dono (auth.uid()): cada usuário só vê o que é dele —
-- é isso que torna o app "por usuário" de verdade.

-- updated_at automático em qualquer UPDATE
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------- PLANOS ----------
create table if not exists public.planos (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  nome       text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- MATÉRIAS ----------
create table if not exists public.materias (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  plano_id   uuid not null references public.planos(id) on delete cascade,
  nome       text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- TÓPICOS (entidade central) ----------
create table if not exists public.topicos (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  materia_id uuid references public.materias(id) on delete cascade, -- null = avulso
  titulo     text not null,
  estado     text not null default 'a-estudar'
             check (estado in ('a-estudar','em-estudo','em-revisao','dominado')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- triggers updated_at ----------
drop trigger if exists trg_planos_updated on public.planos;
create trigger trg_planos_updated before update on public.planos
  for each row execute function public.set_updated_at();

drop trigger if exists trg_materias_updated on public.materias;
create trigger trg_materias_updated before update on public.materias
  for each row execute function public.set_updated_at();

drop trigger if exists trg_topicos_updated on public.topicos;
create trigger trg_topicos_updated before update on public.topicos
  for each row execute function public.set_updated_at();

-- ---------- índices ----------
create index if not exists idx_planos_user    on public.planos(user_id);
create index if not exists idx_materias_plano  on public.materias(plano_id);
create index if not exists idx_topicos_materia on public.topicos(materia_id);

-- ---------- RLS: cada usuário só enxerga/mexe nos próprios dados ----------
alter table public.planos   enable row level security;
alter table public.materias enable row level security;
alter table public.topicos  enable row level security;

drop policy if exists "planos do dono" on public.planos;
create policy "planos do dono" on public.planos
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "materias do dono" on public.materias;
create policy "materias do dono" on public.materias
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "topicos do dono" on public.topicos;
create policy "topicos do dono" on public.topicos
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
