# Öğrenci Koçluk ve Takip Sistemi — Yol Haritası

> Kaynak: `Öğrenci Koçluk ve Takip Sistemi Web Sitesi.pdf` (17 sayfa şartname)
> Kod adı: `ogrenci-kocluk-sistem` · Repo: github.com/BerkantACUN/ogrenci-kocluk-sistem

## Faz 1 — MVP (bu sürüm) ✅

PDF Bölüm 20 "ilk sürümde olması gereken temel özellikler":

- [x] Öğretmen üyeliği ve giriş (Supabase Auth + RLS)
- [x] Sınıf oluşturma / düzenleme / silme
- [x] Öğrenci ekleme / düzenleme / silme (veli bilgileriyle)
- [x] Haftalık ders + konu + doğru/yanlış girişi (otomatik toplam & başarı %)
- [x] Kitap adı + sayfa sayısı girişi
- [x] Deneme sınavı puanı ekleme
- [x] Öğrenci bazlı grafikler (haftalık soru, başarı %, ders bazlı, deneme, okuma)
- [x] Konu bazlı güçlü/zayıf analiz
- [x] Haftalık rapor + otomatik yorum cümleleri
- [x] Aylık rapor
- [x] PDF rapor çıktısı (jsPDF)
- [x] Veli e-postasına rapor (mailto taslağı + PDF)
- [x] Yönetici: lise taban puanı ekleme/güncelleme/silme
- [x] Son puana göre yerleşebileceği + hedef liseler eşleştirmesi
- [x] Gösterge paneli (bu hafta eksik veri uyarısı)

## Faz 2 — Geliştirmeler (PDF Bölüm 21)

- [ ] Sunucu taraflı **otomatik e-posta** (Resend/SMTP + Supabase Edge Function/Cron)
- [ ] PDF'e tam **Türkçe Unicode font** gömme
- [ ] **Veli paneli** (login + kendi çocuğunun raporları)
- [ ] **Öğrenci paneli**
- [ ] **Excel** içe/dışa aktarma + toplu öğrenci ekleme
- [ ] Toplu rapor gönderme
- [ ] **WhatsApp** ile rapor
- [ ] **AI destekli** öğrenci yorumları (Claude API)
- [ ] Ders bazlı net takibi + kazanım bazlı takip
- [ ] Türkiye geneli deneme karşılaştırması
- [ ] Eksik veri bildirimleri (Bölüm 19)
- [ ] Dark mode toggle (iskelet hazır)

## Faz 3 — Dağıtım

- [ ] Ubuntu sunucu + domain (kullanıcı sağlayacak)
- [ ] Supabase prod projesi + yedekleme
- [ ] E2E test (Playwright) kritik akışlar
- [ ] İzleme (Sentry)

## Veri modeli

`profiles, classes, students, subjects, weekly_records, reading_records, exam_results, high_schools, reports`
— hepsi RLS açık, `weekly_records.total_count` & `success_rate` generated kolon.

## Hesaplama (lib/calc.ts) & Rapor (lib/reports.ts)

PDF Bölüm 17–18 mantığı: başarı %, haftalık/aylık değişim, deneme farkı, ders/konu istatistikleri,
şablon tabanlı otomatik yorumlar, lise eşleştirme (≤ puan: yerleşebilir, +20 pencere: hedef).
