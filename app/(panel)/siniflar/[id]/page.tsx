"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Plus, Users, ArrowRight, FileSpreadsheet } from "lucide-react";
import { useClass } from "@/hooks/use-classes";
import { useStudents } from "@/hooks/use-students";
import { useSubjects } from "@/hooks/use-subjects";
import { ExcelImportModal } from "@/components/forms/excel-import-modal";
import { StudentImportModal } from "@/components/forms/student-import-modal";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { PageLoader } from "@/components/ui/spinner";
import { StaggerList } from "@/components/motion/stagger-list";
import { StudentFormModal } from "@/components/forms/student-form-modal";

export default function ClassDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: cls, isLoading } = useClass(id);
  const { data: students } = useStudents(id);
  const { data: subjects } = useSubjects();
  const [modalOpen, setModalOpen] = useState(false);
  const [excelOpen, setExcelOpen] = useState(false);
  const [studentExcelOpen, setStudentExcelOpen] = useState(false);

  if (isLoading) return <PageLoader />;
  if (!cls) return <EmptyState icon={Users} title="Sınıf bulunamadı" />;

  return (
    <div>
      <PageHeader
        title={cls.class_name}
        subtitle={`${cls.grade_level}. sınıf · ${cls.school_name ?? "Okul belirtilmedi"}`}
        back={{ href: "/siniflar", label: "Sınıflar" }}
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => setStudentExcelOpen(true)}>
              <Users className="h-4 w-4" /> Excel öğrenci
            </Button>
            <Button variant="secondary" onClick={() => setExcelOpen(true)}>
              <FileSpreadsheet className="h-4 w-4" /> Excel deneme
            </Button>
            <Button onClick={() => setModalOpen(true)}>
              <Plus className="h-4 w-4" /> Öğrenci ekle
            </Button>
          </div>
        }
      />

      {cls.description && (
        <Card className="mb-5 p-4">
          <p className="text-[13px] text-gravel">{cls.description}</p>
        </Card>
      )}

      {!students || students.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Bu sınıfta öğrenci yok"
          description="Tek tek ekle ya da Excel ile tüm sınıfı bir kerede yükle."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Button variant="secondary" onClick={() => setStudentExcelOpen(true)}>
                <Users className="h-4 w-4" /> Excel ile yükle
              </Button>
              <Button onClick={() => setModalOpen(true)}>Öğrenci ekle</Button>
            </div>
          }
        />
      ) : (
        <StaggerList className="grid gap-2.5 sm:grid-cols-2">
          {students.map((s) => (
            <Link key={s.id} href={`/ogrenciler/${s.id}`}>
              <Card className="flex items-center gap-3 p-3.5 lift">
                <Avatar first={s.first_name} last={s.last_name} colorSeed={s.id} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-semibold text-ink">
                    {s.first_name} {s.last_name}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    <Badge tone="neutral">{s.grade_level}. sınıf</Badge>
                    {s.parent_email && <Badge tone="mint">veli ✓</Badge>}
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate" />
              </Card>
            </Link>
          ))}
        </StaggerList>
      )}

      <StudentFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultClassId={id}
        defaultGrade={cls.grade_level}
      />

      <ExcelImportModal
        open={excelOpen}
        onClose={() => setExcelOpen(false)}
        students={students ?? []}
        subjects={subjects ?? []}
      />

      <StudentImportModal
        open={studentExcelOpen}
        onClose={() => setStudentExcelOpen(false)}
        classId={id}
        defaultGrade={cls.grade_level}
      />
    </div>
  );
}
