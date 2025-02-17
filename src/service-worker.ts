/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

import {} from "$service-worker";

declare const self: ServiceWorkerGlobalScope;

self.addEventListener("fetch", () => {
  // do nothing
});
