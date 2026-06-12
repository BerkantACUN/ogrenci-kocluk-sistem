// Migration runner — doğrudan Postgres bağlantısı ile full_setup.sql çalıştırır.
// Kullanım:
//   node scripts/run-migrations.mjs "postgresql://postgres.<ref>:[PW]@...pooler.supabase.com:5432/postgres"
//   veya: $env:SUPABASE_DB_URL="..."; node scripts/run-migrations.mjs
import { readFileSync } from "node:fs";
import pg from "pg";

const connectionString = process.argv[2] || process.env.SUPABASE_DB_URL;
if (!connectionString) {
  console.error("HATA: Bağlantı dizesi verilmedi (argüman veya SUPABASE_DB_URL).");
  process.exit(1);
}

// BOM + sıfır-genişlik karakterleri temizle
const sql = readFileSync(new URL("../supabase/full_setup.sql", import.meta.url), "utf8")
  .replace(/﻿/g, "")
  .trim();

const client = new pg.Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  await client.connect();
  console.log("Bağlandı ✓ — şema kuruluyor…");
  await client.query(sql);
  const { rows } = await client.query("select count(*)::int as n from public.subjects");
  console.log(`Tamamlandı ✓ — subjects tablosunda ${rows[0].n} ders var.`);
  await client.end();
}

main().catch(async (e) => {
  console.error("MIGRATION HATASI:", e.message);
  try {
    await client.end();
  } catch {}
  process.exit(1);
});
