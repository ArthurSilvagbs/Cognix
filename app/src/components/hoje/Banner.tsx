import { Button } from "../ui/Button";
import { Chip } from "../ui/Chip";
import { Icon } from "../ui/Icon";
import type { Detalhe } from "@/domain/types";

type Props = {
  visible: boolean;
  titulo: string;
  detalhes: Detalhe[];
  aberto: boolean;
  estudarOntemVisible: boolean;
  onToggle: () => void;
  onReplanejar: () => void;
  onEstudarOntem: () => void;
};

/** Banner do caos (F3). Tom factual — nunca lista de culpa. Âmbar é o único
 * destaque (token de atenção). As escolhas aqui não mexem em datas; só
 * Replanejar move datas. */
export function Banner({
  visible,
  titulo,
  detalhes,
  aberto,
  estudarOntemVisible,
  onToggle,
  onReplanejar,
  onEstudarOntem,
}: Props) {
  if (!visible) return null;

  return (
    <div className="banner">
      <div className="banner-title">
        <Icon name="warn" className="icon warn-ico" />
        <div className="title-md">{titulo}</div>
      </div>
      <div className="meta-dim">
        Sem problema — dá pra reorganizar em um clique.
      </div>
      <div className="banner-actions">
        <Button variant="primary" size="sm" icon="redo" onClick={onReplanejar}>
          Replanejar
        </Button>
        {estudarOntemVisible && (
          <Button variant="ghost" size="sm" onClick={onEstudarOntem}>
            Estudar o de ontem
          </Button>
        )}
        <span className="grow" />
        <Button
          variant="ghost"
          size="sm"
          aria-expanded={aberto}
          onClick={onToggle}
        >
          Detalhes{" "}
          <Icon name="chev" className={aberto ? "icon sm chev aberto" : "icon sm chev"} />
        </Button>
      </div>
      {aberto && (
        <div className="banner-details fade-in">
          {detalhes.map((d) => (
            <div className="pend-item" key={d.id}>
              <Chip variant={d.status}>{d.chipText}</Chip>
              <span className="t">{d.titulo}</span>
              <span className="m">{d.meta}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
