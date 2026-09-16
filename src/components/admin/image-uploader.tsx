"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { uploadSiteFile } from "@/lib/upload";
import { label as labelClass } from "@/components/admin/ui";

export function SingleImageUploader({
  name,
  label,
  initialUrl,
}: {
  name: string;
  label: string;
  initialUrl?: string | null;
}) {
  const [url, setUrl] = useState(initialUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);
    try {
      setUrl(await uploadSiteFile(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <label className={labelClass}>{label}</label>
      <input type="hidden" name={name} value={url} />
      <div className="mt-1 flex items-center gap-4">
        {url && (
          <div className="relative h-20 w-28 overflow-hidden bg-sand">
            <Image src={url} alt="" fill sizes="112px" className="object-cover" />
          </div>
        )}
        <div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
            className="block text-sm text-navy/70"
          />
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="or paste an image URL"
            className="mt-2 w-64 border border-navy/15 bg-white px-3 py-1.5 text-xs"
          />
          {uploading && <p className="text-xs text-navy/50">Uploading…</p>}
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
      </div>
    </div>
  );
}

// Manages a primary image plus a gallery together, so a gallery photo can
// be promoted to primary in one click — the outgoing primary drops into
// the gallery in the spot the promoted photo vacated (a true swap) rather
// than just being discarded.
export function PrimaryGalleryUploader({
  primaryName,
  galleryName,
  primaryLabel,
  galleryLabel,
  initialPrimary,
  initialGallery,
}: {
  primaryName: string;
  galleryName: string;
  primaryLabel: string;
  galleryLabel: string;
  initialPrimary?: string | null;
  initialGallery?: string[];
}) {
  const [primary, setPrimary] = useState(initialPrimary ?? "");
  const [gallery, setGallery] = useState<string[]>(initialGallery ?? []);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePrimaryFile(file: File) {
    setUploading(true);
    setError(null);
    try {
      setPrimary(await uploadSiteFile(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleGalleryFiles(files: FileList) {
    setUploading(true);
    setError(null);
    try {
      const newUrls: string[] = [];
      for (const file of Array.from(files)) {
        newUrls.push(await uploadSiteFile(file));
      }
      setGallery((prev) => [...prev, ...newUrls]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function makePrimary(url: string) {
    setGallery((prev) => {
      const idx = prev.indexOf(url);
      if (idx === -1) return prev;
      const next = [...prev];
      if (primary) {
        next[idx] = primary;
      } else {
        next.splice(idx, 1);
      }
      return next;
    });
    setPrimary(url);
  }

  return (
    <div>
      <input type="hidden" name={primaryName} value={primary} />
      {gallery.map((u) => (
        <input key={u} type="hidden" name={galleryName} value={u} />
      ))}

      <label className={labelClass}>{primaryLabel}</label>
      <div className="mt-1 flex items-center gap-4">
        {primary && (
          <div className="relative h-24 w-36 overflow-hidden bg-sand">
            <Image src={primary} alt="" fill sizes="144px" className="object-cover" />
            <span className="absolute left-1 top-1 bg-navy/80 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-cream">
              Primary
            </span>
          </div>
        )}
        <div>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handlePrimaryFile(file);
            }}
            className="block text-sm text-navy/70"
          />
          <input
            type="url"
            value={primary}
            onChange={(e) => setPrimary(e.target.value)}
            placeholder="or paste an image URL"
            className="mt-2 w-64 border border-navy/15 bg-white px-3 py-1.5 text-xs"
          />
        </div>
      </div>

      <div className="mt-5">
        <label className={labelClass}>{galleryLabel}</label>
        {gallery.length > 0 && (
          <p className="mt-1 text-xs text-navy/40">
            Click the star on a photo to swap it in as the primary image.
          </p>
        )}
        {gallery.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-3">
            {gallery.map((u) => (
              <div key={u} className="relative h-20 w-28 overflow-hidden bg-sand">
                <Image src={u} alt="" fill sizes="112px" className="object-cover" />
                <button
                  type="button"
                  onClick={() => makePrimary(u)}
                  title="Make this the primary image"
                  className="absolute left-1 top-1 bg-navy/80 px-1.5 text-xs text-cream hover:bg-blue"
                >
                  ★
                </button>
                <button
                  type="button"
                  onClick={() => setGallery((prev) => prev.filter((x) => x !== u))}
                  title="Remove"
                  className="absolute right-1 top-1 bg-navy/80 px-1.5 text-xs text-cream"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleGalleryFiles(e.target.files);
            }
          }}
          className="mt-2 block text-sm text-navy/70"
        />
      </div>

      {uploading && <p className="mt-2 text-xs text-navy/50">Uploading…</p>}
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
