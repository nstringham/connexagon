alter table public.games
add constraint board_and_started_at_match check ((started_at is null) = (board is null));
