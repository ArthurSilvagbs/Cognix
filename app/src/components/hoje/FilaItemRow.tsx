import type { ItemHoje } from "@/domain/types";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Icon } from "../ui/Icon";

type Props = {
  item: ItemHoje;
  /** Número da sequência já calculado ("✓" se feito). */
  displayNum: string;
  onFocar: () => void;
  onRevisar: () => void;
  onAdiar: () => void;
};

/** Uma linha da fila de hoje. As ações da direita dependem do tipo
 * (estudo vs revisão) e do estado (em foco / feito). */
export function FilaItemRow({
  item,
  displayNum,
  onFocar,
  onRevisar,
  onAdiar,
}: Props) {
  const cls = [
    "fila-item",
    "fade-in",
    item.emFoco && !item.feito && "atual",
    item.feito && "done",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cls}>
      <span className="num">{displayNum}</span>
      <div className="grow">
        <div className="title-md">{item.titulo}</div>
        <div className="meta-dim">
          <Icon
            name={item.tipo === "estudo" ? "book" : "redo"}
            className="icon tipo-ico"
          />
          {item.meta}
        </div>
      </div>
      {renderAcoes()}
    </div>
  );

  function renderAcoes() {
    if (item.feito) {
      return (
        <span className="meta-dim">
          ✓ {item.tipo === "estudo" ? "feito" : "revisada"}
        </span>
      );
    }
    if (item.tipo === "estudo") {
      return (
        <span className="actions lado">
          {item.emFoco ? (
            <Badge variant="soft">em foco</Badge>
          ) : (
            <Button variant="ghost" size="sm" onClick={onFocar}>
              Focar
            </Button>
          )}
        </span>
      );
    }
    return (
      <div className="actions">
        <Button size="sm" onClick={onRevisar}>
          Revisar
        </Button>
        <Button variant="ghost" size="sm" onClick={onAdiar}>
          Adiar
        </Button>
      </div>
    );
  }
}
