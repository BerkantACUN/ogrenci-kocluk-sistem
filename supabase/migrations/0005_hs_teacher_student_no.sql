-- =========================================================
-- Öğretmenlerin de lise ekleyebilmesi + öğrenci okul numarası (Excel eşleştirme)
-- =========================================================

-- Lise kaydının sahibi: null = global (yönetici/sistem geneli, herkes okur)
alter table public.high_schools add column if not exists teacher_id uuid references public.profiles(id) on delete cascade;
create index if not exists idx_high_schools_teacher on public.high_schools(teacher_id);

-- Öğrenci okul numarası (Excel'den deneme eşleştirmede kullanılır)
alter table public.students add column if not exists student_no text;

-- RLS yeniden tanımla: global (teacher_id null) + kendi kayıtların okunur; yazma kendi/admin
drop policy if exists "high_schools_read_all" on public.high_schools;
drop policy if exists "high_schools_admin_write" on public.high_schools;
drop policy if exists "hs_read" on public.high_schools;
drop policy if exists "hs_insert" on public.high_schools;
drop policy if exists "hs_update" on public.high_schools;
drop policy if exists "hs_delete" on public.high_schools;

create policy "hs_read" on public.high_schools
  for select using (
    auth.role() = 'authenticated'
    and (teacher_id is null or teacher_id = auth.uid() or public.is_admin())
  );
create policy "hs_insert" on public.high_schools
  for insert with check (teacher_id = auth.uid() or public.is_admin());
create policy "hs_update" on public.high_schools
  for update using (teacher_id = auth.uid() or public.is_admin())
  with check (teacher_id = auth.uid() or public.is_admin());
create policy "hs_delete" on public.high_schools
  for delete using (teacher_id = auth.uid() or public.is_admin());
