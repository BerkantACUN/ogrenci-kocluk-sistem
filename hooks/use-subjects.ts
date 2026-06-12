"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { qk } from "@/lib/query-keys";
import type { Subject } from "@/lib/types";

export function useSubjects() {
  return useQuery({
    queryKey: qk.subjects,
    staleTime: 1000 * 60 * 60,
    queryFn: async (): Promise<Subject[]> => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("subjects")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Subject[];
    },
  });
}

/** subject_id -> subject_name eşlemesi (hesaplamalarda kullanılır). */
export function subjectNameMap(subjects: Subject[]): Map<string, string> {
  return new Map(subjects.map((s) => [s.id, s.subject_name]));
}
