alter table public.games
drop constraint board_and_started_at_match;

alter table public.games
add constraint board_and_started_at_match check ((started_at is null) = (turn is null));

alter table public.games
drop column board;

alter table public.games
add column towers smallint[] not null default array[]::smallint[];

alter table public.games
add column cell_colors bytea not null default '';

alter table public.players
alter column color type smallint using case
  when color = 'red' then 1
  when color = 'green' then 2
  when color = 'blue' then 3
end;

alter table public.games
alter column winner type smallint using case
  when winner = 'red' then 1
  when winner = 'green' then 2
  when winner = 'blue' then 3
  else 0
end;

alter table public.games
alter column winner
set default 0;

alter table public.games
alter column winner
set not null;

drop type public.cell;

drop type public.color;

create or replace function public.get_max_color () returns smallint language sql immutable as $$
  select 3
$$;

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
$$;

alter table public.players
add constraint color_in_range check (
  color > 0
  and color <= public.get_max_color ()
);
