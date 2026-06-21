"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// Server Actions de Planos. user_id é preenchido pelo default `auth.uid()` da
// coluna (ver migration) e a RLS confere `auth.uid() = user_id` — por isso não
// passamos user_id aqui.

// T6 "Montar na mão": nasce um plano vazio em rascunho e cai na tela do plano
// (T4), onde o usuário renomeia e monta matérias/tópicos. Espelha o fluxo do
// protótipo (não existe editor paralelo).
export async function criarPlanoManual() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("planos")
    .insert({ nome: "Novo plano", status: "rascunho" })
    .select("id")
    .single();

  if (error || !data) return;
  redirect(`/planos/${data.id}`);
}

export async function renomearPlano(formData: FormData) {
  const planoId = String(formData.get("planoId") ?? "");
  const nome = String(formData.get("nome") ?? "").trim();
  if (!planoId || !nome) return;

  const supabase = await createSupabaseServerClient();
  await supabase.from("planos").update({ nome }).eq("id", planoId);
  revalidatePath(`/planos/${planoId}`);
  revalidatePath("/planos");
}

export async function ativarPlano(formData: FormData) {
  const planoId = String(formData.get("planoId") ?? "");
  if (!planoId) return;

  const supabase = await createSupabaseServerClient();
  await supabase.from("planos").update({ status: "ativo" }).eq("id", planoId);
  revalidatePath("/planos");
  revalidatePath(`/planos/${planoId}`);
}

export async function excluirPlano(formData: FormData) {
  const planoId = String(formData.get("planoId") ?? "");
  if (!planoId) return;

  const supabase = await createSupabaseServerClient();
  await supabase.from("planos").delete().eq("id", planoId);
  revalidatePath("/planos");
}

export async function criarMateria(formData: FormData) {
  const planoId = String(formData.get("planoId") ?? "");
  const nome = String(formData.get("nome") ?? "").trim();
  if (!planoId || !nome) return;

  const supabase = await createSupabaseServerClient();
  await supabase.from("materias").insert({ plano_id: planoId, nome });
  revalidatePath(`/planos/${planoId}`);
}

export async function criarTopico(formData: FormData) {
  const planoId = String(formData.get("planoId") ?? "");
  const materiaId = String(formData.get("materiaId") ?? "");
  const titulo = String(formData.get("titulo") ?? "").trim();
  if (!materiaId || !titulo) return;

  const supabase = await createSupabaseServerClient();
  await supabase.from("topicos").insert({ materia_id: materiaId, titulo });
  revalidatePath(`/planos/${planoId}`);
}

export async function criarAvulso(formData: FormData) {
  const titulo = String(formData.get("titulo") ?? "").trim();
  if (!titulo) return;

  const supabase = await createSupabaseServerClient();
  await supabase.from("topicos").insert({ titulo }); // materia_id null = avulso
  revalidatePath("/planos");
}
