<script lang="ts">
  import Button from "$lib/Button.svelte";
  import { onMount } from "svelte";
  import {
    subscribeToNotifications,
    unsubscribeFromNotifications,
  } from "$lib/notifications.client.js";

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

  async function enableNotifications() {
    if (user == null) {
      alert("Your must be logged in to enable notifications");
      return;
    }

    try {
      await subscribeToNotifications(supabase);
    } catch (error) {
      alert(error);
      throw error;
    }
  }

  async function disableNotifications() {
    try {
      await unsubscribeFromNotifications(supabase);
    } catch (error) {
      alert(error);
      throw error;
    }
  }
</script>

<p>This demo shows how to register for push notifications and how to send them.</p>

{#if notificationsEnabled}
  <Button onclick={disableNotifications}>Disable Notifications</Button>
{:else}
  <Button onclick={enableNotifications}>Enable Notifications</Button>
{/if}

<form method="POST" action="?/sendNotification">
  Notification Message:<input type="text" name="title" value="It's Your Turn" /> <br />
  Notification delay: <input type="number" name="delay" value="5" /> seconds <br />
  <Button type="submit">Send Push Notification</Button>
</form>
