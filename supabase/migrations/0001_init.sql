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
    coalesce(new.raw_user_meta_data->>'role', 'teacher'),
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
