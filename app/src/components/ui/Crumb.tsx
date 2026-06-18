import { Fragment } from "react";

/** Caminho legível "Plano › Matéria", com o separador estilizado pelo DS. */
export function Crumb({
  path,
  className = "crumb",
}: {
  path: string;
  className?: string;
}) {
  const parts = path
    .split("›")
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div className={className}>
      {parts.map((p, i) => (
        <Fragment key={i}>
          {i > 0 && <span className="sep">›</span>}
          {p}
        </Fragment>
      ))}
    </div>
  );
}
