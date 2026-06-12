"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { qk } from "@/lib/query-keys";
import type { Profile } from "@/lib/types";

/** Yönetici paneli — sistemdeki öğretmenler (RLS: yalnızca admin görür). */
export function useTeachers() {
  return useQuery({
    queryKey: qk.teachers,
    queryFn: async (): Promise<Profile[]> => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Profile[];
    },
  });
}
