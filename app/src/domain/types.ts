// Tipos do domínio Cognix v2 (Fase 2 — Modelo de Domínio).
// Provisórios para a UI com dados mock; serão reconciliados com o schema
// do Supabase na fatia de backend. Invariante central: Plano → Matéria → Tópico
// (Tópico é a entidade central; tópico avulso = materiaId null).

export type ID = string;

export interface Timestamps {
  createdAt: string; // ISO
  updatedAt: string;
}

/** Estado do ciclo de vida do tópico (escala de cor de estado do DS). */
export type EstadoTopico = "a-estudar" | "em-estudo" | "em-revisao" | "dominado";

export interface Plano extends Timestamps {
  id: ID;
  nome: string;
}

export interface Materia extends Timestamps {
  id: ID;
  nome: string;
  planoId: ID;
}

export interface Topico extends Timestamps {
  id: ID;
  titulo: string;
  materiaId: ID | null; // null = tópico avulso, com os mesmos poderes
  estado: EstadoTopico;
}

// ------------------------------------------------------------------
// View model da T1 "Hoje".
// A "fila de hoje" é uma PROJEÇÃO do domínio (estudos agendados + revisões
// vencendo), não uma entidade — por isso vive aqui, separada das entidades.
// ------------------------------------------------------------------

export type TipoItem = "estudo" | "revisao";

export interface ItemHoje {
  id: ID;
  tipo: TipoItem;
  titulo: string;
  /** Caminho legível "Plano › Matéria" (com › já incluído). */
  caminho: string;
  /** Estimativa em minutos. */
  minutos: number;
  /** Linha de contexto exibida sob o título (já formatada). */
  meta: string;
  /** Só para revisão: texto da próxima ocorrência, ex. "+7 dias (18/06)". */
  prox?: string;
  // estados de UI (transientes, não pertencem ao domínio):
  feito?: boolean;
  emFoco?: boolean; // só estudos entram em foco
  oculto?: boolean; // adiado (com desfazer)
}

/** Estudo de ontem que não foi feito — alimenta o banner do caos (F3). */
export interface Pendencia {
  id: ID;
  titulo: string;
  meta: string;
  tipo: TipoItem;
}

/** Alternativa de estudo ("se não estiver no clima") — projeção, não entidade. */
export interface Alternativa {
  id: ID;
  titulo: string;
  caminho: string;
  materia: string;
  minutos: number;
}

/** Linha de detalhe do banner de pendência. */
export interface Detalhe {
  id: ID;
  chipText: string;
  status: "warn" | "foco";
  titulo: string;
  meta: string;
}

/** Foco de hoje (card do Hero). */
export interface FocoView {
  titulo: string;
  caminho: string;
  reason: string;
  minutos: number;
}

/** Conteúdo do card "Foco de hoje" da sidebar. Ausente = sem foco (não renderiza). */
export interface FocoSidebar {
  titulo: string;
  contexto: string;
  progresso: number; // 0–100
  legenda: string;
}

/** View model da T1 "Hoje". A fila é uma PROJEÇÃO do domínio (estudos
 * agendados + revisões vencendo), montada na camada de dados — por isso vive
 * aqui, separada das entidades. */
export interface DadosHoje {
  fila: ItemHoje[];
  alternativas: Alternativa[];
  pendencias: Pendencia[];
  detalhes: Detalhe[];
  foco: FocoView;
  /** Há ao menos um plano (ou avulso) cadastrado? Distingue cold-start de dia-vazio. */
  temPlanos: boolean;
  /** Foco do dia para a sidebar; ausente quando não há nada a estudar. */
  focoSidebar?: FocoSidebar;
}
