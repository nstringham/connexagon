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
