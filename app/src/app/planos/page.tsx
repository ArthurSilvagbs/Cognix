import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { listarAvulsos, listarPlanos } from "@/lib/data/planos";
import { criarAvulso } from "./actions";
import { PlanoCard } from "./PlanoCard";
import "./planos.css";

// T3 — Planos (índice). Header + "Novo plano" (→ T6), seções Ativos / Rascunhos
// / Tópicos avulsos. Vazio = onboarding com os 2 caminhos de criação (→ T6).
export default async function PlanosPage() {
  const [planos, avulsos] = await Promise.all([listarPlanos(), listarAvulsos()]);

  const ativos = planos.filter((p) => p.status === "ativo");
  const rascunhos = planos.filter((p) => p.status === "rascunho");
  const vazio = planos.length === 0 && avulsos.length === 0;

  if (vazio) {
    return (
      <AppShell active="planos">
        <div className="page-head">
          <p className="page-kicker">Cognix v2</p>
          <h1>Planos</h1>
        </div>
        <div className="empty">
          <p className="title-md" style={{ marginBottom: "var(--s2)" }}>
            Nenhum plano ainda
          </p>
          <p className="meta" style={{ maxWidth: 340, margin: "0 auto var(--s5)" }}>
            Crie seu primeiro plano de estudos e o Cognix decide o que estudar todos os dias.
          </p>
          <div className="ob-cards">
            <Link href="/planos/novo" className="ob-card">
              <div className="ob-ico">
                <Icon name="grad" className="icon" />
              </div>
              <div className="ob-title">Criar com IA</div>
              <div className="ob-desc">
                Cole um edital, lista ou objetivo. A IA monta a estrutura e distribui os estudos.
              </div>
            </Link>
            <Link href="/planos/novo" className="ob-card">
              <div className="ob-ico">
                <Icon name="plus" className="icon" />
              </div>
              <div className="ob-title">Montar na mão</div>
              <div className="ob-desc">Adicione matérias e tópicos do zero, no seu ritmo.</div>
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  const resumo = [
    `${ativos.length} ${ativos.length === 1 ? "plano ativo" : "planos ativos"}`,
    `${rascunhos.length} ${rascunhos.length === 1 ? "rascunho" : "rascunhos"}`,
    `${avulsos.length} ${avulsos.length === 1 ? "avulso" : "avulsos"}`,
  ].join(" · ");

  return (
    <AppShell active="planos">
      <div className="page-head">
        <div className="planos-head-row">
          <div>
            <p className="page-kicker">Cognix v2</p>
            <h1>Planos</h1>
            <p className="day-summary">{resumo}</p>
          </div>
          <Link href="/planos/novo">
            <Button variant="primary" icon="plus">
              Novo plano
            </Button>
          </Link>
        </div>
      </div>

      {ativos.length > 0 && (
        <>
          <SectionHeading count={String(ativos.length)}>Ativos</SectionHeading>
          <div className="plans-grid">
            {ativos.map((p) => (
              <PlanoCard key={p.id} plano={p} />
            ))}
          </div>
        </>
      )}

      {rascunhos.length > 0 && (
        <>
          <SectionHeading count={String(rascunhos.length)}>Rascunhos</SectionHeading>
          <div className="plans-grid">
            {rascunhos.map((p) => (
              <PlanoCard key={p.id} plano={p} />
            ))}
          </div>
        </>
      )}

      <SectionHeading count={String(avulsos.length)}>Tópicos avulsos</SectionHeading>
      <Card>
        {avulsos.length > 0 && (
          <div className="avulso-list" style={{ marginBottom: "var(--s3)" }}>
            {avulsos.map((t) => (
              <div className="avulso-item" key={t.id}>
                <div className="grow">
                  <div className="t">{t.titulo}</div>
                  <div className="m2">Avulso · {rotuloEstado(t.estado)}</div>
                </div>
                <Badge variant="neutral">{rotuloEstado(t.estado)}</Badge>
              </div>
            ))}
          </div>
        )}
        <form action={criarAvulso} className="row-form">
          <Field label="Novo tópico avulso" htmlFor="avulso" style={{ flex: 1 }}>
            <input id="avulso" name="titulo" placeholder="Ex.: SQL window functions" required />
          </Field>
          <Button type="submit" icon="plus">
            Adicionar
          </Button>
        </form>
      </Card>
    </AppShell>
  );
}

export function rotuloEstado(estado: string) {
  switch (estado) {
    case "em-estudo":
      return "em estudo";
    case "em-revisao":
      return "em revisão";
    case "dominado":
      return "dominado";
    default:
      return "a estudar";
  }
}
