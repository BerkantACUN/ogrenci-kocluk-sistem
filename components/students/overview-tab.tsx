"use client";

import { useMemo } from "react";
import { ListChecks, Percent, BookOpen, Target, TrendingUp, TrendingDown, Sigma } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  WeeklyQuestionsChart,
  SuccessRateChart,
  SubjectSuccessChart,
  ExamScoreChart,
  ReadingChart,
} from "@/components/charts/student-charts";
import { FadeIn } from "@/components/motion/fade-in";
import {
  overallTotals,
  subjectStats,
  weeklyTotalsSeries,
  readingSeries,
  examSeries,
  totalPages,
  lastExamDelta,
  topicStats,
  strongestWeakest,
  avgNet,
} from "@/lib/calc";
import { subjectNameMap } from "@/hooks/use-subjects";
import { formatPercent } from "@/lib/utils";
import type { WeeklyRecord, ReadingRecord, ExamResult, Subject } from "@/lib/types";

interface Props {
  weekly: WeeklyRecord[];
  reading: ReadingRecord[];
  exams: ExamResult[];
  subjects: Subject[];
}

export function OverviewTab({ weekly, reading, exams, subjects }: Props) {
  const map = useMemo(() => subjectNameMap(subjects), [subjects]);
  const totals = useMemo(() => overallTotals(weekly), [weekly]);
  const subjStats = useMemo(() => subjectStats(weekly, map), [weekly, map]);
  const weekSeries = useMemo(() => weeklyTotalsSeries(weekly), [weekly]);
  const readSeries = useMemo(() => readingSeries(reading), [reading]);
  const examLine = useMemo(() => examSeries(exams), [exams]);
  const { last, delta } = useMemo(() => lastExamDelta(exams), [exams]);
  const ortNet = useMemo(() => avgNet(exams), [exams]);
  const topics = useMemo(() => topicStats(weekly, map), [weekly, map]);
  const { strongest, weakest } = useMemo(() => strongestWeakest(topics), [topics]);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard icon={ListChecks} label="Toplam çözülen soru" value={totals.total} tone="iris" />
        <StatCard icon={Percent} label="Genel başarı" value={totals.successRate} suffix="%" tone="mint" />
        <StatCard icon={BookOpen} label="Okunan sayfa" value={totalPages(reading)} tone="peach" />
        <StatCard icon={Target} label="Son deneme puanı" value={last ?? 0} tone="rose" delta={delta} />
        <StatCard icon={Sigma} label="Ortalama net" value={ortNet ?? 0} tone="sky" />
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <FadeIn delay={40}>
          <WeeklyQuestionsChart data={weekSeries} />
        </FadeIn>
        <FadeIn delay={80}>
          <SuccessRateChart data={weekSeries} />
        </FadeIn>
        <FadeIn delay={120}>
          <SubjectSuccessChart data={subjStats} />
        </FadeIn>
        <FadeIn delay={160}>
          <ExamScoreChart data={examLine} />
        </FadeIn>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <FadeIn delay={120}>
          <ReadingChart data={readSeries} />
        </FadeIn>
        <FadeIn delay={160}>
          <Card className="p-4">
            <h4 className="mb-3 font-display text-[14px] font-bold text-ink">Konu Bazlı Performans</h4>
            {strongest.length === 0 && weakest.length === 0 ? (
              <div className="flex h-[150px] items-center justify-center text-[12.5px] text-slate">
                Konu verisi için haftalık girişlerde konu belirt
              </div>
            ) : (
              <div className="space-y-3">
                {strongest.length > 0 && (
                  <div>
                    <p className="mb-1.5 flex items-center gap-1.5 text-[12px] font-semibold text-mint">
                      <TrendingUp className="h-3.5 w-3.5" /> Güçlü konular
                    </p>
                    <div className="space-y-1.5">
                      {strongest.map((t) => (
                        <TopicRow key={t.subjectName + t.topic} name={`${t.subjectName} · ${t.topic}`} rate={t.successRate} tone="mint" />
                      ))}
                    </div>
                  </div>
                )}
                {weakest.length > 0 && (
                  <div>
                    <p className="mb-1.5 flex items-center gap-1.5 text-[12px] font-semibold text-danger">
                      <TrendingDown className="h-3.5 w-3.5" /> Gelişime açık konular
                    </p>
                    <div className="space-y-1.5">
                      {weakest.map((t) => (
                        <TopicRow key={t.subjectName + t.topic} name={`${t.subjectName} · ${t.topic}`} rate={t.successRate} tone="danger" />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>
        </FadeIn>
      </div>
    </div>
  );
}

function TopicRow({ name, rate, tone }: { name: string; rate: number; tone: "mint" | "danger" }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-input bg-cloud/50 px-3 py-2">
      <span className="truncate text-[12.5px] text-graphite">{name}</span>
      <Badge tone={tone === "mint" ? "mint" : "danger"}>{formatPercent(rate)}</Badge>
    </div>
  );
}
