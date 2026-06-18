import { Button } from "../ui/Button";

/** Estado vazio da T1. Dois sabores:
 * - cold-start (sem planos): convida a criar o primeiro plano;
 * - dia-vazio (tem planos, nada vence hoje): apenas informa, sem pressão. */
export function EmptyHoje({ temPlanos }: { temPlanos: boolean }) {
  return (
    <div className="empty fade-in">
      <div className="title-xl" style={{ marginBottom: "var(--s2)" }}>
        {temPlanos ? "Nada por hoje." : "Comece criando um plano."}
      </div>
      <div className="meta" style={{ marginBottom: "var(--s5)" }}>
        {temPlanos
          ? "Sem estudos agendados e sem revisões vencendo hoje."
          : "O Cognix monta sua fila de estudos a partir do que você cadastra. Crie um plano (com IA ou na mão) ou um tópico avulso para começar."}
      </div>
      <div
        style={{
          display: "flex",
          gap: "var(--s3)",
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <Button variant="primary">Criar um plano</Button>
        <Button>Tópico avulso</Button>
      </div>
    </div>
  );
}
