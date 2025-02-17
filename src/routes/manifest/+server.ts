import type { WebAppManifest } from "web-app-manifest";
import type { RequestHandler } from "./$types";

import anySvg from "$lib/logo/icon.svg";
import maskableSvg from "$lib/logo/maskable-icon.svg";

export const GET: RequestHandler = ({ url }) => {
  const darkMode = url.searchParams.get("dark-mode") != "false";

  const manifest: WebAppManifest = {
    id: "/",
    name: "Connexagon",
    start_url: "/",
    display: "standalone",
    theme_color: darkMode ? "#121212" : "#ffffff",
    background_color: darkMode ? "#121212" : "#ffffff",
    icons: [
      {
        src: anySvg,
        type: "image/svg+xml",
        sizes: "any",
        purpose: "any",
      },
      {
        src: maskableSvg,
        type: "image/svg+xml",
        sizes: "any",
        purpose: "maskable",
      },
    ],
  };

  return new Response(JSON.stringify(manifest));
};
