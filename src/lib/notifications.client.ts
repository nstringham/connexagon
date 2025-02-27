import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database-types";
import type webPush from "web-push";
import { PUBLIC_VAPID_KEY } from "$env/static/public";
import { invalidate } from "$app/navigation";

async function subscribeToPush() {
  const registration = await navigator.serviceWorker.ready;

  const subscription = await registration.pushManager.getSubscription();

  if (subscription) {
    return subscription;
  }

  return registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: PUBLIC_VAPID_KEY,
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

  const { endpoint, expirationTime, keys } = subscription.toJSON() as webPush.PushSubscription;

  const { error: supabaseError } = await supabase.rpc("subscribe_to_push", {
    endpoint,

    expiration_time: expirationTime!, // supabase assumes that all arguments are not allowed to be null
    keys,
  });

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

  const { error: supabaseError } = await supabase.rpc("unsubscribe_from_push", {
    endpoint_to_delete: subscription.endpoint,
  });

  void invalidate("supabase:push_subscriptions");

  if (supabaseError) {
    throw supabaseError;
  }

  const unsubscribedSuccessfully = await subscription.unsubscribe();
  if (!unsubscribedSuccessfully) {
    throw new Error("unsubscribe from push was not successful");
  }
}
