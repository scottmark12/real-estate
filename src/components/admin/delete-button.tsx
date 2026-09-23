"use client";

// Wraps a delete `<form action={...}>`'s submit button so it asks before
// firing — every delete in the admin is a real Supabase delete with no
// undo, and none of them confirmed before this.
export function DeleteButton({
  confirmMessage,
  className,
  children,
}: {
  confirmMessage: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(e) => {
        if (!confirm(confirmMessage)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
