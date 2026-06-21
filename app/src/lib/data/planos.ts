import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { EstadoTopico } from "@/domain/types";

// Consultas (lado servidor) da T3 Planos e do detalhe do plano (T4). Chamadas
// direto de Server Components. As mutações ficam em app/planos/actions.ts.
//
// Modelo: Plano → Matéria → Tópico. Não há FK direta planos↔topicos, então a
// contagem de tópicos vem pelo aninhamento materias(topicos(...)).

export type StatusPlano = "rascunho" | "ativo" | "arquivado";

export interface PlanoResumo {
  id: string;
  nome: string;
  status: StatusPlano;
  prazo: string | null; // ISO date ou null
  totalMaterias: number;
  totalTopicos: number;
  dominados: number;
  /** % concluído = dominados ÷ total (0 quando não há tópicos). Real, não estimado. */
  pct: number;
}

interface TopicoRow {
  id: string;
  estado: EstadoTopico;
}
interface MateriaRow {
  id: string;
  topicos: TopicoRow[] | null;
}
interface PlanoRow {
  id: string;
  nome: string;
  status: StatusPlano;
  prazo: string | null;
  materias: MateriaRow[] | null;
}

export async function listarPlanos(): Promise<PlanoResumo[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("planos")
    .select("id, nome, status, prazo, materias(id, topicos(id, estado))")
    .neq("status", "arquivado")
    .order("created_at", { ascending: true });

  if (error || !data) return [];

  return (data as PlanoRow[]).map((p) => {
    const materias = p.materias ?? [];
    const topicos = materias.flatMap((m) => m.topicos ?? []);
    const dominados = topicos.filter((t) => t.estado === "dominado").length;
    return {
      id: p.id,
      nome: p.nome,
      status: p.status,
      prazo: p.prazo,
      totalMaterias: materias.length,
      totalTopicos: topicos.length,
      dominados,
      pct: topicos.length === 0 ? 0 : Math.round((dominados / topicos.length) * 100),
    };
  });
}

export interface TopicoAvulso {
  id: string;
  titulo: string;
  estado: EstadoTopico;
}

export async function listarAvulsos(): Promise<TopicoAvulso[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("topicos")
    .select("id, titulo, estado")
    .is("materia_id", null)
    .order("created_at", { ascending: true });

  if (error || !data) return [];
  return data as TopicoAvulso[];
}

export interface MateriaComTopicos {
  id: string;
  nome: string;
  topicos: { id: string; titulo: string; estado: EstadoTopico }[];
}

export interface PlanoDetalhe {
  id: string;
  nome: string;
  status: StatusPlano;
  prazo: string | null;
  materias: MateriaComTopicos[];
}

interface MateriaDetalheRow {
  id: string;
  nome: string;
  created_at: string;
  topicos: { id: string; titulo: string; estado: EstadoTopico; created_at: string }[] | null;
}
interface PlanoDetalheRow {
  id: string;
  nome: string;
  status: StatusPlano;
  prazo: string | null;
  materias: MateriaDetalheRow[] | null;
}

export async function getPlanoDetalhe(id: string): Promise<PlanoDetalhe | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("planos")
    .select(
      "id, nome, status, prazo, materias(id, nome, created_at, topicos(id, titulo, estado, created_at))",
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;

  const row = data as PlanoDetalheRow;
  const materias = (row.materias ?? [])
    .slice()
    .sort((a, b) => a.created_at.localeCompare(b.created_at))
    .map((m) => ({
      id: m.id,
      nome: m.nome,
      topicos: (m.topicos ?? [])
        .slice()
        .sort((a, b) => a.created_at.localeCompare(b.created_at))
        .map((t) => ({ id: t.id, titulo: t.titulo, estado: t.estado })),
    }));

  return { id: row.id, nome: row.nome, status: row.status, prazo: row.prazo, materias };
}
