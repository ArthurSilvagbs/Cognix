# Cognix — Guia para o Agente

## O que é
App de estudos pessoal em Next.js. Permite gerenciar tarefas, sessões, exercícios com IA, acompanhar evolução e conversar com tutor IA. Usuário único por conta (Supabase Auth).

## Stack
- **Framework**: Next.js 16.2.6 com App Router (React 19) — **leia AGENTS.md antes de escrever qualquer código Next.js**
- **Auth + DB**: Supabase (`@supabase/ssr` 0.10.3, `@supabase/supabase-js` 2.x)
- **Estilo**: Tailwind v4 + CSS variables customizadas em `app/globals.css`
- **State**: Zustand 5 (`lib/store.ts`)
- **Charts**: Recharts
- **Deploy**: Vercel

## Estrutura
```
app/
  (auth)/login/     → LoginForm.tsx (client), page.tsx (server, redireciona se logado)
  (auth)/register/  → RegisterForm.tsx (client), page.tsx
  (app)/            → layout.tsx (guard: redireciona para /login se não autenticado)
    dashboard/      → visão geral, tarefas recentes, sessões
    tasks/          → CRUD de tarefas com filtros
    sessions/       → CRUD de sessões de estudo
    exercises/      → exercícios gerados por IA
    groups/         → grupos de estudo
    evolution/      → gráficos de progresso (Recharts)
    tutor/          → chat com IA (Claude)
  auth/callback/    → route.ts: troca code OAuth por sessão (Supabase)
  globals.css       → CSS variables + overrides de classes Tailwind
components/
  Sidebar.tsx       → navegação lateral, logout, XP display
  StoreInitializer.tsx → hidrata Zustand com dados do Supabase, enforça "Lembrar-me"
lib/
  supabase/client.ts  → createBrowserClient
  supabase/server.ts  → createServerClient (cookies)
  supabase/db.ts      → fetchGroups, fetchTasks, fetchSessions, fetchExercises, fetchProfile
  store.ts            → Zustand store
  utils.ts            → helpers
```

## Autenticação
- Email/password + Google OAuth via Supabase
- Guard no server layout (`app/(app)/layout.tsx`): `getUser()` → redireciona para `/login`
- Guard reverso no `app/(auth)/login/page.tsx`: se logado → redireciona para `/dashboard`
- Callback OAuth em `app/auth/callback/route.ts` (trata `x-forwarded-host` para Vercel)
- **"Lembrar-me"**: sem essa opção, salva `cognix_expire` em `localStorage` com expiração de 24h. `StoreInitializer` checa na inicialização e faz signOut se expirado.

## Theming (Dark Mode)
- **Dark por padrão** (`:root` define dark). Light apenas via `@media (prefers-color-scheme: light)`.
- Futuro toggle manual: adicionar `.theme-dark` ou `.theme-light` no `<html>`.
- **Variáveis principais**: `--bg`, `--surface`, `--surface-subtle`, `--border`, `--border-strong`, `--text-primary`, `--text-secondary`, `--text-muted`, `--primary`, `--primary-subtle`, `--primary-subtle-text`, `--primary-subtle-border`.
- **Cores semânticas**: `--color-success-bg/text`, `--color-warning-bg/text`, `--color-danger-bg/text`, `--color-info-bg/text`.
- Classes Tailwind (`text-slate-*`, `bg-white`, etc.) são sobrescritas em `globals.css` para apontar para as CSS vars — **não adicione classes Tailwind de cor que não estejam nessa lista**. Use inline styles com CSS vars.

## Convenções de código
- Inline styles com CSS vars para theming: `style={{ background: "var(--surface)" }}`
- Classes Tailwind apenas para layout/spacing (não para cores)
- Modais: classe `.modal-overlay` + `.modal` (já têm dark mode)
- Cards: classe `.card` (já tem `background: var(--surface)`)
- Inputs: classe `.input` | Botões: `.btn .btn-primary` | `.btn .btn-ghost`
- Badges: classe `.badge` + inline style para cor
- Sem comentários desnecessários; sem abstrações prematuras

## DB (Supabase)
- Tabelas: `profiles`, `groups`, `tasks`, `sessions`, `exercises`
- RLS ativo em todas — `auth.uid() = user_id`
- Trigger auto-cria `profiles` no signup (usa `raw_user_meta_data->>'name'`)
- Schema completo em `supabase-schema.sql`

## Env vars necessárias
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
ANTHROPIC_API_KEY=
NEXT_PUBLIC_APP_URL=
```
