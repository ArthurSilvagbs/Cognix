# Protótipo — Fase 4

Wireframes HTML navegáveis das telas definidas na Arquitetura de Informação v0.1.

**Como usar:** abra `index.html` no navegador. Sem build, sem dependências — HTML/CSS/JS puro de propósito: isto é um wireframe que se navega, não o app.

## Telas (T1–T8)

Cada tela tem um par: `tN-nome.html` (wireframe navegável) + `tN-nome.md` (descritivo de design e desenvolvimento).

| # | Tela | Status |
|---|---|---|
| T1 | Hoje (home — métrica dos 10s) | ✅ validada (2026-06-12) |
| T2 | Calendário (semana/mês, resumo do dia) | ✅ validada (2026-06-16) |
| T3 | Planos (lista) | ✅ validada (2026-06-16) |
| T4 | Plano (detalhe: árvore ⇄ kanban) | ✅ validada (2026-06-12) |
| T5 | Tópico (painel lateral, dentro de t4-plano.html) | ✅ validada (2026-06-12) |
| T6 | Novo plano (wizard, 2 modos: IA / manual) | ✅ validada (2026-06-16) |
| T7 | Progresso | ✅ validada (2026-06-16) |
| T8 | Configurações | ✅ validada (2026-06-16) |

**Fase 4 completa** (2026-06-16): 8 telas, navegação ponta a ponta, sidebar unificada (ícones canônicos + card "Foco de hoje"), tokens compartilhados em `css/wireframe.css`.

Regras: **alta fidelidade** — cor primária provisória índigo 🔶 + neutros, cor só com significado (a Fase 5 formaliza os tokens do que sobreviver à revisão); dados fictícios realistas (planos "BB 2026" e "ENEM 2026"); mobile testável (barra inferior, decisão A4); cenários de demonstração via `?cenario=` na URL.
