import type { WebAppManifest } from "web-app-manifest";
import type { RequestHandler } from "./$types";

import anySvg from "$lib/logo/icon.svg";
import maskableSvg from "$lib/logo/maskable-icon.svg";
import monochromeSvg from "$lib/logo/favicon.svg";

export const GET: RequestHandler = ({ url, setHeaders }) => {
  setHeaders({ "Vercel-CDN-Cache-Control": "public, max-age=31536000, immutable" });

  const lightMode = url.searchParams.get("light-mode") === "true";

  const manifest: WebAppManifest = {
    id: "/",
    name: "Connexagon",
    start_url: "/",
    display: "standalone",
    theme_color: lightMode ? "#ffffff" : "#121212",
    background_color: lightMode ? "#ffffff" : "#121212",
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
      {
        src: monochromeSvg,
        type: "image/svg+xml",
        sizes: "any",
        purpose: "monochrome",
      },
    ],
  };

  return new Response(JSON.stringify(manifest));
};
