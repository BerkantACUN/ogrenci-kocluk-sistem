import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Tailwind sınıflarını güvenle birleştir. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Tam sayı / ondalık biçimlendirme (tr). */
export function formatNumber(value: number, fractionDigits = 0): string {
  return new Intl.NumberFormat("tr-TR", {
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: fractionDigits,
  }).format(value);
}

/** Yüzde biçimlendirme: 76.4 -> "%76". */
export function formatPercent(value: number, fractionDigits = 0): string {
  return `%${formatNumber(value, fractionDigits)}`;
}

/** İşaretli değişim: 8 -> "+8", -3 -> "-3". */
export function formatDelta(value: number, fractionDigits = 0): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${formatNumber(value, fractionDigits)}`;
}

/** İsim baş harfleri (avatar için). */
export function initials(first: string, last?: string): string {
  const a = first?.trim()?.[0] ?? "";
  const b = last?.trim()?.[0] ?? "";
  return (a + b).toUpperCase() || "?";
}

/** Bir diziyi anahtar fonksiyonuna göre grupla. */
export function groupBy<T, K extends string | number>(
  items: T[],
  keyFn: (item: T) => K,
): Map<K, T[]> {
  const map = new Map<K, T[]>();
  for (const item of items) {
    const key = keyFn(item);
    const arr = map.get(key);
    if (arr) arr.push(item);
    else map.set(key, [item]);
  }
  return map;
}
