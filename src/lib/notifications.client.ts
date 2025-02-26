import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "./database-types";
import { PUBLIC_VAPID_KEY } from "$env/static/public";
import { invalidate } from "$app/navigation";

async function subscribeToPush() {
  const registration = await navigator.serviceWorker.ready;

  const subscription = await registration.pushManager.getSubscription();

  if (subscription) {
    return subscription;
  }

  const vapidPublicKey = PUBLIC_VAPID_KEY;
  // Chrome doesn't accept the base64-encoded (string) vapidPublicKey yet
  // urlBase64ToUint8Array() is defined in /tools.js
  const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

  // Otherwise, subscribe the user (userVisibleOnly allows to specify that we don't plan to
  // send notifications that don't have a visible effect for the user).
  return registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: convertedVapidKey,
  });
}

async function getCurrentPushSubscription() {
  const registration = await navigator.serviceWorker.ready;
  return registration.pushManager.getSubscription();
}

export async function subscribeToNotifications(supabase: SupabaseClient<Database>) {
  if ((await Notification.requestPermission()) != "granted") {
    throw new Error("Please allow notifications");
  }

  const subscription = await subscribeToPush();

  const { error: supabaseError } = await supabase
    .from("push_subscriptions")
    .insert({ subscription: subscription.toJSON() as Json });

  void invalidate("supabase:push_subscriptions");

  if (supabaseError) {
    throw supabaseError;
  }
}

export async function unsubscribeFromNotifications(supabase: SupabaseClient<Database>) {
  const subscription = await getCurrentPushSubscription();

  if (subscription == null) {
    return;
  }

  const { error: supabaseError } = await supabase
    .from("push_subscriptions")
    .delete()
    .eq("subscription->>endpoint", subscription.endpoint);

  void invalidate("supabase:push_subscriptions");

  if (supabaseError) {
    throw supabaseError;
  }

  const unsubscribedSuccessfully = await subscription.unsubscribe();
  if (!unsubscribedSuccessfully) {
    throw new Error("unsubscribe from push was not successful");
  }
}

// This function is needed because Chrome doesn't accept a base64 encoded string
// as value for applicationServerKey in pushManager.subscribe yet
// https://bugs.chromium.org/p/chromium/issues/detail?id=802280
export function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replaceAll("-", "+").replaceAll("_", "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
