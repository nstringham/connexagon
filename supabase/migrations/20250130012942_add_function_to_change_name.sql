create or replace function public.set_name (name text) returns void language sql as $$
	insert into
		public.profiles (user_id, name)
	values
		(auth.uid (), name)
	on conflict (user_id) do update
	set
		name = excluded.name;
$$;
