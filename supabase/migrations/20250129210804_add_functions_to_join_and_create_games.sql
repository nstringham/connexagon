create or replace function public.join_game (game_id_to_join text, user_id uuid) returns void language sql as $$
  insert into
    public.players (game_id, user_id, color)
  values
    (
      game_id_to_join,
      user_id,
      (
        select
          all_colors.color
        from
          (
            select
              unnest(enum_range(null::public.color)) as color
          ) as all_colors
          left join public.players on players.game_id = game_id_to_join
          and players.color = all_colors.color
        where
          players.game_id is null
        order by
          random()
        limit
          1
      )
    );
$$;

create or replace function public.join_game (game_id_to_join text) returns void language sql as $$
  select public.join_game (game_id_to_join, auth.uid ());
$$;

create or replace function public.on_games_insert () returns trigger language plpgsql as $$
begin
  perform public.join_game (new.id, new.host_user_id);
  return new;
end
$$;

create trigger games_insert_trigger
after insert on public.games for each row
execute function on_games_insert ();

create or replace function public.create_game () returns text language sql as $$
  insert into
    public.games (host_user_id)
  values
    (auth.uid ())
  returning
    id;
$$;
