// Tek bir SQL dosyasını çalıştırır.
// Kullanım: $env:SUPABASE_DB_URL="..."; node scripts/exec-sql.mjs <sqlDosyaYolu>
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import pg from "pg";

const connectionString = process.env.SUPABASE_DB_URL || process.argv[3];
const file = process.argv[2];
if (!connectionString || !file) {
  console.error("Kullanım: SUPABASE_DB_URL=... node scripts/exec-sql.mjs <dosya.sql>");
  process.exit(1);
}

const sql = readFileSync(resolve(file), "utf8").replace(/﻿/g, "").trim();
const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });

async function main() {
  await client.connect();
  await client.query(sql);
  console.log("OK ✓", file);
  await client.end();
}
main().catch(async (e) => {
  console.error("HATA:", e.message);
  try { await client.end(); } catch {}
  process.exit(1);
});
