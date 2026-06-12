-- =========================================================
-- RLS Politikaları — her öğretmen yalnızca kendi verisini görür.
-- =========================================================

alter table public.profiles enable row level security;
alter table public.classes enable row level security;
alter table public.students enable row level security;
alter table public.subjects enable row level security;
alter table public.weekly_records enable row level security;
alter table public.reading_records enable row level security;
alter table public.exam_results enable row level security;
alter table public.high_schools enable row level security;
alter table public.reports enable row level security;

-- ---------- profiles ----------
create policy "profiles_select_own_or_admin" on public.profiles
  for select using (id = auth.uid() or public.is_admin());
create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- ---------- classes ----------
create policy "classes_all_own" on public.classes
  for all using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());
create policy "classes_admin_read" on public.classes
  for select using (public.is_admin());

-- ---------- students ----------
create policy "students_all_own" on public.students
  for all using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());
create policy "students_admin_read" on public.students
  for select using (public.is_admin());

-- ---------- subjects (paylaşılan: herkes okur, yönetici yönetir) ----------
create policy "subjects_read_all" on public.subjects
  for select using (auth.role() = 'authenticated');
create policy "subjects_admin_write" on public.subjects
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------- weekly_records ----------
create policy "weekly_all_own" on public.weekly_records
  for all using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());

-- ---------- reading_records ----------
create policy "reading_all_own" on public.reading_records
  for all using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());

-- ---------- exam_results ----------
create policy "exam_all_own" on public.exam_results
  for all using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());

-- ---------- high_schools (paylaşılan: herkes okur, yönetici yönetir) ----------
create policy "high_schools_read_all" on public.high_schools
  for select using (auth.role() = 'authenticated');
create policy "high_schools_admin_write" on public.high_schools
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------- reports ----------
create policy "reports_all_own" on public.reports
  for all using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());
