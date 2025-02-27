<script lang="ts">
  import Button from "$lib/Button.svelte";
  import { onMount } from "svelte";
  import {
    subscribeToNotifications,
    unsubscribeFromNotifications,
    isDeviceSubscribedToNotifications,
  } from "$lib/notifications.client.js";
  import { enhance } from "$app/forms";

  const { data } = $props();

  const { supabase, user } = $derived(data);

  let notificationsEnabled = $state(false);

  onMount(async () => {
    notificationsEnabled = await isDeviceSubscribedToNotifications(supabase);
  });

  $effect(() => {
    if (notificationsEnabled) {
      subscribeToNotifications(supabase);
    } else {
      unsubscribeFromNotifications(supabase);
    }
  });
</script>

<p>This demo shows how to register for push notifications and how to send them.</p>

<p>
  Enable Notifications
  <input type="checkbox" bind:checked={notificationsEnabled} disabled={user == null} />
</p>

<form method="POST" action="?/sendNotification" use:enhance>
  Notification Message:<input type="text" name="title" value="It's Your Turn" /> <br />
  Notification delay: <input type="number" name="delay" value="5" /> seconds <br />
  <Button type="submit">Send Push Notification</Button>
</form>
