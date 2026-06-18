import type { ButtonHTMLAttributes } from "react";
import { Icon, type IconName } from "./Icon";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "default" | "ghost";
  size?: "md" | "sm";
  /** Ícone opcional à esquerda do texto. */
  icon?: IconName;
};

export function Button({
  variant = "default",
  size = "md",
  icon,
  className,
  children,
  ...rest
}: Props) {
  const cls = [
    "btn",
    variant === "primary" && "primary",
    variant === "ghost" && "ghost",
    size === "sm" && "sm",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={cls} {...rest}>
      {icon && <Icon name={icon} className="icon sm" />}
      {children}
    </button>
  );
}
