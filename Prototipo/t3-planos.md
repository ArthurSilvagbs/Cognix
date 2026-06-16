# T3 — Planos (lista)

> **Protótipo:** `t3-planos.html` · **Fase:** 4 · **Status:** ✅ validada (2026-06-16)
> **Referências:** Arquitetura de Informação v0.1 (T3, índice; F1 onboarding) · Modelo de Domínio v0.1 (Plano, Tópico avulso) · D5 (arquivar por plano)

---

## 1. Objetivo da tela

Ser o **índice de planos** — o ponto de entrada para qualquer plano e para os tópicos avulsos. Não é uma projeção do modelo (como Hoje/Calendário/Progresso); é um menu. Responde "quais planos eu tenho e em que pé estão?" e leva ao detalhe (T4).

**Anti-objetivos:** não mostra o conteúdo interno do plano (isso é T4), não agrega métricas profundas (isso é T7). Cada card é um cartão de visita: nome, status, % e o mínimo para decidir em qual entrar.

## 2. Dados que a tela consome

| Bloco | Consulta |
|---|---|
| Ativos | Planos do usuário com `status = ativo`, com % concluído (tópicos dominados ÷ total), nº matérias/tópicos, revisões pendentes, próximo estudo |
| Rascunhos | Planos com `status = rascunho` (gerados pela IA ou manuais, ainda não ativados — ver F1/T6) |
| Tópicos avulsos | Tópicos com `materiaId = null` (sem plano), com estado e próxima ação |

## 3. Anatomia

- **Header** com título + contagem-resumo (`2 planos ativos · 1 rascunho · 2 avulsos`) e botão **"Novo plano"** (→ T6). O botão repete a ação do "Novo" da sidebar de propósito: quem está na tela de planos espera criar dali.
- **Seções** separadas por `h2.section`: Ativos, Rascunhos, Tópicos avulsos.
- **Card de plano** (grid responsivo, `minmax(320px, 1fr)`):
  - Nome + menu `⋯` (dropdown: Ver plano, Renomear, Arquivar — D5).
  - Badge de status + chip de prazo.
  - Barra de progresso + % concluído.
  - **KPIs empilhados** (número em cima, label embaixo): matérias · tópicos · revisões pendentes.
  - Footer: próximo estudo + chip "em foco" quando é o plano em foco do dia.
- **Card de rascunho:** levemente opaco, badge "Rascunho", botão **"Ativar"** direto no card, menu com "Ativar plano" e "Excluir rascunho" (em vez de "Arquivar").
- **Tópicos avulsos:** lista compacta com a escala de cor de estado (mesma da T4: cinza→âmbar→primária→verde).

## 4. Estados

- **Cenário A — com dados:** seções Ativos/Rascunhos/Avulsos preenchidas.
- **Cenário B — vazio (onboarding):** estado vazio "Nenhum plano ainda" com os **2 caminhos de criação** (Criar com IA / Montar na mão) → T6. Espelha a decisão do colapso 4→2 da T6.

(Alterna pelos cenários na barra de demonstração.)

## 5. Decisões

- **KPIs empilhados** (número/label em duas linhas) — a versão inline ficava colada e ilegível. (feedback do Arthur, 2026-06-16)
- **Rascunho é um estado de primeira classe na lista**, não um lugar escondido — coerente com F1 (a IA gera rascunho que vive em T3 esperando ativação) e com a T4 (mesma tela edita rascunho e ativo).
- **Menu contextual por card** abriga as ações de ciclo de vida (renomear/arquivar/excluir) para não poluir o card.

## 6. Pendências 🔶

1. Revisão de hierarquia tipográfica dos subtítulos de seção (`h2.section`) — pequenos demais para dar sensação de divisão. Mudança transversal, fica para a Fase 5 (Design System).
2. Ordenação/filtro dos planos (por prazo, por % , por atividade) fora do MVP.
3. "Tópico avulso" cria via botão na seção — fluxo de criação do avulso ainda é o atalho do "Novo".
