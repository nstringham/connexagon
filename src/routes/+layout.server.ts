import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({
  locals: { safeGetSession },
  cookies,
  setHeaders,
}) => {
  setHeaders({
    "Accept-CH": "Sec-CH-Prefers-Color-Scheme",
  });

  const { session } = await safeGetSession();
  return {
    session,
    cookies: cookies.getAll(),
  };
};
