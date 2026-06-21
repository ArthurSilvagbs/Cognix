import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getPlanoDetalhe } from "@/lib/data/planos";
import { criarMateria, criarTopico, renomearPlano } from "../actions";
import { rotuloEstado } from "../page";
import "../planos.css";

// T4 (mínimo) — detalhe do plano: nome editável + árvore Matéria → Tópico com
// cadastro manual. (A árvore+kanban completos da T4 são um port futuro.)
// Em Next 16 params é assíncrono.
export default async function PlanoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const plano = await getPlanoDetalhe(id);
  if (!plano) notFound();

  const totalTopicos = plano.materias.reduce((s, m) => s + m.topicos.length, 0);
  const rascunho = plano.status === "rascunho";

  return (
    <AppShell active="planos">
      <Link href="/planos" className="back-link">
        ← Planos
      </Link>

      <div className="page-head">
        <div className="plan-card-badges" style={{ marginBottom: "var(--s2)" }}>
          {rascunho ? (
            <Badge className="draft">Rascunho</Badge>
          ) : (
            <Badge variant="soft">Ativo</Badge>
          )}
        </div>
        <form action={renomearPlano} className="row-form">
          <input type="hidden" name="planoId" value={plano.id} />
          <Field label="Nome do plano" htmlFor="nome" style={{ flex: 1 }}>
            <input id="nome" name="nome" defaultValue={plano.nome} required />
          </Field>
          <Button type="submit">Salvar nome</Button>
        </form>
        <p className="day-summary" style={{ marginTop: "var(--s3)" }}>
          {plano.materias.length} matérias · {totalTopicos} tópicos
        </p>
      </div>

      <Card>
        <form action={criarMateria} className="row-form">
          <input type="hidden" name="planoId" value={plano.id} />
          <Field label="Nova matéria" htmlFor="materia" style={{ flex: 1 }}>
            <input
              id="materia"
              name="nome"
              placeholder="Ex.: Matemática Financeira"
              required
            />
          </Field>
          <Button variant="primary" type="submit" icon="plus">
            Adicionar matéria
          </Button>
        </form>
      </Card>

      {plano.materias.length === 0 ? (
        <Card>
          <div className="meta-dim">
            Nenhuma matéria ainda. Adicione a primeira acima — depois você cria os
            tópicos dentro dela.
          </div>
        </Card>
      ) : (
        plano.materias.map((m) => (
          <section key={m.id}>
            <SectionHeading count={String(m.topicos.length)}>{m.nome}</SectionHeading>
            <Card>
              {m.topicos.map((t) => (
                <div className="item" key={t.id}>
                  <div className="title-md">{t.titulo}</div>
                  <Badge variant="neutral">{rotuloEstado(t.estado)}</Badge>
                </div>
              ))}
              <form
                action={criarTopico}
                className="row-form"
                style={{ paddingTop: "var(--s3)" }}
              >
                <input type="hidden" name="planoId" value={plano.id} />
                <input type="hidden" name="materiaId" value={m.id} />
                <Field label="Novo tópico" htmlFor={`topico-${m.id}`} style={{ flex: 1 }}>
                  <input
                    id={`topico-${m.id}`}
                    name="titulo"
                    placeholder="Ex.: Juros Compostos"
                    required
                  />
                </Field>
                <Button type="submit" icon="plus">
                  Adicionar
                </Button>
              </form>
            </Card>
          </section>
        ))
      )}
    </AppShell>
  );
}
