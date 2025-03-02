<script lang="ts">
  import type { SupabaseClient, User } from "@supabase/supabase-js";
  import type { Database } from "./database-types";
  import Button from "./Button.svelte";
  import Switch from "./Switch.svelte";
  import EditNameButton from "./EditNameButton.svelte";
  import { onMount } from "svelte";
  import {
    isDeviceSubscribedToNotifications,
    subscribeToNotifications,
    unsubscribeFromNotifications,
  } from "./notifications.client";

  const {
    supabase,
    user,
    profilePromise,
  }: {
    supabase: SupabaseClient<Database>;
    user: User;
    profilePromise: Promise<{ name: string } | null>;
  } = $props();

  let notificationsEnabled: boolean = $state(false);

  onMount(() => {
    updateNotificationsEnabled();
  });

  async function updateNotificationsEnabled() {
    notificationsEnabled = await isDeviceSubscribedToNotifications(supabase);
  }

  async function signOut() {
    await unsubscribeFromNotifications(supabase);
    const { error } = await supabase.auth.signOut({ scope: "local" });
    if (error) {
      throw error;
    }
  }
</script>

<div class="grid">
  <EditNameButton {profilePromise} {supabase} {user} />

  <label>
    Enable notifications
    <Switch
      bind:checked={notificationsEnabled}
      oninput={async (event) => {
        try {
          if (event.currentTarget.checked) {
            await subscribeToNotifications(supabase);
          } else {
            await unsubscribeFromNotifications(supabase);
          }
        } catch (error) {
          updateNotificationsEnabled();
          throw error;
        }
      }}
    />
  </label>

  <Button onclick={signOut}>Sign Out</Button>
</div>

<style>
  .grid {
    display: grid;
    gap: 12px;
  }

  label {
    min-height: 40px;
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
    gap: 12px;
  }
</style>
