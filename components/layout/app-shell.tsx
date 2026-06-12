"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  GraduationCap,
  FileBarChart,
  School,
  Users,
  LogOut,
  Menu,
  X,
  Sparkles,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ProfileProvider } from "@/providers/profile-provider";
import { Avatar } from "@/components/ui/avatar";
import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Profile } from "@/lib/types";

interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  match: (path: string) => boolean;
}

const teacherNav: NavItem[] = [
  { href: "/panel", label: "Genel Durum", icon: LayoutDashboard, match: (p) => p === "/panel" },
  { href: "/siniflar", label: "Sınıflar", icon: GraduationCap, match: (p) => p.startsWith("/siniflar") || p.startsWith("/ogrenciler") },
  { href: "/raporlar", label: "Raporlar", icon: FileBarChart, match: (p) => p.startsWith("/raporlar") },
];

const adminNav: NavItem[] = [
  { href: "/yonetici/liseler", label: "Liseler", icon: School, match: (p) => p.startsWith("/yonetici/liseler") },
  { href: "/yonetici/ogretmenler", label: "Öğretmenler", icon: Users, match: (p) => p.startsWith("/yonetici/ogretmenler") },
];

export function AppShell({ profile, children }: { profile: Profile; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/giris");
  }

  const nav = profile.role === "admin" ? [...teacherNav, ...adminNav] : teacherNav;

  return (
    <ProfileProvider profile={profile}>
      <div className="flex min-h-dvh">
        {/* Sidebar — masaüstü */}
        <aside className="hidden w-[248px] shrink-0 flex-col border-r border-chalk bg-white/70 lg:flex">
          <SidebarContent nav={nav} pathname={pathname} profile={profile} onSignOut={signOut} />
        </aside>

        {/* Mobil sidebar */}
        {mobileOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="absolute inset-0 bg-ink/30" onClick={() => setMobileOpen(false)} />
            <aside className="absolute left-0 top-0 flex h-full w-[260px] flex-col border-r border-chalk bg-paper">
              <SidebarContent
                nav={nav}
                pathname={pathname}
                profile={profile}
                onSignOut={signOut}
                onNavigate={() => setMobileOpen(false)}
              />
            </aside>
          </div>
        )}

        {/* Ana içerik */}
        <div className="flex min-w-0 flex-1 flex-col bg-grid">
          {/* Mobil üst bar */}
          <header className="flex items-center justify-between border-b border-chalk bg-white/80 px-4 py-3 backdrop-blur lg:hidden">
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-input p-2 text-graphite hover:bg-cloud"
              aria-label="Menü"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="font-display text-[15px] font-bold">{APP_NAME}</span>
            <Avatar first={profile.name} last={profile.surname} className="h-8 w-8" />
          </header>

          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            {children}
          </main>
        </div>
      </div>
    </ProfileProvider>
  );
}

function SidebarContent({
  nav,
  pathname,
  profile,
  onSignOut,
  onNavigate,
}: {
  nav: NavItem[];
  pathname: string;
  profile: Profile;
  onSignOut: () => void;
  onNavigate?: () => void;
}) {
  return (
    <>
      <div className="flex items-center gap-2.5 px-5 py-5">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-input bg-iris text-white">
          <Sparkles className="h-5 w-5" />
        </span>
        <div className="leading-tight">
          <p className="font-display text-[16px] font-bold text-ink">{APP_NAME}</p>
          <p className="text-[10.5px] uppercase tracking-wider text-slate">koçluk sistemi</p>
        </div>
        {onNavigate && (
          <button onClick={onNavigate} className="ml-auto rounded-input p-1.5 text-slate hover:bg-cloud lg:hidden">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3 py-2">
        {nav.map((item) => {
          const active = item.match(pathname);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-input px-3 py-2.5 text-[13.5px] font-medium transition-colors",
                active ? "bg-iris-soft text-iris" : "text-gravel hover:bg-cloud hover:text-ink",
              )}
            >
              <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-chalk p-3">
        <div className="flex items-center gap-2.5 rounded-input px-2 py-2">
          <Avatar first={profile.name} last={profile.surname} className="h-9 w-9" />
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-[13px] font-semibold text-ink">
              {profile.name} {profile.surname}
            </p>
            <p className="truncate text-[11px] text-slate">
              {profile.role === "admin" ? "Yönetici" : "Öğretmen"}
            </p>
          </div>
          <button
            onClick={onSignOut}
            className="rounded-input p-2 text-slate transition-colors hover:bg-danger-soft hover:text-danger"
            aria-label="Çıkış yap"
            title="Çıkış yap"
          >
            <LogOut className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>
    </>
  );
}
