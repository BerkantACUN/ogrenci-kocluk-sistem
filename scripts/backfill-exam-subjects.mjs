// Mevcut denemelere ders bazlı doğru/yanlış/boş ekler (kırılımı olmayanlara).
// Çalıştırma: $env:SUPABASE_DB_URL="..."; node scripts/backfill-exam-subjects.mjs
import pg from "pg";

const connectionString = process.env.SUPABASE_DB_URL || process.argv[2];
if (!connectionString) {
  console.error("SUPABASE_DB_URL gerekli.");
  process.exit(1);
}
const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });

const LGS_Q = {
  "Türkçe": 20,
  "Matematik": 20,
  "Fen Bilimleri": 20,
  "Sosyal Bilgiler": 10,
  "İngilizce": 10,
  "Din Kültürü ve Ahlak Bilgisi": 10,
};
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const rnd = (a, b) => a + Math.random() * (b - a);

async function main() {
  await client.connect();
  const { rows: subs } = await client.query("select id, subject_name from public.subjects");
  const byName = Object.fromEntries(subs.map((s) => [s.subject_name, s.id]));

  const { rows: exams } = await client.query(
    `select e.id, e.teacher_id, e.score
       from public.exam_results e
       left join public.exam_subject_results r on r.exam_id = e.id
      where r.id is null
      group by e.id`,
  );
  console.log(`Kırılımı eksik ${exams.length} deneme bulundu.`);

  let inserted = 0;
  for (const ex of exams) {
    const baseRate = clamp((Number(ex.score) - 180) / 340, 0.25, 0.95);
    for (const [subjName, q] of Object.entries(LGS_Q)) {
      const sid = byName[subjName];
      if (!sid) continue;
      const rate = clamp(baseRate + rnd(-0.12, 0.12), 0.2, 0.97);
      const correct = Math.min(q, Math.round(q * rate));
      const blank = Math.round(rnd(0, (q - correct) * 0.4));
      const wrong = Math.max(0, q - correct - blank);
      await client.query(
        `insert into public.exam_subject_results (exam_id, teacher_id, subject_id, correct, wrong, blank)
         values ($1,$2,$3,$4,$5,$6) on conflict (exam_id, subject_id) do nothing`,
        [ex.id, ex.teacher_id, sid, correct, wrong, blank],
      );
      inserted++;
    }
  }
  console.log(`Tamamlandı ✓ — ${inserted} ders satırı eklendi.`);
  await client.end();
}

main().catch(async (e) => {
  console.error("HATA:", e.message);
  try {
    await client.end();
  } catch {}
  process.exit(1);
});
