"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { GraduationCap, Plus, Users, Pencil, Trash2, ArrowRight } from "lucide-react";
import { useClasses, useDeleteClass, type ClassWithCount } from "@/hooks/use-classes";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PageLoader } from "@/components/ui/spinner";
import { FadeIn } from "@/components/motion/fade-in";
import { StaggerList } from "@/components/motion/stagger-list";
import { ClassFormModal } from "@/components/forms/class-form-modal";

export default function ClassesPage() {
  const { data: classes, isLoading } = useClasses();
  const del = useDeleteClass();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ClassWithCount | undefined>();

  function openNew() {
    setEditing(undefined);
    setModalOpen(true);
  }
  function openEdit(c: ClassWithCount) {
    setEditing(c);
    setModalOpen(true);
  }
  async function remove(c: ClassWithCount) {
    if (!confirm(`"${c.class_name}" sınıfını silmek istediğine emin misin? Öğrenciler silinmez, sınıfsız kalır.`)) return;
    try {
      await del.mutateAsync(c.id);
      toast.success("Sınıf silindi.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Silinemedi.");
    }
  }

  return (
    <div>
      <PageHeader
        title="Sınıflar"
        subtitle="Sınıf ve gruplarını yönet"
        action={
          <Button onClick={openNew}>
            <Plus className="h-4 w-4" /> Yeni sınıf
          </Button>
        }
      />

      {isLoading ? (
        <PageLoader />
      ) : !classes || classes.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="Henüz sınıf yok"
          description="İlk sınıfını oluştur ve öğrencilerini eklemeye başla."
          action={<Button onClick={openNew}>Sınıf oluştur</Button>}
        />
      ) : (
        <StaggerList className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {classes.map((c) => (
            <Card key={c.id} className="group flex flex-col p-4 lift">
              <div className="flex items-start justify-between">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-input bg-iris-soft text-iris">
                  <GraduationCap className="h-5 w-5" />
                </span>
                <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button onClick={() => openEdit(c)} className="rounded-input p-1.5 text-slate hover:bg-cloud hover:text-ink" aria-label="Düzenle">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => remove(c)} className="rounded-input p-1.5 text-slate hover:bg-danger-soft hover:text-danger" aria-label="Sil">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <h3 className="mt-3 font-display text-[18px] font-bold text-ink">{c.class_name}</h3>
              <p className="mt-0.5 text-[12.5px] text-gravel">{c.school_name ?? "Okul belirtilmedi"}</p>
              <div className="mt-3 flex items-center gap-2">
                <Badge tone="sky">
                  <Users className="h-3 w-3" /> {c.student_count} öğrenci
                </Badge>
                <Badge tone="neutral">{c.grade_level}. sınıf</Badge>
              </div>
              <Link
                href={`/siniflar/${c.id}`}
                className="mt-4 inline-flex items-center gap-1 text-[13px] font-semibold text-iris hover:gap-2 transition-all"
              >
                Öğrencileri gör <ArrowRight className="h-4 w-4" />
              </Link>
            </Card>
          ))}
        </StaggerList>
      )}

      <FadeIn>
        <ClassFormModal open={modalOpen} onClose={() => setModalOpen(false)} initial={editing} />
      </FadeIn>
    </div>
  );
}
