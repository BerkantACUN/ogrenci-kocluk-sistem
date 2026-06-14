-- =========================================================
-- Öğrenciye hedef lise atama (öğretmen seçer; rapor hedefi gösterir)
-- =========================================================
alter table public.students
  add column if not exists target_high_school_id uuid references public.high_schools(id) on delete set null;
