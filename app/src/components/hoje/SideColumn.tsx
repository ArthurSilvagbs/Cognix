import type { ReactNode } from "react";
import { Icon } from "../ui/Icon";

// Coluna lateral da T1: contexto de relance, SÓ LEITURA.
// Regra do contrato: nenhuma ação de execução mora aqui — se crescer, vira
// dashboard e quebra "home = execução". Conteúdo estático (mock) por enquanto.

function Dia({
  dow,
  dnum,
  cls,
  children,
}: {
  dow: string;
  dnum: string;
  cls?: string;
  children: ReactNode;
}) {
  return (
    <div className={cls ? `day ${cls}` : "day"}>
      <div className="dow">{dow}</div>
      <div className="dnum">{dnum}</div>
      <div className="st">{children}</div>
    </div>
  );
}

export function SideColumn() {
  return (
    <aside className="side">
      <div className="card">
        <h3>
          Sua semana <a href="#">calendário →</a>
        </h3>
        <div className="week tnum">
          <Dia dow="seg" dnum="8">
            <Icon name="check" className="icon" />
          </Dia>
          <Dia dow="ter" dnum="9">
            <Icon name="check" className="icon" />
          </Dia>
          <Dia dow="qua" dnum="10">
            —
          </Dia>
          <Dia dow="qui" dnum="11" cls="today">
            ·····
          </Dia>
          <Dia dow="sex" dnum="12" cls="future">
            ···
          </Dia>
          <Dia dow="sáb" dnum="13" cls="future">
            ··
          </Dia>
          <Dia dow="dom" dnum="14" cls="future">
            {""}
          </Dia>
        </div>
        <div className="meta-dim week-caption">
          2 de 3 dias cumpridos · quarta foi replanejada, não perdida.
        </div>
      </div>

      <div className="card">
        <h3>
          Planos ativos <a href="#">todos →</a>
        </h3>

        <div className="side-stat">
          <span className="v">BB 2026</span>
          <span className="l tnum">47 de 138</span>
        </div>
        <div className="progress-bar">
          <div className="fill" style={{ width: "34%" }} />
        </div>
        <div className="meta-dim" style={{ marginBottom: "var(--s3)" }}>
          Prova 08/11 · em 150 dias
        </div>

        <div className="side-stat">
          <span className="v">Spring Boot</span>
          <span className="l tnum">12 de 40</span>
        </div>
        <div className="progress-bar">
          <div className="fill" style={{ width: "30%" }} />
        </div>
        <div className="meta-dim" style={{ marginBottom: "var(--s3)" }}>
          Sem prazo · no seu ritmo
        </div>

        <div style={{ borderTop: "1px solid var(--line)", paddingTop: "var(--s2)" }}>
          <div className="side-stat">
            <span className="l">Revisões em dia</span>
            <span className="v tnum">92%</span>
          </div>
          <div className="side-stat">
            <span className="l">Ritmo desta semana</span>
            <span className="v tnum">3h40 / 5h</span>
          </div>
        </div>
      </div>

      <div className="card">
        <h3>
          Avulsos <a href="#">todos →</a>
        </h3>
        <div className="side-stat">
          <span className="l">Docker básico</span>
          <span className="v">em estudo</span>
        </div>
        <div className="side-stat">
          <span className="l">SQL window functions</span>
          <span className="v">revisão sex</span>
        </div>
      </div>
    </aside>
  );
}
