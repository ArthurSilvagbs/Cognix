import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "./ui/Icon";
import { DESTINOS, CONFIG_DESTINO, type NavKey } from "./nav";
import type { FocoSidebar } from "@/domain/types";
import { SignOutButton } from "./SignOutButton";

/** Link interno usa next/link; placeholder ("#") de tela ainda não construída
 * usa <a> simples. */
function AppLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: ReactNode;
}) {
  if (href.startsWith("/")) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} className={className}>
      {children}
    </a>
  );
}

function NavItem({
  href,
  icon,
  label,
  active,
}: {
  href: string;
  icon: Parameters<typeof Icon>[0]["name"];
  label: string;
  active: boolean;
}) {
  return (
    <AppLink className={active ? "nav-item active" : "nav-item"} href={href}>
      <Icon name={icon} /> {label}
    </AppLink>
  );
}

/** Sidebar do desktop: logo, Novo, 4 destinos, foco de hoje e Config.
 * Read-only quanto a estado — item ativo e foco vêm por prop. O card de foco
 * só aparece quando há foco (não mente em tela vazia). */
export function Sidebar({ active, foco }: { active: NavKey; foco?: FocoSidebar }) {
  return (
    <aside className="sidebar">
      <div className="logo">
        <span className="mark">C</span> Cognix <span className="v">v2</span>
      </div>

      <Link className="btn-novo" href="/planos/novo">
        <Icon name="plus" className="icon sm" /> Novo
      </Link>

      {DESTINOS.map((d) => (
        <NavItem
          key={d.key}
          href={d.href}
          icon={d.icon}
          label={d.label}
          active={active === d.key}
        />
      ))}

      <div className="spacer" />

      {foco && (
        <Link className="side-foco" href="/">
          <span className="sf-kick">Foco de hoje</span>
          <div className="sf-next">
            <span className="sf-play">
              <Icon name="play" className="icon" />
            </span>
            <span className="sf-info">
              <span className="sf-t">{foco.titulo}</span>
              <span className="sf-c">{foco.contexto}</span>
            </span>
          </div>
          <div className="sf-bar">
            <i style={{ width: `${foco.progresso}%` }} />
          </div>
          <div className="sf-meta">{foco.legenda}</div>
        </Link>
      )}

      <NavItem
        href={CONFIG_DESTINO.href}
        icon={CONFIG_DESTINO.icon}
        label={CONFIG_DESTINO.label}
        active={active === "config"}
      />
      <SignOutButton />
    </aside>
  );
}
