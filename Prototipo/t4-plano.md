# T4 — Plano (detalhe)

> **Protótipo:** `t4-plano.html` · **Fase:** 4 · **Status:** ✅ **validada pelo Arthur em 2026-06-12** (revisões: listagem encorpada, kanban Jira + scroll horizontal, escala de cor de estado, semântica do Dominado na legenda)
> **Referências:** AI v0.1 (T4) · Modelo de Domínio (§3 projeções Lista/árvore e Kanban, R4)

## 1. Objetivo

Ver e **editar a estrutura** de um plano: matérias, tópicos, ordem, estados. É a única tela onde a hierarquia `Plano → Matéria → Tópico` aparece inteira — e onde IA e usuário manual convergem (o rascunho gerado pela IA é editado **aqui**, não num editor paralelo).

## 2. Dados (projeções, anti-ilha)

| Bloco | Consulta |
|---|---|
| Cabeçalho/KPIs | Agregações do plano: tópicos `concluido`+`dominado` ÷ total, % revisões em dia, `dataAlvo` |
| Lista (árvore) | Matérias por `ordem` → Tópicos por `ordem`, com estado + mini-barra por matéria |
| Kanban | **Mesmos tópicos** agrupados por estado derivado — "Em revisão" não existe no banco (= `concluido` + revisão pendente, R4). **Estilo Jira** (revisão 2026-06-12): cabeçalho de coluna com ícone de estado + contador em pílula; card em camadas — etiqueta da matéria (estilo epic), título, rodapé com ícone do evento + data à direita; hover com elevação; cursor `grab` (drag real fica pra fase 7). **Colunas de largura fixa (290px) com scroll horizontal** (barra estilizada + scroll-snap) em vez de espremer no espaço — proposta do Arthur; no mobile vira swipe lateral |
| Toggle Lista⇄Kanban | Zero query nova — só outra projeção. Teste vivo do anti-ilha |

## 3. Anatomia e interações (revisão 2026-06-12: tela encorpada — mesma receita da T1)

- **Layout 2 colunas:** principal (árvore/kanban) + lateral de contexto **só leitura**: "Sobre o plano" (origem IA, intervalos herdados, disponibilidade, status), "Distribuição" por estado (que também serve de **legenda** dos ícones) e "Próximos 7 dias" do plano.
- **Cabeçalho:** breadcrumb `Planos › BB 2026` · KPIs (47/138, 34%, 92% revisões, prova em 150d) · ações `+ Matéria`, `+ Tópico`, menu ⋯ (intervalos, pausar, arquivar — D5).
- **Toolbar:** segmented Lista/Kanban + **busca por tópico** + **filtros por estado** (chips com contagem, combinam com a busca).
- **Árvore:** matéria colapsável (aberta por padrão) com sublinha rica (n tópicos · tempo estudado · próxima ação); tópico em **duas linhas** (título + estado·detalhe·sessões) com **chip de data relevante** à direita (agendamento, revisão ou manutenção).
- **Clicar em qualquer tópico** (lista ou kanban) abre o painel T5 — ver `t5-topico.md`.

## 4. Estados do tópico — iconografia e escala de cor (R4 · revisão 2026-06-12)

| Estado | Ícone | Cor (token) |
|---|---|---|
| Não iniciado | círculo vazio | neutra (`ink-400`) |
| Em estudo | círculo meio-cheio | **âmbar** (`--warn`) — energia ativa |
| Em revisão (derivado) | setas circulares | **primária** — obrigação viva do ciclo 1·7·21 |
| Dominado | estrela | **verde** (`--success`, token novo) — conquista |

**Regra anti-arco-íris:** a escala de estado (cinza → âmbar → primária → verde) é permitida **somente em indicadores de estado** — ícones, cabeçalhos de coluna do kanban, distribuição da lateral. Nunca em botões, superfícies ou texto corrido. Proposta do Arthur na revisão; o verde entrou como token `--success`.

**Semântica importante (pergunta da revisão):** Dominado **não significa "nunca mais revisar"** — significa que saiu do ciclo intensivo 1·7·21 e entrou em **manutenção espaçada** (a cada 60d, editável — D1). A revisão de manutenção aparece no Hoje quando vence, mas o tópico permanece na coluna Dominado. "Em revisão" é exclusivamente o ciclo intensivo. A legenda da lateral explica isso na própria tela.

## 5. Pendências 🔶

1. Drag-and-drop de reordenação — só indicado no protótipo, implementar na fase 7.
2. Edição inline de nomes (matéria/tópico) — duplo clique? Decidir no protótipo navegável.
3. Kanban em mobile: 2 colunas funciona ou vira carrossel?
