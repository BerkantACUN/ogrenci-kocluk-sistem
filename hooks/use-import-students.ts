"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { getUserId } from "@/lib/supabase/current-user";
import { qk } from "@/lib/query-keys";
import type { StudentImportRow } from "@/lib/excel-import";

/** Excel'den ayrıştırılmış öğrencileri tek seferde sınıfa ekler. */
export function useImportStudents(classId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (rows: StudentImportRow[]) => {
      const supabase = createClient();
      const teacher_id = await getUserId();
      const payload = rows.map((r) => ({
        class_id: classId,
        teacher_id,
        first_name: r.first_name,
        last_name: r.last_name,
        grade_level: r.grade_level,
        school_name: r.school_name,
        student_no: r.student_no,
        parent_name: r.parent_name,
        parent_email: r.parent_email,
        parent_phone: r.parent_phone,
        note: r.note,
      }));
      const { error } = await supabase.from("students").insert(payload);
      if (error) throw error;
      return payload.length;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["students"] });
      qc.invalidateQueries({ queryKey: qk.classes });
    },
  });
}
