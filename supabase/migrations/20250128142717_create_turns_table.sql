create table if not exists public.turns (
	game_id public.xid not null,
	turn_number smallint not null,
	cells smallint[] not null,
	created_at timestamp with time zone default now() not null
);

alter table public.turns owner to postgres;

alter table only public.turns
add constraint turns_pkey primary key (game_id, turn_number);

alter table only public.turns
add constraint turns_game_id_fkey foreign key (game_id) references public.games (id);

alter table public.turns enable row level security;

grant all on table public.turns to anon;

grant all on table public.turns to authenticated;

grant all on table public.turns to service_role;
