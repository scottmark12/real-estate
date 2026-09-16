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

export function GalleryUploader({
  name,
  label,
  initialUrls,
}: {
  name: string;
  label: string;
  initialUrls?: string[];
}) {
  const [urls, setUrls] = useState<string[]>(initialUrls ?? []);
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
      setUrls((prev) => [...prev, ...newUrls]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <label className={labelClass}>{label}</label>
      {urls.map((u) => (
        <input key={u} type="hidden" name={name} value={u} />
      ))}
      <div className="mt-1 flex flex-wrap gap-3">
        {urls.map((u) => (
          <div key={u} className="relative h-20 w-28 overflow-hidden bg-sand">
            <Image src={u} alt="" fill sizes="112px" className="object-cover" />
            <button
              type="button"
              onClick={() => setUrls((prev) => prev.filter((x) => x !== u))}
              className="absolute right-1 top-1 bg-navy/80 px-1.5 text-xs text-cream"
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
          if (e.target.files && e.target.files.length > 0) {
            handleFiles(e.target.files);
          }
        }}
        className="mt-2 block text-sm text-navy/70"
      />
      {uploading && <p className="text-xs text-navy/50">Uploading…</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
