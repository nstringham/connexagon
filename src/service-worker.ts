/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />
declare const self: ServiceWorkerGlobalScope;

import { build, files, version } from "$service-worker";

const CACHE = `cache-${version}`;

const OFFLINE_PAGE = "/offline";

const ASSETS = [...build, ...files];

self.addEventListener("install", (event) => {
  async function addFilesToCache() {
    const cache = await caches.open(CACHE);
    await cache.addAll(ASSETS);
    await cache.add(OFFLINE_PAGE);
  }

  event.waitUntil(addFilesToCache());
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
        return (await cache.match(OFFLINE_PAGE))!;
      }
    }

    event.respondWith(respond());
    return;
  }

  const url = new URL(event.request.url);

  if (ASSETS.includes(url.pathname)) {
    async function respond() {
      const cache = await caches.open(CACHE);

      const response = await cache.match(url.pathname);

      return response!;
    }

    event.respondWith(respond());
    return;
  }
});

type NotificationData = {
  url?: string;
};

// Register event listener for the 'push' event.
self.addEventListener("push", function (event) {
  // Keep the service worker alive until the notification is created.
  event.waitUntil(
    self.registration.showNotification("It's Your Turn", {
      body: "Click here to open connexagon",
      data: { url: "/" } satisfies NotificationData,
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  console.log("On notification click: ", event.notification.tag);
  event.notification.close();

  const url = (event.notification.data as NotificationData).url ?? "/";

  // This looks to see if the current is already open and
  // focuses if it is
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === url && "focus" in client) {
          return client.focus();
        }
      }
      if ("openWindow" in self.clients) {
        return self.clients.openWindow(url);
      }
    }),
  );
});
