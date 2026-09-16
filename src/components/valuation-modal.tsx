"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";

const TIMELINE_OPTIONS = ["Just curious", "0–3 months", "3–6 months", "6+ months"];

export default function ValuationModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [step, setStep] = useState<"address" | "details" | "done">("address");
  const [address, setAddress] = useState("");
  const [timeline, setTimeline] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");
  const [mounted, setMounted] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const addressRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    triggerRef.current = document.activeElement as HTMLElement;
    setStep("address");
    setAddress("");
    setTimeline(null);
    setStatus("idle");
    setMessage("");
    const focusTimer = setTimeout(() => addressRef.current?.focus(), 10);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open || step !== "details") return;
    const focusTimer = setTimeout(() => nameRef.current?.focus(), 10);
    return () => clearTimeout(focusTimer);
  }, [open, step]);

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
    requestAnimationFrame(() => triggerRef.current?.focus());
  }

  function handleAddressSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!address.trim()) return;
    setStep("details");
  }

  async function handleDetailsSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    setStatus("loading");
    try {
      const res = await fetch("/api/valuation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address,
          name: data.name,
          email: data.email,
          phone: data.phone,
          timeline,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Something went wrong");
      setStep("done");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  if (!mounted || !open) return null;

  const addressLine = address.trim();

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
        aria-labelledby="valuation-modal-heading"
        className="fixed inset-6 flex flex-col overflow-y-auto bg-cream p-8 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:h-auto sm:max-h-[85vh] sm:w-[600px] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:p-14"
      >
        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className="absolute right-5 top-5 text-2xl leading-none text-navy/40 transition-colors hover:text-navy sm:right-7 sm:top-7"
        >
          &times;
        </button>

        {step === "done" ? (
          <div className="flex flex-col justify-center">
            <p className="eyebrow text-gold">Home Valuation</p>
            <h2
              id="valuation-modal-heading"
              className="mt-4 font-display text-[32px] font-normal leading-[1.05] text-navy sm:text-[38px]"
            >
              Thanks — got it.
            </h2>
            <p className="mt-4 max-w-sm text-navy/70">
              I&apos;ll take a look at {addressLine || "the property"}, review
              recent comparable sales, and be in touch.
            </p>
            <button
              type="button"
              onClick={close}
              className="eyebrow mt-8 w-fit text-navy underline decoration-gold decoration-2 underline-offset-4"
            >
              Back to the Site &rarr;
            </button>
          </div>
        ) : step === "address" ? (
          <div className="flex flex-col justify-center">
            <p className="eyebrow text-gold">Home Valuation</p>
            <h2
              id="valuation-modal-heading"
              className="mt-4 font-display text-[32px] font-normal leading-[1.05] text-navy sm:text-[38px]"
            >
              Let&apos;s start with the property.
            </h2>
            <form onSubmit={handleAddressSubmit} className="mt-10">
              <label htmlFor="valuation-address" className="eyebrow text-navy/50">
                Property Address
              </label>
              <div className="mt-2 flex items-end gap-4 border-b border-navy/30 pb-2">
                <input
                  ref={addressRef}
                  id="valuation-address"
                  name="address"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Main St, San Diego, CA"
                  className="w-full flex-1 bg-transparent text-navy placeholder:text-navy/35 focus:outline-none"
                />
                <button
                  type="submit"
                  className="eyebrow shrink-0 whitespace-nowrap text-navy transition-colors hover:text-navy/60"
                >
                  Continue &rarr;
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="flex flex-col justify-center">
            <p className="eyebrow text-navy/40">{addressLine.toUpperCase()}</p>
            <h2
              id="valuation-modal-heading"
              className="mt-2 font-display text-[28px] font-normal leading-[1.1] text-navy sm:text-[34px]"
            >
              Where should I send it?
            </h2>
            <p className="mt-3 max-w-sm text-sm text-navy/60">
              I&apos;ll review the property and recent comparable sales and
              send you a personalized opinion of value.
            </p>

            <form onSubmit={handleDetailsSubmit} className="mt-8 flex flex-col gap-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <label className="block">
                  <span className="eyebrow text-navy/50">Name</span>
                  <input
                    ref={nameRef}
                    name="name"
                    required
                    placeholder="Full name"
                    className="mt-2 w-full border-0 border-b border-navy/25 bg-transparent px-0 py-2 text-navy placeholder:text-navy/35 focus:border-navy focus:outline-none"
                  />
                </label>
                <label className="block">
                  <span className="eyebrow text-navy/50">Email</span>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="you@domain.com"
                    className="mt-2 w-full border-0 border-b border-navy/25 bg-transparent px-0 py-2 text-navy placeholder:text-navy/35 focus:border-navy focus:outline-none"
                  />
                </label>
              </div>
              <label className="block">
                <span className="eyebrow text-navy/50">
                  Phone <span className="normal-case">(optional)</span>
                </span>
                <input
                  name="phone"
                  placeholder="(619) 555-0100"
                  className="mt-2 w-full border-0 border-b border-navy/25 bg-transparent px-0 py-2 text-navy placeholder:text-navy/35 focus:border-navy focus:outline-none"
                />
              </label>

              <div>
                <span className="eyebrow text-navy/50">Your Timeline</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {TIMELINE_OPTIONS.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setTimeline(option)}
                      className={`border px-4 py-2 text-xs transition-colors ${
                        timeline === option
                          ? "border-blue text-blue"
                          : "border-navy/20 text-navy/60 hover:border-navy/40"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="border border-blue bg-blue px-7 py-3.5 text-sm font-semibold text-cream transition-colors hover:bg-blue-dark disabled:opacity-60"
                >
                  {status === "loading" ? "Sending…" : "Request My Valuation →"}
                </button>
              </div>
              {status === "error" && (
                <p className="text-sm text-red-700">{message}</p>
              )}
            </form>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
