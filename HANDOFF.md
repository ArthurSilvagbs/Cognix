# HANDOFF — Cognix v2 (retomada em outra máquina)

> Escrito em **2026-06-21**. Objetivo: outro Claude Code (ou Codex) retomar o
> desenvolvimento. Este arquivo é só um **índice de retomada** — o contexto de
> verdade já mora nos arquivos linkados; não duplico, aponto.

---

## 0. O que é o Cognix v2 (1 parágrafo)

Gerenciador de estudos que **elimina o custo diário de decidir o que estudar**.
Loop central: **ALIMENTAR** (conteúdo entra — IA ou manual) → **RECEBER** ("hoje
estude X") → **EXECUTAR** (timer + marcar) → **ADAPTAR** (replanejar em 1 clique,
sem culpa). A home é **Hoje** (execução, não dashboard). O app **absorve o caos,
não pune**. MVP de uso próprio do Arthur (dev júnior, forte visão de produto).
Detalhe completo de produto/stack/domínio: **[CLAUDE.md](CLAUDE.md)**.

---

## 1. Leia nesta ordem ANTES de codar

1. **[CLAUDE.md](CLAUDE.md)** — contrato de atuação + stack (ADR) + Design System +
   modelo de domínio (invariantes) + anti-padrões do v1 + regras de git e gates de
   qualidade. **Fonte de verdade de COMO trabalhar aqui.**
2. **[AGENTS.md](AGENTS.md)** — mesmo contrato, versão pro Codex.
3. **[app/AGENTS.md](app/AGENTS.md)** — aviso crítico: **este Next.js NÃO é o que você
   conhece** (Next 16 + React 19, breaking changes). Ler `app/node_modules/next/dist/docs/`
   antes de escrever código de framework (ex.: `searchParams`/`params` assíncronos).
4. **[app/supabase/README.md](app/supabase/README.md)** — como o banco é versionado
   (migrations) e aplicado.
5. **[.codex/agents/cognix-developer.toml](.codex/agents/cognix-developer.toml)** /
   `.claude/agents/cognix-developer.md` — agente de implementação (opcional).
6. **Memória do Claude** (se for a mesma conta): `cognix-v2-estado`,
   `estetica-calma-notion`, `ui-conta-a-historia`, `prototipo-alta-fidelidade`,
   `ambiente-windows-vault`.
7. **Vault Obsidian** (NÃO está no git — doc de produto):
   `C:\Users\arthu\Documents\Obsidian Vault\01 - Projetos\Cognix v2\` (PRD, Modelo,
   Arquitetura, Design System, Fase 4, `prompt-retomada`). **Só sob demanda.**

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
  **[app/src/styles/wireframe.css](app/src/styles/wireframe.css)**). É o app de verdade.
- **`Prototipo/`** — protótipo HTML de alta fidelidade (referência visual/fluxo das
  telas). Serve estático com `python -m http.server` (ver
  [Prototipo/.claude/launch.json](Prototipo/.claude/launch.json)).

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

Referências: **[app/.env.example](app/.env.example)**, scripts em
**[app/package.json](app/package.json)** (`dev`, `build`, `lint`, `db:new <nome>`,
`db:push`, `db:diff`), fluxo de migrations em
**[app/supabase/README.md](app/supabase/README.md)**.

---

## 4. Onde o app está (o que JÁ funciona)

Arquitetura: **Server Component consulta o Supabase e passa a projeção pra tela**;
a tela não sabe de onde vêm os dados (**[app/src/app/page.tsx](app/src/app/page.tsx)**
→ `getDadosHoje()` → `<Hoje>`). Quando o schema crescer, troca-se a query, a tela não
muda.

- ✅ **Auth/login** — **[app/src/app/login/page.tsx](app/src/app/login/page.tsx)**
  (entrar/criar conta + Google), [SignOutButton](app/src/components/SignOutButton.tsx),
  middleware de sessão ([app/src/middleware.ts](app/src/middleware.ts) +
  [app/src/lib/supabase/](app/src/lib/supabase/)).
- ✅ **Schema inicial** —
  [init_schema](app/supabase/migrations/20260618165411_init_schema.sql)
  (**Plano → Matéria → Tópico** + RLS por dono) e
  [planos_status_prazo](app/supabase/migrations/20260618170051_planos_status_prazo.sql).
- ✅ **ALIMENTAR (parcial)** — Planos: [lista](app/src/app/planos/page.tsx),
  [detalhe](app/src/app/planos/[id]/page.tsx),
  [novo](app/src/app/planos/novo/NovoPlanoWizard.tsx),
  [server actions](app/src/app/planos/actions.ts) (criar/renomear/ativar). Criar plano
  manual já grava no banco.
- ✅ **Hoje (cold-start real)** — [getDadosHoje()](app/src/lib/data/hoje.ts) lê o banco
  e responde só "o usuário tem planos?" → cold-start vs. dia-vazio.
- ✅ **DS refatorado** — [wireframe.css](app/src/styles/wireframe.css) em **3 camadas
  de token** (primitivo → semântico → alias legado) + contraste AA. **Em componente
  novo, use os nomes semânticos.**

---

## 5. Próximos passos (em ordem)

### 🥇 Fatia vertical: RECEBER (a fila de "Hoje" parar de vir vazia)
Hoje a `fila`/`foco` são **sempre `[]`** porque **não existe agendamento no schema**
(ver comentário em [app/src/lib/data/hoje.ts](app/src/lib/data/hoje.ts)). É a próxima
fatia. As invariantes (revisão 1-7-21 D2, "já domino" D1, pular revisão A3,
replanejamento D3) estão no **[CLAUDE.md](CLAUDE.md) → "Modelo de domínio"** — seguir
de lá. Passos:
1. **Schema de agendamento** (sessões + revisões espaçadas) — nova migration via
   `npm run db:new`.
2. **Preencher `getDadosHoje()`** com fila/foco/alternativas reais (a tela `<Hoje>`
   não muda — só o data layer).
3. **EXECUTAR**: marcar concluído → agenda as revisões automaticamente.
4. **ADAPTAR**: **Replanejar** (algorítmico, **sem IA**). **Regra de ouro:** só
   Replanejar mexe em datas; Focar/Antecipar/adiar **nunca** movem datas.

### 🥈 Propagar a estética calma / Notion (decisão de 2026-06-21)
O Arthur achou a Hoje **"gritante"** (gradiente + glow empilhados). Nova direção
(memória `estetica-calma-notion`): **índigo chapado, sem glow/gradiente, sombra só
neutra, ícones Lucide oficiais stroke 2**; foco vem de tipografia + filete fino, não de
brilho. Referência do "depois" já aplicada em
**[Prototipo/t1-hoje-v2.html](Prototipo/t1-hoje-v2.html)**. **Falta:**
- Levar o corte pro **app React** ([app/src/components/](app/src/components/) +
  [wireframe.css](app/src/styles/wireframe.css)).
- Aplicar o mesmo nas demais telas do protótipo (`t2`–`t8` em [Prototipo/](Prototipo/)).

### 🥉 Onboarding em slides — ADIADO de propósito
**[Prototipo/onboarding.html](Prototipo/onboarding.html)** existe (4 slides; CTA final
→ criar 1º plano; [verifique-email.html](Prototipo/verifique-email.html) já redireciona
pra ele). **Só finalizar/portar quando o app estiver pronto** — decisão do Arthur (há
ressalvas pendentes). Não priorizar agora.

---

## 6. Armadilhas específicas da retomada

> Regras de git, gates de qualidade, escopo, "sem `any`", cor com significado e a regra
> de ouro (vault ≠ código) estão no **[CLAUDE.md](CLAUDE.md)** — não repito aqui. Só o
> que é específico de retomar noutra máquina:

- **`.env.local` não vai no git** (gitignored). Sem recriá-lo (passo 2 acima) o app não
  sobe.
- **Preview MCP trava na porta 3000** — o [.claude/launch.json](.claude/launch.json) da
  raiz roda o app nessa porta. Pra protótipo estático, sirva noutra
  (`python -m http.server 8099` dentro de `Prototipo/`).
- **Gates não rodados no último commit de migração** — o grosso do `app/` foi commitado
  como estava (pra não perder nada na troca de máquina). Depois do `npm install`, rode
  `npx tsc --noEmit` e `npm run build` pra confirmar verde antes de seguir.
