import { createBrowserClient, createServerClient } from "@supabase/ssr";
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from "$env/static/public";
import type { LayoutLoad } from "./$types";
import type { Database } from "$lib/database-types";
import { browser } from "$app/environment";

export const load: LayoutLoad = async ({ data: { cookies }, depends, fetch }) => {
  /**
   * Declare a dependency so the layout can be invalidated, for example, on
   * session refresh.
   */
  depends("supabase:auth");

  const supabase = browser
    ? createBrowserClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
        global: {
          fetch,
        },
      })
    : createServerClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
        global: {
          fetch,
        },
        cookies: {
          getAll: () => cookies,
        },
      });

  /**
   * It's fine to use `getSession` here, because on the client, `getSession` is
   * safe, and on the server, it reads `session` from the `LayoutData`, which
   * safely checked the session using `safeGetSession`.
   */
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  async function getProfile() {
    if (user == null) {
      return null;
    }

    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("name")
      .eq("user_id", user.id);

    if (error) {
      throw error;
    }

    return profiles[0] ?? null;
  }

  return { session, supabase, user, profilePromise: getProfile() };
};
