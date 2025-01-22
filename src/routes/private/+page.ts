import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ parent }) => {
	const { supabase } = await parent();
	const { data: notes } = await supabase.from("notes").select("id,note").order("id");
	return { notes: notes ?? [] };
};
