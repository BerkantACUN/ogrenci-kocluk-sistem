import dayjs from "dayjs";
import "dayjs/locale/tr";

dayjs.locale("tr");

export interface WeekRange {
  start: string; // yyyy-mm-dd (Pazartesi)
  end: string; // yyyy-mm-dd (Pazar)
  label: string; // "12 – 18 May 2026"
  shortLabel: string; // "12–18 May"
}

/** Verilen tarihin içinde bulunduğu haftanın Pazartesi'sine git. */
function mondayOf(date: dayjs.Dayjs): dayjs.Dayjs {
  const day = date.day(); // 0=Pazar ... 6=Cumartesi
  const diff = day === 0 ? -6 : 1 - day;
  return date.add(diff, "day").startOf("day");
}

export function toISODate(date: Date | string | dayjs.Dayjs): string {
  return dayjs(date).format("YYYY-MM-DD");
}

/** Bir tarihe ait Pazartesi–Pazar hafta aralığı. */
export function getWeekForDate(date: Date | string = new Date()): WeekRange {
  const start = mondayOf(dayjs(date));
  const end = start.add(6, "day");
  return buildRange(start, end);
}

function buildRange(start: dayjs.Dayjs, end: dayjs.Dayjs): WeekRange {
  const sameMonth = start.month() === end.month();
  const shortLabel = sameMonth
    ? `${start.format("D")}–${end.format("D MMM")}`
    : `${start.format("D MMM")} – ${end.format("D MMM")}`;
  return {
    start: start.format("YYYY-MM-DD"),
    end: end.format("YYYY-MM-DD"),
    label: `${start.format("D")} – ${end.format("D MMMM YYYY")}`,
    shortLabel,
  };
}

/** Bugünden geriye doğru N hafta (en yeni başta). */
export function recentWeeks(count = 16): WeekRange[] {
  const weeks: WeekRange[] = [];
  let cursor = mondayOf(dayjs());
  for (let i = 0; i < count; i++) {
    const end = cursor.add(6, "day");
    weeks.push(buildRange(cursor, end));
    cursor = cursor.subtract(7, "day");
  }
  return weeks;
}

export function currentWeek(): WeekRange {
  return getWeekForDate(new Date());
}

/** Ay aralığı (rapor için). */
export function monthRange(year: number, monthIndex0: number): { start: string; end: string; label: string } {
  const start = dayjs(new Date(year, monthIndex0, 1));
  const end = start.endOf("month");
  return {
    start: start.format("YYYY-MM-DD"),
    end: end.format("YYYY-MM-DD"),
    label: start.format("MMMM YYYY"),
  };
}

/** Son N ayı listele (en yeni başta). */
export function recentMonths(count = 12): { year: number; monthIndex0: number; label: string }[] {
  const months = [];
  let cursor = dayjs().startOf("month");
  for (let i = 0; i < count; i++) {
    months.push({ year: cursor.year(), monthIndex0: cursor.month(), label: cursor.format("MMMM YYYY") });
    cursor = cursor.subtract(1, "month");
  }
  return months;
}

export function formatDate(date: string | Date): string {
  return dayjs(date).format("D MMMM YYYY");
}

export function formatDateShort(date: string | Date): string {
  return dayjs(date).format("DD.MM.YYYY");
}
