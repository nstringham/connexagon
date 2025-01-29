create table if not exists public.profiles (user_id uuid not null, name character varying(12));

alter table public.profiles owner to postgres;

alter table only public.profiles
add constraint profiles_pkey primary key (user_id);

alter table only public.profiles
add constraint profiles_id_fkey foreign key (user_id) references auth.users (id) on delete cascade;

create policy "Enable read access for all users" on public.profiles for
select
	using (true);

alter table public.profiles enable row level security;

grant all on table public.profiles to anon;

grant all on table public.profiles to authenticated;

grant all on table public.profiles to service_role;
