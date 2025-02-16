import type { WebAppManifest } from "web-app-manifest";
import type { RequestHandler } from "./$types";

import anySvg from "$lib/logo/icon.svg";
import maskableSvg from "$lib/logo/maskable-icon.svg";

export const GET: RequestHandler = ({ request, setHeaders }) => {
  setHeaders({
    Vary: "Sec-CH-Prefers-Color-Scheme",
  });

  const prefersLight = request.headers.get("Sec-CH-Prefers-Color-Scheme") == "light";

  const manifest: WebAppManifest = {
    name: "Connexagon",
    start_url: "/",
    display: "standalone",
    theme_color: prefersLight ? "#ffffff" : "#121212",
    background_color: prefersLight ? "#ffffff" : "#121212",
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
