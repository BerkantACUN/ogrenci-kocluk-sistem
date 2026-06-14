"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { getUserId, nn } from "@/lib/supabase/current-user";
import { qk } from "@/lib/query-keys";
import type { Student } from "@/lib/types";
import type { StudentInput } from "@/lib/validations";

export function useStudents(classId?: string) {
  return useQuery({
    queryKey: qk.students(classId),
    queryFn: async (): Promise<Student[]> => {
      const supabase = createClient();
      let query = supabase.from("students").select("*").order("first_name", { ascending: true });
      if (classId) query = query.eq("class_id", classId);
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as Student[];
    },
  });
}

export function useStudent(id: string) {
  return useQuery({
    queryKey: qk.student(id),
    enabled: Boolean(id),
    queryFn: async (): Promise<Student> => {
      const supabase = createClient();
      const { data, error } = await supabase.from("students").select("*").eq("id", id).single();
      if (error) throw error;
      return data as Student;
    },
  });
}

function toPayload(input: StudentInput) {
  return {
    first_name: input.first_name,
    last_name: input.last_name,
    grade_level: input.grade_level,
    class_id: input.class_id ?? null,
    school_name: nn(input.school_name),
    student_no: nn(input.student_no),
    target_high_school_id: input.target_high_school_id ?? null,
    parent_name: nn(input.parent_name),
    parent_email: nn(input.parent_email),
    parent_phone: nn(input.parent_phone),
    note: nn(input.note),
  };
}

export function useCreateStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: StudentInput) => {
      const supabase = createClient();
      const teacher_id = await getUserId();
      const { error } = await supabase.from("students").insert({ teacher_id, ...toPayload(input) });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["students"] });
      qc.invalidateQueries({ queryKey: qk.classes });
    },
  });
}

export function useUpdateStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: StudentInput }) => {
      const supabase = createClient();
      const { error } = await supabase.from("students").update(toPayload(input)).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ["students"] });
      qc.invalidateQueries({ queryKey: qk.student(v.id) });
    },
  });
}

export function useDeleteStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient();
      const { error } = await supabase.from("students").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["students"] });
      qc.invalidateQueries({ queryKey: qk.classes });
    },
  });
}
