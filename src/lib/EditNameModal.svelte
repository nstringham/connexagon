<script lang="ts">
  import { invalidateAll } from "$app/navigation";
  import type { SupabaseClient, User } from "@supabase/supabase-js";
  import type { Database } from "./database-types";
  import Modal from "./Modal.svelte";

  let {
    profile,
    supabase,
    user,
    open = $bindable(false),
  }: {
    profile: { name: string } | null;
    supabase: SupabaseClient<Database>;
    user: User;
    open: boolean;
  } = $props();

  let name = $state("");

  $effect(() => {
    if (profile != null) {
      name = profile.name;
    } else {
      name = "";
      open = true;
    }
  });

  async function save() {
    const { error } = await supabase.from("profiles").upsert({ user_id: user.id, name });
    if (error) {
      throw error;
    }
    open = false;
    await invalidateAll();
  }
</script>

<Modal bind:open preventCancel={profile == null}>
  <label>Name: <input type="text" name="name" bind:value={name} /></label>

  <button onclick={save}>Save</button>
</Modal>
