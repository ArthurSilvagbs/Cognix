import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { BottomBar } from "./BottomBar";
import type { NavKey } from "./nav";
import type { FocoSidebar } from "@/domain/types";

/** Casca padrão de todas as telas: sidebar (desktop) + conteúdo + barra
 * inferior (mobile). O conteúdo já entra dentro de `.page` (largura máxima
 * centralizada). */
export function AppShell({
  active,
  foco,
  children,
}: {
  active: NavKey;
  foco?: FocoSidebar;
  children: ReactNode;
}) {
  return (
    <>
      <div className="app">
        <Sidebar active={active} foco={foco} />
        <main>
          <div className="page">{children}</div>
        </main>
      </div>
      <BottomBar active={active} />
    </>
  );
}
