/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />
declare const self: ServiceWorkerGlobalScope;

import { build, files, version } from "$service-worker";
import type { NotificationPayload } from "./lib/notifications.server";

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

self.addEventListener("push", (event) => {
  const { title, ...options } = event.data!.json() as NotificationPayload;

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const data = event.notification.data as NotificationPayload["data"];

  event.waitUntil(focusOrOpenTab(data?.url ?? "/"));
});

async function focusOrOpenTab(url: string) {
  const clientList = await self.clients.matchAll({ type: "window" });

  for (const client of clientList) {
    if (client.url === url) {
      return client.focus();
    }
  }

  return self.clients.openWindow(url);
}
