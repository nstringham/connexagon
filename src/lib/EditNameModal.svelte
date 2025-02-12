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

  function getValidationError(name: string): string | null {
    if (!name) {
      return "Name is required";
    }

    if (name.length < 3) {
      return "Name must be at least 3 characters long";
    }

    if (name.length > 12) {
      return "Name cannot be longer than 12 characters";
    }

    if (!/^[a-z0-9_ ]+$/i.test(name)) {
      return "Name can only contain letters, number, spaces, and underscores";
    }

    if (!/^[a-z]/i.test(name)) {
      return "Name must start with a letter";
    }

    if (!/[a-z0-9]$/i.test(name)) {
      return "Name must end with a letter or number";
    }

    return null;
  }

  const validationError = $derived(getValidationError(name));

  let dirty = $state(false);

  $effect(() => {
    if (name != "") {
      dirty = true;
    }
  });

  async function save(event: SubmitEvent) {
    event.preventDefault();
    const { error } = await supabase.from("profiles").upsert({ user_id: user.id, name });
    if (error) {
      throw error;
    }
    open = false;
    await invalidateAll();
  }
</script>

<Modal bind:open preventCancel={profile == null}>
  <form onsubmit={save}>
    <label>
      Name:<br />
      <input
        type="text"
        name="name"
        bind:value={name}
        required
        minlength="3"
        maxlength="12"
        pattern="[a-zA-Z][a-zA-Z0-9_ ]+[a-zA-Z0-9]"
      />
      {#if dirty && validationError != null}
        <p class="error">{validationError}</p>
      {/if}
    </label>

    <div>
      <button type="submit" disabled={validationError != null}>Save</button>
    </div>
  </form>
</Modal>

<style>
  .error {
    color: red;
  }
</style>
