// Gerçek Afyonkarahisar 2025 LGS taban puanları (kaynak: tabanpuanlari.net).
// Global liseleri (teacher_id null) temizleyip gerçek veriyle değiştirir.
// Çalıştırma: $env:SUPABASE_DB_URL="..."; node scripts/seed-highschools.mjs
import pg from "pg";

const connectionString = process.env.SUPABASE_DB_URL || process.argv[2];
if (!connectionString) {
  console.error("SUPABASE_DB_URL gerekli.");
  process.exit(1);
}
const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });

// [ad, puan, yüzdelik, ilçe, alan]
const RAW = [
  ["Süleyman Demirel Fen Lisesi", "465,3052", 2.13, "MERKEZ", ""],
  ["Kamil Miras Anadolu Lisesi", "441,7161", 4.78, "MERKEZ", ""],
  ["Afyon Lisesi", "419,0427", 7.84, "MERKEZ", ""],
  ["Ayfer-Ceylan EMET Fen Lisesi", "406,93", 9.8, "BOLVADİN", ""],
  ["Sandıklı Türk Telekom Fen Lisesi", "392,3982", 12.14, "SANDIKLI", ""],
  ["Dinar Fen Lisesi", "387,9054", 12.94, "DİNAR", ""],
  ["Emirdağ Fen Lisesi", "360,1897", 17.92, "EMİRDAĞ", ""],
  ["TOKİ Sosyal Bilimler Lisesi", "357,2427", 18.62, "MERKEZ", ""],
  ["Raziye Sultan-Yusuf Kayabaşı Sosyal Bilimler Lisesi", "325,3127", 25.36, "BOLVADİN", ""],
  ["Afyonkarahisar Atatürk Mesleki ve Teknik Anadolu Lisesi", "324,9994", 25.63, "MERKEZ", "Sağlık Hizmetleri"],
  ["Afyonkarahisar Kız Anadolu İmam Hatip Lisesi", "320,8521", 26.54, "MERKEZ", ""],
  ["Dinar Anadolu İmam Hatip Lisesi", "292,4329", 33.72, "DİNAR", ""],
  ["Afyonkarahisar Hattat Ahmet Karahisari Anadolu İmam Hatip Lisesi", "285,7891", 35.74, "MERKEZ", ""],
  ["Sandıklı Kız Anadolu İmam Hatip Lisesi", "284,1579", 36.21, "SANDIKLI", ""],
  ["Çay Anadolu Lisesi", "281,5873", 36.89, "ÇAY", ""],
  ["Şuhut Anadolu Lisesi", "277,7901", 38.27, "ŞUHUT", ""],
  ["İscehisar Mehmet Çakmak Anadolu Lisesi", "247,7358", 48.69, "İSCEHİSAR", ""],
  ["Afyonkarahisar Şehit Yunus Çiçek Mesleki ve Teknik Anadolu Lisesi", "247,6686", 48.69, "MERKEZ", "Elektrik-Elektronik"],
  ["Bolvadin TOBB Anadolu İmam Hatip Lisesi", "245,5695", 49.48, "BOLVADİN", ""],
  ["Afyonkarahisar Şehit Yunus Çiçek Mesleki ve Teknik Anadolu Lisesi", "235,8706", 53.99, "MERKEZ", "Bilişim Teknolojileri"],
  ["Afyonkarahisar Gazi Mesleki ve Teknik Anadolu Lisesi", "216,7869", 64.35, "MERKEZ", "Endüstriyel Otomasyon"],
  ["Afyonkarahisar Gazi Mesleki ve Teknik Anadolu Lisesi", "211,867", 67.63, "MERKEZ", "Raylı Sistemler (Sınavlı)"],
  ["Afyonkarahisar Gazi Mesleki ve Teknik Anadolu Lisesi", "200,5248", 75.34, "MERKEZ", "Raylı Sistemler"],
  ["Afyonkarahisar Şehit Yunus Çiçek Mesleki ve Teknik Anadolu Lisesi", "197,3532", 77.46, "MERKEZ", "Makine ve Tasarım"],
  ["Emirdağ Mesleki ve Teknik Anadolu Lisesi", "195,1041", 80.28, "EMİRDAĞ", "Makine ve Tasarım"],
  ["Sandıklı Anadolu İmam Hatip Lisesi", "186,8964", 86.02, "SANDIKLI", ""],
  ["Sandıklı Hisar Ticaret Mesleki ve Teknik Anadolu Lisesi", "180,8726", 89.74, "SANDIKLI", "Adalet (Sınavlı)"],
  ["Şuhut Kız Anadolu İmam Hatip Lisesi", "170,9403", 96.63, "ŞUHUT", ""],
  ["Dinar Mesleki ve Teknik Anadolu Lisesi", "160,2233", 99.24, "DİNAR", "Elektrik-Elektronik"],
  ["Emirdağ Anadolu İmam Hatip Lisesi", "153,5922", 99.82, "EMİRDAĞ", ""],
  ["Emirdağ Mesleki ve Teknik Anadolu Lisesi", "152,8979", 99.82, "EMİRDAĞ", "Elektrik-Elektronik"],
  ["Afyonkarahisar Şehit Yunus Çiçek Mesleki ve Teknik Anadolu Lisesi", "150,963", 99.82, "MERKEZ", "Motorlu Araçlar"],
];

const num = (s) => Math.round(parseFloat(s.replace(/\./g, "").replace(",", ".")) * 100) / 100;
const titleTr = (s) =>
  s
    .toLocaleLowerCase("tr")
    .split(" ")
    .map((w) => (w ? w[0].toLocaleUpperCase("tr") + w.slice(1) : w))
    .join(" ");

function schoolType(name) {
  if (/Fen Lisesi/i.test(name)) return "Fen Lisesi";
  if (/Sosyal Bilimler/i.test(name)) return "Sosyal Bilimler Lisesi";
  if (/İmam Hatip/i.test(name)) return "İmam Hatip Lisesi";
  if (/Mesleki ve Teknik/i.test(name)) return "Mesleki ve Teknik Anadolu Lisesi";
  return "Anadolu Lisesi";
}

async function main() {
  await client.connect();
  // Sahte/eski global liseleri temizle (yalnızca global; öğretmenlerin kendi eklediklerine dokunma)
  const del = await client.query("delete from public.high_schools where teacher_id is null");
  console.log(`Eski global lise silindi: ${del.rowCount}`);

  let n = 0;
  for (const [name, scoreStr, pct, ilce, alan] of RAW) {
    const display = alan ? `${name} (${alan})` : name;
    await client.query(
      `insert into public.high_schools (school_name, city, district, school_type, base_score, percentile, year, teacher_id)
       values ($1,'Afyonkarahisar',$2,$3,$4,$5,2025,null)`,
      [display, titleTr(ilce), schoolType(name), num(scoreStr), pct],
    );
    n++;
  }
  console.log(`Gerçek 2025 Afyonkarahisar lisesi eklendi: ${n}`);
  await client.end();
}

main().catch(async (e) => {
  console.error("HATA:", e.message);
  try {
    await client.end();
  } catch {}
  process.exit(1);
});
