"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { uploadSiteFile } from "@/lib/upload";
import type { ArticleBlock } from "@/lib/types";

function newId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

const BLOCK_TEMPLATES: {
  type: ArticleBlock["type"];
  label: string;
  hint: string;
  create: () => ArticleBlock;
}[] = [
  {
    type: "heading",
    label: "Heading",
    hint: "Section break",
    create: () => ({ id: newId(), type: "heading", text: "" }),
  },
  {
    type: "text",
    label: "Text",
    hint: "Paragraph (Markdown)",
    create: () => ({ id: newId(), type: "text", text: "" }),
  },
  {
    type: "image",
    label: "Full-Width Image",
    hint: "Single photo",
    create: () => ({ id: newId(), type: "image", url: "", caption: "", focal: "50% 50%" }),
  },
  {
    type: "image_text",
    label: "Image + Text",
    hint: "Side by side",
    create: () => ({ id: newId(), type: "image_text", url: "", side: "left", text: "" }),
  },
  {
    type: "two_column_text",
    label: "Two Columns",
    hint: "Text side by side",
    create: () => ({ id: newId(), type: "two_column_text", left: "", right: "" }),
  },
  {
    type: "quote",
    label: "Pull Quote",
    hint: "Large quoted line",
    create: () => ({ id: newId(), type: "quote", text: "", attribution: "" }),
  },
  {
    type: "stat",
    label: "Stat Highlight",
    hint: "Big number + label",
    create: () => ({ id: newId(), type: "stat", value: "", label: "" }),
  },
  {
    type: "gallery",
    label: "Gallery",
    hint: "Multiple photos",
    create: () => ({ id: newId(), type: "gallery", urls: [] }),
  },
  {
    type: "divider",
    label: "Divider",
    hint: "Thin rule",
    create: () => ({ id: newId(), type: "divider" }),
  },
];

const BLOCK_LABELS: Record<ArticleBlock["type"], string> = Object.fromEntries(
  BLOCK_TEMPLATES.map((t) => [t.type, t.label])
) as Record<ArticleBlock["type"], string>;

const fieldClass =
  "w-full resize-none border-0 border-b border-transparent bg-transparent px-0 py-1 text-navy placeholder:text-navy/30 focus:border-navy/20 focus:outline-none";

function AutoTextarea({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={1}
      className={`${fieldClass} overflow-hidden ${className ?? ""}`}
    />
  );
}

function EditableImage({
  url,
  onChange,
  aspectClass,
}: {
  url: string;
  onChange: (url: string) => void;
  aspectClass: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);
    try {
      onChange(await uploadSiteFile(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <label
        className={`group/img relative block w-full cursor-pointer overflow-hidden bg-sand ${aspectClass}`}
      >
        {url ? (
          <Image src={url} alt="" fill sizes="800px" className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-navy/40">
            Click to upload image
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-navy/0 text-xs font-medium text-cream opacity-0 transition group-hover/img:bg-navy/40 group-hover/img:opacity-100">
          {uploading ? "Uploading…" : url ? "Replace image" : "Upload image"}
        </div>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </label>
      <input
        type="url"
        value={url}
        onChange={(e) => onChange(e.target.value)}
        placeholder="or paste an image URL"
        className="mt-1 w-full border-0 bg-transparent text-[11px] text-navy/40 placeholder:text-navy/30 focus:outline-none"
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function BlockFields({
  block,
  onChange,
}: {
  block: ArticleBlock;
  onChange: (block: ArticleBlock) => void;
}) {
  switch (block.type) {
    case "heading":
      return (
        <input
          value={block.text}
          onChange={(e) => onChange({ ...block, text: e.target.value })}
          placeholder="Heading"
          className={`${fieldClass} font-display text-2xl font-semibold`}
        />
      );

    case "text":
      return (
        <AutoTextarea
          value={block.text}
          onChange={(text) => onChange({ ...block, text })}
          placeholder="Write here — Markdown supported (bold, italics, links)…"
          className="text-[15px] leading-relaxed text-navy/80"
        />
      );

    case "image":
      return (
        <div className="flex flex-col gap-2">
          <EditableImage
            url={block.url}
            onChange={(url) => onChange({ ...block, url })}
            aspectClass="aspect-[16/10]"
          />
          <input
            value={block.caption}
            onChange={(e) => onChange({ ...block, caption: e.target.value })}
            placeholder="Caption (optional)"
            className={`${fieldClass} text-xs italic`}
          />
        </div>
      );

    case "image_text":
      return (
        <div className="grid gap-4 sm:grid-cols-2 sm:items-center">
          <div className={block.side === "right" ? "sm:order-2" : ""}>
            <EditableImage
              url={block.url}
              onChange={(url) => onChange({ ...block, url })}
              aspectClass="aspect-[4/3]"
            />
            <div className="mt-2 flex items-center gap-3 text-[11px] text-navy/50">
              <label className="flex items-center gap-1.5">
                <input
                  type="radio"
                  checked={block.side === "left"}
                  onChange={() => onChange({ ...block, side: "left" })}
                />
                Image on left
              </label>
              <label className="flex items-center gap-1.5">
                <input
                  type="radio"
                  checked={block.side === "right"}
                  onChange={() => onChange({ ...block, side: "right" })}
                />
                Image on right
              </label>
            </div>
          </div>
          <AutoTextarea
            value={block.text}
            onChange={(text) => onChange({ ...block, text })}
            placeholder="Text alongside the image — Markdown supported…"
            className="text-[15px] leading-relaxed text-navy/80"
          />
        </div>
      );

    case "two_column_text":
      return (
        <div className="grid gap-6 sm:grid-cols-2 sm:divide-x sm:divide-sand">
          <AutoTextarea
            value={block.left}
            onChange={(left) => onChange({ ...block, left })}
            placeholder="Left column — Markdown supported…"
            className="text-[15px] leading-relaxed text-navy/80"
          />
          <AutoTextarea
            value={block.right}
            onChange={(right) => onChange({ ...block, right })}
            placeholder="Right column — Markdown supported…"
            className="text-[15px] leading-relaxed text-navy/80 sm:pl-6"
          />
        </div>
      );

    case "quote":
      return (
        <div className="border-l-2 border-gold pl-6">
          <AutoTextarea
            value={block.text}
            onChange={(text) => onChange({ ...block, text })}
            placeholder="Quote text…"
            className="font-display text-2xl italic leading-snug"
          />
          <input
            value={block.attribution}
            onChange={(e) => onChange({ ...block, attribution: e.target.value })}
            placeholder="Attribution (optional)"
            className={`${fieldClass} mt-2 text-xs uppercase tracking-wide text-navy/50`}
          />
        </div>
      );

    case "stat":
      return (
        <div>
          <input
            value={block.value}
            onChange={(e) => onChange({ ...block, value: e.target.value })}
            placeholder="+24,000"
            className={`${fieldClass} font-display text-5xl font-semibold`}
          />
          <input
            value={block.label}
            onChange={(e) => onChange({ ...block, label: e.target.value })}
            placeholder="Label"
            className={`${fieldClass} mt-2 text-xs uppercase tracking-wide text-navy/50`}
          />
        </div>
      );

    case "gallery":
      return (
        <GalleryFields
          urls={block.urls}
          onChange={(urls) => onChange({ ...block, urls })}
        />
      );

    case "divider":
      return (
        <div className="flex items-center gap-3 py-2 text-[10px] uppercase tracking-wide text-navy/30">
          <span className="h-px flex-1 bg-sand" />
          Divider
          <span className="h-px flex-1 bg-sand" />
        </div>
      );
  }
}

function GalleryFields({
  urls,
  onChange,
}: {
  urls: string[];
  onChange: (urls: string[]) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList) {
    setUploading(true);
    setError(null);
    try {
      const newUrls: string[] = [];
      for (const file of Array.from(files)) {
        newUrls.push(await uploadSiteFile(file));
      }
      onChange([...urls, ...newUrls]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {urls.map((u, i) => (
          <div key={u + i} className="group/thumb relative aspect-square overflow-hidden bg-sand">
            <Image src={u} alt="" fill sizes="150px" className="object-cover" />
            <button
              type="button"
              onClick={() => onChange(urls.filter((_, idx) => idx !== i))}
              className="absolute inset-0 flex items-center justify-center bg-navy/0 text-xs text-cream opacity-0 transition group-hover/thumb:bg-navy/50 group-hover/thumb:opacity-100"
            >
              Remove
            </button>
          </div>
        ))}
        <label className="flex aspect-square cursor-pointer items-center justify-center border border-dashed border-navy/25 text-2xl font-light text-navy/30 hover:border-navy/50 hover:text-navy/50">
          +
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) handleFiles(e.target.files);
            }}
          />
        </label>
      </div>
      {uploading && <p className="mt-2 text-xs text-navy/50">Uploading…</p>}
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export default function BlockEditor({
  name,
  initialBlocks,
}: {
  name: string;
  initialBlocks?: ArticleBlock[];
}) {
  const [blocks, setBlocks] = useState<ArticleBlock[]>(initialBlocks ?? []);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const jsonRef = useRef<HTMLInputElement>(null);

  function update(next: ArticleBlock[]) {
    setBlocks(next);
    if (jsonRef.current) jsonRef.current.value = JSON.stringify(next);
  }

  function addBlock(create: () => ArticleBlock) {
    update([...blocks, create()]);
  }

  function updateBlock(id: string, block: ArticleBlock) {
    update(blocks.map((b) => (b.id === id ? block : b)));
  }

  function removeBlock(id: string) {
    update(blocks.filter((b) => b.id !== id));
  }

  function moveBlock(id: string, dir: -1 | 1) {
    const i = blocks.findIndex((b) => b.id === id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= blocks.length) return;
    const next = [...blocks];
    [next[i], next[j]] = [next[j], next[i]];
    update(next);
  }

  function reorderTo(targetId: string | null) {
    if (!draggingId || draggingId === targetId) {
      setDraggingId(null);
      setDragOverId(null);
      return;
    }
    const from = blocks.findIndex((b) => b.id === draggingId);
    if (from < 0) return;
    const next = [...blocks];
    const [moved] = next.splice(from, 1);
    const to = targetId ? next.findIndex((b) => b.id === targetId) : next.length;
    next.splice(to < 0 ? next.length : to, 0, moved);
    update(next);
    setDraggingId(null);
    setDragOverId(null);
  }

  return (
    <div>
      <input
        ref={jsonRef}
        type="hidden"
        name={name}
        defaultValue={JSON.stringify(blocks)}
      />

      <div className="border border-sand bg-white px-5 py-6 sm:px-10 sm:py-8">
        {blocks.length === 0 && (
          <p className="text-xs text-navy/50">
            No content blocks yet — add one below, or use the Body
            (Markdown) field further down instead.
          </p>
        )}

        <div className="flex flex-col">
          {blocks.map((block, i) => (
            <div
              key={block.id}
              onDragOver={(e) => {
                e.preventDefault();
                if (draggingId && draggingId !== block.id) setDragOverId(block.id);
              }}
              onDragLeave={() => {
                setDragOverId((cur) => (cur === block.id ? null : cur));
              }}
              onDrop={(e) => {
                e.preventDefault();
                reorderTo(block.id);
              }}
              className={`border-t-2 py-4 transition-colors first:border-t-0 first:pt-0 ${
                dragOverId === block.id && draggingId && draggingId !== block.id
                  ? "border-blue"
                  : "border-transparent"
              } ${draggingId === block.id ? "opacity-40" : ""}`}
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.effectAllowed = "move";
                      setDraggingId(block.id);
                    }}
                    onDragEnd={() => {
                      setDraggingId(null);
                      setDragOverId(null);
                    }}
                    title="Drag to reorder"
                    className="cursor-grab select-none text-sm leading-none text-navy/30 hover:text-navy/60 active:cursor-grabbing"
                  >
                    ⠿
                  </span>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-navy/40">
                    {BLOCK_LABELS[block.type]}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-navy/40">
                  <button
                    type="button"
                    onClick={() => moveBlock(block.id, -1)}
                    disabled={i === 0}
                    title="Move up"
                    className="hover:text-navy disabled:opacity-30"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveBlock(block.id, 1)}
                    disabled={i === blocks.length - 1}
                    title="Move down"
                    className="hover:text-navy disabled:opacity-30"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => removeBlock(block.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              </div>
              <BlockFields
                block={block}
                onChange={(next) => updateBlock(block.id, next)}
              />
            </div>
          ))}

          {blocks.length > 0 && (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                if (draggingId) setDragOverId("__end__");
              }}
              onDragLeave={() => setDragOverId((cur) => (cur === "__end__" ? null : cur))}
              onDrop={(e) => {
                e.preventDefault();
                reorderTo(null);
              }}
              className={`h-6 border-t-2 ${
                dragOverId === "__end__" && draggingId ? "border-blue" : "border-transparent"
              }`}
            />
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {BLOCK_TEMPLATES.map((t) => (
          <button
            key={t.type}
            type="button"
            onClick={() => addBlock(t.create)}
            title={t.hint}
            className="border border-navy/20 px-3 py-1.5 text-xs font-medium text-navy/70 hover:border-navy hover:text-navy"
          >
            + {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
