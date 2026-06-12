// Gerçekçi demo verisi: Afyonkarahisar / Neriman İbrahim Küçükkurt bağlamı.
// Yönetici hesabına (admin@kocum.app) bağlı 8. sınıf LGS grubu + kayıtlar + Afyon liseleri.
// Çalıştırma: $env:SUPABASE_DB_URL="..."; node scripts/seed-demo.mjs
import pg from "pg";

const connectionString = process.env.SUPABASE_DB_URL || process.argv[2];
if (!connectionString) {
  console.error("SUPABASE_DB_URL gerekli.");
  process.exit(1);
}
const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });

const ADMIN_EMAIL = "admin@kocum.app";
const SCHOOL = "Neriman İbrahim Küçükkurt Ortaokulu";
const CITY = "Afyonkarahisar";
const CLASS_NAME = "8/A LGS Grubu";

/* Pazartesi bazlı son N hafta (app/weeks.ts ile aynı mantık), eskiden yeniye */
function mondayOf(d) {
  const x = new Date(d);
  const day = x.getDay();
  x.setDate(x.getDate() + (day === 0 ? -6 : 1 - day));
  x.setHours(0, 0, 0, 0);
  return x;
}
const iso = (d) => d.toISOString().slice(0, 10);
function recentWeeks(n) {
  const weeks = [];
  const cur = mondayOf(new Date());
  for (let i = 0; i < n; i++) {
    const start = new Date(cur);
    const end = new Date(cur);
    end.setDate(end.getDate() + 6);
    weeks.push({ start: iso(start), end: iso(end) });
    cur.setDate(cur.getDate() - 7);
  }
  return weeks.reverse();
}

const STUDENTS = [
  { first: "Elif", last: "Yıldız", base: 0.72, parent: "Hatice Yıldız" },
  { first: "Yusuf", last: "Demir", base: 0.6, parent: "Ahmet Demir" },
  { first: "Zeynep", last: "Kaya", base: 0.78, parent: "Fatma Kaya" },
  { first: "Mehmet", last: "Çelik", base: 0.55, parent: "Mustafa Çelik" },
  { first: "Ayşe", last: "Şahin", base: 0.68, parent: "Emine Şahin" },
  { first: "Emir", last: "Aydın", base: 0.64, parent: "Hasan Aydın" },
];

const TOPICS = {
  "Türkçe": ["Sözcükte Anlam", "Cümlede Anlam", "Paragraf", "Fiilimsiler"],
  "Matematik": ["Çarpanlar ve Katlar", "Üslü İfadeler", "Kareköklü İfadeler", "Olasılık"],
  "Fen Bilimleri": ["Mevsimler ve İklim", "DNA ve Genetik Kod", "Basınç", "Madde ve Endüstri"],
  "Sosyal Bilgiler": ["Bir Kahraman Doğuyor", "Milli Uyanış", "Atatürkçülük", "Demokrasi"],
  "İngilizce": ["Friendship", "Teen Life", "In the Kitchen", "On the Phone"],
  "Din Kültürü ve Ahlak Bilgisi": ["Kader İnancı", "Zekât ve Sadaka", "Din ve Hayat", "Örnek İnsan"],
};

const BOOKS = ["Sol Ayağım", "Küçük Prens", "Şeker Portakalı", "Beyaz Diş", "Çalıkuşu", "Tom Sawyer"];

const AFYON_SCHOOLS = [
  ["Afyonkarahisar Fen Lisesi", "Fen Lisesi", 492.0, 0.8],
  ["Afyonkarahisar Sosyal Bilimler Lisesi", "Sosyal Bilimler Lisesi", 458.0, 3.1],
  ["Neriman İbrahim Küçükkurt Anadolu Lisesi", "Anadolu Lisesi", 412.0, 7.4],
  ["Kocatepe Anadolu Lisesi", "Anadolu Lisesi", 398.0, 9.0],
  ["Gazi Anadolu Lisesi", "Anadolu Lisesi", 380.0, 12.5],
  ["Süleyman Goncer Anadolu Lisesi", "Anadolu Lisesi", 365.0, 15.2],
  ["Afyonkarahisar Anadolu İmam Hatip Lisesi", "İmam Hatip Lisesi", 352.0, 18.0],
];

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const rnd = (a, b) => a + Math.random() * (b - a);

async function main() {
  await client.connect();
  console.log("Bağlandı ✓");

  const { rows: prof } = await client.query("select id from public.profiles where email=$1", [ADMIN_EMAIL]);
  if (!prof.length) throw new Error(`Profil yok: ${ADMIN_EMAIL}`);
  const teacherId = prof[0].id;

  const { rows: subs } = await client.query("select id, subject_name from public.subjects");
  const subjectByName = Object.fromEntries(subs.map((s) => [s.subject_name, s.id]));

  // İdempotent temizlik
  await client.query("delete from public.classes where teacher_id=$1 and class_name=$2", [teacherId, CLASS_NAME]);
  await client.query("delete from public.high_schools where city=$1", [CITY]);

  const { rows: cls } = await client.query(
    `insert into public.classes (teacher_id, class_name, grade_level, school_name, description)
     values ($1,$2,8,$3,$4) returning id`,
    [teacherId, CLASS_NAME, SCHOOL, "Afyonkarahisar LGS koçluk grubu"],
  );
  const classId = cls[0].id;

  const weeks = recentWeeks(5);
  let wk = 0,
    rd = 0,
    ex = 0;

  for (const st of STUDENTS) {
    const { rows: sRow } = await client.query(
      `insert into public.students
        (class_id, teacher_id, first_name, last_name, grade_level, school_name, parent_name, parent_email, parent_phone, note)
       values ($1,$2,$3,$4,8,$5,$6,$7,$8,$9) returning id`,
      [
        classId,
        teacherId,
        st.first,
        st.last,
        SCHOOL,
        st.parent,
        `${st.first.toLocaleLowerCase("tr")}.veli@ornek.com`,
        "05" + Math.floor(rnd(300000000, 599999999)),
        "LGS hedef odaklı çalışıyor.",
      ],
    );
    const studentId = sRow[0].id;

    for (let wi = 0; wi < weeks.length; wi++) {
      const w = weeks[wi];
      const improve = wi * 0.03;
      for (const [subjName, topics] of Object.entries(TOPICS)) {
        const sid = subjectByName[subjName];
        if (!sid) continue;
        const rate = clamp(st.base + improve + rnd(-0.12, 0.12), 0.25, 0.97);
        const total = Math.round(rnd(18, 40));
        const correct = Math.round(total * rate);
        await client.query(
          `insert into public.weekly_records
            (student_id, teacher_id, week_start_date, week_end_date, subject_id, topic, correct_count, wrong_count)
           values ($1,$2,$3,$4,$5,$6,$7,$8)`,
          [studentId, teacherId, w.start, w.end, sid, topics[wi % topics.length], correct, total - correct],
        );
        wk++;
      }
      await client.query(
        `insert into public.reading_records (student_id, teacher_id, week_start_date, week_end_date, book_name, page_count)
         values ($1,$2,$3,$4,$5,$6)`,
        [studentId, teacherId, w.start, w.end, BOOKS[wi % BOOKS.length], Math.round(rnd(40, 160))],
      );
      rd++;
    }

    const baseScore = Math.round(330 + st.base * 120);
    for (let i = 0; i < 4; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (28 - i * 7));
      const score = clamp(baseScore + i * Math.round(rnd(6, 16)) + Math.round(rnd(-8, 8)), 200, 500);
      await client.query(
        `insert into public.exam_results (student_id, teacher_id, exam_name, exam_date, exam_type, score)
         values ($1,$2,$3,$4,$5,$6)`,
        [studentId, teacherId, i % 2 === 0 ? "Türkiye Geneli LGS Denemesi" : "Kurum İçi Deneme", iso(d), "LGS Denemesi", score],
      );
      ex++;
    }
  }

  for (const [name, type, base, pct] of AFYON_SCHOOLS) {
    await client.query(
      `insert into public.high_schools (school_name, city, district, school_type, base_score, percentile, year)
       values ($1,$2,'Merkez',$3,$4,$5,2026)`,
      [name, CITY, type, base, pct],
    );
  }

  console.log(`Tamamlandı ✓  Öğrenci: ${STUDENTS.length}, haftalık: ${wk}, okuma: ${rd}, deneme: ${ex}, Afyon lise: ${AFYON_SCHOOLS.length}`);
  await client.end();
}

main().catch(async (e) => {
  console.error("SEED HATASI:", e.message);
  try {
    await client.end();
  } catch {}
  process.exit(1);
});
