# Cognix — Documento de Arquitetura, Implementação e Planejamento

## 1. Visão Geral do Sistema

**Cognix** é uma plataforma de gerenciamento de estudos com assistência de IA. O objetivo é ajudar o usuário a organizar tarefas, registrar sessões de estudo, praticar exercícios de programação, treinar memorização de código e acompanhar sua evolução com um sistema de gamificação (XP, níveis e conquistas).

---

## 2. Funcionalidades (baseadas nos prints)

### 2.1 Dashboard
- Saudação com data e hora do dia
- Botões de acesso rápido: **Tutor IA** e **Treinar Código**
- Cards de estatísticas: Tarefas Feitas, Horas Estudadas, Exercícios, Sessões
- Grade "Explorar" com atalhos visuais para cada módulo
- Painel **Tarefas Pendentes** (resumo)
- Painel **Matérias Estudadas** (resumo)
- Seção **Últimos Exercícios**

### 2.2 Tarefas
- Listagem com filtros: Todas | Pendentes | Em Andamento | Concluídas
- Criação via modal com: Título, Matéria, Prioridade (Baixa/Média/Alta), Tipo (Estudo/Revisão/Prática/Projeto), Data de Entrega, Tempo Estimado (min), Descrição
- CRUD completo (criar, editar, marcar como concluída, deletar)

### 2.3 Sessões de Estudo
- Listagem de sessões registradas com total de horas
- Criação via modal: Matéria, Duração (min), Data, Anotações
- CRUD completo

### 2.4 Exercícios de Programação
- Painel dividido: lista à esquerda, visualização/resolução à direita
- Geração de exercícios via IA (linguagem, dificuldade, tópico)
- Exercício tem: título, linguagem, nível de dificuldade, tags de conceitos
- Status: pendente / concluído (checkmark verde)
- Editor de código integrado para resolução

### 2.5 Treino de Código (Memorização)
- Fluxo: IA gera código → usuário memoriza por N segundos → reescreve de memória → recebe feedback
- Configurações: Linguagem, Dificuldade, Tópico (opcional), Tempo para memorizar (segundos)
- Avaliação/feedback automático pela IA

### 2.6 Evolução (Gamificação)
- Nível atual e XP total com barra de progresso
- Estatísticas consolidadas: tarefas, exercícios, sessões e horas
- Gráfico: Horas Estudadas nos Últimos 14 Dias
- Progresso por Matéria
- Gráfico: Exercícios por Linguagem (donut chart)
- **Conquistas/Badges**: Primeira Tarefa, Primeiro Código, 5 Sessões, 10 Tarefas Feitas, 5 Exercícios, Nível 5, 10h Estudadas, Nível 10

### 2.7 Tutor IA
- Chat com IA (Claude) para tirar dúvidas sobre qualquer matéria
- Contexto do usuário (matérias estudadas, exercícios feitos) pode ser injetado no prompt

---

## 3. Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Next.js 15 (App Router) |
| Estilização | Tailwind CSS + shadcn/ui |
| State / Cache | Zustand + TanStack Query |
| Gráficos | Recharts |
| Editor de código | Monaco Editor |
| Backend | NestJS |
| ORM | Prisma |
| Banco de dados | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| IA | Claude API (Anthropic) |
| Hospedagem Frontend | Vercel |
| Hospedagem Backend | Vercel (Serverless) ou Railway |

> **Nota sobre backend:** Para o MVP, grande parte pode ser feita com Next.js API Routes + Supabase diretamente, sem necessidade imediata do NestJS. O NestJS entra quando a complexidade da lógica de IA e regras de negócio justificar um serviço separado. Recomendo começar com Next.js full-stack e migrar para NestJS depois.

---

## 4. Modelagem de Dados (Supabase / PostgreSQL)

```sql
-- Usuários (gerenciado pelo Supabase Auth + extensão)
users
  id            uuid PK
  email         text
  name          text
  avatar_url    text
  xp            int  DEFAULT 0
  level         int  DEFAULT 1
  created_at    timestamp

-- Tarefas
tasks
  id            uuid PK
  user_id       uuid FK → users
  title         text
  subject       text
  priority      enum(low, medium, high)
  type          enum(study, review, practice, project)
  status        enum(pending, in_progress, done)
  due_date      date
  estimated_min int
  description   text
  created_at    timestamp
  completed_at  timestamp

-- Sessões de Estudo
sessions
  id            uuid PK
  user_id       uuid FK → users
  subject       text
  duration_min  int
  date          date
  notes         text
  created_at    timestamp

-- Exercícios
exercises
  id            uuid PK
  user_id       uuid FK → users
  title         text
  language      text
  difficulty    enum(beginner, intermediate, advanced)
  topic_tags    text[]
  description   text
  starter_code  text
  solution      text        -- gerado pela IA
  user_code     text        -- resposta do usuário
  status        enum(pending, done)
  ai_feedback   text
  is_starred    bool DEFAULT false
  created_at    timestamp

-- Treinos de Memorização
code_trainings
  id            uuid PK
  user_id       uuid FK → users
  language      text
  difficulty    enum(beginner, intermediate, advanced)
  topic         text
  original_code text
  user_code     text
  score         int         -- 0-100
  feedback      text
  memorize_sec  int
  created_at    timestamp

-- Conquistas (catálogo fixo)
achievements
  id            uuid PK
  key           text UNIQUE  -- ex: "first_task", "first_code"
  name          text
  description   text
  icon          text
  xp_reward     int

-- Conquistas do Usuário
user_achievements
  id            uuid PK
  user_id       uuid FK → users
  achievement_id uuid FK → achievements
  unlocked_at   timestamp
```

---

## 5. Regras de XP e Gamificação

| Ação | XP ganho |
|------|----------|
| Completar tarefa | +10 XP |
| Registrar sessão de estudo | +5 XP por 30min |
| Completar exercício | +20 XP |
| Completar treino de memorização | +15 XP |
| Desbloquear conquista | XP da conquista |

**Fórmula de nível:** `level = floor(xp / 100) + 1`

---

## 6. Integrações com IA (Claude API)

### 6.1 Gerar Exercício
- **Input:** linguagem, dificuldade, tópico
- **Output:** título, descrição, código inicial (opcional), solução, tags

### 6.2 Avaliar Resposta do Exercício
- **Input:** enunciado, código do usuário, solução esperada
- **Output:** feedback textual, score (0-100), pontos de melhoria

### 6.3 Gerar Código para Memorizar
- **Input:** linguagem, dificuldade, tópico
- **Output:** trecho de código comentado com conceito

### 6.4 Avaliar Memorização
- **Input:** código original, código reescrito pelo usuário
- **Output:** similaridade, feedback, score

### 6.5 Tutor IA (Chat)
- **Input:** histórico de mensagens + contexto do usuário (matérias, exercícios recentes)
- **Output:** resposta didática

---

## 7. Estrutura de Pastas — Frontend (Next.js)

```
cognix/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (app)/
│   │   ├── layout.tsx          ← Sidebar + auth guard
│   │   ├── dashboard/page.tsx
│   │   ├── tasks/page.tsx
│   │   ├── sessions/page.tsx
│   │   ├── exercises/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── training/page.tsx
│   │   ├── evolution/page.tsx
│   │   └── tutor/page.tsx
│   └── api/
│       ├── ai/
│       │   ├── generate-exercise/route.ts
│       │   ├── evaluate-exercise/route.ts
│       │   ├── generate-training/route.ts
│       │   ├── evaluate-training/route.ts
│       │   └── tutor/route.ts
│       └── webhooks/route.ts
├── components/
│   ├── ui/                     ← shadcn/ui components
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   └── Header.tsx
│   ├── dashboard/
│   ├── tasks/
│   ├── sessions/
│   ├── exercises/
│   ├── training/
│   ├── evolution/
│   └── tutor/
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   ├── ai/
│   │   └── prompts.ts
│   └── utils.ts
├── hooks/
│   ├── useTasks.ts
│   ├── useSessions.ts
│   ├── useExercises.ts
│   └── useEvolution.ts
├── store/
│   └── useAppStore.ts          ← Zustand
└── types/
    └── index.ts
```

---

## 8. Design System

### Paleta de Cores
| Uso | Cor |
|-----|-----|
| Primary | `#6D28D9` (purple-700) |
| Primary Dark | `#4C1D95` (purple-900) |
| Accent Blue | `#2563EB` |
| Accent Green | `#059669` |
| Accent Orange | `#EA580C` |
| Accent Pink | `#DB2777` |
| Background | `#F9FAFB` (gray-50) |
| Card | `#FFFFFF` |
| Text Primary | `#111827` |
| Text Muted | `#6B7280` |

### Cards Explore (Dashboard)
| Módulo | Cor |
|--------|-----|
| Tarefas | Purple |
| Sessões | Teal/Cyan |
| Exercícios | Green |
| Treino | Orange |
| Evolução | Pink/Rose |
| Tutor IA | Blue/Indigo |

### Componentes Base
- Sidebar fixa à esquerda (265px)
- Cards com `rounded-xl`, `shadow-sm`
- Modais centralizados com overlay escuro
- Botão primário: fundo purple, texto branco
- Gradiente header dashboard: `from-purple-600 to-blue-600`

---

## 9. Plano de Implementação (Fases)

### Fase 1 — Setup e Estrutura (Semana 1)
- [ ] Criar projeto Next.js 15 com TypeScript
- [ ] Configurar Tailwind CSS + shadcn/ui
- [ ] Configurar Supabase (projeto, tabelas, RLS)
- [ ] Implementar autenticação (Supabase Auth)
- [ ] Layout base: Sidebar + roteamento

### Fase 2 — Módulos Core (Semana 2)
- [ ] Dashboard (estático → conectado)
- [ ] Tarefas (CRUD completo)
- [ ] Sessões (CRUD completo)

### Fase 3 — Módulos de IA (Semana 3)
- [ ] Exercícios com geração via IA
- [ ] Editor de código + avaliação
- [ ] Treino de Memorização completo

### Fase 4 — Gamificação e Evolução (Semana 4)
- [ ] Sistema de XP e níveis
- [ ] Conquistas
- [ ] Gráficos (Recharts)
- [ ] Página de Evolução completa

### Fase 5 — Tutor IA + Polimento (Semana 5)
- [ ] Chat Tutor IA com contexto do usuário
- [ ] Refinamento visual (animações, responsividade)
- [ ] Testes e ajustes

### Fase 6 — Deploy (após produto pronto)
- [ ] Configurar variáveis de ambiente na Vercel
- [ ] Deploy frontend na Vercel
- [ ] Configurar Supabase produção
- [ ] Domínio customizado

---

## 10. Variáveis de Ambiente Necessárias

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Claude / Anthropic
ANTHROPIC_API_KEY=

# App
NEXT_PUBLIC_APP_URL=
```

---

## 11. Decisões de Arquitetura

1. **Backend separado (NestJS):** Não é necessário no MVP. As API Routes do Next.js são suficientes para chamar o Claude e interagir com o Supabase. NestJS entra se o produto crescer e precisar de filas, workers, ou lógica complexa de backend.

2. **Supabase como BaaS:** Resolve auth, banco de dados, storage e realtime sem manter infra. RLS (Row Level Security) garante que cada usuário só acessa seus próprios dados.

3. **Claude API diretamente no frontend (via API Routes):** A chave da API fica somente no servidor (API Routes), nunca exposta ao browser.

4. **Zustand para estado local:** Modais, filtros ativos, estado da UI. Dados do servidor via TanStack Query com cache.
