import { AppShell } from "@/components/AppShell";
import { Hoje } from "@/components/hoje/Hoje";
import { getDadosHoje } from "@/lib/data/hoje";

// Server Component: consulta os dados do usuário logado no Supabase e passa pra
// tela. A <Hoje> não sabe de onde vêm os dados — só renderiza a projeção.
//
// Usuário novo (sem planos) cai no cold-start "comece criando um plano"; isso
// agora é REAL, vindo do banco, não mais mock.
export default async function Page() {
  const dados = await getDadosHoje();

  return (
    <AppShell active="hoje" foco={dados.focoSidebar}>
      <Hoje dados={dados} />
    </AppShell>
  );
}
