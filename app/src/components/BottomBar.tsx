import Link from "next/link";
import { Icon } from "./ui/Icon";
import { DESTINOS, type NavKey } from "./nav";

/** Barra inferior do mobile (A4): 4 destinos + botão Novo central. */
export function BottomBar({ active }: { active: NavKey }) {
  return (
    <nav className="bottombar" aria-label="Navegação principal">
      <a href={DESTINOS[0].href} className={active === "hoje" ? "active" : undefined}>
        <Icon name="hoje" /> Hoje
      </a>
      <a
        href={DESTINOS[1].href}
        className={active === "calendario" ? "active" : undefined}
      >
        <Icon name="cal" /> Calendário
      </a>
      <div className="fab">
        <Link href="/planos/novo" aria-label="Novo">
          <Icon name="plus" />
        </Link>
      </div>
      <a
        href={DESTINOS[2].href}
        className={active === "planos" ? "active" : undefined}
      >
        <Icon name="planos" /> Planos
      </a>
      <a
        href={DESTINOS[3].href}
        className={active === "progresso" ? "active" : undefined}
      >
        <Icon name="prog" /> Progresso
      </a>
    </nav>
  );
}
