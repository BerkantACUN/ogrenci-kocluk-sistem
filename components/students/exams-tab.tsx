"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Target, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ExamModal } from "@/components/forms/exam-modal";
import { ExamScoreChart } from "@/components/charts/student-charts";
import { useExams, useDeleteExam } from "@/hooks/use-student-data";
import { useSubjects, subjectNameMap } from "@/hooks/use-subjects";
import { examSeries, examTotals } from "@/lib/calc";
import { subjectHex } from "@/lib/constants";
import { formatDateShort } from "@/lib/weeks";
import { formatDelta } from "@/lib/utils";
import type { ExamSubjectResult } from "@/lib/types";

export function ExamsTab({ studentId }: { studentId: string }) {
  const { data: exams } = useExams(studentId);
  const { data: subjects } = useSubjects();
  const del = useDeleteExam(studentId);
  const [open, setOpen] = useState(false);
  const subjMap = useMemo(() => subjectNameMap(subjects ?? []), [subjects]);

  async function remove(id: string) {
    try {
      await del.mutateAsync(id);
      toast.success("Deneme silindi.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Silinemedi.");
    }
  }

  const series = examSeries(exams ?? []);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-[16px] font-bold text-ink">Deneme Sınavları</h3>
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> Deneme ekle
        </Button>
      </div>

      {!exams || exams.length === 0 ? (
        <EmptyState
          icon={Target}
          title="Henüz deneme sonucu yok"
          description="Ders bazlı doğru/yanlış/boş gir; sistem net ve gelişim grafiğini otomatik çıkarsın, lise eşleştirsin."
          action={<Button onClick={() => setOpen(true)}>Deneme ekle</Button>}
        />
      ) : (
        <div className="space-y-4">
          {series.length > 1 && <ExamScoreChart data={series} />}
          <div className="space-y-2.5">
            {(exams ?? []).map((e) => {
              const idx = series.findIndex((x) => x.id === e.id);
              const prev = idx > 0 ? series[idx - 1].score : null;
              const delta = prev != null ? e.score - prev : null;
              const rows = e.exam_subject_results ?? [];
              const t = examTotals(rows);
              return (
                <Card key={e.id} className="p-3.5">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-input bg-rose-soft text-rose">
                      <Target className="h-[18px] w-[18px]" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-semibold text-ink">{e.exam_name}</p>
                      <p className="text-[12px] text-slate">
                        {formatDateShort(e.exam_date)}
                        {e.exam_type ? ` · ${e.exam_type}` : ""}
                      </p>
                    </div>
                    {delta != null && delta !== 0 && (
                      <span className={delta > 0 ? "flex items-center gap-0.5 text-[12px] text-mint" : "flex items-center gap-0.5 text-[12px] text-danger"}>
                        {delta > 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                        {formatDelta(delta)}
                      </span>
                    )}
                    {e.score > 0 ? (
                      <Badge tone="iris" className="text-[13px] font-bold">
                        {e.score} puan
                      </Badge>
                    ) : (
                      rows.length > 0 && (
                        <Badge tone="iris" className="text-[13px] font-bold">
                          {t.net.toFixed(2)} net
                        </Badge>
                      )
                    )}
                    <button
                      onClick={() => remove(e.id)}
                      className="rounded-input p-1.5 text-slate transition-colors hover:bg-danger-soft hover:text-danger"
                      aria-label="Sil"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {rows.length > 0 && (
                    <div className="mt-3 border-t border-chalk pt-3">
                      <div className="mb-2 flex flex-wrap gap-x-4 gap-y-1 text-[12px]">
                        <span className="text-mint">{t.correct} doğru</span>
                        <span className="text-danger">{t.wrong} yanlış</span>
                        <span className="text-gravel">{t.blank} boş</span>
                        <span className="font-semibold text-iris">{t.net.toFixed(2)} net</span>
                        <span className="text-slate">{t.totalQuestions} soru</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {[...rows]
                          .sort((a, b) => (subjMap.get(a.subject_id) ?? "").localeCompare(subjMap.get(b.subject_id) ?? ""))
                          .map((r: ExamSubjectResult) => {
                            const name = subjMap.get(r.subject_id) ?? "Ders";
                            return (
                              <span
                                key={r.id}
                                className="inline-flex items-center gap-1.5 rounded-pill border border-chalk bg-white px-2.5 py-1 text-[11.5px]"
                              >
                                <span className="h-2 w-2 rounded-full" style={{ background: subjectHex(name) }} />
                                <span className="text-graphite">{name}</span>
                                <span className="text-mint">{r.correct}D</span>
                                <span className="text-danger">{r.wrong}Y</span>
                                <span className="text-gravel">{r.blank}B</span>
                                <span className="font-semibold text-iris">{Number(r.net).toFixed(2)}</span>
                              </span>
                            );
                          })}
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      )}

      <ExamModal open={open} onClose={() => setOpen(false)} studentId={studentId} />
    </div>
  );
}
