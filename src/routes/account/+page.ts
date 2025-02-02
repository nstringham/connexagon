import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ parent }) => {
	const { supabase, user } = await parent();

	if (user == null) {
		return {};
	}

	const { data: profile, error } = await supabase
		.from("profiles")
		.select("name")
		.eq("user_id", user.id);

	if (error) {
		console.error(error);
	}

	return { profile: profile?.[0] };
};
