<script lang="ts">
  import Button from "$lib/Button.svelte";
  import { onMount } from "svelte";
  import { urlBase64ToUint8Array } from "./tools";
  import { PUBLIC_VAPID_KEY } from "$env/static/public";
  import type { Json } from "$lib/database-types";
  import { invalidate } from "$app/navigation";

  const { data } = $props();

  const { supabase, user, subscriptions } = $derived(data);

  let currentSubscription: PushSubscription | null = $state(null);

  let notificationsEnabled = $derived(
    subscriptions.some((subscription) => subscription.endpoint == currentSubscription?.endpoint),
  );

  onMount(async () => {
    if (Notification.permission == "granted") {
      const registration = await navigator.serviceWorker.ready;
      currentSubscription = await registration.pushManager.getSubscription();
    }
  });

  async function subscribe() {
    const registration = await navigator.serviceWorker.ready;

    // Use the PushManager to get the user's subscription to the push service.
    const subscription = await registration.pushManager.getSubscription();
    // If a subscription was found, return it.
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

  async function enableNotifications() {
    if (user == null) {
      alert("Your must be logged in to enable notifications");
      return;
    }

    if (Notification == undefined) {
      alert("Your browser does not support notifications");
      return;
    }

    if ((await Notification.requestPermission()) != "granted") {
      alert("Please allow notifications");
      return;
    }

    currentSubscription = await subscribe();

    await supabase
      .from("push_subscriptions")
      .insert({ subscription: currentSubscription.toJSON() as Json });

    await invalidate("supabase:push_subscriptions");
  }

  async function disableNotifications() {
    await supabase
      .from("push_subscriptions")
      .delete()
      .eq("subscription->>endpoint", currentSubscription!.endpoint);

    await invalidate("supabase:push_subscriptions");
  }
</script>

<p>This demo shows how to register for push notifications and how to send them.</p>

{#if notificationsEnabled}
  <Button onclick={disableNotifications}>Disable Notifications</Button>
{:else}
  <Button onclick={enableNotifications}>Enable Notifications</Button>
{/if}

<form method="POST" action="?/sendNotification">
  Notification delay: <input type="number" name="delay" value="5" /> seconds <br />
  <Button type="submit">Send Push Notification</Button>
</form>
