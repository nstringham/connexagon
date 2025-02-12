alter table public.games
drop constraint turn_and_started_at_match;

alter table public.profiles
drop constraint unique_name;

drop function if exists public.join_game (game_id_to_join text, user_id uuid);

drop index if exists public.unique_name;

alter table public.games
add constraint board_and_started_at_match check (((started_at is null) = (turn is null))) not valid;

alter table public.games validate constraint board_and_started_at_match;

set
  check_function_bodies = off;

create or replace function public.join_game (game_id_to_join text, user_id uuid) returns void language sql as $function$
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
              generate_series(0, public.get_max_color ()) as color
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
$function$;
