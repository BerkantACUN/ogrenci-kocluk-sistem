# Koçum — Öğrenci Koçluk ve Takip Sistemi

Öğretmenlerin öğrencilerini **haftalık** takip ettiği; doğru/yanlış, kitap okuma ve deneme verilerini
otomatik **grafik, başarı yüzdesi ve rapora** dönüştüren koçluk platformu. Raporlar PDF olarak indirilir,
veli e-postasına gönderilecek şekilde hazırlanır; öğrencinin son deneme puanına göre **lise eşleştirmesi** yapılır.

> MVP — Faz 1. Sonraki fazlar: veli/öğrenci paneli, otomatik e-posta (SMTP/Resend), WhatsApp, AI yorumlar, Excel import.

## Teknoloji

| Katman | Seçim |
|---|---|
| Framework | **Next.js 16** (App Router) + **React 19** + **TypeScript** |
| Stil | **Tailwind CSS v4** (token-first, monospace 099 estetiği) |
| Animasyon | **@react-spring/web** |
| Veri/Auth | **Supabase** (Postgres + RLS + Auth) |
| Sunucu durumu | **TanStack Query** |
| Form + doğrulama | **react-hook-form** + **zod** |
| Grafikler | **recharts** |
| PDF | **jsPDF** + **jspdf-autotable** |
| İkon / Toast | **lucide-react** / **sonner** |

## Tasarım

- **Font:** monospace — Space Mono (başlık) + JetBrains Mono (UI/veri). `app/globals.css` içindeki `@theme` token'ları.
- **Palet:** sıcak kağıt zemin + tatlı pastel aksanlar (iris/mint/peach/sky/rose/lemon), hairline border, pill buton.
- **Karakter:** öğrencilere hitap eden, modern, react-spring mikro etkileşimler + sıcak Türkçe boş-durum metinleri.

## Kurulum

```bash
pnpm install

# 1) Supabase projesi oluştur (supabase.com)
# 2) SQL Editor'da sırayla çalıştır:
#    - supabase/migrations/0001_init.sql
#    - supabase/migrations/0002_rls.sql
#    - supabase/seed.sql           (varsayılan dersler + örnek liseler)
# 3) Authentication > Providers > Email aktif; (kolay test için Confirm email KAPALI)

cp .env.example .env.local   # ve anahtarları doldur
pnpm dev                     # http://localhost:3000
```

`.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### Yönetici hesabı

Kayıt olan herkes `teacher` rolüyle başlar. Bir hesabı yönetici yapmak için Supabase SQL Editor'da:

```sql
update public.profiles set role = 'admin' where email = 'senin@mail.com';
```

Yönetici, `Liseler` ve `Öğretmenler` panellerine erişir; lise taban puanlarını yönetir.

## Mimari

```
app/
├── (auth)/            # giris, kayit  (+ marka split layout)
├── (panel)/           # layout.tsx auth guard + AppShell
│   ├── panel/         # öğretmen gösterge paneli
│   ├── siniflar/      # sınıflar + [id] sınıf detayı
│   ├── ogrenciler/    # [id] öğrenci detayı (Genel/Haftalık/Okuma/Deneme/Rapor)
│   ├── raporlar/      # öğrenci seç → rapor
│   └── yonetici/      # liseler, ogretmenler (admin)
├── page.tsx           # landing
components/
├── ui/                # Button, Input, Card, Modal, Tabs, StatCard…
├── motion/            # FadeIn, StaggerList (react-spring)
├── charts/            # recharts grafikleri
├── forms/             # modal form'lar
├── students/          # detay sekmeleri (overview/weekly/reading/exams/report)
└── layout/            # AppShell, Sidebar, PageHeader
lib/
├── calc.ts            # başarı %, haftalık değişim, seriler (PDF Bölüm 17)
├── reports.ts         # otomatik yorum üretimi + lise eşleştirme (Bölüm 11/12/14/18)
├── pdf.ts             # jsPDF rapor
├── weeks.ts           # Pazartesi–Pazar hafta mantığı
├── validations.ts     # zod şemalar
└── supabase/          # client / server / middleware / get-profile
hooks/                 # TanStack Query hook'ları
supabase/migrations/   # şema + RLS
```

## Güvenlik

- Tüm tablolarda **RLS açık**. Her öğretmen yalnızca kendi sınıf/öğrenci/kayıtlarını görür (`teacher_id = auth.uid()`).
- `subjects` ve `high_schools` paylaşılan: herkes okur, yalnızca yönetici yazar (`is_admin()`).
- Auth oturumu `proxy.ts` (Next 16 middleware) ile tazelenir; panel rotaları korumalıdır.

## Notlar

- **PDF Türkçe:** MVP'de jsPDF standart fontu için Türkçe karakterler normalize edilir (ş→s vb.). Faz 2'de Unicode TTF gömülecek.
- **Veliye gönder:** MVP'de PDF indirilir + `mailto:` taslağı açılır. Faz 2'de sunucu taraflı otomatik e-posta.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
