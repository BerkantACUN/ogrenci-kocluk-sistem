"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { nn } from "@/lib/supabase/current-user";
import { qk } from "@/lib/query-keys";
import type { HighSchool } from "@/lib/types";
import type { HighSchoolInput } from "@/lib/validations";

export function useHighSchools() {
  return useQuery({
    queryKey: qk.highSchools,
    queryFn: async (): Promise<HighSchool[]> => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("high_schools")
        .select("*")
        .order("base_score", { ascending: false });
      if (error) throw error;
      return (data ?? []) as HighSchool[];
    },
  });
}

function toPayload(input: HighSchoolInput) {
  return {
    school_name: input.school_name,
    city: input.city,
    district: nn(input.district),
    school_type: nn(input.school_type),
    base_score: input.base_score,
    percentile: input.percentile ?? null,
    quota: input.quota ?? null,
    year: input.year,
  };
}

export function useCreateHighSchool() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ input, teacherId }: { input: HighSchoolInput; teacherId: string | null }) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("high_schools")
        .insert({ ...toPayload(input), teacher_id: teacherId });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.highSchools }),
  });
}

export function useUpdateHighSchool() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: HighSchoolInput }) => {
      const supabase = createClient();
      const { error } = await supabase.from("high_schools").update(toPayload(input)).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.highSchools }),
  });
}

export function useDeleteHighSchool() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient();
      const { error } = await supabase.from("high_schools").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.highSchools }),
  });
}
