/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />
declare const self: ServiceWorkerGlobalScope;

import { version } from "$service-worker";

const CACHE = `cache-${version}`;

self.addEventListener("install", (event) => {
  async function addOfflinePageToCache() {
    const cache = await caches.open(CACHE);
    await cache.add(new Request("/offline"));
  }

  event.waitUntil(addOfflinePageToCache());
  void self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  async function enableNavigationPreload() {
    await self.registration.navigationPreload.enable();
  }

  async function deleteOldCaches() {
    for (const key of await caches.keys()) {
      if (key !== CACHE) {
        await caches.delete(key);
      }
    }
  }

  event.waitUntil(enableNavigationPreload());
  event.waitUntil(deleteOldCaches());
  void self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    async function respond() {
      try {
        const preloadResponse = (await event.preloadResponse) as Response | undefined;
        if (preloadResponse) {
          return preloadResponse;
        }

        const networkResponse = await fetch(event.request);
        return networkResponse;
      } catch (error) {
        console.log("Fetch failed; returning offline page instead.", error);

        const cache = await caches.open(CACHE);
        return (await cache.match("/offline"))!;
      }
    }

    event.respondWith(respond());
  }
});
