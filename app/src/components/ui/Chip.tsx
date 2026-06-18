import type { ReactNode } from "react";

type Props = {
  /** default = neutro; warn = atenção (âmbar); foco = em foco (primária). */
  variant?: "default" | "warn" | "foco";
  className?: string;
  children: ReactNode;
};

export function Chip({ variant = "default", className, children }: Props) {
  const cls = ["chip", variant !== "default" && variant, className]
    .filter(Boolean)
    .join(" ");
  return <span className={cls}>{children}</span>;
}
