import { error, redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ url, locals: { supabase } }) => {
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/";

  if (!code) {
    error(400, "code is required");
  }

  const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
  if (sessionError) {
    throw sessionError;
  }

  redirect(303, next);
};
