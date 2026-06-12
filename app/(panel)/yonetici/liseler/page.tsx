"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus, School, Pencil, Trash2, Search } from "lucide-react";
import { useProfile } from "@/providers/profile-provider";
import { useHighSchools, useDeleteHighSchool } from "@/hooks/use-high-schools";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { EmptyState } from "@/components/ui/empty-state";
import { PageLoader } from "@/components/ui/spinner";
import { StaggerList } from "@/components/motion/stagger-list";
import { HighSchoolFormModal } from "@/components/forms/high-school-form-modal";
import { formatNumber } from "@/lib/utils";
import type { HighSchool } from "@/lib/types";

export default function HighSchoolsPage() {
  const profile = useProfile();
  const isAdmin = profile.role === "admin";
  const ownerId = isAdmin ? null : profile.id;

  const { data: schools, isLoading } = useHighSchools();
  const del = useDeleteHighSchool();
  const [q, setQ] = useState("");
  const [year, setYear] = useState<string>("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<HighSchool | undefined>();

  const years = useMemo(
    () => [...new Set((schools ?? []).map((s) => s.year))].sort((a, b) => b - a),
    [schools],
  );

  const filtered = useMemo(() => {
    return (schools ?? []).filter((s) => {
      const matchYear = year === "all" || s.year === Number(year);
      const matchText = `${s.school_name} ${s.city} ${s.district ?? ""}`
        .toLocaleLowerCase("tr")
        .includes(q.toLocaleLowerCase("tr"));
      return matchYear && matchText;
    });
  }, [schools, year, q]);

  const canManage = (s: HighSchool) => isAdmin || s.teacher_id === profile.id;

  async function remove(s: HighSchool) {
    if (!confirm(`"${s.school_name}" silinsin mi?`)) return;
    try {
      await del.mutateAsync(s.id);
      toast.success("Lise silindi.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Silinemedi (sistem listesini yalnızca yönetici düzenler).");
    }
  }

  return (
    <div>
      <PageHeader
        title="Liseler"
        subtitle={
          isAdmin
            ? "Sistem geneli taban puanlarını yönet — tüm öğretmenler görür"
            : "Sistem listesini gör + kendi liselerini ekle (yalnızca seninkiler düzenlenebilir)"
        }
        action={
          <Button
            onClick={() => {
              setEditing(undefined);
              setOpen(true);
            }}
          >
            <Plus className="h-4 w-4" /> {isAdmin ? "Yeni lise (sistem)" : "Lise ekle"}
          </Button>
        }
      />

      {isLoading ? (
        <PageLoader />
      ) : !schools || schools.length === 0 ? (
        <EmptyState
          icon={School}
          title="Henüz lise yok"
          description="Öğrencilerin puanına göre eşleştirme yapabilmek için lise ekle."
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
          <div className="mb-4 flex flex-wrap gap-2">
            <div className="relative min-w-[200px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Lise veya il ara…" className="pl-9" />
            </div>
            <div className="w-40">
              <Select value={year} onChange={(e) => setYear(e.target.value)}>
                <option value="all">Tüm yıllar</option>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y} yılı
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <p className="mb-2 text-[12px] text-slate">{filtered.length} lise</p>

          <StaggerList className="grid gap-2.5 sm:grid-cols-2">
            {filtered.map((s) => {
              const global = s.teacher_id == null;
              return (
                <Card key={s.id} className="group flex items-center gap-3 p-3.5">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-input bg-mint-soft text-mint">
                    <School className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate text-[13.5px] font-semibold text-ink">{s.school_name}</p>
                      <Badge tone={global ? "neutral" : "iris"}>{global ? "Sistem" : "Benim"}</Badge>
                    </div>
                    <p className="text-[12px] text-slate">
                      {s.city}
                      {s.district ? ` / ${s.district}` : ""} · {s.school_type ?? "—"} · {s.year}
                      {s.percentile != null ? ` · %${formatNumber(s.percentile, 2)} dilim` : ""}
                    </p>
                  </div>
                  <Badge tone="iris" className="text-[13px] font-bold">
                    {formatNumber(s.base_score, 2)}
                  </Badge>
                  {canManage(s) && (
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
                  )}
                </Card>
              );
            })}
          </StaggerList>
        </>
      )}

      <HighSchoolFormModal open={open} onClose={() => setOpen(false)} initial={editing} ownerId={ownerId} />
    </div>
  );
}
