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
