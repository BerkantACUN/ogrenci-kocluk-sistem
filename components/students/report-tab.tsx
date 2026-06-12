"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { FileDown, Mail, Sparkles, School, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Field } from "@/components/ui/field";
import { Tabs } from "@/components/ui/tabs";
import { useHighSchools } from "@/hooks/use-high-schools";
import { subjectNameMap } from "@/hooks/use-subjects";
import { buildReport } from "@/lib/reports";
import { generateReportPdf } from "@/lib/pdf";
import { recentWeeks, recentMonths, monthRange, getWeekForDate } from "@/lib/weeks";
import { formatPercent, formatNumber } from "@/lib/utils";
import { subjectHex } from "@/lib/constants";
import type { Student, WeeklyRecord, ReadingRecord, ExamResult, Subject } from "@/lib/types";
import type { BadgeProps } from "@/components/ui/badge";

interface Props {
  student: Student;
  weekly: WeeklyRecord[];
  reading: ReadingRecord[];
  exams: ExamResult[];
  subjects: Subject[];
}

export function ReportTab({ student, weekly, reading, exams, subjects }: Props) {
  const { data: highSchools } = useHighSchools();
  const map = useMemo(() => subjectNameMap(subjects), [subjects]);

  const weeks = useMemo(() => recentWeeks(16), []);
  const months = useMemo(() => recentMonths(8), []);

  const [type, setType] = useState<"weekly" | "monthly">("weekly");
  const [weekStart, setWeekStart] = useState(weeks[0].start);
  const [monthKey, setMonthKey] = useState(`${months[0].year}-${months[0].monthIndex0}`);

  // Taban puanı yılı (yıl yıl karşılaştırma)
  const schoolYears = useMemo(
    () => [...new Set((highSchools ?? []).map((s) => s.year))].sort((a, b) => b - a),
    [highSchools],
  );
  const [schoolYear, setSchoolYear] = useState<number | null>(null);
  const activeYear = schoolYear ?? schoolYears[0] ?? null;
  const schoolsForYear = useMemo(
    () => (highSchools ?? []).filter((s) => activeYear == null || s.year === activeYear),
    [highSchools, activeYear],
  );

  const report = useMemo(() => {
    if (type === "weekly") {
      const wIdx = weeks.findIndex((w) => w.start === weekStart);
      const w = weeks[wIdx] ?? weeks[0];
      const prev = weeks[wIdx + 1];
      const recs = weekly.filter((r) => r.week_start_date === w.start);
      const prevRecs = prev ? weekly.filter((r) => r.week_start_date === prev.start) : [];
      const read = reading.filter((r) => r.week_start_date === w.start);
      const exs = exams.filter((e) => e.exam_date >= w.start && e.exam_date <= w.end);
      return buildReport({
        student,
        periodLabel: w.label,
        reportType: "weekly",
        startDate: w.start,
        endDate: w.end,
        records: recs,
        prevRecords: prevRecs,
        reading: read,
        exams: exs,
        subjectNameById: map,
        schools: schoolsForYear,
      });
    }
    const [y, m] = monthKey.split("-").map(Number);
    const range = monthRange(y, m);
    const prevRange = monthRange(m === 0 ? y - 1 : y, m === 0 ? 11 : m - 1);
    const inRange = (d: string, r: { start: string; end: string }) => d >= r.start && d <= r.end;
    const recs = weekly.filter((r) => inRange(r.week_start_date, range));
    const prevRecs = weekly.filter((r) => inRange(r.week_start_date, prevRange));
    const read = reading.filter((r) => inRange(r.week_start_date, range));
    const exs = exams.filter((e) => inRange(e.exam_date, range));
    return buildReport({
      student,
      periodLabel: range.label,
      reportType: "monthly",
      startDate: range.start,
      endDate: range.end,
      records: recs,
      prevRecords: prevRecs,
      reading: read,
      exams: exs,
      subjectNameById: map,
      schools: highSchools ?? [],
    });
  }, [type, weekStart, monthKey, weeks, weekly, reading, exams, map, schoolsForYear, student]);

  function downloadPdf() {
    generateReportPdf(report);
    toast.success("PDF indiriliyor… 📄");
  }

  function sendToParent() {
    if (!student.parent_email) {
      toast.error("Bu öğrenci için veli e-postası tanımlı değil.");
      return;
    }
    generateReportPdf(report);
    const subject = `${student.first_name} ${student.last_name} — ${report.periodLabel} Raporu`;
    const body = [
      `Sayın ${student.parent_name ?? "Veli"},`,
      "",
      `${student.first_name} ${student.last_name} için ${report.periodLabel} dönemi raporu:`,
      "",
      ...report.comments.map((c) => `• ${c}`),
      "",
      "Detaylı PDF rapor ektedir (indirilen dosyayı ekleyebilirsiniz).",
    ].join("\n");
    window.location.href = `mailto:${student.parent_email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    toast.success("Mail taslağı açıldı, PDF'i ekleyip gönderebilirsiniz. ✉️");
  }

  return (
    <div className="space-y-5">
      {/* Kontroller */}
      <Card className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <Tabs
              items={[
                { value: "weekly", label: "Haftalık" },
                { value: "monthly", label: "Aylık" },
              ]}
              value={type}
              onChange={(v) => setType(v as "weekly" | "monthly")}
            />
            {type === "weekly" ? (
              <Field label="Hafta">
                <Select value={weekStart} onChange={(e) => setWeekStart(e.target.value)}>
                  {weeks.map((w) => (
                    <option key={w.start} value={w.start}>
                      {w.label}
                    </option>
                  ))}
                </Select>
              </Field>
            ) : (
              <Field label="Ay">
                <Select value={monthKey} onChange={(e) => setMonthKey(e.target.value)}>
                  {months.map((m) => (
                    <option key={`${m.year}-${m.monthIndex0}`} value={`${m.year}-${m.monthIndex0}`}>
                      {m.label}
                    </option>
                  ))}
                </Select>
              </Field>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={sendToParent}>
              <Mail className="h-4 w-4" /> Veliye gönder
            </Button>
            <Button onClick={downloadPdf}>
              <FileDown className="h-4 w-4" /> PDF indir
            </Button>
          </div>
        </div>
      </Card>

      {/* Rapor önizleme */}
      <Card className="p-5">
        <div className="mb-4 flex items-center justify-between border-b border-chalk pb-4">
          <div>
            <h3 className="font-display text-[20px] font-bold text-ink">
              {student.first_name} {student.last_name}
            </h3>
            <p className="text-[12.5px] text-gravel">
              {student.grade_level}. sınıf · {report.reportType === "weekly" ? "Haftalık" : "Aylık"} rapor · {report.periodLabel}
            </p>
          </div>
          <Badge tone="iris">{report.reportType === "weekly" ? "Haftalık" : "Aylık"}</Badge>
        </div>

        {/* Özet */}
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          <Summary label="Toplam soru" value={formatNumber(report.totals.total)} />
          <Summary label="Genel başarı" value={formatPercent(report.totals.successRate)} tone="mint" />
          <Summary label="Okunan sayfa" value={formatNumber(report.readingPages)} tone="peach" />
          <Summary label="Son deneme" value={report.lastScore != null ? String(report.lastScore) : "—"} tone="rose" />
        </div>

        {/* Yorumlar */}
        {report.comments.length > 0 && (
          <div className="mt-5 rounded-card bg-iris-soft/60 p-4">
            <p className="mb-2 flex items-center gap-1.5 text-[13px] font-semibold text-iris">
              <Sparkles className="h-4 w-4" /> Otomatik değerlendirme
            </p>
            <ul className="space-y-1.5">
              {report.comments.map((c, i) => (
                <li key={i} className="flex gap-2 text-[13px] text-graphite">
                  <span className="text-iris">•</span>
                  {c}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Ders tablosu */}
        {report.subjects.length > 0 && (
          <div className="mt-5">
            <p className="mb-2 text-[13px] font-semibold text-ink">Ders bazlı başarı</p>
            <div className="overflow-hidden rounded-card border border-chalk">
              <table className="w-full text-[12.5px]">
                <thead className="bg-cloud/60 text-slate">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">Ders</th>
                    <th className="px-3 py-2 text-right font-medium">Doğru</th>
                    <th className="px-3 py-2 text-right font-medium">Yanlış</th>
                    <th className="px-3 py-2 text-right font-medium">Toplam</th>
                    <th className="px-3 py-2 text-right font-medium">Başarı</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-chalk">
                  {report.subjects.map((s) => (
                    <tr key={s.subjectId}>
                      <td className="px-3 py-2">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full" style={{ background: subjectHex(s.subjectName) }} />
                          {s.subjectName}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right text-mint">{s.correct}</td>
                      <td className="px-3 py-2 text-right text-danger">{s.wrong}</td>
                      <td className="px-3 py-2 text-right text-graphite">{s.total}</td>
                      <td className="px-3 py-2 text-right font-semibold text-iris">{formatPercent(s.successRate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Lise eşleştirme */}
        {report.lastScore != null && (
          <div className="mt-5">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <p className="flex items-center gap-1.5 text-[13px] font-semibold text-ink">
                <School className="h-4 w-4 text-iris" /> Lise eşleştirme (son puan: {report.lastScore})
              </p>
              {schoolYears.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[12px] text-slate">Taban puanı yılı:</span>
                  <select
                    value={activeYear ?? ""}
                    onChange={(e) => setSchoolYear(Number(e.target.value))}
                    className="h-8 rounded-input border border-chalk bg-white px-2 text-[12.5px] text-ink focus:border-iris focus:outline-none"
                  >
                    {schoolYears.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <SchoolList title="Yerleşebileceği liseler" icon={School} items={report.schoolMatch.eligible} tone="mint" />
              <SchoolList title="Hedef liseler" icon={Target} items={report.schoolMatch.target} tone="peach" />
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

function Summary({ label, value, tone = "iris" }: { label: string; value: string; tone?: "iris" | "mint" | "peach" | "rose" }) {
  const colors: Record<string, string> = {
    iris: "text-iris",
    mint: "text-mint",
    peach: "text-[#d77a1f]",
    rose: "text-rose",
  };
  return (
    <div className="rounded-card bg-cloud/50 p-3">
      <p className={`font-display text-[20px] font-bold ${colors[tone]}`}>{value}</p>
      <p className="mt-0.5 text-[11.5px] text-gravel">{label}</p>
    </div>
  );
}

function SchoolList({
  title,
  items,
  tone,
}: {
  title: string;
  icon: typeof School;
  items: {
    id: string;
    school_name: string;
    city: string;
    district: string | null;
    base_score: number;
    percentile?: number | null;
  }[];
  tone: BadgeProps["tone"];
}) {
  return (
    <div className="rounded-card border border-chalk p-3">
      <p className="mb-2 text-[12px] font-semibold text-graphite">{title}</p>
      {items.length === 0 ? (
        <p className="text-[12px] text-slate">Uygun lise bulunamadı.</p>
      ) : (
        <ul className="space-y-1.5">
          {items.slice(0, 5).map((h) => (
            <li key={h.id} className="flex items-center justify-between gap-2">
              <span className="min-w-0">
                <span className="block truncate text-[12.5px] text-ink">{h.school_name}</span>
                <span className="text-[11px] text-slate">
                  {h.city}
                  {h.district ? ` / ${h.district}` : ""}
                  {h.percentile != null ? ` · %${formatNumber(h.percentile, 2)} dilim` : ""}
                </span>
              </span>
              <Badge tone={tone}>{formatNumber(h.base_score, 2)}</Badge>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
