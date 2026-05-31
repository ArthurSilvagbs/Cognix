"use client";

import { useId } from "react";

interface FieldProps {
  label: string;
  children: React.ReactElement<{ id?: string; placeholder?: string }>;
}

export function Field({ label, children }: FieldProps) {
  const id = useId();
  const childId = children.props.id ?? id;

  const child = { ...children, props: { ...children.props, id: childId, placeholder: " " } } as React.ReactElement;

  return (
    <div className="field">
      {child}
      <label htmlFor={childId}>{label}</label>
    </div>
  );
}
