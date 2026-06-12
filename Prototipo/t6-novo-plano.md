# T6 — Novo Plano (wizard)

> **Protótipo:** `t6-novo-plano.html` · **Fase:** 4 · **Status:** 🟡 rascunho para revisão
> **Referências:** AI v0.1 (T6, fluxo F1 ALIMENTAR) · Modelo §4 (o que a IA lê/escreve) · PRD §5.1 (modos de input)

## 1. Objetivo

O fluxo F1 inteiro: conteúdo entra (de qualquer jeito) → IA devolve estrutura como **rascunho** → usuário confirma → R5 distribui. É a única etapa do produto com custo de IA — e a tela diz isso.

## 2. Os 3 passos

| Passo | O que tem | Regra que protege |
|---|---|---|
| **1 — Modo** | 4 cards: Documento / Lista solta / Só o objetivo / **Manual**. Cada um com exemplo real (microcopy do PRD §5.1) | Manual é caminho de primeira classe — card igual aos outros, nunca "outras opções" |
| **2 — Conteúdo** | Textarea (label muda por modo) + **2 perguntas só**: data da prova (opcional) e disponibilidade — **pré-preenchida do perfil (D7)**, somente leitura | Nada de questionário longo; o custo de decisão é o inimigo |
| **3 — Rascunho** | Resumo (8 matérias · 138 tópicos) + lista de matérias com contagem · aviso "nada foi agendado ainda" | "A IA escreve o rascunho; o usuário é o dono" — banner soft primária |

**Fluxos de saída:**
- **Manual** → pula IA, cria plano `rascunho` vazio e vai direto pra T4 (mesma tela de edição — **não existe editor paralelo**).
- **Ativar plano** → R5 distribui agendamentos (algorítmico) → aterrissa na T1 com toast "primeiro estudo: amanhã".
- **Revisar na tela do plano** → T4 com o plano em estado `rascunho`.

## 3. Limites duros da IA (visíveis na tela, Modelo §4)

- Escreve **somente** estrutura (Plano → Matéria → Tópico), sempre `rascunho`.
- **Nunca** cria sessões, revisões ou agendamentos — microcopy explícita no passo 2.
- Loading da geração diz: *"única etapa com custo de IA — daqui pra frente é tudo algorítmico"* (mitigação do risco PRD §9.1, comunicada ao usuário).

## 4. Pendências 🔶

1. Upload real de arquivo (PDF) no passo 2 — o protótipo só cola texto; upload do **documento de origem** é permitido (D6 proíbe armazenar arquivo *no tópico*, não a entrada única na criação). Implementação na fase 7.
2. Modo objetivo: a IA deve perguntar nível atual ("já sei derivadas") ou inferir? Decidir quando o prompt da IA for desenhado (fase de implementação).
3. Nome do plano: a IA sugere ("BB 2026") e o usuário renomeia — confirmar no protótipo navegável.
