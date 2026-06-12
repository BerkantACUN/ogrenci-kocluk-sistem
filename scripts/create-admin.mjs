// Hazır yönetici hesabı oluşturur (service_role admin API + role=admin).
// Kullanım: node scripts/create-admin.mjs <email> <password> <ad> <soyad>
import { readFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
);
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const service = env.SUPABASE_SERVICE_ROLE_KEY;

const [email, password, name = "Yönetici", surname = "Hesabı"] = process.argv.slice(2);
if (!email || !password) {
  console.error("Kullanım: node scripts/create-admin.mjs <email> <password> [ad] [soyad]");
  process.exit(1);
}
const H = { apikey: service, Authorization: `Bearer ${service}`, "Content-Type": "application/json" };

async function main() {
  // 1) Kullanıcı oluştur (e-posta doğrulanmış)
  const create = await fetch(`${url}/auth/v1/admin/users`, {
    method: "POST",
    headers: H,
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, surname },
    }),
  });
  const user = await create.json();
  if (!create.ok) {
    console.error("Kullanıcı oluşturulamadı:", JSON.stringify(user));
    process.exit(1);
  }
  console.log("Kullanıcı oluşturuldu ✓ id:", user.id);

  // 2) Profili admin yap (trigger profili teacher olarak oluşturdu)
  const patch = await fetch(`${url}/rest/v1/profiles?id=eq.${user.id}`, {
    method: "PATCH",
    headers: { ...H, Prefer: "return=representation" },
    body: JSON.stringify({ role: "admin" }),
  });
  const prof = await patch.json();
  if (!patch.ok) {
    console.error("Rol güncellenemedi:", JSON.stringify(prof));
    process.exit(1);
  }
  console.log("Yönetici yapıldı ✓", JSON.stringify(prof));
  console.log(`\nGİRİŞ: ${email} / ${password}`);
}
main().catch((e) => {
  console.error("HATA:", e.message);
  process.exit(1);
});
