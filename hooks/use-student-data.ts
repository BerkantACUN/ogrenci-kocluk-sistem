"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { getUserId, nn } from "@/lib/supabase/current-user";
import { qk } from "@/lib/query-keys";
import type { WeeklyRecord, ReadingRecord, ExamResult } from "@/lib/types";
import type { WeeklyRecordInput, ReadingRecordInput } from "@/lib/validations";

/* ---------------- Haftalık ders kayıtları ---------------- */

export function useWeeklyRecords(studentId: string) {
  return useQuery({
    queryKey: qk.weekly(studentId),
    enabled: Boolean(studentId),
    queryFn: async (): Promise<WeeklyRecord[]> => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("weekly_records")
        .select("*")
        .eq("student_id", studentId)
        .order("week_start_date", { ascending: false });
      if (error) throw error;
      return (data ?? []) as WeeklyRecord[];
    },
  });
}

export function useCreateWeeklyRecord(studentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: WeeklyRecordInput) => {
      const supabase = createClient();
      const teacher_id = await getUserId();
      const { error } = await supabase.from("weekly_records").insert({
        student_id: studentId,
        teacher_id,
        week_start_date: input.week_start_date,
        week_end_date: input.week_end_date,
        subject_id: input.subject_id,
        topic: nn(input.topic),
        correct_count: input.correct_count,
        wrong_count: input.wrong_count,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.weekly(studentId) }),
  });
}

export function useDeleteWeeklyRecord(studentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient();
      const { error } = await supabase.from("weekly_records").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.weekly(studentId) }),
  });
}

/* ---------------- Kitap okuma kayıtları ---------------- */

export function useReadingRecords(studentId: string) {
  return useQuery({
    queryKey: qk.reading(studentId),
    enabled: Boolean(studentId),
    queryFn: async (): Promise<ReadingRecord[]> => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("reading_records")
        .select("*")
        .eq("student_id", studentId)
        .order("week_start_date", { ascending: false });
      if (error) throw error;
      return (data ?? []) as ReadingRecord[];
    },
  });
}

export function useCreateReading(studentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: ReadingRecordInput) => {
      const supabase = createClient();
      const teacher_id = await getUserId();
      const { error } = await supabase.from("reading_records").insert({
        student_id: studentId,
        teacher_id,
        week_start_date: input.week_start_date,
        week_end_date: input.week_end_date,
        book_name: input.book_name,
        page_count: input.page_count,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.reading(studentId) }),
  });
}

export function useDeleteReading(studentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient();
      const { error } = await supabase.from("reading_records").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.reading(studentId) }),
  });
}

/* ---------------- Deneme sınavı sonuçları ---------------- */

export function useExams(studentId: string) {
  return useQuery({
    queryKey: qk.exams(studentId),
    enabled: Boolean(studentId),
    queryFn: async (): Promise<ExamResult[]> => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("exam_results")
        .select("*, exam_subject_results(*)")
        .eq("student_id", studentId)
        .order("exam_date", { ascending: false });
      if (error) throw error;
      return (data ?? []) as ExamResult[];
    },
  });
}

export interface ExamSubjectInput {
  subject_id: string;
  correct: number;
  wrong: number;
  blank: number;
}

export interface ExamCreateInput {
  exam_name: string;
  exam_date: string;
  exam_type: string;
  score: number;
  subjects: ExamSubjectInput[];
}

export function useCreateExam(studentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: ExamCreateInput) => {
      const supabase = createClient();
      const teacher_id = await getUserId();
      const { data: exam, error } = await supabase
        .from("exam_results")
        .insert({
          student_id: studentId,
          teacher_id,
          exam_name: input.exam_name,
          exam_date: input.exam_date,
          exam_type: nn(input.exam_type),
          score: input.score,
        })
        .select("id")
        .single();
      if (error) throw error;

      const rows = input.subjects
        .filter((s) => s.subject_id)
        .map((s) => ({
          exam_id: exam.id,
          teacher_id,
          subject_id: s.subject_id,
          correct: s.correct,
          wrong: s.wrong,
          blank: s.blank,
        }));
      if (rows.length) {
        const { error: e2 } = await supabase.from("exam_subject_results").insert(rows);
        if (e2) throw e2;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.exams(studentId) }),
  });
}

export function useDeleteExam(studentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient();
      const { error } = await supabase.from("exam_results").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.exams(studentId) }),
  });
}
