// Dados mock da T1 "Hoje" (cenário "com pendência" do protótipo).
// Serão substituídos por queries ao Supabase na fatia de backend.
import type { ItemHoje, Pendencia } from "@/domain/types";

export interface Alternativa {
  id: string;
  titulo: string;
  caminho: string;
  materia: string;
  minutos: number;
}

export interface Detalhe {
  id: string;
  chipText: string;
  status: "warn" | "foco";
  titulo: string;
  meta: string;
}

export interface FocoView {
  titulo: string;
  caminho: string;
  reason: string;
  minutos: number;
}

export const filaInicial: ItemHoje[] = [
  {
    id: "f1",
    tipo: "estudo",
    titulo: "Juros Compostos",
    caminho: "BB 2026 › Matemática Financeira",
    minutos: 40,
    meta: "Estudo · Matemática Financeira · ~40 min",
    emFoco: true,
  },
  {
    id: "f2",
    tipo: "estudo",
    titulo: "Beans e Injeção de Dependência",
    caminho: "Spring Boot › Fundamentos",
    minutos: 30,
    meta: "Estudo · Spring Boot › Fundamentos · ~30 min",
  },
  {
    id: "f3",
    tipo: "revisao",
    titulo: "Regra de Três",
    caminho: "BB 2026 › Matemática",
    minutos: 0,
    meta: "Revisão 2 de 3 · BB 2026 › Matemática · concluído há 7 dias",
    prox: "+7 dias (18/06)",
  },
  {
    id: "f4",
    tipo: "revisao",
    titulo: "Crase",
    caminho: "BB 2026 › Português",
    minutos: 0,
    meta: "Revisão 1 de 3 · BB 2026 › Português · concluído ontem",
    prox: "+7 dias (18/06)",
  },
];

export const alternativasIniciais: Alternativa[] = [
  {
    id: "a1",
    titulo: "Porcentagem",
    caminho: "BB 2026 › Matemática Financeira",
    materia: "Matemática Financeira",
    minutos: 30,
  },
  {
    id: "a2",
    titulo: "Interpretação de Texto",
    caminho: "BB 2026 › Português",
    materia: "Português",
    minutos: 25,
  },
];

export const pendenciasIniciais: Pendencia[] = [
  {
    id: "p1",
    tipo: "estudo",
    titulo: "Razão e Proporção",
    meta: "Estudo · Matemática · ~35 min (de ontem)",
  },
  {
    id: "p2",
    tipo: "estudo",
    titulo: "Funções",
    meta: "Estudo · Matemática · ~30 min (de ontem)",
  },
];

export const detalhesIniciais: Detalhe[] = [
  {
    id: "d1",
    chipText: "estudo não feito",
    status: "warn",
    titulo: "Razão e Proporção",
    meta: "~35 min · BB 2026 › Matemática",
  },
  {
    id: "d2",
    chipText: "estudo não feito",
    status: "warn",
    titulo: "Funções",
    meta: "~30 min · BB 2026 › Matemática",
  },
  {
    id: "d3",
    chipText: "revisão não feita",
    status: "warn",
    titulo: "Juros Simples",
    meta: "3ª de 3 · BB 2026 › Matemática",
  },
];

export const focoInicial: FocoView = {
  titulo: "Juros Compostos",
  caminho: "BB 2026 › Matemática Financeira",
  reason: "Próximo na sua ordem — nada vencido antes dele.",
  minutos: 40,
};

export const proximoInicial = {
  titulo: "Porcentagem",
  caminho: "BB 2026 › Matemática Financeira",
  minutos: 30,
};

// Conjunto de dados que alimenta a T1. A tela é uma projeção destes dados:
// vazio = usuário novo (sem planos). Hoje vem do mock; amanhã, do Supabase —
// a tela não muda, só a origem dos dados.
/** Conteúdo do card "Foco de hoje" da sidebar. Ausente = sem foco (não renderiza). */
export interface FocoSidebar {
  titulo: string;
  contexto: string;
  progresso: number; // 0–100
  legenda: string;
}

export interface DadosHoje {
  fila: ItemHoje[];
  alternativas: Alternativa[];
  pendencias: Pendencia[];
  detalhes: Detalhe[];
  foco: FocoView;
  /** Há ao menos um plano cadastrado? Distingue cold-start de dia-vazio. */
  temPlanos: boolean;
  /** Foco do dia para a sidebar; ausente quando não há nada a estudar. */
  focoSidebar?: FocoSidebar;
}

export const dadosCheio: DadosHoje = {
  fila: filaInicial,
  alternativas: alternativasIniciais,
  pendencias: pendenciasIniciais,
  detalhes: detalhesIniciais,
  foco: focoInicial,
  temPlanos: true,
  focoSidebar: {
    titulo: "Juros Compostos",
    contexto: "Mat. Financeira · ~40min",
    progresso: 33,
    legenda: "1 de 3 estudos feitos",
  },
};

export const dadosVazio: DadosHoje = {
  fila: [],
  alternativas: [],
  pendencias: [],
  detalhes: [],
  // foco neutro: nada do cenário cheio deve vazar no estado vazio.
  foco: { titulo: "", caminho: "", reason: "", minutos: 0 },
  temPlanos: false,
};
