# T5 — Tópico (painel lateral)

> **Protótipo:** vive dentro de `t4-plano.html` (clicar em qualquer tópico) · **Status:** 🟡 rascunho para revisão
> **Referências:** AI v0.1 (T5) · Modelo de Domínio (Tópico, Sessão, Revisão, R1/R2/D4/D6)

## 1. Objetivo

Detalhe completo da **entidade central** sem perder o contexto: painel desliza da direita (estilo Linear) sobre qualquer view — plano, Hoje, calendário. Tela cheia só no mobile.

## 2. Anatomia (cima → baixo)

1. **Cabeçalho:** breadcrumb `Plano › Matéria` · título · badge de estado (com detalhe: "Em revisão (3ª de 3 · 18/06)") · ações.
2. **Ações:** `Concluí` (primária — gatilho de R1) · `Já domino` (R2/D1) · `Reabrir` (D4). Cada uma responde com toast citando a consequência ("revisões agendadas: amanhã · +7d · +21d").
3. **Notas:** texto livre do tópico (markdown) — ≠ anotações de sessão.
4. **Links (D6):** URLs de material externo. **Sem upload de arquivo** — decisão explícita na UI.
5. **Sessões:** histórico (duração, anotação, data) — só leitura aqui; sessão nasce na T1.
6. **Revisões:** realizadas ✓ + próxima firme + seguintes como projeção (encadeamento R1). Tópico não concluído mostra o ciclo previsto.

## 3. Comportamento

- Abre por clique em tópico (T4 lista/kanban; futuramente T1 fila e T2 calendário); fecha por X, clique fora ou `Esc`.
- As 3 ações de estado mudam o badge na hora + toast explicativo — **a UI conta a história** (regra global de design).
- 🔶 Quais ações aparecem por estado (ex.: "Reabrir" só faz sentido em concluído/dominado)? No rascunho, todas visíveis; decidir matriz estado×ação na revisão.

## 4. O que não tem (de propósito)

| Tentação | Por quê |
|---|---|
| Upload de PDF/arquivo | D6: notas + links; gerenciador, não repositório |
| Editar revisões manualmente uma a uma | Manutenção de sistema — intervalos se editam no plano/usuário (D2) |
| Timer dentro do painel | Executar é papel da T1 Hoje; aqui é consultar/gerenciar |
