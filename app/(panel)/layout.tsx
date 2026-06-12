import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/supabase/get-profile";
import { AppShell } from "@/components/layout/app-shell";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const profile = await getSessionProfile();
  if (!profile) redirect("/giris");

  return <AppShell profile={profile}>{children}</AppShell>;
}
