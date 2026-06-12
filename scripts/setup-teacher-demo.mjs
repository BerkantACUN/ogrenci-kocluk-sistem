// Öğretmen demo hesabı oluşturur ve demo veriyi (admin'den) ona taşır.
// Çalıştırma: $env:SUPABASE_DB_URL="..."; node scripts/setup-teacher-demo.mjs
import { readFileSync } from "node:fs";
import pg from "pg";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
);
const URL_ = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE = env.SUPABASE_SERVICE_ROLE_KEY;
const DB = process.env.SUPABASE_DB_URL;
if (!DB) {
  console.error("SUPABASE_DB_URL gerekli.");
  process.exit(1);
}

const ADMIN_EMAIL = "admin@kocum.app";
const TEACHER_EMAIL = "ogretmen@kocum.app";
const TEACHER_PW = "Kocum2026!";
const H = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, "Content-Type": "application/json" };

const client = new pg.Client({ connectionString: DB, ssl: { rejectUnauthorized: false } });

async function main() {
  // 1) Öğretmen var mı? yoksa oluştur
  const list = await fetch(`${URL_}/auth/v1/admin/users?per_page=200`, { headers: H }).then((r) => r.json());
  let teacher = (list.users || []).find((u) => u.email === TEACHER_EMAIL);
  if (!teacher) {
    const res = await fetch(`${URL_}/auth/v1/admin/users`, {
      method: "POST",
      headers: H,
      body: JSON.stringify({
        email: TEACHER_EMAIL,
        password: TEACHER_PW,
        email_confirm: true,
        user_metadata: { name: "Ayşe", surname: "Koç", branch: "LGS Koçu" },
      }),
    });
    teacher = await res.json();
    if (!res.ok) throw new Error("Öğretmen oluşturulamadı: " + JSON.stringify(teacher));
    console.log("Öğretmen hesabı oluşturuldu ✓", teacher.id);
  } else {
    console.log("Öğretmen zaten var ✓", teacher.id);
  }

  // 2) Veriyi admin'den öğretmene taşı
  await client.connect();
  const { rows } = await client.query("select id from public.profiles where email=$1", [ADMIN_EMAIL]);
  const adminId = rows[0].id;
  const teacherId = teacher.id;

  const tables = ["classes", "students", "weekly_records", "reading_records", "exam_results", "reports"];
  for (const t of tables) {
    const r = await client.query(`update public.${t} set teacher_id=$1 where teacher_id=$2`, [teacherId, adminId]);
    console.log(`${t}: ${r.rowCount} satır öğretmene taşındı`);
  }
  await client.end();

  console.log(`\nÖĞRETMEN GİRİŞİ: ${TEACHER_EMAIL} / ${TEACHER_PW}`);
}

main().catch(async (e) => {
  console.error("HATA:", e.message);
  try {
    await client.end();
  } catch {}
  process.exit(1);
});
