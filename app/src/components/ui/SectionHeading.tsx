import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** Contador opcional ao lado do título, ex. "0 de 3". */
  count?: ReactNode;
};

export function SectionHeading({ children, count }: Props) {
  return (
    <h2 className="section">
      {children}
      {count != null && <span className="count tnum">{count}</span>}
    </h2>
  );
}
