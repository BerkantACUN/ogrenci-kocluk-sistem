"use client";

import { Users, Lock, Mail, Phone, ShieldCheck } from "lucide-react";
import { useProfile } from "@/providers/profile-provider";
import { useTeachers } from "@/hooks/use-teachers";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PageLoader } from "@/components/ui/spinner";
import { StaggerList } from "@/components/motion/stagger-list";
import { formatDate } from "@/lib/weeks";

export default function TeachersPage() {
  const profile = useProfile();
  const { data: teachers, isLoading } = useTeachers();

  if (profile.role !== "admin") {
    return (
      <EmptyState
        icon={Lock}
        title="Bu sayfa yöneticilere özel"
        description="Öğretmen listesini yalnızca yönetici hesapları görüntüleyebilir."
      />
    );
  }

  return (
    <div>
      <PageHeader title="Öğretmenler" subtitle="Sistemdeki tüm hesaplar" />

      {isLoading ? (
        <PageLoader />
      ) : !teachers || teachers.length === 0 ? (
        <EmptyState icon={Users} title="Henüz öğretmen yok" />
      ) : (
        <StaggerList className="grid gap-2.5 sm:grid-cols-2">
          {teachers.map((t) => (
            <Card key={t.id} className="flex items-center gap-3 p-3.5">
              <Avatar first={t.name} last={t.surname} colorSeed={t.id} />
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 truncate text-[14px] font-semibold text-ink">
                  {t.name} {t.surname}
                  {t.role === "admin" && (
                    <Badge tone="iris">
                      <ShieldCheck className="h-3 w-3" /> Yönetici
                    </Badge>
                  )}
                </p>
                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[11.5px] text-slate">
                  <span className="flex items-center gap-1">
                    <Mail className="h-3 w-3" /> {t.email}
                  </span>
                  {t.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" /> {t.phone}
                    </span>
                  )}
                </div>
                {t.branch && <p className="mt-0.5 text-[11.5px] text-gravel">{t.branch}</p>}
              </div>
              <span className="text-[11px] text-slate">{formatDate(t.created_at)}</span>
            </Card>
          ))}
        </StaggerList>
      )}
    </div>
  );
}
