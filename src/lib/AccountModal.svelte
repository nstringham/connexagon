<script lang="ts">
  import type { SupabaseClient, User } from "@supabase/supabase-js";
  import type { Database } from "./database-types";
  import Button from "./Button.svelte";
  import Switch from "./Switch.svelte";
  import EditNameForm from "./EditNameForm.svelte";
  import Modal from "./Modal.svelte";
  import { onMount } from "svelte";
  import {
    isDeviceSubscribedToNotifications,
    subscribeToNotifications,
    unsubscribeFromNotifications,
  } from "./notifications.client";

  let {
    supabase,
    user,
    profilePromise,
    open = $bindable(true),
  }: {
    supabase: SupabaseClient<Database>;
    user: User;
    profilePromise: Promise<{ name: string } | null>;
    open?: boolean;
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
    open = false;
  }
</script>

<Modal bind:open>
  <div class="grid">
    <EditNameForm {supabase} {user} {profilePromise} />

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
</Modal>

<style>
  .grid {
    display: grid;
    gap: 12px;
  }

  label,
  .grid > :global(form) {
    min-height: 40px;
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
    gap: 12px;
  }
</style>
