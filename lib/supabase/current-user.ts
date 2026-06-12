import { createClient } from "./client";

/** Oturumdaki kullanıcının id'sini döndürür (mutation'larda teacher_id için). */
export async function getUserId(): Promise<string> {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error("Oturum bulunamadı. Lütfen tekrar giriş yapın.");
  return data.user.id;
}

/** Boş string'i null'a çevir (opsiyonel alanlar için). */
export function nn(value: string | null | undefined): string | null {
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}
