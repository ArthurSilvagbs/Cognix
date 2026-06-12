# T4 — Plano (detalhe)

> **Protótipo:** `t4-plano.html` · **Fase:** 4 · **Status:** 🟡 rascunho para revisão
> **Referências:** AI v0.1 (T4) · Modelo de Domínio (§3 projeções Lista/árvore e Kanban, R4)

## 1. Objetivo

Ver e **editar a estrutura** de um plano: matérias, tópicos, ordem, estados. É a única tela onde a hierarquia `Plano → Matéria → Tópico` aparece inteira — e onde IA e usuário manual convergem (o rascunho gerado pela IA é editado **aqui**, não num editor paralelo).

## 2. Dados (projeções, anti-ilha)

| Bloco | Consulta |
|---|---|
| Cabeçalho/KPIs | Agregações do plano: tópicos `concluido`+`dominado` ÷ total, % revisões em dia, `dataAlvo` |
| Lista (árvore) | Matérias por `ordem` → Tópicos por `ordem`, com estado + mini-barra por matéria |
| Kanban | **Mesmos tópicos** agrupados por estado derivado — "Em revisão" não existe no banco (= `concluido` + revisão pendente, R4) |
| Toggle Lista⇄Kanban | Zero query nova — só outra projeção. Teste vivo do anti-ilha |

## 3. Anatomia e interações

- **Cabeçalho:** breadcrumb `Planos › BB 2026` · KPIs (47/138, 34%, 92% revisões, prova em 150d) · ações `+ Matéria`, `+ Tópico`, menu ⋯ (intervalos do plano, pausar, arquivar — D5).
- **Toolbar:** segmented Lista/Kanban + dica "arraste para reordenar — a ordem é a recomendação do Hoje" (a `ordem` é o que alimenta a fila da T1).
- **Árvore:** matéria colapsável (chevron + contagem + mini-barra); tópico = ícone de estado + título + meta contextual por estado (próxima revisão, sessões, agendamento, manutenção).
- **Clicar em qualquer tópico** (lista ou kanban) abre o painel T5 — ver `t5-topico.md`.

## 4. Estados do tópico — iconografia (R4)

| Estado | Ícone | Cor |
|---|---|---|
| Não iniciado | círculo vazio | neutra |
| Em estudo | círculo meio-cheio | neutra |
| Em revisão (derivado) | setas circulares | **âmbar** (atenção: tem revisão viva) |
| Dominado | estrela | **primária** (conquista, não alerta) |

## 5. Pendências 🔶

1. Drag-and-drop de reordenação — só indicado no protótipo, implementar na fase 7.
2. Edição inline de nomes (matéria/tópico) — duplo clique? Decidir no protótipo navegável.
3. Kanban em mobile: 2 colunas funciona ou vira carrossel?
