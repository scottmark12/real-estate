"use client";

import { useEffect, useRef } from "react";

const ALLOWED_TAGS = new Set(["B", "STRONG", "I", "EM", "A", "BR"]);

// Strips pasted/typed markup down to the handful of inline tags the site
// actually renders, so stored content can never carry scripts, styles, or
// event-handler attributes from a paste.
function sanitize(html: string): string {
  const container = document.createElement("div");
  container.innerHTML = html;

  function walk(node: Node) {
    Array.from(node.childNodes).forEach((child) => {
      if (child.nodeType === Node.ELEMENT_NODE) {
        const el = child as HTMLElement;
        walk(el);
        if (!ALLOWED_TAGS.has(el.tagName)) {
          while (el.firstChild) el.parentNode?.insertBefore(el.firstChild, el);
          el.remove();
        } else {
          const href = el.tagName === "A" ? el.getAttribute("href") : null;
          Array.from(el.attributes).forEach((attr) => el.removeAttribute(attr.name));
          if (el.tagName === "A" && href) {
            el.setAttribute("href", href);
            el.setAttribute("target", "_blank");
            el.setAttribute("rel", "noreferrer");
          }
        }
      } else if (child.nodeType !== Node.TEXT_NODE) {
        child.parentNode?.removeChild(child);
      }
    });
  }

  walk(container);
  return container.innerHTML;
}

export default function RichText({
  html,
  onChange,
  placeholder,
  className,
}: {
  html: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // Only hydrate the DOM once — re-setting innerHTML on every keystroke
  // would reset the caret position.
  useEffect(() => {
    if (ref.current) ref.current.innerHTML = html;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function commit() {
    if (!ref.current) return;
    onChange(sanitize(ref.current.innerHTML));
  }

  function exec(command: string, value?: string) {
    ref.current?.focus();
    document.execCommand(command, false, value);
    commit();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    const mod = e.metaKey || e.ctrlKey;
    if (mod && e.key.toLowerCase() === "b") {
      e.preventDefault();
      exec("bold");
    } else if (mod && e.key.toLowerCase() === "i") {
      e.preventDefault();
      exec("italic");
    } else if (mod && e.key.toLowerCase() === "k") {
      e.preventDefault();
      const url = window.prompt("Link URL");
      if (url) exec("createLink", url);
    } else if (e.key === "Enter") {
      e.preventDefault();
      document.execCommand("insertLineBreak");
      commit();
    }
  }

  const isEmpty = !html || html === "<br>";

  return (
    <div className="group/rt">
      <div className="mb-1 flex gap-3 text-[11px] text-navy/30 opacity-0 transition-opacity group-focus-within/rt:opacity-100">
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("bold")}
          className="font-bold hover:text-navy"
        >
          B
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("italic")}
          className="italic hover:text-navy"
        >
          I
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            const url = window.prompt("Link URL");
            if (url) exec("createLink", url);
          }}
          className="underline hover:text-navy"
        >
          Link
        </button>
      </div>
      <div className="relative">
        {isEmpty && placeholder && (
          <span className={`pointer-events-none absolute left-0 top-0 text-navy/30 ${className ?? ""}`}>
            {placeholder}
          </span>
        )}
        <div
          ref={ref}
          contentEditable
          suppressContentEditableWarning
          onInput={commit}
          onBlur={commit}
          onKeyDown={handleKeyDown}
          className={`min-h-[1.5em] outline-none ${className ?? ""}`}
        />
      </div>
    </div>
  );
}
