"use client";

import { useEffect } from "react";

export interface ToastState {
  msg: string;
  /** Se presente, mostra o botão Desfazer (decisão A2). */
  undo?: () => void;
}

/** Toast invertido com Desfazer. Auto-some em 5s. Controlado pelo pai. */
export function Toast({
  toast,
  onClose,
}: {
  toast: ToastState | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [toast, onClose]);

  return (
    <div
      className={toast ? "toast show" : "toast"}
      role="status"
      aria-live="polite"
    >
      <span>{toast?.msg}</span>
      {toast?.undo && (
        <button
          onClick={() => {
            toast.undo?.();
            onClose();
          }}
        >
          Desfazer
        </button>
      )}
    </div>
  );
}
