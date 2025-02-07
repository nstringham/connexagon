import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals: { safeGetSession }, cookies, url }) => {
  const { session } = await safeGetSession();
  return {
    origin: url.origin,
    session,
    cookies: cookies.getAll(),
  };
};
