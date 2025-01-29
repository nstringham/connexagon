CREATE TABLE IF NOT EXISTS public.turns (
	game_id public.xid NOT NULL,
	turn_number smallint NOT NULL,
	cells smallint[] NOT NULL,
	created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.turns OWNER TO postgres;

ALTER TABLE ONLY public.turns
ADD CONSTRAINT turns_pkey PRIMARY KEY (game_id, turn_number);

ALTER TABLE ONLY public.turns
ADD CONSTRAINT turns_game_id_fkey FOREIGN KEY (game_id) REFERENCES public.games (id);

ALTER TABLE public.turns ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.turns TO anon;

GRANT ALL ON TABLE public.turns TO authenticated;

GRANT ALL ON TABLE public.turns TO service_role;
