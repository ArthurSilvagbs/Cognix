# T1 — Hoje (home)

> **Wireframe:** `t1-hoje.html` · **Fase:** 4 — Protótipo · **Status:** em revisão
> **Referências:** Arquitetura de Informação v0.1 (T1, F2, F3, F4) · Modelo de Domínio v0.1 (§3 projeção "Hoje", R1, R3) · PRD §5.2, §8, §10

---

## 1. Objetivo da tela

Responder **"o que eu estudo agora?"** em menos de 10 segundos (métrica do PRD §10). É a home ✅: o app abre aqui, sempre. Tudo nesta tela ou responde essa pergunta ou sai.

**Anti-objetivos:** não é dashboard, não mostra gráficos, não tem streak/gamificação, não lista o plano inteiro. Quem quer visão geral vai para Progresso (T7) ou Planos (T3).

## 2. Dados que a tela consome (projeção, anti-ilha)

Nenhuma tabela própria. Tudo deriva do modelo:

| Bloco | Consulta |
|---|---|
| Resumo do dia | Agendamentos de hoje (count + Σ estimativaMin) + revisões vencendo (count) |
| Banner do caos | Existe Agendamento `pendente` com `data < hoje` OU Revisão `agendada` com `dataPrevista < hoje` |
| Recomendação principal | 1º Agendamento `pendente` de hoje, na `ordem` do plano |
| Revisões de hoje | Revisões `agendada` com `dataPrevista ≤ hoje` |
| Alternativas | Próximos N=2 tópicos da fila (mesma query da recomendação, offset 1) |
| Timer → grava | SessãoDeEstudo (`inicio`, `duracaoMin`, `anotacoes`, `revisaoId?`) |

## 3. Anatomia (ordem vertical = hierarquia de atenção)

```
┌──────────────────────────────────────────────┐
│ kicker: data por extenso                     │
│ H1 "Hoje"                                    │
│ resumo do dia (1 linha, números em negrito)  │
├──────────────────────────────────────────────┤
│ [banner do caos]      ← só quando há pendência│
├──────────────────────────────────────────────┤
│ ╔══ HERO (card destacado) ══╗                │
│ ║ badge ESTUDE AGORA + chip tempo            │
│ ║ título do tópico (maior texto da tela)     │
│ ║ breadcrumb Plano › Matéria                 │
│ ║ linha de motivo ("por que este?")          │
│ ║ [▶ Iniciar] [Estudei fora do app]          │
│ ╚════════════════════════════╝               │
├──────────────────────────────────────────────┤
│ REVISÕES DE HOJE (n)                         │
│   item: tópico · "2ª de 3" · contexto        │
│         [Revisar] [Adiar]                    │
├──────────────────────────────────────────────┤
│ ALTERNATIVAS VÁLIDAS                         │
│   item: tópico · matéria · tempo [Estudar esta]│
│   nota: "trocar não bagunça o plano"         │
└──────────────────────────────────────────────┘
```

**Regra de ouro da hierarquia:** o título do tópico recomendado é o maior texto da página depois do H1 — o olho tem que cair nele primeiro. Banner e revisões nunca competem visualmente com o hero.

## 4. Estados do hero (máquina de estados)

```
parado ──Iniciar──▶ rodando ⇄ pausado
  │                    │
  │ "Estudei fora      │ Encerrar
  │  do app"           ▼
  └──────────▶ registrar sessão ──Concluí──▶ concluído (promove próximo)
                       │                          │
                       └─Ainda estudando─▶ parado └─Encerrar por hoje─▶ fim do dia
```

| Estado | O que mostra | Notas |
|---|---|---|
| **parado** | badge + título + breadcrumb + motivo + ações | default |
| **rodando** | cronômetro 56px tabular + tópico + Pausar/Encerrar/Descartar | estado "Estudando" em kicker |
| **pausado** | cronômetro esmaece (`--ink-400`), botão vira "Retomar" | pausa sem culpa |
| **registrar** | duração pré-preenchida e **editável** + anotações + "Concluiu?" | entrada manual é 1ª classe (P1 cronometra no celular) |
| **concluído** | linha "✓ X concluído · 1ª revisão amanhã" + próximo da fila promovido | R1 dispara aqui |
| **fim do dia** | "Tudo feito ✓" + 3 KPIs (sessões/tempo/revisões) + "estudar mais uma" | único lugar da tela com números agregados |
| **vazio** | tela inteira vira estado vazio desenhado: "Nada por hoje." + 2 CTAs | PRD §8: nunca tela em branco |

## 5. Interações e microcopy (decisões A2/A3 em ação)

| Ação | Comportamento | Microcopy exata |
|---|---|---|
| Replanejar (banner) | **Aplica direto** (A2), banner some, revisão reancorada entra no topo da lista, resumo do dia atualiza | toast: "Replanejado: 2 estudos deslizados · 1 revisão trazida para hoje." + **Desfazer** |
| Adiar revisão | Item sai da lista (A3: pular = adiar, nunca morre) | toast: "Revisão de X adiada para amanhã." + **Desfazer** |
| Revisar | Item marca ✓, mostra encadeamento (R1) | toast: "Próxima revisão de X: +7 dias (18/06)." |
| Concluí | Hero promove próximo da fila | toast: "Revisões agendadas: amanhã (12/06) · depois +7d e +21d." — *só a 1ª tem data firme; seguintes são projeção (R1)* |
| Estudar esta (alternativa) | Troca a recomendação, sem punição | toast: "Trocado para X. Y continua na fila." + motivo vira "Escolha sua — o plano se ajusta, não reclama." |
| Descartar sessão | Nada é gravado | toast: "Sessão descartada — nada foi registrado." |

**Tom do microcopy:** afirmativo, curto, nunca culpado. Proibido: vermelho, "atrasado", contagem de dias perdidos, exclamações de alarme. O banner do caos diz "Sem problema — dá pra reorganizar em um clique."

## 6. Design (para a Fase 5 formalizar)

> **Decisão de processo (2026-06-11):** o protótipo é de **alta fidelidade** — wireframe cinza não permite avaliar o diferencial (design impecável) e o custo de hi-fi com IA é baixo. A Fase 5 não "pinta" o protótipo: ela **formaliza em tokens** o que sobreviver à revisão aqui.

- **Cor primária: índigo `#4f46e5` — PROVISÓRIA 🔶** (validar na Fase 5). Aparece **somente com significado**: ação primária (botões primary, FAB, "Novo"), estado ativo (nav, kicker "Estudando" do timer), foco (anéis de foco/input) e o badge "Estude agora". Se a cor aparecer fora dessa lista, está errado (PRD §8: 1 primária + neutros).
- **Neutros:** 4 níveis de texto (`ink-900/700/500/400`) + 2 superfícies (`bg-card`, `bg-soft`) + 2 bordas.
- **Tipografia:** escala fixa 11/12/13/14/15/17/22/28 + 56 (timer). Números sempre tabulares (`tnum`) — timer, contagens, KPIs.
- **Espaçamento:** grid 4/8px estrito (tokens `--s1..--s8`). Card hero tem o dobro de padding dos cards comuns (24 vs 16) — destaque por respiro, não por cor.
- **Destaque do hero:** borda mais forte + sombra dupla suave. É o único card com sombra na tela.
- **Microinterações:** 180ms (janela 150–250ms do PRD §8) em hover, troca de estados (fade+4px de subida) e toast. `prefers-reduced-motion` desliga tudo.
- **Banner do caos:** borda *tracejada* + fundo rebaixado = visualmente "provisório", algo a resolver — em oposição ao hero, sólido e permanente.
- **Mobile (A4):** barra inferior com 4 destinos + FAB central "+". Conteúdo em coluna única, mesma ordem. Timer e botões têm alvo de toque ≥44px.

## 7. Notas de desenvolvimento

- **Componentes que nascem aqui e se repetem nas outras telas:** sidebar/bottombar, card, item de lista, badge, chip, toast com desfazer, estado vazio, painel de estados do hero.
- **Timer real precisa sobreviver à navegação** (persistente entre telas e refresh — guardar `inicio` e calcular, não contar em memória). No wireframe é só `setInterval`.
- **Toast com Desfazer:** o undo no produto real é transação reversível (replanejamento guarda o estado anterior), não um "redo visual". Janela de 5s.
- **"Estudei fora do app"** abre o mesmo formulário de registro com duração manual — é o caminho do P1 hoje (cronometra no celular). Não é caso de borda, é fluxo principal.
- **Acessibilidade:** hero com `aria-live="polite"` (mudanças de estado anunciadas), toast `role="status"`, foco visível em tudo, ícones SVG `aria-hidden` com texto sempre ao lado.
- **Barra de cenários** (canto inferior esquerdo) não existe no produto. Cada cenário é um link com `?cenario=` que **recarrega a página** num estado coerente — sem misturar estados de interação: com pendência / dia normal / tudo feito / sem plano.

## 8. O que ficou de fora de propósito

| Tentação | Por que não |
|---|---|
| Gráfico/streak na home | Home é execução, não dashboard (✅ contrato §3) |
| Mais de 2 alternativas | Vira decisão de novo — o custo que o produto elimina |
| Badge de "X dias atrasado" | Pune o caos em vez de absorver (princípio §4.2) |
| Botão de replanejar permanente | Sem pendência não há o que replanejar; aparecer só no banner evita ruído |
