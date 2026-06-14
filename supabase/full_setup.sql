-- ============================================================
-- Öğrenci Koçluk — TAM KURULUM (tek dosya)
-- Supabase SQL Editor'a yapıştırıp RUN yeterli.
-- 0001_init + 0002_rls + seed birleşik.
-- ============================================================

-- =========================================================
-- Öğrenci Koçluk ve Takip Sistemi — Şema (PDF Bölüm 16)
-- =========================================================

-- ---------- profiles (öğretmen + yönetici) ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  surname text not null default '',
  email text not null,
  role text not null default 'teacher' check (role in ('teacher','admin')),
  phone text,
  branch text,
  school_name text,
  created_at timestamptz not null default now()
);

-- ---------- classes ----------
create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  class_name text not null,
  grade_level int not null,
  school_name text,
  description text,
  created_at timestamptz not null default now()
);
create index if not exists idx_classes_teacher on public.classes(teacher_id);

-- ---------- students ----------
create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  class_id uuid references public.classes(id) on delete set null,
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  grade_level int not null,
  school_name text,
  parent_name text,
  parent_email text,
  parent_phone text,
  note text,
  created_at timestamptz not null default now()
);
create index if not exists idx_students_teacher on public.students(teacher_id);
create index if not exists idx_students_class on public.students(class_id);

-- ---------- subjects (paylaşılan) ----------
create table if not exists public.subjects (
  id uuid primary key default gen_random_uuid(),
  subject_name text not null unique,
  sort_order int not null default 0
);

-- ---------- weekly_records (ders + konu + doğru/yanlış) ----------
create table if not exists public.weekly_records (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  week_start_date date not null,
  week_end_date date not null,
  subject_id uuid not null references public.subjects(id),
  topic text,
  correct_count int not null default 0 check (correct_count >= 0),
  wrong_count int not null default 0 check (wrong_count >= 0),
  total_count int generated always as (correct_count + wrong_count) stored,
  success_rate numeric(5,1) generated always as (
    case when (correct_count + wrong_count) = 0 then 0
    else round((correct_count::numeric / (correct_count + wrong_count)) * 100, 1) end
  ) stored,
  created_at timestamptz not null default now()
);
create index if not exists idx_weekly_student_week on public.weekly_records(student_id, week_start_date);

-- ---------- reading_records ----------
create table if not exists public.reading_records (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  week_start_date date not null,
  week_end_date date not null,
  book_name text not null,
  page_count int not null default 0 check (page_count >= 0),
  created_at timestamptz not null default now()
);
create index if not exists idx_reading_student_week on public.reading_records(student_id, week_start_date);

-- ---------- exam_results ----------
create table if not exists public.exam_results (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  exam_name text not null,
  exam_date date not null,
  exam_type text,
  score numeric(6,2) not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_exam_student_date on public.exam_results(student_id, exam_date);

-- ---------- high_schools (yönetici girer) ----------
create table if not exists public.high_schools (
  id uuid primary key default gen_random_uuid(),
  school_name text not null,
  city text not null,
  district text,
  school_type text,
  base_score numeric(6,2) not null,
  percentile numeric(5,2),
  quota int,
  year int not null default extract(year from now()),
  created_at timestamptz not null default now()
);
create index if not exists idx_high_schools_score on public.high_schools(base_score);

-- ---------- reports ----------
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  report_type text not null check (report_type in ('weekly','monthly')),
  start_date date not null,
  end_date date not null,
  pdf_url text,
  sent_to_parent boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists idx_reports_student on public.reports(student_id);

-- =========================================================
-- Yardımcı fonksiyonlar + trigger'lar
-- =========================================================

-- Yeni auth kullanıcısı için profil oluştur
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, surname, email, role, phone, branch, school_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'surname', ''),
    new.email,
    'teacher', -- güvenlik: rol her zaman teacher; admin yetkisi yalnızca SQL ile verilir
    nullif(new.raw_user_meta_data->>'phone', ''),
    nullif(new.raw_user_meta_data->>'branch', ''),
    nullif(new.raw_user_meta_data->>'school_name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Yönetici mi? (RLS politikalarında kullanılır — recursive RLS'i önlemek için security definer)
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;


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


-- =========================================================
-- Güvenlik: yeni kullanıcı profili her zaman 'teacher' rolüyle oluşturulur.
-- (Önceki sürüm metadata->>'role' okuyordu; bu, API'den admin escalation'a açıktı.)
-- Admin yetkisi yalnızca yönetici tarafından SQL ile verilir.
-- =========================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, surname, email, role, phone, branch, school_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'surname', ''),
    new.email,
    'teacher',
    nullif(new.raw_user_meta_data->>'phone', ''),
    nullif(new.raw_user_meta_data->>'branch', ''),
    nullif(new.raw_user_meta_data->>'school_name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;


-- =========================================================
-- Deneme ders bazlı doğru/yanlış/boş + net (LGS: net = doğru - yanlış/3)
-- =========================================================

create table if not exists public.exam_subject_results (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid not null references public.exam_results(id) on delete cascade,
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  subject_id uuid not null references public.subjects(id),
  correct int not null default 0 check (correct >= 0),
  wrong int not null default 0 check (wrong >= 0),
  blank int not null default 0 check (blank >= 0),
  net numeric(6,2) generated always as (correct - (wrong::numeric / 3)) stored,
  created_at timestamptz not null default now(),
  unique (exam_id, subject_id)
);
create index if not exists idx_esr_exam on public.exam_subject_results(exam_id);

alter table public.exam_subject_results enable row level security;

drop policy if exists "esr_all_own" on public.exam_subject_results;
create policy "esr_all_own" on public.exam_subject_results
  for all using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());


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


-- =========================================================
-- Öğrenciye hedef lise atama (öğretmen seçer; rapor hedefi gösterir)
-- =========================================================
alter table public.students
  add column if not exists target_high_school_id uuid references public.high_schools(id) on delete set null;


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

