"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, School, Pencil, Trash2, Search, Lock } from "lucide-react";
import { useProfile } from "@/providers/profile-provider";
import { useHighSchools, useDeleteHighSchool } from "@/hooks/use-high-schools";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { PageLoader } from "@/components/ui/spinner";
import { StaggerList } from "@/components/motion/stagger-list";
import { HighSchoolFormModal } from "@/components/forms/high-school-form-modal";
import type { HighSchool } from "@/lib/types";

export default function HighSchoolsPage() {
  const profile = useProfile();
  const { data: schools, isLoading } = useHighSchools();
  const del = useDeleteHighSchool();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<HighSchool | undefined>();

  if (profile.role !== "admin") {
    return (
      <EmptyState
        icon={Lock}
        title="Bu sayfa yöneticilere özel"
        description="Lise taban puanlarını yalnızca yönetici hesapları düzenleyebilir."
      />
    );
  }

  const filtered = (schools ?? []).filter((s) =>
    `${s.school_name} ${s.city} ${s.district ?? ""}`.toLocaleLowerCase("tr").includes(q.toLocaleLowerCase("tr")),
  );

  async function remove(s: HighSchool) {
    if (!confirm(`"${s.school_name}" silinsin mi?`)) return;
    try {
      await del.mutateAsync(s.id);
      toast.success("Lise silindi.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Silinemedi.");
    }
  }

  return (
    <div>
      <PageHeader
        title="Liseler"
        subtitle="Taban puanlarını yönet — öğrenci raporlarında eşleştirmede kullanılır"
        action={
          <Button
            onClick={() => {
              setEditing(undefined);
              setOpen(true);
            }}
          >
            <Plus className="h-4 w-4" /> Yeni lise
          </Button>
        }
      />

      {isLoading ? (
        <PageLoader />
      ) : !schools || schools.length === 0 ? (
        <EmptyState
          icon={School}
          title="Henüz lise eklenmemiş"
          description="Öğrencilerin puanına göre eşleştirme yapabilmek için liseleri ekle."
          action={
            <Button
              onClick={() => {
                setEditing(undefined);
                setOpen(true);
              }}
            >
              Lise ekle
            </Button>
          }
        />
      ) : (
        <>
          <div className="relative mb-4 max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Lise veya il ara…" className="pl-9" />
          </div>

          <StaggerList className="grid gap-2.5 sm:grid-cols-2">
            {filtered.map((s) => (
              <Card key={s.id} className="group flex items-center gap-3 p-3.5">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-input bg-mint-soft text-mint">
                  <School className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-semibold text-ink">{s.school_name}</p>
                  <p className="text-[12px] text-slate">
                    {s.city}
                    {s.district ? ` / ${s.district}` : ""} · {s.school_type ?? "—"} · {s.year}
                  </p>
                </div>
                <Badge tone="iris" className="text-[13px] font-bold">
                  {s.base_score}
                </Badge>
                <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={() => {
                      setEditing(s);
                      setOpen(true);
                    }}
                    className="rounded-input p-1.5 text-slate hover:bg-cloud hover:text-ink"
                    aria-label="Düzenle"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => remove(s)}
                    className="rounded-input p-1.5 text-slate hover:bg-danger-soft hover:text-danger"
                    aria-label="Sil"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </Card>
            ))}
          </StaggerList>
        </>
      )}

      <HighSchoolFormModal open={open} onClose={() => setOpen(false)} initial={editing} />
    </div>
  );
}
