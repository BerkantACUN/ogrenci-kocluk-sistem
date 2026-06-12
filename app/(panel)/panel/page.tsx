"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { GraduationCap, Users, CheckCircle2, AlertCircle, ArrowRight, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useProfile } from "@/providers/profile-provider";
import { useClasses } from "@/hooks/use-classes";
import { useStudents } from "@/hooks/use-students";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { FadeIn } from "@/components/motion/fade-in";
import { StaggerList } from "@/components/motion/stagger-list";
import { currentWeek } from "@/lib/weeks";

export default function DashboardPage() {
  const profile = useProfile();
  const week = currentWeek();
  const { data: classes } = useClasses();
  const { data: students } = useStudents();

  const { data: enteredIds } = useQuery({
    queryKey: ["weekEntries", week.start],
    queryFn: async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("weekly_records")
        .select("student_id")
        .eq("week_start_date", week.start);
      return new Set((data ?? []).map((r: { student_id: string }) => r.student_id));
    },
  });

  const totalStudents = students?.length ?? 0;
  const enteredCount = students?.filter((s) => enteredIds?.has(s.id)).length ?? 0;
  const missing = students?.filter((s) => !enteredIds?.has(s.id)) ?? [];

  return (
    <div>
      <FadeIn>
        <PageHeader
          title={`Merhaba, ${profile.name}! 👋`}
          subtitle={`Bu hafta: ${week.label}`}
          action={
            <Link href="/siniflar">
              <Button>
                <Plus className="h-4 w-4" /> Sınıflar
              </Button>
            </Link>
          }
        />
      </FadeIn>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <FadeIn delay={40}>
          <StatCard icon={GraduationCap} label="Sınıf" value={classes?.length ?? 0} tone="iris" />
        </FadeIn>
        <FadeIn delay={80}>
          <StatCard icon={Users} label="Öğrenci" value={totalStudents} tone="sky" />
        </FadeIn>
        <FadeIn delay={120}>
          <StatCard icon={CheckCircle2} label="Bu hafta girildi" value={enteredCount} tone="mint" />
        </FadeIn>
        <FadeIn delay={160}>
          <StatCard icon={AlertCircle} label="Bu hafta eksik" value={missing.length} tone="peach" />
        </FadeIn>
      </div>

      <FadeIn delay={200}>
        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-[18px] font-bold text-ink">Bu hafta veri bekleyenler</h2>
            <span className="text-[12.5px] text-slate">{missing.length} öğrenci</span>
          </div>

          {totalStudents === 0 ? (
            <EmptyState
              icon={Users}
              title="Henüz öğrencin yok"
              description="Önce bir sınıf oluştur, sonra öğrencilerini ekle. Hadi başlayalım! 🎒"
              action={
                <Link href="/siniflar">
                  <Button>Sınıf oluştur</Button>
                </Link>
              }
            />
          ) : missing.length === 0 ? (
            <EmptyState
              icon={CheckCircle2}
              title="Harika! Tüm veriler girilmiş 🎉"
              description="Bu hafta tüm öğrencilerin için veri girişi tamamlandı."
            />
          ) : (
            <StaggerList className="grid gap-2.5 sm:grid-cols-2">
              {missing.map((s) => (
                <Link key={s.id} href={`/ogrenciler/${s.id}`}>
                  <Card className="flex items-center gap-3 p-3.5 lift">
                    <Avatar first={s.first_name} last={s.last_name} colorSeed={s.id} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-semibold text-ink">
                        {s.first_name} {s.last_name}
                      </p>
                      <p className="text-[12px] text-slate">{s.grade_level}. Sınıf</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate" />
                  </Card>
                </Link>
              ))}
            </StaggerList>
          )}
        </div>
      </FadeIn>
    </div>
  );
}
