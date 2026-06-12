"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ReadingRecordModal } from "@/components/forms/reading-record-modal";
import { useReadingRecords, useDeleteReading } from "@/hooks/use-student-data";
import { totalPages } from "@/lib/calc";
import { getWeekForDate } from "@/lib/weeks";
import { formatNumber } from "@/lib/utils";

export function ReadingTab({ studentId }: { studentId: string }) {
  const { data: records } = useReadingRecords(studentId);
  const del = useDeleteReading(studentId);
  const [open, setOpen] = useState(false);

  async function remove(id: string) {
    try {
      await del.mutateAsync(id);
      toast.success("Kayıt silindi.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Silinemedi.");
    }
  }

  const total = totalPages(records ?? []);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-display text-[16px] font-bold text-ink">Kitap Okuma</h3>
          {total > 0 && <p className="text-[12.5px] text-gravel">Toplam {formatNumber(total)} sayfa okundu 📚</p>}
        </div>
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> Kayıt ekle
        </Button>
      </div>

      {!records || records.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Henüz okuma kaydı yok"
          description="Haftalık okunan kitap ve sayfa sayısını ekleyerek okuma alışkanlığını takip et."
          action={<Button onClick={() => setOpen(true)}>Kayıt ekle</Button>}
        />
      ) : (
        <div className="space-y-2.5">
          {records.map((r) => (
            <Card key={r.id} className="group flex items-center gap-3 p-3.5">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-input bg-peach-soft text-[#d77a1f]">
                <BookOpen className="h-[18px] w-[18px]" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-semibold text-ink">{r.book_name}</p>
                <p className="text-[12px] text-slate">{getWeekForDate(r.week_start_date).shortLabel}</p>
              </div>
              <Badge tone="peach">{r.page_count} sayfa</Badge>
              <button
                onClick={() => remove(r.id)}
                className="rounded-input p-1.5 text-slate opacity-0 transition-opacity hover:bg-danger-soft hover:text-danger group-hover:opacity-100"
                aria-label="Sil"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </Card>
          ))}
        </div>
      )}

      <ReadingRecordModal open={open} onClose={() => setOpen(false)} studentId={studentId} />
    </div>
  );
}
