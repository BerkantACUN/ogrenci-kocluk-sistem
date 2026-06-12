/**
 * Excel/CSV deneme satırlarını öğrencilerle eşleştiren saf ayrıştırıcı.
 * Eşleştirme: önce Okul No, yoksa Ad Soyad (Türkçe duyarsız).
 */
import type { Student, Subject } from "./types";
import type { ExamSubjectInput } from "@/hooks/use-student-data";

export interface ParsedRow {
  rowIndex: number;
  label: string; // ham satır kimliği (okul no / ad soyad)
  studentId: string | null;
  studentName: string;
  subjects: ExamSubjectInput[];
  score: number;
  matchedBy: "no" | "isim" | null;
  reason?: string;
}

export interface ParseResult {
  matched: ParsedRow[];
  unmatched: ParsedRow[];
  subjectColumnsFound: string[];
}

const SUBJECTS_MAP: { keys: string[]; name: string }[] = [
  { keys: ["turkce"], name: "Türkçe" },
  { keys: ["matematik", "mat"], name: "Matematik" },
  { keys: ["fenbilimleri", "fen"], name: "Fen Bilimleri" },
  { keys: ["sosyalbilgiler", "sosyal", "inkilap", "tcinkilap"], name: "Sosyal Bilgiler" },
  { keys: ["ingilizce", "ing"], name: "İngilizce" },
  { keys: ["dinkulturu", "din"], name: "Din Kültürü ve Ahlak Bilgisi" },
];

export function norm(s: unknown): string {
  return String(s ?? "")
    .toLocaleLowerCase("tr")
    .replaceAll("ı", "i")
    .replaceAll("i̇", "i")
    .replaceAll("ş", "s")
    .replaceAll("ğ", "g")
    .replaceAll("ç", "c")
    .replaceAll("ö", "o")
    .replaceAll("ü", "u")
    .replace(/[^a-z0-9]/g, "");
}

function metricOf(normHeader: string, subjKey: string): "correct" | "wrong" | "blank" | null {
  const rest = normHeader.slice(subjKey.length);
  if (rest.startsWith("d") || rest.includes("dogru")) return "correct";
  if (rest.startsWith("y") || rest.includes("yanlis")) return "wrong";
  if (rest.startsWith("b") || rest.includes("bos")) return "blank";
  return null;
}

interface SubjectCols {
  name: string;
  correct?: string;
  wrong?: string;
  blank?: string;
}

/** Başlıklardan ders sütunlarını çıkar. */
function detectSubjectColumns(headers: string[]): Map<string, SubjectCols> {
  const cols = new Map<string, SubjectCols>();
  for (const h of headers) {
    const n = norm(h);
    for (const subj of SUBJECTS_MAP) {
      const key = subj.keys.find((k) => n.startsWith(k));
      if (!key) continue;
      const m = metricOf(n, key);
      if (!m) continue;
      const cur = cols.get(subj.name) ?? { name: subj.name };
      cur[m] = h;
      cols.set(subj.name, cur);
      break;
    }
  }
  return cols;
}

function findHeader(headers: string[], candidates: string[]): string | undefined {
  return headers.find((h) => candidates.includes(norm(h)));
}

function studentFullNameNorm(s: Student): string {
  return norm(`${s.first_name}${s.last_name}`);
}

export function parseExamRows(
  rows: Record<string, unknown>[],
  students: Student[],
  subjects: Subject[],
): ParseResult {
  const validSubjectNames = new Set(subjects.map((s) => s.subject_name));
  const headers = rows.length ? Object.keys(rows[0]) : [];
  const subjectCols = detectSubjectColumns(headers);
  const noHeader = findHeader(headers, ["okulno", "no", "numara", "ogrencino", "ogrencinumarasi"]);
  const nameHeader = findHeader(headers, ["adsoyad", "isimsoyisim", "adsoyisim", "ogrenci", "isim", "adsoyadi"]);
  const adHeader = findHeader(headers, ["ad", "isim"]);
  const soyadHeader = findHeader(headers, ["soyad", "soyisim", "soyadi"]);
  const scoreHeader = findHeader(headers, ["puan", "toplampuan"]);

  const matched: ParsedRow[] = [];
  const unmatched: ParsedRow[] = [];

  rows.forEach((row, i) => {
    const okulNo = noHeader ? String(row[noHeader] ?? "").trim() : "";
    let fullName = nameHeader ? String(row[nameHeader] ?? "").trim() : "";
    if (!fullName && adHeader) {
      fullName = `${String(row[adHeader] ?? "").trim()} ${soyadHeader ? String(row[soyadHeader] ?? "").trim() : ""}`.trim();
    }
    const label = okulNo ? `No ${okulNo}${fullName ? ` · ${fullName}` : ""}` : fullName || `Satır ${i + 2}`;

    // Boş satır atla
    if (!okulNo && !fullName) return;

    // Eşleştir
    let student: Student | undefined;
    let matchedBy: ParsedRow["matchedBy"] = null;
    if (okulNo) {
      student = students.find((s) => s.student_no && s.student_no.trim() === okulNo);
      if (student) matchedBy = "no";
    }
    if (!student && fullName) {
      const target = norm(fullName);
      student = students.find((s) => studentFullNameNorm(s) === target);
      if (student) matchedBy = "isim";
    }

    // Ders kırılımı
    const subjectRows: ExamSubjectInput[] = [];
    for (const [name, cols] of subjectCols) {
      if (!validSubjectNames.has(name)) continue;
      const subjId = subjects.find((s) => s.subject_name === name)?.id;
      if (!subjId) continue;
      const correct = cols.correct ? Number(row[cols.correct]) || 0 : 0;
      const wrong = cols.wrong ? Number(row[cols.wrong]) || 0 : 0;
      const blank = cols.blank ? Number(row[cols.blank]) || 0 : 0;
      if (correct || wrong || blank) {
        subjectRows.push({ subject_id: subjId, correct, wrong, blank });
      }
    }

    const score = scoreHeader ? Number(row[scoreHeader]) || 0 : 0;

    const parsed: ParsedRow = {
      rowIndex: i,
      label,
      studentId: student?.id ?? null,
      studentName: student ? `${student.first_name} ${student.last_name}` : fullName,
      subjects: subjectRows,
      score,
      matchedBy,
    };

    if (student) {
      matched.push(parsed);
    } else {
      parsed.reason = okulNo ? "Okul no eşleşmedi" : "İsim eşleşmedi";
      unmatched.push(parsed);
    }
  });

  return { matched, unmatched, subjectColumnsFound: [...subjectCols.keys()] };
}
