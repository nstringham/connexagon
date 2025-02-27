<script lang="ts">
  import Button from "$lib/Button.svelte";
  import { onMount } from "svelte";
  import {
    subscribeToNotifications,
    unsubscribeFromNotifications,
    isDeviceSubscribedToNotifications,
  } from "$lib/notifications.client.js";

  const { data } = $props();

  const { supabase, user } = $derived(data);

  let notificationsEnabled = $state(false);

  onMount(async () => {
    notificationsEnabled = await isDeviceSubscribedToNotifications(supabase);
  });

  async function enableNotifications() {
    notificationsEnabled = true;
    await subscribeToNotifications(supabase);
  }

  async function disableNotifications() {
    notificationsEnabled = false;
    await unsubscribeFromNotifications(supabase);
  }
</script>

<p>This demo shows how to register for push notifications and how to send them.</p>

{#if notificationsEnabled}
  <Button onclick={disableNotifications}>Disable Notifications</Button>
{:else}
  <Button onclick={enableNotifications} disabled={user == null}>Enable Notifications</Button>
{/if}

<form method="POST" action="?/sendNotification">
  Notification Message:<input type="text" name="title" value="It's Your Turn" /> <br />
  Notification delay: <input type="number" name="delay" value="5" /> seconds <br />
  <Button type="submit">Send Push Notification</Button>
</form>
