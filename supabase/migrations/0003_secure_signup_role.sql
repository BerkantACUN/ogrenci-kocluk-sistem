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
