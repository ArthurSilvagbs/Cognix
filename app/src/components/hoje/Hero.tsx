import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Chip } from "../ui/Chip";
import { Crumb } from "../ui/Crumb";
import { Field } from "../ui/Field";
import { Icon } from "../ui/Icon";
import type { FocoView } from "./mock";

export type HeroMode = "idle" | "timer" | "form" | "done" | "fim";

interface NextView {
  titulo: string;
  caminho: string;
  minutos: number;
}

export interface HeroProps {
  mode: HeroMode;
  foco: FocoView;
  next: NextView;
  doneNote: string;
  timerDisplay: string;
  pausado: boolean;
  duracao: number;
  anotacoes: string;
  onDuracao: (v: number) => void;
  onAnotacoes: (v: string) => void;
  fim: { sessoes: string; horas: string; revisoes: string };
  onIniciar: () => void;
  onRegistrarSemTimer: () => void;
  onPausar: () => void;
  onEncerrar: () => void;
  onCancelar: () => void;
  onConclui: () => void;
  onAindaEstudando: () => void;
  onIniciarProximo: () => void;
  onEncerrarDia: () => void;
  onMaisUma: () => void;
}

/** A "resposta dos 10 segundos": o que estudar agora, em foco. Uma máquina de
 * estados de 5 modos dentro de um card hero. */
export function Hero(props: HeroProps) {
  return (
    <Card variant="hero" aria-live="polite">
      {props.mode === "idle" && <Idle {...props} />}
      {props.mode === "timer" && <Timer {...props} />}
      {props.mode === "form" && <Form {...props} />}
      {props.mode === "done" && <Done {...props} />}
      {props.mode === "fim" && <Fim {...props} />}
    </Card>
  );
}

function Idle({ foco, onIniciar, onRegistrarSemTimer }: HeroProps) {
  return (
    <div className="fade-in">
      <div className="hero-top">
        <Badge>Estude agora</Badge>
        <Chip className="tnum">
          <Icon name="clock" className="icon sm" /> ~{foco.minutos} min
        </Chip>
      </div>
      <div className="title-xl">{foco.titulo}</div>
      <Crumb path={foco.caminho} />
      <div className="hero-reason">{foco.reason}</div>
      <div className="hero-actions">
        <Button variant="primary" icon="play" onClick={onIniciar}>
          Iniciar
        </Button>
        <Button variant="ghost" onClick={onRegistrarSemTimer}>
          Registrar sem timer
        </Button>
      </div>
    </div>
  );
}

function Timer({
  foco,
  timerDisplay,
  pausado,
  onPausar,
  onEncerrar,
  onCancelar,
}: HeroProps) {
  return (
    <div className="fade-in">
      <div className="timer-wrap">
        <div className={pausado ? "timer-state paused" : "timer-state"}>
          {pausado ? "Pausado" : "Estudando"}
        </div>
        <div className={pausado ? "timer-display tnum paused" : "timer-display tnum"}>
          {timerDisplay}
        </div>
        <div className="meta" style={{ marginTop: "var(--s2)" }}>
          {foco.titulo}
        </div>
      </div>
      <div className="hero-actions" style={{ justifyContent: "center" }}>
        <Button icon="pause" onClick={onPausar}>
          {pausado ? "Retomar" : "Pausar"}
        </Button>
        <Button variant="primary" onClick={onEncerrar}>
          Encerrar sessão
        </Button>
        <Button variant="ghost" onClick={onCancelar}>
          Descartar
        </Button>
      </div>
    </div>
  );
}

function Form({
  foco,
  duracao,
  anotacoes,
  onDuracao,
  onAnotacoes,
  onConclui,
  onAindaEstudando,
}: HeroProps) {
  return (
    <div className="session-form fade-in">
      <div className="hero-top">
        <Badge variant="soft">Registrar sessão</Badge>
      </div>
      <div className="title-md">{foco.titulo}</div>

      <Field label="Duração (min)" htmlFor="duracao" style={{ maxWidth: "160px" }}>
        <input
          type="number"
          id="duracao"
          min={1}
          value={duracao}
          onChange={(e) => onDuracao(Number(e.target.value))}
          className="tnum"
        />
      </Field>

      <Field label="Anotações" hint="(opcional)" htmlFor="anotacoes">
        <textarea
          id="anotacoes"
          rows={2}
          placeholder="O que valeu registrar?"
          value={anotacoes}
          onChange={(e) => onAnotacoes(e.target.value)}
        />
      </Field>

      <Field label="Concluiu este tópico?">
        <div className="actions">
          <Button variant="primary" icon="check" onClick={onConclui}>
            Concluí
          </Button>
          <Button onClick={onAindaEstudando}>Ainda estudando</Button>
        </div>
      </Field>
    </div>
  );
}

function Done({
  doneNote,
  next,
  onIniciarProximo,
  onEncerrarDia,
}: HeroProps) {
  return (
    <div className="fade-in">
      <div className="done-line">
        <Icon name="check" className="icon sm" />
        <span>{doneNote}</span>
      </div>
      <div className="hero-top" style={{ marginTop: "var(--s4)" }}>
        <Badge variant="soft">Próximo</Badge>
        <Chip className="tnum">
          <Icon name="clock" className="icon sm" /> ~{next.minutos} min
        </Chip>
      </div>
      <div className="title-xl">{next.titulo}</div>
      <Crumb path={next.caminho} />
      <div className="hero-actions">
        <Button variant="primary" icon="play" onClick={onIniciarProximo}>
          Iniciar
        </Button>
        <Button variant="ghost" onClick={onEncerrarDia}>
          Encerrar por hoje
        </Button>
      </div>
    </div>
  );
}

function Fim({ fim, onMaisUma }: HeroProps) {
  return (
    <div className="fade-in">
      <div className="hero-top">
        <Badge variant="soft">Por hoje é isso</Badge>
      </div>
      <div className="title-xl">Tudo feito. ✓</div>
      <div className="fim-resumo tnum">
        <div className="kpi">
          <div className="n">{fim.sessoes}</div>
          <div className="l">sessões</div>
        </div>
        <div className="kpi">
          <div className="n">{fim.horas}</div>
          <div className="l">estudadas</div>
        </div>
        <div className="kpi">
          <div className="n">{fim.revisoes}</div>
          <div className="l">revisões</div>
        </div>
      </div>
      <div className="hero-actions">
        <Button variant="ghost" onClick={onMaisUma}>
          Estudar mais uma (Porcentagem)
        </Button>
      </div>
    </div>
  );
}
