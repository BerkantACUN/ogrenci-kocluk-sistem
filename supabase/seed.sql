-- =========================================================
-- Seed — varsayılan dersler + örnek liseler
-- =========================================================

insert into public.subjects (subject_name, sort_order) values
  ('Türkçe', 1),
  ('Matematik', 2),
  ('Fen Bilimleri', 3),
  ('Sosyal Bilgiler', 4),
  ('İngilizce', 5),
  ('Din Kültürü ve Ahlak Bilgisi', 6)
on conflict (subject_name) do nothing;

-- Örnek liseler (PDF örneklerinden — yönetici panelinden çoğaltılabilir)
insert into public.high_schools (school_name, city, district, school_type, base_score, percentile, year) values
  ('İzmir Fen Lisesi', 'İzmir', 'Bornova', 'Fen Lisesi', 495.50, 0.5, 2026),
  ('Bornova Anadolu Lisesi', 'İzmir', 'Bornova', 'Anadolu Lisesi', 405.00, 5.2, 2026),
  ('Karşıyaka Cihat Kora Anadolu Lisesi', 'İzmir', 'Karşıyaka', 'Anadolu Lisesi', 398.00, 6.8, 2026),
  ('İzmir Sosyal Bilimler Lisesi', 'İzmir', 'Konak', 'Sosyal Bilimler Lisesi', 410.00, 4.1, 2026),
  ('Konak Anadolu İmam Hatip Lisesi', 'İzmir', 'Konak', 'İmam Hatip Lisesi', 360.00, 12.0, 2026),
  ('Buca Anadolu Lisesi', 'İzmir', 'Buca', 'Anadolu Lisesi', 388.00, 8.0, 2026)
on conflict do nothing;
