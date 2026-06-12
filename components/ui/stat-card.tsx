"use client";

import { animated, useSpring } from "@react-spring/web";
import { type LucideIcon } from "lucide-react";
import { cn, formatNumber } from "@/lib/utils";

type Tone = "iris" | "mint" | "peach" | "sky" | "rose" | "lemon";

const TONE_BG: Record<Tone, string> = {
  iris: "bg-iris-soft text-iris",
  mint: "bg-mint-soft text-mint",
  peach: "bg-peach-soft text-[#d77a1f]",
  sky: "bg-sky-soft text-sky",
  rose: "bg-rose-soft text-rose",
  lemon: "bg-lemon-soft text-[#b8860b]",
};

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: number;
  /** %, sayfa gibi son ek. */
  suffix?: string;
  prefix?: string;
  tone?: Tone;
  delta?: number | null;
  className?: string;
}

export function StatCard({
  icon: Icon,
  label,
  value,
  suffix,
  prefix,
  tone = "iris",
  delta,
  className,
}: StatCardProps) {
  const spring = useSpring({
    from: { val: 0 },
    to: { val: value },
    config: { tension: 120, friction: 20 },
  });

  return (
    <div className={cn("rounded-card border border-chalk bg-white p-4 shadow-soft lift", className)}>
      <div className="flex items-center justify-between">
        <span className={cn("inline-flex h-9 w-9 items-center justify-center rounded-input", TONE_BG[tone])}>
          <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
        </span>
        {delta != null && delta !== 0 && (
          <span
            className={cn(
              "rounded-pill px-2 py-0.5 text-[11px] font-semibold",
              delta > 0 ? "bg-mint-soft text-mint" : "bg-danger-soft text-danger",
            )}
          >
            {delta > 0 ? "▲" : "▼"} {formatNumber(Math.abs(delta), 0)}
          </span>
        )}
      </div>
      <div className="mt-3 font-display text-[26px] font-bold leading-none text-ink">
        {prefix}
        <animated.span>{spring.val.to((v) => formatNumber(Math.round(v)))}</animated.span>
        {suffix && <span className="ml-0.5 text-[16px] text-gravel">{suffix}</span>}
      </div>
      <p className="mt-1.5 text-[12px] text-gravel">{label}</p>
    </div>
  );
}
