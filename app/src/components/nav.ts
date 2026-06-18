import type { IconName } from "./ui/Icon";

// Os 4 destinos + Config (decisão A1). Telas ainda não construídas apontam
// para "#" — trocar pela rota real quando cada uma existir.
export type NavKey = "hoje" | "calendario" | "planos" | "progresso" | "config";

export interface NavDestino {
  key: NavKey;
  label: string;
  icon: IconName;
  href: string;
}

export const DESTINOS: NavDestino[] = [
  { key: "hoje", label: "Hoje", icon: "hoje", href: "/" },
  { key: "calendario", label: "Calendário", icon: "cal", href: "#" },
  { key: "planos", label: "Planos", icon: "planos", href: "#" },
  { key: "progresso", label: "Progresso", icon: "prog", href: "#" },
];

export const CONFIG_DESTINO: NavDestino = {
  key: "config",
  label: "Configurações",
  icon: "config",
  href: "#",
};
