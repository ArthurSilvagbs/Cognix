# Cognix — Contexto Completo do Sistema

> Cole este arquivo no início de uma nova conversa para dar contexto total ao agente.

---

## O que é

Cognix é um app de estudos pessoal (single-user por conta). Permite organizar estudos em grupos, gerenciar tarefas, planejar e registrar sessões de estudo, resolver exercícios gerados por IA, acompanhar evolução com XP/níveis e conversar com tutor IA.

**Deploy:** Vercel — `https://cognix-app.vercel.app` (ou similar)

---

## Stack

| Camada | Tech |
|---|---|
| Framework | Next.js 16.2.6, App Router, React 19 |
| Auth + DB | Supabase (`@supabase/ssr` 0.10.3) |
| Estilo | Tailwind v4 + CSS variables em `globals.css` |
| Estado | Zustand 5 (`lib/store.ts`) |
| Charts | Recharts |
| IA | Claude API (Anthropic) via `app/api/` route handlers |
| Deploy | Vercel |

---

## Estrutura de arquivos

```
app/
  (auth)/login/         → LoginForm.tsx (client) + page.tsx (server, redireciona se logado)
  (auth)/register/      → RegisterForm.tsx + page.tsx
  (app)/layout.tsx      → guard: redireciona /login se não autenticado
  (app)/dashboard/      → visão geral: tarefas recentes, próximas sessões, stats
  (app)/groups/         → lista de grupos (grid de cards)
  (app)/groups/[id]/    → HUB do grupo: sessões planejadas + histórico, tarefas, matérias
  (app)/tasks/          → CRUD de tarefas com filtros
  (app)/sessions/       → calendário mensal + planejamento semanal de sessões
  (app)/exercises/      → exercícios gerados por IA (código)
  (app)/evolution/      → gráficos de progresso (Recharts)
  (app)/tutor/          → chat com IA (Claude)
  auth/callback/        → troca code OAuth por sessão (Supabase)
  globals.css           → CSS vars + overrides Tailwind
components/
  Sidebar.tsx           → nav lateral, group switcher, XP/level, logout
  StoreInitializer.tsx  → hidrata Zustand com dados do Supabase, enforça "Lembrar-me" (24h)
  ui.tsx                → Field, SelectField, Btn, ModalHeader, ModalFooter, FormBody
  Field.tsx             → wrapper floating-label (usa useId)
lib/
  supabase/client.ts    → createBrowserClient
  supabase/server.ts    → createServerClient (cookies)
  supabase/db.ts        → fetchGroups, fetchTasks, fetchSessions, fetchExercises, fetchProfile + inserts/patches/removes
  store.ts              → Zustand store (toda a lógica de estado)
  utils.ts              → helpers gerais
```

---

## Modelo de dados (Supabase)

### Tabelas principais

```sql
profiles      (id, name, xp, level, unlocked_achievements[])
groups        (id, user_id, name, description, color, emoji, created_at)
subjects      (id, user_id, group_id, name, created_at)  -- matérias dentro de um grupo
tasks         (id, user_id, group_id, title, subject, priority, type, status, due_date, estimated_min, description, created_at, completed_at)
sessions      (id, user_id, group_id, cycle_id, subject, duration_min, actual_min, date, notes, created_at)
exercises     (id, user_id, group_id, title, language, difficulty, topic_tags[], description, starter_code, user_code, status, is_starred, feedback, created_at)
study_plan_days   (id, user_id, day_of_week, planned_min, created_at)
study_plan_items  (id, user_id, day_of_week, group_id, subject, session_type, description, position, created_at)
```

RLS ativo em todas — `auth.uid() = user_id`. Trigger auto-cria `profiles` no signup.

### Tipos de enums (no store)

```ts
TaskPriority   = "low" | "medium" | "high"
TaskType       = "study" | "review" | "practice" | "project"
TaskStatus     = "pending" | "in_progress" | "done"
SessionType    = "content" | "review" | "exercises" | "simulado"
Difficulty     = "beginner" | "intermediate" | "advanced"
```

---

## Estado global (Zustand — `lib/store.ts`)

O store persiste no localStorage e hidrata do Supabase via `hydrateFromSupabase` (chamado em `StoreInitializer`).

Entidades: `groups`, `tasks`, `exercises`, `subjects`, `sessions`, `planDays`, `planItems`, `trainings`

Ações principais:
- `addGroup / updateGroup / deleteGroup / setActiveGroup`
- `addTask / updateTask / deleteTask`
- `addSubject / deleteSubject`
- `addSession / deleteSession`
- `savePlan(days)` — substitui `planDays`
- `savePlanItems(dayOfWeek, items)` — substitui `planItems` de um dia
- `hydrateFromSupabase` — chamado uma vez na montagem
- `clearStore` — chamado no logout

`activeGroupId` controla qual grupo está ativo no contexto global (usado para filtrar tarefas, sessões, exercícios nas outras páginas).

---

## Autenticação

- Email/password + Google OAuth via Supabase
- Guard server-side no layout `(app)/layout.tsx`: `getUser()` → redirect `/login`
- Guard reverso no `(auth)/login/page.tsx`: se logado → redirect `/dashboard`
- OAuth callback em `app/auth/callback/route.ts` (trata `x-forwarded-host` para Vercel)
- **"Lembrar-me":** sem esta opção, salva `cognix_expire` no localStorage com +24h. `StoreInitializer` checa no mount e faz signOut se expirado.

---

## Design System

### Tema

- **Dark por padrão** (`:root` = dark). Light via `@media (prefers-color-scheme: light)`.
- Toggle futuro: `.theme-dark` / `.theme-light` no `<html>`.
- **Zoom global:** `html { zoom: 1.1 }` — escala todo o sistema 10% para melhor legibilidade.

### CSS Variables principais

```css
--bg               /* fundo da página */
--surface          /* cards, inputs */
--surface-subtle   /* fundo de rows alternados */
--border           /* bordas padrão */
--border-strong    /* bordas de destaque */
--text-primary     /* texto principal */
--text-secondary   /* texto secundário */
--text-muted       /* labels, placeholders */
--primary          /* #7c3aed (violeta) */
--primary-hover    /* #6d28d9 */
--primary-subtle / --primary-subtle-text / --primary-subtle-border

/* Semânticas */
--color-success-bg/text
--color-warning-bg/text
--color-danger-bg/text
--color-info-bg/text
```

### Classes globais reutilizáveis

```css
.card          → surface + border + radius-lg + shadow-xs
.input         → input estilizado (15px, padding 13px 16px)
.select        → select estilizado com arrow SVG
.btn           → base de botão pill (15px, padding 12px 22px)
.btn-primary   → fundo --primary, branco
.btn-ghost     → transparente, borda --border
.badge         → inline-flex, 12px, padding 3px 8px
.modal-overlay → fixed, blur, overlay
.modal         → card modal max-w-460px
```

### Convenção de estilos

- **Inline styles** com CSS vars para cores: `style={{ color: "var(--text-primary)" }}`
- **Classes Tailwind** apenas para layout/spacing: `flex`, `gap-4`, `p-6`, etc.
- Cores de grupo usam opacidade hex no inline: `${group.color}18` (fundo suave), `${group.color}35` (borda)
- Sem hardcode de hex em componentes — sempre CSS vars ou cor do grupo via prop

### Componentes UI (`components/ui.tsx`)

- `Field` — floating label wrapper; envolve `<input className="input" />`
- `SelectField` — idem para selects
- `Btn` — botão com variantes primary/ghost/danger + loading
- `ModalHeader` — título + subtítulo opcional + botão fechar
- `ModalFooter` — Cancelar / Confirmar com disabled
- `FormBody` — body scrollável do modal

---

## Funcionalidades por página

### `/groups` — Lista de grupos
- Grid 2 colunas de cards
- Cada card: emoji, nome, descrição, contagem de tarefas/exercícios, lista de matérias gerenciável inline
- "Entrar no grupo" → navega para `/groups/[id]` e seta `activeGroupId`
- Modal criar/editar: emoji picker + nome + descrição + color picker (10 cores predefinidas)

### `/groups/[id]` — Hub do grupo ⭐
Paradigma "grupo como espaço de trabalho". Layout: header hero + 2 colunas (conteúdo | matérias).

**Hero:** emoji, nome, descrição, stats (matérias, tarefas concluídas/total, sessões, tempo estudado), botão editar.

**Coluna esquerda — Sessões (destaque):**
- Borda `--border-strong` para diferenciação visual
- "Planejadas por semana": cada dia com nome + duração total, lista de sessões como linhas (emoji tipo + nome matéria + label tipo)
- "Histórico recente": últimas 5 sessões com dot colorido, nome, tempo real, data

**Coluna esquerda — Tarefas pendentes:**
- Lista com checkbox rápido para marcar como done
- Badge de prioridade colorido
- Estimativa de tempo
- Link "Nova tarefa" → `/tasks`

**Coluna direita — Matérias:**
- Lista com barra de progresso por matéria (done/total tarefas)
- Add inline com input + Enter
- Remove com botão X

### `/sessions` — Calendário de sessões
- Mini calendário mensal à esquerda (dots coloridos por grupo nos dias com sessões)
- Painel direito: detalhe do dia selecionado
- Itens planejados com botão "Concluir" (abre modal para registrar tempo real + notas)
- Modal "Horários" — toggle por dia da semana + horas/minutos planejados
- Modal "Planejar dia" — escolhe grupo + matéria + tipo + descrição para cada slot

### `/tasks` — Tarefas
- Lista com filtros: grupo, status, prioridade
- CRUD completo via modal
- Quick-complete inline

### `/exercises` — Exercícios
- Gerados por IA (Claude) com base em grupo/matéria/dificuldade
- Editor de código inline
- Feedback de IA na submissão

### `/evolution` — Evolução
- Gráficos Recharts: sessões por semana, tarefas completadas, tempo estudado
- Progresso de XP e conquistas

### `/tutor` — Tutor IA
- Chat com Claude
- Contexto de grupo ativo injetado no system prompt

---

## Env vars necessárias

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
ANTHROPIC_API_KEY=
NEXT_PUBLIC_APP_URL=
```

---

## Estado atual do desenvolvimento (maio/2026)

- ✅ Auth (email + Google OAuth, "lembrar-me")
- ✅ Grupos — CRUD + matérias inline
- ✅ Hub do grupo `/groups/[id]` — sessões + tarefas + matérias
- ✅ Sessões — calendário + planejamento semanal + registro
- ✅ Tarefas — CRUD + filtros
- ✅ Exercícios — geração IA + editor
- ✅ Evolução — gráficos
- ✅ Tutor IA — chat
- ✅ XP/Conquistas — sistema básico
- 🔲 Notificações / lembretes
- 🔲 Export de dados
- 🔲 Modo foco / timer Pomodoro
