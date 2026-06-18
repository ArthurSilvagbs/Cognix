import { AppShell } from "@/components/AppShell";
import { Hoje } from "@/components/hoje/Hoje";
import { dadosCheio, dadosVazio } from "@/components/hoje/mock";

// Server Component: escolhe a origem dos dados e passa pra tela. Hoje vem do
// mock; quando o Supabase entrar, é aqui que a query do usuário logado será
// feita — a <Hoje> não muda. (No Next 16, searchParams é assíncrono.)
//
// PADRÃO = VAZIO: todo usuário começa sem nada cadastrado. O conjunto cheio
// é só um atalho de dev (`/?estado=cheio`) pra visualizar a tela populada
// enquanto não há backend nem login.
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>;
}) {
  const { estado } = await searchParams;
  const dados = estado === "cheio" ? dadosCheio : dadosVazio;

  return (
    <AppShell active="hoje" foco={dados.focoSidebar}>
      <Hoje dados={dados} />
    </AppShell>
  );
}
