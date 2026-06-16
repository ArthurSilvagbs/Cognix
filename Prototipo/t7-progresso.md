# T7 — Progresso

> **Protótipo:** `t7-progresso.html` · **Fase:** 4 · **Status:** ✅ validada (2026-06-16)
> **Referências:** Arquitetura de Informação v0.1 (T7, projeção Progresso; A1 — "responde perguntas que nenhuma outra tela responde") · Modelo de Domínio v0.1 (SessãoDeEstudo, Revisão) · PRD §10

---

## 1. Objetivo da tela

Agregação. Responde o que **nenhuma outra tela responde**: quanto tempo investi, **onde** investi, e **como vão as revisões** ao longo do tempo. É a única tela de leitura analítica — Hoje é execução, Calendário é agenda, Planos é índice.

**Anti-objetivos:** nenhuma ação acontece aqui (só lê). Não substitui o detalhe do plano (T4); não decide o que estudar (T1).

## 2. Dados que a tela consome

| Bloco | Consulta |
|---|---|
| KPIs | Σ duração das sessões (horas) · tópicos `dominado` ÷ total · % revisões em dia · sequência de dias com ≥1 sessão |
| Atividade | Σ horas de sessão agrupadas por semana (últimas 8) |
| Horas por matéria | Σ duração das sessões agrupadas por `materiaId` (escopo: um plano) |
| Saúde das revisões | Revisões `agendada` com `dataPrevista ≥ hoje` (em dia) vs `< hoje` (atrasadas) vs `concluida` no período |
| Por plano | % concluído + horas + prazo, por plano ativo |

## 3. Anatomia

- **4 KPIs** no topo (cards com ícone): horas estudadas, tópicos concluídos, revisões em dia, sequência atual.
- **Atividade de estudo:** gráfico de barras verticais (horas/semana, 8 semanas), a semana atual destacada em primária. Conta a história da **consistência** ao longo do tempo.
- **Grid 2 colunas:**
  - **Horas por matéria** — barras horizontais ranqueadas (onde o tempo foi).
  - **Saúde das revisões** — donut animado de % em dia + legenda (em dia / atrasadas / concluídas), primária + âmbar (respeitando os tokens; verde fica reservado a "dominado").
- **Progresso por plano** — linha por plano com barra + %.
- Rodapé: aviso de que a tela é só leitura (projeção do que já aconteceu).

## 4. Estados

- **Cenário A — com dados:** todos os blocos preenchidos (dados coerentes com o resto: planos BB 2026/ENEM, matérias do edital, HOJE = 15/06).
- **Cenário B — vazio:** "Estude para ver dados" + CTA "Ir para Hoje".

## 5. Decisões

- **A1 reafirmada:** Progresso existe porque responde perguntas únicas (tendência, distribuição de tempo, saúde das revisões). Sem isso seria ilha.
- **Streak vive aqui**, não na sidebar — é métrica de progresso, não de navegação (decisão de 2026-06-16, ao remover o streak do card de foco da sidebar).
- **Gráficos sem libs** — SVG/divs puros com os tokens do tema, animação do donut em `stroke-dashoffset`. Coerente com a regra do protótipo (HTML/CSS/JS puro).
- **Verde só em "dominado":** a saúde das revisões usa primária (em dia) + âmbar (atrasada), nunca verde, para não colidir com a semântica de estado.

## 6. Pendências 🔶

1. Filtro de período (7d / 30d / tudo) e por plano — hoje os recortes são fixos.
2. "Revisões em dia" não conta tempo de revisão na carga (mesma 🔶 da T2).
3. Definição fechada de "sequência" (o que quebra o streak) — validar no uso.
