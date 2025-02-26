import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ parent, depends }) => {
  depends("supabase:push_subscriptions");

  const { supabase, user } = await parent();

  if (user == null) {
    return { subscriptions: [] };
  }

  const { data: subscriptions, error: subscriptionError } = await supabase
    .from("push_subscriptions")
    .select("endpoint")
    .eq("user_id", user.id);

  if (subscriptionError) {
    throw subscriptionError;
  }

  return { subscriptions };
};
