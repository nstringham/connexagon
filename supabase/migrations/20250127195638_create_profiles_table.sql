CREATE TABLE IF NOT EXISTS public.profiles (
	user_id uuid NOT NULL,
	name character varying(15)
);

ALTER TABLE public.profiles OWNER TO postgres;

ALTER TABLE ONLY public.profiles
	ADD CONSTRAINT profiles_pkey PRIMARY KEY (user_id);

ALTER TABLE ONLY public.profiles
	ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE;

CREATE POLICY "Enable read access for all users" ON public.profiles
	FOR SELECT
		USING (TRUE);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.profiles TO anon;

GRANT ALL ON TABLE public.profiles TO authenticated;

GRANT ALL ON TABLE public.profiles TO service_role;

