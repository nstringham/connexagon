<script lang="ts">
  import { invalidateAll } from "$app/navigation";

  const { data } = $props();
  const { profile, supabase, user } = $derived(data);

  let name = $state("");

  $effect(() => {
    name = profile?.name ?? "";
  });

  async function save() {
    if (user == null) {
      throw Error("cannot set name for non-existent user");
    }
    const { error } = await supabase.from("profiles").upsert({ user_id: user.id, name });
    if (error) {
      throw error;
    }
    await invalidateAll();
  }
</script>

<label>Name: <input type="text" name="name" bind:value={name} /></label>

<button onclick={save}>Save</button>
