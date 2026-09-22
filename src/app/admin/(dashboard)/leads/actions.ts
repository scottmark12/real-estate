"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ContactMessage } from "@/lib/types";

const INTENT_TO_CLIENT_TYPE: Record<string, string> = {
  Buying: "buyer",
  Selling: "seller",
  Investing: "investor",
};

export async function convertLead(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  const { data } = await supabase
    .from("contact_messages")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  const message = data as ContactMessage | null;
  if (!message) return;

  const notesParts = [message.message, message.context]
    .filter(Boolean)
    .join("\n\n");

  const { data: client } = await supabase
    .from("clients")
    .insert({
      name: message.name || "Unnamed Lead",
      email: message.email,
      phone: message.phone,
      status: "lead",
      client_type: INTENT_TO_CLIENT_TYPE[message.intent ?? ""] ?? "other",
      timeline: message.timeline,
      notes: notesParts || null,
      source: message.source,
      contact_message_id: message.id,
    })
    .select("id")
    .single();

  revalidatePath("/admin/leads");
  revalidatePath("/admin/clients");
  revalidatePath("/admin");
  redirect(client?.id ? `/admin/clients/${client.id}/edit` : "/admin/leads");
}
