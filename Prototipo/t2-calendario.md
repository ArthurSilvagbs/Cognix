# T2 — Calendário

> **Protótipo:** `t2-calendario.html` · **Fase:** 4 · **Status:** ✅ validada (2026-06-14)
> **Referências:** AI v0.1 (T2, projeção Calendário) · Modelo §3 (união Agendamentos + Revisões) · R1 (encadeamento) · R3 (replanejar) · D7 (disponibilidade)

## 1. Objetivo

Projeção do calendário: por dia, a **união de Agendamentos de estudo + Revisões**. Passado mostra o que foi feito; futuro mostra o que vem. Resolve o problema visual aberto desde a modelagem: como mostrar revisões encadeadas sem mentir (próxima = firme, seguintes = projeção).

## 2. Duas visões (toggle no header)

### Semana (padrão, desktop premium)
- 7 colunas (dom–sáb), hoje destacado em primária, altura cheia da tela.
- **Indicador de capacidade D7 por coluna:** carga do dia (soma das estimativas dos estudos não-feitos) ÷ disponibilidade do dia. Barra fica âmbar quando o dia está sobrecarregado.
- Sem grade de horas — **decisão consciente**: o modelo agenda por data (`date`), não por hora. Timeline de horas seria mentira.
- Scroll vertical interno quando o dia lota.

### Mês (estilo ClickUp, desktop)
- Grade 7×6 full-screen, dias fora do mês esmaecidos, hoje com círculo primária.
- Até 3 itens por célula; excedente vira **"+N mais"** → abre a semana daquele dia.
- Linhas distribuídas uniformemente (altura total da tela).

### Mês no mobile (estilo iPhone) ✅ decisão 2026-06-14
- Chips filtram para **pontinhos** coloridos por dia (revisão = primária, atrasado = âmbar, concluído = verde/`--success`).
- Tocar num dia o seleciona (círculo primária) e abre a **agenda daquele dia** abaixo da grade.
- Começa selecionando hoje; tocar num item da agenda abre o painel T5.

## 3. Linguagem visual dos eventos

- **Estudo** = ícone livro · **Revisão** = ícone setas (dois canais, nunca só cor).
- **Firme** (estudos + próxima revisão): chip sólido.
- **Projeção** (revisões 2ª+): chip tracejado + opacidade + tag "proj" — resolve o 🔶 do R1 (só a próxima revisão é certa; as seguintes dependem de quando a anterior for concluída).
- **Não feito / atrasado**: âmbar. **Concluído**: riscado + esmaecido (check verde).
- **Foco de hoje**: chip em primária.

## 4. Painel do tópico (T5) integrado

Clicar em qualquer evento (no calendário ou na agenda mobile) abre o **mesmo painel lateral T5 da T4** (drawer da direita). O estado e as ações se adaptam ao item clicado:
- Revisão → "Em revisão (Nª · data)", ações **Já domino / Reabrir**.
- Estudo em foco → "Em estudo", ações **Concluí / Já domino**.
- Estudo futuro → "Não iniciado".
- Matriz estado×ação idêntica à T4 (só ações válidas aparecem).
- Sessões e revisões da seção se adaptam ao estado (nada / histórico / ciclo previsto).

## 5. Ações globais

- Navegação ‹ › (±semana ou ±mês conforme a visão) + botão **Hoje**.
- **Replanejar** no header (R3) — uma ação, não sete (aplica direto + toast-resumo).

## 6. Pendências 🔶

1. Capacidade na visão semana conta só estudos (revisões não entram na carga). Validar se revisão deve consumir tempo do dia.
2. Disponibilidade D7 está hardcoded no protótipo (seg–sex 1h, sáb–dom 3h) — virá do perfil (T8).
3. Datas do protótipo ancoradas em HOJE = 15/06/2026 (segunda).
