"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Target, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ExamModal } from "@/components/forms/exam-modal";
import { ExamScoreChart } from "@/components/charts/student-charts";
import { useExams, useDeleteExam } from "@/hooks/use-student-data";
import { examSeries } from "@/lib/calc";
import { formatDateShort } from "@/lib/weeks";
import { formatDelta } from "@/lib/utils";

export function ExamsTab({ studentId }: { studentId: string }) {
  const { data: exams } = useExams(studentId);
  const del = useDeleteExam(studentId);
  const [open, setOpen] = useState(false);

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
          description="Deneme puanlarını ekle; sistem gelişimi grafik olarak göstersin ve lise eşleştirsin."
          action={<Button onClick={() => setOpen(true)}>Deneme ekle</Button>}
        />
      ) : (
        <div className="space-y-4">
          {series.length > 1 && <ExamScoreChart data={series} />}
          <div className="space-y-2.5">
            {(exams ?? []).map((e, i) => {
              const idx = series.findIndex((x) => x.id === e.id);
              const prev = idx > 0 ? series[idx - 1].score : null;
              const delta = prev != null ? e.score - prev : null;
              return (
                <Card key={e.id} className="group flex items-center gap-3 p-3.5">
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
                  <Badge tone="iris" className="text-[13px] font-bold">
                    {e.score}
                  </Badge>
                  <button
                    onClick={() => remove(e.id)}
                    className="rounded-input p-1.5 text-slate opacity-0 transition-opacity hover:bg-danger-soft hover:text-danger group-hover:opacity-100"
                    aria-label="Sil"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
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
