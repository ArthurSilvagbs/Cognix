-- Plano ganha ciclo de vida (T3/T6): rascunho → ativo → arquivado, e um prazo
-- opcional (data da prova/meta). Plano nasce como rascunho; só "Ativar" o torna
-- ativo (no MVP a ativação ainda não distribui agendamentos — isso é R5, fatia
-- futura). 'arquivado' some das listas ativas (D5: arquivar por plano).

alter table public.planos
  add column if not exists status text not null default 'rascunho'
    check (status in ('rascunho','ativo','arquivado')),
  add column if not exists prazo date;
