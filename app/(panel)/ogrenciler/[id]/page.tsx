"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { LayoutGrid, ClipboardList, BookOpen, Target, FileBarChart, Pencil, Mail, Phone, User } from "lucide-react";
import { useStudent } from "@/hooks/use-students";
import { useSubjects } from "@/hooks/use-subjects";
import { useWeeklyRecords, useReadingRecords, useExams } from "@/hooks/use-student-data";
import { useClass } from "@/hooks/use-classes";
import { PageHeader } from "@/components/layout/page-header";
import { Tabs } from "@/components/ui/tabs";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageLoader } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { FadeIn } from "@/components/motion/fade-in";
import { StudentFormModal } from "@/components/forms/student-form-modal";
import { OverviewTab } from "@/components/students/overview-tab";
import { WeeklyTab } from "@/components/students/weekly-tab";
import { ReadingTab } from "@/components/students/reading-tab";
import { ExamsTab } from "@/components/students/exams-tab";
import { ReportTab } from "@/components/students/report-tab";

const TABS = [
  { value: "genel", label: "Genel", icon: LayoutGrid },
  { value: "haftalik", label: "Haftalık", icon: ClipboardList },
  { value: "okuma", label: "Okuma", icon: BookOpen },
  { value: "deneme", label: "Denemeler", icon: Target },
  { value: "rapor", label: "Rapor", icon: FileBarChart },
];

export default function StudentDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const { data: student, isLoading } = useStudent(id);
  const { data: subjects } = useSubjects();
  const { data: weekly } = useWeeklyRecords(id);
  const { data: reading } = useReadingRecords(id);
  const { data: exams } = useExams(id);
  const { data: cls } = useClass(student?.class_id ?? "");

  const [tab, setTab] = useState(() => {
    if (typeof window === "undefined") return "genel";
    const s = new URLSearchParams(window.location.search).get("sekme");
    return TABS.some((t) => t.value === s) ? (s as string) : "genel";
  });
  const [editOpen, setEditOpen] = useState(false);

  if (isLoading) return <PageLoader />;
  if (!student) return <EmptyState icon={User} title="Öğrenci bulunamadı" />;

  const subj = subjects ?? [];
  const wk = weekly ?? [];
  const rd = reading ?? [];
  const ex = exams ?? [];

  return (
    <div>
      <PageHeader
        title={`${student.first_name} ${student.last_name}`}
        back={
          cls
            ? { href: `/siniflar/${cls.id}`, label: cls.class_name }
            : { href: "/siniflar", label: "Sınıflar" }
        }
        action={
          <Button variant="secondary" onClick={() => setEditOpen(true)}>
            <Pencil className="h-4 w-4" /> Düzenle
          </Button>
        }
      />

      {/* Öğrenci kimlik kartı */}
      <FadeIn>
        <Card className="mb-5 flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
          <Avatar first={student.first_name} last={student.last_name} colorSeed={student.id} className="h-14 w-14 text-[16px]" />
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="iris">{student.grade_level}. sınıf</Badge>
              {cls && <Badge tone="sky">{cls.class_name}</Badge>}
              {student.school_name && <Badge tone="neutral">{student.school_name}</Badge>}
            </div>
            {(student.parent_name || student.parent_email || student.parent_phone) && (
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-gravel">
                {student.parent_name && (
                  <span className="flex items-center gap-1">
                    <User className="h-3.5 w-3.5" /> {student.parent_name}
                  </span>
                )}
                {student.parent_email && (
                  <span className="flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5" /> {student.parent_email}
                  </span>
                )}
                {student.parent_phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5" /> {student.parent_phone}
                  </span>
                )}
              </div>
            )}
            {student.note && <p className="mt-2 text-[12.5px] text-slate">“{student.note}”</p>}
          </div>
        </Card>
      </FadeIn>

      <Tabs items={TABS} value={tab} onChange={setTab} className="mb-5" />

      {tab === "genel" && <OverviewTab weekly={wk} reading={rd} exams={ex} subjects={subj} />}
      {tab === "haftalik" && <WeeklyTab studentId={id} subjects={subj} />}
      {tab === "okuma" && <ReadingTab studentId={id} />}
      {tab === "deneme" && <ExamsTab studentId={id} />}
      {tab === "rapor" && <ReportTab student={student} weekly={wk} reading={rd} exams={ex} subjects={subj} />}

      <StudentFormModal open={editOpen} onClose={() => setEditOpen(false)} initial={student} />
    </div>
  );
}
