import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { DadosHoje } from "@/domain/types";

// Projeção da T1 "Hoje" a partir dos dados reais do usuário logado.
//
// Hoje a fila é SEMPRE vazia: a camada de agendamento (revisões/sessões) ainda
// não existe no schema — é a próxima fatia vertical. Então a única coisa real
// que conseguimos responder agora é "o usuário já cadastrou algo?" (temPlanos),
// que decide entre cold-start ("comece criando um plano") e dia-vazio. Quando o
// agendamento entrar, é AQUI que a fila/foco passam a ser preenchidos — a tela
// <Hoje> não muda.
export async function getDadosHoje(): Promise<DadosHoje> {
  const supabase = await createSupabaseServerClient();

  const [{ count: planos }, { count: avulsos }] = await Promise.all([
    supabase.from("planos").select("id", { count: "exact", head: true }),
    supabase
      .from("topicos")
      .select("id", { count: "exact", head: true })
      .is("materia_id", null),
  ]);

  const temPlanos = (planos ?? 0) > 0 || (avulsos ?? 0) > 0;

  return {
    fila: [],
    alternativas: [],
    pendencias: [],
    detalhes: [],
    foco: { titulo: "", caminho: "", reason: "", minutos: 0 },
    temPlanos,
  };
}
