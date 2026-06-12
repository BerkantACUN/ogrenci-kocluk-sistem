-- Okul no'su olmayan öğrencilere sıralı numara ata (101+).
with numbered as (
  select id, (row_number() over (partition by teacher_id order by first_name)) + 100 as n
  from public.students
  where student_no is null or student_no = ''
)
update public.students s
set student_no = numbered.n::text
from numbered
where numbered.id = s.id;
