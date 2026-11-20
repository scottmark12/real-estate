"use client";

import { useFormStatus } from "react-dom";

function Heart({ on }: { on: boolean }) {
  const { pending } = useFormStatus();
  const filled = pending ? !on : on;
  return (
    <button
      type="submit"
      aria-label={on ? "Remove from featured" : "Feature this listing"}
      title={on ? "Featured. Click to remove" : "Feature on the site"}
      className={`text-xl leading-none transition-colors ${
        filled ? "text-red-500" : "text-navy/30 hover:text-red-400"
      } ${pending ? "opacity-60" : ""}`}
    >
      {filled ? "♥" : "♡"}
    </button>
  );
}

export default function HeartButton({
  id,
  on,
  action,
}: {
  id: string;
  on: boolean;
  action: (formData: FormData) => Promise<void>;
}) {
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <Heart on={on} />
    </form>
  );
}
