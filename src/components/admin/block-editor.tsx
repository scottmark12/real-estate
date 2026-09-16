"use client";

import Image from "next/image";
import { useRef, useState } from "react";
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

function fieldClass() {
  return "mt-1 w-full rounded-lg border border-navy/15 bg-white px-3 py-2 text-sm";
}

function InlineImagePicker({
  url,
  onChange,
}: {
  url: string;
  onChange: (url: string) => void;
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
    <div className="flex items-center gap-3">
      {url && (
        <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-sand">
          <Image src={url} alt="" fill sizes="96px" className="object-cover" />
        </div>
      )}
      <div className="flex-1">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
          className="block text-xs text-navy/70"
        />
        <input
          type="url"
          value={url}
          onChange={(e) => onChange(e.target.value)}
          placeholder="or paste an image URL"
          className="mt-1 w-full rounded-lg border border-navy/15 bg-white px-2 py-1 text-xs"
        />
        {uploading && <p className="text-xs text-navy/50">Uploading…</p>}
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
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
          placeholder="Heading text"
          className={fieldClass()}
        />
      );
    case "text":
      return (
        <textarea
          value={block.text}
          onChange={(e) => onChange({ ...block, text: e.target.value })}
          placeholder="Paragraph text — Markdown supported"
          rows={5}
          className={`${fieldClass()} font-mono`}
        />
      );
    case "image":
      return (
        <div className="flex flex-col gap-2">
          <InlineImagePicker
            url={block.url}
            onChange={(url) => onChange({ ...block, url })}
          />
          <input
            value={block.caption}
            onChange={(e) => onChange({ ...block, caption: e.target.value })}
            placeholder="Caption (optional)"
            className={fieldClass()}
          />
        </div>
      );
    case "image_text":
      return (
        <div className="flex flex-col gap-2">
          <InlineImagePicker
            url={block.url}
            onChange={(url) => onChange({ ...block, url })}
          />
          <div className="flex items-center gap-4 text-xs text-navy/70">
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
          <textarea
            value={block.text}
            onChange={(e) => onChange({ ...block, text: e.target.value })}
            placeholder="Text alongside the image — Markdown supported"
            rows={4}
            className={`${fieldClass()} font-mono`}
          />
        </div>
      );
    case "two_column_text":
      return (
        <div className="grid gap-2 sm:grid-cols-2">
          <textarea
            value={block.left}
            onChange={(e) => onChange({ ...block, left: e.target.value })}
            placeholder="Left column — Markdown supported"
            rows={5}
            className={`${fieldClass()} font-mono`}
          />
          <textarea
            value={block.right}
            onChange={(e) => onChange({ ...block, right: e.target.value })}
            placeholder="Right column — Markdown supported"
            rows={5}
            className={`${fieldClass()} font-mono`}
          />
        </div>
      );
    case "quote":
      return (
        <div className="flex flex-col gap-2">
          <textarea
            value={block.text}
            onChange={(e) => onChange({ ...block, text: e.target.value })}
            placeholder="Quote text"
            rows={3}
            className={fieldClass()}
          />
          <input
            value={block.attribution}
            onChange={(e) => onChange({ ...block, attribution: e.target.value })}
            placeholder="Attribution (optional)"
            className={fieldClass()}
          />
        </div>
      );
    case "stat":
      return (
        <div className="grid gap-2 sm:grid-cols-2">
          <input
            value={block.value}
            onChange={(e) => onChange({ ...block, value: e.target.value })}
            placeholder="e.g. +24,000"
            className={fieldClass()}
          />
          <input
            value={block.label}
            onChange={(e) => onChange({ ...block, label: e.target.value })}
            placeholder="Label"
            className={fieldClass()}
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
      return <p className="text-xs text-navy/40">A thin horizontal rule.</p>;
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
      <div className="flex flex-wrap gap-3">
        {urls.map((u, i) => (
          <div key={u + i} className="relative h-16 w-24 overflow-hidden rounded-lg bg-sand">
            <Image src={u} alt="" fill sizes="96px" className="object-cover" />
            <button
              type="button"
              onClick={() => onChange(urls.filter((_, idx) => idx !== i))}
              className="absolute right-1 top-1 rounded-full bg-navy/80 px-1.5 text-xs text-cream"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) handleFiles(e.target.files);
        }}
        className="mt-2 block text-xs text-navy/70"
      />
      {uploading && <p className="text-xs text-navy/50">Uploading…</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
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

  return (
    <div>
      <input
        ref={jsonRef}
        type="hidden"
        name={name}
        defaultValue={JSON.stringify(blocks)}
      />

      {blocks.length === 0 && (
        <p className="text-xs text-navy/50">
          No content blocks yet — add one below, or use the Body (Markdown)
          field further down instead.
        </p>
      )}

      <div className="flex flex-col gap-3">
        {blocks.map((block, i) => (
          <div key={block.id} className="rounded-lg border border-navy/15 bg-white p-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-navy/50">
                {BLOCK_LABELS[block.type]}
              </p>
              <div className="flex items-center gap-2 text-xs text-navy/50">
                <button
                  type="button"
                  onClick={() => moveBlock(block.id, -1)}
                  disabled={i === 0}
                  className="disabled:opacity-30"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => moveBlock(block.id, 1)}
                  disabled={i === blocks.length - 1}
                  className="disabled:opacity-30"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => removeBlock(block.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            </div>
            <div className="mt-2">
              <BlockFields
                block={block}
                onChange={(next) => updateBlock(block.id, next)}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {BLOCK_TEMPLATES.map((t) => (
          <button
            key={t.type}
            type="button"
            onClick={() => addBlock(t.create)}
            title={t.hint}
            className="rounded-full border border-navy/20 px-3 py-1.5 text-xs font-medium text-navy/70 hover:border-navy hover:text-navy"
          >
            + {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
