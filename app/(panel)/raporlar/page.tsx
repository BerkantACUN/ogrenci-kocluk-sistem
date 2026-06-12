"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, FileBarChart, ArrowRight, Users } from "lucide-react";
import { useStudents } from "@/hooks/use-students";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PageLoader } from "@/components/ui/spinner";
import { StaggerList } from "@/components/motion/stagger-list";

export default function ReportsPage() {
  const { data: students, isLoading } = useStudents();
  const [q, setQ] = useState("");

  const filtered = (students ?? []).filter((s) =>
    `${s.first_name} ${s.last_name}`.toLocaleLowerCase("tr").includes(q.toLocaleLowerCase("tr")),
  );

  return (
    <div>
      <PageHeader
        title="Raporlar"
        subtitle="Öğrenci seç, haftalık veya aylık rapor oluştur, PDF indir ve veliye gönder"
      />

      {isLoading ? (
        <PageLoader />
      ) : !students || students.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Henüz öğrenci yok"
          description="Rapor oluşturmak için önce öğrenci eklemelisin."
        />
      ) : (
        <>
          <div className="relative mb-4 max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Öğrenci ara…"
              className="pl-9"
            />
          </div>

          <StaggerList className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((s) => (
              <Link key={s.id} href={`/ogrenciler/${s.id}?sekme=rapor`}>
                <Card className="flex items-center gap-3 p-3.5 lift">
                  <Avatar first={s.first_name} last={s.last_name} colorSeed={s.id} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-semibold text-ink">
                      {s.first_name} {s.last_name}
                    </p>
                    <Badge tone="neutral">{s.grade_level}. sınıf</Badge>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-iris">
                    <FileBarChart className="h-4 w-4" />
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </Card>
              </Link>
            ))}
          </StaggerList>
        </>
      )}
    </div>
  );
}
