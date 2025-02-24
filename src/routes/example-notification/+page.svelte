<script lang="ts">
  import Button from "$lib/Button.svelte";
  import { onMount } from "svelte";
  import { urlBase64ToUint8Array } from "./tools";
  import { PUBLIC_VAPID_KEY } from "$env/static/public";

  let subscription: PushSubscription | undefined = $state();

  onMount(async () => {
    // Register a Service Worker.
    navigator.serviceWorker.register("service-worker.js");

    const registration = await navigator.serviceWorker.ready;

    async function getSubscription() {
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

    subscription = await getSubscription();
  });
</script>

<p>This demo shows how to register for push notifications and how to send them.</p>

<form method="POST" action="?/sendNotification">
  Notification delay: <input type="number" name="delay" value="5" />
  seconds Notification
  <br />
  Time-To-Live: <input type="number" name="ttl" value="0" /> seconds
  <br />
  <input type="hidden" name="subscription" value={JSON.stringify(subscription)} />
  <Button type="submit">Try to conquer Italy!</Button>
</form>
