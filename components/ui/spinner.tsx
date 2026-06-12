import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn("h-5 w-5 animate-spin text-iris", className)} />;
}

export function PageLoader({ label = "Yükleniyor…" }: { label?: string }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-gravel">
      <Spinner className="h-7 w-7" />
      <p className="text-[13px]">{label}</p>
    </div>
  );
}
