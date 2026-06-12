import Link from "next/link";
import { Sparkles, TrendingUp, BookOpen, Target } from "lucide-react";
import { APP_NAME } from "@/lib/constants";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      {/* Marka paneli */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-iris p-10 text-white lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        <Link href="/" className="relative flex items-center gap-2.5">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-input bg-white/20">
            <Sparkles className="h-5 w-5" />
          </span>
          <span className="font-display text-[18px] font-bold">{APP_NAME}</span>
        </Link>

        <div className="relative space-y-6">
          <h2 className="font-display text-[34px] font-bold leading-tight">
            Öğrencinin gelişimini
            <br />
            haftalık takip et. ✦
          </h2>
          <p className="max-w-sm text-[14px] text-white/80">
            Doğru/yanlış, kitap okuma ve deneme verilerini gir; sistem otomatik grafik, başarı yüzdesi
            ve veliye gidecek raporu senin için hazırlasın.
          </p>
          <ul className="space-y-3 text-[13.5px] text-white/90">
            <li className="flex items-center gap-3">
              <TrendingUp className="h-4.5 w-4.5" /> Otomatik başarı analizi ve grafikler
            </li>
            <li className="flex items-center gap-3">
              <BookOpen className="h-4.5 w-4.5" /> Kitap okuma ve deneme takibi
            </li>
            <li className="flex items-center gap-3">
              <Target className="h-4.5 w-4.5" /> Deneme puanına göre lise eşleştirme
            </li>
          </ul>
        </div>

        <p className="relative text-[11.5px] text-white/60">
          © {new Date().getFullYear()} {APP_NAME} · Öğrenci Koçluk ve Takip Sistemi
        </p>
      </div>

      {/* Form alanı */}
      <div className="flex items-center justify-center bg-paper px-5 py-10 sm:px-8">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
