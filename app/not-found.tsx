import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-paper bg-grid px-6 text-center">
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-input bg-iris text-white">
        <Sparkles className="h-6 w-6" />
      </span>
      <h1 className="mt-5 font-display text-[64px] font-bold leading-none text-ink">404</h1>
      <p className="mt-2 text-[14px] text-gravel">Aradığın sayfa bulunamadı.</p>
      <Link href="/" className="mt-6">
        <Button>Ana sayfaya dön</Button>
      </Link>
    </div>
  );
}
