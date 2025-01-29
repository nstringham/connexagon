create type public.cell as (tower boolean, color public.color);

alter type public.cell owner to postgres;

create table if not exists public.games (
	id public.xid default public.xid () not null,
	host_user_id uuid not null,
	board public.cell[],
	turn smallint,
	winner public.color,
	created_at timestamp with time zone default now() not null,
	started_at timestamp with time zone,
	completed_at timestamp with time zone
);

alter table public.games owner to postgres;

alter table only public.games
add constraint games_pkey primary key (id);

alter table only public.games
add constraint games_host_user_id_fkey foreign key (host_user_id) references auth.users (id);

alter table only public.games
add constraint games_host_user_id_profiles_fkey foreign key (host_user_id) references public.profiles (user_id);

create policy "Enable read access for all users" on public.games for
select
	using (true);

alter table public.games enable row level security;

alter publication supabase_realtime
add table only public.games;

grant all on table public.games to anon;

grant all on table public.games to authenticated;

grant all on table public.games to service_role;
