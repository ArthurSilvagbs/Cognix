"use client";

import { useId, useState } from "react";
import React from "react";
import { Loader2, X } from "lucide-react";

// ── Field — floating label (state-based, no CSS dependency) ───────────────────
// Usage: <Field label="E-mail"><input className="input" type="email" /></Field>
// Usage: <Field label="Nota"><textarea className="input" /></Field>

type ChildProps = React.InputHTMLAttributes<HTMLInputElement> &
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & { value?: string; defaultValue?: string };

interface FieldProps {
  label: string;
  children: React.ReactElement<ChildProps>;
}

export function Field({ label, children }: FieldProps) {
  const id = useId();
  const [focused, setFocused] = useState(false);

  const props = children.props;
  const childId = props.id ?? id;
  const isTextarea = children.type === "textarea";
  const value = props.value ?? props.defaultValue ?? "";
  const floating = focused || (typeof value === "string" ? value.length > 0 : !!value);

  const cloned = React.cloneElement(children, {
    id: childId,
    placeholder: "",
    onFocus: (e: React.FocusEvent<HTMLInputElement & HTMLTextAreaElement>) => {
      setFocused(true);
      (props.onFocus as ((e: React.FocusEvent) => void) | undefined)?.(e);
    },
    onBlur: (e: React.FocusEvent<HTMLInputElement & HTMLTextAreaElement>) => {
      setFocused(false);
      (props.onBlur as ((e: React.FocusEvent) => void) | undefined)?.(e);
    },
    style: {
      ...props.style,
      paddingTop: isTextarea ? 22 : 20,
      paddingBottom: isTextarea ? 10 : 8,
      ...(isTextarea ? { minHeight: 92 } : { height: 56 }),
    } as React.CSSProperties,
  } as ChildProps);

  const labelTop = floating
    ? (isTextarea ? 9 : 9)
    : (isTextarea ? 16 : "50%");

  return (
    <div style={{ position: "relative" }}>
      {cloned}
      <label
        htmlFor={childId}
        style={{
          position: "absolute",
          left: 16,
          top: labelTop,
          transform: !floating && !isTextarea ? "translateY(-50%)" : "none",
          fontSize: floating ? 11 : 15,
          fontWeight: floating ? 600 : 400,
          color: focused ? "var(--primary)" : "var(--text-muted)",
          pointerEvents: "none",
          transition: "top 0.15s, font-size 0.15s, color 0.15s, transform 0.15s",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          maxWidth: "calc(100% - 32px)",
          letterSpacing: floating ? 0.3 : 0,
          lineHeight: 1,
        }}
      >
        {label}
      </label>
    </div>
  );
}

// ── SelectField — labeled dropdown ────────────────────────────────────────────
// Usage: <SelectField label="Grupo" value={v} onChange={fn}><option/></SelectField>

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
  disabled?: boolean;
}
export function SelectField({ label, value, onChange, children, disabled }: SelectFieldProps) {
  const id = useId();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label
        htmlFor={id}
        style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.6, textTransform: "uppercase", color: "var(--text-muted)" }}>
        {label}
      </label>
      <select
        id={id}
        className="select"
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}>
        {children}
      </select>
    </div>
  );
}

// ── Btn — button with variants ────────────────────────────────────────────────
// Usage: <Btn>Salvar</Btn>  <Btn variant="ghost">Cancelar</Btn>

interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "danger";
  loading?: boolean;
  fullWidth?: boolean;
}
export function Btn({ variant = "primary", loading, fullWidth, children, style, disabled, ...props }: BtnProps) {
  const cls = variant === "danger" ? "btn btn-ghost" : `btn btn-${variant}`;
  return (
    <button
      className={cls}
      style={{
        width: fullWidth ? "100%" : undefined,
        color: variant === "danger" ? "var(--color-danger-text)" : undefined,
        borderColor: variant === "danger" ? "var(--color-danger-bg)" : undefined,
        ...style,
      }}
      disabled={loading || disabled}
      {...props}>
      {loading
        ? <Loader2 style={{ width: 16, height: 16, animation: "spin 1s linear infinite" }} />
        : children}
    </button>
  );
}

// ── ModalHeader — title + optional subtitle + close button ────────────────────
// Usage: <ModalHeader title="Horários" subtitle="Defina os dias" onClose={fn} />

interface ModalHeaderProps {
  title: string;
  subtitle?: string;
  onClose: () => void;
}
export function ModalHeader({ title, subtitle, onClose }: ModalHeaderProps) {
  return (
    <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 600, letterSpacing: -0.3, color: "var(--text-primary)", lineHeight: 1.2 }}>
            {title}
          </h2>
          {subtitle && (
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 3 }}>{subtitle}</p>
          )}
        </div>
        <button
          onClick={onClose}
          style={{ width: 30, height: 30, borderRadius: 8, border: "none", background: "var(--surface-subtle)", cursor: "pointer", color: "var(--text-muted)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <X style={{ width: 15, height: 15 }} />
        </button>
      </div>
    </div>
  );
}

// ── ModalFooter — cancel + confirm row ───────────────────────────────────────
// Usage: <ModalFooter onCancel={fn} onConfirm={fn} confirmLabel="Salvar" />

interface ModalFooterProps {
  onCancel: () => void;
  onConfirm?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmDisabled?: boolean;
  confirmLoading?: boolean;
  confirmType?: "button" | "submit";
}
export function ModalFooter({
  onCancel, onConfirm, confirmLabel = "Salvar", cancelLabel = "Cancelar",
  confirmDisabled, confirmLoading, confirmType = "button",
}: ModalFooterProps) {
  return (
    <div style={{ display: "flex", gap: 10, padding: "16px 24px 20px", flexShrink: 0, borderTop: "1px solid var(--border)" }}>
      <Btn variant="ghost" type="button" onClick={onCancel} style={{ flex: 1 }}>{cancelLabel}</Btn>
      <Btn
        variant="primary"
        type={confirmType}
        onClick={onConfirm}
        disabled={confirmDisabled}
        loading={confirmLoading}
        style={{ flex: 1 }}>
        {confirmLabel}
      </Btn>
    </div>
  );
}

// ── FormBody — scrollable modal body with consistent padding ──────────────────
// Usage: <FormBody><Field .../><SelectField .../></FormBody>

interface FormBodyProps {
  children: React.ReactNode;
  gap?: number;
}
export function FormBody({ children, gap = 16 }: FormBodyProps) {
  return (
    <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap, overflowY: "auto", flex: 1 }}>
      {children}
    </div>
  );
}
