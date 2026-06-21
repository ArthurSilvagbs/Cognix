"use client";

import { useRouter } from "next/navigation";
import type { MouseEvent } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type { PlanoResumo } from "@/lib/data/planos";
import { ativarPlano } from "./actions";

// Card de plano da T3. O card inteiro navega pra T4 (como no protótipo:
// onclick → tela do plano); o botão "Ativar" do rascunho não propaga o clique.
export function PlanoCard({ plano }: { plano: PlanoResumo }) {
  const router = useRouter();
  const rascunho = plano.status === "rascunho";

  function abrir() {
    router.push(`/planos/${plano.id}`);
  }
  function stop(e: MouseEvent) {
    e.stopPropagation();
  }

  return (
    <div
      className={rascunho ? "plan-card rascunho" : "plan-card"}
      onClick={abrir}
      role="link"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && abrir()}
    >
      <div className="plan-card-head">
        <div className="name">{plano.nome}</div>
      </div>

      <div className="plan-card-badges">
        {rascunho ? (
          <Badge className="draft">Rascunho</Badge>
        ) : (
          <Badge variant="soft">Ativo</Badge>
        )}
        {plano.prazo && (
          <span className="chip">
            <Icon name="cal" className="icon sm" /> Prazo: {fmtPrazo(plano.prazo)}
          </span>
        )}
      </div>

      <div className="plan-progress">
        <div className="pct-row">
          <span className="pct-val">{plano.totalTopicos === 0 ? "—" : `${plano.pct}%`}</span>
          <span className="pct-lbl">{rascunho && plano.totalTopicos === 0 ? "não iniciado" : "concluído"}</span>
        </div>
        <div className="progress-bar">
          <div className="fill" style={{ width: `${plano.pct}%` }} />
        </div>
      </div>

      <div className="plan-kpis">
        <div className="kpi">
          <span className="n">{plano.totalMaterias}</span>
          <span className="l">matérias</span>
        </div>
        <div className="kpi">
          <span className="n">{plano.totalTopicos}</span>
          <span className="l">tópicos</span>
        </div>
        <div className="kpi">
          <span className="n">{plano.dominados}</span>
          <span className="l">dominados</span>
        </div>
      </div>

      {rascunho && (
        <div className="plan-card-foot">
          <span className="meta-dim">Ative para começar a estudar</span>
          <div className="grow" />
          <form action={ativarPlano} onClick={stop}>
            <input type="hidden" name="planoId" value={plano.id} />
            <Button size="sm" variant="primary" type="submit">
              Ativar
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}

function fmtPrazo(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${iso}T00:00:00`));
}
