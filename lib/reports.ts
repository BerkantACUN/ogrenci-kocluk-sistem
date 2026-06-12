/**
 * Raporlama mantığı — PDF Bölüm 11, 12, 14, 18.
 * Sayısal verilerden otomatik Türkçe yorum cümleleri ve lise eşleştirmesi üretir.
 */
import type {
  Student,
  WeeklyRecord,
  ReadingRecord,
  ExamResult,
  HighSchool,
  SubjectStat,
} from "./types";
import {
  subjectStats,
  topicStats,
  strongestWeakest,
  overallTotals,
  successRate,
  totalPages,
  lastExamDelta,
} from "./calc";
import { TARGET_SCHOOL_WINDOW, SUCCESS_THRESHOLDS } from "./constants";
import { formatPercent, formatDelta, formatNumber } from "./utils";

export interface SchoolMatch {
  eligible: HighSchool[]; // puanına eşit/altı taban
  target: HighSchool[]; // puanından +window'a kadar (hedef)
}

/** Öğrencinin son puanına göre yerleşebileceği ve hedefleyebileceği liseler. */
export function matchHighSchools(
  lastScore: number | null,
  schools: HighSchool[],
  window = TARGET_SCHOOL_WINDOW,
): SchoolMatch {
  if (lastScore == null) return { eligible: [], target: [] };
  const eligible = schools
    .filter((s) => s.base_score <= lastScore)
    .sort((a, b) => b.base_score - a.base_score);
  const target = schools
    .filter((s) => s.base_score > lastScore && s.base_score <= lastScore + window)
    .sort((a, b) => a.base_score - b.base_score);
  return { eligible, target };
}

export interface ReportData {
  student: Student;
  periodLabel: string;
  reportType: "weekly" | "monthly";
  startDate: string;
  endDate: string;
  totals: { correct: number; wrong: number; total: number; successRate: number };
  subjects: SubjectStat[];
  bestSubject: SubjectStat | null;
  worstSubject: SubjectStat | null;
  strongestTopics: ReturnType<typeof strongestWeakest>["strongest"];
  weakestTopics: ReturnType<typeof strongestWeakest>["weakest"];
  readingPages: number;
  readingBooks: string[];
  exams: { name: string; date: string; score: number }[];
  lastScore: number | null;
  scoreDelta: number | null;
  successDelta: number | null; // önceki döneme göre başarı değişimi
  comments: string[];
  schoolMatch: SchoolMatch;
}

interface BuildArgs {
  student: Student;
  periodLabel: string;
  reportType: "weekly" | "monthly";
  startDate: string;
  endDate: string;
  records: WeeklyRecord[];
  prevRecords: WeeklyRecord[];
  reading: ReadingRecord[];
  exams: ExamResult[];
  subjectNameById: Map<string, string>;
  schools: HighSchool[];
}

export function buildReport(args: BuildArgs): ReportData {
  const { records, prevRecords, reading, exams, subjectNameById, schools } = args;

  const totals = overallTotals(records);
  const subjects = subjectStats(records, subjectNameById);
  const topics = topicStats(records, subjectNameById);
  const { strongest, weakest } = strongestWeakest(topics);

  const bestSubject = subjects.length
    ? [...subjects].sort((a, b) => b.successRate - a.successRate)[0]
    : null;
  const worstSubject = subjects.length
    ? [...subjects].sort((a, b) => a.successRate - b.successRate)[0]
    : null;

  const prevTotals = overallTotals(prevRecords);
  const successDelta =
    prevRecords.length > 0 ? Math.round((totals.successRate - prevTotals.successRate) * 10) / 10 : null;

  const readingPages = totalPages(reading);
  const readingBooks = [...new Set(reading.map((r) => r.book_name).filter(Boolean))];

  const examList = [...exams]
    .sort((a, b) => a.exam_date.localeCompare(b.exam_date))
    .map((e) => ({ name: e.exam_name, date: e.exam_date, score: e.score }));
  const { last: lastScore, delta: scoreDelta } = lastExamDelta(exams);

  const schoolMatch = matchHighSchools(lastScore, schools);

  const comments = generateComments({
    totals,
    bestSubject,
    worstSubject,
    subjects,
    successDelta,
    readingPages,
    scoreDelta,
    strongest,
    weakest,
  });

  return {
    student: args.student,
    periodLabel: args.periodLabel,
    reportType: args.reportType,
    startDate: args.startDate,
    endDate: args.endDate,
    totals,
    subjects,
    bestSubject,
    worstSubject,
    strongestTopics: strongest,
    weakestTopics: weakest,
    readingPages,
    readingBooks,
    exams: examList,
    lastScore,
    scoreDelta,
    successDelta,
    comments,
    schoolMatch,
  };
}

interface CommentArgs {
  totals: { correct: number; wrong: number; total: number; successRate: number };
  bestSubject: SubjectStat | null;
  worstSubject: SubjectStat | null;
  subjects: SubjectStat[];
  successDelta: number | null;
  readingPages: number;
  scoreDelta: number | null;
  strongest: { subjectName: string; topic: string; successRate: number }[];
  weakest: { subjectName: string; topic: string; successRate: number }[];
}

/** Şablon tabanlı otomatik yorum cümleleri (PDF Bölüm 18). */
export function generateComments(a: CommentArgs): string[] {
  const out: string[] = [];

  if (a.totals.total > 0) {
    out.push(
      `Bu dönem toplam ${formatNumber(a.totals.total)} soru çözülmüş, genel başarı oranı ${formatPercent(
        a.totals.successRate,
      )} olmuştur.`,
    );
  } else {
    out.push("Bu dönem için henüz soru çözüm verisi girilmemiştir.");
  }

  if (a.successDelta != null && a.totals.total > 0) {
    if (a.successDelta > 0) {
      out.push(`Önceki döneme göre başarı oranında ${formatDelta(a.successDelta)} puanlık artış görülmüştür.`);
    } else if (a.successDelta < 0) {
      out.push(`Önceki döneme göre başarı oranında ${formatDelta(a.successDelta)} puanlık düşüş görülmüştür.`);
    } else {
      out.push("Başarı oranı önceki dönemle aynı seviyede kalmıştır.");
    }
  }

  if (a.bestSubject && a.bestSubject.total > 0) {
    out.push(
      `En başarılı olunan ders ${a.bestSubject.subjectName} (${formatPercent(a.bestSubject.successRate)}) olmuştur.`,
    );
  }
  if (a.worstSubject && a.worstSubject.total > 0 && a.worstSubject.successRate < SUCCESS_THRESHOLDS.medium) {
    out.push(
      `${a.worstSubject.subjectName} dersinde başarı oranı ${formatPercent(
        a.worstSubject.successRate,
      )}; bu derste desteklenmesi önerilir.`,
    );
  }

  if (a.weakest.length > 0) {
    const w = a.weakest[0];
    out.push(`${w.subjectName} dersinde "${w.topic}" konusunda (${formatPercent(w.successRate)}) ek çalışma faydalı olacaktır.`);
  }

  if (a.readingPages > 0) {
    out.push(`Bu dönem toplam ${formatNumber(a.readingPages)} sayfa kitap okunmuştur.`);
  }

  if (a.scoreDelta != null) {
    if (a.scoreDelta > 0) {
      out.push(`Son deneme puanı bir önceki denemeye göre ${formatDelta(a.scoreDelta)} puan artmıştır.`);
    } else if (a.scoreDelta < 0) {
      out.push(`Son deneme puanı bir önceki denemeye göre ${formatDelta(a.scoreDelta)} puan düşmüştür.`);
    }
  }

  return out;
}

/** İki ders listesi arasında ders bazlı kısa karşılaştırma (opsiyonel kullanım). */
export function subjectTrendNote(current: SubjectStat[], previous: SubjectStat[]): string[] {
  const prevByName = new Map(previous.map((s) => [s.subjectName, s]));
  const notes: string[] = [];
  for (const s of current) {
    const p = prevByName.get(s.subjectName);
    if (!p || p.total === 0 || s.total === 0) continue;
    const delta = successRate(s.correct, s.wrong) - successRate(p.correct, p.wrong);
    if (Math.abs(delta) >= 5) {
      notes.push(
        `${s.subjectName}: ${delta > 0 ? "artış" : "düşüş"} (${formatDelta(Math.round(delta))} puan).`,
      );
    }
  }
  return notes;
}
