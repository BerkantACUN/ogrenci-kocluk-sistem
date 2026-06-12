import { createClient } from "./server";
import type { Profile } from "@/lib/types";

/** Sunucu tarafında oturumdaki kullanıcının profilini getirir. */
export async function getSessionProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  return (data as Profile) ?? null;
}
