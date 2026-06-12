import Link from "next/link";
import {
  Sparkles,
  TrendingUp,
  BookOpen,
  Target,
  FileBarChart,
  Mail,
  GraduationCap,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";

const FEATURES = [
  { icon: TrendingUp, title: "Otomatik analiz", desc: "Doğru/yanlış gir, başarı yüzdesi ve grafikler otomatik çıksın.", tone: "bg-iris-soft text-iris" },
  { icon: BookOpen, title: "Kitap okuma takibi", desc: "Haftalık okunan kitap ve sayfayı kaydet, alışkanlığı izle.", tone: "bg-peach-soft text-[#d77a1f]" },
  { icon: Target, title: "Deneme takibi", desc: "Deneme puanlarındaki artış ve düşüşü çizgi grafikle gör.", tone: "bg-rose-soft text-rose" },
  { icon: FileBarChart, title: "Haftalık & aylık rapor", desc: "Tek tıkla rapor oluştur, yorumlarıyla birlikte PDF indir.", tone: "bg-mint-soft text-mint" },
  { icon: Mail, title: "Veliye gönder", desc: "Raporu hazırla, veli e-postasına gönderecek şekilde hazırla.", tone: "bg-sky-soft text-sky" },
  { icon: GraduationCap, title: "Lise eşleştirme", desc: "Son deneme puanına göre yerleşebileceği liseleri listele.", tone: "bg-lemon-soft text-[#b8860b]" },
];

const STEPS = [
  { n: "01", title: "Sınıf & öğrenci ekle", desc: "Sınıflarını oluştur, öğrencilerini ve veli bilgilerini gir." },
  { n: "02", title: "Haftalık veri gir", desc: "Ders, konu, doğru/yanlış, kitap ve deneme sonuçlarını ekle." },
  { n: "03", title: "Rapor & paylaş", desc: "Grafikleri incele, PDF rapor al, veliye gönder." },
];

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-paper bg-grid">
      {/* Nav */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-input bg-iris text-white">
            <Sparkles className="h-5 w-5" />
          </span>
          <span className="font-display text-[18px] font-bold">{APP_NAME}</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/giris">
            <Button variant="ghost" size="sm">
              Giriş
            </Button>
          </Link>
          <Link href="/kayit">
            <Button size="sm">Ücretsiz başla</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-5 pb-16 pt-12 text-center sm:px-8 sm:pt-20">
        <span className="inline-flex items-center gap-1.5 rounded-pill border border-chalk bg-white px-3 py-1 text-[12px] text-gravel shadow-soft">
          <Sparkles className="h-3.5 w-3.5 text-iris" /> Öğrenci koçluğu artık çok kolay
        </span>
        <h1 className="mx-auto mt-6 max-w-3xl font-display text-[40px] font-bold leading-[1.05] text-ink sm:text-[60px]">
          Öğrencinin gelişimini
          <br />
          <span className="text-iris">haftalık takip et.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-[15px] text-gravel">
          {APP_TAGLINE}. Doğru/yanlış, kitap okuma ve deneme verilerini gir; sistem otomatik grafik,
          başarı yüzdesi ve veliye gidecek raporu senin için hazırlasın.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/kayit">
            <Button size="lg" className="w-full sm:w-auto">
              Hemen başla <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/giris">
            <Button size="lg" variant="secondary" className="w-full sm:w-auto">
              Giriş yap
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-5 pb-16 sm:px-8">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-card border border-chalk bg-white p-5 shadow-soft lift">
              <span className={`inline-flex h-11 w-11 items-center justify-center rounded-input ${f.tone}`}>
                <f.icon className="h-[22px] w-[22px]" strokeWidth={1.9} />
              </span>
              <h3 className="mt-4 font-display text-[16px] font-bold text-ink">{f.title}</h3>
              <p className="mt-1.5 text-[13px] text-gravel">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Steps */}
      <section className="mx-auto max-w-6xl px-5 pb-20 sm:px-8">
        <h2 className="text-center font-display text-[28px] font-bold text-ink">3 adımda başla</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="rounded-card border border-chalk bg-white p-6 shadow-soft">
              <span className="font-display text-[34px] font-bold text-iris/30">{s.n}</span>
              <h3 className="mt-2 font-display text-[17px] font-bold text-ink">{s.title}</h3>
              <p className="mt-1.5 text-[13px] text-gravel">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-5 pb-20 sm:px-8">
        <div className="relative overflow-hidden rounded-xl bg-iris p-10 text-center text-white shadow-pop">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.12]"
            style={{
              backgroundImage:
                "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />
          <h2 className="relative font-display text-[28px] font-bold sm:text-[34px]">
            Öğrencilerini bugün takibe al ✦
          </h2>
          <p className="relative mx-auto mt-3 max-w-md text-[14px] text-white/80">
            Excel ve kağıt karmaşasına son. Tek panelde tüm öğrencilerini yönet.
          </p>
          <Link href="/kayit" className="relative mt-6 inline-block">
            <Button size="lg" variant="secondary">
              Ücretsiz hesap oluştur <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-chalk">
        <div className="mx-auto max-w-6xl px-5 py-6 text-center text-[12px] text-slate sm:px-8">
          © {new Date().getFullYear()} {APP_NAME} · {APP_TAGLINE}
        </div>
      </footer>
    </div>
  );
}
