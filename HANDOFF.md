# HANDOFF — Cognix v2 (retomada em outra máquina)

> Escrito em **2026-06-21**. Objetivo: outro Claude Code (ou Codex) retomar o
> desenvolvimento do zero de contexto. Leia isto primeiro, depois os arquivos da
> seção 1, e só então mexa em código.

---

## 0. O que é o Cognix v2 (1 parágrafo)

Gerenciador de estudos que **elimina o custo diário de decidir o que estudar**.
Loop central: **ALIMENTAR** (conteúdo entra — IA ou manual) → **RECEBER** ("hoje
estude X") → **EXECUTAR** (timer + marcar) → **ADAPTAR** (replanejar em 1 clique,
sem culpa). A home é **Hoje** (execução, não dashboard). O app **absorve o caos,
não pune**. MVP de uso próprio do Arthur (dev júnior, forte visão de produto).

---

## 1. Leia nesta ordem ANTES de codar

1. **`CLAUDE.md`** (raiz) — contrato de atuação + stack + Design System + modelo de
   domínio (invariantes) + anti-padrões do v1 + regras de git. É a fonte de verdade
   de COMO trabalhar aqui. **`AGENTS.md`** é o equivalente pro Codex (mesmo espírito).
2. **`app/AGENTS.md`** — aviso crítico: **este Next.js NÃO é o que você conhece**
   (Next 16 + React 19, breaking changes). Ler `app/node_modules/next/dist/docs/`
   antes de escrever código de framework (ex.: `searchParams`/`params` são assíncronos).
3. **Memória do Claude** (se estiver na mesma conta): `cognix-v2-estado`,
   `estetica-calma-notion`, `ui-conta-a-historia`, `prototipo-alta-fidelidade`,
   `ambiente-windows-vault`. Resumem decisões e gostos do Arthur.
4. **Vault Obsidian** (NÃO está no git, é a doc de produto):
   `C:\Users\arthu\Documents\Obsidian Vault\01 - Projetos\Cognix v2\` — PRD, Modelo de
   domínio, Arquitetura, Design System, Fase 4 (telas), `prompt-retomada`. **Só leia
   sob demanda** (Arthur pede ou a tarefa exige um arquivo específico).

---

## 2. Estrutura do repo e branches

GitHub: `ArthurSilvagbs/Cognix`. Branches (já reorganizadas):

| Branch | O que é | Status |
|---|---|---|
| `main` | app **v1** (`cognix-app/`), deployado na Vercel | INTACTO, renovação adiada de propósito — não mexer |
| `v1` | backup congelado da main | congelado |
| `prototipo` | protótipo HTML congelado | congelado |
| **`v2`** | **branch de dev do app novo** | **é aqui que trabalhamos** |

Na `v2`:
- **`app/`** — Next.js 16 + React 19 + TS (sem Tailwind: o DS é **CSS puro** em
  `app/src/styles/wireframe.css`). É o app de verdade.
- **`Prototipo/`** — protótipo HTML de alta fidelidade (a referência visual/fluxo das
  telas). Serve estático com `python -m http.server` (ver `Prototipo/.claude/launch.json`).
- **`CLAUDE.md` / `AGENTS.md`** — contrato. **`.claude/agents/cognix-developer.md`** —
  agente de implementação (opcional).

---

## 3. Setup na máquina nova (uma vez)

```bash
# 1. dependências do app
cd app && npm install

# 2. variáveis de ambiente (segredos NÃO estão no git)
cp .env.example .env.local
#   preencher NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY
#   (pegar no painel do Supabase do projeto, ou com o Arthur)

# 3. ligar o Supabase CLI ao projeto hospedado e aplicar o schema
npx supabase login
npx supabase link --project-ref vzpuaauihykahlgbnfei   # pede a senha do banco
npm run db:push                                          # aplica as migrations

# 4. rodar
npm run dev      # http://localhost:3000
```

Scripts úteis (`app/package.json`): `dev`, `build`, `lint`, `db:new <nome>`,
`db:push`, `db:diff`. Migrations versionadas em `app/supabase/migrations/` —
**nunca editar o banco na mão pelo painel**, sempre migration nova (ver
`app/supabase/README.md`).

---

## 4. Onde o app está (o que JÁ funciona)

Arquitetura: **Server Component consulta o Supabase e passa a projeção pra tela**;
a tela não sabe de onde vêm os dados (`app/src/app/page.tsx` → `getDadosHoje()` →
`<Hoje>`). Quando o schema crescer, troca-se a query, a tela não muda.

- ✅ **Auth/login** — `app/src/app/login/` (entrar/criar conta + Google),
  `SignOutButton`, middleware de sessão (`app/src/middleware.ts`,
  `app/src/lib/supabase/{client,server,middleware}.ts`).
- ✅ **Schema inicial** — `migrations/20260618165411_init_schema.sql`
  (**Plano → Matéria → Tópico** + RLS por dono) e
  `migrations/20260618170051_planos_status_prazo.sql` (status/prazo do plano).
- ✅ **ALIMENTAR (parcial)** — Planos: lista (`app/src/app/planos/page.tsx`),
  detalhe (`planos/[id]/page.tsx`), novo (`planos/novo/NovoPlanoWizard.tsx`),
  server actions (`planos/actions.ts`: criar/renomear/ativar). Criar plano manual já
  grava no banco.
- ✅ **Hoje (cold-start real)** — `getDadosHoje()` (`app/src/lib/data/hoje.ts`) lê o
  banco e responde só "o usuário tem planos?" → decide entre cold-start e dia-vazio.
- ✅ **DS refatorado** — `app/src/styles/wireframe.css` em **3 camadas de token**
  (primitivo `--zinc/indigo-*` → semântico `--text/surface/action-*` → alias legado
  `--ink/primary-*`) + contraste AA corrigido. **Em componente novo, use os nomes
  semânticos.**

---

## 5. Próximos passos (em ordem)

### 🥇 Fatia vertical: RECEBER (a fila de "Hoje" parar de vir vazia)
Hoje a `fila`/`foco` são **sempre `[]`** porque **não existe agendamento no schema**
(ver comentário em `app/src/lib/data/hoje.ts:6`). É a próxima fatia:
1. **Schema de agendamento** — sessões de estudo + revisões espaçadas. Invariantes do
   `CLAUDE.md`: revisão **1-7-21 editável** (D2); **"já domino"** = revisão de
   manutenção recorrente que **não some** (D1); **pular revisão** = adiar pra amanhã,
   **sem** estado "pulada" (A3). Nova migration via `npm run db:new`.
2. **Preencher `getDadosHoje()`** com fila/foco/alternativas reais (a tela `<Hoje>`
   não muda — só o data layer).
3. **EXECUTAR**: marcar concluído → agenda as revisões automaticamente.
4. **ADAPTAR**: **Replanejar** (D3, algorítmico, **sem IA**) — estudos deslizam em
   cascata, revisões atrasadas reancoram em hoje com teto/dia; aplica direto +
   desfazer, sem preview. **Regra de ouro:** só Replanejar mexe em datas; Focar/
   Antecipar/adiar **nunca** movem datas.

### 🥈 Propagar a estética calma / Notion (decisão de 2026-06-21)
O Arthur achou a Hoje (protótipo) **"gritante"** (gradiente + glow empilhados). Nova
direção (ver memória `estetica-calma-notion`): **índigo chapado, sem glow/gradiente,
sombra só neutra, ícones Lucide oficiais (stroke 2)**, foco vem de tipografia + filete
fino, não de brilho. Já aplicado em **`Prototipo/t1-hoje-v2.html`** (referência do
"depois"). **Falta:**
- Levar esse corte pro **app React** (`app/src/components/**` + `wireframe.css`).
- Aplicar o mesmo nas demais telas do protótipo (`t2`–`t8`).

### 🥉 Onboarding em slides — ADIADO de propósito
`Prototipo/onboarding.html` existe (4 slides: welcome + Alimentar/Hoje/Adaptar, CTA
final → criar 1º plano; `verifique-email.html` já redireciona pra ele). **Só
finalizar/portar quando o app estiver pronto** — decisão do Arthur (há ressalvas
pendentes nessa tela). Não priorizar agora.

---

## 6. Regras e armadilhas (não tropeçar)

- **Git:** nunca commitar/pushar sem o Arthur pedir. Mensagem `{escopo}: {descrição
  imperativa}` (sem `feat:`/`fix:`), fechando com `Co-Authored-By: Claude
  <noreply@anthropic.com>`. Em PowerShell 5.1, commit **sem aspas duplas**. Nunca
  `--no-verify`/force push sem pedido.
- **Gates antes de propor commit:** `npx tsc --noEmit`, lint só dos arquivos
  alterados, build (`npm run build`). Reportar ✅/❌.
- **Escopo mínimo + reuse > refatore > crie.** Greenfield: ao criar o **segundo** de
  algo, pare e extraia o padrão do primeiro.
- **Sem `any`.** Tipar de verdade.
- **Cor só com significado:** primária (ação/ativo/foco), âmbar (atenção, nunca em
  botão), verde (dominado, só indicador). **Vermelho proibido.**
- **Regra de ouro do projeto:** decisão registrada no vault ≠ feita no código. Confira
  o código/`git log` antes de marcar "feito". (Já aconteceu de tela "sumir" por nunca
  ter sido pushada — **commitar+pushar por sessão**.)
- **Preview MCP** tende a travar na **porta 3000** (o `.claude/launch.json` da raiz
  roda o app nessa porta). Pra protótipo estático, sirva noutra porta
  (`python -m http.server 8099` dentro de `Prototipo/`).
- **Next 16:** APIs diferentes do treino — ler `app/node_modules/next/dist/docs/`.
