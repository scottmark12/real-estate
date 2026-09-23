"use client";

import { useFormStatus } from "react-dom";

// Every form in the admin submits with no visual feedback while the
// server action runs — nothing disables, nothing indicates "working."
// This reads the enclosing <form>'s pending state (useFormStatus only
// works in a child of the <form>, hence a separate component) and dims
// + disables + swaps its label until the action resolves.
export function SubmitButton({
  className,
  style,
  pendingLabel,
  name,
  value,
  children,
}: {
  className?: string;
  style?: React.CSSProperties;
  pendingLabel?: React.ReactNode;
  name?: string;
  value?: string;
  children: React.ReactNode;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      name={name}
      value={value}
      disabled={pending}
      style={style}
      className={`${className ?? ""} ${pending ? "cursor-not-allowed opacity-50" : ""}`}
    >
      {pending ? (pendingLabel ?? children) : children}
    </button>
  );
}
