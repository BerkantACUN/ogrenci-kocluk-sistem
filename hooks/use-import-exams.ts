"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { getUserId, nn } from "@/lib/supabase/current-user";
import type { ParsedRow } from "@/lib/excel-import";

interface ImportArgs {
  exam_name: string;
  exam_date: string;
  exam_type: string;
  rows: ParsedRow[]; // yalnızca eşleşmiş satırlar (studentId dolu)
}

/** Excel'den eşleşmiş öğrencilere toplu deneme + ders kırılımı yazar. */
export function useImportClassExams() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ exam_name, exam_date, exam_type, rows }: ImportArgs) => {
      const supabase = createClient();
      const teacher_id = await getUserId();
      let count = 0;
      for (const r of rows) {
        if (!r.studentId) continue;
        const { data: exam, error } = await supabase
          .from("exam_results")
          .insert({
            student_id: r.studentId,
            teacher_id,
            exam_name,
            exam_date,
            exam_type: nn(exam_type),
            score: r.score,
          })
          .select("id")
          .single();
        if (error) throw error;

        if (r.subjects.length) {
          const subjectRows = r.subjects.map((s) => ({ exam_id: exam.id, teacher_id, ...s }));
          const { error: e2 } = await supabase.from("exam_subject_results").insert(subjectRows);
          if (e2) throw e2;
        }
        count++;
      }
      return count;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["exams"] });
    },
  });
}
