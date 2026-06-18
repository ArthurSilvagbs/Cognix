import type { ReactNode } from "react";

type Props = {
  /** default = primária sólida; soft = primária suave; neutral = cinza. */
  variant?: "default" | "soft" | "neutral";
  className?: string;
  children: ReactNode;
};

export function Badge({ variant = "default", className, children }: Props) {
  const cls = ["badge", variant !== "default" && variant, className]
    .filter(Boolean)
    .join(" ");
  return <span className={cls}>{children}</span>;
}
