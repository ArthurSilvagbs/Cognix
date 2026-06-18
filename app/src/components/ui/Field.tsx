import type { CSSProperties, ReactNode } from "react";

type Props = {
  label: ReactNode;
  /** Texto auxiliar em peso normal ao lado do label, ex. "(opcional)". */
  hint?: ReactNode;
  htmlFor?: string;
  style?: CSSProperties;
  children: ReactNode;
};

/** Wrapper de campo de formulário (label + controle). O controle (input/
 * textarea) é estilizado globalmente pelo design system. */
export function Field({ label, hint, htmlFor, style, children }: Props) {
  return (
    <div className="field" style={style}>
      <label htmlFor={htmlFor}>
        {label}
        {hint && (
          <span style={{ fontWeight: 400, textTransform: "none" }}> {hint}</span>
        )}
      </label>
      {children}
    </div>
  );
}
