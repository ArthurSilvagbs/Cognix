# T8 — Configurações

> **Protótipo:** `t8-config.html` · **Fase:** 4 · **Status:** ✅ validada (2026-06-16)
> **Referências:** Arquitetura de Informação v0.1 (T8, projeção Usuário) · Modelo de Domínio v0.1 (Usuário; D1 dominado, D2 intervalos, D7 disponibilidade) · R3 (teto de revisões/dia)

---

## 1. Objetivo da tela

Editar os **padrões do perfil** que alimentam os algoritmos do app. É a projeção da entidade **Usuário**. Em especial, é a **fonte única da disponibilidade semanal (D7)** — que a T2 e a T6 apenas leem.

**Anti-objetivos:** não é gestão de conta (auth fica no provedor, Fase 6). No MVP de uso próprio, "conta" é leve.

## 2. Dados que a tela edita (entidade Usuário)

| Bloco | Campo |
|---|---|
| Disponibilidade semanal | `disponibilidade: int[7]` (minutos por dia da semana) — **D7** |
| Intervalos de revisão | `intervalosPadrao: int[]` (dias; sugestão 1·7·21, sequência livre) — **D2** (override por plano) |
| Manutenção do dominado | `intervaloDominado` (dias; default 60) — **D1** |
| Teto de revisões/dia | `tetoRevisoesDia` — usado no replanejamento (**R3**) |
| Aparência | tema (escuro padrão / claro) |

## 3. Anatomia

- **Conta:** avatar + nome/email + "Gerenciar conta" (placeholder leve — auth é Fase 6).
- **Disponibilidade semanal (D7):** 7 linhas (Seg–Dom), **stepper de 15 min** cada, barra proporcional ao teto de 10 h, sáb/dom destacados. **Total da semana** recalcula ao vivo. Default seg–sex 1h, sáb–dom 3h (bate com o readonly que a T6 mostra).
- **Revisão espaçada:**
  - Intervalos padrão (D2) — chips editáveis `1 → 7 → 21`, com adicionar/remover; copy deixa claro que cada plano pode sobrescrever.
  - Manutenção do dominado (D1) — stepper, default 60 dias.
  - Teto de revisões/dia (R3) — stepper, com explicação de que o replanejamento respeita o limite.
- **Aparência:** **switch** escuro/claro (lua/sol), sincronizado com o tema global.
- **Salvar** com feedback "✓ Salvo" inline.

## 4. Decisões

- **T8 é dona da disponibilidade D7.** Antes a T2 tinha D7 hardcoded e a T6 mostrava como readonly "do perfil"; com a T8 isso fecha o loop — a T6 ganha o link "Ajustar em Configurações →". (2026-06-16)
- **Tema como switch, não segmented** — binário escuro/claro pede toggle, mais limpo. (feedback do Arthur)
- **Bloco "Conta" fica leve** — sem gestão real de conta no MVP; candidato a virar só "Sair" ou cair na Fase 6.
- **Tudo com feedback ao vivo** (total da semana, salvar) — a UI conta o que aconteceu com os dados.

## 5. Pendências 🔶

1. Bloco "Conta" — decidir entre "Sair" simples ou remover até a Fase 6 (auth).
2. Revisão da hierarquia tipográfica dos subtítulos de seção (transversal, Fase 5).
3. Persistência real dos campos (protótipo só dá feedback visual).
