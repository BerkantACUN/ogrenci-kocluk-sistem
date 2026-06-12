import { cva, type VariantProps } from "class-variance-authority";
import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-pill px-2.5 py-0.5 text-[12px] font-medium leading-5",
  {
    variants: {
      tone: {
        neutral: "bg-cloud text-graphite",
        iris: "bg-iris-soft text-iris",
        mint: "bg-mint-soft text-mint",
        peach: "bg-peach-soft text-peach",
        sky: "bg-sky-soft text-sky",
        rose: "bg-rose-soft text-rose",
        lemon: "bg-lemon-soft text-[#b8860b]",
        danger: "bg-danger-soft text-danger",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}
