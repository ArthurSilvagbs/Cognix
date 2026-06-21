import type { ReactNode } from "react";

// Sistema de ícones do Cognix — portado dos <symbol> do protótipo.
// Cada ícone é desenhado em viewBox 0 0 24 24; o traço/preenchimento vem
// da classe .icon do design system (stroke currentColor). O "play" é o único
// preenchido, então traz fill/stroke próprios.

export type IconName =
  | "hoje"
  | "cal"
  | "planos"
  | "prog"
  | "config"
  | "play"
  | "pause"
  | "check"
  | "redo"
  | "clock"
  | "plus"
  | "book"
  | "chev"
  | "warn"
  | "grad"
  | "eye"
  | "eye-off"
  | "doc"
  | "hand";

const PATHS: Record<IconName, ReactNode> = {
  hoje: (
    <>
      <path d="M3 18h18" />
      <path d="M7.5 18a4.5 4.5 0 0 1 9 0" />
      <path d="M12 4v3M5.2 8.6l1.5 1.5M18.8 8.6l-1.5 1.5M2.5 13H5M19 13h2.5" />
    </>
  ),
  cal: (
    <>
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M4 9.5h16M8 3v4M16 3v4" />
    </>
  ),
  planos: (
    <>
      <path d="M12 3 3 7.5l9 4.5 9-4.5L12 3z" />
      <path d="M3 12l9 4.5L21 12" />
      <path d="M3 16.5 12 21l9-4.5" />
    </>
  ),
  prog: <path d="M5 19V10M12 19V5M19 19v-6" />,
  config: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </>
  ),
  play: <path d="M8 6.5v11l9-5.5z" fill="currentColor" stroke="none" />,
  pause: <path d="M9 6.5v11M15 6.5v11" strokeWidth={2.5} />,
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  redo: (
    <>
      <path d="M4 11a8 8 0 0 1 14-4.5L20 9M20 4v5h-5" />
      <path d="M20 13a8 8 0 0 1-14 4.5L4 15M4 20v-5h5" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" strokeWidth={2.25} />,
  book: (
    <>
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15.5H6.5A2.5 2.5 0 0 0 4 21z" />
      <path d="M4 18.5A2.5 2.5 0 0 1 6.5 16H20" />
    </>
  ),
  chev: <path d="M6 9.5l6 6 6-6" />,
  warn: (
    <>
      <path d="M12 4 2.8 19.5h18.4z" />
      <path d="M12 10v4M12 16.8v.2" />
    </>
  ),
  grad: (
    <>
      <path d="M22 10 12 5 2 10l10 5 10-5z" />
      <path d="M6 12v4.5c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5V12" />
      <path d="M22 10v5" />
    </>
  ),
  eye: (
    <>
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  "eye-off": (
    <>
      <path d="M3 3l18 18" />
      <path d="M10.6 10.6a3 3 0 0 0 4.24 4.24" />
      <path d="M9.4 5.2A10.6 10.6 0 0 1 12 5c6.4 0 10 7 10 7a18.4 18.4 0 0 1-3.9 4.9" />
      <path d="M6.2 6.2A18.3 18.3 0 0 0 2 12s3.6 7 10 7a10.6 10.6 0 0 0 3.4-.56" />
    </>
  ),
  doc: (
    <>
      <path d="M6 3h9l4 4v14H6z" />
      <path d="M15 3v4h4M9 12h6M9 16h6" />
    </>
  ),
  hand: (
    <path d="M14 4.5a1.5 1.5 0 0 1 3 0V12m0-5.5a1.5 1.5 0 0 1 3 0V14a7 7 0 0 1-7 7h-1a7 7 0 0 1-6-3.4L4 13.5a1.6 1.6 0 0 1 2.7-1.6L8 13V6a1.5 1.5 0 0 1 3 0m0 0v5m3-6.5V11" />
  ),
};

export function Icon({
  name,
  className = "icon",
}: {
  name: IconName;
  className?: string;
}) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      {PATHS[name]}
    </svg>
  );
}
