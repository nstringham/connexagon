drop policy "Enable read access for all users" on public.profiles;

create policy allow_select on public.profiles as permissive for
select
	to public using (true);

create policy allow_all_if_user_matches on public.profiles as permissive for all to authenticated using (
	(
		select
			auth.uid () as uid
	) = user_id
)
with
	check (
		(
			select
				auth.uid () as uid
		) = user_id
	);

drop policy "Enable read access for all users" on public.games;

create policy allow_select on public.games as permissive for
select
	to public using (true);

create policy allow_insert_if_user_is_host on public.games as permissive for insert to authenticated
with
	check (
		(
			select
				auth.uid () as uid
		) = host_user_id
	);

revoke insert on table public.games
from
	authenticated;

grant insert (host_user_id) on table public.games to authenticated;

drop policy "Enable read access for all users" on public.players;

create policy allow_select on public.players as permissive for
select
	to public using (true);

create policy allow_insert_if_user_matches_and_game_has_not_started on public.players as permissive for insert to authenticated
with
	check (
		(
			select
				auth.uid ()
		) = user_id
		and exists (
			select
				games.started_at
			from
				games
			where
				games.id = game_id
				and games.started_at is null
		)
	);

revoke insert on table public.players
from
	authenticated;

grant insert (user_id, game_id, color) on table public.players to authenticated;

create policy allow_update_if_user_matches_and_game_has_not_started on public.players as permissive
for update
	to authenticated using (
		(
			select
				auth.uid ()
		) = user_id
		and exists (
			select
				games.started_at
			from
				games
			where
				games.id = game_id
				and games.started_at is null
		)
	);

revoke
update on table public.players
from
	authenticated;

grant
update (color) on table public.players to authenticated;
