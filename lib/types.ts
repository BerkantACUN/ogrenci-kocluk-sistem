/**
 * Çekirdek alan (domain) tipleri.
 * Supabase tablo satırlarıyla birebir uyumlu — `supabase/migrations` ile senkron tutulur.
 */

export type UserRole = "teacher" | "admin";
export type ReportType = "weekly" | "monthly";

export interface Profile {
  id: string;
  name: string;
  surname: string;
  email: string;
  role: UserRole;
  phone: string | null;
  branch: string | null;
  school_name: string | null;
  created_at: string;
}

export interface Classroom {
  id: string;
  teacher_id: string;
  class_name: string;
  grade_level: number;
  school_name: string | null;
  description: string | null;
  created_at: string;
}

export interface Student {
  id: string;
  class_id: string | null;
  teacher_id: string;
  first_name: string;
  last_name: string;
  grade_level: number;
  school_name: string | null;
  student_no: string | null;
  target_high_school_id: string | null;
  parent_name: string | null;
  parent_email: string | null;
  parent_phone: string | null;
  note: string | null;
  created_at: string;
}

export interface Subject {
  id: string;
  subject_name: string;
  sort_order: number;
}

export interface WeeklyRecord {
  id: string;
  student_id: string;
  teacher_id: string;
  week_start_date: string; // ISO date (yyyy-mm-dd)
  week_end_date: string;
  subject_id: string;
  topic: string | null;
  correct_count: number;
  wrong_count: number;
  total_count: number;
  success_rate: number; // 0-100
  created_at: string;
}

export interface ReadingRecord {
  id: string;
  student_id: string;
  teacher_id: string;
  week_start_date: string;
  week_end_date: string;
  book_name: string;
  page_count: number;
  created_at: string;
}

export interface ExamSubjectResult {
  id: string;
  exam_id: string;
  teacher_id: string;
  subject_id: string;
  correct: number;
  wrong: number;
  blank: number;
  net: number; // generated: correct - wrong/3
  created_at: string;
}

export interface ExamResult {
  id: string;
  student_id: string;
  teacher_id: string;
  exam_name: string;
  exam_date: string;
  exam_type: string | null;
  score: number;
  created_at: string;
  /** Ders bazlı doğru/yanlış/boş kırılımı (varsa). */
  exam_subject_results?: ExamSubjectResult[];
}

export interface HighSchool {
  id: string;
  teacher_id: string | null; // null = global (sistem/yönetici)
  school_name: string;
  city: string;
  district: string | null;
  school_type: string | null;
  base_score: number;
  percentile: number | null;
  quota: number | null;
  year: number;
  created_at: string;
}

export interface ReportRecord {
  id: string;
  student_id: string;
  teacher_id: string;
  report_type: ReportType;
  start_date: string;
  end_date: string;
  pdf_url: string | null;
  sent_to_parent: boolean;
  created_at: string;
}

/* ---------- Türetilmiş (analiz) tipleri ---------- */

export interface SubjectStat {
  subjectId: string;
  subjectName: string;
  correct: number;
  wrong: number;
  total: number;
  successRate: number;
}

export interface TopicStat {
  subjectName: string;
  topic: string;
  correct: number;
  wrong: number;
  total: number;
  successRate: number;
}

export interface WeeklyTotals {
  weekStart: string;
  weekEnd: string;
  label: string;
  correct: number;
  wrong: number;
  total: number;
  successRate: number;
}
