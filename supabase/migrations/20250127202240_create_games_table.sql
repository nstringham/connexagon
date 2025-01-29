CREATE TYPE public.cell AS (
	tower boolean,
	color public.color
);

ALTER TYPE public.cell OWNER TO postgres;

CREATE TABLE IF NOT EXISTS public.games (
	id public.xid DEFAULT public.xid () NOT NULL,
	host_user_id uuid NOT NULL,
	board public.cell[],
	turn smallint,
	winner public.color,
	created_at timestamp with time zone DEFAULT now() NOT NULL,
	started_at timestamp with time zone,
	completed_at timestamp with time zone
);

ALTER TABLE public.games OWNER TO postgres;

ALTER TABLE ONLY public.games
	ADD CONSTRAINT games_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.games
	ADD CONSTRAINT games_host_user_id_fkey FOREIGN KEY (host_user_id) REFERENCES auth.users (id);

ALTER TABLE ONLY public.games
	ADD CONSTRAINT games_host_user_id_profiles_fkey FOREIGN KEY (host_user_id) REFERENCES public.profiles (user_id);

CREATE POLICY "Enable read access for all users" ON public.games
	FOR SELECT
		USING (TRUE);

ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

ALTER PUBLICATION supabase_realtime
	ADD TABLE ONLY public.games;

GRANT ALL ON TABLE public.games TO anon;

GRANT ALL ON TABLE public.games TO authenticated;

GRANT ALL ON TABLE public.games TO service_role;

