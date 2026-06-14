"use client";

import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  FileDown,
  Mail,
  Sparkles,
  School,
  Target,
  ListChecks,
  CheckCircle2,
  XCircle,
  BookOpen,
  TrendingUp,
  TrendingDown,
  Sigma,
  Trophy,
  AlertTriangle,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Field } from "@/components/ui/field";
import { Tabs } from "@/components/ui/tabs";
import { Avatar } from "@/components/ui/avatar";
import {
  SubjectRadarChart,
  AccuracyDonut,
  SubjectSuccessChart,
  ExamScoreChart,
} from "@/components/charts/student-charts";
import { FadeIn } from "@/components/motion/fade-in";
import { useHighSchools } from "@/hooks/use-high-schools";
import { subjectNameMap } from "@/hooks/use-subjects";
import { buildReport } from "@/lib/reports";
import { captureElementToPdf } from "@/lib/pdf-capture";
import { avgNet } from "@/lib/calc";
import { recentWeeks, recentMonths, monthRange, formatDateShort } from "@/lib/weeks";
import { formatPercent, formatNumber, formatDelta } from "@/lib/utils";
import { subjectHex } from "@/lib/constants";
import type { Student, WeeklyRecord, ReadingRecord, ExamResult, Subject, SubjectStat } from "@/lib/types";
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
      schools: schoolsForYear,
    });
  }, [type, weekStart, monthKey, weeks, weekly, reading, exams, map, schoolsForYear, student]);

  const periodExams = useMemo(
    () => exams.filter((e) => e.exam_date >= report.startDate && e.exam_date <= report.endDate),
    [exams, report.startDate, report.endDate],
  );
  const periodAvgNet = useMemo(() => avgNet(periodExams), [periodExams]);

  const targetSchool = useMemo(
    () => (highSchools ?? []).find((h) => h.id === student.target_high_school_id) ?? null,
    [highSchools, student.target_high_school_id],
  );

  const reportRef = useRef<HTMLDivElement>(null);

  function fileName() {
    return `${student.first_name}_${student.last_name}_${report.periodLabel}`.replace(/\s+/g, "_") + ".pdf";
  }

  async function downloadPdf() {
    if (!reportRef.current) return;
    const t = toast.loading("PDF hazırlanıyor…");
    try {
      await captureElementToPdf(reportRef.current, fileName());
      toast.success("PDF indirildi 📄", { id: t });
    } catch {
      toast.error("PDF oluşturulamadı.", { id: t });
    }
  }

  async function sendToParent() {
    if (!student.parent_email) {
      toast.error("Bu öğrenci için veli e-postası tanımlı değil.");
      return;
    }
    if (reportRef.current) {
      const t = toast.loading("PDF hazırlanıyor…");
      try {
        await captureElementToPdf(reportRef.current, fileName());
        toast.success("PDF indirildi, maile ekleyebilirsiniz 📄", { id: t });
      } catch {
        toast.dismiss(t);
      }
    }
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

  const isWeekly = report.reportType === "weekly";

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

      {/* ============ RAPOR ============ */}
      <div ref={reportRef}>
      <Card className="overflow-hidden p-0">
        {/* Hero */}
        <div className="relative overflow-hidden bg-iris px-5 py-6 text-white">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.12]"
            style={{
              backgroundImage:
                "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
              backgroundSize: "26px 26px",
            }}
          />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Avatar
                first={student.first_name}
                last={student.last_name}
                colorSeed={student.id}
                className="h-14 w-14 bg-white/20 text-[16px] text-white"
              />
              <div>
                <h3 className="font-display text-[22px] font-bold leading-tight">
                  {student.first_name} {student.last_name}
                </h3>
                <p className="mt-0.5 text-[12.5px] text-white/80">
                  {student.grade_level}. sınıf
                  {student.school_name ? ` · ${student.school_name}` : ""}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span className="rounded-pill bg-white/20 px-2.5 py-0.5 text-[11.5px] font-semibold">
                    {isWeekly ? "Haftalık Rapor" : "Aylık Rapor"}
                  </span>
                  <span className="rounded-pill bg-white/15 px-2.5 py-0.5 text-[11.5px]">
                    {report.periodLabel}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[11.5px] uppercase tracking-wide text-white/70">Genel Başarı</p>
              <p className="font-display text-[40px] font-bold leading-none">
                {formatPercent(report.totals.successRate)}
              </p>
              {report.successDelta != null && report.successDelta !== 0 && (
                <span
                  className={`mt-1 inline-flex items-center gap-1 rounded-pill px-2 py-0.5 text-[11.5px] font-semibold ${
                    report.successDelta > 0 ? "bg-white/25" : "bg-black/20"
                  }`}
                >
                  {report.successDelta > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {formatDelta(report.successDelta, 1)} puan
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6 p-5">
          {/* İstatistik kutuları */}
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
            <StatTile icon={ListChecks} label="Toplam soru" value={formatNumber(report.totals.total)} tone="iris" />
            <StatTile icon={CheckCircle2} label="Doğru" value={formatNumber(report.totals.correct)} tone="mint" />
            <StatTile icon={XCircle} label="Yanlış" value={formatNumber(report.totals.wrong)} tone="danger" />
            <StatTile icon={BookOpen} label="Okunan sayfa" value={formatNumber(report.readingPages)} tone="peach" />
            <StatTile icon={Target} label="Son deneme" value={report.lastScore != null ? formatNumber(report.lastScore) : "—"} tone="rose" />
            <StatTile icon={Sigma} label="Ortalama net" value={periodAvgNet != null ? periodAvgNet.toFixed(2) : "—"} tone="sky" />
          </div>

          {/* Hedef lise */}
          {targetSchool && (
            <div className="rounded-card border border-iris/40 bg-iris-soft/50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 text-[11.5px] font-semibold text-iris">
                    <Target className="h-3.5 w-3.5" /> Hedef lise
                  </p>
                  <p className="font-display text-[16px] font-bold text-ink">{targetSchool.school_name}</p>
                  <p className="text-[12px] text-gravel">
                    {targetSchool.city}
                    {targetSchool.district ? ` / ${targetSchool.district}` : ""} · taban {formatNumber(targetSchool.base_score, 2)}
                    {targetSchool.percentile != null ? ` · %${formatNumber(targetSchool.percentile, 2)} dilim` : ""}
                  </p>
                </div>
                <div className="text-right">
                  {report.lastScore == null ? (
                    <span className="text-[12px] text-slate">Henüz deneme yok</span>
                  ) : report.lastScore >= targetSchool.base_score ? (
                    <span className="inline-flex items-center gap-1 rounded-pill bg-mint-soft px-3 py-1 text-[13px] font-bold text-mint">
                      <Trophy className="h-4 w-4" /> Hedefe ulaştın! 🎉
                    </span>
                  ) : (
                    <span className="font-display text-[18px] font-bold text-iris">
                      {formatNumber(targetSchool.base_score - report.lastScore, 1)}
                      <span className="ml-1 text-[12px] font-normal text-gravel">puan kaldı</span>
                    </span>
                  )}
                </div>
              </div>
              {report.lastScore != null && (
                <div className="mt-3 h-2.5 overflow-hidden rounded-pill bg-white">
                  <div
                    className="h-full rounded-pill bg-iris transition-all duration-500"
                    style={{ width: `${Math.min(100, (report.lastScore / targetSchool.base_score) * 100)}%` }}
                  />
                </div>
              )}
            </div>
          )}

          {/* En başarılı / gelişime açık ders */}
          {(report.bestSubject || report.worstSubject) && (
            <div className="grid gap-2.5 sm:grid-cols-2">
              {report.bestSubject && report.bestSubject.total > 0 && (
                <HighlightCard
                  icon={Trophy}
                  tone="mint"
                  title="En başarılı ders"
                  subject={report.bestSubject.subjectName}
                  rate={report.bestSubject.successRate}
                />
              )}
              {report.worstSubject && report.worstSubject.total > 0 && (
                <HighlightCard
                  icon={AlertTriangle}
                  tone="peach"
                  title="Gelişime açık ders"
                  subject={report.worstSubject.subjectName}
                  rate={report.worstSubject.successRate}
                />
              )}
            </div>
          )}

          {/* Grafikler */}
          {report.subjects.length > 0 && (
            <div className="grid gap-3 lg:grid-cols-2">
              <FadeIn delay={40}>
                <SubjectRadarChart data={report.subjects} />
              </FadeIn>
              <FadeIn delay={80}>
                <AccuracyDonut correct={report.totals.correct} wrong={report.totals.wrong} />
              </FadeIn>
            </div>
          )}

          {/* Ders bazlı ilerleme çubukları */}
          {report.subjects.length > 0 && (
            <Section icon={ListChecks} title="Ders bazlı başarı">
              <div className="space-y-2.5">
                {report.subjects.map((s) => (
                  <SubjectBar key={s.subjectId} stat={s} />
                ))}
              </div>
            </Section>
          )}

          {/* Deneme grafiği + listesi */}
          {report.exams.length > 0 && (
            <Section icon={Target} title="Denemeler">
              {report.exams.length > 1 && (
                <div className="mb-3">
                  <ExamScoreChart data={report.exams.map((e, i) => ({ id: String(i), name: e.name, date: e.date, score: e.score }))} />
                </div>
              )}
              <div className="space-y-1.5">
                {report.exams.map((e, i) => (
                  <div key={i} className="flex items-center justify-between gap-2 rounded-input bg-cloud/50 px-3 py-2">
                    <span className="min-w-0">
                      <span className="block truncate text-[13px] text-ink">{e.name}</span>
                      <span className="text-[11px] text-slate">{formatDateShort(e.date)}</span>
                    </span>
                    <Badge tone="rose" className="font-bold">
                      {e.score} puan
                    </Badge>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Güçlü / zayıf konular */}
          {(report.strongestTopics.length > 0 || report.weakestTopics.length > 0) && (
            <div className="grid gap-3 sm:grid-cols-2">
              <TopicCard
                icon={TrendingUp}
                tone="mint"
                title="Güçlü konular"
                items={report.strongestTopics}
                empty="Konu verisi yok"
              />
              <TopicCard
                icon={TrendingDown}
                tone="danger"
                title="Gelişime açık konular"
                items={report.weakestTopics}
                empty="Konu verisi yok"
              />
            </div>
          )}

          {/* Okuma */}
          {report.readingPages > 0 && (
            <Section icon={BookOpen} title="Kitap okuma">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="peach" className="text-[13px] font-bold">
                  {formatNumber(report.readingPages)} sayfa
                </Badge>
                {report.readingBooks.map((b) => (
                  <Badge key={b} tone="neutral">
                    📖 {b}
                  </Badge>
                ))}
              </div>
            </Section>
          )}

          {/* Otomatik değerlendirme */}
          {report.comments.length > 0 && (
            <div className="rounded-card bg-iris-soft/60 p-4">
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

          {/* Lise eşleştirme */}
          {report.lastScore != null && (
            <div>
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
                <SchoolList title="Yerleşebileceği liseler" items={report.schoolMatch.eligible} tone="mint" />
                <SchoolList title="Hedef liseler" items={report.schoolMatch.target} tone="peach" />
              </div>
            </div>
          )}
        </div>
      </Card>
      </div>
    </div>
  );
}

/* ---------------- alt bileşenler ---------------- */

const TILE_TONE: Record<string, string> = {
  iris: "bg-iris-soft text-iris",
  mint: "bg-mint-soft text-mint",
  danger: "bg-danger-soft text-danger",
  peach: "bg-peach-soft text-[#d77a1f]",
  rose: "bg-rose-soft text-rose",
  sky: "bg-sky-soft text-sky",
};

function StatTile({ icon: Icon, label, value, tone }: { icon: LucideIcon; label: string; value: string; tone: string }) {
  return (
    <div className="rounded-card border border-chalk bg-white p-3">
      <span className={`inline-flex h-7 w-7 items-center justify-center rounded-input ${TILE_TONE[tone]}`}>
        <Icon className="h-4 w-4" strokeWidth={2} />
      </span>
      <p className="mt-2 font-display text-[19px] font-bold leading-none text-ink">{value}</p>
      <p className="mt-1 text-[11px] text-gravel">{label}</p>
    </div>
  );
}

function HighlightCard({
  icon: Icon,
  tone,
  title,
  subject,
  rate,
}: {
  icon: LucideIcon;
  tone: "mint" | "peach";
  title: string;
  subject: string;
  rate: number;
}) {
  return (
    <div className={`flex items-center gap-3 rounded-card p-3.5 ${tone === "mint" ? "bg-mint-soft" : "bg-peach-soft"}`}>
      <span className={`inline-flex h-10 w-10 items-center justify-center rounded-input bg-white ${tone === "mint" ? "text-mint" : "text-[#d77a1f]"}`}>
        <Icon className="h-5 w-5" />
      </span>
      <div className="flex-1">
        <p className={`text-[11.5px] font-semibold ${tone === "mint" ? "text-mint" : "text-[#d77a1f]"}`}>{title}</p>
        <p className="font-display text-[15px] font-bold text-ink">{subject}</p>
      </div>
      <span className="font-display text-[20px] font-bold text-ink">{formatPercent(rate)}</span>
    </div>
  );
}

function Section({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2.5 flex items-center gap-1.5 text-[13px] font-semibold text-ink">
        <Icon className="h-4 w-4 text-iris" /> {title}
      </p>
      {children}
    </div>
  );
}

function SubjectBar({ stat }: { stat: SubjectStat }) {
  const hex = subjectHex(stat.subjectName);
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[12.5px]">
        <span className="flex items-center gap-1.5 text-graphite">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: hex }} />
          {stat.subjectName}
        </span>
        <span className="flex items-center gap-2 text-[11.5px]">
          <span className="text-mint">{stat.correct}D</span>
          <span className="text-danger">{stat.wrong}Y</span>
          <span className="w-10 text-right font-semibold text-ink">{formatPercent(stat.successRate)}</span>
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-pill bg-cloud">
        <div
          className="h-full rounded-pill transition-all duration-500"
          style={{ width: `${stat.successRate}%`, background: hex }}
        />
      </div>
    </div>
  );
}

function TopicCard({
  icon: Icon,
  tone,
  title,
  items,
  empty,
}: {
  icon: LucideIcon;
  tone: BadgeProps["tone"];
  title: string;
  items: { subjectName: string; topic: string; successRate: number }[];
  empty: string;
}) {
  return (
    <div className="rounded-card border border-chalk p-3.5">
      <p className={`mb-2 flex items-center gap-1.5 text-[12.5px] font-semibold ${tone === "mint" ? "text-mint" : "text-danger"}`}>
        <Icon className="h-3.5 w-3.5" /> {title}
      </p>
      {items.length === 0 ? (
        <p className="text-[12px] text-slate">{empty}</p>
      ) : (
        <div className="space-y-1.5">
          {items.map((t) => (
            <div key={t.subjectName + t.topic} className="flex items-center justify-between gap-2 rounded-input bg-cloud/50 px-3 py-1.5">
              <span className="truncate text-[12px] text-graphite">
                {t.subjectName} · {t.topic}
              </span>
              <Badge tone={tone}>{formatPercent(t.successRate)}</Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SchoolList({
  title,
  items,
  tone,
}: {
  title: string;
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
          {items.slice(0, 6).map((h) => (
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
