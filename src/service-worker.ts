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

import { getMessaging } from "firebase/messaging/sw";
import { onBackgroundMessage } from "firebase/messaging/sw";

const messaging = getMessaging();
onBackgroundMessage(messaging, (payload) => {
  console.log("[firebase-messaging-sw.js] Received background message ", payload);
  // Customize notification here
  const notificationTitle = "Background Message Title";
  const notificationOptions = {
    body: "Background Message body.",
    icon: "/firebase-logo.png",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
