"use client";

import { useFormStatus } from "react-dom";

// Wraps a delete `<form action={...}>`'s submit button so it asks before
// firing — every delete in the admin is a real Supabase delete with no
// undo, and none of them confirmed before this. Also dims/disables itself
// while the delete is in flight, same as SubmitButton.
export function DeleteButton({
  confirmMessage,
  className,
  children,
}: {
  confirmMessage: string;
  className?: string;
  children: React.ReactNode;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`${className ?? ""} ${pending ? "cursor-not-allowed opacity-50" : ""}`}
      onClick={(e) => {
        if (!confirm(confirmMessage)) e.preventDefault();
      }}
    >
      {pending ? "Deleting…" : children}
    </button>
  );
}
