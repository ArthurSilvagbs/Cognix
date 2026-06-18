import type { HTMLAttributes } from "react";

type Props = HTMLAttributes<HTMLDivElement> & {
  /** "hero" = card de destaque (sombra e borda mais fortes). */
  variant?: "default" | "hero";
};

export function Card({ variant = "default", className, children, ...rest }: Props) {
  const cls = ["card", variant === "hero" && "hero", className]
    .filter(Boolean)
    .join(" ");
  return (
    <div className={cls} {...rest}>
      {children}
    </div>
  );
}
