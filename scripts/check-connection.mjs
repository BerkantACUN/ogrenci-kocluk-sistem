// Supabase bağlantı + şema kontrolü (service_role ile)
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

async function main() {
  // 1) REST erişimi
  const root = await fetch(`${url}/rest/v1/`, {
    headers: { apikey: service, Authorization: `Bearer ${service}` },
  });
  console.log("REST /:", root.status);

  // 2) subjects tablosu var mı?
  const subj = await fetch(`${url}/rest/v1/subjects?select=subject_name&limit=5`, {
    headers: { apikey: service, Authorization: `Bearer ${service}` },
  });
  const body = await subj.text();
  console.log("subjects:", subj.status, body.slice(0, 200));

  if (subj.status === 200) {
    console.log("RESULT: SCHEMA_EXISTS");
  } else if (body.includes("does not exist") || subj.status === 404) {
    console.log("RESULT: SCHEMA_MISSING");
  } else {
    console.log("RESULT: UNKNOWN");
  }
}

main().catch((e) => {
  console.error("ERROR:", e.message);
  process.exit(1);
});
