"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { getUserId, nn } from "@/lib/supabase/current-user";
import { qk } from "@/lib/query-keys";
import type { Classroom } from "@/lib/types";
import type { ClassroomInput } from "@/lib/validations";

export interface ClassWithCount extends Classroom {
  student_count: number;
}

export function useClasses() {
  return useQuery({
    queryKey: qk.classes,
    queryFn: async (): Promise<ClassWithCount[]> => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("classes")
        .select("*, students(count)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((c: Record<string, unknown>) => ({
        ...(c as unknown as Classroom),
        student_count: (c.students as { count: number }[] | null)?.[0]?.count ?? 0,
      }));
    },
  });
}

export function useClass(id: string) {
  return useQuery({
    queryKey: qk.classDetail(id),
    enabled: Boolean(id),
    queryFn: async (): Promise<Classroom> => {
      const supabase = createClient();
      const { data, error } = await supabase.from("classes").select("*").eq("id", id).single();
      if (error) throw error;
      return data as Classroom;
    },
  });
}

export function useCreateClass() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: ClassroomInput) => {
      const supabase = createClient();
      const teacher_id = await getUserId();
      const { error } = await supabase.from("classes").insert({
        teacher_id,
        class_name: input.class_name,
        grade_level: input.grade_level,
        school_name: nn(input.school_name),
        description: nn(input.description),
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.classes }),
  });
}

export function useUpdateClass() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: ClassroomInput }) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("classes")
        .update({
          class_name: input.class_name,
          grade_level: input.grade_level,
          school_name: nn(input.school_name),
          description: nn(input.description),
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: qk.classes });
      qc.invalidateQueries({ queryKey: qk.classDetail(v.id) });
    },
  });
}

export function useDeleteClass() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient();
      const { error } = await supabase.from("classes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.classes }),
  });
}
