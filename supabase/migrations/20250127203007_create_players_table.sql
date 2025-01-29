CREATE TABLE IF NOT EXISTS public.players (
	user_id uuid NOT NULL,
	game_id public.xid NOT NULL,
	turn_order smallint,
	color public.color NOT NULL,
	created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.players OWNER TO postgres;

ALTER TABLE ONLY public.players
ADD CONSTRAINT players_pkey PRIMARY KEY (user_id, game_id);

ALTER TABLE ONLY public.players
ADD CONSTRAINT unique_color UNIQUE (game_id, color);

ALTER TABLE ONLY public.players
ADD CONSTRAINT unique_player_number UNIQUE (game_id, turn_order);

ALTER TABLE ONLY public.players
ADD CONSTRAINT players_game_id_fkey FOREIGN KEY (game_id) REFERENCES public.games (id);

ALTER TABLE ONLY public.players
ADD CONSTRAINT players_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id);

ALTER TABLE ONLY public.players
ADD CONSTRAINT players_user_id_profiles_fkey FOREIGN KEY (user_id) REFERENCES public.profiles (user_id);

CREATE POLICY "Enable read access for all users" ON public.players FOR
SELECT
	USING (TRUE);

ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;

ALTER PUBLICATION supabase_realtime
ADD TABLE ONLY public.players;

GRANT ALL ON TABLE public.players TO anon;

GRANT ALL ON TABLE public.players TO authenticated;

GRANT ALL ON TABLE public.players TO service_role;
