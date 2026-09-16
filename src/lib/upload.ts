"use client";

import { createClient } from "@/lib/supabase/client";

function randomFileName(originalName: string) {
  const ext = originalName.split(".").pop() ?? "jpg";
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);
  return `${id}.${ext}`;
}

/**
 * Uploads a file directly to the site-images storage bucket and returns
 * its public URL. Shared by every admin uploader (single image, gallery,
 * article content blocks) so there's one upload path to a single bucket.
 */
export async function uploadSiteFile(file: File): Promise<string> {
  const supabase = createClient();
  const path = `uploads/${randomFileName(file.name)}`;
  const { error } = await supabase.storage
    .from("site-images")
    .upload(path, file, { upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from("site-images").getPublicUrl(path);
  return data.publicUrl;
}
