import type { ReactNode } from "react";

type Props = {
  /** Eyebrow acima do título, ex. a data. */
  kicker?: ReactNode;
  title: ReactNode;
  /** Resumo do dia abaixo do título. */
  summary?: ReactNode;
};

export function PageHead({ kicker, title, summary }: Props) {
  return (
    <div className="page-head">
      {kicker && <div className="page-kicker">{kicker}</div>}
      <h1>{title}</h1>
      {summary && <div className="day-summary">{summary}</div>}
    </div>
  );
}
