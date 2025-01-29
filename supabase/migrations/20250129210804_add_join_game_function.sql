create or replace function public.join_game (game_id text) returns void language sql as $$
insert into
	public.players (game_id, user_id, color)
values
	(
		game_id,
		auth.uid (),
		(
			select
				all_colors.color
			from
				(
					select
						unnest(enum_range(null::public.color)) as color
				) as all_colors
				left join public.players on players.color = all_colors.color
				and players.game_id = game_id
			where
				players.game_id is null
			order by
				random()
			limit
				1
		)
	);
$$;
