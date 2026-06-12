/**
 * Hesaplama motoru — PDF Bölüm 17 mantığı.
 * Tüm fonksiyonlar saf (pure): veri alır, yeni nesne döndürür.
 */
import type {
  WeeklyRecord,
  ReadingRecord,
  ExamResult,
  ExamSubjectResult,
  SubjectStat,
  TopicStat,
  WeeklyTotals,
} from "./types";
import { getWeekForDate } from "./weeks";
import { NET_WRONG_DIVISOR } from "./constants";

/** Tek ders için net (LGS: doğru - yanlış/3). */
export function netOf(correct: number, wrong: number): number {
  return Math.round((correct - wrong / NET_WRONG_DIVISOR) * 100) / 100;
}

/** Bir denemenin ders kırılımından toplam doğru/yanlış/boş/net. */
export function examTotals(rows: ExamSubjectResult[]) {
  const correct = rows.reduce((s, r) => s + r.correct, 0);
  const wrong = rows.reduce((s, r) => s + r.wrong, 0);
  const blank = rows.reduce((s, r) => s + r.blank, 0);
  const net = Math.round((correct - wrong / NET_WRONG_DIVISOR) * 100) / 100;
  return { correct, wrong, blank, net, totalQuestions: correct + wrong + blank };
}

/** Toplam soru = doğru + yanlış. */
export function totalQuestions(correct: number, wrong: number): number {
  return correct + wrong;
}

/** Başarı yüzdesi = doğru / toplam x 100. Toplam 0 ise 0. */
export function successRate(correct: number, wrong: number): number {
  const total = correct + wrong;
  if (total === 0) return 0;
  return Math.round((correct / total) * 1000) / 10; // 1 ondalık
}

/** Ders bazlı toplamlar. */
export function subjectStats(
  records: WeeklyRecord[],
  subjectNameById: Map<string, string>,
): SubjectStat[] {
  const acc = new Map<string, SubjectStat>();
  for (const r of records) {
    const name = subjectNameById.get(r.subject_id) ?? "Bilinmeyen";
    const cur =
      acc.get(r.subject_id) ??
      ({
        subjectId: r.subject_id,
        subjectName: name,
        correct: 0,
        wrong: 0,
        total: 0,
        successRate: 0,
      } satisfies SubjectStat);
    cur.correct += r.correct_count;
    cur.wrong += r.wrong_count;
    cur.total += r.total_count;
    acc.set(r.subject_id, cur);
  }
  return [...acc.values()]
    .map((s) => ({ ...s, successRate: successRate(s.correct, s.wrong) }))
    .sort((a, b) => b.total - a.total);
}

/** Konu bazlı performans (ders + konu kırılımı). */
export function topicStats(
  records: WeeklyRecord[],
  subjectNameById: Map<string, string>,
): TopicStat[] {
  const acc = new Map<string, TopicStat>();
  for (const r of records) {
    if (!r.topic) continue;
    const subjectName = subjectNameById.get(r.subject_id) ?? "Bilinmeyen";
    const key = `${subjectName}::${r.topic}`;
    const cur =
      acc.get(key) ??
      ({ subjectName, topic: r.topic, correct: 0, wrong: 0, total: 0, successRate: 0 } satisfies TopicStat);
    cur.correct += r.correct_count;
    cur.wrong += r.wrong_count;
    cur.total += r.total_count;
    acc.set(key, cur);
  }
  return [...acc.values()].map((t) => ({ ...t, successRate: successRate(t.correct, t.wrong) }));
}

/** En güçlü ve en zayıf konular (en az minTotal soru çözülmüş olanlar). */
export function strongestWeakest(topics: TopicStat[], minTotal = 5) {
  const eligible = topics.filter((t) => t.total >= minTotal);
  const sorted = [...eligible].sort((a, b) => b.successRate - a.successRate);
  return {
    strongest: sorted.slice(0, 3),
    weakest: [...sorted].reverse().slice(0, 3),
  };
}

/** Haftalık zaman serisi (grafik için). */
export function weeklyTotalsSeries(records: WeeklyRecord[]): WeeklyTotals[] {
  const acc = new Map<string, WeeklyTotals>();
  for (const r of records) {
    const cur =
      acc.get(r.week_start_date) ??
      ({
        weekStart: r.week_start_date,
        weekEnd: r.week_end_date,
        label: getWeekForDate(r.week_start_date).shortLabel,
        correct: 0,
        wrong: 0,
        total: 0,
        successRate: 0,
      } satisfies WeeklyTotals);
    cur.correct += r.correct_count;
    cur.wrong += r.wrong_count;
    cur.total += r.total_count;
    acc.set(r.week_start_date, cur);
  }
  return [...acc.values()]
    .map((w) => ({ ...w, successRate: successRate(w.correct, w.wrong) }))
    .sort((a, b) => a.weekStart.localeCompare(b.weekStart));
}

/** Genel toplam (verilen kayıtlar üzerinden). */
export function overallTotals(records: WeeklyRecord[]) {
  const correct = records.reduce((s, r) => s + r.correct_count, 0);
  const wrong = records.reduce((s, r) => s + r.wrong_count, 0);
  const total = records.reduce((s, r) => s + r.total_count, 0);
  return { correct, wrong, total, successRate: successRate(correct, wrong) };
}

/** Bir haftaya ait kayıtları filtrele. */
export function recordsForWeek(records: WeeklyRecord[], weekStart: string): WeeklyRecord[] {
  return records.filter((r) => r.week_start_date === weekStart);
}

/** İki başarı yüzdesi arasındaki değişim (puan). */
export function rateChange(current: number, previous: number): number {
  return Math.round((current - previous) * 10) / 10;
}

/** Okuma toplamı (sayfa). */
export function totalPages(records: ReadingRecord[]): number {
  return records.reduce((s, r) => s + r.page_count, 0);
}

/** Okuma haftalık serisi. */
export function readingSeries(records: ReadingRecord[]) {
  const acc = new Map<string, { weekStart: string; label: string; pages: number }>();
  for (const r of records) {
    const cur = acc.get(r.week_start_date) ?? {
      weekStart: r.week_start_date,
      label: getWeekForDate(r.week_start_date).shortLabel,
      pages: 0,
    };
    cur.pages += r.page_count;
    acc.set(r.week_start_date, cur);
  }
  return [...acc.values()].sort((a, b) => a.weekStart.localeCompare(b.weekStart));
}

/** Deneme serisi (tarihe göre artan). */
export function examSeries(exams: ExamResult[]) {
  return [...exams]
    .sort((a, b) => a.exam_date.localeCompare(b.exam_date))
    .map((e) => ({ id: e.id, name: e.exam_name, date: e.exam_date, score: e.score }));
}

/** Ders kırılımı olan denemelerin ortalama neti. */
export function avgNet(exams: ExamResult[]): number | null {
  const withRows = exams.filter((e) => (e.exam_subject_results?.length ?? 0) > 0);
  if (!withRows.length) return null;
  const sum = withRows.reduce((s, e) => s + examTotals(e.exam_subject_results ?? []).net, 0);
  return Math.round((sum / withRows.length) * 100) / 100;
}

/** Son deneme - bir önceki deneme farkı. */
export function lastExamDelta(exams: ExamResult[]): { last: number | null; delta: number | null } {
  const sorted = examSeries(exams);
  if (sorted.length === 0) return { last: null, delta: null };
  const last = sorted[sorted.length - 1].score;
  if (sorted.length === 1) return { last, delta: null };
  const prev = sorted[sorted.length - 2].score;
  return { last, delta: last - prev };
}
