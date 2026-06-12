import { initials, cn } from "@/lib/utils";

interface AvatarProps {
  first: string;
  last?: string;
  className?: string;
  /** İsme göre sabit pastel arka plan üret. */
  colorSeed?: string;
}

const PALETTE = [
  ["#efecfd", "#6c5ce7"],
  ["#e2f7ef", "#2fbf91"],
  ["#fff1e1", "#d77a1f"],
  ["#e6f2ff", "#4aa3ff"],
  ["#ffe9f1", "#ff6b9d"],
  ["#fdf3dc", "#b8860b"],
];

function hashIndex(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h % PALETTE.length;
}

export function Avatar({ first, last, className, colorSeed }: AvatarProps) {
  const [bg, fg] = PALETTE[hashIndex(colorSeed ?? first + (last ?? ""))];
  return (
    <span
      className={cn(
        "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-pill font-display text-[13px] font-bold",
        className,
      )}
      style={{ backgroundColor: bg, color: fg }}
    >
      {initials(first, last)}
    </span>
  );
}
