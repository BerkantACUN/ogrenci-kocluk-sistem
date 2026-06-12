"use client";

import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TabItem {
  value: string;
  label: string;
  icon?: LucideIcon;
}

interface TabsProps {
  items: TabItem[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function Tabs({ items, value, onChange, className }: TabsProps) {
  return (
    <div
      className={cn(
        "flex gap-1 overflow-x-auto rounded-pill border border-chalk bg-white p-1 shadow-soft",
        className,
      )}
    >
      {items.map((it) => {
        const active = it.value === value;
        const Icon = it.icon;
        return (
          <button
            key={it.value}
            onClick={() => onChange(it.value)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-pill px-4 py-2 text-[13px] font-medium transition-all duration-200",
              active ? "bg-iris text-white shadow-soft" : "text-gravel hover:bg-cloud hover:text-ink",
            )}
          >
            {Icon && <Icon className="h-4 w-4" strokeWidth={2} />}
            {it.label}
          </button>
        );
      })}
    </div>
  );
}
