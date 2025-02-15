import type { WebAppManifest } from "web-app-manifest";
import type { RequestHandler } from "./$types";

import anySvg from "$lib/logo/icon.svg";
import maskableSvg from "$lib/logo/maskable-icon.svg";

const manifest: WebAppManifest = {
  name: "Connexagon",
  start_url: "/",
  display: "standalone",
  theme_color: "#00cdd0",
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

export const GET: RequestHandler = () => {
  return new Response(JSON.stringify(manifest));
};
