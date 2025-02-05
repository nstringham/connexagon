create table if not exists public.players (
  user_id uuid not null,
  game_id public.xid not null,
  turn_order smallint,
  color public.color not null,
  created_at timestamp with time zone default now() not null
);

alter table public.players owner to postgres;

alter table only public.players
add constraint players_pkey primary key (user_id, game_id);

alter table only public.players
add constraint unique_color unique (game_id, color);

alter table only public.players
add constraint unique_player_number unique (game_id, turn_order);

alter table only public.players
add constraint players_game_id_fkey foreign key (game_id) references public.games (id);

alter table only public.players
add constraint players_user_id_fkey foreign key (user_id) references auth.users (id);

alter table only public.players
add constraint players_user_id_profiles_fkey foreign key (user_id) references public.profiles (user_id);

create policy "Enable read access for all users" on public.players for
select
  using (true);

alter table public.players enable row level security;

alter publication supabase_realtime
add table only public.players;

grant all on table public.players to anon;

grant all on table public.players to authenticated;

grant all on table public.players to service_role;
