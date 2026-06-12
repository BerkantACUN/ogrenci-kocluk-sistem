"use client";

import { useMemo } from "react";
import { Select } from "@/components/ui/select";
import { recentWeeks, type WeekRange } from "@/lib/weeks";

interface WeekSelectProps {
  value: string; // week_start_date
  onChange: (week: WeekRange) => void;
  id?: string;
}

export function WeekSelect({ value, onChange, id }: WeekSelectProps) {
  const weeks = useMemo(() => recentWeeks(20), []);

  return (
    <Select
      id={id}
      value={value}
      onChange={(e) => {
        const w = weeks.find((x) => x.start === e.target.value);
        if (w) onChange(w);
      }}
    >
      {weeks.map((w, i) => (
        <option key={w.start} value={w.start}>
          {i === 0 ? "Bu hafta · " : i === 1 ? "Geçen hafta · " : ""}
          {w.label}
        </option>
      ))}
    </Select>
  );
}
