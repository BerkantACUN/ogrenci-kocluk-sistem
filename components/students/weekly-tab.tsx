"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { WeeklyRecordModal } from "@/components/forms/weekly-record-modal";
import { useWeeklyRecords, useDeleteWeeklyRecord } from "@/hooks/use-student-data";
import { subjectNameMap } from "@/hooks/use-subjects";
import { SUBJECT_COLOR_TOKEN } from "@/lib/constants";
import { getWeekForDate } from "@/lib/weeks";
import { formatPercent } from "@/lib/utils";
import { groupBy } from "@/lib/utils";
import type { Subject } from "@/lib/types";
import type { BadgeProps } from "@/components/ui/badge";

export function WeeklyTab({ studentId, subjects }: { studentId: string; subjects: Subject[] }) {
  const { data: records } = useWeeklyRecords(studentId);
  const del = useDeleteWeeklyRecord(studentId);
  const [open, setOpen] = useState(false);
  const map = useMemo(() => subjectNameMap(subjects), [subjects]);

  const grouped = useMemo(() => {
    const g = groupBy(records ?? [], (r) => r.week_start_date);
    return [...g.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  }, [records]);

  async function remove(id: string) {
    try {
      await del.mutateAsync(id);
      toast.success("Kayıt silindi.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Silinemedi.");
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-[16px] font-bold text-ink">Haftalık Ders Kayıtları</h3>
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> Veri gir
        </Button>
      </div>

      {grouped.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="Henüz haftalık veri yok"
          description="Ders, konu ve doğru/yanlış girerek başla. Sistem başarıyı otomatik hesaplar."
          action={<Button onClick={() => setOpen(true)}>İlk veriyi gir</Button>}
        />
      ) : (
        <div className="space-y-4">
          {grouped.map(([weekStart, recs]) => (
            <Card key={weekStart} className="overflow-hidden">
              <div className="flex items-center justify-between border-b border-chalk bg-cloud/40 px-4 py-2.5">
                <span className="text-[13px] font-semibold text-graphite">
                  {getWeekForDate(weekStart).label}
                </span>
                <span className="text-[12px] text-slate">{recs.length} ders</span>
              </div>
              <div className="divide-y divide-chalk">
                {recs.map((r) => {
                  const name = map.get(r.subject_id) ?? "Ders";
                  const tone = (SUBJECT_COLOR_TOKEN[name] ?? "iris") as BadgeProps["tone"];
                  return (
                    <div key={r.id} className="group flex items-center gap-3 px-4 py-2.5">
                      <Badge tone={tone}>{name}</Badge>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] text-ink">{r.topic || "Konu belirtilmedi"}</p>
                      </div>
                      <div className="flex items-center gap-3 text-[12.5px]">
                        <span className="text-mint">{r.correct_count}D</span>
                        <span className="text-danger">{r.wrong_count}Y</span>
                        <span className="w-12 text-right font-semibold text-iris">{formatPercent(r.success_rate)}</span>
                      </div>
                      <button
                        onClick={() => remove(r.id)}
                        className="rounded-input p-1.5 text-slate opacity-0 transition-opacity hover:bg-danger-soft hover:text-danger group-hover:opacity-100"
                        aria-label="Sil"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </Card>
          ))}
        </div>
      )}

      <WeeklyRecordModal open={open} onClose={() => setOpen(false)} studentId={studentId} />
    </div>
  );
}
