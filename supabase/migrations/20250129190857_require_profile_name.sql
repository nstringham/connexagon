alter table public.profiles
alter column name
set not null;

alter table public.profiles
add constraint name_regexp check (name ~* '^[a-z][a-z0-9_ ]+[a-z0-9]$');

alter table public.profiles
add constraint unique_name unique (name);
