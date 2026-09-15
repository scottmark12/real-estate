"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";

export default function NewsletterModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle"
  );
  const [message, setMessage] = useState("");
  const [mounted, setMounted] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    triggerRef.current = document.activeElement as HTMLElement;
    setStatus("idle");
    setMessage("");
    const focusTimer = setTimeout(() => emailRef.current?.focus(), 10);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        close();
        return;
      }
      if (e.key === "Tab" && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll<HTMLElement>(
          "button, input, a[href]"
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function close() {
    onClose();
    // Defer to after React unmounts the portal — focusing synchronously
    // here races the browser's own "focused element removed" handling,
    // which moves focus to <body> right after this call would have run.
    requestAnimationFrame(() => triggerRef.current?.focus());
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = new FormData(e.currentTarget).get("email");
    setStatus("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Something went wrong");
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setMessage(
        err instanceof Error ? err.message : "Something went wrong"
      );
    }
  }

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100]">
      <div
        className="absolute inset-0 bg-navy/20"
        onClick={close}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="newsletter-modal-heading"
        className="fixed inset-6 flex flex-col bg-blue p-8 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:h-[480px] sm:w-[680px] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:p-14"
      >
        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className="absolute right-5 top-5 text-2xl leading-none text-cream/50 transition-colors hover:text-cream sm:right-7 sm:top-7"
        >
          &times;
        </button>

        {status === "done" ? (
          <div className="flex h-full flex-col justify-center">
            <h2
              id="newsletter-modal-heading"
              className="font-display text-[32px] font-normal leading-[1.05] text-cream sm:text-[38px]"
            >
              You&apos;re in.
            </h2>
            <p className="mt-4 max-w-sm text-cream/75">
              I&apos;ll send something when there&apos;s something worth
              sending.
            </p>
            <button
              type="button"
              onClick={close}
              className="eyebrow mt-8 w-fit text-cream underline decoration-cream/40 decoration-2 underline-offset-4 hover:decoration-cream"
            >
              Back to the Site &rarr;
            </button>
          </div>
        ) : (
          <div className="flex h-full flex-col justify-center">
            <p className="eyebrow text-cream/60">Notes From The Market</p>
            <h2
              id="newsletter-modal-heading"
              className="mt-4 font-display text-[32px] font-normal leading-[1.05] text-cream sm:text-[42px]"
            >
              Something worth opening.
            </h2>
            <p className="mt-4 max-w-sm text-cream/70">
              Occasional notes on real estate, development, architecture,
              and whatever else I&apos;m paying attention to.
            </p>

            <form onSubmit={handleSubmit} className="mt-10 sm:mt-14">
              <label
                htmlFor="newsletter-modal-email"
                className="eyebrow text-cream/50"
              >
                Your Email
              </label>
              <div className="mt-2 flex items-end gap-4 border-b border-cream/30 pb-2">
                <input
                  ref={emailRef}
                  id="newsletter-modal-email"
                  type="email"
                  name="email"
                  required
                  placeholder="name@email.com"
                  className="w-full flex-1 bg-transparent text-cream placeholder:text-cream/40 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="eyebrow shrink-0 whitespace-nowrap text-cream transition-colors hover:text-cream/70 disabled:opacity-60"
                >
                  {status === "loading" ? "Joining…" : "Join →"}
                </button>
              </div>
              {status === "error" ? (
                <p className="mt-3 text-xs text-cream/70">{message}</p>
              ) : (
                <p className="mt-3 text-xs text-cream/50">
                  No spam. Just good reads.
                </p>
              )}
            </form>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
