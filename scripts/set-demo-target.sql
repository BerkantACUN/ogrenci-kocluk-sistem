-- Demo öğrencilere gerçek hedef lise ata.
update public.students s
set target_high_school_id = h.id
from public.high_schools h
where h.teacher_id is null and h.year = 2025
  and (
    (s.first_name in ('Ayşe', 'Zeynep') and h.school_name = 'Süleyman Demirel Fen Lisesi')
    or (s.first_name in ('Elif', 'Mehmet') and h.school_name = 'Kamil Miras Anadolu Lisesi')
    or (s.first_name in ('Yusuf', 'Emir') and h.school_name = 'Afyon Lisesi')
  );
